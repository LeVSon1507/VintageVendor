import Sound from 'react-native-sound';

Sound.setCategory('Ambient', true);

const AUDIO = {
  click: 'chip_lay_1.ogg',
  success: 'chips_handle_5.ogg',
  fail: 'low_down.ogg',
  arrive: 'impact_bell_heavy_000.ogg',
} as const;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function playClip(
  asset: number | string,
  volume: number,
  loop: boolean = false,
) {
  console.log('PLAY ASSET:', asset);

  if (!asset) {
    console.log('ERROR: asset undefined');
    return;
  }

  let clip: Sound;
  if (typeof asset === 'number') {
    clip = new Sound(asset, function onLoad(err) {
      if (err) {
        console.log('LOAD ERROR:', err);
        return;
      }
      clip.setVolume(clamp01(volume));
      if (loop) clip.setNumberOfLoops(-1);
      clip.play(function onEnd(_ok) {
        if (!loop) clip.release();
      });
    });
  } else {
    clip = new Sound(asset, Sound.MAIN_BUNDLE, function onLoad(err) {
      if (err) {
        console.log('LOAD ERROR:', err);
        return;
      }
      clip.setVolume(clamp01(volume));
      if (loop) clip.setNumberOfLoops(-1);
      clip.play(function onEnd(_ok) {
        if (!loop) clip.release();
      });
    });
  }
}

let currentAmbient: Sound | null = null;

export function startAmbient(volume: number): void {
  if (currentAmbient) return;
  const s = new Sound('banh_bao.ogg', Sound.MAIN_BUNDLE, function onLoad(err) {
    if (err) {
      console.log('LOAD ERROR:', err);
      return;
    }
    currentAmbient = s;
    s.setVolume(clamp01(volume));
    s.setNumberOfLoops(-1);
    s.play();
  });
}

export function stopAmbient(): void {
  if (!currentAmbient) return;
  currentAmbient.stop();
  currentAmbient.release();
  currentAmbient = null;
}

export function playVendorArrive(volume: number): void {
  playClip(AUDIO.arrive, volume);
}

export function playServeSuccess(volume: number): void {
  playClip(AUDIO.success, volume);
}

export function playServeFail(volume: number): void {
  playClip(AUDIO.fail, volume);
}

export function playClick(volume: number): void {
  playClip(AUDIO.click, clamp01(volume * 0.4));
}
