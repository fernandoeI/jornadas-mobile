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
import { DesarrolloTuristicoFormData } from "@/src/forms/schemas/form";
import { openCameraDirectly, pickImagesForWeb } from "@/src/utils/imagePicker";
import { getLocationWithFallback } from "@/src/utils/location";
import { Monicon } from "@monicon/native";
import type { Option, TriggerRef } from "@rn-primitives/select";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  zonaTuristas: Yup.string().required("Este campo es requerido"),
  visitantesRecientes: Yup.string().required("Este campo es requerido"),
  organizacionesInteresadas: Yup.string().required("Este campo es requerido"),
  elementosInteres: Yup.array().min(1, "Selecciona al menos una opción"),
  otrosElementos: Yup.string().when("elementosInteres", {
    is: (val: string[]) => val?.includes("otros"),
    then: (schema) => schema.required("Especifica otros elementos"),
    otherwise: (schema) => schema.optional(),
  }),
  nivelOrganizacion: Yup.string().required("Este campo es requerido"),
  rutasSenderos: Yup.string().required("Este campo es requerido"),
  actoresInstitucionales: Yup.string().required("Este campo es requerido"),
  principalObstaculo: Yup.string().required("Este campo es requerido"),
  potencialDesarrollo: Yup.string().required("Este campo es requerido"),
  programaPiloto: Yup.string().required("Este campo es requerido"),
  vinculacionFinanciamiento: Yup.string().required("Este campo es requerido"),
  geolocalizacion: Yup.string().required("Este campo es requerido"),
  observacionesEstrategicas: Yup.string().required("Este campo es requerido"),
});

const elementosInteres = [
  "gastronomia",
  "naturaleza",
  "historia",
  "cultura-viva",
  "otros",
];

const nivelesOrganizacion = ["formal", "informal", "nulo"];

const potencialesDesarrollo = ["alto", "medio", "bajo", "requiere-evaluacion"];

const opcionesSiNo = ["si", "no"];

const opcionesSiNoEvaluacion = ["si", "no", "requiere-evaluacion"];

