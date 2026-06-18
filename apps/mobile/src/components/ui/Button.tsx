import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, type ViewStyle } from 'react-native';

import { colors, gradient, radius } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'tonal' | 'text';

const tonalBg = '#E4F2DE';
const tonalText = '#2C6B3F';

/** Pill button. `primary` = gradient fill, `tonal` = sage, `text` = muted label. */
export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const fg = variant === 'primary' ? colors.white : variant === 'tonal' ? tonalText : colors.muted;
  const inner = (
    <>
      <AppText variant="itemTitle" color={fg} style={{ fontSize: 15.5 }}>
        {title}
      </AppText>
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
    </>
  );

  const base: ViewStyle = {
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: disabled ? 0.5 : 1,
  };

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={style}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            base,
            {
              shadowColor: colors.gradientEnd,
              shadowOpacity: 0.45,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            },
          ]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[base, { backgroundColor: variant === 'tonal' ? tonalBg : 'transparent' }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{inner}</View>
    </Pressable>
  );
}
