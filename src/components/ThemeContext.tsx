import { createContext } from 'react';

export type ThemeType = "light" | "dark"

export const ThemeContext = createContext<ThemeType>('light');