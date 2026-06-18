import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { colors, ruleIconPalettes, type RuleIconPalette } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

/** A habit/rule row: tappable checkbox + icon chip + name + per-rule streak. */
export function HabitRow({
  name,
  icon,
  palette = 'green',
  streak,
  done,
  onToggle,
  showDivider = true,
}: {
  name: string;
  icon: IconName;
  palette?: RuleIconPalette;
  streak: number;
  done: boolean;
  onToggle?: () => void;
  showDivider?: boolean;
}) {
  const p = ruleIconPalettes[palette];

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 10,
        borderTopWidth: showDivider ? 1 : 0,
        borderTopColor: colors.divider,
      }}
    >
      {/* checkbox (44pt tap target) */}
      <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: -2 }}>
        {done ? (
          <LinearGradient
            colors={p.grad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="check" size={18} color={colors.white} />
          </LinearGradient>
        ) : (
          <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#CFE2C8' }} />
        )}
      </View>

      {/* icon chip */}
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: p.chipBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={21} color={p.icon} />
      </View>

      {/* name */}
      <View style={{ flex: 1 }}>
        <AppText
          variant="itemTitle"
          color={done ? '#9DB2A2' : colors.ink}
          style={done ? { textDecorationLine: 'line-through' } : undefined}
        >
          {name}
        </AppText>
      </View>

      {/* per-rule streak */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingRight: 4 }}>
        <Icon name="local-fire-department" size={17} color={colors.amber} />
        <AppText variant="caption" color={colors.amberText}>
          {String(streak)}
        </AppText>
      </View>
    </Pressable>
  );
}
