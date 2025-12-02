import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-google-mobile-ads', () => {
  const makeAd = () => ({
    addAdEventListener: () => {
      const unsubscribe = () => {};
      return unsubscribe;
    },
    load: () => {},
    show: () => {},
  });
  return {
    MobileAds: () => ({
      initialize: () => Promise.resolve(),
    }),
    RewardedAd: { createForAdRequest: () => makeAd() },
    RewardedInterstitialAd: { createForAdRequest: () => makeAd() },
    AdEventType: { LOADED: 'LOADED', CLOSED: 'CLOSED', ERROR: 'ERROR' },
    RewardedAdEventType: { EARNED_REWARD: 'EARNED_REWARD' },
    TestIds: { REWARDED: 'REWARDED', REWARDED_INTERSTITIAL: 'REWARDED_INTERSTITIAL' },
  };
});
