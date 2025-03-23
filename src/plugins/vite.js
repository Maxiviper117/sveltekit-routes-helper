import fs from "fs";
import path from "path";
import { generateRoutes } from "../generators/routes.js";
import { shouldRegenerateRoutes } from "../utils/cache.js";
import { DEFAULT_OPTIONS } from "../config.js";

/**
 * Vite plugin to auto-generate routes on file changes.
 * @param {import('../types.js').RouteGeneratorOptions} options - Configuration options
 * @returns {import('vite').PluginOption} A Vite plugin
 */
export function routeGeneratorPlugin(options = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Convert relative paths to absolute
    const routesDirectory = mergedOptions.routesDir
        ? path.resolve(process.cwd(), mergedOptions.routesDir)
        : path.join(process.cwd(), "src", "routes");
    const outputDirectory = mergedOptions.outputDir
        ? path.resolve(process.cwd(), mergedOptions.outputDir)
        : path.join(process.cwd(), "src");

    return {
        name: "vite-route-generator",
        enforce: "pre",
        
        buildStart() {
            console.log('Vite plugin: Running initial route generation...');
            generateRoutes(options);
        },
        
        configureServer(server) {
            console.log('Vite plugin: Setting up dev server...');
            
            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory, { recursive: true });
            }

            // Initial generation
            if (shouldRegenerateRoutes(routesDirectory, outputDirectory)) {
                console.log('Vite plugin: Generating routes during server start...');
                generateRoutes(options);
            }

            server.watcher.add(routesDirectory);
            server.watcher.on("change", (changedFile) => {
                if (changedFile.startsWith(routesDirectory)) {
                    console.log(`Vite plugin: Detected change in ${changedFile}`);
                    if (shouldRegenerateRoutes(routesDirectory, outputDirectory)) {
                        console.log('Vite plugin: Regenerating routes due to file change...');
                        generateRoutes(options);
                    }
                    server.ws.send({ type: "full-reload" });
                }
            });
        },
        
        // Also generate routes during build
        async closeBundle() {
            console.log('Vite plugin: Generating routes during build...');
            generateRoutes(options);
        }
    };
}