import fs from "fs";
import path from "path";
import crypto from 'crypto';
import type { Plugin, PluginOption, ViteDevServer } from "vite";

const routesDir = path.join(process.cwd(), "src", "routes");
const libDir = path.join(process.cwd(), "src", "lib");

/**
 * Plugin configuration options
 */
export interface RouteGeneratorOptions {
  /** 
   * Path to routes directory 
   * @default "src/routes"
   */
  routesDir?: string;
  
  /** 
   * Path to output directory 
   * @default "src/lib"
   */
  outputDir?: string;
  
  /** 
   * Output filename without extension
   * @default "appRoutes" 
   */
  outputFilename?: string;
  
  /** 
   * Routes to exclude (glob patterns)
   * @default []
   */
  exclude?: string[];
  
  /** 
   * Whether to generate route comments with metadata
   * @default false
   */
  includeMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<RouteGeneratorOptions> = {
  routesDir: 'src/routes',
  outputDir: 'src/lib/utils/routing',
  outputFilename: 'appRoutes',
  exclude: [],
  includeMetadata: false
};

/**
 * Checks if a folder name is a grouping folder (wrapped in parentheses).
 * @param {string} folderName - The name of the folder to check
 * @returns {boolean} Whether the folder is a grouping folder
 */
function isGroupingFolder(folderName: string): boolean {
    return folderName.startsWith("(") && folderName.endsWith(")");
}

/**
 * Recursively traverse the routes directory and build route strings.
 *
 * - Dynamic segments in folder or file names (e.g. [id]) are replaced with placeholders (e.g. :id).
 * - Grouping folders (e.g. (group)) are ignored in the URL path.
 * 
 * @param {string} dir - The directory to traverse
 * @param {string} currentPath - The current path being built
 * @returns {string[]} Array of route strings
 */
function traverseRoutes(dir: string, currentPath = ""): string[] {
    let routes: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isFile() && entry.name.startsWith("+page")) {
            let route = currentPath;
            if (route === "" && entry.name === "+page.svelte") {
                // Root route
                route = "/";
            } else {
                route =
                    "/" +
                    currentPath
                        .split(path.sep)
                        .filter(Boolean)
                        .map((segment) => segment.replace(/\[(.+?)\]/g, "[$1]"))
                        .join("/");
            }
            routes.push(route);
        } else if (entry.isDirectory()) {
            const folderName = entry.name;
            // If grouping folder, ignore its name in the URL.
            const segment = isGroupingFolder(folderName)
                ? ""
                : folderName.replace(/\[(.+?)\]/g, "[$1]");

            const newPath = segment
                ? path.join(currentPath, segment)
                : currentPath;
            const nestedRoutes = traverseRoutes(fullPath, newPath);
            routes = routes.concat(nestedRoutes);
        }
    }
    return routes;
}

/**
 * Generate route definitions and helper function files.
 * @param {RouteGeneratorOptions} options - Configuration options
 */
