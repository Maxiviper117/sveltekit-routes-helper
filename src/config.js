/**
 * Default configuration options for the route generator
 * @type {import('./types.js').RouteGeneratorOptions}
 */
export const DEFAULT_OPTIONS = {
    routesDir: "src/routes",
    outputDir: "src",
    outputFilename: "routes.d",
    exclude: [],
    includeMetadata: false
};