import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../lib/theme';

export default function LettersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Briefe an mich</Text>
      <Text style={styles.subtitle}>Kommt bald.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 16, color: colors.textSecondary },
});