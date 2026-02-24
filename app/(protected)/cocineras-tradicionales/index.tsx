import { FormHeader } from "@/src/components/common";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { THEME } from "@/src/components/ui/lib/theme";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import { MUNICIPIOS_CON_RUTA } from "@/src/constants/cocineras-tradicionales";
import { CocinerasTradicionalesFormData } from "@/src/forms/schemas/CocinerasTradicionalesForm";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import { cocinerasTradicionalesService } from "@/src/services";
import type { Option } from "@rn-primitives/select";
import { useMutation } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  // Datos generales
  nombre: Yup.string()
    .trim()
    .required("El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  municipio: Yup.string().required("Selecciona el municipio"),
  rutaTuristica: Yup.string().required("La ruta se asigna al elegir municipio"),
  localidad: Yup.string()
    .trim()
    .required("La localidad es requerida")
    .min(2, "La localidad debe tener al menos 2 caracteres"),
  direccion: Yup.string()
    .trim()
    .required("La dirección es requerida")
    .min(5, "La dirección debe tener al menos 5 caracteres"),
  cuentaEstablecimiento: Yup.string()
    .required("Indica si cuenta con establecimiento")
    .oneOf(["si", "no"], "Selecciona Sí o No"),
  nombreEstablecimiento: Yup.string().when("cuentaEstablecimiento", {
    is: "si",
    then: (schema) =>
      schema
        .trim()
        .required("El nombre del establecimiento es requerido")
        .min(
          2,
          "El nombre del establecimiento debe tener al menos 2 caracteres"
        ),
    otherwise: (schema) => schema.optional(),
  }),
  // Datos de contacto
  telefono: Yup.string()
    .required("El teléfono es requerido")
    .length(10, "El teléfono debe tener 10 dígitos")
    .matches(/^[0-9]+$/, "Solo se permiten números"),
  email: Yup.string()
    .trim()
    .required("El correo es requerido")
    .email("Correo electrónico no válido"),
  redesSociales: Yup.string().trim().optional(),
  // Perfil gastronómico
  platilloEspecialidades: Yup.string()
    .trim()
    .required("Las especialidades o platillos son requeridos")
    .min(10, "Describe al menos 10 caracteres"),
});

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const initialValues: CocinerasTradicionalesFormData = {
  nombre: "",
  rutaTuristica: "",
  municipio: "",
  localidad: "",
  direccion: "",
  cuentaEstablecimiento: "",
  nombreEstablecimiento: "",
  telefono: "",
  email: "",
  redesSociales: "",
  platilloEspecialidades: "",
};

/** Campos obligatorios por paso para validar antes de avanzar */
const FIELDS_BY_STEP: (keyof CocinerasTradicionalesFormData)[][] = [
  [
    "nombre",
    "municipio",
    "rutaTuristica",
    "localidad",
    "direccion",
    "cuentaEstablecimiento",
    "nombreEstablecimiento",
  ],
  ["telefono", "email"],
  ["platilloEspecialidades"],
];

function isStepComplete(
  step: number,
  values: CocinerasTradicionalesFormData
): boolean {
  const fields = FIELDS_BY_STEP[step];
  if (!fields) return true;
  for (const field of fields) {
    if (
      field === "nombreEstablecimiento" &&
      values.cuentaEstablecimiento !== "si"
    )
      continue;
    const value = values[field];
    if (value === undefined || value === null) return false;
    const str = String(value).trim();
    if (str === "") return false;
    if (field === "cuentaEstablecimiento" && str !== "si" && str !== "no")
      return false;
    if (field === "nombreEstablecimiento" && str.length < 2) return false;
    if (field === "nombre" && str.length < 2) return false;
    if (field === "localidad" && str.length < 2) return false;
    if (field === "direccion" && str.length < 5) return false;
    if (field === "telefono" && (str.length !== 10 || !/^[0-9]+$/.test(str)))
      return false;
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(str)) return false;
    }
    if (field === "platilloEspecialidades" && str.length < 10) return false;
  }
  return true;
}

/** Sincroniza la validez del paso actual con el padre para deshabilitar Siguiente */
function StepValiditySync({
  step,
  values,
  onValidityChange,
}: {
  step: number;
  values: CocinerasTradicionalesFormData;
  onValidityChange: (complete: boolean) => void;
}) {
  const complete = isStepComplete(step, values);
  React.useEffect(() => {
    onValidityChange(complete);
  }, [complete, onValidityChange]);
  return null;
}

