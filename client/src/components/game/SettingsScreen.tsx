import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getVolume, getVolumeFond, isMuted, playBack, playDignityTier, playMoneyOut, playPage, playToggle, setMuted, setVolume, setVolumeFond } from '@/lib/sound';
import { hapticsEnabled, setHapticsEnabled, haptic } from '@/lib/haptics';
import { notificationsEnabled, setNotificationsEnabled, requestPermission, rescheduleAll } from '@/lib/notifications';
import { loadDaily } from '@/lib/daily';
import { isAdsRemoved, isAtelierOwned, packUtile, purchaseAtelier, purchasePack, purchaseRemoveAds, reopenConsentForm, restaurerAchats } from '@/lib/ads';
import { Capacitor } from '@capacitor/core';
import { TUTORIAL_KEY } from './TutorialOverlay';
import { resetCoaches } from '@/lib/coach';
import { useLang, setLang, tr } from '@/lib/lang';
import { pushToast } from '@/lib/toast';

/*
 * L'ADRESSE EST ABSOLUE, ET ELLE DOIT LE RESTER.
 *
 * C'était un chemin relatif — `/confidentialite.html` — au motif qu'il suit
 * l'hébergement sans domaine en dur. Élégant sur le web, inutilisable ailleurs :
 *
 *   · Dans l'application empaquetée, le lien porte `target="_blank"` et passe
 *     donc la main au navigateur du système, qui ne connaît pas le `localhost`
 *     interne de la vue web. Le lien tombait dans le vide.
 *   · Google Play ET le message de consentement AdMob exigent une adresse
 *     qu'ils puissent visiter EUX-MÊMES, sans installer le jeu. Un chemin
 *     relatif n'en est pas une.
 *
 * La même adresse sert donc aux trois : la fiche du store, le formulaire de
 * consentement, et ce bouton. À changer ici si le domaine change un jour —
 * et à changer aussi dans la console AdMob et la fiche Play, qui en gardent
 * chacune une copie.
 */
const PRIVACY_URL = 'https://beautiful-chaja-c8af8f.netlify.app/confidentialite.html';
const APP_VERSION = '3.58.0';

/*
 * UN CURSEUR EN CARTON.
 *
 * `<input type="range">` natif, et volontairement : il apporte gratuitement
 * le glissé au doigt, le clavier, et surtout la zone de toucher élargie que
 * les navigateurs mobiles accordent aux contrôles de formulaire. Un curseur
 * refait en div se rate au pouce une fois sur trois.
 *
 * L'apparence est reprise dans `index.css` (.curseur-carton) : rail de kraft
 * strié, poignée en bout de scotch bleu — la couleur d'action de la palette
 * diégétique, la même que les boutons principaux.
 *
 * Le retour sonore part au RELÂCHEMENT, pas à chaque pas : un bip par pixel
 * pendant qu'on fait glisser rendrait le réglage du volume insupportable,
 * ce qui serait une belle ironie.
 */
