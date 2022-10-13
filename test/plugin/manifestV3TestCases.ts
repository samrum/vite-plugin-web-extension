const baseResourceDir = "test/plugin/resources";

export function BackgroundServiceWorker(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/backgroundServiceWorker`;

  return {
    background: {
      service_worker: `${resourceDir}/serviceWorker.js`,
    },
  };
}

export function BackgroundServiceWorkerRelative(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/backgroundServiceWorker`;
  const resourceDirRelative = `./${resourceDir}`;

  return {
    background: {
      service_worker: `${resourceDirRelative}/serviceWorker.js`,
    },
  };
}

export function BackgroundServiceWorkerRoot(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/backgroundServiceWorker`;
  const resourceDirRoot = `/${resourceDir}`;

  return {
    background: {
      service_worker: `${resourceDirRoot}/serviceWorker.js`,
    },
  };
}

export function ChromeUrlOverridesHtmlNewTab(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/chromeUrlOverridesHtml`;

  return {
    chrome_url_overrides: {
      newtab: `${resourceDir}/newtab.html`,
    },
  };
}

export function ChromeUrlOverridesHtmlHistory(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/chromeUrlOverridesHtml`;

  return {
    chrome_url_overrides: {
      history: `${resourceDir}/history.html`,
    },
  };
}

export function ChromeUrlOverridesHtmlBookmarks(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/chromeUrlOverridesHtml`;

  return {
    chrome_url_overrides: {
      bookmarks: `${resourceDir}/bookmarks.html`,
    },
  };
}

export function ContentCss(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/contentCss`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content.js`],
        css: [`${resourceDir}/content.css`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentWithChunkedImport(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/contentWithChunkedImport`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
      {
        js: [`${resourceDir}/content2.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
    ],
  };
}

export function ContentWithDynamicImport(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/contentWithDynamicImport`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
      {
        js: [`${resourceDir}/content2.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
    ],
  };
}

export function ContentWithNoImports(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/contentWithNoImports`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
    ],
  };
}

export function ContentWithSameScriptName(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/contentWithSameScriptName`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1/content.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
      {
        js: [`${resourceDir}/content2/content.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
    ],
  };
}

export function ContentWithUnchunkedImport(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/contentWithUnchunkedImport`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content.js`],
        matches: [
          "*://*/*",
          "https://*/*",
          "*://example.com/",
          "https://example.com/",
          "*://example.com/subpath/*",
          "https://example.com/subpath/*",
        ],
      },
    ],
  };
}

export function DevtoolsHtml(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/devtoolsHtml`;

  return {
    devtools_page: `${resourceDir}/devtools.html`,
  };
}

export function fullIntegration(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/fullIntegration`;

  return {
    action: {
      default_icon: {
        32: `${resourceDir}/src/assets/logo.svg`,
      },
    },
    background: {
      service_worker: `${resourceDir}/src/entries/background/main.js`,
    },
    content_scripts: [
      {
        js: [`${resourceDir}/src/entries/contentScript/primary/main.js`],
        matches: ["*://*/*"],
      },
    ],
    host_permissions: ["*://*/*"],
    permissions: ["scripting", "tabs"],
    icons: {
      512: `${resourceDir}/src/assets/logo.svg`,
    },
    options_ui: {
      page: `${resourceDir}/src/entries/options/index.html`,
      open_in_tab: true,
    },
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: [`${resourceDir}/src/lib.js`],
      },
    ],
  };
}

export function OptionsHtml(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/optionsHtml`;

  return {
    options_ui: {
      page: `${resourceDir}/options.html`,
    },
  };
}

export function PopupHtml(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/popupHtml`;

  return {
    action: {
      default_popup: `${resourceDir}/popup.html`,
    },
  };
}

export function WebAccessibleResourceHtml(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/webAccessibleResourceHtml`;

  return {
    web_accessible_resources: [
      {
        resources: [
          `${resourceDir}/webAccessibleResource.html`,
          `unhandled/*.html`,
          `*.html`,
        ],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function WebAccessibleScriptWithChunkedImport(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/webAccessibleScriptWithChunkedImport`;

  return {
    web_accessible_resources: [
      {
        resources: [`${resourceDir}/webAccessibleScript1.js`],
        matches: ["<all_urls>"],
      },
      {
        resources: [`${resourceDir}/webAccessibleScript2.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function WebAccessibleScriptWithNoImport(): Partial<chrome.runtime.ManifestV3> {
  const resourceDir = `${baseResourceDir}/webAccessibleScriptWithNoImport`;

  return {
    web_accessible_resources: [
      {
        resources: [`${resourceDir}/webAccessibleScript.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}
