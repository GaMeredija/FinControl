import { Alert, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionBlock } from '../../components/SectionBlock';
import { TextField } from '../../components/TextField';
import { strings } from '../../content/strings';
import { useApp } from '../../context/AppContext';
import { getErrorMessage } from '../../lib/format';
import { palette, radius, spacing } from '../../theme/tokens';

export function SettingsScreen() {
  const {
    apiUrl,
    setApiUrl,
    user,
    dataProvider,
    apiStatus,
    checkHealth,
    syncAll,
    logout,
    busy,
  } = useApp();
  const [draftApiUrl, setDraftApiUrl] = useState(apiUrl);

  async function onSaveApiUrl() {
    await setApiUrl(draftApiUrl);
    Alert.alert(strings.settings.connectionSection, strings.settings.apiSaved);
  }

  async function onCheckApi() {
    const ok = await checkHealth();
    Alert.alert(strings.settings.connectionSection, ok ? strings.settings.apiOnline : strings.settings.apiOffline);
  }

  async function onSync() {
    try {
      const message = await syncAll();
      Alert.alert(strings.settings.connectionSection, message);
    } catch (error) {
      Alert.alert(strings.settings.connectionSection, getErrorMessage(error));
    }
  }

  async function onLogout() {
    await logout();
    Alert.alert(strings.modules.settings, strings.auth.logoutSuccess);
  }

  const statusLabel = apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Aguardando';

  return (
    <Screen title={strings.settings.title} subtitle={strings.settings.subtitle}>
      <SectionBlock title={strings.settings.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name ?? 'F').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{user?.name ?? 'Sem sessão ativa'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? 'Faça login para continuar.'}</Text>
          </View>
        </View>
      </SectionBlock>

      <SectionBlock title={strings.settings.connectionSection}>
        <TextField
          label={strings.fields.apiUrl}
          value={draftApiUrl}
          onChangeText={setDraftApiUrl}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="http://localhost:3333"
        />
        <Text style={styles.helper}>{strings.settings.mobileHint}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{strings.settings.provider}</Text>
          <Text style={styles.infoValue}>{dataProvider || strings.settings.providerUnknown}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{strings.settings.apiStatus}</Text>
          <View
            style={[
              styles.statusPill,
              apiStatus === 'online' && styles.statusOnline,
              apiStatus === 'offline' && styles.statusOffline,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                apiStatus === 'online' && styles.statusOnlineText,
                apiStatus === 'offline' && styles.statusOfflineText,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label={strings.actions.save} onPress={() => void onSaveApiUrl()} />
          <PrimaryButton label={strings.settings.checkApi} variant="ghost" onPress={() => void onCheckApi()} />
          <PrimaryButton
            label={busy ? 'Sincronizando...' : strings.settings.sync}
            variant="ghost"
            onPress={() => void onSync()}
            disabled={busy}
          />
          <PrimaryButton label={strings.settings.logout} variant="danger" onPress={() => void onLogout()} />
        </View>
      </SectionBlock>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.brandDeep,
    fontSize: 20,
    fontWeight: '900',
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    color: palette.muted,
    fontSize: 14,
  },
  helper: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    color: palette.muted,
    fontSize: 14,
  },
  infoValue: {
    color: palette.text,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusOnline: {
    backgroundColor: palette.brandSoft,
  },
  statusOffline: {
    backgroundColor: '#fff1f0',
  },
  statusText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '800',
  },
  statusOnlineText: {
    color: palette.brandDeep,
  },
  statusOfflineText: {
    color: palette.danger,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
