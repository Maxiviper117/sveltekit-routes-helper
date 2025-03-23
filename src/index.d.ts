export type { RouteGeneratorOptions } from "./types.js";
import { generateRoutes } from "./generators/routes.js";
import { routeGeneratorPlugin } from "./plugins/vite.js";
import { routes } from "./runtime.js";

export {
    generateRoutes,
    routeGeneratorPlugin,
    routes
};