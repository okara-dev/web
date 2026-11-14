// screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../lib/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Fehler', 'Passwort mindestens 6 Zeichen');
      return;
    }

    setLoading(true);
    try {
      const data = await register(username.trim(), email.trim().toLowerCase(), password);
      
      if (data.needsEmailConfirmation) {
        Alert.alert(
          'Email bestätigen',
          'Wir haben dir eine Email geschickt. Bitte bestätige sie, dann kannst du dich einloggen.'
        );
        navigation.navigate('Login');
      }
      // Falls keine Email-Bestätigung nötig: AuthContext setzt user → App redirected automatisch
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Registrierung fehlgeschlagen';
      Alert.alert('Registrierung fehlgeschlagen', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>Konto erstellen</Text>
        <Text style={styles.subtitle}>Starte deine Reise mit Emora</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Benutzername"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Passwort (min. 6 Zeichen)"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Registrieren</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Schon ein Konto? <Text style={styles.linkBold}>Anmelden</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: spacing.md },
  title: {
    fontSize: 28, fontWeight: '700', color: colors.text,
    textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', marginBottom: spacing.xl,
  },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  linkContainer: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: 14 },
  linkBold: { color: colors.primaryLight, fontWeight: '600' },
});