export default function DesarrolloTuristicoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0: Detección, 1: Diagnóstico, 2: Variables técnicas
  const [fotos, setFotos] = useState<{ uri: string; descripcion: string }[]>(
    []
  );
  const nivelOrganizacionRef = useRef<TriggerRef>(null);

  // Debugging del estado de fotos
  console.log("Estado actual de fotos en renderizado:", fotos.length);

  const handleSubmit = (values: DesarrolloTuristicoFormData) => {
    console.log("Formulario Desarrollo Turístico:", values);
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

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "Detección Ciudadana";
      case 1:
        return "Diagnóstico Técnico";
      case 2:
        return "Variables Técnicas";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Información sobre la percepción local del turismo";
      case 1:
        return "Evaluación de la infraestructura y organización local";
      case 2:
        return "Evaluación técnica y recomendaciones";
      default:
        return "";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:account-group";
      case 1:
        return "mdi:map-marker";
      case 2:
        return "mdi:clipboard-check";
      default:
        return "mdi:form";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      <FormHeader
        step={step}
        totalSteps={3}
        title={getStepTitle()}
        description={getStepDescription()}
        icon={getStepIcon()}
        directionName="Desarrollo Turístico"
        backRoute="/home"
      />

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#121212" }}
      >
        <View
          style={{
            gap: 24,
            width: "100%",
            maxWidth: 672,
            marginHorizontal: "auto",
          }}
        >
          {/* Contenido del paso */}
          <Formik
            initialValues={{
              zonaTuristas: "",
              visitantesRecientes: "",
              organizacionesInteresadas: "",
              elementosInteres: [],
              otrosElementos: "",
              infraestructuraAccesos: [],
              infraestructuraServicios: [],
              infraestructuraAlojamiento: [],
              infraestructuraRecreativas: [],
              infraestructuraComunitarios: [],
              nivelOrganizacion: "",
              rutasSenderos: "",
              actoresInstitucionales: "",
              principalObstaculo: "",
              potencialDesarrollo: "",
              programaPiloto: "",
              vinculacionFinanciamiento: "",
              geolocalizacion: "",
              fotografias: [],
              observacionesEstrategicas: "",
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
                {step === 0 ? (
                  /* Paso 1: Detección ciudadana y comunitaria */
                  <View
                    className="neumorphism-card"
                    style={{
                      backgroundColor: "#1E1E1E",
                      borderRadius: 20,
                      padding: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 6, height: 6 },
                      shadowOpacity: 0.5,
                      shadowRadius: 12,
                      elevation: 8,
                      borderWidth: 1,
                      borderColor: "#333333",
                    }}
                  >
                    <View style={{ gap: 16 }}>
                      <View style={{ gap: 8 }}>
                        <Text
                          className="font-medium"
                          style={{
                            color: "#E0E0E0",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          ¿Cree que esta zona podría recibir turistas? ¿Por qué?
                        </Text>
                        <Input
                          placeholder="Describe tu opinión sobre el potencial turístico de la zona..."
                          placeholderTextColor="#999"
                          value={values.zonaTuristas}
                          onChangeText={handleChange("zonaTuristas")}
                          onBlur={handleBlur("zonaTuristas")}
                          multiline
                          numberOfLines={4}
                          style={{
                            backgroundColor: "#2A2A2A",
                            borderRadius: 8,
                            padding: 12,
                            color: "#E0E0E0",
                            borderWidth: 1,
                            borderColor: "#404040",
                            minHeight: 100,
                          }}
                        />
                        {errors.zonaTuristas && touched.zonaTuristas && (
                          <Text className="text-error-600 text-sm">
                            {errors.zonaTuristas}
                          </Text>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Ha visto visitantes en fechas recientes?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.visitantesRecientes === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue("visitantesRecientes", opcion)
                              }
                            >
                              <Text style={{ textTransform: "capitalize" }}>
                                {opcion}
                              </Text>
                            </Button>
                          ))}
                        </View>
                        {errors.visitantesRecientes &&
                          touched.visitantesRecientes && (
                            <Text className="text-error-600 text-sm">
                              {errors.visitantesRecientes}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Hay personas u organizaciones interesadas en impulsar
                          el turismo local?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.organizacionesInteresadas === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue(
                                  "organizacionesInteresadas",
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
                        {errors.organizacionesInteresadas &&
                          touched.organizacionesInteresadas && (
                            <Text className="text-error-600 text-sm">
                              {errors.organizacionesInteresadas}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Qué elementos tiene esta comunidad que podrían
                          interesar al visitante?
                        </Text>
                        <View style={{ gap: 12 }}>
                          {elementosInteres.map((elemento) => {
                            const checked = (
                              values.elementosInteres as string[]
                            ).includes(elemento);
                            const labelText =
                              elemento === "cultura-viva"
                                ? "Cultura viva"
                                : elemento;
                            return (
                              <View
                                key={elemento}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <Checkbox
                                  id={`elemento-${elemento}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const currentValues =
                                      (values.elementosInteres as string[]) ||
                                      [];
                                    if (isChecked) {
                                      setFieldValue("elementosInteres", [
                                        ...currentValues,
                                        elemento,
                                      ]);
                                    } else {
                                      setFieldValue(
                                        "elementosInteres",
                                        currentValues.filter(
                                          (v) => v !== elemento
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`elemento-${elemento}`}
                                  onPress={Platform.select({
                                    native: () => {
                                      const currentValues =
                                        (values.elementosInteres as string[]) ||
                                        [];
                                      if (checked) {
                                        setFieldValue(
                                          "elementosInteres",
                                          currentValues.filter(
                                            (v) => v !== elemento
                                          )
                                        );
                                      } else {
                                        setFieldValue("elementosInteres", [
                                          ...currentValues,
                                          elemento,
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
                        {errors.elementosInteres &&
                          touched.elementosInteres && (
                            <Text className="text-error-600 text-sm">
                              {errors.elementosInteres}
                            </Text>
                          )}

                        {(values.elementosInteres as string[]).includes(
                          "otros"
                        ) && (
                          <View style={{ gap: 8, marginTop: 16 }}>
                            <Text className="text-typography-700 font-medium">
                              Especifica otros elementos:
                            </Text>
                            <Input
                              placeholder="Describe otros elementos de interés..."
                              value={values.otrosElementos}
                              onChangeText={handleChange("otrosElementos")}
                              onBlur={handleBlur("otrosElementos")}
                            />
                            {errors.otrosElementos &&
                              touched.otrosElementos && (
                                <Text className="text-error-600 text-sm">
                                  {errors.otrosElementos}
                                </Text>
                              )}
                          </View>
                        )}
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        marginTop: 32,
                      }}
                    >
                      <Button
                        variant="outline"
                        className="flex-1 border-[#9A1445]/30 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                        onPress={() => router.push("/home")}
                      >
                        <Text className="text-[#9A1445] font-semibold">
                          Cancelar
                        </Text>
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg hover:from-[#9A1445]/90 hover:to-[#9A1445]/70"
                        onPress={() => setStep(1)}
                      >
                        <Text className="font-semibold">Siguiente</Text>
                      </Button>
                    </View>
                  </View>
                ) : step === 1 ? (
                  /* Paso 2: Diagnóstico técnico del entorno */
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
                          Nivel de organización local para el turismo
                        </Text>
                        <Select
                          value={
                            values.nivelOrganizacion
                              ? {
                                  label: values.nivelOrganizacion,
                                  value: values.nivelOrganizacion,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue("nivelOrganizacion", option.value);
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={nivelOrganizacionRef}
                            onTouchStart={() => {
                              nivelOrganizacionRef.current?.open();
                            }}
                          >
                            <SelectValue placeholder="Selecciona el nivel de organización" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {nivelesOrganizacion.map((nivel) => (
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
                        {errors.nivelOrganizacion &&
                          touched.nivelOrganizacion && (
                            <Text className="text-error-600 text-sm">
                              {errors.nivelOrganizacion}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Existen rutas, senderos o espacios no aprovechados
                          con potencial?
                        </Text>
                        <Input
                          placeholder="Describe las rutas y espacios con potencial turístico..."
                          placeholderTextColor="#999"
                          value={values.rutasSenderos}
                          onChangeText={handleChange("rutasSenderos")}
                          onBlur={handleBlur("rutasSenderos")}
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
                        {errors.rutasSenderos && touched.rutasSenderos && (
                          <Text className="text-error-600 text-sm">
                            {errors.rutasSenderos}
                          </Text>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Hay presencia de otros actores institucionales en la
                          zona?
                        </Text>
                        <Input
                          placeholder="Describe los actores institucionales presentes..."
                          placeholderTextColor="#999"
                          value={values.actoresInstitucionales}
                          onChangeText={handleChange("actoresInstitucionales")}
                          onBlur={handleBlur("actoresInstitucionales")}
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
                        {errors.actoresInstitucionales &&
                          touched.actoresInstitucionales && (
                            <Text className="text-error-600 text-sm">
                              {errors.actoresInstitucionales}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Cuál es el principal obstáculo para detonar el
                          turismo aquí?
                        </Text>
                        <Input
                          placeholder="Identifica los principales obstáculos..."
                          placeholderTextColor="#999"
                          value={values.principalObstaculo}
                          onChangeText={handleChange("principalObstaculo")}
                          onBlur={handleBlur("principalObstaculo")}
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
                        {errors.principalObstaculo &&
                          touched.principalObstaculo && (
                            <Text className="text-error-600 text-sm">
                              {errors.principalObstaculo}
                            </Text>
                          )}
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        marginTop: 32,
                      }}
                    >
                      <Button
                        variant="outline"
                        className="flex-1 border-[#9A1445]/30 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                        onPress={() => setStep(0)}
                      >
                        <Text className="text-[#9A1445] font-semibold">
                          Regresar
                        </Text>
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg hover:from-[#9A1445]/90 hover:to-[#9A1445]/70"
                        onPress={() => setStep(2)}
                      >
                        <Text className="font-semibold">Siguiente</Text>
                      </Button>
                    </View>
                  </View>
                ) : (
                  /* Paso 3: Variables técnicas específicas */
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
                          Potencial de desarrollo (subjetivo técnico)
                        </Text>
                        <Select
                          value={
                            values.potencialDesarrollo
                              ? {
                                  label: values.potencialDesarrollo,
                                  value: values.potencialDesarrollo,
                                }
                              : undefined
                          }
                          onValueChange={(option: Option) => {
                            if (option && option.value) {
                              setFieldValue(
                                "potencialDesarrollo",
                                option.value
                              );
                            }
                          }}
                        >
                          <SelectTrigger
                            ref={nivelOrganizacionRef}
                            onTouchStart={() => {
                              nivelOrganizacionRef.current?.open();
                            }}
                          >
                            <SelectValue placeholder="Selecciona el potencial de desarrollo" />
                          </SelectTrigger>
                          <SelectContent insets={insets}>
                            <SelectGroup>
                              {potencialesDesarrollo.map((potencial) => (
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
                        {errors.potencialDesarrollo &&
                          touched.potencialDesarrollo && (
                            <Text className="text-error-600 text-sm">
                              {errors.potencialDesarrollo}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Es viable iniciar un programa piloto de turismo
                          comunitario?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNoEvaluacion.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.programaPiloto === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue("programaPiloto", opcion)
                              }
                            >
                              <Text style={{ textTransform: "capitalize" }}>
                                {opcion}
                              </Text>
                            </Button>
                          ))}
                        </View>
                        {errors.programaPiloto && touched.programaPiloto && (
                          <Text className="text-error-600 text-sm">
                            {errors.programaPiloto}
                          </Text>
                        )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          ¿Es recomendable vincular con programas de
                          financiamiento o asistencia técnica?
                        </Text>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          {opcionesSiNo.map((opcion) => (
                            <Button
                              key={opcion}
                              variant={
                                values.vinculacionFinanciamiento === opcion
                                  ? "default"
                                  : "outline"
                              }
                              onPress={() =>
                                setFieldValue(
                                  "vinculacionFinanciamiento",
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
                        {errors.vinculacionFinanciamiento &&
                          touched.vinculacionFinanciamiento && (
                            <Text className="text-error-600 text-sm">
                              {errors.vinculacionFinanciamiento}
                            </Text>
                          )}
                      </View>

                      <View style={{ gap: 8 }}>
                        <Text className="text-typography-700 font-medium">
                          Geolocalización del sitio o zona mapeada
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
                          Fotografías con descripción contextual (máx 3)
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
                                {/* Image component - using expo-image */}
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
                          Observaciones estratégicas para seguimiento
                        </Text>
                        <Input
                          placeholder="Observaciones y recomendaciones estratégicas..."
                          placeholderTextColor="#999"
                          value={values.observacionesEstrategicas}
                          onChangeText={handleChange(
                            "observacionesEstrategicas"
                          )}
                          onBlur={handleBlur("observacionesEstrategicas")}
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
                        {errors.observacionesEstrategicas &&
                          touched.observacionesEstrategicas && (
                            <Text className="text-error-600 text-sm">
                              {errors.observacionesEstrategicas}
                            </Text>
                          )}
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        marginTop: 32,
                      }}
                    >
                      <Button
                        variant="outline"
                        className="flex-1 border-[#9A1445]/30 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                        onPress={() => setStep(1)}
                      >
                        <Text className="text-[#9A1445] font-semibold">
                          Regresar
                        </Text>
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg hover:from-[#9A1445]/90 hover:to-[#9A1445]/70"
                        onPress={() => handleSubmit()}
                      >
                        <Text className="font-semibold">Finalizar</Text>
                      </Button>
                    </View>
                  </View>
                )}
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
