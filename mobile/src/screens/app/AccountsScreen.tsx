import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { ChoiceGroup } from '../../components/ChoiceGroup';
import { InlineActionButton } from '../../components/InlineActionButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { TextField } from '../../components/TextField';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { accountTypeLabels } from '../../lib/constants';
import { formatCurrency, getErrorMessage } from '../../lib/format';
import { palette, spacing } from '../../theme/tokens';
import type { Account } from '../../types/api';

const accountTypeOptions: Array<{ label: string; value: Account['type'] }> = [
  { label: accountTypeLabels.checking, value: 'checking' },
  { label: accountTypeLabels.savings, value: 'savings' },
  { label: accountTypeLabels.cash, value: 'cash' },
  { label: accountTypeLabels.credit_card, value: 'credit_card' },
  { label: accountTypeLabels.investment, value: 'investment' },
];

export function AccountsScreen() {
  const { accounts, createAccount, updateAccount, inactivateAccount, busy } = useApp();
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('checking');
  const [initialBalance, setInitialBalance] = useState('');

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return left.isActive ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      }),
    [accounts],
  );

  function resetForm() {
    setEditingAccountId(null);
    setName('');
    setType('checking');
    setInitialBalance('');
  }

  function startEditing(account: Account) {
    setEditingAccountId(account.id);
    setName(account.name);
    setType(account.type);
    setInitialBalance(String(account.initialBalance));
  }

  async function onSubmit() {
    const normalizedName = name.trim();
    const amount = Number(initialBalance.replace(',', '.'));
    const sectionTitle = editingAccountId ? strings.accounts.editTitle : strings.accounts.createTitle;

    if (!normalizedName) {
      Alert.alert(sectionTitle, strings.feedback.fillRequired);
      return;
    }

    if (!Number.isFinite(amount)) {
      Alert.alert(sectionTitle, strings.feedback.positiveAmount);
      return;
    }

    try {
      const message = editingAccountId
        ? await updateAccount(editingAccountId, {
            name: normalizedName,
            type,
            initialBalance: amount,
          })
        : await createAccount({
            name: normalizedName,
            type,
            initialBalance: amount,
          });

      resetForm();
      Alert.alert(sectionTitle, message);
    } catch (error) {
      Alert.alert(sectionTitle, getErrorMessage(error));
    }
  }

  function onInactivate(account: Account) {
    Alert.alert(strings.accounts.deactivateAction, strings.accounts.deactivateConfirm, [
      { text: strings.actions.cancel, style: 'cancel' },
      {
        text: strings.accounts.deactivateAction,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const message = await inactivateAccount(account.id);

              if (editingAccountId === account.id) {
                resetForm();
              }

              Alert.alert(strings.accounts.deactivateAction, message);
            } catch (error) {
              Alert.alert(strings.accounts.deactivateAction, getErrorMessage(error));
            }
          })();
        },
      },
    ]);
  }

  const formTitle = editingAccountId ? strings.accounts.editTitle : strings.accounts.createTitle;
  const actionLabel = busy
    ? strings.actions.saving
    : editingAccountId
      ? strings.accounts.editAction
      : strings.accounts.createAction;

  return (
    <Screen title={strings.accounts.title} subtitle={strings.accounts.subtitle}>
      <SectionBlock title={formTitle} eyebrow={strings.app.name}>
        <View style={styles.form}>
          <TextField
            label={strings.fields.name}
            value={name}
            onChangeText={setName}
            placeholder="Conta principal"
          />
          <ChoiceGroup label={strings.fields.type} value={type} options={accountTypeOptions} onChange={setType} />
          <TextField
            label={strings.fields.initialBalance}
            value={initialBalance}
            onChangeText={setInitialBalance}
            keyboardType="numeric"
            autoCapitalize="none"
            placeholder="0,00"
          />
          <PrimaryButton label={actionLabel} onPress={() => void onSubmit()} disabled={busy} />
          {editingAccountId ? (
            <PrimaryButton
              label={strings.actions.cancel}
              variant="ghost"
              onPress={resetForm}
              disabled={busy}
            />
          ) : null}
        </View>
      </SectionBlock>

      <SectionBlock title={strings.modules.accounts}>
        {!sortedAccounts.length ? (
          <Text style={styles.empty}>{strings.accounts.empty}</Text>
        ) : (
          sortedAccounts.map((account) => (
            <View key={account.id} style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.title}>{account.name}</Text>
                <Text style={styles.meta}>
                  {account.typeLabel ?? accountTypeLabels[account.type]}
                  {!account.isActive ? ` - ${strings.accounts.inactiveBadge}` : ''}
                </Text>
              </View>
              <Text style={styles.value}>
                {formatCurrency(account.currentBalance ?? account.initialBalance)}
              </Text>
              <View style={styles.actions}>
                <InlineActionButton
                  label={strings.actions.edit}
                  variant="brand"
                  onPress={() => startEditing(account)}
                  disabled={busy}
                />
                {account.isActive ? (
                  <InlineActionButton
                    label={strings.accounts.deactivateAction}
                    variant="danger"
                    onPress={() => onInactivate(account)}
                    disabled={busy}
                  />
                ) : null}
              </View>
            </View>
          ))
        )}
      </SectionBlock>
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
});
