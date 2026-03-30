import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { getErrorMessage } from '../../lib/format';
import { palette, radius, spacing } from '../../theme/tokens';

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, busy } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit() {
    try {
      const message = await register(name, email, password);
      Alert.alert(strings.auth.registerTitle, message);
    } catch (error) {
      Alert.alert(strings.auth.registerTitle, getErrorMessage(error));
    }
  }

  return (
    <Screen title={strings.auth.registerTitle} subtitle={strings.auth.registerBody}>
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Nova conta FinControl</Text>
          <Text style={styles.panelBody}>Crie seu acesso para acompanhar tudo também pelo celular.</Text>
        </View>
        <View style={styles.form}>
          <TextField label={strings.fields.name} value={name} onChangeText={setName} />
          <TextField
            label={strings.fields.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="voce@email.com"
          />
          <TextField
            label={strings.fields.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <PrimaryButton
            label={busy ? 'Criando...' : strings.auth.createAccountButton}
            onPress={() => void onSubmit()}
            disabled={busy}
          />
        </View>
      </View>
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        {strings.auth.backToAccess}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  panelHeader: {
    gap: spacing.xs,
  },
  panelTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  panelBody: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: spacing.md,
  },
  link: {
    color: palette.brand,
    textAlign: 'center',
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
