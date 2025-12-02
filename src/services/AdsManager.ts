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
  private ri: RewardedInterstitialAd | null = null;

  private rewardedLoaded = false;
  private riLoaded = false;

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
    this.ri = RewardedInterstitialAd.createForAdRequest(AD_UNIT_RI, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.attachListeners(this.rewarded, 'rewarded');
    this.attachListeners(this.ri, 'ri');

    this.loadRewarded();
    this.loadRI();
  }

  private attachListeners(
    ad: RewardedAd | RewardedInterstitialAd,
    kind: 'rewarded' | 'ri',
  ) {
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      log(`[ADS] ${kind} LOADED`);
      if (kind === 'rewarded') this.rewardedLoaded = true;
      else this.riLoaded = true;
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
      if (kind === 'rewarded') {
        this.rewardedLoaded = false;
      } else {
        this.riLoaded = false;
      }
      this.emit('CLOSED', kind);
    });

    ad.addAdEventListener(AdEventType.ERROR, err => {
      log(`[ADS] ${kind} ERROR:`, err);
      if (kind === 'rewarded') this.rewardedLoaded = false;
      else this.riLoaded = false;
      this.emit('ERROR', kind);

      setTimeout(() => {
        if (kind === 'rewarded') this.loadRewarded();
        else this.loadRI();
      }, 30000);
    });
  }

  loadRewarded() {
    if (!this.rewardedLoaded && this.rewarded) {
      log('[ADS] Loading Rewarded...');
      this.rewarded.load();
    }
  }

  loadRI() {
    if (!this.riLoaded && this.ri) {
      log('[ADS] Loading RI...');
      this.ri.load();
    }
  }

  showRewarded(
    type: RewardType,
    onReward?: (type: RewardType) => void,
  ): boolean {
    if (!this.rewardedLoaded || !this.rewarded) {
      this.loadRewarded();
      return false;
    }
    this.pendingRewardType = type;
    this.onRewardCallback = onReward || null;
    try {
      this.rewarded.show();
      return true;
    } catch {
      this.loadRewarded();
      return false;
    }
  }

  showRI(type: RewardType, onReward?: (type: RewardType) => void): boolean {
    if (!this.riLoaded || !this.ri) {
      this.loadRI();
      return false;
    }
    this.pendingRewardType = type;
    this.onRewardCallback = onReward || null;
    try {
      this.ri.show();
      return true;
    } catch {
      this.loadRI();
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
