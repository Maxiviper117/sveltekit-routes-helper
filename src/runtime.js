/**
 * Processes a route string and replaces dynamic segments with provided parameters.
 * @param {string} route - The route pattern to process
 * @param {string[] | Record<string, string>} [params] - Parameters to inject into the route
 * @returns {string} The processed route with parameters applied
 */
export function routes(route, params) {
    let result = route;

    if (Array.isArray(params)) {
        const matches = route.match(/\[([^\]]+)\]/g) || [];
        matches.forEach((match, index) => {
            if (index < params.length) {
                result = result.replace(match, params[index]);
            }
        });
    } else if (params && typeof params === "object") {
        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`[${key}]`, value);
        });
    }

    return result;
}