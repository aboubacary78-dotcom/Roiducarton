/*
 * L'esquive de rattrapage : géométrie des projectiles.
 *
 * Règle de conception : un tir doit menacer LÀ OÙ LE JOUEUR SE TIENT. Avant,
 * les projectiles partaient d'un point au hasard ; contre beaucoup d'ennemis
 * il suffisait de se coller dans un coin du bas et d'attendre la fin du
 * chrono sans bouger. Désormais chaque tir vise la position du joueur au
 * moment où il part, avec un écart aléatoire : rester immobile, c'est prendre
 * le coup ; bouger d'un pas de côté, c'est l'éviter. Le tir n'est jamais
 * infaillible, il est simplement adressé.
 */
import type { ProjectilePattern } from '../types';

export const ARENA = 300;   // côté de l'arène, en unités de jeu
export const GRAVITY = 260; // accélération verticale des tirs en cloche

export interface DodgeProj {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  kind: string;
  armUntil: number; // avant cette date, le tir est inoffensif (flair)
}

export interface Pos { x: number; y: number }

// Écart aléatoire dans [-amp, +amp] : c'est lui qui laisse une porte de sortie.
function jitter(amp: number): number {
  return (Math.random() * 2 - 1) * amp;
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Une salve, telle qu'elle part vers le joueur. `speed` est déjà multiplié
 * par la cadence du round ; `armUntil` vaut 0 sauf pour les personnages qui
 * flairent le danger (le tir clignote avant de devenir mortel).
 */
export function spawnWave(
  pattern: ProjectilePattern,
  player: Pos,
  speed: number,
  nextId: () => number,
  armUntil = 0,
): DodgeProj[] {
  const out: DodgeProj[] = [];
  const add = (x: number, y: number, vx: number, vy: number) => {
    out.push({ id: nextId(), x, y, vx, vy, size: pattern.size, kind: pattern.kind, armUntil });
  };
  const cx = (v: number) => clamp(v, 18, ARENA - 18);
  const cy = (v: number) => clamp(v, 18, ARENA - 18);

  if (pattern.motion === 'spread') {
    // Éventail lâché juste au-dessus du joueur : il faut sortir du cône.
    const col = cx(player.x + jitter(44));
    for (let i = -1; i <= 1; i++) add(col, -10, i * 55, speed);
  } else if (pattern.motion === 'lob') {
    // Cloche lancée SUR le joueur : elle retombe là où il se tient. Temps de
    // vol résolu pour la hauteur du joueur, d'où la vitesse horizontale.
    const from = cx(20 + Math.random() * (ARENA - 40));
    const vy0 = speed * 0.5;
    const drop = Math.max(40, player.y + 10);
    const t = (Math.sqrt(vy0 * vy0 + 2 * GRAVITY * drop) - vy0) / GRAVITY;
    const target = cx(player.x + jitter(32));
    add(from, -10, (target - from) / t, vy0);
  } else if (pattern.motion === 'homing') {
    // Depuis un bord au hasard, droit sur le joueur (et il corrige en vol).
    const edge = Math.floor(Math.random() * 4);
    const sx = edge === 0 ? -10 : edge === 1 ? ARENA + 10 : Math.random() * ARENA;
    const sy = edge === 2 ? -10 : edge === 3 ? ARENA + 10 : Math.random() * ARENA;
    const dx = player.x - sx, dy = player.y - sy;
    const d = Math.hypot(dx, dy) || 1;
    add(sx, sy, (dx / d) * speed, (dy / d) * speed);
  } else {
    // straight : par la colonne du joueur, ou par le côté sur sa ligne. Les
    // tirs latéraux visent désormais sa hauteur, avant ils passaient tous
    // au-dessus de quelqu'un posté en bas de l'arène.
    if (Math.random() < 0.5) {
      add(cx(player.x + jitter(50)), -10, jitter(20), speed);
    } else {
      const left = Math.random() < 0.5;
      add(left ? -10 : ARENA + 10, cy(player.y + jitter(44)), (left ? 1 : -1) * speed, jitter(18));
    }
  }
  return out;
}

/**
 * Avance les projectiles d'un pas de temps et renvoie ceux qui vivent encore.
 * Les touches sont signalées par `onHit` (le tir disparaît à l'impact).
 * `invulnerableUntil` est relu à chaque projectile : une touche ouvre ses
 * images d'invulnérabilité tout de suite, y compris pour la même image.
 */
export function stepProjectiles(
  projs: DodgeProj[],
  pattern: ProjectilePattern,
  player: Pos,
  radius: number,
  dt: number,
  now: number,
  invulnerableUntil: () => number,
  onHit: () => void,
): DodgeProj[] {
  const alive: DodgeProj[] = [];
  for (const pr of projs) {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    if (pattern.motion === 'lob') pr.vy += GRAVITY * dt;
    if (pattern.motion === 'homing') {
      const ax = player.x - pr.x, ay = player.y - pr.y;
      const d = Math.hypot(ax, ay) || 1;
      pr.vx += (ax / d) * 60 * dt;
      pr.vy += (ay / d) * 60 * dt;
    }
    if (pr.x < -40 || pr.x > ARENA + 40 || pr.y < -40 || pr.y > ARENA + 40) continue;
    const armed = pr.armUntil === 0 || now >= pr.armUntil;
    if (armed && now >= invulnerableUntil()) {
      if (Math.hypot(pr.x - player.x, pr.y - player.y) < radius + pr.size / 2) {
        onHit();
        continue;
      }
    }
    alive.push(pr);
  }
  return alive;
}
