import Sound from 'react-native-sound';
import { log } from '../services/Logger';

Sound.setCategory('Ambient', true);

const AUDIO = {
  ambient_mix: require('../assets/audio/ambient_mix.mp3'),
} as const;
console.log('AUDIO MIX:', AUDIO.ambient_mix);

let ambientTimer: ReturnType<typeof setInterval> | null = null;
let currentAmbient: Sound | null = null;

function playClip(asset: number, volume: number, loop: boolean = false) {
  console.log('PLAY ASSET:', asset);

  if (!asset) {
    console.log('ERROR: asset undefined');
    return;
  }

  const s = new Sound(asset, err => {
    if (err) {
      console.log('LOAD ERROR:', err);
      return;
    }

    s.setVolume(volume);

    if (loop) s.setNumberOfLoops(-1);

    s.play(ok => {
      if (!loop) s.release();
    });
  });
}

const AMBIENT_INTERVAL_MS = 71000;

export function startAmbient(volume: number): void {
  if (ambientTimer) return;

  const playAmbientLoop = () => {
    if (currentAmbient) {
      currentAmbient.stop();
      currentAmbient.release();
      currentAmbient = null;
    }

    playClip(AUDIO.ambient_mix, Math.max(0, Math.min(1, volume * 0.5)), false);
  };

  playAmbientLoop();

  ambientTimer = setInterval(playAmbientLoop, AMBIENT_INTERVAL_MS);
}

export function stopAmbient(): void {
  if (ambientTimer) {
    clearInterval(ambientTimer);
    ambientTimer = null;
  }
  if (currentAmbient) {
    currentAmbient.stop();
    currentAmbient.release();
    currentAmbient = null;
  }
}

export function playVendorArrive(volume: number): void {
  playClip(AUDIO.ambient_mix, volume);
}

export function playServeSuccess(volume: number): void {
  playClip(AUDIO.ambient_mix, volume);
}

export function playServeFail(volume: number): void {
  playClip(AUDIO.ambient_mix, volume);
}

export function playClick(volume: number): void {
  playClip(AUDIO.ambient_mix, Math.max(0, Math.min(1, volume * 0.4)));
}
