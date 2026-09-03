import { HomeHeader } from "@/src/components/modules/home";
import { useActiveEvents, useServicesCatalog } from "@/src/hooks/useCatalog";
import { useNewRequest } from "@/src/hooks/useHome";
import { useAuth } from "@/src/providers/AuthProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react-native";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const { handleLogout, handleNavigate } = useNewRequest();
  const { user } = useAuth();
  const router = useRouter();
  const { data: services = [], isLoading, error, refetch } = useServicesCatalog();
  const { data: events = [] } = useActiveEvents();
  const [selectedEventId, setSelectedEventId] = useState("");

  // Auto-seleccionar el primer evento activo disponible
  useEffect(() => {
    if (!selectedEventId && events[0]) setSelectedEventId(events[0].id);
  }, [events, selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const isCapturista = user?.role === "capturista";

  return (
    <View className="flex-1 bg-background">
      <HomeHeader onLogout={handleLogout} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {Platform.OS === "web" && (user?.role === "super_admin" || user?.role === "enlace") && (
          <Pressable onPress={() => router.push("/admin" as any)} className="mb-5 rounded-2xl bg-primary p-5 active:opacity-80">
            <Text className="text-lg font-bold text-primary-foreground">Abrir panel administrativo</Text>
            <Text className="mt-1 text-primary-foreground/80">Consulta las solicitudes asignadas a tu unidad.</Text>
          </Pressable>
        )}

        {/* Sección de eventos de atención */}
        {events.length > 0 && (
          <View className="mb-5 gap-2">
            <Text className="text-lg font-bold">Evento de atención</Text>
            <Text className="text-sm text-muted-foreground">
              {isCapturista
                ? "Jornada activa donde registrarás las solicitudes."
                : "Selecciona la jornada donde se registrará la solicitud."}
            </Text>

            {/* Banner del evento seleccionado (para capturistas) */}
            {isCapturista && selectedEvent && (
              <View className="mt-1 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-primary">FOLIO DEL EVENTO</Text>
                  <View className="rounded-full bg-primary/10 px-3 py-1">
                    <Text className="text-xs font-bold text-primary">{selectedEvent.folioPrefix}-{new Date().getFullYear()}</Text>
                  </View>
                </View>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {selectedEvent.locality} · {selectedEvent.venue}
                </Text>
              </View>
            )}

            <View className="mt-2 gap-2">
              {events.map((event) => (
                <Pressable
                  key={event.id}
                  onPress={() => setSelectedEventId(event.id)}
                  className={`rounded-xl border p-4 ${selectedEventId === event.id ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className={selectedEventId === event.id ? "font-bold text-primary" : "font-semibold"}>
                        {event.name}
                      </Text>
                      <Text className="mt-1 text-xs text-muted-foreground">
                        {event.municipality} · {event.locality && `${event.locality} · `}{event.venue}
                      </Text>
                      <Text className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(event.startsAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                        {event.endsAt && ` – ${new Date(event.endsAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}`}
                      </Text>
                    </View>
                    {selectedEventId === event.id && (
                      <View className="ml-3 rounded-full bg-primary px-2.5 py-1">
                        <Text className="text-xs font-bold text-primary-foreground">{event.folioPrefix}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Catálogo de trámites */}
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#981646" />
            <Text className="mt-3 text-muted-foreground">Cargando trámites y servicios...</Text>
          </View>
        ) : error ? (
          <Pressable onPress={() => refetch()} className="rounded-2xl border border-destructive/30 bg-card p-6">
            <Text className="font-semibold text-destructive">No fue posible cargar el catálogo</Text>
            <Text className="mt-2 text-muted-foreground">Toca para volver a intentar.</Text>
          </Pressable>
        ) : (
          <View>
            <Text className="mb-3 text-lg font-bold">Trámites y servicios</Text>
            <View className="flex-row flex-wrap justify-between">
              {services.map((service, index) => (
                <Pressable
                  key={service.id}
                  className="mb-4 min-h-36 w-[48%] justify-between rounded-2xl border border-border bg-card p-4 active:opacity-70"
                  onPress={() => handleNavigate({ id: service.id, title: service.name, subtitle: service.description, estado: service.active }, selectedEventId)}
                >
                  <View className="flex-row items-center justify-between">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: "#98164620" }}
                    >
                      <Text className="font-bold" style={{ color: "#981646" }}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <Text className="text-xs font-semibold" style={{ color: service.active ? "#981646" : "#afafafff" }}>
                      {service.active ? "Activo" : "Inactivo"}
                    </Text>
                  </View>

                  <View className="mt-5 flex-row items-end justify-between">
                    <Text className="mr-2 flex-1 text-base font-semibold text-card-foreground">
                      {service.name}
                    </Text>
                    <ChevronRight color="#981646" size={19} strokeWidth={2.5} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
