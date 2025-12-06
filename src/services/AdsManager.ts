import {
  RewardedAd,
  RewardedInterstitialAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { log } from './Logger';

export type RewardType = 'ENERGY' | 'HINT' | 'DOUBLE_COINS';
export type AdEvent = 'LOADED' | 'EARNED_REWARD' | 'CLOSED' | 'ERROR';

const AD_UNIT_REWARDED = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-8120607268374699/2421998838';
const AD_UNIT_RI = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : 'ca-app-pub-8120607268374699/6880118592';

class AdsManager {
  private static instance: AdsManager;
  private listeners = new Map<AdEvent, Set<(data?: any) => void>>();

  private rewarded: RewardedAd | null = null;
  private rewarded2: RewardedAd | null = null;
  private ri: RewardedInterstitialAd | null = null;
  private ri2: RewardedInterstitialAd | null = null;

  private rewardedLoaded = false;
  private rewarded2Loaded = false;
  private riLoaded = false;
  private ri2Loaded = false;

  private onRewardCallback: ((type: RewardType) => void) | null = null;
  private pendingRewardType: RewardType = 'HINT';

  private constructor() {}

  static getInstance(): AdsManager {
    if (!AdsManager.instance) AdsManager.instance = new AdsManager();
    return AdsManager.instance;
  }

  setup() {
    log('[ADS] Setup AdsManager...');

    this.rewarded = RewardedAd.createForAdRequest(AD_UNIT_REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.rewarded2 = RewardedAd.createForAdRequest(AD_UNIT_REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.ri = RewardedInterstitialAd.createForAdRequest(AD_UNIT_RI, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.ri2 = RewardedInterstitialAd.createForAdRequest(AD_UNIT_RI, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.attachListeners(this.rewarded, 'rewarded');
    this.attachListeners(this.rewarded2, 'rewarded2');
    this.attachListeners(this.ri, 'ri');
    this.attachListeners(this.ri2, 'ri2');

    this.loadRewarded();
    this.loadRewarded2();
    this.loadRI();
    this.loadRI2();
  }

  hasReadyAd(): boolean {
    return (
      this.rewardedLoaded ||
      this.rewarded2Loaded ||
      this.riLoaded ||
      this.ri2Loaded
    );
  }

  getReadyKind(): 'rewarded' | 'ri' | null {
    if (this.rewardedLoaded || this.rewarded2Loaded) return 'rewarded';
    if (this.riLoaded || this.ri2Loaded) return 'ri';
    return null;
  }

  private attachListeners(
    ad: RewardedAd | RewardedInterstitialAd,
    kind: 'rewarded' | 'rewarded2' | 'ri' | 'ri2',
  ) {
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      log(`[ADS] ${kind} LOADED`);
      if (kind === 'rewarded') this.rewardedLoaded = true;
      else if (kind === 'rewarded2') this.rewarded2Loaded = true;
      else if (kind === 'ri') this.riLoaded = true;
      else this.ri2Loaded = true;
      this.emit('LOADED', kind);
    });

    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      log(`[ADS] ${kind} EARNED REWARD:`, this.pendingRewardType);
      this.onRewardCallback?.(this.pendingRewardType);
      this.emit('EARNED_REWARD', this.pendingRewardType);

      this.onRewardCallback = null;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      log(`[ADS] ${kind} CLOSED`);
      if (kind === 'rewarded') this.rewardedLoaded = false;
      else if (kind === 'rewarded2') this.rewarded2Loaded = false;
      else if (kind === 'ri') this.riLoaded = false;
      else this.ri2Loaded = false;
      this.emit('CLOSED', kind);

      setTimeout(() => {
        if (kind === 'rewarded') this.loadRewarded();
        else if (kind === 'rewarded2') this.loadRewarded2();
        else if (kind === 'ri') this.loadRI();
        else this.loadRI2();
      }, 300);
    });

    ad.addAdEventListener(AdEventType.ERROR, err => {
      log(`[ADS] ${kind} ERROR:`, err);
      if (kind === 'rewarded') this.rewardedLoaded = false;
      else if (kind === 'rewarded2') this.rewarded2Loaded = false;
      else if (kind === 'ri') this.riLoaded = false;
      else this.ri2Loaded = false;
      this.emit('ERROR', kind);

      setTimeout(() => {
        if (kind === 'rewarded') this.loadRewarded();
        else if (kind === 'rewarded2') this.loadRewarded2();
        else if (kind === 'ri') this.loadRI();
        else this.loadRI2();
      }, 5000);
    });
  }

  loadRewarded() {
    if (!this.rewardedLoaded && this.rewarded) {
      log('[ADS] Loading Rewarded...');
      this.rewarded.load();
    }
  }

  loadRewarded2() {
    if (!this.rewarded2Loaded && this.rewarded2) {
      log('[ADS] Loading Rewarded (spare)...');
      this.rewarded2.load();
    }
  }

  loadRI() {
    if (!this.riLoaded && this.ri) {
      log('[ADS] Loading RI...');
      this.ri.load();
    }
  }

  loadRI2() {
    if (!this.ri2Loaded && this.ri2) {
      log('[ADS] Loading RI (spare)...');
      this.ri2.load();
    }
  }

  showRewarded(
    type: RewardType,
    onReward?: (type: RewardType) => void,
  ): boolean {
    // chọn slot đã sẵn sàng
    let target: RewardedAd | null = null;
    if (this.rewardedLoaded && this.rewarded) target = this.rewarded;
    else if (this.rewarded2Loaded && this.rewarded2) target = this.rewarded2;
    if (!target) {
      this.loadRewarded();
      this.loadRewarded2();
      return false;
    }
    this.pendingRewardType = type;
    this.onRewardCallback = onReward || null;
    try {
      target.show();
      // đảm bảo slot còn lại tải sẵn trong lúc xem
      this.loadRewarded();
      this.loadRewarded2();
      return true;
    } catch {
      this.loadRewarded();
      this.loadRewarded2();
      return false;
    }
  }

  showRI(type: RewardType, onReward?: (type: RewardType) => void): boolean {
    let target: RewardedInterstitialAd | null = null;
    if (this.riLoaded && this.ri) target = this.ri;
    else if (this.ri2Loaded && this.ri2) target = this.ri2;
    if (!target) {
      this.loadRI();
      this.loadRI2();
      return false;
    }
    this.pendingRewardType = type;
    this.onRewardCallback = onReward || null;
    try {
      target.show();
      this.loadRI();
      this.loadRI2();
      return true;
    } catch {
      this.loadRI();
      this.loadRI2();
      return false;
    }
  }

  addEventListener(event: AdEvent, handler: (data?: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
  }

  removeEventListener(event: AdEvent, handler: (data?: any) => void) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: AdEvent, data?: any) {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }
}

export default AdsManager.getInstance();
