import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, View } from "react-native";

export interface MenuItem {
  title: string;
  description: string;
  route: string;
  color: string;
}

interface MenuItemProps {
  item: MenuItem;
  onPress: () => void;
}

export const MenuItemComponent: React.FC<MenuItemProps> = ({
  item,
  onPress,
}) => {
  const { colorScheme } = useTheme();
  const cardForegroundColor = THEME[colorScheme].cardForeground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const borderColor = THEME[colorScheme].border;
  const backgroundColor =
    colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.7)";

  const blurIntensity = colorScheme === "dark" ? 20 : 30;
  const blurType = colorScheme === "dark" ? "dark" : "light";

  if (Platform.OS === "web") {
    // Fallback para web sin blur
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor,
            borderColor,
            shadowColor: colorScheme === "dark" ? "#000" : "#000",
          },
        ]}
      >
        <View className="flex-row items-center w-full gap-3">
          <View className="flex-1 items-start">
            <Text
              className="text-lg font-semibold text-left"
              style={{ color: cardForegroundColor }}
            >
              {item.title}
            </Text>
            <Text
              className="text-sm text-left"
              style={{ color: mutedForegroundColor }}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <BlurView
        intensity={blurIntensity}
        tint={blurType}
        style={[
          styles.blurContainer,
          {
            borderColor,
            shadowColor: colorScheme === "dark" ? "#000" : "#000",
          },
        ]}
      >
        <View className="flex-row items-center w-full gap-3 px-4">
          <View className="flex-1 items-start">
            <Text
              className="text-lg font-semibold text-left"
              style={{ color: cardForegroundColor }}
            >
              {item.title}
            </Text>
            <Text
              className="text-sm text-left"
              style={{ color: mutedForegroundColor }}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  blurContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 64,
    justifyContent: "center",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }
      : {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
  container: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }
      : {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }),
  },
});
