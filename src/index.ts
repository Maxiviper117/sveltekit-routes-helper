import { type RouteGeneratorOptions } from "./types";
import { generateRoutes } from "./generators/routes";
import { routeGeneratorPlugin } from "./plugins/vite";

export { generateRoutes, routeGeneratorPlugin, type RouteGeneratorOptions };
export default routeGeneratorPlugin;