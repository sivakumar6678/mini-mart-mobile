/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#000',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    border: '#E0E0E0',
    disabledBackground: '#F5F5F5',
    secondaryBackground: '#F8F8F8',
    cardBackground: '#FFFFFF',
    disabledText: '#9E9E9E',
    warning: '#FFA000',
    info: '#2196F3',
    success: '#4CAF50',
    error: '#F44336',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    icon: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    border: '#333333',
    disabledBackground: '#1C1C1C',
    secondaryBackground: '#121212',
    cardBackground: '#1E1E1E',
    disabledText: '#757575',
    warning: '#FFB74D',
    info: '#64B5F6',
    success: '#81C784',
    error: '#E57373',
  },
};
