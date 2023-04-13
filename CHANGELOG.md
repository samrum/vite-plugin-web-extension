# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/samrum/vite-plugin-web-extension/compare/v4.0.0...v4.1.0) (2023-04-13)

### Features

- support hash and query properties in manifest HTML filenames ([#92](https://github.com/samrum/vite-plugin-web-extension/issues/92)) ([12950b1](https://github.com/samrum/vite-plugin-web-extension/commit/12950b1418141b4d5315ad9d48ad13b01b64cf36)), closes [#90](https://github.com/samrum/vite-plugin-web-extension/issues/90)

## [4.0.0](https://github.com/samrum/vite-plugin-web-extension/compare/v3.1.1...v4.0.0) (2023-04-10)

### ⚠ BREAKING CHANGES

Check MIGRATION.md for migration instructions

- The webAccessibleScripts option has been removed and replaced by the additionalInputs option. For similar functionality, move scripts to additionalInputs.scripts and html files to additionalInputs.html. Check the README or MIGRATION files for detailed usage instructions.
- useDynamicUrlContentScripts option renamed to useDynamicUrlWebAccessibleResources
- dev mode plugin HTML transforms are no longer applied by default. Use the devHtmlTransform option to enable if needed.
- optimize web accessible resources (#89)

### Features

- additionalInputs option ([#88](https://github.com/samrum/vite-plugin-web-extension/issues/88)) ([cd9590e](https://github.com/samrum/vite-plugin-web-extension/commit/cd9590ee65cc4cf227c388bd56c69b3ca5206de0))
- optimize web accessible resources ([#89](https://github.com/samrum/vite-plugin-web-extension/issues/89)) ([d673de2](https://github.com/samrum/vite-plugin-web-extension/commit/d673de263da760697f77aba3e26131acb541e42d))

### Bug Fixes

- react HMR HTML errors due to CSP in manifest V3 ([#86](https://github.com/samrum/vite-plugin-web-extension/issues/86)) ([49db181](https://github.com/samrum/vite-plugin-web-extension/commit/49db1817ae2c648065283c77a87189e2ef92e969))
- Input TypeScript file extensions not being correctly converted to .js in output manifest.json

### [3.1.1](https://github.com/samrum/vite-plugin-web-extension/compare/v3.1.0...v3.1.1) (2023-02-25)

### Bug Fixes

- internal viteMetadata type conflicts with Vite ([#83](https://github.com/samrum/vite-plugin-web-extension/issues/83)) ([9043206](https://github.com/samrum/vite-plugin-web-extension/commit/9043206da401bed9d113b315602286cae5493652))

## [3.1.0](https://github.com/samrum/vite-plugin-web-extension/compare/v3.0.0...v3.1.0) (2023-02-05)

### Features

- content_scripts css property processing by Vite ([#77](https://github.com/samrum/vite-plugin-web-extension/issues/77)) ([84ff1ab](https://github.com/samrum/vite-plugin-web-extension/commit/84ff1abdae21ed007230e0df506e9a93e19e4341))

### Bug Fixes

- DevBuilder’s output path should respect the `root` property of ViteConfig ([#81](https://github.com/samrum/vite-plugin-web-extension/issues/81)) ([9307b79](https://github.com/samrum/vite-plugin-web-extension/commit/9307b799dac985a2912e3f5cc0f97cf2a4846fea))

## [3.0.0](https://github.com/samrum/vite-plugin-web-extension/compare/v2.2.1...v3.0.0) (2023-01-03)

### ⚠ BREAKING CHANGES

- dynamic imports in content scripts are broken (#71)

### Features

- don't create loader for web accessible scripts with no imports ([#72](https://github.com/samrum/vite-plugin-web-extension/issues/72)) ([8acfaec](https://github.com/samrum/vite-plugin-web-extension/commit/8acfaecdf653a491938d361dfe07d3da5ac6bb94))
- Vite 4 support ([#70](https://github.com/samrum/vite-plugin-web-extension/issues/70)) ([49330cd](https://github.com/samrum/vite-plugin-web-extension/commit/49330cd89e3f96bb00bbd5a902cc6ff04eeee260))

### Bug Fixes

- dynamic imports in content scripts are broken ([#71](https://github.com/samrum/vite-plugin-web-extension/issues/71)) ([fe888e4](https://github.com/samrum/vite-plugin-web-extension/commit/fe888e4c72178ef09121ce864d2fc5124188f62d))
- web accessible scripts with no loader have incorrect filename ([#73](https://github.com/samrum/vite-plugin-web-extension/issues/73)) ([5d04de4](https://github.com/samrum/vite-plugin-web-extension/commit/5d04de45d8603a1a9efc020a780f6373a17ea50e))

### [2.2.1](https://github.com/samrum/vite-plugin-web-extension/compare/v2.2.0...v2.2.1) (2023-01-02)

### Bug Fixes

- getMetadataForChunk infinitely loops when parsing build output ([#67](https://github.com/samrum/vite-plugin-web-extension/issues/67)) ([6092362](https://github.com/samrum/vite-plugin-web-extension/commit/6092362234eb8266ec9061b98180e40ee8715b2a))
- hmr not working since vite 3.2.3 ([#69](https://github.com/samrum/vite-plugin-web-extension/issues/69)) ([b49f05f](https://github.com/samrum/vite-plugin-web-extension/commit/b49f05fe383a99959bbbc70483c728514d1a1316))
- node_modules dependencies shouldn't have dynamic imports modified ([#68](https://github.com/samrum/vite-plugin-web-extension/issues/68)) ([232b90f](https://github.com/samrum/vite-plugin-web-extension/commit/232b90fc4780bc5db619b6f3ae8d88cbc5d5a84a))

## [2.2.0](https://github.com/samrum/vite-plugin-web-extension/compare/v2.1.1...v2.2.0) (2022-11-22)

### Features

- firefox experimental manifest V3 support ([#63](https://github.com/samrum/vite-plugin-web-extension/issues/63)) ([fd62c7d](https://github.com/samrum/vite-plugin-web-extension/commit/fd62c7d35c3475b9463b620161d7040e6836e30f))

### [2.1.1](https://github.com/samrum/vite-plugin-web-extension/compare/v2.1.0...v2.1.1) (2022-10-01)

### Bug Fixes

- improve the way CSP is modified in HMR mode ([#54](https://github.com/samrum/vite-plugin-web-extension/issues/54)) ([6143dfe](https://github.com/samrum/vite-plugin-web-extension/commit/6143dfe3a9d6468b05b485650b97695355595e34))

## [2.1.0](https://github.com/samrum/vite-plugin-web-extension/compare/v2.0.0...v2.1.0) (2022-09-26)

### Features

- generate loader files for web accessible scripts ([#52](https://github.com/samrum/vite-plugin-web-extension/issues/52)) ([da38880](https://github.com/samrum/vite-plugin-web-extension/commit/da388808adb59f28ff79196f490525bd89c611f9))

## [2.0.0](https://github.com/samrum/vite-plugin-web-extension/compare/v1.0.2...v2.0.0) (2022-09-06)

### ⚠ BREAKING CHANGES

- Vite 3 is now the minimum supported version of Vite

### Features

- add devtools support ([#40](https://github.com/samrum/vite-plugin-web-extension/issues/40)) ([627e7f0](https://github.com/samrum/vite-plugin-web-extension/commit/627e7f0e47dd22b4c61e2355521ed83cc6520e10))
- add missing html file entry points ([#45](https://github.com/samrum/vite-plugin-web-extension/issues/45)) ([178205a](https://github.com/samrum/vite-plugin-web-extension/commit/178205a72aca6ada9d57268862c86e5dbcaa66be))
- web accessible scripts ([#31](https://github.com/samrum/vite-plugin-web-extension/issues/31)) ([32c24a4](https://github.com/samrum/vite-plugin-web-extension/commit/32c24a46e7d7867229cccf6d43761edfea5ac204))

### Bug Fixes

- include imports from web accessible scripts in manifest v3 ([#41](https://github.com/samrum/vite-plugin-web-extension/issues/41)) ([65d52f5](https://github.com/samrum/vite-plugin-web-extension/commit/65d52f5afeec9c5c3475b638546e34380d5d6b7d))
- make dynamic imports resolve relative to extension host ([#37](https://github.com/samrum/vite-plugin-web-extension/issues/37)) ([7948164](https://github.com/samrum/vite-plugin-web-extension/commit/7948164fe42997d1bae952fc17094dae29adc040))
- **manifest V3:** correct matches property in web accessible resources ([#47](https://github.com/samrum/vite-plugin-web-extension/issues/47)) ([17d97d3](https://github.com/samrum/vite-plugin-web-extension/commit/17d97d3a4ff34249874c512e3b525b197a38d509))
- **manifest v3:** web accessible resource match rewrite is broken ([#48](https://github.com/samrum/vite-plugin-web-extension/issues/48)) ([4e2ba91](https://github.com/samrum/vite-plugin-web-extension/commit/4e2ba919d4a73abaee50b15ce6f929951e958165))

- bump Vite to 3.0.2 ([#36](https://github.com/samrum/vite-plugin-web-extension/issues/36)) ([bdfa480](https://github.com/samrum/vite-plugin-web-extension/commit/bdfa4809958e0946fed351b1dc4f2101f231158b))

### [1.0.2](https://github.com/samrum/vite-plugin-web-extension/compare/v1.0.2-beta.1...v1.0.2) (2022-04-24)

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
