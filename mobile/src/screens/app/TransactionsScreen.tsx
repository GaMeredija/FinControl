import { Alert, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import { ChoiceGroup } from '../../components/ChoiceGroup';
import { InlineActionButton } from '../../components/InlineActionButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { TextField } from '../../components/TextField';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/format';
import { palette, radius, spacing } from '../../theme/tokens';
import type { Transaction } from '../../types/api';

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const kindOptions: Array<{ label: string; value: Transaction['kind'] }> = [
  { label: strings.transactions.expense, value: 'expense' },
  { label: strings.transactions.income, value: 'income' },
];

const filterOptions: Array<{ label: string; value: 'all' | Transaction['kind'] }> = [
  { label: strings.transactions.all, value: 'all' },
  { label: strings.transactions.expense, value: 'expense' },
  { label: strings.transactions.income, value: 'income' },
];

export function TransactionsScreen() {
  const { transactions, categories, accounts, createTransaction, updateTransaction, deleteTransaction, busy } =
    useApp();
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<Transaction['kind']>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(todayDate());
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewKind, setViewKind] = useState<'all' | Transaction['kind']>('all');

  const activeAccounts = useMemo(() => accounts.filter((account) => account.isActive), [accounts]);
  const categoriesForKind = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (viewKind !== 'all' && transaction.kind !== viewKind) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const category = categories.find((item) => item.id === transaction.categoryId);
      const account = accounts.find((item) => item.id === transaction.accountId);
      const haystack = [
        transaction.description,
        category?.name ?? '',
        account?.name ?? '',
        transaction.notes ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [accounts, categories, searchQuery, transactions, viewKind]);

  useEffect(() => {
    if (!activeAccounts.length) {
      setAccountId('');
      return;
    }

    if (!activeAccounts.some((account) => account.id === accountId)) {
      setAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts, accountId]);

  useEffect(() => {
    if (!categoriesForKind.length) {
      setCategoryId('');
      return;
    }

    if (!categoriesForKind.some((category) => category.id === categoryId)) {
      setCategoryId(categoriesForKind[0].id);
    }
  }, [categoriesForKind, categoryId]);

  function resetForm() {
    setEditingTransactionId(null);
    setDescription('');
    setKind('expense');
    setAmount('');
    setTransactionDate(todayDate());
    setNotes('');
  }

  function startEditing(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    setDescription(transaction.description);
    setKind(transaction.kind);
    setAmount(String(transaction.amount));
    setAccountId(transaction.accountId);
    setCategoryId(transaction.categoryId);
    setTransactionDate(transaction.transactionDate.slice(0, 10));
    setNotes(transaction.notes ?? '');
  }

  async function onSubmit() {
    const normalizedDescription = description.trim();
    const numericAmount = Number(amount.replace(',', '.'));
    const sectionTitle = editingTransactionId
      ? strings.transactions.editTitle
      : strings.transactions.createTitle;

    if (!normalizedDescription || !accountId || !categoryId || !transactionDate) {
      Alert.alert(sectionTitle, strings.feedback.fillRequired);
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert(sectionTitle, strings.feedback.positiveAmount);
      return;
    }

    try {
      const payload = {
        description: normalizedDescription,
        kind,
        amount: numericAmount,
        accountId,
        categoryId,
        transactionDate,
        notes: notes.trim(),
      };

      const message = editingTransactionId
        ? await updateTransaction(editingTransactionId, payload)
        : await createTransaction(payload);

      resetForm();
      Alert.alert(sectionTitle, message);
    } catch (error) {
      Alert.alert(sectionTitle, getErrorMessage(error));
    }
  }

  function onDelete(transaction: Transaction) {
    Alert.alert(strings.transactions.deleteAction, strings.transactions.deleteConfirm, [
      { text: strings.actions.cancel, style: 'cancel' },
      {
        text: strings.transactions.deleteAction,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const message = await deleteTransaction(transaction.id);

              if (editingTransactionId === transaction.id) {
                resetForm();
              }

              Alert.alert(strings.transactions.deleteAction, message);
            } catch (error) {
              Alert.alert(strings.transactions.deleteAction, getErrorMessage(error));
            }
          })();
        },
      },
    ]);
  }

  const formTitle = editingTransactionId
    ? strings.transactions.editTitle
    : strings.transactions.createTitle;
  const actionLabel = busy
    ? strings.actions.saving
    : editingTransactionId
      ? strings.transactions.editAction
      : strings.transactions.createAction;

  return (
    <Screen title={strings.transactions.title} subtitle={strings.transactions.subtitle}>
      <SectionBlock title={formTitle} eyebrow={strings.app.name}>
        {!activeAccounts.length || !categoriesForKind.length ? (
          <View style={styles.form}>
            <Text style={styles.empty}>{strings.transactions.dependencyHint}</Text>
            {editingTransactionId ? (
              <PrimaryButton
                label={strings.actions.cancel}
                variant="ghost"
                onPress={resetForm}
                disabled={busy}
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.form}>
            <TextField
              label={strings.fields.description}
              value={description}
              onChangeText={setDescription}
              placeholder="Mercado do mês"
            />
            <ChoiceGroup label={strings.fields.type} value={kind} options={kindOptions} onChange={setKind} />
            <ChoiceGroup
              label={strings.fields.account}
              value={accountId}
              options={activeAccounts.map((account) => ({
                label: account.name,
                value: account.id,
              }))}
              onChange={setAccountId}
            />
            <ChoiceGroup
              label={strings.fields.category}
              value={categoryId}
              options={categoriesForKind.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              onChange={setCategoryId}
            />
            <TextField
              label={strings.fields.amount}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoCapitalize="none"
              placeholder="0,00"
            />
            <TextField
              label={strings.fields.transactionDate}
              value={transactionDate}
              onChangeText={setTransactionDate}
              autoCapitalize="none"
              placeholder="2026-03-30"
            />
            <TextField
              label={strings.fields.notes}
              value={notes}
              onChangeText={setNotes}
              placeholder="Opcional"
            />
            <PrimaryButton label={actionLabel} onPress={() => void onSubmit()} disabled={busy} />
            {editingTransactionId ? (
              <PrimaryButton
                label={strings.actions.cancel}
                variant="ghost"
                onPress={resetForm}
                disabled={busy}
              />
            ) : null}
          </View>
        )}
      </SectionBlock>

      <SectionBlock title={strings.transactions.filtersTitle}>
        <View style={styles.form}>
          <TextField
            label={strings.fields.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={strings.transactions.searchPlaceholder}
          />
          <ChoiceGroup label={strings.fields.type} value={viewKind} options={filterOptions} onChange={setViewKind} />
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryLabel}>{strings.transactions.resultsTitle}</Text>
            <Text style={styles.filterSummaryValue}>{filteredTransactions.length}</Text>
          </View>
        </View>
      </SectionBlock>

      <SectionBlock title={strings.modules.transactions}>
        {!filteredTransactions.length ? (
          <Text style={styles.empty}>{strings.transactions.empty}</Text>
        ) : (
          filteredTransactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.categoryId);
            const account = accounts.find((item) => item.id === transaction.accountId);

            return (
              <View key={transaction.id} style={styles.row}>
                <View style={styles.rowTop}>
                  <View style={styles.kindBadge}>
                    <Text style={styles.kindBadgeText}>
                      {transaction.kind === 'income' ? strings.transactions.income : strings.transactions.expense}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.value,
                      transaction.kind === 'income' ? styles.positive : styles.negative,
                    ]}
                  >
                    {transaction.kind === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
                <View style={styles.main}>
                  <Text style={styles.title}>{transaction.description}</Text>
                  <Text style={styles.meta}>
                    {(category?.name ?? strings.transactions.uncategorized)} -{' '}
                    {(account?.name ?? strings.transactions.unaccounted)} -{' '}
                    {formatDate(transaction.transactionDate)}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <InlineActionButton
                    label={strings.actions.edit}
                    variant="brand"
                    onPress={() => startEditing(transaction)}
                    disabled={busy}
                  />
                  <InlineActionButton
                    label={strings.transactions.deleteAction}
                    variant="danger"
                    onPress={() => onDelete(transaction)}
                    disabled={busy}
                  />
                </View>
              </View>
            );
          })
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
    lineHeight: 21,
  },
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterSummaryLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterSummaryValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  kindBadge: {
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  kindBadgeText: {
    color: palette.brandDeep,
    fontSize: 12,
    fontWeight: '800',
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
    fontWeight: '900',
  },
  positive: {
    color: palette.success,
  },
  negative: {
    color: palette.danger,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
