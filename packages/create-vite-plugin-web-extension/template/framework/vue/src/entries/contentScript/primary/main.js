import { createApp } from "vue";
import renderContent from "../renderContent";
import App from "./App.vue";

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
  createApp(App).mount(appRoot);
});
