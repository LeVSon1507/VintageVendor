import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useStallAnimation(): Animated.Value {
  const stallAnim = useRef(new Animated.Value(0)).current;

  useEffect(
    function runLoop() {
      Animated.loop(
        Animated.sequence([
          Animated.timing(stallAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(stallAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    },
    [stallAnim],
  );

  return stallAnim;
}

