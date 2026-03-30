import { Alert, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { ChoiceGroup } from '../../components/ChoiceGroup';
import { InlineActionButton } from '../../components/InlineActionButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { TextField } from '../../components/TextField';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { goalModeLabels } from '../../lib/constants';
import { formatCurrency, getErrorMessage } from '../../lib/format';
import { palette, spacing } from '../../theme/tokens';
import type { Goal } from '../../types/api';

const modeOptions: Array<{ label: string; value: Goal['mode'] }> = [
  { label: strings.goals.saving, value: 'saving' },
  { label: strings.goals.limit, value: 'limit' },
];

export function GoalsScreen() {
  const { goals, reports, createGoal, updateGoal, deleteGoal, busy } = useApp();
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<Goal['mode']>('saving');
  const [targetAmount, setTargetAmount] = useState('');
  const snapshot = reports.summary?.goalSnapshot;

  function resetForm() {
    setEditingGoalId(null);
    setTitle('');
    setMode('saving');
    setTargetAmount('');
  }

  function startEditing(goal: Goal) {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setMode(goal.mode);
    setTargetAmount(String(goal.targetAmount));
  }

  async function onSubmit() {
    const normalizedTitle = title.trim();
    const amount = Number(targetAmount.replace(',', '.'));
    const sectionTitle = editingGoalId ? strings.goals.editTitle : strings.goals.createTitle;

    if (!normalizedTitle) {
      Alert.alert(sectionTitle, strings.feedback.fillRequired);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(sectionTitle, strings.feedback.positiveAmount);
      return;
    }

    try {
      const message = editingGoalId
        ? await updateGoal(editingGoalId, {
            title: normalizedTitle,
            mode,
            targetAmount: amount,
          })
        : await createGoal({
            title: normalizedTitle,
            mode,
            targetAmount: amount,
          });

      resetForm();
      Alert.alert(sectionTitle, message);
    } catch (error) {
      Alert.alert(sectionTitle, getErrorMessage(error));
    }
  }

  function onDelete(goal: Goal) {
    Alert.alert(strings.goals.deleteAction, strings.goals.deleteConfirm, [
      { text: strings.actions.cancel, style: 'cancel' },
      {
        text: strings.goals.deleteAction,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const message = await deleteGoal(goal.id);

              if (editingGoalId === goal.id) {
                resetForm();
              }

              Alert.alert(strings.goals.deleteAction, message);
            } catch (error) {
              Alert.alert(strings.goals.deleteAction, getErrorMessage(error));
            }
          })();
        },
      },
    ]);
  }

  const formTitle = editingGoalId ? strings.goals.editTitle : strings.goals.createTitle;
  const actionLabel = busy
    ? strings.actions.saving
    : editingGoalId
      ? strings.goals.editAction
      : strings.goals.createAction;

  return (
    <Screen title={strings.goals.title} subtitle={strings.goals.subtitle}>
      <SectionBlock title={formTitle} eyebrow={strings.app.name}>
        <View style={styles.form}>
          <TextField
            label={strings.fields.title}
            value={title}
            onChangeText={setTitle}
            placeholder="Reserva de emergência"
          />
          <ChoiceGroup label={strings.fields.type} value={mode} options={modeOptions} onChange={setMode} />
          <TextField
            label={strings.fields.targetAmount}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            autoCapitalize="none"
            placeholder="1000,00"
          />
          <PrimaryButton label={actionLabel} onPress={() => void onSubmit()} disabled={busy} />
          {editingGoalId ? (
            <PrimaryButton
              label={strings.actions.cancel}
              variant="ghost"
              onPress={resetForm}
              disabled={busy}
            />
          ) : null}
        </View>
      </SectionBlock>

      <SectionBlock title={strings.modules.goals}>
        {!goals.length ? (
          <Text style={styles.empty}>{strings.goals.empty}</Text>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.title}>{goal.title}</Text>
                <Text style={styles.meta}>{goalModeLabels[goal.mode]}</Text>
              </View>
              <Text style={styles.value}>{formatCurrency(goal.targetAmount)}</Text>
              <View style={styles.actions}>
                <InlineActionButton
                  label={strings.actions.edit}
                  variant="brand"
                  onPress={() => startEditing(goal)}
                  disabled={busy}
                />
                <InlineActionButton
                  label={strings.goals.deleteAction}
                  variant="danger"
                  onPress={() => onDelete(goal)}
                  disabled={busy}
                />
              </View>
            </View>
          ))
        )}
      </SectionBlock>

      {snapshot ? (
        <SectionBlock title={strings.goals.snapshotTitle}>
          <Text style={styles.snapshotTitle}>{snapshot.title}</Text>
          <Text style={styles.snapshotLine}>{snapshot.label}</Text>
          <Text style={styles.snapshotLine}>
            {formatCurrency(snapshot.currentValue)} de {formatCurrency(snapshot.targetAmount)}
          </Text>
        </SectionBlock>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  empty: {
    color: palette.muted,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  main: {
    gap: 4,
  },
  title: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: palette.muted,
    fontSize: 13,
  },
  value: {
    color: palette.text,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  snapshotTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  snapshotLine: {
    color: palette.muted,
    fontSize: 14,
  },
});
