# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
