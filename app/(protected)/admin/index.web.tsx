"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { useAuth } from "@/src/providers/AuthProvider";
import {
  adminService,
  AttentionEventInput,
  ServiceInput,
} from "@/src/services/admin";
import { requestsService } from "@/src/services/requests";
import { identityApi } from "@/src/services/identityApi";
import { filesService } from "@/src/services/files";
import {
  FormFieldBuilder,
  isFormBuilderValid,
} from "@/src/components/modules/admin/FormFieldBuilder.web";
import type {
  AdministrativeUnit,
  AttentionEvent,
  ProcedureService,
  ServiceFormField,
  ServiceType,
} from "@/src/types/catalog";
import React, { Suspense } from "react";

// Importación dinámica para evitar que Leaflet se ejecute en el servidor (SSR)
const LocationPicker = React.lazy(() =>
  import("@/src/components/modules/admin/LocationPicker.web").then((m) => ({
    default: m.LocationPicker,
  })),
);
const SecretaryEventsMap = React.lazy(() =>
  import("@/src/components/modules/admin/SecretaryEventsMap.web").then((m) => ({
    default: m.SecretaryEventsMap,
  })),
);

import {
  municipalityFolioCode,
  resolveTabascoMunicipality,
  TABASCO_CENTER,
  TABASCO_MUNICIPALITIES,
} from "@/src/constants/tabasco";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  View,
} from "react-native";

type Section =
  | "resumen"
  | "formulario"
  | "eventos"
  | "tramites"
  | "usuarios"
  | "solicitudes";
type SecretarySection = "resumen" | "eventos" | "solicitudes";
const EMPTY: ServiceInput = {
  unitId: "",
  code: "",
  type: "tramite",
  name: "",
  description: "",
  targetAudience: "",
  cost: "Gratuito",
  active: true,
  usesGlobalForm: true,
  programFolioPrefix: "",
  opensAt: "",
  closesAt: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  requirements: [],
};
const EMPTY_EVENT: AttentionEventInput = {
  name: "",
  municipality: "Centro",
  locality: "",
  municipalityCode: "CENTRO",
  venue: "",
  address: "",
  startsAt: "",
  endsAt: "",
  latitude: TABASCO_CENTER[0],
  longitude: TABASCO_CENTER[1],
  active: true,
  folioPrefix: "CENTRO",
  notes: "",
};

