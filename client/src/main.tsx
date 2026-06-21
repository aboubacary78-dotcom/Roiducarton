import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAds } from "./lib/ads";

createRoot(document.getElementById("root")!).render(<App />);

// Initialise AdMob au démarrage (no-op sur le web).
initAds();
