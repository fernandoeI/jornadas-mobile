import { useDrawer } from "@/src/components/common/Drawer";
import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { UserMenu } from "@/src/components/user-menu";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import Monicon from "@monicon/native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HomeHeaderProps {
  onLogout: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { colorScheme, toggleTheme } = useTheme();
  const { open: openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const iconColor = THEME[colorScheme].foreground;

  return (
    <View
      className="px-6 pt-6 pb-4"
      style={{
        paddingTop: insets.top + 20,
        backgroundColor: "transparent",
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onPress={openDrawer}
          className="rounded-full"
        >
          <Monicon name="ic:outline-menu" size={24} color={iconColor} />
        </Button>
        <View className="flex-row items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onPress={toggleTheme}
            className="rounded-full"
          >
            <Monicon
              name={
                colorScheme === "dark"
                  ? "ic:outline-light-mode"
                  : "ic:outline-dark-mode"
              }
              size={24}
              color={iconColor}
            />
          </Button>
          <UserMenu user={user} onLogout={onLogout} />
        </View>
      </View>

      <Text className="text-2xl font-bold text-foreground">
        Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}
      </Text>
      <Text className="text-base text-muted-foreground">
        Selecciona una opción para continuar
      </Text>
    </View>
  );
};
