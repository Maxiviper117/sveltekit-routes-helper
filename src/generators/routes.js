import fs from "fs";
import path from "path";
import { traverseRoutes } from "../utils/routing/index.js";
import { DEFAULT_OPTIONS } from "../config.js";

/**
 * Generate route type definitions
 * @param {import('../types.js').RouteGeneratorOptions} options - Configuration options
 */
export function generateRoutes(options = {}) {
    try {
        console.log('Starting route generation with options:', options);
        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        console.log('Merged options:', mergedOptions);

        // Convert relative paths to absolute
        const routesDirectory = mergedOptions.routesDir
            ? path.resolve(process.cwd(), mergedOptions.routesDir)
            : path.join(process.cwd(), "src", "routes");

        console.log('Looking for routes in directory:', routesDirectory);
        
        // Check if routes directory exists
        if (!fs.existsSync(routesDirectory)) {
            console.error(`Routes directory does not exist: ${routesDirectory}`);
            return;
        }

        // Get routes
        console.log('Traversing routes...');
        let routes = traverseRoutes(routesDirectory);
        console.log('Found routes:', routes);

        // Apply exclusion patterns if specified
        if (mergedOptions.exclude && mergedOptions.exclude.length > 0) {
            try {
                const micromatch = require("micromatch");
                routes = routes.filter(
                    (route) => !micromatch.isMatch(route, mergedOptions.exclude)
                );
                console.log('Routes after exclusion:', routes);
            } catch (err) {
                console.error('Error applying exclusions:', err);
                // Continue without exclusions if micromatch fails
            }
        }

        const uniqueRoutes = Array.from(new Set(routes)).sort();
        const unionType = uniqueRoutes.map((route) => `"${route}"`).join(" | ");

        // Create src directory if it doesn't exist
        const srcDir = path.join(process.cwd(), "src");
        console.log('Ensuring src directory exists:', srcDir);
        if (!fs.existsSync(srcDir)) {
            fs.mkdirSync(srcDir, { recursive: true });
            console.log('Created src directory');
        }

        const routesDtsPath = path.join(srcDir, "routes.d.ts");
        console.log('Writing routes.d.ts to:', routesDtsPath);

        const routesDtsContent = `/**
 * Auto-generated SvelteKit route type definitions
 * DO NOT EDIT - This file is auto-generated
 * @packageDocumentation
 */

/**
 * Represents all valid routes in the SvelteKit application
 * @example
 * // Valid routes:
${uniqueRoutes.map(route => ` * - "${route}"`).join('\n')}
 */
declare global {
    /** All valid application routes */
    type AppRoute = ${unionType};
}

// Ensure this is treated as a module
export {};
`;

        fs.writeFileSync(routesDtsPath, routesDtsContent, 'utf-8');
        console.log(`Successfully generated route type definitions at ${routesDtsPath}`);
    } catch (error) {
        console.error('Error generating routes:', error);
        throw error; // Re-throw to ensure the error is not silently swallowed
    }
}