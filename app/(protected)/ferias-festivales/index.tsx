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
import { FeriasFestivalesFormData } from "@/src/forms/schemas/FeriasFestivalesForm";
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
  fiestasFestivales: Yup.string().required("Este campo es requerido"),
  nombreEvento: Yup.string().required("Este campo es requerido"),
  fechaRealizacion: Yup.string().required("Este campo es requerido"),
  origen: Yup.string().required("Este campo es requerido"),
  otroOrigen: Yup.string().when("origen", {
    is: "otro",
    then: (schema) => schema.required("Especifica el otro origen"),
    otherwise: (schema) => schema.optional(),
  }),
  quienOrganiza: Yup.string().required("Este campo es requerido"),
  otroQuienOrganiza: Yup.string().when("quienOrganiza", {
    is: "otro",
    then: (schema) => schema.required("Especifica quién organiza"),
    otherwise: (schema) => schema.optional(),
  }),
  numeroAsistentes: Yup.string().required("Este campo es requerido"),
  apoyoInstitucional: Yup.string().required("Este campo es requerido"),
  actividadesRealizadas: Yup.array().min(
    1,
    "Selecciona al menos una actividad"
  ),
  otrasActividades: Yup.string().when("actividadesRealizadas", {
    is: (val: string[]) => val?.includes("otros"),
    then: (schema) => schema.required("Especifica otras actividades"),
    otherwise: (schema) => schema.optional(),
  }),
  fortalecerFestividad: Yup.string().required("Este campo es requerido"),
  impactoEconomico: Yup.string().required("Este campo es requerido"),
  espaciosPublicos: Yup.string().required("Este campo es requerido"),
  accesibilidadVial: Yup.string().required("Este campo es requerido"),
  infraestructuraEscenica: Yup.string().required("Este campo es requerido"),
  potencialCalendarioEstatal: Yup.string().required("Este campo es requerido"),
  vinculacionPatrocinadores: Yup.string().required("Este campo es requerido"),
  geolocalizacion: Yup.string().required("Este campo es requerido"),
  observacionesActores: Yup.string().required("Este campo es requerido"),
});

const origenes = [
  "religioso",
  "civico",
  "historico",
  "productivo-feria-comercial",
  "otro",
];

const quienOrganizaOpciones = [
  "comite-vecinal",
  "parroquia",
  "municipio",
  "comunidad-indigena",
  "otro",
];

const actividadesRealizadas = [
  "procesion-ritual",
  "danzas",
  "musica",
  "juegos",
  "venta-productos",
  "concursos",
  "muestras-gastronomicas",
  "otros",
];

const impactosEconomicos = ["alto", "medio", "bajo", "nulo"];

const potencialesCalendario = ["si", "no", "condicionado-mejoras"];

const opcionesSiNo = ["si", "no"];

