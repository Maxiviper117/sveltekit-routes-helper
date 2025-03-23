import fs from "fs";
import path from "path";
import { DEFAULT_OPTIONS, type RouteGeneratorOptions } from "../types";
import { traverseRoutes } from "../utils/routing";

/**
 * Generate route definitions and helper function files.
 * @param {RouteGeneratorOptions} options - Configuration options
 */
export function generateRoutes(options: RouteGeneratorOptions = {}): void {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Convert relative paths to absolute
    const routesDirectory = mergedOptions.routesDir
        ? path.resolve(process.cwd(), mergedOptions.routesDir)
        : path.join(process.cwd(), "src", "routes");
    const outputDirectory = mergedOptions.outputDir
        ? path.resolve(process.cwd(), mergedOptions.outputDir)
        : path.join(process.cwd(), "src", "lib");
    const filename = mergedOptions.outputFilename;

    // Ensure the output directory exists
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Get routes
    let routes = traverseRoutes(routesDirectory);

    // Apply exclusion patterns if specified
    if (mergedOptions.exclude && mergedOptions.exclude.length > 0) {
        const micromatch = require("micromatch"); // You'll need this dependency
        routes = routes.filter(
            (route) =>
                !micromatch.isMatch(route, mergedOptions.exclude as string[])
        );
    }

    const uniqueRoutes = Array.from(new Set(routes));
    const unionType = uniqueRoutes.map((route) => `"${route}"`).join(" | ");
    const isTypeScript = fs.existsSync(
        path.join(process.cwd(), "tsconfig.json")
    );

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
