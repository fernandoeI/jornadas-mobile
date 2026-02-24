import { Text } from "@/src/components/ui/text";
import { THEME } from "@/src/components/ui/lib/theme";
import { useTheme } from "@/src/providers/ThemeProvider";
import { SettingsGroup as SettingsGroupType } from "@/src/types/gestionar-cuenta";
import { BlurView } from "expo-blur";
import { Platform, View } from "react-native";
import { SettingsOption } from "./SettingsOption";

interface SettingsGroupProps {
  group: SettingsGroupType;
}

export function SettingsGroup({ group }: SettingsGroupProps) {
  const { colorScheme } = useTheme();
  const borderColor = THEME[colorScheme].border;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;

  const cardBackgroundColor =
    colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 1)";
  const blurIntensity = colorScheme === "dark" ? 20 : 30;
  const blurType = colorScheme === "dark" ? "dark" : "light";

  const cardContent = (
    <View
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: borderColor,
        borderWidth: 0.5,
      }}
    >
      <View className="px-4 pt-4 pb-2">
        <Text
          className="text-xs font-semibold"
          style={{ color: mutedForegroundColor }}
        >
          {group.title.toUpperCase()}
        </Text>
      </View>
      <View>
        {group.options.map((option, index) => (
          <SettingsOption
            key={option.id}
            option={option}
            isLast={index === group.options.length - 1}
          />
        ))}
      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View className="mb-3">
        {cardContent}
      </View>
    );
  }

  return (
    <View className="mb-3">
      <BlurView
        intensity={blurIntensity}
        tint={blurType}
        className="rounded-lg overflow-hidden"
        style={{ borderColor: borderColor, borderWidth: 0.5 }}
      >
        {cardContent}
      </BlurView>
    </View>
  );
}

