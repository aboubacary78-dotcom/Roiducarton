// ============ MÉTÉO ============
import type { WeatherType, Weather } from '../types';

export const WEATHER_TYPES: Record<WeatherType, Weather> = {
  sunny: {
    type: 'sunny',
    label: 'Ensoleillé', labelEn: 'Sunny',
    emoji: '☀️',
    description: 'Une belle journée. Profitez-en, ça ne dure pas.',
    descriptionEn: 'A fine day. Enjoy it, it won\'t last.',
    dailyPenalty: { thirst: -5 },
    actionModifier: 1.2,
    filter: 'rgba(255, 200, 50, 0)',
    filterOpacity: 0,
  },
  cloudy: {
    type: 'cloudy',
    label: 'Nuageux', labelEn: 'Cloudy',
    emoji: '☁️',
    description: 'Gris et morne. Comme votre humeur.',
    descriptionEn: 'Grey and dull. Like your mood.',
    dailyPenalty: { mental: -3 },
    actionModifier: 1.0,
    filter: 'rgba(150, 150, 170, 0.12)',
    filterOpacity: 0.12,
  },
  rainy: {
    type: 'rainy',
    label: 'Pluie', labelEn: 'Rain',
    emoji: '🌧️',
    description: 'La pluie s\'infiltre partout. Vos affaires sont trempées.',
    descriptionEn: 'Rain seeps in everywhere. Your things are soaked.',
    dailyPenalty: { sleep: -10, health: -5, dignity: -8 },
    actionModifier: 0.7,
    filter: 'rgba(60, 100, 180, 0.18)',
    filterOpacity: 0.18,
  },
  storm: {
    type: 'storm',
    label: 'Orage', labelEn: 'Storm',
    emoji: '⛈️',
    description: 'Tonnerre et éclairs. Impossible de rester dehors.',
    descriptionEn: 'Thunder and lightning. No staying outside.',
    dailyPenalty: { sleep: -18, health: -10, mental: -12, dignity: -10 },
    actionModifier: 0.4,
    filter: 'rgba(30, 50, 120, 0.28)',
    filterOpacity: 0.28,
  },
  heatwave: {
    type: 'heatwave',
    label: 'Canicule', labelEn: 'Heatwave',
    emoji: '🌡️',
    description: 'La chaleur est écrasante. La soif vous dévore.',
    descriptionEn: 'The heat is crushing. Thirst devours you.',
    dailyPenalty: { thirst: -20, health: -8, mental: -5 },
    actionModifier: 0.8,
    filter: 'rgba(220, 80, 20, 0.15)',
    filterOpacity: 0.15,
  },
  fog: {
    type: 'fog',
    label: 'Brouillard', labelEn: 'Fog',
    emoji: '🌫️',
    description: 'On ne voit pas à deux mètres. Dangereux.',
    descriptionEn: 'You can\'t see two metres ahead. Dangerous.',
    dailyPenalty: { mental: -6, sleep: -5 },
    actionModifier: 0.85,
    filter: 'rgba(200, 200, 210, 0.22)',
    filterOpacity: 0.22,
  },
  snow: {
    type: 'snow',
    label: 'Neige', labelEn: 'Snow',
    emoji: '❄️',
    description: 'Le froid est mortel pour les sans-abri. Survivez.',
    descriptionEn: 'The cold kills people on the street. Survive.',
    dailyPenalty: { health: -15, sleep: -20, hunger: -10, dignity: -5 },
    actionModifier: 0.5,
    filter: 'rgba(180, 210, 240, 0.25)',
    filterOpacity: 0.25,
  },
};

// Transitions météo logiques : quelles météos peuvent suivre quelle météo
const WEATHER_TRANSITIONS: Record<WeatherType, { type: WeatherType; weight: number }[]> = {
  sunny:    [{ type: 'sunny', weight: 30 }, { type: 'cloudy', weight: 35 }, { type: 'heatwave', weight: 15 }, { type: 'fog', weight: 10 }, { type: 'rainy', weight: 10 }],
  cloudy:   [{ type: 'cloudy', weight: 20 }, { type: 'sunny', weight: 25 }, { type: 'rainy', weight: 30 }, { type: 'fog', weight: 15 }, { type: 'storm', weight: 10 }],
  rainy:    [{ type: 'rainy', weight: 25 }, { type: 'storm', weight: 20 }, { type: 'cloudy', weight: 35 }, { type: 'fog', weight: 15 }, { type: 'sunny', weight: 5 }],
  storm:    [{ type: 'rainy', weight: 40 }, { type: 'cloudy', weight: 35 }, { type: 'storm', weight: 15 }, { type: 'fog', weight: 10 }],
  heatwave: [{ type: 'heatwave', weight: 35 }, { type: 'sunny', weight: 30 }, { type: 'storm', weight: 20 }, { type: 'cloudy', weight: 15 }],
  fog:      [{ type: 'fog', weight: 20 }, { type: 'cloudy', weight: 35 }, { type: 'rainy', weight: 25 }, { type: 'sunny', weight: 20 }],
  snow:     [{ type: 'snow', weight: 30 }, { type: 'fog', weight: 25 }, { type: 'cloudy', weight: 30 }, { type: 'rainy', weight: 15 }],
};

export function getNextWeather(current: WeatherType): WeatherType {
  const transitions = WEATHER_TRANSITIONS[current];
  const totalWeight = transitions.reduce((sum, t) => sum + t.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const t of transitions) {
    rand -= t.weight;
    if (rand <= 0) return t.type;
  }
  return 'cloudy';
}

export function getInitialWeather(): WeatherType {
  const types: WeatherType[] = ['sunny', 'sunny', 'cloudy', 'cloudy', 'rainy', 'fog'];
  return types[Math.floor(Math.random() * types.length)];
}