const nav: { key: Section; label: string; icon: string }[] = [
  { key: "resumen", label: "Resumen", icon: "▦" },
  { key: "formulario", label: "Formulario global", icon: "✎" },
  { key: "eventos", label: "Eventos de atención", icon: "⌖" },
  { key: "tramites", label: "Trámites y servicios", icon: "☰" },
  { key: "usuarios", label: "Usuarios y enlaces", icon: "◉" },
  { key: "solicitudes", label: "Solicitudes", icon: "▤" },
];
const secretaryNav: { key: SecretarySection; label: string; icon: string }[] = [
  { key: "resumen", label: "Resumen ejecutivo", icon: "◦" },
  { key: "eventos", label: "Eventos y mapa", icon: "⌖" },
  { key: "solicitudes", label: "Reporte de solicitudes", icon: "▤" },
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold">{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

function UnitPicker({
  units,
  value,
  onChange,
}: {
  units: AdministrativeUnit[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold">Unidad administrativa</Text>
      <View className="flex-row flex-wrap gap-2">
        {units.map((unit) => (
          <Pressable
            key={unit.id}
            onPress={() => onChange(unit.id)}
            className={`rounded-lg border px-3 py-2 ${value === unit.id ? "border-primary bg-primary/10" : "border-border bg-background"}`}
          >
            <Text
              className={`text-sm ${value === unit.id ? "font-semibold text-primary" : ""}`}
            >
              {unit.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <View className="min-w-48 flex-1 rounded-2xl border border-border bg-card p-5">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="mt-2 text-3xl font-bold">{value}</Text>
      <Text className="mt-2 text-xs text-muted-foreground">{note}</Text>
    </View>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const localValue = value ? new Date(value).toISOString().slice(0, 16) : "";
  return (
    <View className="flex-1 gap-2">
      <Text className="text-sm font-semibold">{label}</Text>
      <input
        type="datetime-local"
        value={localValue}
        onChange={(event) =>
          onChange(
            event.currentTarget.value
              ? new Date(event.currentTarget.value).toISOString()
              : "",
          )
        }
        style={{
          minHeight: 40,
          border: "1px solid #d4d4d8",
          borderRadius: 8,
          padding: "8px 12px",
          background: "transparent",
          color: "inherit",
        }}
      />
    </View>
  );
}

const REQUEST_STATUSES = [
  "recibida",
  "en_revision",
  "requiere_informacion",
  "aprobada",
  "rechazada",
  "concluida",
] as const;

function GestorDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<
    Record<string, { status: string; comment: string }>
  >({});
  const [notice, setNotice] = useState<string | null>(null);
  const requests = useQuery({
    queryKey: ["gestor", "requests", user?.unidadAdministrativaId],
    queryFn: requestsService.listAccessible,
  });
  const update = useMutation({
    mutationFn: ({ id }: { id: string }) => {
      const draft = drafts[id];
      return identityApi.updateStatus(id, draft.status, draft.comment);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gestor", "requests"] });
      setNotice("Solicitud actualizada correctamente.");
    },
    onError: (cause: Error) => setNotice(cause.message),
  });

  return (
    <View className="min-h-screen bg-muted/30">
      <View className="flex-row items-center justify-between border-b border-border bg-card px-8 py-5">
        <View>
          <Text className="text-2xl font-bold">Atención de solicitudes</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {user?.nombre} · Solicitudes de tu unidad administrativa
          </Text>
        </View>
        <Button variant="outline" onPress={logout}>
          <Text>Cerrar sesión</Text>
        </Button>
      </View>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 16 }}>
        {notice ? (
          <View className="rounded-xl border border-primary/30 bg-primary/10 p-3">
            <Text className="text-primary">{notice}</Text>
          </View>
        ) : null}
        {requests.isLoading ? <ActivityIndicator color="#981646" /> : null}
        {requests.data?.map((request) => {
          const draft = drafts[request.id] || {
            status: request.status,
            comment: request.notes || "",
          };
          return (
            <View
              key={request.id}
              className="gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-lg font-bold">{request.folio}</Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    Evento: {request.eventFolio || "Sin folio"} ·{" "}
                    {new Date(request.requestedAt).toLocaleString("es-MX")}
                  </Text>
                </View>
                <Text className="capitalize text-primary">
                  {request.status.replaceAll("_", " ")}
                </Text>
              </View>
              <View className="grid grid-cols-[260px_1fr_auto] items-end gap-3">
                <View className="gap-2">
                  <Text className="text-sm font-semibold">Nuevo estatus</Text>
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [request.id]: {
                          ...draft,
                          status: event.currentTarget.value,
                        },
                      }))
                    }
                    style={{
                      minHeight: 40,
                      border: "1px solid #d4d4d8",
                      borderRadius: 8,
                      padding: "8px 12px",
                      background: "transparent",
                      color: "inherit",
                    }}
                  >
                    {REQUEST_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </View>
                <Field
                  label="Comentario de atención"
                  value={draft.comment}
                  onChangeText={(comment) =>
                    setDrafts((current) => ({
                      ...current,
                      [request.id]: { ...draft, comment },
                    }))
                  }
                  placeholder="Describe la atención o resolución"
                />
                <Button
                  disabled={update.isPending}
                  onPress={() => update.mutate({ id: request.id })}
                >
                  <Text>
                    {update.isPending ? "Guardando..." : "Actualizar"}
                  </Text>
                </Button>
              </View>
            </View>
          );
        })}
        {!requests.isLoading && !requests.data?.length ? (
          <Text className="py-16 text-center text-muted-foreground">
            No hay solicitudes asignadas a tu unidad.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SecretaryDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<SecretarySection>("resumen");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const requests = useQuery({
    queryKey: ["secretaria", "requests"],
    queryFn: requestsService.listAllAccessible,
  });
  const services = useQuery({
    queryKey: ["secretaria", "services"],
    queryFn: adminService.listServices,
  });
  const events = useQuery({
    queryKey: ["secretaria", "events"],
    queryFn: adminService.listEvents,
  });
  const units = useQuery({
    queryKey: ["secretaria", "units"],
    queryFn: adminService.listUnits,
  });
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
  const filteredRequests = useMemo(
    () => (requests.data || []).filter((request) => {
      const time = new Date(request.requestedAt).getTime();
      return time >= fromTime && time <= toTime;
    }),
    [requests.data, fromTime, toTime],
  );
  const filteredEvents = useMemo(
    () => (events.data || []).filter((event) => {
      const time = new Date(event.startsAt).getTime();
      return time >= fromTime && time <= toTime;
    }),
    [events.data, fromTime, toTime],
  );
  const serviceNames = useMemo(
    () => Object.fromEntries((services.data || []).map((service) => [service.id, service.name])),
    [services.data],
  );
  const unitNames = useMemo(
    () => Object.fromEntries((units.data || []).map((unit) => [unit.id, unit.name])),
    [units.data],
  );
  const eventNames = useMemo(
    () => Object.fromEntries((events.data || []).map((event) => [event.id, event.name])),
    [events.data],
  );
  const ranking = useMemo(() => {
    const counts = new Map<string, number>();
    for (const request of filteredRequests)
      counts.set(request.serviceId, (counts.get(request.serviceId) || 0) + 1);
    return (services.data || [])
      .map((service) => ({ name: service.name, count: counts.get(service.id) || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filteredRequests, services.data]);
  const changed = filteredRequests.filter((request) => request.status !== "enviada").length;
  const loading = requests.isLoading || services.isLoading || events.isLoading || units.isLoading;
  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = filteredRequests.map((request) => [
      request.folio,
      serviceNames[request.serviceId] || request.serviceId,
      unitNames[request.unitId] || request.unitId,
      request.eventId ? eventNames[request.eventId] || request.eventFolio : "Sin evento",
      new Date(request.requestedAt).toLocaleString("es-MX"),
      request.status.replaceAll("_", " "),
      request.status === "enviada" ? "No" : "Sí",
    ]);
    const csv = [
      ["Folio", "Trámite", "Unidad", "Evento", "Fecha", "Estatus actual", "Estatus modificado"],
      ...rows,
    ].map((row) => row.map(escape).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = `reporte-secretaria-${from || "inicio"}-${to || "hoy"}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <View className="h-screen flex-row bg-muted/30">
      <View className="w-72 border-r border-border bg-card p-5">
        <View className="mb-8 border-b border-border pb-5">
          <Text className="text-xl font-bold text-primary">Jornadas</Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Panel de Secretaría
          </Text>
        </View>
        <View className="gap-2">
          {secretaryNav.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setSection(item.key)}
              className={`flex-row items-center gap-3 rounded-xl px-4 py-3 ${section === item.key ? "bg-primary" : "hover:bg-muted"}`}
            >
              <Text className={section === item.key ? "text-primary-foreground" : "text-muted-foreground"}>
                {item.icon}
              </Text>
              <Text className={`font-medium ${section === item.key ? "text-primary-foreground" : ""}`}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="mt-auto border-t border-border pt-5">
          <Text className="font-semibold">{user?.nombre}</Text>
          <Text className="mb-4 mt-1 text-xs text-muted-foreground">
            Secretaría · Consulta general
          </Text>
          <Button variant="outline" onPress={logout}><Text>Cerrar sesión</Text></Button>
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between border-b border-border bg-background px-8 py-5">
          <View>
            <Text className="text-2xl font-bold">
              {secretaryNav.find((item) => item.key === section)?.label}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Secretaría de Turismo y Desarrollo Económico
            </Text>
          </View>
          {section === "solicitudes" ? (
            <Button disabled={!filteredRequests.length} onPress={exportCsv}>
              <Text>Exportar CSV</Text>
            </Button>
          ) : null}
        </View>
        <ScrollView contentContainerStyle={{ padding: 32, gap: 24 }}>
        <View className="flex-row flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5">
          <View className="gap-2"><Text className="text-sm font-semibold">Desde</Text><input type="date" value={from} onChange={(e) => setFrom(e.currentTarget.value)} className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2" /></View>
          <View className="gap-2"><Text className="text-sm font-semibold">Hasta</Text><input type="date" value={to} onChange={(e) => setTo(e.currentTarget.value)} className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2" /></View>
          <Button variant="outline" onPress={() => { setFrom(""); setTo(""); }}><Text>Limpiar filtro</Text></Button>
          <Text className="ml-auto text-xs text-muted-foreground">Los resultados de esta sección usan el periodo seleccionado.</Text>
        </View>
        {loading ? <ActivityIndicator color="#981646" /> : null}
        {section === "resumen" ? <>
          <View className="flex-row flex-wrap gap-4">
            <Metric label="Solicitudes registradas" value={filteredRequests.length} note="En el periodo seleccionado" />
            <Metric label="Eventos realizados" value={filteredEvents.length} note="Ubicados en el mapa" />
            <Metric label="Con cambio de estatus" value={changed} note="Solicitudes que ya recibieron atención" />
            <Metric label="Trámites disponibles" value={(services.data || []).length} note="Catálogo institucional" />
          </View>
          <View className="flex-row flex-wrap gap-4">
            <View className="min-w-72 flex-1 rounded-2xl border border-border bg-card p-5">
              <Text className="text-sm text-muted-foreground">Trámite más solicitado</Text>
              <Text className="mt-2 text-xl font-bold">{ranking[0]?.name || "Sin datos"}</Text>
              <Text className="mt-1 text-primary">{ranking[0]?.count || 0} solicitudes</Text>
            </View>
            <View className="min-w-72 flex-1 rounded-2xl border border-border bg-card p-5">
              <Text className="text-sm text-muted-foreground">Trámite menos solicitado</Text>
              <Text className="mt-2 text-xl font-bold">{ranking.at(-1)?.name || "Sin datos"}</Text>
              <Text className="mt-1 text-primary">{ranking.at(-1)?.count || 0} solicitudes</Text>
            </View>
          </View>
        </> : null}
        {section === "eventos" ? <>
          <View className="rounded-2xl border border-border bg-card p-5">
            <Text className="mb-1 text-xl font-bold">Mapa de eventos en Tabasco</Text>
            <Text className="mb-4 text-sm text-muted-foreground">Selecciona un marcador para consultar lugar, fecha y folio.</Text>
            <Suspense fallback={<ActivityIndicator color="#981646" />}><SecretaryEventsMap events={filteredEvents as AttentionEvent[]} /></Suspense>
          </View>
          <View className="rounded-2xl border border-border bg-card p-5">
          <Text className="mb-4 text-xl font-bold">Eventos del periodo</Text>
          <View className="gap-2">
            {filteredEvents.map((event) => (
              <View key={event.id} className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-3 rounded-xl bg-muted/50 p-3">
                <View><Text className="font-semibold">{event.name}</Text><Text className="text-xs text-muted-foreground">{event.folioPrefix}</Text></View>
                <Text>{event.locality}, {event.municipality}</Text>
                <Text>{new Date(event.startsAt).toLocaleString("es-MX")}</Text>
                <Text className={event.active ? "text-green-700" : "text-muted-foreground"}>{event.active ? "Activo" : "Cerrado"}</Text>
              </View>
            ))}
            {!filteredEvents.length ? <Text className="py-6 text-center text-muted-foreground">No hay eventos en el rango seleccionado.</Text> : null}
          </View>
          </View>
        </> : null}
        {section === "solicitudes" ? <View className="rounded-2xl border border-border bg-card p-5">
          <Text className="mb-4 text-xl font-bold">Detalle de solicitudes</Text>
          <View className="gap-2">
            {filteredRequests.map((request) => (
              <View key={request.id} className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] items-center gap-3 rounded-xl bg-muted/50 p-3">
                <View><Text className="font-semibold">{request.folio}</Text><Text className="text-xs text-muted-foreground">{new Date(request.requestedAt).toLocaleDateString("es-MX")}</Text></View>
                <Text>{serviceNames[request.serviceId] || "Trámite no disponible"}</Text>
                <Text>{unitNames[request.unitId] || "Unidad no disponible"}</Text>
                <Text className="capitalize">{request.status.replaceAll("_", " ")}</Text>
                <Text className={request.status === "enviada" ? "text-muted-foreground" : "text-green-700"}>{request.status === "enviada" ? "Sin cambio" : "Modificado"}</Text>
              </View>
            ))}
            {!filteredRequests.length ? <Text className="py-6 text-center text-muted-foreground">No hay solicitudes en el rango seleccionado.</Text> : null}
          </View>
        </View> : null}
        </ScrollView>
      </View>
    </View>
  );
}

function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>("resumen");
  const [serviceModal, setServiceModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [form, setForm] = useState<ServiceInput>(EMPTY);
  const [requirements, setRequirements] = useState("");
  const [specificFieldsDraft, setSpecificFieldsDraft] = useState<
    ServiceFormField[]
  >([]);
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [invite, setInvite] = useState<{
    name: string;
    email: string;
    password: string;
    unitId: string;
    role: "secretaria" | "enlace" | "gestor" | "capturista";
  }>({ name: "", email: "", password: "", unitId: "", role: "capturista" });
  const [eventForm, setEventForm] = useState<AttentionEventInput>(EMPTY_EVENT);
  const [globalFieldsDraft, setGlobalFieldsDraft] = useState<
    ServiceFormField[]
  >([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [solicitudesEventFilter, setSolicitudesEventFilter] =
    useState<string>("");

  const units = useQuery({
    queryKey: ["admin", "units"],
    queryFn: adminService.listUnits,
  });
  const services = useQuery({
    queryKey: ["admin", "services"],
    queryFn: adminService.listServices,
  });
  const profiles = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: adminService.listProfiles,
  });
  const requests = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: requestsService.listAccessible,
  });
  const events = useQuery({
    queryKey: ["admin", "events"],
    queryFn: adminService.listEvents,
  });
  const globalForm = useQuery({
    queryKey: ["admin", "global-form"],
    queryFn: adminService.getGlobalForm,
  });
  const unitNames = useMemo(
    () =>
      Object.fromEntries(
        (units.data || []).map((unit) => [unit.id, unit.name]),
      ),
    [units.data],
  );

  const save = useMutation({
    mutationFn: async () => {
      let image = {
        imageFileId: form.imageFileId,
        imageUrl: form.imageUrl,
      };
      if (serviceImage) {
        const uploaded = await filesService.uploadImage(
          serviceImage,
          "catalog_images",
        );
        image = { imageFileId: uploaded.filename, imageUrl: uploaded.url };
      }
      return adminService.saveService({
        ...form,
        ...image,
        requirements: requirements
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        formConfig: {
          fields: specificFieldsDraft.map((field) => ({
            ...field,
            label: field.label.trim(),
            placeholder: field.placeholder?.trim(),
            options: field.options
              ?.map((option) => option.trim())
              .filter(Boolean),
          })),
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setServiceModal(false);
      setNotice("Trámite guardado correctamente.");
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const createUser = useMutation({
    mutationFn: () => adminService.createStaffUser(invite),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
      setUserModal(false);
      setInvite({
        name: "",
        email: "",
        password: "",
        unitId: "",
        role: "capturista",
      });
      setNotice("Usuario creado y relacionado correctamente.");
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const saveEvent = useMutation({
    mutationFn: () => adminService.saveEvent(eventForm),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      setEventModal(false);
      setNotice("Evento de atención guardado correctamente.");
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const saveGlobalForm = useMutation({
    mutationFn: () => {
      if (!globalForm.data)
        throw new Error("No se cargó la configuración global");
      return adminService.saveGlobalForm({
        ...globalForm.data,
        version: globalForm.data.version + 1,
        fields: globalFieldsDraft.map((field) => ({
          ...field,
          label: field.label.trim(),
          placeholder: field.placeholder?.trim(),
          options: field.options
            ?.map((option) => option.trim())
            .filter(Boolean),
        })),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "global-form"],
      });
      setNotice("Formulario global actualizado.");
    },
    onError: (error: Error) => setNotice(error.message),
  });

  const openNew = () => {
    setForm({ ...EMPTY, unitId: units.data?.[0]?.id || "" });
    setRequirements("");
    setSpecificFieldsDraft([]);
    setServiceImage(null);
    setServiceModal(true);
  };
  const openEdit = async (item: ProcedureService) => {
    const reqs = await adminService.listRequirements(item.id);
    setForm({
      ...item,
      programFolioPrefix: item.programFolioPrefix || item.code,
      requirements: reqs.map((x) => x.name),
    });
    setRequirements(reqs.map((x) => x.name).join("\n"));
    setSpecificFieldsDraft(
      (item.formConfig?.fields || []).map((field, index) => ({
        ...field,
        key: field.key || `pregunta_${Date.now()}_${index + 1}`,
      })),
    );
    setServiceImage(null);
    setServiceModal(true);
  };
  const openGlobalForm = () =>
    setGlobalFieldsDraft(
      (globalForm.data?.fields || []).map((field, index) => ({
        ...field,
        key: field.key || `pregunta_${Date.now()}_${index + 1}`,
        options:
          field.type === "select" &&
          `${field.key} ${field.label}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes("municipio") &&
          !field.options?.length
            ? [...TABASCO_MUNICIPALITIES]
            : field.options,
      })),
    );
  const openNewEvent = () => {
    setEventForm({ ...EMPTY_EVENT });
    setEventModal(true);
    setNotice(null);
  };
  const loading =
    units.isLoading ||
    services.isLoading ||
    profiles.isLoading ||
    requests.isLoading ||
    events.isLoading ||
    globalForm.isLoading;

  return (
    <View className="h-screen flex-row bg-muted/30">
      <View className="w-72 border-r border-border bg-card p-5">
        <View className="mb-8 border-b border-border pb-5">
          <Text className="text-xl font-bold text-primary">Jornadas</Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Panel de administración
          </Text>
        </View>
        <View className="gap-2">
          {nav.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => {
                setSection(item.key);
                setNotice(null);
                if (item.key === "formulario") openGlobalForm();
              }}
              className={`flex-row items-center gap-3 rounded-xl px-4 py-3 ${section === item.key ? "bg-primary" : "hover:bg-muted"}`}
            >
              <Text
                className={
                  section === item.key
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }
              >
                {item.icon}
              </Text>
              <Text
                className={`font-medium ${section === item.key ? "text-primary-foreground" : ""}`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="mt-auto border-t border-border pt-5">
          <Text className="font-semibold">{user?.nombre}</Text>
          <Text className="mb-4 mt-1 text-xs text-muted-foreground">
            Superadministrador
          </Text>
          <Button variant="outline" onPress={logout}>
            <Text>Cerrar sesión</Text>
          </Button>
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between border-b border-border bg-background px-8 py-5">
          <View>
            <Text className="text-2xl font-bold">
              {nav.find((x) => x.key === section)?.label}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Secretaría de Turismo y Desarrollo Económico
            </Text>
          </View>
          {section === "tramites" ? (
            <Button onPress={openNew}>
              <Text>+ Nuevo trámite</Text>
            </Button>
          ) : section === "eventos" ? (
            <Button onPress={openNewEvent}>
              <Text>+ Nuevo evento</Text>
            </Button>
          ) : section === "usuarios" ? (
            <Button
              onPress={() => {
                setInvite((x) => ({
                  ...x,
                  unitId: x.unitId || units.data?.[0]?.id || "",
                }));
                setUserModal(true);
              }}
            >
              <Text>+ Nuevo usuario</Text>
            </Button>
          ) : null}
        </View>
        {notice ? (
          <View className="mx-8 mt-5 rounded-xl border border-primary/30 bg-primary/10 p-3">
            <Text className="text-primary">{notice}</Text>
          </View>
        ) : null}
        <ScrollView contentContainerStyle={{ padding: 32, gap: 20 }}>
          {loading ? (
            <ActivityIndicator color="#981646" />
          ) : (
            <>
              {section === "resumen" && (
                <>
                  <View className="flex-row flex-wrap gap-4">
                    <Metric
                      label="Eventos de atención"
                      value={events.data?.length || 0}
                      note={`${events.data?.filter((x) => x.active).length || 0} activos`}
                    />
                    <Metric
                      label="Trámites y servicios"
                      value={services.data?.length || 0}
                      note={`${services.data?.filter((x) => x.active).length || 0} disponibles`}
                    />
                    <Metric
                      label="Usuarios"
                      value={profiles.data?.length || 0}
                      note={`${profiles.data?.filter((x) => x.role === "enlace").length || 0} enlaces`}
                    />
                    <Metric
                      label="Solicitudes"
                      value={requests.data?.length || 0}
                      note="Registros visibles"
                    />
                  </View>
                  <View className="rounded-2xl border border-border bg-card p-6">
                    <Text className="text-lg font-bold">Accesos rápidos</Text>
                    <View className="mt-4 flex-row flex-wrap gap-3">
                      <Button onPress={() => setSection("eventos")}>
                        <Text>Crear evento</Text>
                      </Button>
                      <Button
                        variant="outline"
                        onPress={() => setSection("tramites")}
                      >
                        <Text>Administrar trámites</Text>
                      </Button>
                      <Button
                        variant="outline"
                        onPress={() => {
                          setSection("formulario");
                          openGlobalForm();
                        }}
                      >
                        <Text>Formulario global</Text>
                      </Button>
                    </View>
                  </View>
                </>
              )}
              {section === "formulario" && (
                <View className="mx-auto w-full max-w-4xl gap-5 rounded-2xl border border-border bg-card p-7">
                  <View>
                    <Text className="text-xl font-bold">
                      Formulario general de solicitudes
                    </Text>
                    <Text className="mt-2 text-sm text-muted-foreground">
                      Estos campos se presentan en todos los trámites antes del
                      formulario específico. Versión actual:{" "}
                      {globalForm.data?.version || 1}.
                    </Text>
                  </View>
                  <View className="gap-4">
                    {globalFieldsDraft.map((field, index) => (
                      <View
                        key={`${field.key}-${index}`}
                        className="gap-4 rounded-xl border border-border bg-background p-5"
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="font-bold">
                            Pregunta {index + 1}
                          </Text>
                          <View className="flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={index === 0}
                              onPress={() =>
                                setGlobalFieldsDraft((current) => {
                                  const next = [...current];
                                  [next[index - 1], next[index]] = [
                                    next[index],
                                    next[index - 1],
                                  ];
                                  return next;
                                })
                              }
                            >
                              <Text>↑</Text>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={index === globalFieldsDraft.length - 1}
                              onPress={() =>
                                setGlobalFieldsDraft((current) => {
                                  const next = [...current];
                                  [next[index], next[index + 1]] = [
                                    next[index + 1],
                                    next[index],
                                  ];
                                  return next;
                                })
                              }
                            >
                              <Text>↓</Text>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onPress={() =>
                                setGlobalFieldsDraft((current) =>
                                  current.filter(
                                    (_, itemIndex) => itemIndex !== index,
                                  ),
                                )
                              }
                            >
                              <Text>Eliminar</Text>
                            </Button>
                          </View>
                        </View>
                        <Field
                          label="Pregunta"
                          value={field.label}
                          onChangeText={(label) =>
                            setGlobalFieldsDraft((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, label } : item,
                              ),
                            )
                          }
                          placeholder="Ej. ¿Cuál es tu municipio?"
                        />
                        <View className="grid grid-cols-2 gap-4">
                          <View className="gap-2">
                            <Text className="text-sm font-semibold">
                              Tipo de respuesta
                            </Text>
                            <select
                              value={field.type || "text"}
                              onChange={(event) => {
                                const type = event.currentTarget
                                  .value as ServiceFormField["type"];
                                setGlobalFieldsDraft((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, type }
                                      : item,
                                  ),
                                );
                              }}
                              style={{
                                minHeight: 40,
                                border: "1px solid #d4d4d8",
                                borderRadius: 8,
                                padding: "8px 12px",
                                background: "transparent",
                                color: "inherit",
                              }}
                            >
                              <option value="text">Texto corto</option>
                              <option value="textarea">Texto largo</option>
                              <option value="number">Número</option>
                              <option value="email">Correo electrónico</option>
                              <option value="tel">Teléfono</option>
                              <option value="date">Fecha</option>
                              <option value="select">Selección única</option>
                              <option value="multiselect">
                                Selección múltiple
                              </option>
                              <option value="boolean">Sí / No</option>
                            </select>
                          </View>
                          <Field
                            label="Texto de ayuda"
                            value={field.placeholder || ""}
                            onChangeText={(placeholder) =>
                              setGlobalFieldsDraft((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, placeholder }
                                    : item,
                                ),
                              )
                            }
                            placeholder="Indicación para responder"
                          />
                        </View>
                        {field.type === "select" ||
                        field.type === "multiselect" ? (
                          <View className="gap-3">
                            <Text className="text-sm font-semibold">
                              Opciones de respuesta
                            </Text>
                            {(field.options || []).map(
                              (option, optionIndex) => (
                                <View
                                  key={optionIndex}
                                  className="flex-row items-center gap-2"
                                >
                                  <View className="flex-1">
                                    <Input
                                      value={option}
                                      onChangeText={(value) =>
                                        setGlobalFieldsDraft((current) =>
                                          current.map((item, itemIndex) => {
                                            if (itemIndex !== index)
                                              return item;
                                            const options = [
                                              ...(item.options || []),
                                            ];
                                            options[optionIndex] = value;
                                            return { ...item, options };
                                          }),
                                        )
                                      }
                                      placeholder={`Opción ${optionIndex + 1}`}
                                    />
                                  </View>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={optionIndex === 0}
                                    onPress={() =>
                                      setGlobalFieldsDraft((current) =>
                                        current.map((item, itemIndex) => {
                                          if (itemIndex !== index) return item;
                                          const options = [
                                            ...(item.options || []),
                                          ];
                                          [
                                            options[optionIndex - 1],
                                            options[optionIndex],
                                          ] = [
                                            options[optionIndex],
                                            options[optionIndex - 1],
                                          ];
                                          return { ...item, options };
                                        }),
                                      )
                                    }
                                  >
                                    <Text>↑</Text>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                      optionIndex ===
                                      (field.options?.length || 0) - 1
                                    }
                                    onPress={() =>
                                      setGlobalFieldsDraft((current) =>
                                        current.map((item, itemIndex) => {
                                          if (itemIndex !== index) return item;
                                          const options = [
                                            ...(item.options || []),
                                          ];
                                          [
                                            options[optionIndex],
                                            options[optionIndex + 1],
                                          ] = [
                                            options[optionIndex + 1],
                                            options[optionIndex],
                                          ];
                                          return { ...item, options };
                                        }),
                                      )
                                    }
                                  >
                                    <Text>↓</Text>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onPress={() =>
                                      setGlobalFieldsDraft((current) =>
                                        current.map((item, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...item,
                                                options: (
                                                  item.options || []
                                                ).filter(
                                                  (_, currentOptionIndex) =>
                                                    currentOptionIndex !==
                                                    optionIndex,
                                                ),
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  >
                                    <Text>Quitar</Text>
                                  </Button>
                                </View>
                              ),
                            )}
                            <Button
                              variant="outline"
                              onPress={() =>
                                setGlobalFieldsDraft((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          options: [
                                            ...(item.options || []),
                                            "",
                                          ],
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              <Text>+ Agregar opción</Text>
                            </Button>
                          </View>
                        ) : null}
                        <View className="flex-row items-center justify-between rounded-lg bg-muted p-3">
                          <View>
                            <Text className="font-semibold">
                              Pregunta obligatoria
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              Desactiva esta opción para que sea opcional.
                            </Text>
                          </View>
                          <Switch
                            value={field.required !== false}
                            onValueChange={(required) =>
                              setGlobalFieldsDraft((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, required }
                                    : item,
                                ),
                              )
                            }
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                  <Button
                    variant="outline"
                    onPress={() =>
                      setGlobalFieldsDraft((current) => [
                        ...current,
                        {
                          key: `pregunta_${Date.now()}_${current.length + 1}`,
                          label: "",
                          type: "text",
                          required: true,
                        },
                      ])
                    }
                  >
                    <Text>+ Agregar pregunta</Text>
                  </Button>
                  <View className="flex-row justify-end">
                    <Button
                      disabled={
                        saveGlobalForm.isPending ||
                        !globalFieldsDraft.length ||
                        globalFieldsDraft.some(
                          (field) =>
                            !field.key.trim() ||
                            !field.label.trim() ||
                            ((field.type === "select" ||
                              field.type === "multiselect") &&
                              (!field.options?.length ||
                                field.options.some(
                                  (option) => !option.trim(),
                                ) ||
                                new Set(
                                  field.options.map((option) =>
                                    option.trim().toLowerCase(),
                                  ),
                                ).size !== field.options.length)),
                        ) ||
                        new Set(globalFieldsDraft.map((field) => field.key))
                          .size !== globalFieldsDraft.length
                      }
                      onPress={() => saveGlobalForm.mutate()}
                    >
                      <Text>
                        {saveGlobalForm.isPending
                          ? "Guardando..."
                          : "Guardar formulario global"}
                      </Text>
                    </Button>
                  </View>
                </View>
              )}
              {section === "eventos" && (
                <View className="overflow-hidden rounded-2xl border border-border bg-card">
                  <View className="flex-row bg-muted px-5 py-3">
                    <Text className="flex-1 text-xs font-bold">
                      EVENTO / FOLIO
                    </Text>
                    <Text className="w-48 text-xs font-bold">
                      LOCALIDAD / MUNICIPIO
                    </Text>
                    <Text className="w-48 text-xs font-bold">FECHA Y HORA</Text>
                    <Text className="w-28 text-xs font-bold">ESTADO</Text>
                  </View>
                  {events.data?.length ? (
                    events.data.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setEventForm(item);
                          setEventModal(true);
                        }}
                        className="flex-row items-center border-t border-border px-5 py-4 hover:bg-muted/40"
                      >
                        <View className="flex-1">
                          <Text className="font-semibold">{item.name}</Text>
                          <Text className="mt-1 text-xs text-muted-foreground">
                            Folio {item.folioPrefix}
                          </Text>
                        </View>
                        <View className="w-48">
                          <Text>{item.locality}</Text>
                          <Text className="mt-1 text-xs text-muted-foreground">
                            {item.municipality}
                          </Text>
                        </View>
                        <Text className="w-48 text-sm">
                          {new Date(item.startsAt).toLocaleString("es-MX")}
                        </Text>
                        <Text
                          className={`w-28 font-semibold ${item.active ? "text-emerald-600" : "text-muted-foreground"}`}
                        >
                          {item.active ? "Activo" : "Cerrado"}
                        </Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text className="p-10 text-center text-muted-foreground">
                      Todavía no hay eventos. Crea el primero para comenzar a
                      registrar atenciones.
                    </Text>
                  )}
                </View>
              )}
              {section === "tramites" && (
                <View className="overflow-hidden rounded-2xl border border-border bg-card">
                  <View className="flex-row bg-muted px-5 py-3">
                    <Text className="w-32 text-xs font-bold">CLAVE</Text>
                    <Text className="flex-1 text-xs font-bold">NOMBRE</Text>
                    <Text className="w-64 text-xs font-bold">UNIDAD</Text>
                    <Text className="w-28 text-xs font-bold">ESTADO</Text>
                  </View>
                  {services.data?.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => openEdit(item)}
                      className="flex-row items-center border-t border-border px-5 py-4 hover:bg-muted/40"
                    >
                      <Text className="w-32 text-sm font-semibold">
                        {item.code}
                      </Text>
                      <View className="flex-1">
                        <Text className="font-semibold">{item.name}</Text>
                        <Text className="mt-1 text-xs text-muted-foreground">
                          {item.type}
                        </Text>
                      </View>
                      <Text className="w-64 text-sm">
                        {unitNames[item.unitId] || item.unitId}
                      </Text>
                      <Text
                        className={`w-28 text-sm font-semibold ${item.active ? "text-emerald-600" : "text-muted-foreground"}`}
                      >
                        {item.active ? "Activo" : "Inactivo"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {section === "usuarios" && (
                <View className="overflow-hidden rounded-2xl border border-border bg-card">
                  <View className="flex-row bg-muted px-5 py-3">
                    <Text className="flex-1 text-xs font-bold">USUARIO</Text>
                    <Text className="w-48 text-xs font-bold">ROL</Text>
                    <Text className="w-72 text-xs font-bold">UNIDAD</Text>
                    <Text className="w-24 text-xs font-bold">ESTADO</Text>
                  </View>
                  {profiles.data?.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center border-t border-border px-5 py-4"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold">{item.name}</Text>
                        <Text className="text-xs text-muted-foreground">
                          {item.email}
                        </Text>
                      </View>
                      <Text className="w-48 capitalize">
                        {item.role.replace("_", " ")}
                      </Text>
                      <Text className="w-72">
                        {item.unitId ? unitNames[item.unitId] : "Acceso global"}
                      </Text>
                      <Text
                        className={`w-24 font-semibold ${item.active ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {item.active ? "Activo" : "Inactivo"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {section === "solicitudes" && (
                <View className="gap-4">
                  {/* Filtro por evento */}
                  <View className="flex-row items-center gap-3">
                    <Text className="text-sm font-semibold">
                      Filtrar por evento:
                    </Text>
                    <select
                      value={solicitudesEventFilter}
                      onChange={(e) =>
                        setSolicitudesEventFilter(e.currentTarget.value)
                      }
                      style={{
                        minHeight: 36,
                        border: "1px solid #d4d4d8",
                        borderRadius: 8,
                        padding: "4px 10px",
                        background: "transparent",
                        color: "inherit",
                        minWidth: 260,
                      }}
                    >
                      <option value="">Todos los eventos</option>
                      {events.data?.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} · {event.municipality}
                        </option>
                      ))}
                    </select>
                    {solicitudesEventFilter && (
                      <Text className="text-xs text-muted-foreground">
                        {requests.data?.filter(
                          (r) => r.eventId === solicitudesEventFilter,
                        ).length ?? 0}{" "}
                        solicitudes
                      </Text>
                    )}
                  </View>
                  <View className="overflow-hidden rounded-2xl border border-border bg-card">
                    <View className="flex-row bg-muted px-5 py-3">
                      <Text className="flex-1 text-xs font-bold">FOLIO</Text>
                      <Text className="w-48 text-xs font-bold">
                        FOLIO EVENTO
                      </Text>
                      <Text className="w-64 text-xs font-bold">UNIDAD</Text>
                      <Text className="w-40 text-xs font-bold">FECHA</Text>
                      <Text className="w-44 text-xs font-bold">ESTATUS</Text>
                    </View>
                    {(() => {
                      const filtered = solicitudesEventFilter
                        ? (requests.data ?? []).filter(
                            (r) => r.eventId === solicitudesEventFilter,
                          )
                        : (requests.data ?? []);
                      if (!filtered.length) {
                        return (
                          <Text className="p-10 text-center text-muted-foreground">
                            {solicitudesEventFilter
                              ? "No hay solicitudes para este evento."
                              : "No hay solicitudes registradas."}
                          </Text>
                        );
                      }
                      return filtered.map((item) => (
                        <View
                          key={item.id}
                          className="flex-row border-t border-border px-5 py-4"
                        >
                          <Text className="flex-1 font-semibold">
                            {item.folio || item.programFolio || "—"}
                          </Text>
                          <Text className="w-48 text-sm text-muted-foreground">
                            {item.eventFolio || "—"}
                          </Text>
                          <Text className="w-64">
                            {unitNames[item.unitId] || item.unitId || "—"}
                          </Text>
                          <Text className="w-40">
                            {item.requestedAt
                              ? new Date(item.requestedAt).toLocaleDateString(
                                  "es-MX",
                                )
                              : "—"}
                          </Text>
                          <Text className="w-44 capitalize text-primary">
                            {(item.status ?? "").replaceAll("_", " ")}
                          </Text>
                        </View>
                      ));
                    })()}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>

      <Modal
        visible={serviceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setServiceModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-8">
          <View className="max-h-[90vh] w-full max-w-3xl rounded-2xl bg-background p-7">
            <ScrollView contentContainerStyle={{ gap: 16 }}>
              <Text className="text-2xl font-bold">
                {form.id ? "Editar" : "Nuevo"} trámite
              </Text>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Field
                    label="Prefijo del folio"
                    value={form.programFolioPrefix || ""}
                    onChangeText={(value) => {
                      const prefix = value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase();
                      setForm({
                        ...form,
                        code: prefix,
                        programFolioPrefix: prefix,
                      });
                    }}
                    placeholder="Ej. TANDAS"
                  />
                </View>
                <View className="flex-[2]">
                  <Field
                    label="Nombre"
                    value={form.name}
                    onChangeText={(name) => setForm({ ...form, name })}
                  />
                </View>
              </View>
              <Field
                label="Descripción"
                value={form.description}
                onChangeText={(description) =>
                  setForm({ ...form, description })
                }
              />
              <Field
                label="Población objetivo"
                value={form.targetAudience || ""}
                onChangeText={(targetAudience) =>
                  setForm({ ...form, targetAudience })
                }
              />
              <View className="gap-2 rounded-xl border border-border p-4">
                <Text className="text-sm font-semibold">
                  Imagen del programa, servicio o trámite (opcional)
                </Text>
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.name || "Imagen actual"}
                    style={{
                      width: 180,
                      height: 110,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                ) : null}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setServiceImage(event.currentTarget.files?.[0] || null)
                  }
                />
                <Text className="text-xs text-muted-foreground">
                  JPG, PNG o WebP. Máximo 10 MB.
                </Text>
              </View>
              <View className="flex-row gap-2">
                {(["tramite", "servicio", "programa"] as ServiceType[]).map(
                  (type) => (
                    <Pressable
                      key={type}
                      onPress={() => setForm({ ...form, type })}
                      className={`rounded-lg border px-4 py-2 ${form.type === type ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      <Text className="capitalize">{type}</Text>
                    </Pressable>
                  ),
                )}
              </View>
              <UnitPicker
                units={units.data || []}
                value={form.unitId}
                onChange={(unitId) => setForm({ ...form, unitId })}
              />
              <View className="grid grid-cols-3 gap-4">
                <Field
                  label="Titular actual de la unidad (opcional)"
                  value={form.contactName || ""}
                  onChangeText={(contactName) =>
                    setForm({ ...form, contactName })
                  }
                />
                <Field
                  label="Correo de contacto (opcional)"
                  value={form.contactEmail || ""}
                  onChangeText={(contactEmail) =>
                    setForm({ ...form, contactEmail })
                  }
                  placeholder="titular@tabasco.gob.mx"
                />
                <Field
                  label="Número de celular (opcional)"
                  value={form.contactPhone || ""}
                  onChangeText={(contactPhone) =>
                    setForm({ ...form, contactPhone })
                  }
                  placeholder="993 000 0000"
                />
              </View>
              <View className="flex-row gap-4">
                <DateTimeField
                  label="Apertura (opcional)"
                  value={form.opensAt || ""}
                  onChange={(opensAt) => setForm({ ...form, opensAt })}
                />
                <DateTimeField
                  label="Cierre (opcional)"
                  value={form.closesAt || ""}
                  onChange={(closesAt) => setForm({ ...form, closesAt })}
                />
              </View>
              <Field
                label="Requisitos, uno por línea"
                value={requirements}
                onChangeText={setRequirements}
              />
              <View className="gap-3 rounded-xl border border-border p-4">
                <View>
                  <Text className="font-bold">
                    Formulario propio del trámite
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    Estas preguntas se mostrarán después del formulario global.
                  </Text>
                </View>
                <FormFieldBuilder
                  fields={specificFieldsDraft}
                  onChange={setSpecificFieldsDraft}
                />
              </View>
              <View className="rounded-xl border border-border p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold">
                      Usar formulario global
                    </Text>
                    <Text className="mt-1 text-xs text-muted-foreground">
                      Combina los datos generales con el formulario propio del
                      trámite.
                    </Text>
                  </View>
                  <Switch
                    value={form.usesGlobalForm ?? true}
                    onValueChange={(usesGlobalForm) =>
                      setForm({ ...form, usesGlobalForm })
                    }
                  />
                </View>
              </View>
              <View className="rounded-xl bg-primary/10 p-4">
                <Text className="text-sm font-semibold text-primary">
                  Ejemplo del próximo folio
                </Text>
                <Text className="mt-1 text-xl font-bold text-primary">
                  {form.programFolioPrefix || "TANDAS"}-000001
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold">Disponible</Text>
                <Switch
                  value={form.active}
                  onValueChange={(active) => setForm({ ...form, active })}
                />
              </View>
              <View className="flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onPress={() => setServiceModal(false)}
                >
                  <Text>Cancelar</Text>
                </Button>
                <Button
                  disabled={
                    save.isPending ||
                    !form.unitId ||
                    !form.name ||
                    !form.description ||
                    !form.targetAudience ||
                    !form.code ||
                    !form.programFolioPrefix ||
                    !isFormBuilderValid(specificFieldsDraft) ||
                    !requirements
                  }
                  onPress={() => save.mutate()}
                >
                  <Text>
                    {save.isPending ? "Guardando..." : "Guardar cambios"}
                  </Text>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={eventModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEventModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-8">
          <View className="max-h-[94vh] w-full max-w-5xl rounded-2xl bg-background p-7">
            <ScrollView contentContainerStyle={{ gap: 18 }}>
              <View>
                <Text className="text-2xl font-bold">
                  {eventForm.id ? "Editar evento" : "Crear evento de atención"}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  Selecciona un punto en el mapa para guardar la ubicación
                  exacta.
                </Text>
              </View>
              <Field
                label="Nombre del evento"
                value={eventForm.name}
                onChangeText={(name) => setEventForm({ ...eventForm, name })}
                placeholder="Ej. Jornada de Atención Huimanguillo"
              />
              <DateTimeField
                label="Fecha y hora"
                value={eventForm.startsAt}
                onChange={(startsAt) =>
                  setEventForm({
                    ...eventForm,
                    startsAt,
                    endsAt: startsAt,
                  })
                }
              />
              <Field
                label="Notas del evento"
                value={eventForm.notes || ""}
                onChangeText={(notes) => setEventForm({ ...eventForm, notes })}
                placeholder="Información adicional para el personal capturista"
              />
              <View className="grid grid-cols-[1fr_280px] gap-5">
                <Suspense
                  fallback={
                    <View
                      style={{
                        height: 360,
                        backgroundColor: "#f4f4f5",
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text>Cargando mapa...</Text>
                    </View>
                  }
                >
                  {eventModal && (
                    <LocationPicker
                      latitude={eventForm.latitude}
                      longitude={eventForm.longitude}
                      locality={eventForm.locality}
                      onChange={(latitude, longitude) =>
                        setEventForm({ ...eventForm, latitude, longitude })
                      }
                      onPlaceSelected={(
                        locality,
                        address,
                        latitude,
                        longitude,
                        detectedMunicipality,
                      ) => {
                        const municipality = resolveTabascoMunicipality(
                          detectedMunicipality || address,
                        );
                        const municipalityCode =
                          municipalityFolioCode(municipality);
                        setEventForm({
                          ...eventForm,
                          locality,
                          address,
                          latitude,
                          longitude,
                          municipality,
                          municipalityCode,
                          folioPrefix:
                            municipalityCode === eventForm.municipalityCode
                              ? eventForm.folioPrefix
                              : municipalityCode,
                        });
                      }}
                    />
                  )}
                </Suspense>
                <View className="gap-4 rounded-xl border border-border p-4">
                  <Text className="font-bold">Ubicación seleccionada</Text>
                  <View>
                    <Text className="text-xs text-muted-foreground">
                      Dirección
                    </Text>
                    <Text className="font-semibold">
                      {eventForm.address ||
                        "Busca una ubicación o selecciona un punto en el mapa"}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted-foreground">
                      Localidad / municipio
                    </Text>
                    <Text className="font-semibold">
                      {eventForm.locality || "—"} /{" "}
                      {eventForm.municipality || "—"}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    Coordenadas: {eventForm.latitude.toFixed(6)},{" "}
                    {eventForm.longitude.toFixed(6)}
                  </Text>
                  <View className="rounded-lg bg-primary/10 p-3">
                    <Text className="text-xs font-semibold text-primary">
                      Folio automático
                    </Text>
                    <Text className="text-lg font-bold text-primary">
                      {/-\d+$/.test(eventForm.folioPrefix)
                        ? eventForm.folioPrefix
                        : `${eventForm.municipalityCode || "MUNICIPIO"}-##`}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between rounded-xl bg-muted p-4">
                <View>
                  <Text className="font-semibold">Evento activo</Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    Permite registrar solicitudes durante esta jornada.
                  </Text>
                </View>
                <Switch
                  value={eventForm.active}
                  onValueChange={(active) =>
                    setEventForm({ ...eventForm, active })
                  }
                />
              </View>
              <View className="flex-row justify-end gap-3">
                <Button variant="outline" onPress={() => setEventModal(false)}>
                  <Text>Cancelar</Text>
                </Button>
                <Button
                  disabled={
                    saveEvent.isPending ||
                    !eventForm.name ||
                    !eventForm.locality ||
                    !eventForm.municipality ||
                    !eventForm.address ||
                    !eventForm.startsAt
                  }
                  onPress={() => saveEvent.mutate()}
                >
                  <Text>
                    {saveEvent.isPending ? "Guardando..." : "Guardar evento"}
                  </Text>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={userModal}
        transparent
        animationType="fade"
        onRequestClose={() => setUserModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-8">
          <View className="w-full max-w-xl rounded-2xl bg-background p-7">
            <View className="gap-5">
              <Text className="text-2xl font-bold">
                Nuevo usuario institucional
              </Text>
              <View className="gap-2">
                <Text className="text-sm font-semibold">Rol</Text>
                <View className="flex-row gap-2">
                  {(["capturista", "gestor", "enlace", "secretaria"] as const).map((role) => (
                    <Pressable
                      key={role}
                      onPress={() => setInvite({ ...invite, role })}
                      className={`flex-1 rounded-xl border p-3 ${invite.role === role ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      <Text className="text-center capitalize">{role}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text className="text-xs text-muted-foreground">
                  Capturista genera solicitudes; gestor y enlace atienden su unidad;
                  Secretaría consulta el reporte general de solo lectura.
                </Text>
              </View>
              <Field
                label="Nombre completo"
                value={invite.name}
                onChangeText={(name) => setInvite({ ...invite, name })}
              />
              <Field
                label="Correo @tabasco.gob.mx"
                value={invite.email}
                onChangeText={(email) =>
                  setInvite({ ...invite, email: email.toLowerCase() })
                }
              />
              <Field
                label="Contraseña temporal"
                value={invite.password}
                onChangeText={(password) => setInvite({ ...invite, password })}
                secureTextEntry
              />
              {invite.role !== "secretaria" ? (
                <UnitPicker
                  units={units.data || []}
                  value={invite.unitId}
                  onChange={(unitId) => setInvite({ ...invite, unitId })}
                />
              ) : null}
              <View className="flex-row justify-end gap-3">
                <Button variant="outline" onPress={() => setUserModal(false)}>
                  <Text>Cancelar</Text>
                </Button>
                <Button
                  disabled={
                    createUser.isPending ||
                    !invite.name ||
                    !invite.email.endsWith("@tabasco.gob.mx") ||
                    invite.password.length < 8 ||
                    (invite.role !== "secretaria" && !invite.unitId)
                  }
                  onPress={() => createUser.mutate()}
                >
                  <Text>
                    {createUser.isPending ? "Creando..." : "Crear usuario"}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function WebAdminDashboard() {
  const { user } = useAuth();
  if (user?.role === "secretaria") return <SecretaryDashboard />;
  if (user?.role === "gestor") return <GestorDashboard />;
  if (user?.role !== "super_admin") return <Redirect href="/home" />;
  return <SuperAdminDashboard />;
}