function Curseur({ libelle, valeur, onChange, onRelache }: {
  libelle: string;
  valeur: number;
  onChange: (v: number) => void;
  onRelache: () => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-semibold text-[#2A1F1A]">
        {libelle}
        <span className="text-xs text-[#8B6B4A] tabular-nums">{Math.round(valeur * 100)} %</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(valeur * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        onPointerUp={onRelache}
        onKeyUp={onRelache}
        className="curseur-carton mt-1.5"
        aria-label={libelle}
      />
    </label>
  );
}

export default function SettingsScreen() {
  const { state, dispatch } = useGame();
  const lang = useLang();
  const [confirmReset, setConfirmReset] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [vol, setVol] = useState(getVolume());
  const [volFond, setVolFond] = useState(getVolumeFond());
  const [vibre, setVibre] = useState(hapticsEnabled());
  const [rappels, setRappels] = useState(notificationsEnabled());
  const [noAds, setNoAds] = useState(isAdsRemoved());
  const [buying, setBuying] = useState(false);
  const [atelier, setAtelier] = useState(isAtelierOwned());
  const [buyingAtelier, setBuyingAtelier] = useState(false);
  // Le pack ne s'affiche que pour qui ne possède ni l'un ni l'autre : le
  // proposer à qui a déjà une moitié lui ferait racheter ce qu'il a.
  const [pack, setPack] = useState(packUtile());
  const [buyingPack, setBuyingPack] = useState(false);
  const [restaurant, setRestaurant] = useState(false);
  const [consentBusy, setConsentBusy] = useState(false);

  async function handleBuyPack() {
    if (buyingPack) return;
    setBuyingPack(true);
    const ok = await purchasePack();
    if (ok) { setNoAds(true); setAtelier(true); setPack(false); }
    setBuyingPack(false);
  }

  async function handleBuyAtelier() {
    if (buyingAtelier || atelier) return;
    setBuyingAtelier(true);
    const ok = await purchaseAtelier();
    if (ok) { setAtelier(true); setPack(false); }
    setBuyingAtelier(false);
  }

  async function handleBuyNoAds() {
    if (buying || noAds) return;
    setBuying(true);
    const ok = await purchaseRemoveAds();
    if (ok) { setNoAds(true); setPack(false); }
    setBuying(false);
  }

  return (
    <div className="min-h-screen bg-texture p-5 flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playBack(); dispatch({ type: 'SET_SCREEN', screen: state.character ? 'main' : 'title' }); }}
          className="action-btn w-10 h-10 flex items-center justify-center text-lg"
          aria-label="Retour"
        >
          ←
        </button>
        <h1 className="text-2xl text-[#2A1F1A]">{tr('Options', 'Settings')}</h1>
      </div>

      {/* Langue / Language */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-2">{tr('Langue', 'Language')}</h2>
        <div className="flex gap-2">
          {(['fr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => { playToggle(); setLang(l); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                lang === l ? 'btn-primary' : 'action-btn text-[#6B5740]'
              }`}
            >
              {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </motion.section>

      {/* À propos */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.03 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-1">{tr('À propos', 'About')}</h2>
        <p className="text-sm text-[#6B5740] leading-relaxed">
          {tr(
            'Dans Le Roi du Carton, vous êtes à la rue et il faut tenir. Manger, boire, dormir, éviter les ennuis, et durer le plus de jours possible. C\'est rude, souvent injuste, et parfois ça fait rire jaune.',
            'In Cardboard King, you\'re living on the street and you have to hang on. Eat, drink, sleep, stay out of trouble, and last as many days as you can. It\'s harsh, often unfair, and sometimes darkly funny.',
          )}
        </p>
      </motion.section>

      {/* Comment jouer */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="craft-card p-4"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A] mb-2">{tr('Comment jouer', 'How to play')}</h2>
        <ul className="text-sm text-[#6B5740] leading-relaxed flex flex-col gap-1.5">
          <li>❤️ {tr('Surveillez vos 6 jauges : santé, mental, faim, soif, sommeil, dignité.', 'Watch your 6 gauges: health, mind, hunger, thirst, sleep, dignity.')}</li>
          <li>🎯 {tr('Chaque jour, vous avez un nombre limité d\'actions.', 'Each day you have a limited number of actions.')}</li>
          <li>🔍 {tr('Explorer, Mendier, Dormir, Bagarre et Voler (risqué) font avancer la journée.', 'Explore, Beg, Sleep, Fight and Steal (risky) move the day forward.')}</li>
          <li>👑 {tr('La dignité compte : sous 25, le mental fond chaque nuit ; bien tenue, elle fait donner les passants et ouvre certains choix.', 'Dignity matters: below 25 your mind erodes each night; kept high, passers-by give more and some choices open up.')}</li>
          <li>⭐ {tr('Le respect fait baisser les prix en boutique, aide à intimider les voyous et débloque des choix « on vous connaît ici ».', 'Respect lowers shop prices, helps you intimidate thugs, and unlocks "they know you here" choices.')}</li>
          <li>🎽 {tr('Touchez votre visage pour ouvrir la garde-robe : réussissez des succès pour gagner des accessoires, gardés d\'une partie à l\'autre.', 'Tap your face to open the wardrobe: complete achievements to earn accessories that carry over between runs.')}</li>
          <li>🌦️ {tr('La météo influence vos jauges : préparez-vous au pire.', 'Weather affects your gauges: brace for the worst.')}</li>
          <li>💀 {tr('Si la santé ou le mental tombe à zéro, c\'est la fin… sauf seconde chance !', 'If health or mind hits zero, it\'s over… unless you get a second chance!')}</li>
        </ul>
      </motion.section>

      {/* Son */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="craft-card p-4"
      >
        <button
          onClick={() => { const v = !muted; setMuted(v); setMutedState(v); if (!v) playToggle(); }}
          className="w-full flex items-center justify-between"
        >
          <span className="text-base font-semibold text-[#2A1F1A]">{muted ? '🔇' : '🔊'} {tr('Son', 'Sound')}</span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${muted ? 'bg-[#E8D5C0] text-[#8B6B4A]' : 'bg-[#4A9B5F]/15 text-[#3d8b4f]'}`}
          >
            {muted ? tr('Coupé', 'Off') : tr('Activé', 'On')}
          </span>
        </button>

        {/*
         * DEUX CURSEURS, ET PAS UN SEUL.
         *
         * Deux plaintes sont arrivées, et elles ne sont pas la même : « le son
         * du jeu est trop fort » et « le fond du hub est trop fort ». Un
         * volume unique ne règle que la première — baisser tout à cause du
         * fond emporte les alertes de survie avec lui, alors que ce sont
         * elles qu'il faut entendre.
         *
         * Le second curseur se multiplie au premier, donc le fond ne peut
         * jamais repasser devant les effets, quel que soit le réglage.
         *
         * Ils disparaissent en sourdine : un curseur qui ne fait rien est pire
         * qu'un curseur absent.
         */}
        {!muted && (
          <div className="mt-3 pt-3 border-t border-[#E8D5C0] space-y-3">
            <Curseur
              libelle={`🔊 ${tr('Volume', 'Volume')}`}
              valeur={vol}
              onChange={(v) => { setVol(v); setVolume(v); }}
              onRelache={() => playToggle()}
            />
            <Curseur
              libelle={`🌧️ ${tr('Fond sonore', 'Background')}`}
              valeur={volFond}
              onChange={(v) => { setVolFond(v); setVolumeFond(v); }}
              onRelache={() => playToggle()}
            />
          </div>
        )}

        {/* Réglage SÉPARÉ : couper le son ne doit pas couper le retour
            tactile, c'est justement là qu'il devient le seul canal. */}
        <button
          onClick={() => { const v = !vibre; setHapticsEnabled(v); setVibre(v); playToggle(); if (v) haptic('medium'); }}
          className="w-full flex items-center justify-between mt-3 pt-3 border-t border-[#E8D5C0]"
        >
          <span className="text-base font-semibold text-[#2A1F1A]">📳 {tr('Vibrations', 'Vibration')}</span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${vibre ? 'bg-[#4A9B5F]/15 text-[#3d8b4f]' : 'bg-[#E8D5C0] text-[#8B6B4A]'}`}
          >
            {vibre ? tr('Activé', 'On') : tr('Coupé', 'Off')}
          </span>
        </button>

        {/* Rappels : DÉSACTIVÉS par défaut, et l'autorisation système n'est
            demandée qu'au moment où le joueur les active lui-même. */}
        <button
          onClick={async () => {
            playToggle();
            if (rappels) { setNotificationsEnabled(false); setRappels(false); return; }
            const ok = await requestPermission();
            if (!ok) return;
            setNotificationsEnabled(true);
            setRappels(true);
            rescheduleAll({ fr: tr('fr', 'en') === 'fr', streak: loadDaily().streak });
          }}
          className="w-full flex items-start justify-between mt-3 pt-3 border-t border-[#E8D5C0] text-left"
        >
          <span className="flex-1 pr-3">
            <span className="text-base font-semibold text-[#2A1F1A] block">🔔 {tr('Rappels', 'Reminders')}</span>
            <span className="text-[11px] text-[#8B6B4A] leading-snug block mt-0.5">
              {tr('Deux au maximum par jour, et plus rien après trois semaines d\'absence.',
                  'Two a day at most, and nothing after three weeks away.')}
            </span>
          </span>
          <span
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${rappels ? 'bg-[#4A9B5F]/15 text-[#3d8b4f]' : 'bg-[#E8D5C0] text-[#8B6B4A]'}`}
          >
            {rappels ? tr('Activés', 'On') : tr('Coupés', 'Off')}
          </span>
        </button>
      </motion.section>

      {/* Le pack — seulement pour qui ne possède encore rien */}
      {pack && (
        <motion.section
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.085 }}
          className="craft-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-[#2A1F1A]">🎁 {tr('Le Pack', 'The Bundle')}</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#B8860B]/15 text-[#8B6B4A]">
              {tr('1 € économisé', 'Save €1')}
            </span>
          </div>
          <p className="text-xs text-[#6B5740] mb-3 leading-relaxed">
            {tr(
              'Sans pub et l\'Atelier réunis : plus d\'écrans de publicité, et le visage comme les traits de chaque personnage entre vos mains.',
              'Ad-free and the Workshop together: no more full-screen ads, and every character\'s face and traits in your hands.',
            )}
          </p>
          <button
            onClick={() => { playMoneyOut(); handleBuyPack(); }}
            disabled={buyingPack}
            className="w-full py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #B8860B, #8B6B0A)', boxShadow: '0 4px 12px rgba(184,134,11,0.28)' }}
          >
            {buyingPack ? tr('⏳ Achat en cours…', '⏳ Purchasing…') : tr('Prendre le Pack', 'Get the Bundle')}
          </button>
        </motion.section>
      )}

      {/* Sans pub */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.09 }}
        className="craft-card p-4"
      >
        {noAds ? (
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#2A1F1A]">🚫 {tr('Sans pub', 'Ad-free')}</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4A9B5F]/15 text-[#3d8b4f]">
              {tr('✅ Actif, merci !', '✅ Active, thanks!')}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-[#2A1F1A]">🚫 {tr('Supprimer les pubs', 'Remove ads')}</span>
            </div>
            <p className="text-xs text-[#8B6B4A] mb-3">
              {tr(
                'Supprime les publicités imposées (plein écran). Les bonus vidéo facultatifs (seconde chance, gains doublés…) restent disponibles.',
                'Removes forced full-screen ads. Optional reward videos (second chance, doubled gains…) stay available.',
              )}
            </p>
            <button
              onClick={() => { playMoneyOut(); handleBuyNoAds(); }}
              disabled={buying}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7B68EE, #5A4ABB)', boxShadow: '0 4px 12px rgba(123,104,238,0.25)' }}
            >
              {buying ? tr('⏳ Achat en cours…', '⏳ Purchasing…') : tr('Acheter « Sans pub »', 'Buy "Ad-free"')}
            </button>
          </>
        )}
      </motion.section>

      {/* L'Atelier — le second achat, indépendant du premier */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="craft-card p-4"
      >
        {atelier ? (
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#2A1F1A]">🎨 {tr('L\'Atelier', 'The Workshop')}</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4A9B5F]/15 text-[#3d8b4f]">
              {tr('✅ Ouvert', '✅ Open')}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold text-[#2A1F1A]">🎨 {tr('L\'Atelier', 'The Workshop')}</span>
            </div>
            <p className="text-xs text-[#6B5740] mb-3 leading-relaxed">
              {tr(
                'Composez le visage de votre personnage — teint, coiffure, regard, barbe, cicatrice — et choisissez ses deux traits de départ au lieu de les subir. Ce que vous ne touchez pas reste tiré au sort.',
                'Compose your character\'s face — skin, hair, eyes, beard, scar — and pick their two starting traits instead of taking what you\'re given. Anything you leave alone stays randomly drawn.',
              )}
            </p>
            <button
              onClick={() => { playMoneyOut(); handleBuyAtelier(); }}
              disabled={buyingAtelier}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C4723A, #9B5B3A)', boxShadow: '0 4px 12px rgba(196,114,58,0.25)' }}
            >
              {buyingAtelier ? tr('⏳ Achat en cours…', '⏳ Purchasing…') : tr('Ouvrir l\'Atelier', 'Open the Workshop')}
            </button>
          </>
        )}
      </motion.section>

      {/*
        * RESTAURER — visible en permanence, y compris pour qui possède déjà.
        *
        * C'est le bouton que cherche quelqu'un qui vient de changer de
        * téléphone et retrouve les publicités qu'il avait payé pour ne plus
        * voir. Le cacher à qui « possède déjà » n'aurait aucun sens : sur le
        * nouvel appareil, justement, il ne possède plus rien aux yeux du jeu.
        */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.11 }}
        className="craft-card p-4"
      >
        <button
          onClick={async () => {
            if (restaurant) return;
            playToggle();
            setRestaurant(true);
            const r = await restaurerAchats();
            setRestaurant(false);
            setNoAds(isAdsRemoved());
            setAtelier(isAtelierOwned());
            setPack(packUtile());
            pushToast(
              r.retrouve
                ? tr('Achats restaurés !', 'Purchases restored!')
                : r.indisponible
                  ? tr('Impossible de vérifier vos achats pour l\'instant.', 'Can\'t check your purchases right now.')
                  : tr('Aucun achat à restaurer sur ce compte.', 'No purchases to restore on this account.'),
              { emoji: r.retrouve ? '✅' : 'ℹ️', tone: r.retrouve ? 'good' : 'info' },
            );
          }}
          disabled={restaurant}
          className="w-full flex items-center justify-between disabled:opacity-60"
        >
          <span className="text-base font-semibold text-[#2A1F1A]">
            ♻️ {tr('Restaurer mes achats', 'Restore purchases')}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E8D5C0] text-[#8B6B4A]">
            {restaurant ? tr('⏳', '⏳') : tr('Toucher', 'Tap')}
          </span>
        </button>
        <p className="text-xs text-[#8B6B4A] mt-2 leading-relaxed">
          {tr(
            'Nouveau téléphone, ou jeu réinstallé ? Vos achats sont liés à votre compte Google : touchez ici pour les récupérer sans repayer.',
            'New phone, or reinstalled the game? Your purchases are tied to your Google account: tap here to get them back without paying again.',
          )}
        </p>
      </motion.section>

      {/* Données */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="craft-card p-4 flex flex-col gap-3"
      >
        <h2 className="text-base font-semibold text-[#2A1F1A]">{tr('Données', 'Data')}</h2>

        <button
          onClick={() => {
            // On remet aussi les conseils contextuels à zéro : « revoir le
            // tutoriel » doit rendre tout ce qui explique le jeu.
            playPage();
            try { localStorage.removeItem(TUTORIAL_KEY); } catch { /* silent */ }
            resetCoaches();
            dispatch({ type: 'SET_SCREEN', screen: state.character ? 'main' : 'title' });
          }}
          className="action-btn p-3 text-sm text-[#3D3020] flex items-center gap-2"
        >
          📖 {tr('Revoir le tutoriel', 'Replay the tutorial')}
        </button>

        {/* Revenir sur son consentement publicitaire. Obligatoire en Europe :
            un consentement doit pouvoir être retiré aussi facilement qu'il a
            été donné. Le bouton ne s'affiche que dans l'application native —
            la version web n'a pas de publicité, donc rien à consentir. */}
        {Capacitor.isNativePlatform() && (
          <button
            onClick={async () => {
              playToggle();
              setConsentBusy(true);
              const ok = await reopenConsentForm();
              setConsentBusy(false);
              if (!ok) {
                pushToast(tr('Formulaire indisponible pour le moment.', 'Consent form unavailable right now.'),
                  { emoji: '⚠️', tone: 'bad' });
              }
            }}
            disabled={consentBusy}
            className="action-btn p-3 text-sm text-[#3D3020] flex items-center gap-2 disabled:opacity-50"
          >
            📋 {consentBusy
              ? tr('Ouverture…', 'Opening…')
              : tr('Mes choix publicitaires', 'My ad choices')}
          </button>
        )}

        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn p-3 text-sm text-[#3D3020] flex items-center justify-between"
        >
          <span>🔒 {tr('Politique de confidentialité', 'Privacy policy')}</span>
          <span className="text-[#A08B70]">↗</span>
        </a>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="action-btn p-3 text-sm text-[#B84A3A] flex items-center gap-2"
          >
            🗑️ {tr('Réinitialiser les meilleurs scores', 'Reset best scores')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { playDignityTier(); dispatch({ type: 'RESET_SCORES' }); setConfirmReset(false); }}
              className="flex-1 p-3 text-sm font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg, #B3241C, #8E1C15)' }}
            >
              {tr('Confirmer', 'Confirm')}
            </button>
            <button
              onClick={() => { playBack(); setConfirmReset(false); }}
              className="flex-1 action-btn p-3 text-sm text-[#3D3020]"
            >
              {tr('Annuler', 'Cancel')}
            </button>
          </div>
        )}
      </motion.section>

      {/* Crédits & version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center text-xs text-[#A08B70] mt-auto pt-4"
      >
        <p>{tr('Créé avec ❤️ et beaucoup de carton.', 'Made with ❤️ and a lot of cardboard.')}</p>
        <p className="mt-1">Version {APP_VERSION}</p>
      </motion.div>
    </div>
  );
}
