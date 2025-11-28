import { DrawerProvider } from "@/src/components/common/Drawer";
import { useAuth } from "@/src/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <DrawerProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="promocion-turistica"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="economia-social" options={{ headerShown: false }} />
        <Stack.Screen
          name="impulso-inversiones"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="agregar-seguimiento"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="fondos-financiamiento"
          options={{ headerShown: false }}
        />
      </Stack>
    </DrawerProvider>
  );
}
