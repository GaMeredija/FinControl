import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { ChoiceGroup } from '../../components/ChoiceGroup';
import { InlineActionButton } from '../../components/InlineActionButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { TextField } from '../../components/TextField';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { getErrorMessage } from '../../lib/format';
import { palette, spacing } from '../../theme/tokens';
import type { Category } from '../../types/api';

const colorPresets = ['#0b6b5f', '#c56b2d', '#2563eb', '#9333ea', '#b42318', '#127c52'];

const kindOptions: Array<{ label: string; value: Category['kind'] }> = [
  { label: strings.transactions.income, value: 'income' },
  { label: strings.transactions.expense, value: 'expense' },
];

export function CategoriesScreen() {
  const { categories, createCategory, updateCategory, deleteCategory, busy } = useApp();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Category['kind']>('expense');
  const [color, setColor] = useState('#0b6b5f');

  const sortedCategories = useMemo(
    () => [...categories].sort((left, right) => left.name.localeCompare(right.name)),
    [categories],
  );

  function resetForm() {
    setEditingCategoryId(null);
    setName('');
    setKind('expense');
    setColor('#0b6b5f');
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category.id);
    setName(category.name);
    setKind(category.kind);
    setColor(category.color);
  }

  async function onSubmit() {
    const normalizedName = name.trim();
    const sectionTitle = editingCategoryId
      ? strings.categories.editTitle
      : strings.categories.createTitle;

    if (!normalizedName || !color.trim()) {
      Alert.alert(sectionTitle, strings.feedback.fillRequired);
      return;
    }

    try {
      const message = editingCategoryId
        ? await updateCategory(editingCategoryId, {
            name: normalizedName,
            kind,
            color,
          })
        : await createCategory({
            name: normalizedName,
            kind,
            color,
          });

      resetForm();
      Alert.alert(sectionTitle, message);
    } catch (error) {
      Alert.alert(sectionTitle, getErrorMessage(error));
    }
  }

  function onDelete(category: Category) {
    Alert.alert(strings.categories.deleteAction, strings.categories.deleteConfirm, [
      { text: strings.actions.cancel, style: 'cancel' },
      {
        text: strings.categories.deleteAction,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const message = await deleteCategory(category.id);

              if (editingCategoryId === category.id) {
                resetForm();
              }

              Alert.alert(strings.categories.deleteAction, message);
            } catch (error) {
              Alert.alert(strings.categories.deleteAction, getErrorMessage(error));
            }
          })();
        },
      },
    ]);
  }

  const formTitle = editingCategoryId ? strings.categories.editTitle : strings.categories.createTitle;
  const actionLabel = busy
    ? strings.actions.saving
    : editingCategoryId
      ? strings.categories.editAction
      : strings.categories.createAction;

  return (
    <Screen title={strings.categories.title} subtitle={strings.categories.subtitle}>
      <SectionBlock title={formTitle} eyebrow={strings.app.name}>
        <View style={styles.form}>
          <TextField
            label={strings.fields.name}
            value={name}
            onChangeText={setName}
            placeholder="Alimentação"
          />
          <ChoiceGroup label={strings.fields.type} value={kind} options={kindOptions} onChange={setKind} />
          <TextField
            label={strings.fields.color}
            value={color}
            onChangeText={setColor}
            autoCapitalize="none"
            placeholder="#0b6b5f"
          />
          <View style={styles.colors}>
            {colorPresets.map((item) => {
              const selected = item === color;
              return (
                <Pressable
                  key={item}
                  onPress={() => setColor(item)}
                  style={[styles.colorChip, { backgroundColor: item }, selected && styles.colorChipSelected]}
                />
              );
            })}
          </View>
          <PrimaryButton label={actionLabel} onPress={() => void onSubmit()} disabled={busy} />
          {editingCategoryId ? (
            <PrimaryButton
              label={strings.actions.cancel}
              variant="ghost"
              onPress={resetForm}
              disabled={busy}
            />
          ) : null}
        </View>
      </SectionBlock>

      <SectionBlock title={strings.modules.categories}>
        {!sortedCategories.length ? (
          <Text style={styles.empty}>{strings.categories.empty}</Text>
        ) : (
          sortedCategories.map((category) => (
            <View key={category.id} style={styles.row}>
              <View style={styles.left}>
                <View style={[styles.dot, { backgroundColor: category.color }]} />
                <View style={styles.main}>
                  <Text style={styles.title}>{category.name}</Text>
                  <Text style={styles.meta}>
                    {category.kind === 'income' ? strings.transactions.income : strings.transactions.expense}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <InlineActionButton
                  label={strings.actions.edit}
                  variant="brand"
                  onPress={() => startEditing(category)}
                  disabled={busy}
                />
                <InlineActionButton
                  label={strings.categories.deleteAction}
                  variant="danger"
                  onPress={() => onDelete(category)}
                  disabled={busy}
                />
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
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipSelected: {
    borderColor: palette.text,
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  main: {
    flex: 1,
    gap: 4,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
