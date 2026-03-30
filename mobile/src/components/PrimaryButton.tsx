import { Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        (disabled || pressed) && styles.dimmed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'ghost' && styles.ghostLabel,
          variant === 'danger' && styles.dangerLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: palette.brand,
    borderColor: palette.brand,
    shadowColor: palette.brandDeep,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  ghost: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
  },
  danger: {
    backgroundColor: '#fff1f0',
    borderColor: '#f0b7b1',
  },
  dimmed: {
    opacity: 0.7,
  },
  label: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  ghostLabel: {
    color: palette.text,
  },
  dangerLabel: {
    color: palette.danger,
  },
});
