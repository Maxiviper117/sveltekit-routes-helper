/**
 * Traverses the routes directory and returns an array of route patterns
 * @param directory - The directory to traverse
 * @param prefix - The current route prefix
 */
export function traverseRoutes(directory: string, prefix?: string): string[];