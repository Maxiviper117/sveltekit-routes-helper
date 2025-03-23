import fs from "fs";
import path from "path";

/**
 * Checks if a folder name is a grouping folder (wrapped in parentheses).
 * @param {string} folderName - The name of the folder to check
 * @returns {boolean} Whether the folder is a grouping folder
 */
export function isGroupingFolder(folderName: string): boolean {
    return folderName.startsWith("(") && folderName.endsWith(")");
}

/**
 * Recursively traverse the routes directory and build route strings.
 *
 * - Dynamic segments in folder or file names (e.g. [id]) are replaced with placeholders (e.g. :id).
 * - Grouping folders (e.g. (group)) are ignored in the URL path.
 * 
 * @param {string} dir - The directory to traverse
 * @param {string} currentPath - The current path being built
 * @returns {string[]} Array of route strings
 */
export function traverseRoutes(dir: string, currentPath = ""): string[] {
    let routes: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isFile() && entry.name.startsWith("+page")) {
            let route = currentPath;
            if (route === "" && entry.name === "+page.svelte") {
                // Root route
                route = "/";
            } else {
                route =
                    "/" +
                    currentPath
                        .split(path.sep)
                        .filter(Boolean)
                        .map((segment) => segment.replace(/\[(.+?)\]/g, "[$1]"))
                        .join("/");
            }
            routes.push(route);
        } else if (entry.isDirectory()) {
            const folderName = entry.name;
            // If grouping folder, ignore its name in the URL.
            const segment = isGroupingFolder(folderName)
                ? ""
                : folderName.replace(/\[(.+?)\]/g, "[$1]");

            const newPath = segment
                ? path.join(currentPath, segment)
                : currentPath;
            const nestedRoutes = traverseRoutes(fullPath, newPath);
            routes = routes.concat(nestedRoutes);
        }
    }
    return routes;
}