import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design dimensions (iPhone 11 / standard mid-size device)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale a size horizontally based on screen width.
 */
export const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;

/**
 * Scale a size vertically based on screen height.
 */
export const verticalScale = size => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

/**
 * Scale a size with a damping factor so it doesn't grow/shrink too
 * aggressively on very large or very small screens (good for font size,
 * padding, margins, border radius, etc.)
 */
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const isSmallDevice = SCREEN_WIDTH < 360;
export const isTablet = SCREEN_WIDTH >= 768;

// Shared spacing scale — use these instead of hardcoded padding/margin
// numbers so the whole app stays visually consistent and adapts to
// different screen sizes.
export const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  xxl: moderateScale(32),
};

export const FONT = {
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(20),
};

// Safe-area-ish helpers for notch/home-indicator devices without pulling in
// an extra dependency where one isn't already used.
export const BOTTOM_SAFE_PADDING = Platform.select({
  ios: SCREEN_HEIGHT >= 812 ? 34 : 0, // iPhone X and later
  android: 0,
  default: 0,
});

export default {
  scale,
  verticalScale,
  moderateScale,
  isSmallDevice,
  isTablet,
  SPACING,
  FONT,
  BOTTOM_SAFE_PADDING,
};