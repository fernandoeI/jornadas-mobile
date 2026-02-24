import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { View } from "react-native";

interface IConfirmacion {
  values: any;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  showButtons?: boolean;
}

export const Confirmacion: React.FC<IConfirmacion> = ({
  values,
  onBack,
  onSubmit,
  isLoading = false,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;

  return (
    <View className="gap-4">
      <Text
        className="text-lg font-bold"
        style={{ color: foregroundColor }}
      >
        Revisa la información antes de enviar
      </Text>

      {/* Resumen de datos */}
      <View className="gap-4">
        {/* Datos de INE */}
        <View className="gap-2">
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Datos de INE
          </Text>
          <View className="gap-1 pl-4">
            <Text style={{ color: mutedForegroundColor }}>
              Nombre: {values.nombre} {values.primerApellido}{" "}
              {values.segundoApellido}
            </Text>
            <Text style={{ color: mutedForegroundColor }}>
              CURP: {values.curp}
            </Text>
            <Text style={{ color: mutedForegroundColor }}>
              Género: {values.genero}
            </Text>
          </View>
        </View>

        {/* Información adicional */}
        <View className="gap-2">
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Información adicional
          </Text>
          <View className="gap-1 pl-4">
            <Text style={{ color: mutedForegroundColor }}>
              Municipio: {values.municipio}
            </Text>
            <Text style={{ color: mutedForegroundColor }}>
              Localidad: {values.localidad}
            </Text>
            <Text style={{ color: mutedForegroundColor }}>
              Teléfono: {values.telefono}
            </Text>
            <Text style={{ color: mutedForegroundColor }}>
              Correo: {values.correo}
            </Text>
            <Text style={{ color: mutedForegroundColor }}>
              Área de registro: {values.areaRegistro}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de navegación */}
      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onBack} className="flex-1">
            <Text>Regresar</Text>
          </Button>
          <Button
            onPress={onSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            <Text>{isLoading ? "Enviando..." : "Finalizar"}</Text>
          </Button>
        </View>
      )}
    </View>
  );
};

