import { generateRoutes } from "./generators/routes.js";
import { routeGeneratorPlugin } from "./plugins/vite.js";
import { routes } from "./runtime.js";

// Export the runtime function as a named export and also make it available at /runtime
export {
    generateRoutes,
    routeGeneratorPlugin,
    routes
};

// Also expose the routes function at /runtime for direct imports
export * from "./runtime.js";

export default routeGeneratorPlugin;