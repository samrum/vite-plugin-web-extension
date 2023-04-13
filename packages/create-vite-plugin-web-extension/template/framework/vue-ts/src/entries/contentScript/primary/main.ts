import { createApp } from "vue";
import renderContent from "../renderContent";
import Primary from "./App.vue";

renderContent(
  import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS,
  (appRoot: HTMLElement) => {
    createApp(Primary).mount(appRoot);
  }
);
