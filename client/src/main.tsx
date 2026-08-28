import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAds } from "./lib/ads";
import { initFacturation } from "./lib/facturation";
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

/*
 * Et le magasin, dans la foulée — mais SÉPARÉMENT.
 *
 * Les deux sont indépendants : un joueur qui a coupé la publicité doit quand
 * même pouvoir restaurer ses achats, et une panne d'AdMob ne doit pas laisser
 * la caisse fermée. Les faire dépendre l'un de l'autre lierait deux services
 * qui n'ont en commun que le moment où on les allume.
 *
 * C'est aussi cet appel qui rend au joueur, au lancement, ce qu'il a déjà
 * payé : sur un téléphone neuf ou après une réinstallation, le magasin répond
 * avant même qu'on lui demande quoi que ce soit.
 */
initFacturation();
