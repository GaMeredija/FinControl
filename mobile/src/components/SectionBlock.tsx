import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing } from '../theme/tokens';

type Props = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function SectionBlock({ title, eyebrow, children }: Props) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.divider} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  header: {
    gap: spacing.sm,
  },
  headerText: {
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: palette.line,
  },
  eyebrow: {
    color: palette.brand,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: palette.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
