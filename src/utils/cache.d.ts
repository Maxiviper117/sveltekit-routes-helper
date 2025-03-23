/**
 * Check if routes should be regenerated based on file changes
 * @param routesDir - Directory containing routes
 * @param outputDir - Directory where routes file is generated
 * @param filename - Name of the generated routes file
 */
export function shouldRegenerateRoutes(routesDir: string, outputDir: string, filename: string): boolean;