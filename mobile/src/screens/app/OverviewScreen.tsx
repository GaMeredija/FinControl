import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { palette, radius, spacing } from '../../theme/tokens';

export function OverviewScreen() {
  const navigation = useNavigation<any>();
  const { user, reports } = useApp();
  const summary = reports.summary;
  const goal = summary?.goalSnapshot;

  const metrics = [
    { label: strings.overview.totalBalance, value: formatCurrency(summary?.totalBalance ?? 0) },
    { label: strings.overview.income, value: formatCurrency(summary?.income ?? 0) },
    { label: strings.overview.expense, value: formatCurrency(summary?.expense ?? 0) },
    { label: strings.overview.net, value: formatCurrency(summary?.net ?? 0) },
  ];

  return (
    <Screen
      title={strings.modules.overview}
      subtitle={user ? `Olá, ${user.name}. ${strings.overview.subtitle}` : strings.overview.subtitle}
    >
      <View style={styles.hero}>
        <View style={styles.heroMain}>
          <Text style={styles.heroEyebrow}>{strings.app.mobileName}</Text>
          <Text style={styles.heroValue}>{formatCurrency(summary?.totalBalance ?? 0)}</Text>
          <Text style={styles.heroLabel}>{strings.overview.totalBalance}</Text>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroSide}>
          <Text style={styles.heroSideValue}>{summary?.activeAccountsCount ?? 0}</Text>
          <Text style={styles.heroSideLabel}>Contas ativas</Text>
          <Text style={styles.heroSideMeta}>
            Saldo do mês: {formatCurrency(summary?.net ?? 0)}
          </Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        {metrics.slice(1).map((item) => (
          <View key={item.label} style={styles.metricBox}>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={styles.metricValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <SectionBlock title={strings.overview.quickAccess} eyebrow={strings.app.name}>
        <View style={styles.quickAccess}>
          <QuickLink label={strings.modules.accounts} onPress={() => navigation.navigate('Accounts')} />
          <QuickLink label={strings.modules.transactions} onPress={() => navigation.navigate('Transactions')} />
          <QuickLink label={strings.modules.categories} onPress={() => navigation.navigate('Categories')} />
          <QuickLink label={strings.modules.goals} onPress={() => navigation.navigate('Goals')} />
          <QuickLink label={strings.modules.reports} onPress={() => navigation.navigate('Reports')} />
          <QuickLink label={strings.modules.settings} onPress={() => navigation.navigate('Settings')} />
        </View>
      </SectionBlock>

      <SectionBlock title={strings.modules.goals}>
        {goal ? (
          <View style={styles.goalBox}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalLine}>{goal.label}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      8,
                      Math.min(100, (goal.currentValue / Math.max(goal.targetAmount, 1)) * 100),
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.goalLine}>
              {formatCurrency(goal.currentValue)} de {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>{strings.overview.emptyGoal}</Text>
        )}
      </SectionBlock>

      <SectionBlock title={strings.overview.recentTransactions}>
        {!reports.recentTransactions.length ? (
          <Text style={styles.emptyText}>{strings.overview.emptyTransactions}</Text>
        ) : (
          reports.recentTransactions.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowTag}>
                <Text style={styles.rowTagText}>{item.kind === 'income' ? '+' : '-'}</Text>
              </View>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{item.description}</Text>
                <Text style={styles.rowMeta}>
                  {item.categoryName ?? 'Sem categoria'} • {formatDateTime(item.createdAt)}
                </Text>
              </View>
              <Text style={[styles.amount, item.kind === 'income' ? styles.positive : styles.negative]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))
        )}
      </SectionBlock>
    </Screen>
  );
}

function QuickLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.quickItem, pressed && styles.quickItemPressed]} onPress={onPress}>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: palette.brandDeep,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: palette.shadowStrong,
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  heroMain: {
    gap: spacing.xs,
  },
  heroEyebrow: {
    color: '#bfe1db',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroValue: {
    color: palette.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  heroLabel: {
    color: '#d8ece7',
    fontSize: 14,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroSide: {
    gap: spacing.xxs,
  },
  heroSideValue: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '800',
  },
  heroSideLabel: {
    color: '#d8ece7',
    fontSize: 13,
  },
  heroSideMeta: {
    color: '#a8d0ca',
    fontSize: 13,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricBox: {
    width: '48%',
    minHeight: 110,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    justifyContent: 'space-between',
    shadowColor: palette.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '900',
  },
  quickAccess: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickItem: {
    minWidth: '48%',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.line,
  },
  quickItemPressed: {
    opacity: 0.84,
  },
  quickLabel: {
    color: palette.text,
    fontWeight: '700',
  },
  goalBox: {
    gap: spacing.sm,
  },
  goalTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  goalLine: {
    color: palette.muted,
    fontSize: 14,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.brand,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  rowTag: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTagText: {
    color: palette.brandDeep,
    fontWeight: '800',
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    color: palette.muted,
    fontSize: 13,
  },
  amount: {
    fontWeight: '800',
  },
  positive: {
    color: palette.success,
  },
  negative: {
    color: palette.danger,
  },
});
