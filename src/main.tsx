import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNativeApp } from "./lib/capacitorBootstrap";
import { installGlobalErrorHandlers } from "./lib/errorLogger";

installGlobalErrorHandlers();
createRoot(document.getElementById("root")!).render(<App />);
initNativeApp();
