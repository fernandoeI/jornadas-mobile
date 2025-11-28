import { FormHeader } from "@/src/components/common";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import { desarrolloComercialService } from "@/src/services";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Option, TriggerRef } from "@rn-primitives/select";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  nombreNegocio: Yup.string().required("El nombre del negocio es requerido"),
  tipoNegocio: Yup.string().required("El tipo de negocio es requerido"),
  direccion: Yup.string().required("La dirección es requerida"),
  telefono: Yup.string().required("El teléfono es requerido"),
  email: Yup.string().email("Email inválido").required("El email es requerido"),
  rfc: Yup.string().required("El RFC es requerido"),
  antiguedad: Yup.string().required("La antigüedad es requerida"),
  numeroEmpleados: Yup.string().required("El número de empleados es requerido"),
  facturacionMensual: Yup.string().required(
    "La facturación mensual es requerida"
  ),
  necesidades: Yup.string().required("Las necesidades son requeridas"),
  tipoApoyo: Yup.string().required("El tipo de apoyo es requerido"),
  montoSolicitado: Yup.string().required("El monto solicitado es requerido"),
});

type FormData = {
  nombreNegocio: string;
  tipoNegocio: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
  antiguedad: string;
  numeroEmpleados: string;
  facturacionMensual: string;
  necesidades: string;
  tipoApoyo: string;
  montoSolicitado: string;
};

