import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getDefaultApiUrl() {
  const fromExtra = Constants.expoConfig?.extra?.defaultApiUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return fromExtra.trim();
  }

  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://localhost:3333';
  }

  return 'http://localhost:3333';
}
