import { INEScannerCamera } from "@/src/components/modules";
import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { INEScanResult } from "@/src/utils/functions";
import { useState } from "react";
import { ActivityIndicator, Modal, View } from "react-native";
import { type IEscaneoINE } from "./types";
import { useEscaneoINE } from "./useEscaneoINE";

export const EscaneoINE: React.FC<IEscaneoINE> = ({
  control,
  errors,
  values,
  setValue,
  trigger,
  contentInsets,
  onCancel,
  onNext,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const [localLoading, setLocalLoading] = useState(false);

  const { loadingOCR, error, handleScan, isFormComplete } = useEscaneoINE({
    values,
    errors,
    setValue,
    trigger,
  });

  const handleScanWrapper = async (
    file: File | { uri: string; name: string; type: string },
    setLoading: (val: boolean) => void,
    setFormDataFromScan: (data: INEScanResult) => void
  ) => {
    setLocalLoading(true);
    setLoading(true);
    const success = await handleScan(file, setLoading, setFormDataFromScan);
    setLocalLoading(false);

    // Si el escaneo fue exitoso, avanzar al siguiente paso
    if (success) {
      // Pequeño delay para que el usuario vea que fue exitoso
      setTimeout(() => {
        onNext();
      }, 500);
    }
  };

  const isLoading = loadingOCR || localLoading;

  return (
    <View className="gap-4">
      {/* Mostrar error si existe */}
      {error && (
        <View className="gap-2">
          <Text className="text-red-600 font-medium">Error</Text>
          <Text className="text-red-500 text-sm">{error}</Text>
        </View>
      )}

      {/* Componente de escaneo */}
      <INEScannerCamera
        onScan={handleScanWrapper}
        setLoadingOCR={setLocalLoading}
        setFormData={() => {
          // Los datos ya se establecen en handleScan
        }}
      />

      {/* Loading overlay durante el OCR */}
      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="items-center">
            <ActivityIndicator
              size="large"
              color={THEME[colorScheme].primary}
            />
            <Text className="mt-4 text-[15px] font-medium text-white">
              Escaneando INE...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Botones de navegación */}
      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onCancel} className="flex-1">
            <Text>Cancelar</Text>
          </Button>
          <Button
            onPress={onNext}
            disabled={!isFormComplete || isLoading}
            className="flex-1"
          >
            <Text>Siguiente</Text>
          </Button>
        </View>
      )}
    </View>
  );
};
