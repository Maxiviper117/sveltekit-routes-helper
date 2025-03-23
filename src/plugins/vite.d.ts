import type { Plugin, PluginOption, ViteDevServer } from "vite";
import type { RouteGeneratorOptions } from "../types";

/**
 * Vite plugin to auto-generate routes on file changes.
 * @param options - Configuration options
 * @returns A Vite plugin
 */
export function routeGeneratorPlugin(
    options?: RouteGeneratorOptions
): PluginOption;