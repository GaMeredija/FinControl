import { Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'brand' | 'ghost' | 'danger';
  disabled?: boolean;
};

export function InlineActionButton({
  label,
  onPress,
  variant = 'ghost',
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'brand' && styles.brand,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        (disabled || pressed) && styles.dimmed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'ghost' && styles.ghostLabel,
          variant === 'brand' && styles.brandLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  brand: {
    backgroundColor: palette.brandSoft,
    borderColor: palette.brand,
  },
  ghost: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
  },
  danger: {
    backgroundColor: '#fff1f0',
    borderColor: palette.danger,
  },
  dimmed: {
    opacity: 0.7,
  },
  label: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  brandLabel: {
    color: palette.brandDeep,
  },
  ghostLabel: {
    color: palette.text,
  },
});
