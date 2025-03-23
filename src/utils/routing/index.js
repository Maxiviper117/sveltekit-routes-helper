import fs from "fs";
import path from "path";

/**
 * Valid SvelteKit route file names
 * @type {string[]}
 */
const VALID_ROUTE_FILES = [
    "+page.svelte",
    "+page.server.ts",
    "+page.server.js",
    "+page.ts",
    "+page.js",
    "+server.ts",
    "+server.js",
    "+layout.svelte",
    "+layout.server.ts",
    "+layout.server.js",
    "+layout.ts",
    "+layout.js",
];

/**
 * Traverses the routes directory and returns an array of route patterns
 * @param {string} directory - The directory to traverse
 * @param {string} [prefix=''] - The current route prefix
 * @returns {string[]} Array of route patterns
 */
export function traverseRoutes(directory, prefix = '') {
    const routes = [];
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Skip directories starting with underscore or dot
            if (item.startsWith('_') || item.startsWith('.')) {
                continue;
            }

            const newPrefix = prefix ? `${prefix}/${item}` : item;
            routes.push(...traverseRoutes(fullPath, newPrefix));
        } else if (VALID_ROUTE_FILES.includes(item)) {
            // Add route if it's not already included (avoid duplicates from different file types)
            if (!routes.includes(prefix)) {
                routes.push(prefix);
            }
        }
    }

    return routes;
}