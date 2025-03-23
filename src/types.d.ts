/**
 * Plugin configuration options
 */
export interface RouteGeneratorOptions {
    /**
     * Path to routes directory
     * @default "src/routes"
     */
    routesDir?: string;

    /**
     * Path to output directory
     * @default "src/lib"
     */
    outputDir?: string;

    /**
     * Output filename without extension
     * @default "appRoutes"
     */
    outputFilename?: string;

    /**
     * Routes to exclude (glob patterns)
     * @default []
     */
    exclude?: string[];

    /**
     * Whether to generate route comments with metadata
     * @default false
     */
    includeMetadata?: boolean;
}