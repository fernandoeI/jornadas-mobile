import { Button } from "@/src/components/ui/button";
import { Icon } from "@/src/components/ui/icon";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { View } from "react-native";

export function GestionarCuentaHeader() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const backgroundColor = THEME[colorScheme].background;
  const borderColor = THEME[colorScheme].border;

  return (
    <View
      className="flex-row items-center px-4 py-4 border-b"
      style={{
        borderBottomColor: borderColor,
        backgroundColor,
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onPress={() => router.back()}
        className="mr-2"
      >
        <Icon
          as={ArrowLeft}
          size={20}
          color={THEME[colorScheme].foreground}
        />
      </Button>
      <Text className="text-xl font-semibold flex-1">Cuenta</Text>
    </View>
  );
}


