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
 * Processes a route string and replaces dynamic segments with provided parameters.
 * @param route - The route pattern to process
 * @param params - Parameters to inject into the route
 */
export function routes<T extends AppRoute>(route: T, params?: string[] | RouteParamsObject<T>): string;