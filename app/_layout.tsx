import "@/global.css";
import { NAV_THEME } from "@/src/components/ui/lib/theme";
import { AuthProvider } from "@/src/providers/AuthProvider";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/src/providers/ThemeProvider";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NavigationThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>{children}</ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <NavigationThemeProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(protected)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="splash/index"
                options={{ headerShown: false }}
              />
            </Stack>
          </NavigationThemeProvider>
        </AuthProvider>
      </CustomThemeProvider>
      <PortalHost />
    </QueryClientProvider>
  );
}