function generateRoutes(options: RouteGeneratorOptions = {}): void {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Convert relative paths to absolute
    const routesDirectory = mergedOptions.routesDir 
        ? path.resolve(process.cwd(), mergedOptions.routesDir) 
        : routesDir;
    const outputDirectory = mergedOptions.outputDir
        ? path.resolve(process.cwd(), mergedOptions.outputDir)
        : libDir;
    const filename = mergedOptions.outputFilename;
    
    // Ensure the output directory exists
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Get routes
    let routes = traverseRoutes(routesDirectory);
    
    // Apply exclusion patterns if specified
    if (mergedOptions.exclude && mergedOptions.exclude.length > 0) {
        const micromatch = require('micromatch'); // You'll need this dependency
        routes = routes.filter(route => 
            !micromatch.isMatch(route, mergedOptions.exclude as string[])
        );
    }

    const uniqueRoutes = Array.from(new Set(routes));
    const unionType = uniqueRoutes.map((route) => `"${route}"`).join(" | ");
    const isTypeScript = fs.existsSync(path.join(process.cwd(), "tsconfig.json"));

    if (isTypeScript) {
        // Generate a single TypeScript file with both types and helper function.
        const outputPath = path.join(outputDirectory, `${filename}.ts`);
        const content = `// This file is auto-generated. Do not edit manually.

/**
 * A union type of all application routes.
 */
export type AppRoute = ${unionType};

/**
 * Extract parameter names from a route string
 */
type ExtractRouteParams<T extends string> = T extends \`\${string}[\${infer Param}]\${infer Rest}\`
  ? Param | ExtractRouteParams<Rest>
  : never;

/**
 * Convert route parameters to an object type
 */
type RouteParamsObject<T extends string> = {
  [K in ExtractRouteParams<T>]: string;
};

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * @param {T} route - The route string containing dynamic segments.
 * @param {string[] | RouteParamsObject<T>} params - Either an array of values for positional replacement,
 *                                                  or an object with keys matching parameter names.
 * @returns {string} The URL with dynamic segments replaced by the provided parameters.
 * @throws Will throw an error if parameters are missing or invalid.
 */
export function routes<T extends AppRoute>(
  route: T,
  params?: string[] | RouteParamsObject<T>
): string {
  const segments = route.match(/\\[([^\\]]+)\\]/g) || [];
  
  if (Array.isArray(params)) {
    if (params.length !== segments.length) {
      throw new Error(\`Expected \${segments.length} parameter\${segments.length !== 1 ? 's' : ''} for route "\${route}", but got \${params.length}.\`);
    }
    let index = 0;
    return route.replace(/\\[([^\\]]+)\\]/g, () => params[index++]);
  }
  
  if (params) {
    return route.replace(/\\[([^\\]]+)\\]/g, (_, key) => {
      if (!(key in params)) {
        throw new Error(\`Missing parameter "\${key}" for route "\${route}"\`);
      }
      return (params as Record<string, string>)[key];
    });
  }
  
  if (segments.length > 0) {
    throw new Error(\`Route "\${route}" requires parameters but none were provided\`);
  }
  
  return route;
}`;
        fs.writeFileSync(outputPath, content, { encoding: "utf8" });
        console.log(`Generated ${uniqueRoutes.length} routes at ${outputPath}`);
    } else {
        // JavaScript project: generate a .d.ts file and a .js file with JSDoc.
        const dtsOutputPath = path.join(outputDirectory, `${filename}.d.ts`);
        const jsOutputPath = path.join(outputDirectory, `${filename}.js`);
        const dtsContent = `// This file is auto-generated. Do not edit manually.

/**
 * A union type of all application routes.
 */
export type AppRoute = ${unionType};

/**
 * Extract parameter names from a route string
 */
type ExtractRouteParams<T extends string> = T extends \`\${string}[\${infer Param}]\${infer Rest}\`
  ? Param | ExtractRouteParams<Rest>
  : never;

/**
 * Convert route parameters to an object type
 */
type RouteParamsObject<T extends string> = {
  [K in ExtractRouteParams<T>]: string;
};

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * @param {T} route - The route string containing dynamic segments.
 * @param {string[] | RouteParamsObject<T>} params - Either an array of values for positional replacement,
 *                                                  or an object with keys matching parameter names.
 * @returns {string} The URL with dynamic segments replaced by the provided parameters.
 */
export function routes<T extends AppRoute>(route: T, params?: string[] | RouteParamsObject<T>): string;
`;
        fs.writeFileSync(dtsOutputPath, dtsContent, { encoding: "utf8" });

        const jsContent = `// This file is auto-generated. Do not edit manually.
/**
 * @typedef {${unionType}} AppRoute
 */

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * @param {AppRoute} route - The route string containing dynamic segments.
 * @param {string[] | Object.<string, string>} [params] - Either an array of values for positional replacement,
 *                                                        or an object with keys matching parameter names.
 * @returns {string} The URL with dynamic segments replaced by the provided parameters.
 * @throws {Error} Will throw an error if parameters are missing or invalid.
 */
export function routes(route, params) {
  const segments = route.match(/\\[([^\\]]+)\\]/g) || [];
  
  if (Array.isArray(params)) {
    if (params.length !== segments.length) {
      throw new Error(\`Expected \${segments.length} parameter\${segments.length !== 1 ? 's' : ''} for route "\${route}", but got \${params.length}.\`);
    }
    let index = 0;
    return route.replace(/\\[([^\\]]+)\\]/g, () => params[index++]);
  }
  
  if (params) {
    return route.replace(/\\[([^\\]]+)\\]/g, (_, key) => {
      if (!(key in params)) {
        throw new Error(\`Missing parameter "\${key}" for route "\${route}"\`);
      }
      return params[key];
    });
  }
  
  if (segments.length > 0) {
    throw new Error(\`Route "\${route}" requires parameters but none were provided\`);
  }
  
  return route;
}`;
        fs.writeFileSync(jsOutputPath, jsContent, { encoding: "utf8" });
        console.log(
            `Generated ${uniqueRoutes.length} routes at ${dtsOutputPath} and ${jsOutputPath}`
        );
    }
}

