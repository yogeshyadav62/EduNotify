import * as MMKVStorage from './MMKVStorage';

const STORAGE_KEYS = {
  USER: MMKVStorage.AUTH_STORAGE_KEY,
  TOKEN: MMKVStorage.TOKEN_STORAGE_KEY,
  THEME: 'edunotify_theme',
};

export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      MMKVStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error saving to MMKV: ${key}`, e);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = MMKVStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (e) {
      console.error(`Error reading from MMKV: ${key}`, e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      MMKVStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing from MMKV: ${key}`, e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      MMKVStorage.removeItem(STORAGE_KEYS.USER);
      MMKVStorage.removeItem(STORAGE_KEYS.TOKEN);
      MMKVStorage.removeItem(STORAGE_KEYS.THEME);
    } catch (e) {
      console.error('Error clearing MMKV', e);
    }
  },

  async saveAuth(user: any, token: string): Promise<void> {
    MMKVStorage.setObject(STORAGE_KEYS.USER, user);
    MMKVStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  async getAuth(): Promise<{ user: any; token: string | null } | null> {
    const user = MMKVStorage.getObject<any>(STORAGE_KEYS.USER);
    const token = MMKVStorage.getItem(STORAGE_KEYS.TOKEN);
    if (user && token) {
      return { user, token };
    }
    return null;
  },

  async removeAuth(): Promise<void> {
    MMKVStorage.removeItem(STORAGE_KEYS.USER);
    MMKVStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};
