import getCommand from "./getCommand.js";

export default function generateReadme({
  projectName,
  packageManager,
  needsTypeScript,
  framework,
  manifestVersion,
}) {
  let readme = `# ${projectName}

This template should help get you started developing a ${framework} web extension in Vite.

## Usage Notes

The extension manifest is defined in \`src/manifest.js\` and used by \`@samrum/vite-plugin-web-extension\` in the vite config.

Background, content scripts, options, and popup entry points exist in the \`src/entries\` directory. 

Content scripts are rendered by \`src/entries/contentScript/renderContent.js\` which renders content within a ShadowRoot
and handles style injection for HMR and build modes.

Otherwise, the project functions just like a regular Vite project.

${
  manifestVersion === "2+3"
    ? "To switch between Manifest V2 and Manifest V3 builds, use the MANIFEST_VERSION environment variable defined in `.env`"
    : ""
}

${
  manifestVersion === "2+3" || manifestVersion === "3"
    ? "HMR during development in Manifest V3 requires Chromium version >= 110.0.5480.0."
    : ""
}

Refer to [@samrum/vite-plugin-web-extension](https://github.com/samrum/vite-plugin-web-extension) for more usage notes.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

`;

  let npmScriptsDescriptions = `\`\`\`sh
${getCommand(packageManager, "install")}
\`\`\`

## Commands
### Build
#### Development, HMR

Hot Module Reloading is used to load changes inline without requiring extension rebuilds and extension/page reloads
Currently only works in Chromium based browsers.
\`\`\`sh
${getCommand(packageManager, "dev")}
\`\`\`

#### Development, Watch

Rebuilds extension on file changes. Requires a reload of the extension (and page reload if using content scripts)
\`\`\`sh
${getCommand(packageManager, "watch")}
\`\`\`

#### Production

Minifies and optimizes extension build
\`\`\`sh
${getCommand(packageManager, "build")}
\`\`\`

### Load extension in browser

Loads the contents of the dist directory into the specified browser
\`\`\`sh
${getCommand(packageManager, "serve:chrome")}
\`\`\`

\`\`\`sh
${getCommand(packageManager, "serve:firefox")}
\`\`\`
`;

  readme += npmScriptsDescriptions;

  return readme;
}
