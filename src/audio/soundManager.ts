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
  ambient_mix: [require('../assets/audio/ambient_mix.mp3')],
  rao_hang_rong: [require('../assets/audio/tieng_rao_ban_hang_rong.ogg')],
  rao_ve_so: [require('../assets/audio/tieng_rao_ban_ve_so_dao_cuc_vui.ogg')],
  rao_banh_bao: [require('../assets/audio/tieng_rao_banh_bao.ogg')],
} as const;

let ambientTimer: number | null = null;

function playClip(fileOrList: any | any[], volume: number): void {
  if (!Sound) return;
  const sources = Array.isArray(fileOrList) ? fileOrList : [fileOrList];
  function tryPlay(index: number): void {
    const src = sources[index];
    if (!src) return;
    const clip = new Sound(src, (error: any) => {
      if (error) {
        tryPlay(index + 1);
        return;
      }
      clip.setVolume(Math.max(0, Math.min(1, volume)));
      clip.play(() => {
        clip.release();
      });
    });
  }
  tryPlay(0);
}

export function startAmbient(volume: number): void {
  if (!Sound) return;
  if (ambientTimer) return;
  function playAmbient(): void {
    playClip(AUDIO.ambient_mix, Math.max(0, Math.min(1, volume * 0.6)));
  }
  playAmbient();
  ambientTimer = setInterval(playAmbient, 71000) as unknown as number;
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
