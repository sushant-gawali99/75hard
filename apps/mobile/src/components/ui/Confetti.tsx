import { useEffect, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const PIECE_COLORS = ['#21B96B', '#16C2A6', '#2BC56F', '#E0A33A', '#D9806A', '#7BC86C'];

type PieceSpec = {
  key: number;
  left: number;
  delay: number;
  drift: number;
  spin: number;
  color: string;
  size: number;
  duration: number;
  fall: number;
};

function Piece({ spec }: { spec: PieceSpec }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(spec.delay, withTiming(1, { duration: spec.duration, easing: Easing.in(Easing.quad) }));
  }, [t, spec]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [
      { translateY: t.value * spec.fall },
      { translateX: spec.drift * t.value },
      { rotate: `${spec.spin * t.value}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -30,
          left: spec.left,
          width: spec.size,
          height: spec.size * 0.6,
          borderRadius: 2,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

/** One-shot confetti burst that rains down and fades. Mount it when something is worth celebrating. */
export function Confetti({ count = 70 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo<PieceSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        left: Math.random() * width,
        delay: Math.floor(Math.random() * 700),
        drift: (Math.random() - 0.5) * 180,
        spin: (Math.random() - 0.5) * 800,
        color: PIECE_COLORS[i % PIECE_COLORS.length]!,
        size: 7 + Math.random() * 8,
        duration: 1600 + Math.random() * 1400,
        fall: height + 80,
      })),
    [width, height, count],
  );

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {pieces.map((spec) => (
        <Piece key={spec.key} spec={spec} />
      ))}
    </View>
  );
}
