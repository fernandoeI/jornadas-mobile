import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

type ColorScheme = "light" | "dark" | "system";

interface ThemeContextType {
  colorScheme: "light" | "dark";
  themePreference: ColorScheme;
  setThemePreference: (preference: ColorScheme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@jornadas_theme_preference";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useRNColorScheme();
  const { setColorScheme: setNWColorScheme } = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ColorScheme>("system");
  const [isLoading, setIsLoading] = useState(true);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    systemColorScheme ?? "light"
  );

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemePreferenceState(saved as ColorScheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Actualizar colorScheme basado en preference y system
  useEffect(() => {
    if (isLoading) return;

    let newColorScheme: "light" | "dark";
    if (themePreference === "system") {
      newColorScheme = systemColorScheme ?? "light";
    } else {
      newColorScheme = themePreference;
    }

    // Actualizar el estado local primero
    setColorScheme(newColorScheme);

    // Luego actualizar NativeWind para que se propague a toda la app
    setNWColorScheme(newColorScheme);
  }, [themePreference, systemColorScheme, setNWColorScheme, isLoading]);

  const setThemePreference = async (preference: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = colorScheme === "light" ? "dark" : "light";
    await setThemePreference(newTheme);
  };

  const value: ThemeContextType = {
    colorScheme,
    themePreference,
    setThemePreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
