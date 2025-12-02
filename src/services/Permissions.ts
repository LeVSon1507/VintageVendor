import { PermissionsAndroid, Platform } from 'react-native';
import { log } from './Logger';

export type PermissionResult = {
  granted: boolean;
  status: 'granted' | 'denied' | 'never_ask_again' | 'unavailable';
};

export async function ensureAudioPermission(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    return { granted: true, status: 'granted' };
  }
  try {
    const has = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (has) {
      log('[PERM] RECORD_AUDIO already granted');
      return { granted: true, status: 'granted' };
    }
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Quyền ghi âm',
        message:
          'Ứng dụng cần quyền ghi âm để xử lý âm thanh đúng cách.',
        buttonPositive: 'Đồng ý',
        buttonNegative: 'Từ chối',
        buttonNeutral: 'Hỏi sau',
      },
    );
    const granted = res === PermissionsAndroid.RESULTS.GRANTED;
    const status:
      | 'granted'
      | 'denied'
      | 'never_ask_again'
      | 'unavailable' = granted
      ? 'granted'
      : res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ? 'never_ask_again'
      : res === PermissionsAndroid.RESULTS.DENIED
      ? 'denied'
      : 'unavailable';
    log('[PERM] RECORD_AUDIO request result:', status);
    return { granted, status };
  } catch (error) {
    log('[PERM] RECORD_AUDIO error:', String(error));
    return { granted: false, status: 'unavailable' };
  }
}
