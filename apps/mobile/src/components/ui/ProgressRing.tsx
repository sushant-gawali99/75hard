import { type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { colors } from '@/theme';

/** Gradient progress ring (green->teal) on a sage track. `progress` is 0..1. */
export function ProgressRing({
  size = 150,
  stroke = 13,
  radius = 64,
  progress,
  children,
}: {
  size?: number;
  stroke?: number;
  radius?: number;
  progress: number;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.gradientStart} />
            <Stop offset="100%" stopColor={colors.gradientEnd} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.track} strokeWidth={stroke} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
