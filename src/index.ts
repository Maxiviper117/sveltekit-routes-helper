import fs from "fs";
import path from "path";
import type { Plugin } from 'vite';

const routesDir = path.join(process.cwd(), "src", "routes");
const libDir = path.join(process.cwd(), "src", "lib");

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
 *
 * - If a tsconfig.json exists, assumes a TypeScript project and generates appRoutes.ts.
 * - Otherwise, for a JavaScript project it generates appRoutes.d.ts (for types) and appRoutes.js (with JSDoc annotations).
 */
function generateRoutes(): void {
    // Ensure the lib directory exists
    if (!fs.existsSync(libDir)) {
        fs.mkdirSync(libDir, { recursive: true });
    }

    const routes = traverseRoutes(routesDir);
    const uniqueRoutes = Array.from(new Set(routes));
    const unionType = uniqueRoutes.map((route) => `"${route}"`).join(" | ");
    const isTypeScript = fs.existsSync(
        path.join(process.cwd(), "tsconfig.json")
    );

    if (isTypeScript) {
        // Generate a single TypeScript file with both types and helper function.
        const outputPath = path.join(libDir, "appRoutes.ts");
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
        const dtsOutputPath = path.join(libDir, "appRoutes.d.ts");
        const jsOutputPath = path.join(libDir, "appRoutes.js");
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
 * @returns {Plugin} A Vite plugin
 */
function routeGeneratorPlugin(): Plugin {
    return {
        name: "vite-route-generator",
        /**
         * Configure the development server
         * @param {import('vite').ViteDevServer} server - The Vite dev server
         */
        configureServer(server) {
            // This is kept for backward compatibility and robustness
            if (!fs.existsSync(libDir)) {
                fs.mkdirSync(libDir, { recursive: true });
            }
            generateRoutes();
            server.watcher.add(routesDir);
            server.watcher.on("change", (changedFile) => {
                if (changedFile.startsWith(routesDir)) {
                    console.log(
                        `Detected change in ${changedFile}. Regenerating routes...`
                    );
                    generateRoutes();
                    server.ws.send({ type: "full-reload" });
                }
            });
        },
    };
}

export { generateRoutes, routeGeneratorPlugin };
export default routeGeneratorPlugin;