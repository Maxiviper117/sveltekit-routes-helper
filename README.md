# SvelteKit Routes Helper

A Vite plugin that automatically generates typed route utilities for SvelteKit applications. It creates both the route type definitions and a helper function, providing type-safe navigation with proper parameter inference, validation, and autocompletion. The plugin continuously monitors your application's route structure and keeps your route helpers in sync with zero manual maintenance.

## Features

- Automatically generates a type-safe routes helper file
- Updates when routes are added, removed, or changed 
- Works with both JavaScript and TypeScript
- Handles SvelteKit's file-based routing system including:
  - Dynamic parameters (e.g., `[id]`)
  - Nested routes
  - Grouping folders (e.g., `(group)`)
- Performance optimized with caching to avoid unnecessary regeneration

## Installation

```bash
# npm
npm install -D sveltekit-routes-helper

# pnpm
pnpm add -D sveltekit-routes-helper

# yarn
yarn add -D sveltekit-routes-helper
```

## Usage

### 1. Add the plugin to your vite.config.js/ts

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { routeGeneratorPlugin } from 'sveltekit-routes-helper';

export default defineConfig({
  plugins: [
    sveltekit(),
    routeGeneratorPlugin({
      // Optional configuration (see Configuration section)
    }),
  ]
});
```

### 2. Use the generated routes helper in your SvelteKit app

```html
<script lang="ts">
  import { routes } from '$lib/utils/routing/appRoutes';

  // Simple route with no parameters
  const homeUrl = routes('/');

  // Route with named parameters (object style)
  const userProfileUrl = routes('/user/[id]', { id: '123' });

  // Route with positional parameters (array style)
  const blogPostUrl = routes('/blog/[category]/[slug]', ['tech', 'sveltekit-rocks']);
</script>

<a href={homeUrl}>Home</a>
<a href={userProfileUrl}>User Profile</a>
<a href={blogPostUrl}>Blog Post</a>
```

## Type Safety

The generated helper is fully typed, so you'll get:

- Autocomplete for available routes
- Type checking for route parameters
- Errors if route parameters are missing or incorrect

## Configuration

You can customize the behavior by passing options to the plugin:

```typescript
routeGeneratorPlugin({
  // Path to routes directory 
  routesDir: 'src/routes',

  // Output directory for generated files
  outputDir: 'src/lib/utils/routing',

  // Name of output file (without extension)
  outputFilename: 'appRoutes',

  // Routes to exclude (glob patterns)
  exclude: ['**/api/**', '/admin/**'],

  // Whether to include route metadata as comments
  includeMetadata: false,
})
```

### Options

| Option            | Type       | Default                   | Description                                |
| ----------------- | ---------- | ------------------------- | ------------------------------------------ |
| `routesDir`       | `string`   | `'src/routes'`            | Path to routes directory                   |
| `outputDir`       | `string`   | `'src/lib/utils/routing'` | Path to output directory                   |
| `outputFilename`  | `string`   | `'appRoutes'`             | Name of output file (without extension)    |
| `exclude`         | `string[]` | `[]`                      | Routes to exclude (glob patterns)          |
| `includeMetadata` | `boolean`  | `false`                   | Whether to include route metadata comments |

## CLI Usage

You can also generate routes via the command line:

```bash
npx sveltekit-routes generate
```

Or add it as a script to your package.json:

```json
{
  "scripts": {
    "generate-routes": "sveltekit-routes generate"
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Test in the dummy app
cd test/dummy-app
pnpm dev
```

## License

MIT

