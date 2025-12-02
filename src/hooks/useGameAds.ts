import { useEffect, useState, useCallback } from 'react';
import Ads, { RewardType } from '../services/AdsManager';

export type RewardKind = 'HINT' | 'ENERGY' | 'MONEY';

export type UseGameAdsResult = {
  isLoaded: boolean;
  showAd: (type: RewardKind) => void;
  preload: () => void;
  statusText: string;
};

export function useGameAds(
  onReward?: (type: RewardKind) => void,
): UseGameAdsResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [statusText, setStatusText] = useState('Đang tải quảng cáo...');

  // Xử lý sự kiện từ AdsManager
  useEffect(() => {
    const onLoaded = () => {
      setIsLoaded(true);
      setStatusText('Quảng cáo đã sẵn sàng');
    };

    const onClosed = () => {
      setIsLoaded(false);
      setStatusText('Đang tải quảng cáo...');
    };

    const onError = () => {
      setIsLoaded(false);
      setStatusText('Lỗi tải quảng cáo. Đang thử lại...');
    };

    // Đăng ký listeners
    Ads.addEventListener('LOADED', onLoaded);
    Ads.addEventListener('CLOSED', onClosed);
    Ads.addEventListener('ERROR', onError);

    // Check trạng thái ban đầu (trigger load nếu cần)
    Ads.loadRewarded();

    return () => {
      Ads.removeEventListener('LOADED', onLoaded);
      Ads.removeEventListener('CLOSED', onClosed);
      Ads.removeEventListener('ERROR', onError);
    };
  }, []);

  // Hàm show quảng cáo
  const showAd = useCallback(
    (kind: RewardKind) => {
      // Map RewardKind của game sang RewardType của AdMob
      let adType: RewardType = 'HINT';
      if (kind === 'ENERGY') adType = 'ENERGY';
      else if (kind === 'MONEY') adType = 'DOUBLE_COINS';

      const success = Ads.showRewarded(adType, type => {
        // Callback khi xem xong
        if (onReward) {
          // Map ngược lại để trả về cho UI
          const gameKind: RewardKind =
            type === 'DOUBLE_COINS' ? 'MONEY' : (type as RewardKind);
          onReward(gameKind);
        }
      });

      if (!success) {
        setStatusText('Quảng cáo chưa sẵn sàng. Vui lòng đợi.');
      }
    },
    [onReward],
  );

  const preload = useCallback(() => {
    setStatusText('Đang tải quảng cáo...');
    Ads.loadRewarded();
  }, []);

  return { isLoaded, showAd, preload, statusText };
}
