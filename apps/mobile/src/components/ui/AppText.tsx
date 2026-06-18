import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography, type TypographyToken } from '@/theme';

type Props = TextProps & {
  variant?: TypographyToken;
  color?: string;
};

/** Themed text. `variant` selects a typography token; `color` overrides the colour. */
export function AppText({ variant = 'body', color = colors.ink, style, ...rest }: Props) {
  return <Text {...rest} style={[typography[variant] as TextStyle, { color }, style]} />;
}
