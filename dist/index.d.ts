import type { Plugin } from 'vite';
/**
 * Generate route definitions and helper function files.
 *
 * - If a tsconfig.json exists, assumes a TypeScript project and generates appRoutes.ts.
 * - Otherwise, for a JavaScript project it generates appRoutes.d.ts (for types) and appRoutes.js (with JSDoc annotations).
 */
declare function generateRoutes(): void;
/**
 * Vite plugin to auto-generate routes on file changes.
 * @returns {Plugin} A Vite plugin
 */
declare function routeGeneratorPlugin(): Plugin;
export { generateRoutes, routeGeneratorPlugin };
export default routeGeneratorPlugin;
