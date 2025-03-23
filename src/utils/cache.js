import fs from "fs";
import path from "path";

/**
 * Check if routes should be regenerated based on file changes
 * @param {string} routesDir - Directory containing routes
 * @param {string} outputDir - Directory where routes file is generated
 * @param {string} filename - Name of the generated routes file
 * @returns {boolean} True if routes should be regenerated
 */
export function shouldRegenerateRoutes(routesDir, outputDir, filename) {
    const outputPath = path.join(outputDir, `${filename}.js`);
    
    if (!fs.existsSync(outputPath)) {
        return true;
    }

    const outputStat = fs.statSync(outputPath);
    const routeFiles = getAllFiles(routesDir);
    
    return routeFiles.some(file => {
        const fileStat = fs.statSync(file);
        return fileStat.mtime > outputStat.mtime;
    });
}

/**
 * Get all files in a directory recursively
 * @param {string} dirPath - Directory to scan
 * @returns {string[]} Array of file paths
 */
function getAllFiles(dirPath) {
    const files = [];

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getAllFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}