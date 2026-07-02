import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeState, ThemeMode } from '@/types';

const storedTheme = (localStorage.getItem('theme') as ThemeMode) || 'dark';

const initialState: ThemeState = {
  mode: storedTheme,
  primaryColor: '#00d4ff',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.mode);
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('theme', state.mode);
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;