export default function FeriasFestivalesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [fotos, setFotos] = useState<{ uri: string; descripcion: string }[]>(
    []
  );
  const origenRef = useRef<TriggerRef>(null);
  const quienOrganizaRef = useRef<TriggerRef>(null);
  const potencialCalendarioRef = useRef<TriggerRef>(null);

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "Levantamiento comunitario y cultural";
      case 1:
        return "Diagnóstico técnico";
      default:
        return "Ferias y Festivales";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Información básica de eventos y festividades";
      case 1:
        return "Evaluación técnica y potencial de desarrollo";
      default:
        return "Evaluación de ferias y festivales";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:calendar-star";
      case 1:
        return "mdi:clipboard-check";
      default:
        return "mdi:calendar-multiple";
    }
  };

  const handleSubmit = (values: FeriasFestivalesFormData) => {
    console.log("Formulario Ferias y Festivales:", values);
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
        totalSteps={2}
        title={getStepTitle()}
        description={getStepDescription()}
        icon={getStepIcon()}
        directionName="Ferias y Festivales"
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
              fiestasFestivales: "",
              nombreEvento: "",
              fechaRealizacion: "",
              origen: "",
              otroOrigen: "",
              quienOrganiza: "",
              otroQuienOrganiza: "",
              numeroAsistentes: "",
              apoyoInstitucional: "",
              actividadesRealizadas: [],
              otrasActividades: "",
              fortalecerFestividad: "",
              impactoEconomico: "",
              espaciosPublicos: "",
              accesibilidadVial: "",
              infraestructuraEscenica: "",
              potencialCalendarioEstatal: "",
              vinculacionPatrocinadores: "",
              geolocalizacion: "",
              fotografias: [],
              observacionesActores: "",
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
                  <View
                    className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: 24,
                      padding: 32,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <View style={{ gap: 16 }}>
                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Qué fiestas, festivales o ferias se celebran en esta
                          comunidad?
                        </Text>
                        <Input
                          placeholder="Describe las fiestas, festivales o ferias que se celebran..."
                          placeholderTextColor="#999"
                          value={values.fiestasFestivales}
                          onChangeText={handleChange("fiestasFestivales")}
                          onBlur={handleBlur("fiestasFestivales")}
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
                        />
                        {errors.fiestasFestivales &&
                          touched.fiestasFestivales && (
                            <Text className="text-error-600 text-sm">
                              {errors.fiestasFestivales}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Nombre del evento
                        </Text>
                        <Input
                          placeholder="Ingresa el nombre del evento..."
                          value={values.nombreEvento}
                          onChangeText={handleChange("nombreEvento")}
                          onBlur={handleBlur("nombreEvento")}
                        />
                        {errors.nombreEvento && touched.nombreEvento && (
                          <Text className="text-error-600 text-sm">
                            {errors.nombreEvento}
                          </Text>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Fecha de realización (anual, mensual, estacional)
                        </Text>
                        <Input
                          placeholder="Ej: Anual en diciembre, Mensual el primer domingo..."
                          value={values.fechaRealizacion}
                          onChangeText={handleChange("fechaRealizacion")}
                          onBlur={handleBlur("fechaRealizacion")}
                        />
                        {errors.fechaRealizacion &&
                          touched.fechaRealizacion && (
                            <Text className="text-error-600 text-sm">
                              {errors.fechaRealizacion}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Origen
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 16,
                            flexWrap: "wrap",
                          }}
                        >
                          {origenes.map((origen) => (
                            <Button
                              key={origen}
                              variant={
                                values.origen === origen ? "default" : "outline"
                              }
                              onPress={() => setFieldValue("origen", origen)}
                            >
                              <Text style={{ textTransform: "capitalize" }}>
                                {origen === "productivo-feria-comercial"
                                  ? "Productivo / Feria comercial"
                                  : origen}
                              </Text>
                            </Button>
                          ))}
                        </View>
                        {errors.origen && touched.origen && (
                          <Text className="text-error-600 text-sm">
                            {errors.origen}
                          </Text>
                        )}

                        {values.origen === "otro" && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica el otro origen:
                            </Text>
                            <Input
                              placeholder="Describe el otro origen del evento..."
                              value={values.otroOrigen}
                              onChangeText={handleChange("otroOrigen")}
                              onBlur={handleBlur("otroOrigen")}
                            />
                            {errors.otroOrigen && touched.otroOrigen && (
                              <Text className="text-error-600 text-sm">
                                {errors.otroOrigen}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Quién lo organiza?
                        </Text>
                        <Select
                          value={
                            values.quienOrganiza
                              ? {
                                  label: values.quienOrganiza,
                                  value: values.quienOrganiza,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue("quienOrganiza", option.value);
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={quienOrganizaRef}
                            onTouchStart={() => {
                              quienOrganizaRef.current?.open();
                            }}
                          >
                            <SelectValue placeholder="Selecciona quién organiza el evento" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {quienOrganizaOpciones.map((organizador) => (
                                <SelectItem
                                  key={organizador}
                                  label={organizador}
                                  value={organizador}
                                >
                                  {organizador}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.quienOrganiza && touched.quienOrganiza && (
                          <Text className="text-error-600 text-sm">
                            {errors.quienOrganiza}
                          </Text>
                        )}

                        {values.quienOrganiza === "otro" && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica quién organiza:
                            </Text>
                            <Input
                              placeholder="Describe quién organiza el evento..."
                              value={values.otroQuienOrganiza}
                              onChangeText={handleChange("otroQuienOrganiza")}
                              onBlur={handleBlur("otroQuienOrganiza")}
                            />
                            {errors.otroQuienOrganiza &&
                              touched.otroQuienOrganiza && (
                                <Text className="text-error-600 text-sm">
                                  {errors.otroQuienOrganiza}
                                </Text>
                              )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Número estimado de asistentes
                        </Text>
                        <Input
                          placeholder="Ej: 500 personas, 1000 visitantes..."
                          value={values.numeroAsistentes}
                          onChangeText={handleChange("numeroAsistentes")}
                          onBlur={handleBlur("numeroAsistentes")}
                          keyboardType="numeric"
                        />
                        {errors.numeroAsistentes &&
                          touched.numeroAsistentes && (
                            <Text className="text-error-600 text-sm">
                              {errors.numeroAsistentes}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Reciben apoyo institucional actualmente? ¿Cuál?
                        </Text>
                        <Input
                          placeholder="Describe el apoyo institucional que reciben..."
                          placeholderTextColor="#999"
                          value={values.apoyoInstitucional}
                          onChangeText={handleChange("apoyoInstitucional")}
                          onBlur={handleBlur("apoyoInstitucional")}
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
                        />
                        {errors.apoyoInstitucional &&
                          touched.apoyoInstitucional && (
                            <Text className="text-error-600 text-sm">
                              {errors.apoyoInstitucional}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Qué actividades se realizan?
                        </Text>
                        <View style={{ gap: 12 }}>
                          {actividadesRealizadas.map((actividad) => {
                            const checked = (
                              values.actividadesRealizadas as string[]
                            ).includes(actividad);
                            const labelText =
                              actividad === "procesion-ritual"
                                ? "Procesión / Ritual"
                                : actividad === "venta-productos"
                                  ? "Venta de productos"
                                  : actividad === "muestras-gastronomicas"
                                    ? "Muestras gastronómicas"
                                    : actividad === "otros"
                                      ? "Otros"
                                      : actividad;
                            return (
                              <View
                                key={actividad}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <Checkbox
                                  id={`actividad-${actividad}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const currentValues =
                                      (values.actividadesRealizadas as string[]) ||
                                      [];
                                    if (isChecked) {
                                      setFieldValue("actividadesRealizadas", [
                                        ...currentValues,
                                        actividad,
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "actividadesRealizadas",
                                        currentValues.filter(
                                          (v) => v !== actividad
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`actividad-${actividad}`}
                                  onPress={Platform.select({
                                    native: () => {
                                      const currentValues =
                                        (values.actividadesRealizadas as string[]) ||
                                        [];
                                      if (checked) {
                                        setFieldValue(
                                          "actividadesRealizadas",
                                          currentValues.filter(
                                            (v) => v !== actividad
                                          )
                                        );
                                      } else {
                                        setFieldValue("actividadesRealizadas", [
                                          ...currentValues,
                                          actividad,
                                        ]);
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
                        {errors.actividadesRealizadas &&
                          touched.actividadesRealizadas && (
                            <Text className="text-error-600 text-sm">
                              {errors.actividadesRealizadas}
                            </Text>
                          )}

                        {(values.actividadesRealizadas as string[]).includes(
                          "otros"
                        ) && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica otras actividades:
                            </Text>
                            <Input
                              placeholder="Describe otras actividades que se realizan..."
                              value={values.otrasActividades}
                              onChangeText={handleChange("otrasActividades")}
                              onBlur={handleBlur("otrasActividades")}
                            />
                            {errors.otrasActividades &&
                              touched.otrasActividades && (
                                <Text className="text-error-600 text-sm">
                                  {errors.otrasActividades}
                                </Text>
                              )}
                          </View>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Qué se necesitaría para fortalecer esta festividad?
                        </Text>
                        <Input
                          placeholder="Describe qué se necesitaría para fortalecer la festividad..."
                          placeholderTextColor="#999"
                          value={values.fortalecerFestividad}
                          onChangeText={handleChange("fortalecerFestividad")}
                          onBlur={handleBlur("fortalecerFestividad")}
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
                        />
                        {errors.fortalecerFestividad &&
                          touched.fortalecerFestividad && (
                            <Text className="text-error-600 text-sm">
                              {errors.fortalecerFestividad}
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
                          Nivel de impacto económico local
                        </Text>
                        <Select
                          value={
                            values.impactoEconomico
                              ? {
                                  label: values.impactoEconomico,
                                  value: values.impactoEconomico,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue("impactoEconomico", option.value);
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={origenRef}
                            onTouchStart={() => {
                              origenRef.current?.open();
                            }}
                          >
                            <SelectValue placeholder="Selecciona el nivel de impacto económico" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {impactosEconomicos.map((impacto) => (
                                <SelectItem
                                  key={impacto}
                                  label={impacto}
                                  value={impacto}
                                >
                                  {impacto}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.impactoEconomico &&
                          touched.impactoEconomico && (
                            <Text className="text-error-600 text-sm">
                              {errors.impactoEconomico}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Suficiencia de espacios públicos
                        </Text>
                        <Input
                          placeholder="Describe la suficiencia de espacios públicos..."
                          placeholderTextColor="#999"
                          value={values.espaciosPublicos}
                          onChangeText={handleChange("espaciosPublicos")}
                          onBlur={handleBlur("espaciosPublicos")}
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
                        />
                        {errors.espaciosPublicos &&
                          touched.espaciosPublicos && (
                            <Text className="text-error-600 text-sm">
                              {errors.espaciosPublicos}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Accesibilidad vial
                        </Text>
                        <Input
                          placeholder="Describe la accesibilidad vial..."
                          placeholderTextColor="#999"
                          value={values.accesibilidadVial}
                          onChangeText={handleChange("accesibilidadVial")}
                          onBlur={handleBlur("accesibilidadVial")}
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
                        />
                        {errors.accesibilidadVial &&
                          touched.accesibilidadVial && (
                            <Text className="text-error-600 text-sm">
                              {errors.accesibilidadVial}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Infraestructura escénica (palco, sonido, energía
                          eléctrica)
                        </Text>
                        <Input
                          placeholder="Describe la infraestructura escénica disponible..."
                          placeholderTextColor="#999"
                          value={values.infraestructuraEscenica}
                          onChangeText={handleChange("infraestructuraEscenica")}
                          onBlur={handleBlur("infraestructuraEscenica")}
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
                        />
                        {errors.infraestructuraEscenica &&
                          touched.infraestructuraEscenica && (
                            <Text className="text-error-600 text-sm">
                              {errors.infraestructuraEscenica}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Potencial de inclusión en el calendario estatal de
                          eventos
                        </Text>
                        <Select
                          value={
                            values.potencialCalendarioEstatal
                              ? {
                                  label: values.potencialCalendarioEstatal,
                                  value: values.potencialCalendarioEstatal,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue(
                                "potencialCalendarioEstatal",
                                option.value
                              );
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={potencialCalendarioRef}
                            onTouchStart={() => {
                              potencialCalendarioRef.current?.open();
                            }}
                          >
                            <SelectValue placeholder="Selecciona el potencial de inclusión" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {potencialesCalendario.map((potencial) => (
                                <SelectItem
                                  key={potencial}
                                  label={potencial}
                                  value={potencial}
                                >
                                  {potencial}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.potencialCalendarioEstatal &&
                          touched.potencialCalendarioEstatal && (
                            <Text className="text-error-600 text-sm">
                              {errors.potencialCalendarioEstatal}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Oportunidad de vinculación con patrocinadores o
                          convocatorias federales
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.vinculacionPatrocinadores === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue(
                                  "vinculacionPatrocinadores",
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
                        {errors.vinculacionPatrocinadores &&
                          touched.vinculacionPatrocinadores && (
                            <Text className="text-error-600 text-sm">
                              {errors.vinculacionPatrocinadores}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Geolocalización del sitio
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
                              value={values.geolocalizacion}
                              onChangeText={handleChange("geolocalizacion")}
                              onBlur={handleBlur("geolocalizacion")}
                            />
                            {errors.geolocalizacion &&
                              touched.geolocalizacion && (
                                <Text className="text-error-600 text-sm">
                                  {errors.geolocalizacion}
                                </Text>
                              )}
                          </View>
                          <Button
                            variant="outline"
                            className="border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
                            onPress={() =>
                              handleGetLocation(
                                setFieldValue,
                                "geolocalizacion"
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
                          Fotografía del espacio o evento (si existe registro
                          previo)
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

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Observaciones y actores locales clave
                        </Text>
                        <Input
                          placeholder="Describe observaciones y actores locales clave..."
                          placeholderTextColor="#999"
                          value={values.observacionesActores}
                          onChangeText={handleChange("observacionesActores")}
                          onBlur={handleBlur("observacionesActores")}
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
                        />
                        {errors.observacionesActores &&
                          touched.observacionesActores && (
                            <Text className="text-error-600 text-sm">
                              {errors.observacionesActores}
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