export default function CocinerasTradicionalesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const formikSubmitRef = useRef<(() => void) | null>(null);
  const backgroundColor = THEME[colorScheme].background;
  const primaryColor = THEME[colorScheme].primary;
  const secondaryColor = THEME[colorScheme].secondary;
  const mutedColor = THEME[colorScheme].muted;
  const opacity = colorScheme === "dark" ? 0.1 : 0.05;

  const hasFeriasYFestivalesLabel = useMemo(() => {
    return user?.labels?.some(
      (label) => label.toLowerCase() === "feriasyfestivales"
    );
  }, [user?.labels]);

  if (!hasFeriasYFestivalesLabel) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  const mutation = useMutation({
    mutationFn: (data: CocinerasTradicionalesFormData) =>
      cocinerasTradicionalesService.create(data),
    onSuccess: () => {
      Alert.alert(
        "¡Éxito!",
        "Registro de cocinera tradicional guardado correctamente",
        [{ text: "OK", onPress: () => router.push("/(protected)/(tabs)/home") }]
      );
    },
    onError: (error: Error) => {
      Alert.alert(
        "Error",
        error?.message ?? "No se pudo guardar. Intenta nuevamente."
      );
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
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
            top: 180,
            left: -100,
            width: 320,
            height: 280,
            borderRadius: 180,
            borderTopRightRadius: 80,
            borderBottomLeftRadius: 200,
            backgroundColor: secondaryColor,
            opacity,
            transform: [{ rotate: "25deg" }],
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
          style={{
            position: "absolute",
            bottom: -180,
            left: -70,
            width: 400,
            height: 380,
            borderRadius: 220,
            borderTopRightRadius: 200,
            borderBottomLeftRadius: 100,
            backgroundColor: secondaryColor,
            opacity: opacity * 0.8,
            transform: [{ rotate: "-30deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            top: SCREEN_HEIGHT * 0.35,
            right: SCREEN_WIDTH * 0.15,
            width: 220,
            height: 200,
            borderRadius: 120,
            borderTopLeftRadius: 60,
            borderBottomRightRadius: 140,
            backgroundColor: mutedColor,
            opacity: opacity * 1.2,
            transform: [{ rotate: "45deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            top: SCREEN_HEIGHT * 0.15,
            left: SCREEN_WIDTH * 0.4,
            width: 180,
            height: 160,
            borderRadius: 100,
            borderTopRightRadius: 80,
            borderBottomLeftRadius: 90,
            backgroundColor: primaryColor,
            opacity: opacity * 0.6,
            transform: [{ rotate: "-20deg" }],
          }}
        />

        <FormHeader
          step={step}
          totalSteps={3}
          title={
            step === 0
              ? "Datos generales"
              : step === 1
                ? "Datos de contacto"
                : "Perfil gastronómico"
          }
          description={
            step === 0
              ? "Información de la cocinera tradicional"
              : step === 1
                ? "Teléfono, correo y redes sociales"
                : "Platillos o especialidades"
          }
          icon="mdi:chef-hat"
          directionName="Cocineras Tradicionales"
          backRoute="/home"
        />

        <ScrollView
          className="flex-1 px-6 pb-6 bg-transparent"
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 1 }}
          contentContainerStyle={{
            paddingBottom:
              Platform.OS === "web"
                ? insets.bottom + 24
                : insets.bottom + 80 + 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => mutation.mutate(values)}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
            }) => {
              formikSubmitRef.current = handleSubmit;
              return (
                <>
                  <StepValiditySync
                    step={step}
                    values={values}
                    onValidityChange={setIsStepComplete}
                  />
                  {(() => {
                    const municipioSeleccionado = values.municipio
                      ? MUNICIPIOS_CON_RUTA.find(
                          (m) => m.value === values.municipio
                        )
                      : null;
                    return (
                      <View
                        style={{
                          gap: 24,
                          maxWidth: 672,
                          alignSelf: "center",
                          width: "100%",
                        }}
                      >
                        {/* Step 0: Datos generales */}
                        {step === 0 && (
                          <View className="gap-4">
                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Nombre
                              </Text>
                              <Input
                                placeholder="Nombre completo"
                                value={values.nombre}
                                onChangeText={handleChange("nombre")}
                                onBlur={handleBlur("nombre")}
                              />
                              {errors.nombre && touched.nombre && (
                                <Text className="text-destructive text-sm">
                                  {errors.nombre}
                                </Text>
                              )}
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Municipio
                              </Text>
                              <Select
                                value={
                                  values.municipio
                                    ? {
                                        label:
                                          MUNICIPIOS_CON_RUTA.find(
                                            (m) => m.value === values.municipio
                                          )?.label ?? values.municipio,
                                        value: values.municipio,
                                      }
                                    : undefined
                                }
                                onValueChange={(option: Option) => {
                                  if (option?.value) {
                                    const item = MUNICIPIOS_CON_RUTA.find(
                                      (m) => m.value === option.value
                                    );
                                    setFieldValue("municipio", option.value);
                                    if (item) {
                                      setFieldValue(
                                        "rutaTuristica",
                                        item.rutaValue
                                      );
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el municipio" />
                                </SelectTrigger>
                                <SelectContent insets={insets}>
                                  <SelectGroup>
                                    {MUNICIPIOS_CON_RUTA.map((m) => (
                                      <SelectItem
                                        key={m.value}
                                        label={m.label}
                                        value={m.value}
                                      >
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {errors.municipio && touched.municipio && (
                                <Text className="text-destructive text-sm">
                                  {errors.municipio}
                                </Text>
                              )}
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Ruta turística
                              </Text>
                              <View
                                style={{
                                  padding: 12,
                                  borderRadius: 8,
                                  backgroundColor: "rgba(0,0,0,0.04)",
                                }}
                              >
                                <Text className="text-typography-600">
                                  {municipioSeleccionado
                                    ? municipioSeleccionado.rutaLabel
                                    : "Selecciona el municipio para ver la ruta"}
                                </Text>
                              </View>
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Localidad
                              </Text>
                              <Input
                                placeholder="Localidad"
                                value={values.localidad}
                                onChangeText={handleChange("localidad")}
                                onBlur={handleBlur("localidad")}
                              />
                              {errors.localidad && touched.localidad && (
                                <Text className="text-destructive text-sm">
                                  {errors.localidad}
                                </Text>
                              )}
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Dirección
                              </Text>
                              <Input
                                placeholder="Dirección"
                                value={values.direccion}
                                onChangeText={handleChange("direccion")}
                                onBlur={handleBlur("direccion")}
                              />
                              {errors.direccion && touched.direccion && (
                                <Text className="text-destructive text-sm">
                                  {errors.direccion}
                                </Text>
                              )}
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                ¿Cuenta con establecimiento?
                              </Text>
                              <RadioGroup
                                value={values.cuentaEstablecimiento}
                                onValueChange={(val) => {
                                  setFieldValue("cuentaEstablecimiento", val);
                                  if (val === "no")
                                    setFieldValue("nombreEstablecimiento", "");
                                }}
                                style={{ flexDirection: "row", gap: 24 }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <RadioGroupItem value="si" id="est-si" />
                                  <Label
                                    onPress={() =>
                                      setFieldValue(
                                        "cuentaEstablecimiento",
                                        "si"
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    Sí
                                  </Label>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <RadioGroupItem value="no" id="est-no" />
                                  <Label
                                    onPress={() => {
                                      setFieldValue(
                                        "cuentaEstablecimiento",
                                        "no"
                                      );
                                      setFieldValue(
                                        "nombreEstablecimiento",
                                        ""
                                      );
                                    }}
                                    className="cursor-pointer"
                                  >
                                    No
                                  </Label>
                                </View>
                              </RadioGroup>
                              {errors.cuentaEstablecimiento &&
                                touched.cuentaEstablecimiento && (
                                  <Text className="text-destructive text-sm">
                                    {errors.cuentaEstablecimiento}
                                  </Text>
                                )}
                            </View>

                            {values.cuentaEstablecimiento === "si" && (
                              <View style={{ gap: 8 }}>
                                <Text className="text-typography-700 font-medium">
                                  Nombre del establecimiento
                                </Text>
                                <Input
                                  placeholder="Nombre del establecimiento"
                                  value={values.nombreEstablecimiento}
                                  onChangeText={handleChange(
                                    "nombreEstablecimiento"
                                  )}
                                  onBlur={handleBlur("nombreEstablecimiento")}
                                />
                                {errors.nombreEstablecimiento &&
                                  touched.nombreEstablecimiento && (
                                    <Text className="text-destructive text-sm">
                                      {errors.nombreEstablecimiento}
                                    </Text>
                                  )}
                              </View>
                            )}
                          </View>
                        )}

                        {/* Step 1: Datos de contacto */}
                        {step === 1 && (
                          <View className="gap-4">
                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Número telefónico
                              </Text>
                              <Input
                                placeholder="10 dígitos"
                                value={values.telefono}
                                onChangeText={(text) => {
                                  const numbersOnly = text
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 10);
                                  setFieldValue("telefono", numbersOnly);
                                }}
                                onBlur={handleBlur("telefono")}
                                keyboardType="phone-pad"
                                maxLength={10}
                              />
                              {errors.telefono && touched.telefono && (
                                <Text className="text-destructive text-sm">
                                  {errors.telefono}
                                </Text>
                              )}
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Correo electrónico
                              </Text>
                              <Input
                                placeholder="correo@ejemplo.com"
                                value={values.email}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                keyboardType="email-address"
                                autoCapitalize="none"
                              />
                              {errors.email && touched.email && (
                                <Text className="text-destructive text-sm">
                                  {errors.email}
                                </Text>
                              )}
                            </View>

                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Redes sociales (opcional)
                              </Text>
                              <Input
                                placeholder="Facebook, Instagram, etc."
                                value={values.redesSociales}
                                onChangeText={handleChange("redesSociales")}
                                onBlur={handleBlur("redesSociales")}
                              />
                            </View>
                          </View>
                        )}

                        {/* Step 2: Perfil gastronómico */}
                        {step === 2 && (
                          <View className="gap-4">
                            <View style={{ gap: 8 }}>
                              <Text className="text-typography-700 font-medium">
                                Platillo o especialidades
                              </Text>
                              <Input
                                placeholder="Describe los platillos o especialidades que prepara..."
                                value={values.platilloEspecialidades}
                                onChangeText={handleChange(
                                  "platilloEspecialidades"
                                )}
                                onBlur={handleBlur("platilloEspecialidades")}
                                multiline
                                numberOfLines={4}
                                style={{
                                  minHeight: 100,
                                  textAlignVertical: "top",
                                }}
                              />
                              {errors.platilloEspecialidades &&
                                touched.platilloEspecialidades && (
                                  <Text className="text-destructive text-sm">
                                    {errors.platilloEspecialidades}
                                  </Text>
                                )}
                            </View>
                          </View>
                        )}

                        {/* Botones de navegación (web: dentro del scroll; móvil: barra fija abajo) */}
                        {Platform.OS === "web" && (
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 16,
                              marginTop: 24,
                            }}
                          >
                            {step > 0 ? (
                              <Button
                                variant="outline"
                                onPress={() => setStep(step - 1)}
                                className="flex-1"
                              >
                                <Text>Regresar</Text>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onPress={() => router.back()}
                                className="flex-1"
                              >
                                <Text>Cancelar</Text>
                              </Button>
                            )}
                            {step < 2 ? (
                              <Button
                                onPress={() => setStep(step + 1)}
                                className="flex-1"
                                disabled={!isStepComplete}
                              >
                                <Text>Siguiente</Text>
                              </Button>
                            ) : (
                              <Button
                                onPress={() => handleSubmit()}
                                className="flex-1"
                                disabled={mutation.isPending}
                              >
                                <Text>
                                  {mutation.isPending
                                    ? "Guardando…"
                                    : "Finalizar"}
                                </Text>
                              </Button>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </>
              );
            }}
          </Formik>
        </ScrollView>

        {/* Botones fijos en móvil (como formulario general) */}
        {Platform.OS !== "web" && (
          <View
            className="absolute bottom-0 left-0 right-0 flex-row gap-4 px-6 border-t border-black/10"
            style={{
              zIndex: 10,
              backgroundColor,
              paddingBottom: insets.bottom,
              paddingTop: 16,
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }
                : { elevation: 8 }),
            }}
          >
            {step === 0 ? (
              <>
                <Button
                  variant="outline"
                  onPress={() => router.back()}
                  className="flex-1"
                >
                  <Text>Cancelar</Text>
                </Button>
                <Button
                  onPress={() => setStep(step + 1)}
                  className="flex-1"
                  disabled={!isStepComplete}
                >
                  <Text>Siguiente</Text>
                </Button>
              </>
            ) : step === 2 ? (
              <>
                <Button
                  variant="outline"
                  onPress={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <Text>Regresar</Text>
                </Button>
                <Button
                  onPress={() => formikSubmitRef.current?.()}
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  <Text>{mutation.isPending ? "Guardando…" : "Finalizar"}</Text>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onPress={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <Text>Regresar</Text>
                </Button>
                <Button
                  onPress={() => setStep(step + 1)}
                  className="flex-1"
                  disabled={!isStepComplete}
                >
                  <Text>Siguiente</Text>
                </Button>
              </>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
