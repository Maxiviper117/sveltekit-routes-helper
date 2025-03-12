// This file is auto-generated. Do not edit manually.
/**
 * @typedef {"/about" | "/" | "/blog/[id]" | "/user/[id]/post/[post_id]"} AppRoute
 */

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * @param {AppRoute} route - The route string containing dynamic segments.
 * @param {string[] | Object.<string, string>} [params] - Either an array of values for positional replacement,
 *                                                        or an object with keys matching parameter names.
 * @returns {string} The URL with dynamic segments replaced by the provided parameters.
 * @throws {Error} Will throw an error if parameters are missing or invalid.
 */
export function routes(route, params) {
  const segments = route.match(/[([^]]+)]/g) || [];
  
  if (Array.isArray(params)) {
    if (params.length !== segments.length) {
      throw new Error(`Expected ${segments.length} parameter${segments.length !== 1 ? 's' : ''} for route "${route}", but got ${params.length}.`);
    }
    let index = 0;
    return route.replace(/[([^]]+)]/g, () => params[index++]);
  }
  
  if (params) {
    return route.replace(/[([^]]+)]/g, (_, key) => {
      if (!(key in params)) {
        throw new Error(`Missing parameter "${key}" for route "${route}"`);
      }
      return params[key];
    });
  }
  
  if (segments.length > 0) {
    throw new Error(`Route "${route}" requires parameters but none were provided`);
  }
  
  return route;
}