// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../lib/theme';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hallo, {user?.username} 👋</Text>
      <Text style={styles.subtitle}>Dein Tagebuch kommt bald hier hin.</Text>
      
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    justifyContent: 'center', alignItems: 'center', padding: spacing.xl,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.xl },
  logoutBtn: {
    backgroundColor: colors.danger, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md, borderRadius: 12,
  },
  logoutText: { color: colors.text, fontWeight: '600', fontSize: 16 },
});