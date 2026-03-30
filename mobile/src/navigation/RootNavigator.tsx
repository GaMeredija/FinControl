import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { strings } from '../content/strings';
import { useApp } from '../context/AppContext';
import { AccountsScreen } from '../screens/app/AccountsScreen';
import { CategoriesScreen } from '../screens/app/CategoriesScreen';
import { GoalsScreen } from '../screens/app/GoalsScreen';
import { OverviewScreen } from '../screens/app/OverviewScreen';
import { ReportsScreen } from '../screens/app/ReportsScreen';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { TransactionsScreen } from '../screens/app/TransactionsScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { palette, radius } from '../theme/tokens';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.canvas,
    card: palette.surface,
    text: palette.text,
    border: palette.line,
    primary: palette.brand,
  },
};

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: palette.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
          height: 72,
          borderRadius: radius.xl,
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 8,
          borderTopWidth: 1,
          borderTopColor: palette.line,
          backgroundColor: palette.surface,
          shadowColor: palette.shadowStrong,
          shadowOpacity: 0.14,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Overview: focused ? 'home' : 'home-outline',
            Accounts: focused ? 'wallet' : 'wallet-outline',
            Transactions: focused ? 'swap-horizontal' : 'swap-horizontal-outline',
            Reports: focused ? 'analytics' : 'analytics-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };

          return <Ionicons name={iconMap[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Overview" component={OverviewScreen} options={{ title: strings.modules.overview }} />
      <Tabs.Screen name="Accounts" component={AccountsScreen} options={{ title: strings.modules.accounts }} />
      <Tabs.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: strings.modules.transactions }}
      />
      <Tabs.Screen name="Reports" component={ReportsScreen} options={{ title: strings.modules.reports }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: strings.modules.settings }} />
    </Tabs.Navigator>
  );
}

function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={palette.brand} />
    </View>
  );
}

export function RootNavigator() {
  const { user, sessionReady } = useApp();

  if (!sessionReady) {
    return <LoadingState />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Goals" component={GoalsScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.canvas,
  },
});
