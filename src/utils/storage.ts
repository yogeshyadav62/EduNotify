import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: 'edunotify_user',
  TOKEN: 'edunotify_token',
  THEME: 'edunotify_theme',
};

export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (e) {
      console.error(`Error saving to storage: ${key}`, e);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (e) {
      console.error(`Error reading from storage: ${key}`, e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing from storage: ${key}`, e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  },

  async saveAuth(user: any, token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER, user);
    await this.setItem(STORAGE_KEYS.TOKEN, token);
  },

  async getAuth(): Promise<{ user: any; token: string | null } | null> {
    const user = await this.getItem<any>(STORAGE_KEYS.USER);
    const token = await this.getItem<string>(STORAGE_KEYS.TOKEN);
    if (user && token) {
      return { user, token };
    }
    return null;
  },

  async removeAuth(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER);
    await this.removeItem(STORAGE_KEYS.TOKEN);
  },
};
