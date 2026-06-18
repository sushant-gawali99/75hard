import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/theme';

export type WeightPoint = { label: string; kg: number };

/** Weight-over-time line chart: green line + soft area fill + dashed teal goal line. */
export function WeightChart({
  data,
  goalKg,
  width,
  height = 170,
}: {
  data: WeightPoint[];
  goalKg: number;
  width: number;
  height?: number;
}) {
  if (data.length === 0 || width <= 0) return <View style={{ height }} />;

  const pad = 16;
  const values = data.map((d) => d.kg);
  const min = Math.min(...values, goalKg);
  const max = Math.max(...values, goalKg);
  const range = max - min || 1;
  const innerH = height - pad * 2;

  const x = (i: number) => (data.length === 1 ? width / 2 : (i / (data.length - 1)) * width);
  const y = (kg: number) => pad + (1 - (kg - min) / range) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)},${y(d.kg).toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${x(data.length - 1).toFixed(1)},${height} L ${x(0).toFixed(1)},${height} Z`;
  const goalY = y(goalKg);
  const last = data[data.length - 1]!;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.green} stopOpacity={0.28} />
          <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
        </SvgGradient>
      </Defs>
      <Line x1={0} y1={goalY} x2={width} y2={goalY} stroke={colors.gradientEnd} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />
      <Path d={areaPath} fill="url(#wArea)" />
      <Path d={linePath} fill="none" stroke={colors.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={x(data.length - 1)} cy={y(last.kg)} r={5} fill={colors.green} stroke={colors.white} strokeWidth={2} />
    </Svg>
  );
}
