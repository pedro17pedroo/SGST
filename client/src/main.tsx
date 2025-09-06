import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { FrontendModuleManager } from "./config/modules";

// Expor FrontendModuleManager globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).FrontendModuleManager = FrontendModuleManager;
}

createRoot(document.getElementById("root")!).render(<App />);
