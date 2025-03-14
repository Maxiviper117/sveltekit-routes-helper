// This file is auto-generated. Do not edit manually.

/**
 * A union type of all application routes.
 */
export type AppRoute = "/" | "/demo";

/**
 * Extract parameter names from a route string
 */
type ExtractRouteParams<T extends string> = T extends `${string}[${infer Param}]${infer Rest}`
  ? Param | ExtractRouteParams<Rest>
  : never;

/**
 * Convert route parameters to an object type
 */
type RouteParamsObject<T extends string> = {
  [K in ExtractRouteParams<T>]: string;
};

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * @param {T} route - The route string containing dynamic segments.
 * @param {string[] | RouteParamsObject<T>} params - Either an array of values for positional replacement,
 *                                                  or an object with keys matching parameter names.
 * @returns {string} The URL with dynamic segments replaced by the provided parameters.
 * @throws Will throw an error if parameters are missing or invalid.
 */
export function routes<T extends AppRoute>(
  route: T,
  params?: string[] | RouteParamsObject<T>
): string {
  const segments = route.match(/\[([^\]]+)\]/g) || [];
  
  if (Array.isArray(params)) {
    if (params.length !== segments.length) {
      throw new Error(`Expected ${segments.length} parameter${segments.length !== 1 ? 's' : ''} for route "${route}", but got ${params.length}.`);
    }
    let index = 0;
    return route.replace(/\[([^\]]+)\]/g, () => params[index++]);
  }
  
  if (params) {
    return route.replace(/\[([^\]]+)\]/g, (_, key) => {
      if (!(key in params)) {
        throw new Error(`Missing parameter "${key}" for route "${route}"`);
      }
      return (params as Record<string, string>)[key];
    });
  }
  
  if (segments.length > 0) {
    throw new Error(`Route "${route}" requires parameters but none were provided`);
  }
  
  return route;
}