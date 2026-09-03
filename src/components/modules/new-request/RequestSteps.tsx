import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import Monicon from "@monicon/native";
import React from "react";
import { View } from "react-native";
import {
  useCatalogService,
  useServiceRequirements,
} from "@/src/hooks/useCatalog";
import { DynamicGlobalForm } from "./DynamicGlobalForm";

export type SpecificRequestData = Record<string, string>;

const DETAILS: Record<
  string,
  { appliesTo: string; requirements: string[]; opening?: string }
> = {
  "sadsasdd-dadsads-ewerdf-111": {
    appliesTo:
      "Mujeres mayores de edad que tengan o quieran iniciar un negocio.",
    requirements: [
      "INE vigente",
      "CURP",
      "Comprobante de domicilio",
      "Descripción del emprendimiento",
    ],
    opening: "15 de septiembre de 2026",
  },
  "sadsasdd-dadsads-ewerdf-222": {
    appliesTo:
      "Personas emprendedoras y prestadores de servicios que desean formalizar su actividad.",
    requirements: [
      "INE vigente",
      "CURP",
      "Comprobante de domicilio",
      "Información básica del negocio",
    ],
  },
};

const SPECIFIC_FIELDS: Record<
  string,
  { key: string; label: string; placeholder: string }[]
> = {
  "sadsasdd-dadsads-ewerdf-111": [
    {
      key: "businessName",
      label: "Nombre del emprendimiento",
      placeholder: "Ej. Artesanías Lupita",
    },
    {
      key: "requestedUse",
      label: "¿En qué utilizarás el apoyo?",
      placeholder: "Describe brevemente el uso del recurso",
    },
  ],
  "sadsasdd-dadsads-ewerdf-222": [
    {
      key: "businessActivity",
      label: "Actividad del negocio",
      placeholder: "Ej. Hospedaje, alimentos o recorridos",
    },
    {
      key: "yearsOperating",
      label: "Tiempo operando",
      placeholder: "Ej. 2 años",
    },
  ],
  "sadsasdd-dadsads-ewerdf-333": [
    {
      key: "adviceTopic",
      label: "Tema de la asesoría",
      placeholder: "Ej. Administración, ventas o costos",
    },
    {
      key: "mainChallenge",
      label: "Principal reto",
      placeholder: "Describe el reto de tu negocio",
    },
  ],
  "sadsasdd-dadsads-ewerdf-444": [
    {
      key: "eventName",
      label: "Nombre del evento",
      placeholder: "Nombre del evento turístico",
    },
    { key: "eventDate", label: "Fecha estimada", placeholder: "DD/MM/AAAA" },
  ],
  "sadsasdd-dadsads-ewerdf-555": [
    {
      key: "financingAmount",
      label: "Monto estimado",
      placeholder: "Ej. $50,000",
    },
    {
      key: "financingPurpose",
      label: "Destino del financiamiento",
      placeholder: "Describe para qué se utilizará",
    },
  ],
  "sadsasdd-dadsads-ewerdf-666": [
    {
      key: "creditPurpose",
      label: "Objetivo del crédito",
      placeholder: "Describe el objetivo",
    },
    {
      key: "monthlyIncome",
      label: "Ingreso mensual estimado",
      placeholder: "Ej. $20,000",
    },
  ],
  "sadsasdd-dadsads-ewerdf-777": [
    {
      key: "projectName",
      label: "Nombre del proyecto",
      placeholder: "Nombre de tu propuesta",
    },
    {
      key: "projectSummary",
      label: "Resumen del proyecto",
      placeholder: "Describe brevemente tu propuesta",
    },
  ],
};

const fallbackDetails = {
  appliesTo: "Personas mayores de edad interesadas en este programa.",
  requirements: [
    "INE vigente",
    "CURP",
    "Comprobante de domicilio",
    "Datos de contacto",
  ],
  opening: "1 de octubre de 2026",
};

const fallbackFields = [
  {
    key: "requestReason",
    label: "Motivo de la solicitud",
    placeholder: "Cuéntanos brevemente qué necesitas",
  },
  {
    key: "expectedBenefit",
    label: "Beneficio esperado",
    placeholder: "Describe el resultado que esperas",
  },
];

type IntroProps = {
  serviceId: string;
  title: string;
  subtitle: string;
  active: boolean;
  onCancel: () => void;
  onStart: () => void;
  showButtons: boolean;
};

