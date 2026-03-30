import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/format';
import { palette, radius, spacing } from '../../theme/tokens';

export function ReportsScreen() {
  const { reports } = useApp();
  const summary = reports.summary;
  const maxCategoryValue = Math.max(...reports.categoryExpenses.map((item) => item.value), 1);
  const maxMonthlyNet = Math.max(...reports.monthlySeries.map((item) => Math.abs(item.net)), 1);

  return (
    <Screen title={strings.reports.title} subtitle={strings.reports.subtitle}>
      {!summary ? (
        <SectionBlock title={strings.modules.reports}>
          <Text style={styles.empty}>{strings.reports.empty}</Text>
        </SectionBlock>
      ) : (
        <>
          <View style={styles.metricGrid}>
            <MetricCard label={strings.overview.totalBalance} value={formatCurrency(summary.totalBalance)} />
            <MetricCard label={strings.overview.income} value={formatCurrency(summary.income)} />
            <MetricCard label={strings.overview.expense} value={formatCurrency(summary.expense)} />
            <MetricCard label={strings.overview.net} value={formatCurrency(summary.net)} />
          </View>

          <SectionBlock title={strings.reports.categoryDistribution}>
            {!reports.categoryExpenses.length ? (
              <Text style={styles.empty}>{strings.reports.empty}</Text>
            ) : (
              reports.categoryExpenses.map((item) => (
                <View key={item.id} style={styles.chartRow}>
                  <View style={styles.chartLabelRow}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.chartLabel}>{item.name}</Text>
                  </View>
                  <View style={styles.chartBarTrack}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          width: `${Math.max(10, (item.value / maxCategoryValue) * 100)}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartValue}>{formatCurrency(item.value)}</Text>
                </View>
              ))
            )}
          </SectionBlock>

          <SectionBlock title={strings.reports.monthlyHistory}>
            {!reports.monthlySeries.length ? (
              <Text style={styles.empty}>{strings.reports.empty}</Text>
            ) : (
              reports.monthlySeries.map((item) => (
                <View key={item.label} style={styles.historyRow}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyLabel}>{item.label}</Text>
                    <Text style={styles.historyValue}>{formatCurrency(item.net)}</Text>
                  </View>
                  <View style={styles.historyTrack}>
                    <View
                      style={[
                        styles.historyFill,
                        {
                          width: `${Math.max(8, (Math.abs(item.net) / maxMonthlyNet) * 100)}%`,
                          backgroundColor: item.net >= 0 ? palette.success : palette.danger,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </SectionBlock>
        </>
      )}

      <SectionBlock title={strings.reports.notesTitle}>
        <Text style={styles.empty}>{strings.reports.pdfHint}</Text>
      </SectionBlock>
    </Screen>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '48%',
    minHeight: 108,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    justifyContent: 'space-between',
    shadowColor: palette.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  empty: {
    color: palette.muted,
    lineHeight: 21,
  },
  chartRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  chartLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chartLabel: {
    color: palette.text,
    fontWeight: '700',
  },
  chartBarTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  chartValue: {
    color: palette.text,
    fontWeight: '800',
  },
  historyRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  historyLabel: {
    color: palette.text,
    fontWeight: '700',
  },
  historyValue: {
    color: palette.text,
    fontWeight: '800',
  },
  historyTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceMuted,
    overflow: 'hidden',
  },
  historyFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
