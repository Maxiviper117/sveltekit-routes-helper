/**
 * Processes a route string and replaces dynamic segments with provided parameters.
 * @param route - The route pattern to process
 * @param params - Parameters to inject into the route
 */
export function routes(route: string, params?: string[] | Record<string, string>): string;