// This file is auto-generated. Do not edit manually.

/**
 * A union type of all application routes.
 */
export type AppRoute = "/about" | "/" | "/blog/:id";

/**
 * Generate a URL by replacing dynamic segments in the given route with provided parameters.
 *
 * @param {AppRoute} route - The route string containing dynamic segments.
 * @param {...string} params - Replacement values for the dynamic segments.
 * @returns {string} The URL with dynamic segments replaced.
 */
export function routes(route: AppRoute, ...params: string[]): string;
