import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Generate a hash of a directory to track changes
 * @param {string} dir - Directory to hash
 * @returns {string} Hash representing directory state
 */
export function getDirectoryHash(dir: string): string {
    const files: string[] = [];

    function traverseDir(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isFile()) {
                const content = fs.readFileSync(fullPath);
                files.push(
                    `${fullPath}:${crypto
                        .createHash("md5")
                        .update(content)
                        .digest("hex")}`
                );
            } else if (entry.isDirectory()) {
                traverseDir(fullPath);
            }
        }
    }

    traverseDir(dir);
    return crypto.createHash("md5").update(files.join("|")).digest("hex");
}

/**
 * Determines if routes need to be regenerated based on cache
 * @param {string} routesDirectory - Directory containing routes
 * @param {string} outputDirectory - Output directory for routes file
 * @param {string} filename - Filename for routes
 * @returns {boolean} Whether routes should be regenerated
 */
export function shouldRegenerateRoutes(
    routesDirectory: string,
    outputDirectory: string,
    filename: string
): boolean {
    const cacheFile = path.join(
        outputDirectory,
        `.${filename}-routes-cache.json`
    );
    const currentHash = getDirectoryHash(routesDirectory);

    try {
        if (fs.existsSync(cacheFile)) {
            const cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
            if (cache.hash === currentHash) return false;
        }
    } catch (e) {
        // Cache read error, regenerate to be safe
    }

    fs.writeFileSync(cacheFile, JSON.stringify({ hash: currentHash }), "utf-8");
    return true;
}
