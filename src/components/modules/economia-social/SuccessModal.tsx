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
import { CheckCircle } from "lucide-react-native";
import { View } from "react-native";

interface SuccessModalProps {
  open: boolean;
  folio: string;
  onClose: () => void;
  onAddNew: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  folio,
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
              className="rounded-full p-3"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <CheckCircle
                size={48}
                color={primaryColor}
                style={{ backgroundColor: "transparent" }}
              />
            </View>
          </View>
          <DialogTitle className="text-center text-2xl">
            ¡Registro exitoso!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            <Text className="text-base" style={{ color: mutedForegroundColor }}>
              Tu formulario ha sido enviado correctamente.
            </Text>
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4 mt-4">
          <View className="bg-muted/50 rounded-lg p-4">
            <Text
              className="text-sm mb-1"
              style={{ color: mutedForegroundColor }}
            >
              Folio de registro:
            </Text>
            <Text
              className="text-xl font-bold"
              style={{ color: foregroundColor }}
            >
              {folio}
            </Text>
          </View>

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
