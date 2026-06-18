import { MaterialIcons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';

import { colors } from '@/theme';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

/** Material icon wrapper (kebab-case names, e.g. "local-fire-department"). */
export function Icon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
