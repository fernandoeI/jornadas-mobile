import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import Monicon from "@monicon/native";
import { View } from "react-native";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  onAddNew: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,

  onClose,
  onAddNew,
}) => {
  const { colorScheme } = useTheme();
  const primaryColor = THEME[colorScheme].primary;
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <View className="items-center mb-4">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: `${primaryColor}20`,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Monicon name="mdi:check-circle" size={48} color={primaryColor} />
            </View>
          </View>
          <DialogTitle className="text-center text-2xl">
            ¡Registro exitoso!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            <Text className="text-base" style={{ color: mutedForegroundColor }}>
              Tu jornada se ha registrado correctamente.
            </Text>
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4 mt-4">
          <View className="flex-row gap-3 mt-2">
            <Button variant="outline" onPress={onClose} className="flex-1">
              <Text>Cerrar</Text>
            </Button>
            <Button onPress={onAddNew} className="flex-1">
              <Text>Agregar nuevo registro</Text>
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
};
