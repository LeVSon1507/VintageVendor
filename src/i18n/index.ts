import useGameStore from '../store/gameStore';
import { translations } from './translations';

export function t(key: keyof typeof translations['vi']): string {
  const lang = useGameStore.getState().settings.language;
  return translations[lang][key] ?? key;
}

