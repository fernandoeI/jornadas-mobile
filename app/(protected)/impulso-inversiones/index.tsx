import { FormHeader } from "@/src/components/common";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import { ImpulsoInversionesFormData } from "@/src/forms/schemas/ImpulsoInversionesForm";
import { openCameraDirectly, pickImagesForWeb } from "@/src/utils/imagePicker";
import { getLocationWithFallback } from "@/src/utils/location";
import { Monicon } from "@monicon/native";
import type { Option, TriggerRef } from "@rn-primitives/select";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  existeEmpresaAltoImpacto: Yup.string().required("Este campo es requerido"),
  nombreRazonSocial: Yup.string().required("Este campo es requerido"),
  giro: Yup.string().required("Este campo es requerido"),
  otroGiro: Yup.string().when("giro", {
    is: "otro",
    then: (schema) => schema.required("Especifica el otro giro"),
    otherwise: (schema) => schema.optional(),
  }),
  nivelEmpleo: Yup.string().required("Este campo es requerido"),
  necesidadesRegulatorias: Yup.array().min(
    1,
    "Selecciona al menos una necesidad"
  ),
  otrasNecesidades: Yup.string().when("necesidadesRegulatorias", {
    is: (val: string[]) => val?.includes("otro"),
    then: (schema) => schema.required("Especifica otras necesidades"),
    otherwise: (schema) => schema.optional(),
  }),
  oportunidadesInversion: Yup.array().min(
    1,
    "Selecciona al menos una oportunidad"
  ),
  otrasOportunidades: Yup.string().when("oportunidadesInversion", {
    is: (val: string[]) => val?.includes("otro"),
    then: (schema) => schema.required("Especifica otras oportunidades"),
    otherwise: (schema) => schema.optional(),
  }),
  barrerasNormativas: Yup.string().required("Este campo es requerido"),
  prediosPotencialInversion: Yup.string().required("Este campo es requerido"),
  geolocalizacionInversion: Yup.string().required("Este campo es requerido"),
  oportunidadVinculacionInstitucional: Yup.array().min(
    1,
    "Selecciona al menos una vinculación"
  ),
  otrasVinculaciones: Yup.string().when("oportunidadVinculacionInstitucional", {
    is: (val: string[]) => val?.includes("otro"),
    then: (schema) => schema.required("Especifica otras vinculaciones"),
    otherwise: (schema) => schema.optional(),
  }),
  viableAgendarSeguimiento: Yup.string().required("Este campo es requerido"),
  requiereIntervencionJuridica: Yup.string().required(
    "Este campo es requerido"
  ),
  observacionesCompetitividad: Yup.string().required("Este campo es requerido"),
});

const opcionesSiNo = ["si", "no"];

const giros = [
  "industrial",
  "comercial",
  "servicios",
  "energia",
  "agroindustria",
  "tecnologias",
  "otro",
];

const nivelesEmpleo = ["1-5-personas", "6-20", "21-50", "mas-de-50"];

const necesidadesRegulatorias = [
  "permisos-municipales",
  "energia-electrica",
  "infraestructura-logistica",
  "mano-obra",
  "certificaciones-exportacion",
  "otro",
];

const oportunidadesInversion = [
  "terreno-disponible",
  "infraestructura-desarrollo",
  "conectividad-estrategica",
  "recursos-naturales",
  "otro",
];

const oportunidadVinculacionInstitucional = [
  "catalogo-inversion",
  "agenda-estrategica-secretaria",
  "mapeo-interinstitucional",
  "otro",
];

