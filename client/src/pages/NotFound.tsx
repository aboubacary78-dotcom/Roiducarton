import { useLocation } from "wouter";

// 404 dans la DA du jeu : un carton égaré, pas de dépendances externes.
export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-texture flex items-center justify-center p-6">
      <div className="craft-card p-8 text-center max-w-sm w-full">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-4xl text-[#2A1F1A] mb-2">404</h1>
        <p className="text-sm text-[#6B5740] mb-6 leading-relaxed">
          Cette page a déménagé. Comme nous tous, un jour ou l'autre.
        </p>
        <button onClick={() => setLocation("/")} className="btn-primary w-full py-3 text-sm">
          🏠 Retour au carton
        </button>
      </div>
    </div>
  );
}
