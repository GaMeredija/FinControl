import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  apiUrl: 'fincontrol.mobile.apiUrl',
  token: 'fincontrol.mobile.token',
} as const;

export async function readStorage(key: string) {
  return AsyncStorage.getItem(key);
}

export async function writeStorage(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function removeStorage(key: string) {
  await AsyncStorage.removeItem(key);
}
