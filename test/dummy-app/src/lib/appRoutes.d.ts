// This file is auto-generated. Do not edit manually.

/**
 * A union type of all application routes.
 */
export type AppRoute = "/about" | "/" | "/blog/[id]" | "/user/[id]/post/[post_id]";

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
 */
export function routes<T extends AppRoute>(route: T, params?: string[] | RouteParamsObject<T>): string;
