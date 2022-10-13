const baseResourceDir = "test/plugin/resources";

export function BackgroundHtml(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/backgroundHtml`;

  return {
    background: {
      page: `${resourceDir}/background.html`,
      persistent: false,
    },
  };
}

export function BackgroundScript(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/backgroundScript`;

  return {
    background: {
      scripts: [`/${resourceDir}/background.js`],
      persistent: false,
    },
  };
}

export function ChromeUrlOverridesHtmlNewTab(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/chromeUrlOverridesHtml`;

  return {
    chrome_url_overrides: {
      newtab: `${resourceDir}/newtab.html`,
    },
  };
}

export function ChromeUrlOverridesHtmlHistory(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/chromeUrlOverridesHtml`;

  return {
    chrome_url_overrides: {
      history: `${resourceDir}/history.html`,
    },
  };
}

export function ChromeUrlOverridesHtmlBookmarks(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/chromeUrlOverridesHtml`;

  return {
    chrome_url_overrides: {
      bookmarks: `${resourceDir}/bookmarks.html`,
    },
  };
}

export function ChunkCssRewrite(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/chunkCssRewrite`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1.js`],
        matches: ["https://*/*", "http://*/*"],
      },
      {
        js: [`${resourceDir}/content2.js`],
        matches: ["https://*/*", "http://*/*"],
      },
      {
        js: [`${resourceDir}/contentNoCss.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentCss(): Partial<chrome.runtime.ManifestV2> {
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

export function ContentScriptPaths(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/contentWithChunkedImport`;
  const resourceDirRoot = `/${resourceDir}`;
  const resourceDirRelative = `./${resourceDir}`;

  return {
    content_scripts: [
      {
        js: [`${resourceDirRoot}/content1.js`],
        matches: ["https://*/*", "http://*/*"],
      },
      {
        js: [`${resourceDirRelative}/content2.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentWithChunkedImport(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/contentWithChunkedImport`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1.js`],
        matches: ["https://*/*", "http://*/*"],
      },
      {
        js: [`${resourceDir}/content2.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentWithDynamicImport(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/contentWithDynamicImport`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1.js`],
        matches: ["https://*/*", "http://*/*"],
      },
      {
        js: [`${resourceDir}/content2.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentWithNoImports(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/contentWithNoImports`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentWithSameScriptName(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/contentWithSameScriptName`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content1/content.js`],
        matches: ["https://*/*", "http://*/*"],
      },
      {
        js: [`${resourceDir}/content2/content.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function ContentWithUnchunkedImport(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/contentWithUnchunkedImport`;

  return {
    content_scripts: [
      {
        js: [`${resourceDir}/content.js`],
        matches: ["https://*/*", "http://*/*"],
      },
    ],
  };
}

export function DevtoolsHtml(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/devtoolsHtml`;

  return {
    devtools_page: `${resourceDir}/devtools.html`,
  };
}

export function FullExample(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/fullIntegration`;

  return {
    background: {
      scripts: [`${resourceDir}/src/entries/background/main.js`],
      persistent: false,
    },
    content_scripts: [
      {
        js: [`${resourceDir}/src/entries/contentScript/primary/main.js`],
        matches: ["*://*/*"],
      },
    ],
    web_accessible_resources: [`${resourceDir}/src/lib.js`],
    browser_action: {
      default_icon: {
        32: `${resourceDir}/src/assets/logo.svg`,
      },
      // default_popup: `${resourceDir}/src/entries/popup/index.html`,
    },
    options_ui: {
      chrome_style: false,
      open_in_tab: true,
      page: `${resourceDir}/src/entries/options/index.html`,
    },
    permissions: ["*://*/*"],
  };
}

export function OptionsHtml(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/optionsHtml`;

  return {
    options_ui: {
      page: `${resourceDir}/options.html`,
    },
  };
}

export function PopupHtml(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/popupHtml`;

  return {
    browser_action: {
      default_popup: `${resourceDir}/popup.html`,
    },
  };
}

export function WebAccessibleResourceHtml(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/webAccessibleResourceHtml`;

  return {
    web_accessible_resources: [
      `${resourceDir}/webAccessibleResource.html`,
      `unhandled/*.html`,
      `*.html`,
    ],
  };
}

export function WebAccessibleScriptWithNoImport(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/webAccessibleScriptWithChunkedImport`;

  return {
    web_accessible_resources: [
      `${resourceDir}/webAccessibleScript1.js`,
      `${resourceDir}/webAccessibleScript2.js`,
    ],
  };
}

export function WebAccessibleScriptWithChunkedImport(): Partial<chrome.runtime.ManifestV2> {
  const resourceDir = `${baseResourceDir}/webAccessibleScriptWithNoImport`;

  return {
    web_accessible_resources: [`${resourceDir}/webAccessibleScript.js`],
  };
}
