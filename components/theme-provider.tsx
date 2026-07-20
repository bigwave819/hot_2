"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Wraps next-themes so the app is dark-mode-ready at the architecture level.
 * Dark mode is NOT exposed to users yet (no toggle is rendered anywhere) —
 * per the brief this ships later. Keeping defaultTheme="light" and
 * enableSystem={false} means every visitor sees light mode today, but the
 * `.dark` class + CSS variables in globals.css already work end to end,
 * so turning it on later is just adding a <ThemeToggle /> control.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}