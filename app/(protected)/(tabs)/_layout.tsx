import { THEME } from "@/src/components/ui/lib/theme";
import { useTheme } from "@/src/providers/ThemeProvider";
import Monicon from "@monicon/native";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { colorScheme } = useTheme();
  const backgroundColor = THEME[colorScheme].background;
  const borderColor = THEME[colorScheme].border;
  const iconColor = THEME[colorScheme].foreground;
  const activeIconColor = THEME[colorScheme].primary;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: iconColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Monicon name="ic:outline-home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="desarrollo-comercial"
        options={{
          title: "Comercial",
          tabBarIcon: ({ color, size }) => (
            <Monicon name="ic:outline-store" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="desarrollo-turistico"
        options={{
          title: "Turístico",
          tabBarIcon: ({ color, size }) => (
            <Monicon
              name="ic:outline-beach-access"
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ferias-festivales"
        options={{
          title: "Ferias",
          tabBarIcon: ({ color, size }) => (
            <Monicon
              name="ic:outline-festival"
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
