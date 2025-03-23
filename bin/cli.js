#!/usr/bin/env node

import { generateRoutes } from "../src/index.js";
import path from "path";
import fs from "fs";

/**
 * @typedef {import('../src/types.js').RouteGeneratorOptions} RouteGeneratorOptions
 */

const cwd = process.cwd();
const configFile = path.join(cwd, "svelte.config.js");

/** @type {RouteGeneratorOptions} */
const options = {};

if (fs.existsSync(configFile)) {
    const config = await import(configFile);
    if (config.default?.kit?.files?.routes) {
        options.routesDir = config.default.kit.files.routes;
    }
}

generateRoutes(options);
