import { HomeHeader, MenuList } from "@/src/components/modules/home";
import { THEME } from "@/src/components/ui/lib/theme";
import { HOME_MENU_ITEMS } from "@/src/constants/home";
import { useHome } from "@/src/hooks/useHome";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Dimensions, ScrollView, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
  const { handleLogout, handleNavigate } = useHome();
  const { colorScheme } = useTheme();
  const primaryColor = THEME[colorScheme].primary;
  const secondaryColor = THEME[colorScheme].secondary;
  const mutedColor = THEME[colorScheme].muted;
  const opacity = colorScheme === "dark" ? 0.1 : 0.05;

  return (
    <View className="flex-1 bg-background" style={{ position: "relative" }}>
      {/* Formas decorativas orgánicas de fondo */}
      {/* Forma orgánica 1 - Esquina superior derecha */}
      <View
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 350,
          height: 380,
          borderRadius: 200,
          borderTopLeftRadius: 50,
          borderBottomRightRadius: 250,
          backgroundColor: primaryColor,
          opacity,
          transform: [{ rotate: "-15deg" }],
        }}
      />
      {/* Forma orgánica 2 - Lado izquierdo */}
      <View
        style={{
          position: "absolute",
          top: 180,
          left: -100,
          width: 320,
          height: 280,
          borderRadius: 180,
          borderTopRightRadius: 80,
          borderBottomLeftRadius: 200,
          backgroundColor: secondaryColor,
          opacity,
          transform: [{ rotate: "25deg" }],
        }}
      />
      {/* Forma orgánica 3 - Esquina inferior derecha */}
      <View
        style={{
          position: "absolute",
          bottom: 150,
          right: -120,
          width: 450,
          height: 420,
          borderRadius: 250,
          borderTopLeftRadius: 150,
          borderBottomRightRadius: 300,
          backgroundColor: primaryColor,
          opacity: opacity * 0.7,
          transform: [{ rotate: "20deg" }],
        }}
      />
      {/* Forma orgánica 4 - Esquina inferior izquierda */}
      <View
        style={{
          position: "absolute",
          bottom: -180,
          left: -70,
          width: 400,
          height: 380,
          borderRadius: 220,
          borderTopRightRadius: 200,
          borderBottomLeftRadius: 100,
          backgroundColor: secondaryColor,
          opacity: opacity * 0.8,
          transform: [{ rotate: "-30deg" }],
        }}
      />
      {/* Forma orgánica 5 - Centro derecho */}
      <View
        style={{
          position: "absolute",
          top: SCREEN_HEIGHT * 0.35,
          right: SCREEN_WIDTH * 0.15,
          width: 220,
          height: 200,
          borderRadius: 120,
          borderTopLeftRadius: 60,
          borderBottomRightRadius: 140,
          backgroundColor: mutedColor,
          opacity: opacity * 1.2,
          transform: [{ rotate: "45deg" }],
        }}
      />
      {/* Forma orgánica 6 - Centro superior */}
      <View
        style={{
          position: "absolute",
          top: SCREEN_HEIGHT * 0.15,
          left: SCREEN_WIDTH * 0.4,
          width: 180,
          height: 160,
          borderRadius: 100,
          borderTopRightRadius: 80,
          borderBottomLeftRadius: 90,
          backgroundColor: primaryColor,
          opacity: opacity * 0.6,
          transform: [{ rotate: "-20deg" }],
        }}
      />

      <HomeHeader onLogout={handleLogout} />
      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 1 }}
      >
        <MenuList items={HOME_MENU_ITEMS} onItemPress={handleNavigate} />
      </ScrollView>
    </View>
  );
}
