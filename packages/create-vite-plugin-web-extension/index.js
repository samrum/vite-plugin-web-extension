#!/usr/bin/env node
// @ts-check

import fs from "fs";
import path from "path";

import minimist from "minimist";
import prompts from "prompts";
import { red, green, bold } from "kolorist";

import renderTemplate from "./utils/renderTemplate.js";
import {
  postOrderDirectoryTraverse,
  preOrderDirectoryTraverse,
} from "./utils/directoryTraverse.js";
import generateReadme from "./utils/generateReadme.js";
import getCommand from "./utils/getCommand.js";
import banner from "./utils/banner.js";

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

function canSafelyOverwrite(dir) {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0;
}

function emptyDir(dir) {
  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file)
  );
}

async function init() {
  console.log(`\n${banner}\n`);

  const cwd = process.cwd();
  // possible options:
  // --default
  // --force
  // --framework
  // --manifestVersion / --manifest
  // --typescript / --ts
  const argv = minimist(process.argv.slice(2), {
    alias: {
      typescript: ["ts"],
      manifestVersion: ["manifest"],
    },
    string: ["manifestVersion", "framework"],
    boolean: true,
  });

  // if any of the feature flags is set, we would skip the feature prompts
  const isFeatureFlagsUsed =
    typeof (argv.default ?? argv.ts) === "boolean" ||
    typeof (argv.manifestVersion ?? argv.framework) === "string";

  let targetDir = argv._[0];
  const defaultProjectName = !targetDir ? "web-extension" : targetDir;

  const forceOverwrite = argv.force;

  let result = {};

  try {
    // Prompts:
    // - Project name:
    //   - whether to overwrite the existing directory or not?
    //   - enter a valid package name for package.json
    // - Project language: JavaScript / TypeScript
    result = await prompts(
      [
        {
          name: "projectName",
          type: targetDir ? null : "text",
          message: "Project name:",
          initial: defaultProjectName,
          onState: (state) =>
            (targetDir = String(state.value).trim() || defaultProjectName),
        },
        {
          name: "shouldOverwrite",
          type: () =>
            canSafelyOverwrite(targetDir) || forceOverwrite ? null : "confirm",
          message: () => {
            const dirForPrompt =
              targetDir === "."
                ? "Current directory"
                : `Target directory "${targetDir}"`;

            return `${dirForPrompt} is not empty. Remove existing files and continue?`;
          },
        },
        {
          name: "overwriteChecker",
          type: (prev, values = {}) => {
            if (values.shouldOverwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
        },
        {
          name: "packageName",
          type: () => (isValidPackageName(targetDir) ? null : "text"),
          message: "Package name:",
          initial: () => toValidPackageName(targetDir),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          name: "manifestVersion",
          type: () => (isFeatureFlagsUsed ? null : "select"),
          message: "Manifest version:",
          choices: [
            {
              title: "Manifest V2",
              value: "2",
              description: "Non-chromium browsers",
            },
            {
              title: "Manifest V3",
              value: "3",
              description: "Chromium browsers",
            },
            {
              title: "Manifest V2 & V3",
              value: "2+3",
              description: "Broadest browser support",
            },
          ],
          initial: 1,
        },
        {
          name: "framework",
          type: () => (isFeatureFlagsUsed ? null : "select"),
          message: "Framework:",
          choices: [
            { title: "Vanilla (None)", value: "vanilla" },
            { title: "Vue", value: "vue" },
            { title: "React", value: "react" },
            { title: "Svelte", value: "svelte" },
            { title: "Preact", value: "preact" },
          ],
          initial: 0,
        },
        {
          name: "needsTypeScript",
          type: () => (isFeatureFlagsUsed ? null : "toggle"),
          message: "Add TypeScript?",
          initial: false,
          active: "Yes",
          inactive: "No",
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    process.exit(1);
  }

  // `initial` won't take effect if the prompt type is null
  // so we still have to assign the default values here
  const {
    packageName = toValidPackageName(defaultProjectName),
    shouldOverwrite,
    needsTypeScript = argv.typescript,
    manifestVersion = argv.manifestVersion ?? "3",
    framework = argv.framework ?? "vanilla",
  } = result;
  const root = path.join(cwd, targetDir);

  if (shouldOverwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  console.log(`\nScaffolding project in ${root}...`);

  const pkg = { name: packageName, version: "0.0.0" };
  fs.writeFileSync(
    path.resolve(root, "package.json"),
    JSON.stringify(pkg, null, 2)
  );

  const templateRoot = path.resolve(__dirname, "template");
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName);
    renderTemplate(templateDir, root);
  };

  // Render base template
  render("base");

  // Add configs
  render(`config/manifestV${manifestVersion}`);

  // Render framework template
  const frameworkTemplate = `${framework}${needsTypeScript ? "-ts" : ""}`;
  render(`framework/${frameworkTemplate}`);

  // Cleanup.

  if (["react", "preact"].includes(framework)) {
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        // update manifest input scripts
        if (path.basename(filepath).startsWith("manifest")) {
          const content = fs
            .readFileSync(filepath, "utf8")
            .replace(/(contentScript.*)\.js"/g, `$1.jsx"`);

          fs.writeFileSync(filepath, content);
        }

        // update manifest html files
        if (filepath.endsWith(".html")) {
          const content = fs
            .readFileSync(filepath, "utf8")
            .replace(".js", ".jsx");

          fs.writeFileSync(filepath, content);
        }
      }
    );
  }

  if (framework === "svelte") {
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        // update manifest html files
        if (path.basename(filepath).startsWith("manifest")) {
          const content = fs.readFileSync(filepath, "utf8").replace(
            `import pkg from '../package.json';`,
            `import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync(new URL("./../package.json", import.meta.url).pathname, "utf-8"));`
          );

          fs.writeFileSync(filepath, content);
        }
      }
    );
  }

  if (manifestVersion === "2+3") {
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        if (path.basename(filepath).startsWith("vite.config")) {
          const content = fs
            .readFileSync(filepath, "utf8")
            .replace(
              `import { defineConfig } from "vite";`,
              `import { defineConfig, loadEnv } from "vite";`
            )
            .replace(
              "export default defineConfig(() => {",
              `export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
`
            )
            .replace(
              `getManifest()`,
              `getManifest(Number(env.MANIFEST_VERSION))`
            );

          fs.writeFileSync(filepath, content);
        }
      }
    );
  }

  if (needsTypeScript) {
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        // add types for renderContent
        if (path.basename(filepath) === "renderContent.js") {
          const content = fs
            .readFileSync(filepath, "utf8")
            .replace("cssPaths,", "cssPaths: string[],")
            .replace("forEach((cssPath)", "forEach((cssPath: string)")
            .replace(
              "render = (_appRoot) => {}",
              "render: (appRoot: HTMLElement) => void"
            );

          fs.writeFileSync(filepath, content);
        }

        // update manifest input scripts
        if (path.basename(filepath).startsWith("manifest")) {
          const content = fs
            .readFileSync(filepath, "utf8")
            .replace(/\.js"/g, `.ts"`)
            .replace(/\.jsx"/g, `.tsx"`)
            .replace(
              `getManifest() {`,
              `getManifest(): ${
                manifestVersion === "2"
                  ? "chrome.runtime.ManifestV2"
                  : "chrome.runtime.ManifestV3"
              } {`
            )
            .replace(
              `getManifest(manifestVersion) {`,
              `getManifest(manifestVersion: number): chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3 {`
            );

          fs.writeFileSync(filepath, content);
        }

        // Rename, remove js files matching ts file
        if (
          filepath.endsWith(".js") &&
          !filepath.endsWith("svelte.config.js")
        ) {
          const tsFilePath = filepath.replace(/\.js$/, ".ts");
          if (fs.existsSync(tsFilePath)) {
            fs.unlinkSync(filepath);
          } else {
            fs.renameSync(filepath, tsFilePath);
          }
        }

        // update manifest html files
        if (filepath.endsWith(".html")) {
          const content = fs
            .readFileSync(filepath, "utf8")
            .replace(".js", ".ts");

          fs.writeFileSync(filepath, content);
        }
      }
    );
  }

  // Instructions:
  // Supported package managers: pnpm > yarn > npm
  // Note: until <https://github.com/pnpm/pnpm/issues/3505> is resolved,
  // it is not possible to tell if the command is called by `pnpm init`.
  const packageManager = /pnpm/.test(process.env.npm_execpath)
    ? "pnpm"
    : /yarn/.test(process.env.npm_execpath)
    ? "yarn"
    : "npm";

  // README generation
  fs.writeFileSync(
    path.resolve(root, "README.md"),
    generateReadme({
      projectName: result.projectName || defaultProjectName,
      packageManager,
      needsTypeScript,
      framework,
      manifestVersion,
    })
  );

  console.log(`\nDone. Now run:\n`);
  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${path.relative(cwd, root)}`))}`);
  }
  console.log(`  ${bold(green(getCommand(packageManager, "install")))}`);
  console.log(`  ${bold(green(getCommand(packageManager, "build")))}`);
  console.log(`  ${bold(green(getCommand(packageManager, "serve:chrome")))}`);

  console.log(
    `\nRefer to the README.md file in your project for more usage notes`
  );
  console.log();
}

init().catch((e) => {
  console.error(e);
});
