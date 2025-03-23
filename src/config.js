/**
 * Default configuration options for the route generator
 * @type {import('./types.js').RouteGeneratorOptions}
 */
export const DEFAULT_OPTIONS = {
    routesDir: "src/routes",
    outputDir: "src/lib",
    outputFilename: "appRoutes",
    exclude: [],
    includeMetadata: false
};