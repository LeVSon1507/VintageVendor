import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  ImageSourcePropType,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Customer, OrderItem } from '../types';
import { getCharacterFrames } from '../game/characters';
import { getItemImage } from '../game/assets';

export type CustomerWalkerProps = {
  customer: Customer;
  onArrive: (customerId: string) => void;
  bubbleItem?: OrderItem;
  onAcceptOrder?: (customerId: string) => void;
  reaction?: 'success' | 'fail' | null;
  coinText?: string;
  coinAnim?: Animated.Value;
};

function CustomerWalker(props: CustomerWalkerProps): React.ReactElement {
  const {
    customer,
    onArrive,
    bubbleItem,
    onAcceptOrder,
    reaction,
    coinText,
    coinAnim,
  } = props;
  const translateX = useRef(new Animated.Value(-120)).current;
  const [frameIndex, setFrameIndex] = useState(0);
  const [isWalking, setIsWalking] = useState(true);
  const [showBubble, setShowBubble] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0.85)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const walkFrames: ImageSourcePropType[] = useMemo(() => {
    return getCharacterFrames(customer.type).walk;
  }, [customer.type]);
  const idleFrame: ImageSourcePropType = useMemo(() => {
    return getCharacterFrames(customer.type).idle;
  }, [customer.type]);
  const frameTimerRef = useRef<number | null>(null);
  const frameDelayRef = useRef<number | null>(null);

  useEffect(
    function startWalk() {
      translateX.setValue(-120);
      setIsWalking(true);
      setShowBubble(false);
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      Animated.sequence([
        Animated.delay(220),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(function onDone() {
        if (frameTimerRef.current) {
          clearInterval(frameTimerRef.current);
          frameTimerRef.current = null;
        }
        setIsWalking(false);
        setShowBubble(true);
        Animated.parallel([
          Animated.timing(bubbleScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        onArrive(customer.id);
      });
      if (frameTimerRef.current) return;
      if (frameDelayRef.current) {
        clearTimeout(frameDelayRef.current);
        frameDelayRef.current = null;
      }
      frameDelayRef.current = setTimeout(function delayStart() {
        frameTimerRef.current = setInterval(function tick() {
          setFrameIndex(function next(prev) {
            const total = walkFrames.length || 1;
            return (prev + 1) % total;
          });
        }, 260) as unknown as number;
      }, 220) as unknown as number;
      return function cleanup() {
        if (frameTimerRef.current) {
          clearInterval(frameTimerRef.current);
          frameTimerRef.current = null;
        }
        if (frameDelayRef.current) {
          clearTimeout(frameDelayRef.current);
          frameDelayRef.current = null;
        }
      };
    },
    [translateX, customer.id, walkFrames],
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatarWrap,
          { transform: [{ translateX }], position: 'relative' },
        ]}
      >
        {coinText && coinText !== '' && coinAnim && (
          <Animated.View
            style={[
              styles.coinWrap,
              {
                opacity: coinAnim,
                transform: [
                  {
                    translateY: coinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -24],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.coinText} numberOfLines={1}>
              {coinText}
            </Text>
          </Animated.View>
        )}
        <Image
          source={isWalking ? walkFrames[frameIndex] || idleFrame : idleFrame}
          style={styles.avatarImg}
          resizeMode="contain"
        />
        {reaction && (
          <View style={styles.reactionAbove}>
            <Text
              style={
                reaction === 'success'
                  ? styles.reactionHappy
                  : styles.reactionAngry
              }
            >
              {reaction === 'success' ? '😄' : '🥹'}
            </Text>
          </View>
        )}
      </Animated.View>
      {showBubble && bubbleItem && (
        <Animated.View
          style={[
            styles.bubble,
            { opacity: bubbleOpacity, transform: [{ scale: bubbleScale }] },
          ]}
        >
          <View style={styles.bubbleRow}>
            <Image
              source={getItemImage(bubbleItem.id)}
              style={styles.bubbleIcon}
            />
            <View style={styles.bubbleInfo}>
              <Text style={styles.bubbleTitle}>{bubbleItem.name}</Text>
              <Text style={styles.bubbleSub}>
                {bubbleItem.price}₫ • {bubbleItem.preparationTime}s
              </Text>
              {Array.isArray((bubbleItem as any).requirements) &&
              (bubbleItem as any).requirements.length > 0 ? (
                <View style={styles.bubbleReqRow}>
                  <Text style={styles.bubbleReqLabel}>Yêu cầu:</Text>
                  {(bubbleItem as any).requirements.map((req: string) => (
                    <View key={req} style={styles.bubbleReqPill}>
                      <Text style={styles.bubbleReqText}>{req}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            style={styles.bubbleButton}
            onPress={() => onAcceptOrder && onAcceptOrder(customer.id)}
          >
            <Text style={styles.bubbleButtonText}>Nhận order</Text>
          </TouchableOpacity>
          <View style={styles.bubblePointer} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  avatarWrap: { marginRight: 8 },
  avatarImg: { width: 42, height: 42 },
  reactionAbove: { position: 'absolute', top: -22, left: 0 },
  reactionHappy: { fontSize: 20 },
  reactionAngry: { fontSize: 20 },
  coinWrap: {
    alignSelf: 'center',
    marginBottom: 4,
  },
  coinText: { color: '#8B4513', fontWeight: '700' },
  bubble: {
    backgroundColor: '#FAF8F2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'center' },
  bubbleIcon: { width: 28, height: 28, marginRight: 8 },
  bubbleInfo: { flexDirection: 'column' },
  bubbleTitle: { color: '#3B2F2F', fontWeight: '700' },
  bubbleSub: { color: '#6B5B5B', marginTop: 2 },
  bubbleReqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleReqLabel: { color: '#6B5B5B', marginRight: 6, fontSize: 11 },
  bubbleReqPill: {
    backgroundColor: '#E6D5B8',
    borderRadius: 10,
    paddingVertical: 1,
    paddingHorizontal: 6,
    marginRight: 6,
    marginTop: 2,
  },
  bubbleReqText: { color: '#3B2F2F', fontSize: 11 },
  bubbleButton: {
    backgroundColor: '#8B4513',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  bubbleButtonText: { color: '#FFF8E1', fontWeight: '600' },
  bubblePointer: {
    position: 'absolute',
    left: 20,
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FAF8F2',
  },
});

export default CustomerWalker;
