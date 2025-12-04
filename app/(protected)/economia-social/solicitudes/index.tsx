import { FormHeader } from "@/src/components/common";
import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { economiaSocialService } from "@/src/services/economia-social";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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

export default function SolicitudesEconomiaSocialScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const primaryColor = THEME[colorScheme].primary;
  const secondaryColor = THEME[colorScheme].secondary;
  const mutedColor = THEME[colorScheme].muted;
  const backgroundColor = THEME[colorScheme].background;
  const foregroundColor = THEME[colorScheme].foreground;
  const borderColor = THEME[colorScheme].border;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const opacity = colorScheme === "dark" ? 0.1 : 0.05;

  const {
    data: solicitudes,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["tanda2-requests"],
    queryFn: () => economiaSocialService.listTanda2Requests(),
    retry: 1,
  });

  const handleGoBack = () => {
    router.push("/(protected)/(tabs)/home");
  };

  if (error) {
    return (
      <View className="flex-1 bg-background" style={{ position: "relative" }}>
        <FormHeader
          step={1}
          totalSteps={1}
          title="Solicitudes Registradas"
          description="Listado de solicitudes de economía social"
          icon="mdi:table"
          directionName="Economía Social"
          backRoute="/home"
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg mb-4" style={{ color: foregroundColor }}>
            Error al cargar las solicitudes
          </Text>
          <Text
            className="text-base text-center mb-6"
            style={{ color: mutedForegroundColor }}
          >
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar las solicitudes"}
          </Text>
          <Button onPress={() => refetch()}>
            <Text>Reintentar</Text>
          </Button>
          <Button variant="outline" onPress={handleGoBack} className="mt-4">
            <Text>Volver al inicio</Text>
          </Button>
        </View>
      </View>
    );
  }

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

      <FormHeader
        step={1}
        totalSteps={1}
        title="Solicitudes Registradas"
        description="Listado de solicitudes de economía social"
        icon="mdi:table"
        directionName="Economía Social"
        backRoute="/home"
      />

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
                Cargando solicitudes...
              </Text>
            </View>
          ) : !solicitudes || solicitudes.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-lg mb-2" style={{ color: foregroundColor }}>
                No hay solicitudes registradas
              </Text>
              <Text
                className="text-base text-center"
                style={{ color: mutedForegroundColor }}
              >
                Aún no se han registrado solicitudes de economía social.
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
                      flex: 1.5,
                      borderRightColor: borderColor,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: foregroundColor }}
                    >
                      Folio
                    </Text>
                  </View>
                  <View
                    className="p-3 border-r"
                    style={{
                      flex: 1.5,
                      borderRightColor: borderColor,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: foregroundColor }}
                    >
                      Nombre
                    </Text>
                  </View>
                  <View
                    className="p-3 border-r"
                    style={{
                      flex: 1.5,
                      borderRightColor: borderColor,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: foregroundColor }}
                    >
                      Primer apellido
                    </Text>
                  </View>
                  <View
                    className="p-3"
                    style={{
                      flex: 1.5,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: foregroundColor }}
                    >
                      Segundo apellido
                    </Text>
                  </View>
                </View>

                {/* Filas de datos */}
                {solicitudes.map((solicitud, index) => (
                  <View
                    key={solicitud.id || index}
                    className={`flex-row ${
                      index < solicitudes.length - 1 ? "border-b" : ""
                    }`}
                    style={{
                      borderBottomColor:
                        index < solicitudes.length - 1
                          ? borderColor
                          : "transparent",
                    }}
                  >
                    <View
                      className="p-3 border-r"
                      style={{
                        flex: 1.5,
                        borderRightColor: borderColor,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{ color: foregroundColor }}
                      >
                        {solicitud.folio || "N/A"}
                      </Text>
                    </View>
                    <View
                      className="p-3 border-r"
                      style={{
                        flex: 1.5,
                        borderRightColor: borderColor,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{ color: foregroundColor }}
                      >
                        {solicitud.nombre || "N/A"}
                      </Text>
                    </View>
                    <View
                      className="p-3 border-r"
                      style={{
                        flex: 1.5,
                        borderRightColor: borderColor,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{ color: foregroundColor }}
                      >
                        {solicitud.apellido1 || "N/A"}
                      </Text>
                    </View>
                    <View
                      className="p-3"
                      style={{
                        flex: 1.5,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{ color: foregroundColor }}
                      >
                        {solicitud.apellido2 || "-"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Información adicional */}
              <View className="items-center">
                <Text
                  className="text-sm"
                  style={{ color: mutedForegroundColor }}
                >
                  Total de solicitudes: {solicitudes.length}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