/**
 * Vite plugin to auto-generate routes on file changes.
 * @param {RouteGeneratorOptions} options - Configuration options
 * @returns {Plugin} A Vite plugin
 */
function routeGeneratorPlugin(options: RouteGeneratorOptions = {}): PluginOption {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Convert relative paths to absolute
    const routesDirectory = mergedOptions.routesDir 
        ? path.resolve(process.cwd(), mergedOptions.routesDir) 
        : routesDir;
    const outputDirectory = mergedOptions.outputDir
        ? path.resolve(process.cwd(), mergedOptions.outputDir)
        : libDir;
    const filename = mergedOptions.outputFilename;
    
    return {
        name: "vite-route-generator",
        // enforce: "pre",
        configureServer(server: ViteDevServer) {
            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory, { recursive: true });
            }

            if (shouldRegenerateRoutes(routesDirectory, outputDirectory, filename)) {
                console.log(
                    `Detected changes in ${routesDirectory}. Regenerating routes...`
                );
                generateRoutes(options);
            }

            server.watcher.add(routesDirectory);
            server.watcher.on("change", (changedFile) => {
                if (changedFile.startsWith(routesDirectory)) {
                    console.log(
                        `Detected change in ${changedFile}. Regenerating routes...`
                    );
                    if (
                        shouldRegenerateRoutes(routesDirectory, outputDirectory, filename)
                    ) {
                        generateRoutes(options);
                    }
                    server.ws.send({ type: "full-reload" });
                }
            });
        },
    } satisfies Plugin;
}

// Add file hash checking to only regenerate when necessary
function getDirectoryHash(dir: string): string {
  const files: string[] = [];
  
  function traverseDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        files.push(`${fullPath}:${crypto.createHash('md5').update(content).digest('hex')}`);
      } else if (entry.isDirectory()) {
        traverseDir(fullPath);
      }
    }
  }
  
  traverseDir(dir);
  return crypto.createHash('md5').update(files.join('|')).digest('hex');
}

// Update shouldRegenerateRoutes to accept directory parameters and filename
function shouldRegenerateRoutes(
    routesDirectory: string = routesDir, 
    outputDirectory: string = libDir,
    filename: string = 'appRoutes'
): boolean {
    const cacheFile = path.join(outputDirectory, `.${filename}-routes-cache.json`);
    const currentHash = getDirectoryHash(routesDirectory);
    
    try {
        if (fs.existsSync(cacheFile)) {
            const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
            if (cache.hash === currentHash) return false;
        }
    } catch (e) {
        // Cache read error, regenerate to be safe
    }
    
    fs.writeFileSync(cacheFile, JSON.stringify({ hash: currentHash }), 'utf-8');
    return true;
}

export { generateRoutes, routeGeneratorPlugin };
export default routeGeneratorPlugin;