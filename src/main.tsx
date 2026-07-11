import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNativeApp } from "./lib/capacitorBootstrap";

createRoot(document.getElementById("root")!).render(<App />);
initNativeApp();
