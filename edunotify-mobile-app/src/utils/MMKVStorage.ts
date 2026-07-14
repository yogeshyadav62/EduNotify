import { createMMKV, MMKV } from 'react-native-mmkv';

export const AUTH_STORAGE_KEY = 'auth_data';
export const TOKEN_STORAGE_KEY = 'auth_token';

let storage: MMKV | null = null;
try {
  storage = createMMKV();
} catch (error: any) {
  console.warn(
    '[MMKV] Falling back to no-op storage. Reason:',
    error?.message || error
  );
}

const ensureStorage = (): boolean => {
  if (!storage) {
    console.warn('[MMKV] Storage unavailable.');
    return false;
  }
  return true;
};

export const setItem = (key: string, value: any): void => {
  if (!ensureStorage() || !storage) return;

  if (typeof value === 'string') {
    storage.set(key, value);
    return;
  }

  storage.set(key, JSON.stringify(value));
};

export const getItem = (key: string): string | null => {
  if (!ensureStorage() || !storage) return null;

  const raw = storage.getString(key);
  return raw ?? null;
};

export const setObject = (key: string, value: any): void => {
  if (!ensureStorage() || !storage) return;

  if (value === undefined) {
    storage.remove(key);
    return;
  }

  storage.set(key, JSON.stringify(value));
};

export const getObject = <T>(key: string): T | null => {
  if (!ensureStorage() || !storage) return null;

  const raw = storage.getString(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to parse MMKV value for key ${key}`, error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  if (!ensureStorage() || !storage) return;

  storage.remove(key);
};
