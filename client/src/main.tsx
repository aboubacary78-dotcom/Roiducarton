import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAds } from "./lib/ads";
import { getLang, chargerTraductions } from "./lib/lang";

/*
 * Un anglophone attend son dictionnaire avant le premier rendu — c'est
 * exactement ce qui se passait avant, quand il était dans le paquet principal,
 * donc il n'y perd rien et ne voit aucun texte français clignoter.
 *
 * Un francophone, lui, ne le télécharge jamais : 179 ko compressés en moins,
 * soit près du tiers du JavaScript du jeu.
 */
const pret = getLang() === 'en' ? chargerTraductions() : Promise.resolve();
pret.then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

// Initialise AdMob au démarrage (no-op sur le web).
initAds();
