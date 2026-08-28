import "./styles.css";
import { captureLicense } from "./license";
import { mountPresenceApp } from "./app-core";

captureLicense();
const root = document.querySelector<HTMLElement>("#app");
if (root) mountPresenceApp(root, { demo: new URLSearchParams(location.search).get("demo") === "1" });