const DesarrolloComercial = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  // Refs para los Select (workaround para mobile)
  const tipoNegocioRef = React.useRef<TriggerRef>(null);
  const antiguedadRef = React.useRef<TriggerRef>(null);
  const numeroEmpleadosRef = React.useRef<TriggerRef>(null);
  const facturacionMensualRef = React.useRef<TriggerRef>(null);
  const tipoApoyoRef = React.useRef<TriggerRef>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombreNegocio: "",
      tipoNegocio: "",
      direccion: "",
      telefono: "",
      email: "",
      rfc: "",
      antiguedad: "",
      numeroEmpleados: "",
      facturacionMensual: "",
      necesidades: "",
      tipoApoyo: "",
      montoSolicitado: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => desarrolloComercialService.create(data),
    onSuccess: () => {
      Alert.alert("¡Éxito!", "Formulario enviado correctamente", [
        {
          text: "OK",
          onPress: () => router.push("/(protected)/(tabs)/home"),
        },
      ]);
    },
    onError: (error: any) => {
      console.error("Error enviando formulario:", error);
      Alert.alert(
        "Error",
        error.message ||
          "No se pudo enviar el formulario. Por favor intenta nuevamente."
      );
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      <FormHeader
        step={1}
        totalSteps={1}
        title="Desarrollo Comercial"
        description="Formulario para proyectos de desarrollo comercial"
        icon="🏪"
        directionName="Desarrollo Comercial"
        backRoute="/home"
      />

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl mx-auto" style={{ gap: 24 }}>
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
            <Text
              className="text-xl font-bold mb-6"
              style={{ color: "#E0E0E0" }}
            >
              Información del Negocio
            </Text>

            <View style={{ gap: 20 }}>
              <View>
                <Text
                  style={{
                    color: "#E0E0E0",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Nombre del Negocio *
                </Text>
                <Controller
                  control={control}
                  name="nombreNegocio"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input
                        placeholder="Ingresa el nombre de tu negocio"
                        value={value}
                        onChangeText={onChange}
                        style={{
                          backgroundColor: "#2A2A2A",
                          borderColor: errors.nombreNegocio
                            ? "#EF4444"
                            : "#404040",
                          borderWidth: 1,
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          shadowColor: "#000",
                          shadowOffset: { width: 2, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 4,
                          color: "#E0E0E0",
                        }}
                        placeholderTextColor="#808080"
                      />
                      {errors.nombreNegocio && (
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {errors.nombreNegocio.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View>
                <Text
                  style={{
                    color: "#E0E0E0",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Tipo de Negocio *
                </Text>
                <Controller
                  control={control}
                  name="tipoNegocio"
                  render={({ field: { onChange, value } }) => {
                    const optionValue: Option | undefined = value
                      ? { value, label: value }
                      : undefined;
                    const handleValueChange = (option: Option | undefined) => {
                      if (option && option.value) {
                        onChange(option.value);
                      }
                    };
                    return (
                      <>
                        <Select
                          value={optionValue}
                          onValueChange={handleValueChange}
                        >
                          <SelectTrigger
                            ref={tipoNegocioRef}
                            onTouchStart={() => tipoNegocioRef.current?.open()}
                            style={{
                              backgroundColor: "#2A2A2A",
                              borderColor: errors.tipoNegocio
                                ? "#EF4444"
                                : "#404040",
                              borderWidth: 1,
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 12,
                              shadowColor: "#000",
                              shadowOffset: { width: 2, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 4,
                              elevation: 4,
                            }}
                          >
                            <SelectValue placeholder="Selecciona el tipo de negocio" />
                          </SelectTrigger>
                          <SelectContent
                            insets={contentInsets}
                            style={{
                              backgroundColor: "#1A1A1A",
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: "#333333",
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 8 },
                              shadowOpacity: 0.5,
                              shadowRadius: 16,
                              elevation: 10,
                            }}
                          >
                            <SelectGroup>
                              <SelectItem
                                label="Comercio al por menor"
                                value="comercio-menor"
                              >
                                Comercio al por menor
                              </SelectItem>
                              <SelectItem
                                label="Comercio al por mayor"
                                value="comercio-mayor"
                              >
                                Comercio al por mayor
                              </SelectItem>
                              <SelectItem
                                label="Restaurante"
                                value="restaurante"
                              >
                                Restaurante
                              </SelectItem>
                              <SelectItem label="Servicios" value="servicios">
                                Servicios
                              </SelectItem>
                              <SelectItem label="Otro" value="otro">
                                Otro
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.tipoNegocio && (
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {errors.tipoNegocio.message}
                          </Text>
                        )}
                      </>
                    );
                  }}
                />
              </View>

              <View>
                <Text
                  style={{
                    color: "#E0E0E0",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Dirección *
                </Text>
                <Controller
                  control={control}
                  name="direccion"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input
                        placeholder="Ingresa la dirección completa"
                        value={value}
                        onChangeText={onChange}
                        style={{
                          backgroundColor: "#2A2A2A",
                          borderColor: errors.direccion ? "#EF4444" : "#404040",
                          borderWidth: 1,
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          shadowColor: "#000",
                          shadowOffset: { width: 2, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 4,
                          color: "#E0E0E0",
                        }}
                        placeholderTextColor="#808080"
                      />
                      {errors.direccion && (
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {errors.direccion.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 16 }}>
                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Teléfono *
                  </Text>
                  <Controller
                    control={control}
                    name="telefono"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Input
                          placeholder="Teléfono"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="phone-pad"
                          style={{
                            backgroundColor: "#2A2A2A",
                            borderColor: errors.telefono
                              ? "#EF4444"
                              : "#404040",
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                            color: "#E0E0E0",
                          }}
                          placeholderTextColor="#808080"
                        />
                        {errors.telefono && (
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {errors.telefono.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Email *
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Input
                          placeholder="Email"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={{
                            backgroundColor: "#2A2A2A",
                            borderColor: errors.email ? "#EF4444" : "#404040",
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                            color: "#E0E0E0",
                          }}
                          placeholderTextColor="#808080"
                        />
                        {errors.email && (
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {errors.email.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 16 }}>
                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    RFC *
                  </Text>
                  <Controller
                    control={control}
                    name="rfc"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Input
                          placeholder="RFC"
                          value={value}
                          onChangeText={onChange}
                          autoCapitalize="characters"
                          style={{
                            backgroundColor: "#2A2A2A",
                            borderColor: errors.rfc ? "#EF4444" : "#404040",
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                            color: "#E0E0E0",
                          }}
                          placeholderTextColor="#808080"
                        />
                        {errors.rfc && (
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {errors.rfc.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Antigüedad *
                  </Text>
                  <Controller
                    control={control}
                    name="antiguedad"
                    render={({ field: { onChange, value } }) => {
                      const optionValue: Option | undefined = value
                        ? { value, label: value }
                        : undefined;
                      const handleValueChange = (
                        option: Option | undefined
                      ) => {
                        if (option && option.value) {
                          onChange(option.value);
                        }
                      };
                      return (
                        <>
                          <Select
                            value={optionValue}
                            onValueChange={handleValueChange}
                          >
                            <SelectTrigger
                              ref={antiguedadRef}
                              onTouchStart={() => antiguedadRef.current?.open()}
                              style={{
                                backgroundColor: "#2A2A2A",
                                borderColor: errors.antiguedad
                                  ? "#EF4444"
                                  : "#404040",
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 2, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                              }}
                            >
                              <SelectValue placeholder="Selecciona la antigüedad" />
                            </SelectTrigger>
                            <SelectContent
                              insets={contentInsets}
                              style={{
                                backgroundColor: "#1A1A1A",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: "#333333",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.5,
                                shadowRadius: 16,
                                elevation: 10,
                              }}
                            >
                              <SelectGroup>
                                <SelectItem
                                  label="Menos de 1 año"
                                  value="menos-1"
                                >
                                  Menos de 1 año
                                </SelectItem>
                                <SelectItem label="1-3 años" value="1-3">
                                  1-3 años
                                </SelectItem>
                                <SelectItem label="3-5 años" value="3-5">
                                  3-5 años
                                </SelectItem>
                                <SelectItem label="Más de 5 años" value="mas-5">
                                  Más de 5 años
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {errors.antiguedad && (
                            <Text
                              style={{
                                color: "#EF4444",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              {errors.antiguedad.message}
                            </Text>
                          )}
                        </>
                      );
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 16 }}>
                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Número de Empleados *
                  </Text>
                  <Controller
                    control={control}
                    name="numeroEmpleados"
                    render={({ field: { onChange, value } }) => {
                      const optionValue: Option | undefined = value
                        ? { value, label: value }
                        : undefined;
                      const handleValueChange = (
                        option: Option | undefined
                      ) => {
                        if (option && option.value) {
                          onChange(option.value);
                        }
                      };
                      return (
                        <>
                          <Select
                            value={optionValue}
                            onValueChange={handleValueChange}
                          >
                            <SelectTrigger
                              ref={numeroEmpleadosRef}
                              onTouchStart={() =>
                                numeroEmpleadosRef.current?.open()
                              }
                              style={{
                                backgroundColor: "#2A2A2A",
                                borderColor: errors.numeroEmpleados
                                  ? "#EF4444"
                                  : "#404040",
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 2, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                              }}
                            >
                              <SelectValue placeholder="Selecciona el número" />
                            </SelectTrigger>
                            <SelectContent
                              insets={contentInsets}
                              style={{
                                backgroundColor: "#1A1A1A",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: "#333333",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.5,
                                shadowRadius: 16,
                                elevation: 10,
                              }}
                            >
                              <SelectGroup>
                                <SelectItem label="1-5" value="1-5">
                                  1-5
                                </SelectItem>
                                <SelectItem label="6-10" value="6-10">
                                  6-10
                                </SelectItem>
                                <SelectItem label="11-20" value="11-20">
                                  11-20
                                </SelectItem>
                                <SelectItem label="Más de 20" value="mas-20">
                                  Más de 20
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {errors.numeroEmpleados && (
                            <Text
                              style={{
                                color: "#EF4444",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              {errors.numeroEmpleados.message}
                            </Text>
                          )}
                        </>
                      );
                    }}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Facturación Mensual *
                  </Text>
                  <Controller
                    control={control}
                    name="facturacionMensual"
                    render={({ field: { onChange, value } }) => {
                      const optionValue: Option | undefined = value
                        ? { value, label: value }
                        : undefined;
                      const handleValueChange = (
                        option: Option | undefined
                      ) => {
                        if (option && option.value) {
                          onChange(option.value);
                        }
                      };
                      return (
                        <>
                          <Select
                            value={optionValue}
                            onValueChange={handleValueChange}
                          >
                            <SelectTrigger
                              ref={facturacionMensualRef}
                              onTouchStart={() =>
                                facturacionMensualRef.current?.open()
                              }
                              style={{
                                backgroundColor: "#2A2A2A",
                                borderColor: errors.facturacionMensual
                                  ? "#EF4444"
                                  : "#404040",
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 2, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                              }}
                            >
                              <SelectValue placeholder="Selecciona el rango" />
                            </SelectTrigger>
                            <SelectContent
                              insets={contentInsets}
                              style={{
                                backgroundColor: "#1A1A1A",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: "#333333",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.5,
                                shadowRadius: 16,
                                elevation: 10,
                              }}
                            >
                              <SelectGroup>
                                <SelectItem
                                  label="Menos de $50,000"
                                  value="menos-50k"
                                >
                                  Menos de $50,000
                                </SelectItem>
                                <SelectItem
                                  label="$50,000 - $100,000"
                                  value="50k-100k"
                                >
                                  $50,000 - $100,000
                                </SelectItem>
                                <SelectItem
                                  label="$100,000 - $500,000"
                                  value="100k-500k"
                                >
                                  $100,000 - $500,000
                                </SelectItem>
                                <SelectItem
                                  label="Más de $500,000"
                                  value="mas-500k"
                                >
                                  Más de $500,000
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {errors.facturacionMensual && (
                            <Text
                              style={{
                                color: "#EF4444",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              {errors.facturacionMensual.message}
                            </Text>
                          )}
                        </>
                      );
                    }}
                  />
                </View>
              </View>

              <View>
                <Text
                  style={{
                    color: "#E0E0E0",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Necesidades del Negocio *
                </Text>
                <Controller
                  control={control}
                  name="necesidades"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Input
                        placeholder="Describe las necesidades de tu negocio"
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={3}
                        style={{
                          backgroundColor: "#2A2A2A",
                          borderColor: errors.necesidades
                            ? "#EF4444"
                            : "#404040",
                          borderWidth: 1,
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          shadowColor: "#000",
                          shadowOffset: { width: 2, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 4,
                          color: "#E0E0E0",
                        }}
                        placeholderTextColor="#808080"
                      />
                      {errors.necesidades && (
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {errors.necesidades.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 16 }}>
                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Tipo de Apoyo *
                  </Text>
                  <Controller
                    control={control}
                    name="tipoApoyo"
                    render={({ field: { onChange, value } }) => {
                      const optionValue: Option | undefined = value
                        ? { value, label: value }
                        : undefined;
                      const handleValueChange = (
                        option: Option | undefined
                      ) => {
                        if (option && option.value) {
                          onChange(option.value);
                        }
                      };
                      return (
                        <>
                          <Select
                            value={optionValue}
                            onValueChange={handleValueChange}
                          >
                            <SelectTrigger
                              ref={tipoApoyoRef}
                              onTouchStart={() => tipoApoyoRef.current?.open()}
                              style={{
                                backgroundColor: "#2A2A2A",
                                borderColor: errors.tipoApoyo
                                  ? "#EF4444"
                                  : "#404040",
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                shadowColor: "#000",
                                shadowOffset: { width: 2, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                              }}
                            >
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent
                              insets={contentInsets}
                              style={{
                                backgroundColor: "#1A1A1A",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: "#333333",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.5,
                                shadowRadius: 16,
                                elevation: 10,
                              }}
                            >
                              <SelectGroup>
                                <SelectItem
                                  label="Equipamiento"
                                  value="equipamiento"
                                >
                                  Equipamiento
                                </SelectItem>
                                <SelectItem
                                  label="Infraestructura"
                                  value="infraestructura"
                                >
                                  Infraestructura
                                </SelectItem>
                                <SelectItem
                                  label="Capital de trabajo"
                                  value="capital"
                                >
                                  Capital de trabajo
                                </SelectItem>
                                <SelectItem
                                  label="Capacitación"
                                  value="capacitacion"
                                >
                                  Capacitación
                                </SelectItem>
                                <SelectItem label="Otro" value="otro">
                                  Otro
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {errors.tipoApoyo && (
                            <Text
                              style={{
                                color: "#EF4444",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              {errors.tipoApoyo.message}
                            </Text>
                          )}
                        </>
                      );
                    }}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Monto Solicitado *
                  </Text>
                  <Controller
                    control={control}
                    name="montoSolicitado"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Input
                          placeholder="Monto en pesos"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="numeric"
                          style={{
                            backgroundColor: "#2A2A2A",
                            borderColor: errors.montoSolicitado
                              ? "#EF4444"
                              : "#404040",
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                            color: "#E0E0E0",
                          }}
                          placeholderTextColor="#808080"
                        />
                        {errors.montoSolicitado && (
                          <Text
                            style={{
                              color: "#EF4444",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {errors.montoSolicitado.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Botón de envío */}
          <Button
            onPress={handleSubmit((data) => mutation.mutate(data))}
            disabled={mutation.isPending}
            style={{
              backgroundColor: "#9A1445",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              shadowColor: "#000",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
              {mutation.isPending ? "Enviando..." : "Enviar Formulario"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DesarrolloComercial;
