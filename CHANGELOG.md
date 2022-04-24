# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.2-beta.1](https://github.com/samrum/vite-plugin-web-extension/compare/v1.0.2-beta.0...v1.0.2-beta.1) (2022-04-24)

### Bug Fixes

- add /vite/client to optimizeDeps.exclude ([#27](https://github.com/samrum/vite-plugin-web-extension/issues/27)) ([119cbc2](https://github.com/samrum/vite-plugin-web-extension/commit/119cbc2c835da37ca72b7bd61b3d8c9d79167ed0))

### [1.0.2-beta.0](https://github.com/samrum/vite-plugin-web-extension/compare/v1.0.1...v1.0.2-beta.0) (2022-04-24)

### Bug Fixes

- force /@vite/client to be external ([#26](https://github.com/samrum/vite-plugin-web-extension/issues/26)) ([9c11af5](https://github.com/samrum/vite-plugin-web-extension/commit/9c11af582a0651e50ea8785be210445848be2a76))

### [1.0.1](https://github.com/samrum/vite-plugin-web-extension/compare/v1.0.0...v1.0.1) (2022-04-23)

### Bug Fixes

- vite-ignore /@vite/client import in client.js ([#25](https://github.com/samrum/vite-plugin-web-extension/issues/25)) ([4d0edc7](https://github.com/samrum/vite-plugin-web-extension/commit/4d0edc73104cbae6df90dcfc562cbf6b066056ef))

## [1.0.0](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.8...v1.0.0) (2022-04-08)

### ⚠ BREAKING CHANGES

- import.meta.CURRENT_CONTENT_SCRIPT_CSS_URL has been replaced with import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS. Minimum supported version of Vite is now 2.9.0

### Features

- add client types for plugin users ([#11](https://github.com/samrum/vite-plugin-web-extension/issues/11)) ([8b96fac](https://github.com/samrum/vite-plugin-web-extension/commit/8b96facdfbc0b491fa19ca7e33f18f6276f15ddb))

### Bug Fixes

- multiple css dependencies in content scripts, shared css across chunks ([#13](https://github.com/samrum/vite-plugin-web-extension/issues/13)) ([c2dbe8f](https://github.com/samrum/vite-plugin-web-extension/commit/c2dbe8f6c77096e63cb7cc1757eac0f44cecd631))

### [0.1.8](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.7...v0.1.8) (2022-03-28)

### Bug Fixes

- **devBuilder:** add missing csp source for firefox ([#10](https://github.com/samrum/vite-plugin-web-extension/issues/10)) ([cb2f239](https://github.com/samrum/vite-plugin-web-extension/commit/cb2f2391cfda75e764d7a0776322f00c6601fe3a))

### [0.1.7](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.6...v0.1.7) (2022-02-18)

### Features

- **dev:** reprocess manifest HTML files on change ([#7](https://github.com/samrum/vite-plugin-web-extension/issues/7)) ([d643e5e](https://github.com/samrum/vite-plugin-web-extension/commit/d643e5ef9965e5c90beb42b04b6e3531265288be))

### [0.1.6](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.5...v0.1.6) (2022-02-13)

### Features

- **dev:** apply plugin html transforms, add CSP inline script hashes ([#4](https://github.com/samrum/vite-plugin-web-extension/issues/4)) ([44c10b0](https://github.com/samrum/vite-plugin-web-extension/commit/44c10b0584f41068c5aa5ef2f9aeb75c8b993d3c))

### Bug Fixes

- ensure dev server is set for dev builds, add object-src to dev CSP ([#5](https://github.com/samrum/vite-plugin-web-extension/issues/5)) ([056547c](https://github.com/samrum/vite-plugin-web-extension/commit/056547c8d1a23f71bdd9ec70837a9448126c0c7e))
- only set script hashes in manifest V2 CSP ([#6](https://github.com/samrum/vite-plugin-web-extension/issues/6)) ([ad3580d](https://github.com/samrum/vite-plugin-web-extension/commit/ad3580d7b44ae8978004e569c99ad7c1dfe87f4d))

### [0.1.5](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.4...v0.1.5) (2022-02-10)

### Bug Fixes

- background.html missing in dev mode ([#2](https://github.com/samrum/vite-plugin-web-extension/issues/2)) ([1fa4d47](https://github.com/samrum/vite-plugin-web-extension/commit/1fa4d47a8271ef578d6cab969d8249ac27511582))

### [0.1.4](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.3...v0.1.4) (2022-02-09)

### Bug Fixes

- fix windows path handling ([#1](https://github.com/samrum/vite-plugin-web-extension/issues/1)) ([db03637](https://github.com/samrum/vite-plugin-web-extension/commit/db03637dac8f2d9ceaa725750bd0be99781b7625))

### [0.1.3](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.2...v0.1.3) (2022-01-06)

### Bug Fixes

- make manifest parsers use a copy of input manifest ([2c0ab12](https://github.com/samrum/vite-plugin-web-extension/commit/2c0ab12a986bbcd2f3d55313a9bb3fd11c067a26))
- normalize filenames on output manifest matching ([b899410](https://github.com/samrum/vite-plugin-web-extension/commit/b899410a889b93726392e33695b8db52ea19ff5d))

### [0.1.2](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.1...v0.1.2) (2022-01-03)

### Features

- maintain existing build.target config if set ([d75c9e1](https://github.com/samrum/vite-plugin-web-extension/commit/d75c9e1838518263c48d5af4e2adfab47dfe56df))

### Bug Fixes

- reference url using req object ([ae04fa7](https://github.com/samrum/vite-plugin-web-extension/commit/ae04fa7051031ab35fbd99bc199ac70d1744fb89))

### [0.1.1](https://github.com/samrum/vite-plugin-web-extension/compare/v0.1.0...v0.1.1) (2022-01-03)

### Bug Fixes

- add missing breaks for build targets ([6f2ff64](https://github.com/samrum/vite-plugin-web-extension/commit/6f2ff64e6d378c78f6a7a4db882d6de4456ef89c))
- update placeholder input to work with new vite input handling ([91a5c29](https://github.com/samrum/vite-plugin-web-extension/commit/91a5c294e1fb7408373a1d293a488ff6c27860de))

## 0.1.0 (2022-01-03)
