# SvelteKit Routes Helper

SvelteKit Routes Helper is an npm package that automatically generates type-safe route definitions and a URL helper function for your SvelteKit projects. It supports both TypeScript and JavaScript projects and integrates seamlessly with Vite's HMR for a smooth development experience.

## Features

- **Automatic Route Generation:** Scans your `src/routes` directory and builds a union type of all routes.
- **Type-Safe URL Helper:** Generates a helper function that dynamically replaces URL parameters in a type-safe manner.
- **Dual Support:**  
  - **TypeScript Projects:** Generates a single `.ts` file containing both type definitions and the helper function.
  - **JavaScript Projects:** Generates a `.d.ts` file for type declarations and a `.js` file with JSDoc annotations.
- **Vite HMR Integration:** Automatically regenerates route files on changes and triggers full reloads via Vite.
- **CLI Access:** Provides a CLI command to manually trigger route generation from an npm script.

## Installation

Install the package via npm or yarn:

```bash
npm install sveltekit-routes-helper --save-dev
```

or

```bash
yarn add sveltekit-routes-helper --dev
```

or prefer using pnpm:

```bash
pnpm add -D sveltekit-routes-helper 
```

## Usage

### As a Vite Plugin

To integrate SvelteKit Routes Helper with Vite, add it to your `vite.config.js` file:

```js
// vite.config.js
import { defineConfig } from 'vite';
import { routeGeneratorPlugin } from 'sveltekit-routes-helper';

export default defineConfig({
  plugins: [routeGeneratorPlugin()],
});
```

When running the Vite development server, the plugin will:

- Generate the appropriate route files on startup.
- Watch the `src/routes` directory for changes.
- Regenerate route files and trigger a full reload when changes are detected.

### Manual Route Generation via CLI

You can also manually trigger route generation with the provided CLI command. In your project's `package.json`, add a script:

```json
{
  "scripts": {
    "generate-routes": "sveltekit-routes-helper"
  }
}
```

Then run:

```bash
npm run generate-routes
```

This will generate the route files according to your project type:
- For TypeScript projects: a single `appRoutes.ts` file.
- For JavaScript projects: both an `appRoutes.d.ts` file and an `appRoutes.js` file with JSDoc annotations.

### Using the `routes` Helper Function

The `routes` helper function allows you to generate URLs by replacing dynamic segments in the route with provided parameters. This function is type-safe and ensures that the number of parameters matches the number of dynamic segments in the route.

#### TypeScript Example

```typescript
import { routes } from 'src/lib/appRoutes';
const userUrl = routes('/admin/user/'); // type safe
console.log(userUrl); // Output: "/admin/user/"
```

With slug:

```typescript
import { routes } from 'src/lib/appRoutes';

const userId = '123';
const userUrl = routes('/admin/user/:id', userid); // type safe
console.log(userUrl); // Output: "/admin/user/123"
```

With multiple slugs:

```typescript
import { routes } from 'src/lib/appRoutes';

const userId = '123';
const postId = '456';
const userPostUrl = routes('/admin/user/:id/post/:postId', userId, postId); // type safe
console.log(userPostUrl); // Output: "/admin/user/123/post/456"
```

This is th routes helper signature:

```typescript
function routes(route: string, ...params: string[]): string;
```

The first argument is the `routes` route name which is type safe and the second argument is a rest parameter that accepts any number of string arguments. The function will return a string with the route name and the parameters replaced in the route. The number of parameters must match the number of dynamic segments/slugs in the route.

## API Overview

### `generateRoutes`

Scans the `src/routes` directory and generates route files in `src/lib` based on the project type.

- **TypeScript Projects:** Creates `appRoutes.ts` with type definitions and a URL helper.
- **JavaScript Projects:** Creates `appRoutes.d.ts` for types and `appRoutes.js` (with JSDoc) for the URL helper.

### `routeGeneratorPlugin`

Returns a Vite plugin that watches your routes directory for file changes, regenerates route files on the fly, and triggers HMR updates.

## Project Structure Example

A typical project using SvelteKit Routes Helper may look like this:

```
my-sveltekit-app/
├── src/
│   ├── routes/
│   │   └── ... (your route files)
│   └── lib/
│       ├── appRoutes.ts  // For TS projects
│       ├── appRoutes.js  // For JS projects
│       └── appRoutes.d.ts // For JS projects
├── vite.config.js
└── package.json
```

## Contributing

Contributions are welcome! If you find an issue or have an idea for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

