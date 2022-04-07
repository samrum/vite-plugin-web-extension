# Migration

- [Version 0.x.x to 1.0.0](#version-0xx-to-100)

## Version 0.x.x to 1.0.0

- Upgrade Vite to 2.9.x

  - Upgrade any vite framework plugins as well

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
