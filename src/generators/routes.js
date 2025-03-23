import fs from "fs";
import path from "path";
import { traverseRoutes } from "../utils/routing/index.js";
import { DEFAULT_OPTIONS } from "../config.js";

/**
 * Generate route definitions and helper function files.
 * @param {import('../types.js').RouteGeneratorOptions} options - Configuration options
 */
export function generateRoutes(options = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Convert relative paths to absolute
    const routesDirectory = mergedOptions.routesDir
        ? path.resolve(process.cwd(), mergedOptions.routesDir)
        : path.join(process.cwd(), "src", "routes");
    const outputDirectory = mergedOptions.outputDir
        ? path.resolve(process.cwd(), mergedOptions.outputDir)
        : path.join(process.cwd(), "src", "lib", "utils", "routing");
    const filename = mergedOptions.outputFilename;

    // Ensure the output directory exists
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Get routes
    let routes = traverseRoutes(routesDirectory);

    // Apply exclusion patterns if specified
    if (mergedOptions.exclude && mergedOptions.exclude.length > 0) {
        const micromatch = require("micromatch");
        routes = routes.filter(
            (route) =>
                !micromatch.isMatch(route, mergedOptions.exclude)
        );
    }

    const uniqueRoutes = Array.from(new Set(routes));
    const unionType = uniqueRoutes.map((route) => `"${route}"`).join(" | ");
    const isTypeScript = fs.existsSync(
        path.join(process.cwd(), "tsconfig.json")
    );

    if (isTypeScript) {
        // For TypeScript projects, generate only type definitions
        const outputPath = path.join(outputDirectory, `${filename}.ts`);
        const content = `// This file is auto-generated. Do not edit manually.
import { routes as baseRoutes } from 'sveltekit-routes-helper';

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
 */
export declare function routes(route: AppRoute, params?: string[] | RouteParamsObject<AppRoute>): string;

// Re-export the implementation
export { baseRoutes as routes };`;
        fs.writeFileSync(outputPath, content, { encoding: "utf8" });
        console.log(
            `Generated ${uniqueRoutes.length} route types at ${outputPath}`
        );
    } else {
        // For JavaScript projects, generate type definitions and JSDoc
        const dtsOutputPath = path.join(outputDirectory, `${filename}.d.ts`);
        const jsOutputPath = path.join(outputDirectory, `${filename}.js`);

        const dtsContent = `// This file is auto-generated. Do not edit manually.
export type AppRoute = ${unionType};

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 * 
 * @param {AppRoute} route - The route pattern
 * @param {string[] | Record<string, string>} [params] - Parameters to inject
 * @returns {string} The processed route with parameters applied
 */
export function routes(route: AppRoute, params?: string[] | Record<string, string>): string;`;

        const jsContent = `// This file is auto-generated. Do not edit manually.
import { routes } from 'sveltekit-routes-helper';

/**
 * @typedef {${unionType}} AppRoute
 */

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 * 
 * @param {AppRoute} route - The route pattern
 * @param {string[] | Record<string, string>} [params] - Parameters to inject
 * @returns {string} The processed route with parameters applied
 */
export { routes };`;

        fs.writeFileSync(dtsOutputPath, dtsContent, { encoding: "utf8" });
        fs.writeFileSync(jsOutputPath, jsContent, { encoding: "utf8" });
        console.log(
            `Generated ${uniqueRoutes.length} route types at ${dtsOutputPath} and ${jsOutputPath}`
        );
    }
}