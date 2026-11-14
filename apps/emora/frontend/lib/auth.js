// lib/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@emora_token';
const REFRESH_KEY = '@emora_refresh_token';
const USER_KEY = '@emora_user';

export const authStorage = {
  // Token speichern
  async saveSession({ token, refreshToken, user }) {
    try {
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
      if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('saveSession error:', e);
    }
  },

  // Token abrufen
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // User abrufen
  async getUser() {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Komplette Session
  async getSession() {
    return {
      token: await this.getToken(),
      user: await this.getUser(),
    };
  },

  // Alles löschen
  async clearSession() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
    } catch (e) {
      console.error('clearSession error:', e);
    }
  },
};