export function RequestIntro({
  serviceId,
  title,
  subtitle,
  active,
  onCancel,
  onStart,
  showButtons,
}: IntroProps) {
  const detail = DETAILS[serviceId] ?? fallbackDetails;
  const { data: service } = useCatalogService(serviceId);
  const { data: catalogRequirements = [] } = useServiceRequirements(serviceId);
  const requirements = catalogRequirements.length
    ? catalogRequirements.map((requirement) => requirement.name)
    : detail.requirements;

  return (
    <View className="gap-5 rounded-2xl border border-border bg-card p-5">
      <View className="gap-2">
        <View className="self-start rounded-full bg-primary/10 px-3 py-1">
          <Text className="text-xs font-semibold text-primary">
            {active ? "Convocatoria abierta" : "Convocatoria cerrada"}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-card-foreground">{title}</Text>
        <Text className="text-muted-foreground">{subtitle}</Text>
      </View>

      <View className="flex-row gap-3 rounded-xl bg-muted p-4">
        <Monicon name="mdi:cash-remove" size={24} />
        <View className="flex-1">
          <Text className="font-semibold">Costo</Text>
          <Text className="text-muted-foreground">
            {service?.cost || "Gratuito"}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold">¿Para quién aplica?</Text>
        <Text className="text-muted-foreground">
          {service?.targetAudience || detail.appliesTo}
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold">Requisitos</Text>
        {requirements.map((requirement) => (
          <View key={requirement} className="flex-row items-start gap-2">
            <Monicon name="mdi:check-circle-outline" size={19} />
            <Text className="flex-1 text-muted-foreground">{requirement}</Text>
          </View>
        ))}
      </View>

      {!active && (
        <View className="rounded-xl border border-amber-400 bg-amber-50 p-4">
          <Text className="font-semibold text-amber-900">
            Este trámite no está recibiendo solicitudes.
          </Text>
          <Text className="mt-1 text-amber-800">
            Próxima apertura estimada:{" "}
            {detail.opening ?? fallbackDetails.opening}.
          </Text>
        </View>
      )}

      {showButtons && (
        <View className="flex-row gap-3">
          <Button variant="outline" onPress={onCancel} className="flex-1">
            <Text>Regresar</Text>
          </Button>
          <Button onPress={onStart} disabled={!active} className="flex-1">
            <Text>Iniciar trámite</Text>
          </Button>
        </View>
      )}
    </View>
  );
}

type SpecificProps = {
  serviceId: string;
  title: string;
  values: SpecificRequestData;
  onChange: (values: SpecificRequestData) => void;
};

export function SpecificRequestForm({
  serviceId,
  title,
  values,
  onChange,
}: SpecificProps) {
  const { data: service } = useCatalogService(serviceId);
  const configuredFields = service?.formConfig?.fields;
  const fields = configuredFields?.length
    ? configuredFields
    : (SPECIFIC_FIELDS[serviceId] ?? fallbackFields);
  return (
    <DynamicGlobalForm
      fields={fields}
      values={values}
      onChange={onChange}
      title={`Datos de ${title}`}
      description="Completa la información particular de este trámite."
    />
  );
}

export function isSpecificFormComplete(
  serviceId: string,
  values: SpecificRequestData,
) {
  return (SPECIFIC_FIELDS[serviceId] ?? fallbackFields).every((field) =>
    Boolean(values[field.key]?.trim()),
  );
}

export function RequestSuccess({
  title,
  folio,
  onClose,
  onNew,
}: {
  title: string;
  folio?: string;
  onClose: () => void;
  onNew: () => void;
}) {
  return (
    <View className="items-center gap-4 rounded-2xl border border-border bg-card p-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Monicon name="mdi:check-circle" size={48} />
      </View>
      <Text className="text-center text-2xl font-bold">Solicitud enviada</Text>
      <Text className="text-center text-muted-foreground">
        Tu solicitud de “{title}” se registró correctamente.
      </Text>
      {folio ? (
        <Text className="text-center text-sm font-semibold text-primary">
          Folio: {folio}
        </Text>
      ) : null}
      <View className="mt-2 w-full gap-3">
        <Button onPress={onClose}>
          <Text>Volver al inicio</Text>
        </Button>
        <Button variant="outline" onPress={onNew}>
          <Text>Nueva solicitud</Text>
        </Button>
      </View>
    </View>
  );
}
