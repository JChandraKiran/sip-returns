/**
 * Color Constants for Crypto SIP Returns
 *
 * These colors match the CSS variables defined in index.css
 * Use these for inline styles in JavaScript/JSX
 *
 * Usage:
 * import { colors } from '../utils/colors';
 * <div style={{ color: colors.primary }}>Text</div>
 */

export const colors = {
  // Primary Colors (Bitcoin Orange)
  primary: "#f7931a",
  primaryDark: "#d17915",
  primaryLight: "#ffa940",
  primaryLighter: "#ffb84d",
  primarySubtle: "#fff7e6",
  primaryHover: "#ff9f2e",

  // Text Colors
  textPrimary: "#1a1a1a",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textLight: "#ffffff",

  // Background Colors
  bgPrimary: "#fafafa",
  bgWhite: "#ffffff",
  bgCard: "#f5f5f5ff",
  bgHover: "#f5f5f5",

  // Status Colors
  success: "#52c41a",
  successDark: "#389e0d",
  successLight: "#95de64",
  danger: "#ff4d4f",
  dangerDark: "#cf1322",
  dangerLight: "#ff7875",
  info: "#1890ff",
  infoDark: "#096dd9",
  infoLight: "#40a9ff",
  warning: "#faad14",

  // Neutral Colors
  gray100: "#f5f5f5",
  gray200: "#e8e8e8",
  gray300: "#d9d9d9",
  gray400: "#bfbfbf",
  gray500: "#8c8c8c",
  gray600: "#595959",
  gray700: "#434343",
  gray800: "#262626",
};

// Shadow constants
export const shadows = {
  sm: "rgba(0, 0, 0, 0.02) 0 1px 3px 0",
  md: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
  lg: "rgba(0, 0, 0, 0.1) 0 4px 12px",
};

// Border radius constants
export const borderRadius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
};

// Export everything as default too
export default {
  colors,
  shadows,
  borderRadius,
};
