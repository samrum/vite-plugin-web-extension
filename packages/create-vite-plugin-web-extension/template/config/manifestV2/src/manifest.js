import pkg from "../package.json";

const manifest = {
  background: {
    scripts: ["src/entries/background/main.js"],
    persistent: false,
  },
  content_scripts: [
    {
      js: ["src/entries/contentScript/primary/main.js"],
      matches: ["*://*/*"],
    },
  ],
  browser_action: {
    default_icon: {
      16: "icons/16.png",
      19: "icons/19.png",
      32: "icons/32.png",
      38: "icons/38.png",
    },
    default_popup: "src/entries/popup/index.html",
  },
  icons: {
    16: "icons/16.png",
    19: "icons/19.png",
    32: "icons/32.png",
    38: "icons/38.png",
    48: "icons/48.png",
    64: "icons/64.png",
    96: "icons/96.png",
    128: "icons/128.png",
    256: "icons/256.png",
    512: "icons/512.png",
  },
  options_ui: {
    chrome_style: false,
    open_in_tab: true,
    page: "src/entries/options/index.html",
  },
  permissions: ["*://*/*"],
};

export function getManifest() {
  return {
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
    manifest_version: 2,
    ...manifest,
  };
}
