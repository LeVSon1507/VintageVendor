export const APP_ID = 'ca-app-pub-8120607268374699~9558145020';
export const AD_UNIT_REWARDED = 'ca-app-pub-8120607268374699/2421998838';
export const AD_UNIT_RI = 'ca-app-pub-8120607268374699/6880118592';

export type RewardType = 'ENERGY' | 'HINT' | 'DOUBLE_COINS';
export type AdEvent = 'LOADED' | 'EARNED_REWARD' | 'CLOSED';
export type AdKind = 'rewarded' | 'rewarded_interstitial';

type AdEventPayload = {
  kind: AdKind;
  rewardType?: RewardType;
};

class EventBus {
  private listeners: Map<AdEvent, Set<(payload: AdEventPayload) => void>> =
    new Map();

  addListener(
    event: AdEvent,
    handler: (payload: AdEventPayload) => void,
  ): void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler);
    this.listeners.set(event, set);
  }

  removeListener(
    event: AdEvent,
    handler: (payload: AdEventPayload) => void,
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler);
  }

  emit(event: AdEvent, payload: AdEventPayload): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) h(payload);
  }
}

class AdsManager {
  private static singleton: AdsManager | null = null;
  private rewardedLoaded = false;
  private riLoaded = false;
  private events = new EventBus();

  private constructor() {
    void this.loadRewarded();
    void this.loadRI();
  }

  static getInstance(): AdsManager {
    if (!AdsManager.singleton) {
      AdsManager.singleton = new AdsManager();
    }
    return AdsManager.singleton;
  }

  addEventListener(
    event: AdEvent,
    listener: (payload: AdEventPayload) => void,
  ): void {
    this.events.addListener(event, listener);
  }

  removeEventListener(
    event: AdEvent,
    listener: (payload: AdEventPayload) => void,
  ): void {
    this.events.removeListener(event, listener);
  }

  loadRewarded(): Promise<boolean> {
    const self = this;
    return new Promise(function load(resolve) {
      setTimeout(function done() {
        self.rewardedLoaded = true;
        self.events.emit('LOADED', { kind: 'rewarded' });
        resolve(true);
      }, 150);
    });
  }

  showRewarded(
    onReward?: (rewardType: RewardType) => void,
    rewardType?: RewardType,
  ): Promise<boolean> {
    const self = this;
    if (!self.rewardedLoaded) {
      void self.loadRewarded();
      return Promise.resolve(false);
    }
    self.rewardedLoaded = false;
    return new Promise(function show(resolve) {
      setTimeout(function earn() {
        const type: RewardType = rewardType ?? 'HINT';
        self.events.emit('EARNED_REWARD', {
          kind: 'rewarded',
          rewardType: type,
        });
        if (onReward) onReward(type);
        self.events.emit('CLOSED', { kind: 'rewarded', rewardType: type });
        void self.loadRewarded();
        resolve(true);
      }, 3000);
    });
  }

  loadRI(): Promise<boolean> {
    const self = this;
    return new Promise(function load(resolve) {
      setTimeout(function done() {
        self.riLoaded = true;
        self.events.emit('LOADED', { kind: 'rewarded_interstitial' });
        resolve(true);
      }, 150);
    });
  }

  showRI(
    onReward?: (rewardType: RewardType) => void,
    rewardType?: RewardType,
  ): Promise<boolean> {
    const self = this;
    if (!self.riLoaded) {
      void self.loadRI();
      return Promise.resolve(false);
    }
    self.riLoaded = false;
    return new Promise(function show(resolve) {
      setTimeout(function earn() {
        const type: RewardType = rewardType ?? 'DOUBLE_COINS';
        self.events.emit('EARNED_REWARD', {
          kind: 'rewarded_interstitial',
          rewardType: type,
        });
        if (onReward) onReward(type);
        self.events.emit('CLOSED', {
          kind: 'rewarded_interstitial',
          rewardType: type,
        });
        void self.loadRI();
        resolve(true);
      }, 3000);
    });
  }

  showRewardedAd(rewardType: RewardType): Promise<boolean> {
    return this.showRewarded(undefined, rewardType);
  }
}

const Ads = AdsManager.getInstance();
export default Ads;
