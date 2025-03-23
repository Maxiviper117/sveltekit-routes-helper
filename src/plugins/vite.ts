import fs from "fs";
import path from "path";
import type { Plugin, PluginOption, ViteDevServer } from "vite";
import { DEFAULT_OPTIONS, type RouteGeneratorOptions } from "../types";
import { generateRoutes } from "../generators/routes";
import { shouldRegenerateRoutes } from "../utils/cache";

/**
 * Vite plugin to auto-generate routes on file changes.
 * @param {RouteGeneratorOptions} options - Configuration options
 * @returns {Plugin} A Vite plugin
 */
export function routeGeneratorPlugin(options: RouteGeneratorOptions = {}): PluginOption {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Convert relative paths to absolute
    const routesDirectory = mergedOptions.routesDir 
        ? path.resolve(process.cwd(), mergedOptions.routesDir) 
        : path.join(process.cwd(), "src", "routes");
    const outputDirectory = mergedOptions.outputDir
        ? path.resolve(process.cwd(), mergedOptions.outputDir)
        : path.join(process.cwd(), "src", "lib");
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