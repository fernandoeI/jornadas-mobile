import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useGetJornadasDelDia } from "@/src/hooks";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MisSolicitudesScreen() {
  const { user } = useAuth();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const primaryColor = THEME[colorScheme].primary;
  const primaryForegroundColor = THEME[colorScheme].primaryForeground;
  const secondaryColor = THEME[colorScheme].secondary;
  const mutedColor = THEME[colorScheme].muted;
  const backgroundColor = THEME[colorScheme].background;
  const foregroundColor = THEME[colorScheme].foreground;
  const borderColor = THEME[colorScheme].border;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const opacity = colorScheme === "dark" ? 0.1 : 0.05;

  // Verificar si el usuario tiene los labels "secretaria" o "titular"
  const isSecretariaOrTitular = useMemo(() => {
    return user?.labels?.some(
      (label) =>
        label.toLowerCase() === "secretaria" ||
        label.toLowerCase() === "titular"
    );
  }, [user?.labels]);

  // Si es secretaria o titular, obtener todas las jornadas del día. Si no, solo las del usuario.
  const {
    data: jornadasData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetJornadasDelDia(!isSecretariaOrTitular);

  // Asegurar que jornadas siempre sea un array
  const jornadas = Array.isArray(jornadasData) ? jornadasData : [];

  return (
    <View className="flex-1 bg-background" style={{ position: "relative" }}>
      {/* Formas decorativas orgánicas de fondo */}
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

      <View
        className="px-6 pb-4 gap-2 bg-transparent flex"
        style={{
          paddingTop: insets.top + 12,
        }}
      >
        <View className="items-center">
          <Text
            className="text-lg font-bold"
            style={{ color: foregroundColor }}
          >
            Mis Solicitudes
          </Text>
          <Text
            className="text-md text-center mb-3"
            style={{ color: mutedForegroundColor }}
          >
            {isSecretariaOrTitular
              ? "Todos los registros de jornadas"
              : "Mis registros de jornadas"}
          </Text>
          {/* Contador de registros */}
          {!isLoading && (
            <View
              className="px-4 py-2 rounded-full mt-2"
              style={{
                backgroundColor:
                  colorScheme === "dark"
                    ? `${primaryColor}30`
                    : `${primaryColor}15`,
                borderWidth: 1,
                borderColor: primaryColor,
              }}
            >
              <Text className="text-base font-semibold text-white">
                {jornadas.length} registro{jornadas.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {isLoading && (
            <View className="mt-2">
              <Text className="text-sm" style={{ color: mutedForegroundColor }}>
                Cargando...
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pb-6 bg-transparent"
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 1 }}
        contentContainerStyle={{
          paddingBottom: Platform.OS !== "web" ? insets.bottom + 16 : undefined,
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="gap-4 w-full max-w-[672px] mx-auto">
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color={primaryColor} />
              <Text
                className="text-base mt-4"
                style={{ color: mutedForegroundColor }}
              >
                Cargando registros...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center py-12">
              <Text className="text-lg mb-4" style={{ color: foregroundColor }}>
                Error al cargar los registros
              </Text>
              <Text
                className="text-base text-center mb-6"
                style={{ color: mutedForegroundColor }}
              >
                {error instanceof Error
                  ? error.message
                  : "No se pudieron cargar los registros"}
              </Text>
              <Button onPress={() => refetch()}>
                <Text>Reintentar</Text>
              </Button>
            </View>
          ) : !Array.isArray(jornadas) || jornadas.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-lg mb-2" style={{ color: foregroundColor }}>
                No hay registros
              </Text>
              <Text
                className="text-base text-center"
                style={{ color: mutedForegroundColor }}
              >
                {isSecretariaOrTitular
                  ? "Aún no se han registrado jornadas."
                  : "Aún no has registrado jornadas."}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {/* Tabla */}
              <View
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor,
                  borderColor,
                }}
              >
                {/* Encabezados de la tabla */}
                <View
                  className="flex-row border-b"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    borderBottomColor: borderColor,
                  }}
                >
                  <View
                    className="p-3 border-r"
                    style={{
                      flex: 1.2,
                      borderRightColor: borderColor,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: primaryForegroundColor }}
                    >
                      Nombre
                    </Text>
                  </View>
                  <View
                    className="p-3 border-r"
                    style={{
                      flex: 1.2,
                      borderRightColor: borderColor,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: primaryForegroundColor }}
                    >
                      Primer apellido
                    </Text>
                  </View>
                  <View
                    className="p-3 border-r"
                    style={{
                      flex: 1.2,
                      borderRightColor: borderColor,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: primaryForegroundColor }}
                    >
                      Segundo apellido
                    </Text>
                  </View>
                  <View
                    className="p-3"
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: primaryForegroundColor }}
                    >
                      CURP
                    </Text>
                  </View>
                </View>

                {/* Filas de datos */}
                {Array.isArray(jornadas) &&
                  jornadas.map((jornada, index) => (
                    <View
                      key={jornada.id || index}
                      className={`flex-row ${
                        index < jornadas.length - 1 ? "border-b" : ""
                      }`}
                      style={{
                        borderBottomColor:
                          index < jornadas.length - 1
                            ? borderColor
                            : "transparent",
                      }}
                    >
                      <View
                        className="p-3 border-r"
                        style={{
                          flex: 1.2,
                          borderRightColor: borderColor,
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: foregroundColor }}
                        >
                          {jornada.nombreSolicitante || "N/A"}
                        </Text>
                      </View>
                      <View
                        className="p-3 border-r"
                        style={{
                          flex: 1.2,
                          borderRightColor: borderColor,
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: foregroundColor }}
                        >
                          {jornada.primerApellido || "N/A"}
                        </Text>
                      </View>
                      <View
                        className="p-3 border-r"
                        style={{
                          flex: 1.2,
                          borderRightColor: borderColor,
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: foregroundColor }}
                        >
                          {jornada.segundoApellido || "-"}
                        </Text>
                      </View>
                      <View
                        className="p-3"
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: foregroundColor }}
                        >
                          {jornada.curp || "N/A"}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
