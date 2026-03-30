import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { strings } from '../../content/strings';
import { palette, radius, spacing } from '../../theme/tokens';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroBackdrop} />
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{strings.auth.welcomeEyebrow}</Text>
          <Text style={styles.title}>{strings.app.mobileName}</Text>
          <Text style={styles.subtitle}>{strings.auth.welcomeTitle}</Text>
          <Text style={styles.body}>{strings.auth.welcomeBody}</Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Dashboard rápido</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Sincronização com a API</Text>
            </View>
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Pronto para usar</Text>
          <Text style={styles.noteText}>{strings.app.demoHint}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label={strings.auth.accessButton} onPress={() => navigation.navigate('Login')} />
          <PrimaryButton
            label={strings.auth.createAccountButton}
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  heroBackdrop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: palette.brandSoft,
  },
  heroCard: {
    marginTop: spacing.xl,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: palette.shadowStrong,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  eyebrow: {
    color: palette.brand,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: palette.brandDeep,
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 31,
  },
  body: {
    color: palette.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    color: palette.brandDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  note: {
    backgroundColor: palette.brandDeep,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  noteTitle: {
    color: palette.white,
    fontSize: 17,
    fontWeight: '800',
  },
  noteText: {
    color: '#d8ece7',
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