export default function ImpulsoInversionesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [fotos, setFotos] = useState<{ uri: string; descripcion: string }[]>(
    []
  );
  const giroRef = useRef<TriggerRef>(null);
  const nivelEmpleoRef = useRef<TriggerRef>(null);

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "Detección de inversión local";
      case 1:
        return "Diagnóstico de entorno productivo";
      case 2:
        return "Evaluación técnica";
      default:
        return "Impulso y Promoción de Inversiones";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Observación y vinculación con empresas de alto impacto";
      case 1:
        return "Análisis del entorno productivo y oportunidades";
      case 2:
        return "Evaluación técnica del servidor público";
      default:
        return "Evaluación de impulso y promoción de inversiones";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:factory";
      case 1:
        return "mdi:chart-line";
      case 2:
        return "mdi:clipboard-check";
      default:
        return "mdi:trending-up";
    }
  };

  const handleSubmit = (values: ImpulsoInversionesFormData) => {
    console.log("Formulario Impulso y Promoción de Inversiones:", values);
    console.log("Fotos:", fotos);
    alert("¡Formulario enviado exitosamente!");
    router.push("/(protected)/(tabs)/home");
  };

  const pickImage = async () => {
    try {
      console.log("Estado actual de fotos:", fotos.length);

      // Si estamos en web y ya tenemos fotos, usar selección múltiple
      if (Platform.OS === "web" && fotos.length > 0) {
        const remainingSlots = 3 - fotos.length;
        if (remainingSlots > 0) {
          const imageUris = await pickImagesForWeb(remainingSlots);
          if (imageUris.length > 0) {
            const newFotos = [
              ...fotos,
              ...imageUris.map((uri) => ({ uri, descripcion: "" })),
            ];
            console.log("Nuevas fotos agregadas:", newFotos.length);
            setFotos(newFotos);
            console.log("Imágenes seleccionadas:", imageUris);
          }
        }
      } else {
        // Para móvil o primera foto en web, usar cámara directa
        const imageUri = await openCameraDirectly();
        if (imageUri) {
          const newFotos = [...fotos, { uri: imageUri, descripcion: "" }];
          console.log("Nuevas fotos:", newFotos.length);
          setFotos(newFotos);
          console.log("Imagen seleccionada:", imageUri);
        }
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
    }
  };

  const removeFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const updateFotoDescripcion = (index: number, descripcion: string) => {
    setFotos(
      fotos.map((foto, i) => (i === index ? { ...foto, descripcion } : foto))
    );
  };

  const handleGetLocation = async (
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    try {
      const location = await getLocationWithFallback();
      setFieldValue(fieldName, location);
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF2F2" }}>
      <FormHeader
        step={step}
        totalSteps={3}
        title={getStepTitle()}
        description={getStepDescription()}
        icon={getStepIcon()}
        directionName="Impulso y Promoción de Inversiones"
        backRoute="/home"
      />

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            gap: 24,
            width: "100%",
            maxWidth: 672,
            marginHorizontal: "auto",
          }}
        >
          <Formik
            initialValues={{
              existeEmpresaAltoImpacto: "",
              nombreRazonSocial: "",
              giro: "",
              otroGiro: "",
              nivelEmpleo: "",
              necesidadesRegulatorias: [],
              otrasNecesidades: "",
              oportunidadesInversion: [],
              otrasOportunidades: "",
              barrerasNormativas: "",
              prediosPotencialInversion: "",
              geolocalizacionInversion: "",
              fotografiasSitio: [],
              oportunidadVinculacionInstitucional: [],
              otrasVinculaciones: "",
              viableAgendarSeguimiento: "",
              requiereIntervencionJuridica: "",
              observacionesCompetitividad: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View style={{ gap: 24 }}>
                {step === 0 && (
                  <View className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">
                    <View style={{ gap: 16 }}>
                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Existe alguna empresa, agroindustria o negocio de
                          alto impacto económico en la zona?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.existeEmpresaAltoImpacto === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue(
                                  "existeEmpresaAltoImpacto",
                                  opcion
                                )
                              }
                            >
                              <Text style={{ textTransform: "capitalize" }}>
                                {opcion}
                              </Text>
                            </Button>
                          ))}
                        </View>
                        {errors.existeEmpresaAltoImpacto &&
                          touched.existeEmpresaAltoImpacto && (
                            <Text className="text-error-600 text-sm">
                              {errors.existeEmpresaAltoImpacto}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Nombre o razón social (si se conoce)
                        </Text>
                        <Input
                          placeholder="Nombre o razón social de la empresa..."
                          className="bg-white/90 border-white/50"
                          value={values.nombreRazonSocial}
                          onChangeText={handleChange("nombreRazonSocial")}
                          onBlur={handleBlur("nombreRazonSocial")}
                        />
                        {errors.nombreRazonSocial &&
                          touched.nombreRazonSocial && (
                            <Text className="text-error-600 text-sm">
                              {errors.nombreRazonSocial}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Giro
                        </Text>
                        <Select
                          value={
                            values.giro
                              ? {
                                  label: values.giro,
                                  value: values.giro,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue("giro", option.value);
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={giroRef}
                            onTouchStart={() => {
                              giroRef.current?.open();
                            }}
                            className="bg-white/90 border-white/50"
                          >
                            <SelectValue placeholder="Selecciona el giro de la empresa" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {giros.map((giro) => (
                                <SelectItem
                                  key={giro}
                                  label={giro}
                                  value={giro}
                                >
                                  {giro}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.giro && touched.giro && (
                          <Text className="text-error-600 text-sm">
                            {errors.giro}
                          </Text>
                        )}

                        {values.giro === "otro" && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica el otro giro:
                            </Text>
                            <Input
                              placeholder="Describe el otro giro..."
                              className="bg-white/90 border-white/50"
                              value={values.otroGiro}
                              onChangeText={handleChange("otroGiro")}
                              onBlur={handleBlur("otroGiro")}
                            />
                            {errors.otroGiro && touched.otroGiro && (
                              <Text className="text-error-600 text-sm">
                                {errors.otroGiro}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Cuál es su nivel estimado de empleo?
                        </Text>
                        <Select
                          value={
                            values.nivelEmpleo
                              ? {
                                  label: values.nivelEmpleo,
                                  value: values.nivelEmpleo,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue("nivelEmpleo", option.value);
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={nivelEmpleoRef}
                            onTouchStart={() => {
                              nivelEmpleoRef.current?.open();
                            }}
                            className="bg-white/90 border-white/50"
                          >
                            <SelectValue placeholder="Selecciona el nivel de empleo" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {nivelesEmpleo.map((nivel) => (
                                <SelectItem
                                  key={nivel}
                                  label={nivel}
                                  value={nivel}
                                >
                                  {nivel}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.nivelEmpleo && touched.nivelEmpleo && (
                          <Text className="text-error-600 text-sm">
                            {errors.nivelEmpleo}
                          </Text>
                        )}
                      </View>

                      {/* Botones de navegación */}
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 16,
                          marginTop: 24,
                        }}
                      >
                        <Button
                          variant="outline"
                          className="flex-1 border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
                          onPress={() => router.push("/home")}
                        >
                          <Text className="text-[#9A1445] font-medium">
                            Cancelar
                          </Text>
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg"
                          onPress={() => setStep(step + 1)}
                        >
                          <Text className="text-lg font-semibold">
                            Siguiente
                          </Text>
                        </Button>
                      </View>
                    </View>
                  </View>
                )}

                {step === 1 && (
                  <View className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">
                    <View style={{ gap: 16 }}>
                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Qué necesidades regulatorias u operativas enfrenta?
                        </Text>
                        <View style={{ gap: 12 }}>
                          {necesidadesRegulatorias.map((necesidad) => {
                            const checked = (
                              values.necesidadesRegulatorias as string[]
                            ).includes(necesidad);
                            const labelText =
                              necesidad === "permisos-municipales"
                                ? "Permisos municipales"
                                : necesidad === "energia-electrica"
                                  ? "Energía eléctrica"
                                  : necesidad === "infraestructura-logistica"
                                    ? "Infraestructura logística"
                                    : necesidad === "mano-obra"
                                      ? "Mano de obra"
                                      : necesidad ===
                                          "certificaciones-exportacion"
                                        ? "Certificaciones / exportación"
                                        : necesidad === "otro"
                                          ? "Otro"
                                          : necesidad;
                            return (
                              <View
                                key={necesidad}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <Checkbox
                                  id={`necesidad-${necesidad}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const currentValues =
                                      (values.necesidadesRegulatorias as string[]) ||
                                      [];
                                    if (isChecked) {
                                      setFieldValue("necesidadesRegulatorias", [
                                        ...currentValues,
                                        necesidad,
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "necesidadesRegulatorias",
                                        currentValues.filter(
                                          (v) => v !== necesidad
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`necesidad-${necesidad}`}
                                  onPress={Platform.select({
                                    native: () => {
                                      const currentValues =
                                        (values.necesidadesRegulatorias as string[]) ||
                                        [];
                                      if (checked) {
                                        setFieldValue(
                                          "necesidadesRegulatorias",
                                          currentValues.filter(
                                            (v) => v !== necesidad
                                          )
                                        );
                                      } else {
                                        setFieldValue(
                                          "necesidadesRegulatorias",
                                          [...currentValues, necesidad]
                                        );
                                      }
                                    },
                                  })}
                                >
                                  <Text style={{ textTransform: "capitalize" }}>
                                    {labelText}
                                  </Text>
                                </Label>
                              </View>
                            );
                          })}
                        </View>
                        {errors.necesidadesRegulatorias &&
                          touched.necesidadesRegulatorias && (
                            <Text className="text-error-600 text-sm">
                              {errors.necesidadesRegulatorias}
                            </Text>
                          )}

                        {(values.necesidadesRegulatorias as string[]).includes(
                          "otro"
                        ) && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica otras necesidades:
                            </Text>
                            <Input
                              placeholder="Describe otras necesidades regulatorias u operativas..."
                              className="bg-white/90 border-white/50"
                              value={values.otrasNecesidades}
                              onChangeText={handleChange("otrasNecesidades")}
                              onBlur={handleBlur("otrasNecesidades")}
                            />
                            {errors.otrasNecesidades &&
                              touched.otrasNecesidades && (
                                <Text className="text-error-600 text-sm">
                                  {errors.otrasNecesidades}
                                </Text>
                              )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Qué oportunidades hay para atraer más inversión?
                        </Text>
                        <View style={{ gap: 12 }}>
                          {oportunidadesInversion.map((oportunidad) => {
                            const checked = (
                              values.oportunidadesInversion as string[]
                            ).includes(oportunidad);
                            const labelText =
                              oportunidad === "terreno-disponible"
                                ? "Terreno disponible"
                                : oportunidad === "infraestructura-desarrollo"
                                  ? "Infraestructura en desarrollo"
                                  : oportunidad === "conectividad-estrategica"
                                    ? "Conectividad estratégica"
                                    : oportunidad === "recursos-naturales"
                                      ? "Recursos naturales"
                                      : oportunidad === "otro"
                                        ? "Otro"
                                        : oportunidad;
                            return (
                              <View
                                key={oportunidad}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <Checkbox
                                  id={`oportunidad-${oportunidad}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const currentValues =
                                      (values.oportunidadesInversion as string[]) ||
                                      [];
                                    if (isChecked) {
                                      setFieldValue("oportunidadesInversion", [
                                        ...currentValues,
                                        oportunidad,
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "oportunidadesInversion",
                                        currentValues.filter(
                                          (v) => v !== oportunidad
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`oportunidad-${oportunidad}`}
                                  onPress={Platform.select({
                                    native: () => {
                                      const currentValues =
                                        (values.oportunidadesInversion as string[]) ||
                                        [];
                                      if (checked) {
                                        setFieldValue(
                                          "oportunidadesInversion",
                                          currentValues.filter(
                                            (v) => v !== oportunidad
                                          )
                                        );
                                      } else {
                                        setFieldValue(
                                          "oportunidadesInversion",
                                          [...currentValues, oportunidad]
                                        );
                                      }
                                    },
                                  })}
                                >
                                  <Text style={{ textTransform: "capitalize" }}>
                                    {labelText}
                                  </Text>
                                </Label>
                              </View>
                            );
                          })}
                        </View>
                        {errors.oportunidadesInversion &&
                          touched.oportunidadesInversion && (
                            <Text className="text-error-600 text-sm">
                              {errors.oportunidadesInversion}
                            </Text>
                          )}

                        {(values.oportunidadesInversion as string[]).includes(
                          "otro"
                        ) && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica otras oportunidades:
                            </Text>
                            <Input
                              placeholder="Describe otras oportunidades para atraer inversión..."
                              className="bg-white/90 border-white/50"
                              value={values.otrasOportunidades}
                              onChangeText={handleChange("otrasOportunidades")}
                              onBlur={handleBlur("otrasOportunidades")}
                            />
                            {errors.otrasOportunidades &&
                              touched.otrasOportunidades && (
                                <Text className="text-error-600 text-sm">
                                  {errors.otrasOportunidades}
                                </Text>
                              )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Hay barreras normativas locales que dificulten la
                          instalación de negocios?
                        </Text>
                        <Input
                          placeholder="Describe las barreras normativas locales..."
                          className="bg-white/90 border-white/50"
                          value={values.barrerasNormativas}
                          onChangeText={handleChange("barrerasNormativas")}
                          onBlur={handleBlur("barrerasNormativas")}
                          multiline
                          numberOfLines={4}
                          style={{
                            backgroundColor: "#F5F5F5",
                            borderRadius: 8,
                            padding: 12,
                            color: "#1E1E1E",
                            borderWidth: 1,
                            borderColor: "#E0E0E0",
                            minHeight: 100,
                          }}
                          placeholderTextColor="#999"
                        />
                        {errors.barrerasNormativas &&
                          touched.barrerasNormativas && (
                            <Text className="text-error-600 text-sm">
                              {errors.barrerasNormativas}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Existen predios o zonas con potencial para inversión?
                        </Text>
                        <Input
                          placeholder="Describe los predios o zonas con potencial para inversión..."
                          className="bg-white/90 border-white/50"
                          value={values.prediosPotencialInversion}
                          onChangeText={handleChange(
                            "prediosPotencialInversion"
                          )}
                          onBlur={handleBlur("prediosPotencialInversion")}
                          multiline
                          numberOfLines={4}
                          style={{
                            backgroundColor: "#F5F5F5",
                            borderRadius: 8,
                            padding: 12,
                            color: "#1E1E1E",
                            borderWidth: 1,
                            borderColor: "#E0E0E0",
                            minHeight: 100,
                          }}
                          placeholderTextColor="#999"
                        />
                        {errors.prediosPotencialInversion &&
                          touched.prediosPotencialInversion && (
                            <Text className="text-error-600 text-sm">
                              {errors.prediosPotencialInversion}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Geolocalización del punto de inversión o zona
                          prospectiva
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 12,
                            alignItems: "flex-end",
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Input
                              placeholder="Coordenadas GPS (se obtendrán automáticamente)"
                              value={values.geolocalizacionInversion}
                              onChangeText={handleChange(
                                "geolocalizacionInversion"
                              )}
                              onBlur={handleBlur("geolocalizacionInversion")}
                            />
                            {errors.geolocalizacionInversion &&
                              touched.geolocalizacionInversion && (
                                <Text className="text-error-600 text-sm">
                                  {errors.geolocalizacionInversion}
                                </Text>
                              )}
                          </View>
                          <Button
                            variant="outline"
                            className="border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
                            onPress={() =>
                              handleGetLocation(
                                setFieldValue,
                                "geolocalizacionInversion"
                              )
                            }
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <Monicon
                                name="mdi:map-marker"
                                size={16}
                                color="#9A1445"
                              />
                              <Text className="text-[#9A1445] text-sm">
                                Obtener
                              </Text>
                            </View>
                          </Button>
                        </View>
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Fotografía del sitio productivo o del predio
                        </Text>
                        <View style={{ gap: 12 }}>
                          {fotos.length < 3 && (
                            <Button
                              variant="outline"
                              className="border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
                              onPress={pickImage}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  gap: 12,
                                  alignItems: "center",
                                }}
                              >
                                <Monicon
                                  name="mdi:camera"
                                  size={20}
                                  color="#9A1445"
                                />
                                <Text className="text-[#9A1445]">
                                  Agregar fotografía ({fotos.length}/3)
                                </Text>
                              </View>
                            </Button>
                          )}
                          {fotos.map((foto, index) => (
                            <View
                              key={index}
                              className="bg-white/60 rounded-lg p-4 border border-white/40"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                borderRadius: 8,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: "rgba(255, 255, 255, 0.4)",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 8,
                                }}
                              >
                                <Text className="text-sm text-typography-600">
                                  Foto {index + 1}
                                </Text>
                                <Button
                                  variant="outline"
                                  className="border-error-500"
                                  onPress={() => removeFoto(index)}
                                >
                                  <Text className="text-error-600">
                                    Eliminar
                                  </Text>
                                </Button>
                              </View>
                              <View style={{ gap: 12 }}>
                                {/* Image component - using placeholder */}
                                <View
                                  style={{
                                    width: "100%",
                                    height: 128,
                                    borderRadius: 8,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Text style={{ color: "#999" }}>
                                    Imagen: {foto.uri.substring(0, 30)}...
                                  </Text>
                                </View>
                                <Input
                                  placeholder="Descripción de la fotografía..."
                                  value={foto.descripcion}
                                  onChangeText={(text: string) =>
                                    updateFotoDescripcion(index, text)
                                  }
                                />
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Botones de navegación */}
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 16,
                          marginTop: 24,
                        }}
                      >
                        <Button
                          variant="outline"
                          className="flex-1 border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
                          onPress={() => setStep(step - 1)}
                        >
                          <Text className="text-[#9A1445] font-medium">
                            Regresar
                          </Text>
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg"
                          onPress={() => setStep(step + 1)}
                        >
                          <Text className="text-lg font-semibold">
                            Siguiente
                          </Text>
                        </Button>
                      </View>
                    </View>
                  </View>
                )}

                {step === 2 && (
                  <View className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">
                    <View style={{ gap: 16 }}>
                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Se detecta oportunidad de vinculación con
                          instrumentos institucionales?
                        </Text>
                        <View style={{ gap: 12 }}>
                          {oportunidadVinculacionInstitucional.map(
                            (vinculacion) => {
                              const checked = (
                                values.oportunidadVinculacionInstitucional as string[]
                              ).includes(vinculacion);
                              const labelText =
                                vinculacion === "catalogo-inversion"
                                  ? "Catálogo de Inversión"
                                  : vinculacion ===
                                      "agenda-estrategica-secretaria"
                                    ? "Agenda estratégica con Secretaría"
                                    : vinculacion === "mapeo-interinstitucional"
                                      ? "Mapeo interinstitucional"
                                      : vinculacion === "otro"
                                        ? "Otro"
                                        : vinculacion;
                              return (
                                <View
                                  key={vinculacion}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                  }}
                                >
                                  <Checkbox
                                    id={`vinculacion-${vinculacion}`}
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      const currentValues =
                                        (values.oportunidadVinculacionInstitucional as string[]) ||
                                        [];
                                      if (isChecked) {
                                        setFieldValue(
                                          "oportunidadVinculacionInstitucional",
                                          [...currentValues, vinculacion]
                                        );
                                      } else {
                                        setFieldValue(
                                          "oportunidadVinculacionInstitucional",
                                          currentValues.filter(
                                            (v) => v !== vinculacion
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`vinculacion-${vinculacion}`}
                                    onPress={Platform.select({
                                      native: () => {
                                        const currentValues =
                                          (values.oportunidadVinculacionInstitucional as string[]) ||
                                          [];
                                        if (checked) {
                                          setFieldValue(
                                            "oportunidadVinculacionInstitucional",
                                            currentValues.filter(
                                              (v) => v !== vinculacion
                                            )
                                          );
                                        } else {
                                          setFieldValue(
                                            "oportunidadVinculacionInstitucional",
                                            [...currentValues, vinculacion]
                                          );
                                        }
                                      },
                                    })}
                                  >
                                    <Text
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {labelText}
                                    </Text>
                                  </Label>
                                </View>
                              );
                            }
                          )}
                        </View>
                        {errors.oportunidadVinculacionInstitucional &&
                          touched.oportunidadVinculacionInstitucional && (
                            <Text className="text-error-600 text-sm">
                              {errors.oportunidadVinculacionInstitucional}
                            </Text>
                          )}

                        {(
                          values.oportunidadVinculacionInstitucional as string[]
                        ).includes("otro") && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica otras vinculaciones:
                            </Text>
                            <Input
                              placeholder="Describe otras vinculaciones institucionales..."
                              className="bg-white/90 border-white/50"
                              value={values.otrasVinculaciones}
                              onChangeText={handleChange("otrasVinculaciones")}
                              onBlur={handleBlur("otrasVinculaciones")}
                            />
                            {errors.otrasVinculaciones &&
                              touched.otrasVinculaciones && (
                                <Text className="text-error-600 text-sm">
                                  {errors.otrasVinculaciones}
                                </Text>
                              )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Es viable agendar seguimiento con inversionista?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.viableAgendarSeguimiento === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue(
                                  "viableAgendarSeguimiento",
                                  opcion
                                )
                              }
                            >
                              <Text style={{ textTransform: "capitalize" }}>
                                {opcion}
                              </Text>
                            </Button>
                          ))}
                        </View>
                        {errors.viableAgendarSeguimiento &&
                          touched.viableAgendarSeguimiento && (
                            <Text className="text-error-600 text-sm">
                              {errors.viableAgendarSeguimiento}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Requiere intervención del área jurídica / normativa?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.requiereIntervencionJuridica === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue(
                                  "requiereIntervencionJuridica",
                                  opcion
                                )
                              }
                            >
                              <Text style={{ textTransform: "capitalize" }}>
                                {opcion}
                              </Text>
                            </Button>
                          ))}
                        </View>
                        {errors.requiereIntervencionJuridica &&
                          touched.requiereIntervencionJuridica && (
                            <Text className="text-error-600 text-sm">
                              {errors.requiereIntervencionJuridica}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Observaciones clave para análisis de competitividad
                          local
                        </Text>
                        <Input
                          placeholder="Describe observaciones clave para análisis de competitividad local..."
                          className="bg-white/90 border-white/50"
                          value={values.observacionesCompetitividad}
                          onChangeText={handleChange(
                            "observacionesCompetitividad"
                          )}
                          onBlur={handleBlur("observacionesCompetitividad")}
                          multiline
                          numberOfLines={4}
                          style={{
                            backgroundColor: "#F5F5F5",
                            borderRadius: 8,
                            padding: 12,
                            color: "#1E1E1E",
                            borderWidth: 1,
                            borderColor: "#E0E0E0",
                            minHeight: 100,
                          }}
                          placeholderTextColor="#999"
                        />
                        {errors.observacionesCompetitividad &&
                          touched.observacionesCompetitividad && (
                            <Text className="text-error-600 text-sm">
                              {errors.observacionesCompetitividad}
                            </Text>
                          )}
                      </View>

                      {/* Botones de navegación */}
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 16,
                          marginTop: 24,
                        }}
                      >
                        <Button
                          variant="outline"
                          className="flex-1 border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
                          onPress={() => setStep(step - 1)}
                        >
                          <Text className="text-[#9A1445] font-medium">
                            Regresar
                          </Text>
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg"
                          onPress={() => handleSubmit()}
                        >
                          <Text className="text-lg font-semibold">
                            Finalizar
                          </Text>
                        </Button>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </View>
  );
}
