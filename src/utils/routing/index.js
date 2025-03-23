import fs from "fs";
import path from "path";

/**
 * Valid SvelteKit route files that indicate a valid route
 * @type {string[]}
 */
const VALID_ROUTE_FILES = [
    "+page.svelte",
    "+page.server.ts",
    "+page.server.js",
    "+page.ts",
    "+page.js",
    "+server.ts",
    "+server.js"
];

/**
 * Check if a directory name is a SvelteKit route group
 * @param {string} name - Directory name to check
 * @returns {boolean} True if the directory is a route group
 */
function isRouteGroup(name) {
    return name.startsWith('(') && name.endsWith(')');
}

/**
 * Check if a directory name is a parameter directory (e.g., [id] or [...slug])
 * @param {string} name - Directory name to check
 * @returns {boolean} True if the directory is a parameter directory
 */
function isParamDirectory(name) {
    return (name.startsWith('[') && name.endsWith(']'));
}

/**
 * Traverses the routes directory and returns an array of route patterns
 * @param {string} directory - The directory to traverse
 * @param {string} [prefix=''] - The current route prefix
 * @returns {string[]} Array of route patterns
 */
export function traverseRoutes(directory, prefix = '') {
    const routes = new Set();
    const items = fs.readdirSync(directory);

    // First check if current directory contains any route files
    const hasRouteFiles = items.some(item => VALID_ROUTE_FILES.includes(item));
    if (hasRouteFiles) {
        const routePath = prefix ? `/${prefix}` : '/';
        routes.add(routePath);
    }

    // Then traverse subdirectories
    for (const item of items) {
        const fullPath = path.join(directory, item);
        if (!fs.statSync(fullPath).isDirectory()) continue;

        // Skip directories starting with underscore or dot
        if (item.startsWith('_') || item.startsWith('.')) continue;

        // Handle route groups - keep the content but ignore the group name
        if (isRouteGroup(item)) {
            const groupRoutes = traverseRoutes(fullPath, prefix);
            groupRoutes.forEach(route => routes.add(route));
            continue;
        }

        // For normal directories and parameter directories, include them in the path
        const newPrefix = prefix ? `${prefix}/${item}` : item;
        const subRoutes = traverseRoutes(fullPath, newPrefix);
        subRoutes.forEach(route => routes.add(route));
    }

    return Array.from(routes);
}