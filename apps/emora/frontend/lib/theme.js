// lib/theme.js
export const colors = {
  // Primary – lila/violett (wie dein Premium-Screen)
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  // Accent
  accent: '#a855f7',
  accentLight: '#c084fc',
  
  // Backgrounds (dark mode)
  bg: '#0a0a1a',
  bgCard: '#1e1b4b',
  bgElevated: '#312e81',
  bgInput: '#1e293b',
  
  // Text
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Mood-Farben (1-10)
  mood: {
    1: '#7f1d1d', 2: '#991b1b', 3: '#b91c1c',
    4: '#dc2626', 5: '#f59e0b', 6: '#eab308',
    7: '#84cc16', 8: '#22c55e', 9: '#10b981', 10: '#059669',
  },
  
  // Borders
  border: 'rgba(148, 163, 184, 0.2)',
  borderFocus: 'rgba(99, 102, 241, 0.5)',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', color: colors.text },
  h2: { fontSize: 24, fontWeight: '700', color: colors.text },
  h3: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, color: colors.text },
  bodySmall: { fontSize: 14, color: colors.textSecondary },
  caption: { fontSize: 12, color: colors.textMuted },
};