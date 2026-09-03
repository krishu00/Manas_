import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const verticalScale = size => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

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
  lg: moderateScale(17),
  xl: moderateScale(22),
  xxl: moderateScale(28),
};

export const COLORS = {
  primary: '#00503D',
  primaryLight: '#4a8f7b',
  accent: '#6a9689',
  text: '#0e120e',
  textMuted: '#767676',
  border: '#e2e2e2',
  background: '#f5f5f5',
  surface: '#ffffff',
  danger: '#F7454A',
  placeholder: '#dcdcdc',
};
