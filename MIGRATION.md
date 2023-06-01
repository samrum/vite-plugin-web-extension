# Migration

- [Version 4.x.x to 5.0.0](#version-4xx-to-500)
- [Version 3.x.x to 4.0.0](#version-3xx-to-400)
- [Version 2.x.x to 3.0.0](#version-2xx-to-300)
- [Version 0.x.x to 1.0.0](#version-0xx-to-100)

## Version 4.x.x to 5.0.0

- The `devHtmlTransform` plugin option has been removed. Vite's dev HTML transform functionality is now required to support HTML files in dev (HMR) mode. In dev mode, a <base> element with the dev server url for the HTML file is injected into the page. This replaces incomplete custom logic for handling resources in HTML files.

## Version 3.x.x to 4.0.0

- Dev mode HTML transforms are no longer applied by default. Enable via the new devHtmlTransform option if still needed.
- The useDynamicUrlContentScripts option has been renamed to useDynamicUrlWebAccessibleResources
- The webAccessibleScripts option has been removed and replaced by the additionalInputs option. For similar functionality, move scripts to additionalInputs.scripts and html files to additionalInputs.html. Check the README for detailed usage instructions.

## Version 2.x.x to 3.0.0

- Upgrade Vite to 4.0.3

  - Upgrade any Vite framework plugins

- The build.modulePreload Vite config option is now defaulted to false by the plugin. Prevent using this default by defining the option in your project's Vite config.

## Version 0.x.x to 1.0.0

- Upgrade Vite to 2.9.x

  - Upgrade any Vite framework plugins

- Replace usages of `import.meta.CURRENT_CONTENT_SCRIPT_CSS_URL` with `import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS`

  - `import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS` is replaced with an array of css paths at build time, so update existing code that expects a single string to properly handle an array of strings.

- Replace usages of `addStyleTarget` from `/@vite/client` with `addViteStyleTarget` from `@samrum/vite-plugin-web-extension/client`:

  ```js
  const { addStyleTarget } = await import("/@vite/client");

  addStyleTarget(shadowRoot);
  ```

  to

  ```js
  const { addViteStyleTarget } = await import(
    "@samrum/vite-plugin-web-extension/client"
  );

  await addViteStyleTarget(shadowRoot);
  ```

- If using TypeScript, add plugin client types to your `env.d.ts` file:
  ```ts
  /// <reference types="@samrum/vite-plugin-web-extension/client" />
  ```
