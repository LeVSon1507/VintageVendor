import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ImageSourcePropType, Image } from 'react-native';
import { Customer } from '../types';
import { getCharacterFrames } from '../game/characters';

export type CustomerWalkerProps = {
  customer: Customer;
  onArrive: (customerId: string) => void;
};

function CustomerWalker(props: CustomerWalkerProps): React.ReactElement {
  const { customer, onArrive } = props;
  const translateX = useRef(new Animated.Value(-120)).current;
  const [frameIndex, setFrameIndex] = useState(0);
  const [isWalking, setIsWalking] = useState(true);
  const walkFrames: ImageSourcePropType[] = useMemo(() => {
    return getCharacterFrames(customer.type).walk;
  }, [customer.type]);
  const idleFrame: ImageSourcePropType = useMemo(() => {
    return getCharacterFrames(customer.type).idle;
  }, [customer.type]);
  const frameTimerRef = useRef<number | null>(null);

  useEffect(function startWalk() {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(function onDone() {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      setIsWalking(false);
      onArrive(customer.id);
    });
    if (frameTimerRef.current) return;
    frameTimerRef.current = setInterval(function tick() {
      setFrameIndex(function next(prev) {
        const total = walkFrames.length || 1;
        return (prev + 1) % total;
      });
    }, 200) as unknown as number;
    return function cleanup() {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
    };
  }, [translateX, customer.id, walkFrames]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.avatarWrap, { transform: [{ translateX }] }] }>
        <Image
          source={isWalking ? (walkFrames[frameIndex] || idleFrame) : idleFrame}
          style={styles.avatarImg}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>Order: {customer.order.items[0]?.name ?? '...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '92%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 12 },
  avatarWrap: { marginRight: 8 },
  avatarImg: { width: 42, height: 42 },
  bubble: { backgroundColor: '#FFF8E1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  bubbleText: { color: '#3B2F2F', fontWeight: '600' },
});

export default CustomerWalker;
