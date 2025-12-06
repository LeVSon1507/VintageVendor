/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import mobileAds from 'react-native-google-mobile-ads';
import Ads from './src/services/AdsManager';

function App(): React.ReactElement {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(_adapterStatuses => {
        console.log('[App] AdMob SDK Initialized');
        Ads.setup();
      })
      .catch(err => {
        console.error('[App] AdMob Init Error:', err);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
