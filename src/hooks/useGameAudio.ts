import { useEffect } from 'react';
import { startAmbient, stopAmbient } from '../audio/soundManager';

export function useGameAudio(musicVolume: number): void {
  useEffect(
    function setupAmbient() {
      startAmbient(musicVolume);
      return function cleanupAmbient() {
        stopAmbient();
      };
    },
    [musicVolume],
  );
}

