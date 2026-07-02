import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { toggleTheme, setTheme, setPrimaryColor } from '@/store/slices/themeSlice';
import { ThemeMode } from '@/types';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { mode, primaryColor } = useAppSelector((state) => state.theme);

  return {
    mode,
    primaryColor,
    isDark: mode === 'dark',
    toggle: () => dispatch(toggleTheme()),
    setMode: (m: ThemeMode) => dispatch(setTheme(m)),
    setColor: (c: string) => dispatch(setPrimaryColor(c)),
  };
};
