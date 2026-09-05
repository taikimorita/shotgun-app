/**
 * Shotgun design system tokens.
 *
 * The semantic foreground/background pairs meet WCAG AA for normal text.
 * In particular, use `action.primaryForeground` on navy, and
 * `action.accentForeground` (not white) on peach.
 */

export const colors = {
  navy: '#102A43',
  navyStrong: '#081D31',
  steel: '#4F7EA8',
  steelSoft: '#DCEAF4',
  ice: '#F5FAFD',
  white: '#FFFFFF',
  peach: '#FF8A6A',
  peachSoft: '#FFE3DA',

  ink: '#102A43',
  text: '#243B53',
  textMuted: '#526F8D',
  textSubtle: '#6E8AA6',
  border: '#C7D8E8',
  borderStrong: '#8FAEC9',
  canvas: '#EAF3F9',

  success: '#1F6B4E',
  successSurface: '#E3F4EC',
  warning: '#8A4B00',
  warningSurface: '#FFF0D7',
  danger: '#A61B1B',
  dangerSurface: '#FDE8E7',
} as const;

export const semanticColors = {
  app: {
    background: colors.canvas,
    surface: colors.white,
    surfaceMuted: colors.ice,
    border: colors.border,
    borderStrong: colors.borderStrong,
  },
  text: {
    primary: colors.ink,
    secondary: colors.text,
    muted: colors.textMuted,
    inverse: colors.white,
    link: colors.navy,
  },
  action: {
    primaryBackground: colors.navy,
    primaryForeground: colors.white,
    primaryPressed: colors.navyStrong,
    secondaryBackground: colors.white,
    secondaryForeground: colors.navy,
    secondaryBorder: colors.borderStrong,
    accentBackground: colors.peach,
    accentForeground: colors.navy,
    focusRing: colors.steel,
  },
  status: {
    successForeground: colors.success,
    successBackground: colors.successSurface,
    warningForeground: colors.warning,
    warningBackground: colors.warningSurface,
    dangerForeground: colors.danger,
    dangerBackground: colors.dangerSurface,
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'system-ui',
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: -0.6,
    normal: 0,
    label: 1,
  },
  textStyle: {
    display: { fontSize: 36, lineHeight: 40, fontWeight: '800' },
    title: { fontSize: 28, lineHeight: 32, fontWeight: '700' },
    heading: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    bodySmall: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
    label: { fontSize: 12, lineHeight: 15, fontWeight: '700', letterSpacing: 1 },
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 9999,
} as const;

export const componentTokens = {
  button: { height: 48, radius: radii.md, horizontalPadding: spacing[5] },
  input: { height: 48, radius: radii.md, horizontalPadding: spacing[4], borderWidth: 1 },
  card: { radius: radii.lg, padding: spacing[5], borderWidth: 1 },
  phoneFrame: { radius: 40, borderWidth: 8 },
} as const;

export const tokens = {
  colors,
  semanticColors,
  typography,
  spacing,
  radii,
  componentTokens,
} as const;

export type ShotgunTokens = typeof tokens;
