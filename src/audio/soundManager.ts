let Sound: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sound = require('react-native-sound');
  if (Sound && Sound.setCategory) {
    Sound.setCategory('Ambient', true);
  }
} catch (e) {
  Sound = null;
}

const AUDIO = {
  rao_hang_rong: require('../assets/audio/tieng_rao_ban_hang_rong.mp3'),
  rao_ve_so: require('../assets/audio/tieng_rao_ban_ve_so_dao_cuc_vui.mp3'),
  rao_banh_bao: require('../assets/audio/tieng_rao_banh_bao.mp3'),
} as const;

let ambientTimer: number | null = null;

function playClip(file: any, volume: number): void {
  if (!Sound) return;
  const clip = new Sound(file, (error: any) => {
    if (error) {
      return;
    }
    clip.setVolume(Math.max(0, Math.min(1, volume)));
    clip.play(() => {
      clip.release();
    });
  });
}

export function startAmbient(volume: number): void {
  if (!Sound) return;
  if (ambientTimer) return;
  function tick(): void {
    const keys = Object.keys(AUDIO) as Array<keyof typeof AUDIO>;
    const index = Math.floor(Math.random() * keys.length);
    const key = keys[index];
    playClip(AUDIO[key], volume);
  }
  tick();
  ambientTimer = setInterval(tick, 25000) as unknown as number;
}

export function stopAmbient(): void {
  if (ambientTimer) {
    clearInterval(ambientTimer);
    ambientTimer = null;
  }
}

export function playVendorArrive(volume: number): void {
  playClip(AUDIO.rao_hang_rong, volume);
}

export function playServeSuccess(volume: number): void {
  playClip(AUDIO.rao_banh_bao, volume);
}

export function playServeFail(volume: number): void {
  playClip(AUDIO.rao_ve_so, volume);
}

export function playClick(volume: number): void {
  playClip(AUDIO.rao_banh_bao, Math.max(0, Math.min(1, volume * 0.4)));
}
