// This file is auto-generated. Do not edit manually.
/**
 * @typedef {"/about" | "/" | "/blog/:id"} AppRoute
 */

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * This helper function takes a type-safe route (AppRoute) and positional parameters that correspond
 * to dynamic segments in the route (segments prefixed with ':'). It replaces each dynamic segment
 * with the corresponding parameter and returns the final URL.
 *
 * @param {AppRoute} route - The route string containing dynamic segments.
 * @param {...string} params - Replacement values for the dynamic segments.
 * @returns {string} The URL with dynamic segments replaced by the provided parameters.
 * @throws {Error} Will throw an error if the number of parameters does not match the number of dynamic segments.
 */
export function routes(route, ...params) {
  const placeholders = (route.match(/:([^/]+)/g) || []).length;
  if (params.length !== placeholders) {
    throw new Error(`Expected ${placeholders} parameter${placeholders !== 1 ? 's' : ''} for route "${route}", but got ${params.length}.`);
  }
  let index = 0;
  return route.replace(/:([^/]+)/g, () => params[index++]);
}
