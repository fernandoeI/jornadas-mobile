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
import { ApoyoNegocioForm } from "@/src/forms/schemas/ApoyoNegocioForm";
import { apoyoNegocioService } from "@/src/services/apoyo-negocio";
import type { Option, TriggerRef } from "@rn-primitives/select";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
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
  nombreRazonSocial: Yup.string().required(
    "El nombre o razón social es requerido"
  ),
  tipoPersona: Yup.string().required("El tipo de persona es requerido"),
  tipoNegocio: Yup.string().required("El tipo de negocio es requerido"),
  registradoSAT: Yup.string().required(
    "Debe especificar si está registrado en el SAT"
  ),
  tiempoOperacion: Yup.string().required("El tiempo de operación es requerido"),
  numeroTrabajadores: Yup.string().required(
    "El número de trabajadores es requerido"
  ),
  principalNecesidad: Yup.string().required(
    "La necesidad principal es requerida"
  ),
  apoyoAnterior: Yup.string().required(
    "Debe especificar si ha recibido apoyo anterior"
  ),
  programa: Yup.string().required("El programa es requerido"),
  monto: Yup.string().required("El monto es requerido"),
  estatus: Yup.string().required("El estatus es requerido"),
  tipoApoyoSolicitado: Yup.array().min(
    1,
    "Debe seleccionar al menos un tipo de apoyo"
  ),
  montoEstimado: Yup.string().required("El monto estimado es requerido"),
  formalizacionNegocio: Yup.string().required(
    "Debe especificar si desea formalizar el negocio"
  ),
});

const FondosFinanciamiento = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tipoPersonaRef = useRef<TriggerRef>(null);
  const tipoNegocioRef = useRef<TriggerRef>(null);
  const registradoSATRef = useRef<TriggerRef>(null);
  const tiempoOperacionRef = useRef<TriggerRef>(null);
  const numeroTrabajadoresRef = useRef<TriggerRef>(null);
  const principalNecesidadRef = useRef<TriggerRef>(null);
  const apoyoAnteriorRef = useRef<TriggerRef>(null);
  const programaRef = useRef<TriggerRef>(null);
  const estatusRef = useRef<TriggerRef>(null);
  const formalizacionNegocioRef = useRef<TriggerRef>(null);

  const initialValues: ApoyoNegocioForm = {
    nombreNegocio: "",
    nombreRazonSocial: "",
    tipoPersona: "",
    tipoNegocio: "",
    otroTipoNegocio: "",
    registradoSAT: "",
    tiempoOperacion: "",
    numeroTrabajadores: "",
    principalNecesidad: "",
    otraNecesidad: "",
    apoyoAnterior: "",
    nombreFideicomiso: "",
    programa: "",
    monto: "",
    estatus: "",
    otraDependencia: "",
    nombrePrograma: "",
    montoAsignado: "",
    tipoApoyoSolicitado: [],
    otroTipoApoyo: "",
    montoEstimado: "",
    formalizacionNegocio: "",
  };

  const handleSubmit = async (values: ApoyoNegocioForm) => {
    setLoading(true);
    try {
      await apoyoNegocioService.create(values);
      Alert.alert("¡Éxito!", "Formulario enviado correctamente", [
        {
          text: "OK",
          onPress: () => router.push("/(protected)/(tabs)/home"),
        },
      ]);
    } catch (error) {
      console.error("Error enviando formulario:", error);
      Alert.alert(
        "Error",
        "No se pudo enviar el formulario. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = (
    values: ApoyoNegocioForm,
    handleChange: any,
    errors: any,
    touched: any
  ) => (
    <View style={{ gap: 24 }}>
      <Text className="text-xl font-bold mb-4" style={{ color: "#E0E0E0" }}>
        Datos Generales del Negocio
      </Text>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Nombre del Negocio *
        </Text>
        <Input
          placeholder="Ingresa el nombre de tu negocio"
          placeholderTextColor="#808080"
          value={values.nombreNegocio}
          onChangeText={handleChange("nombreNegocio")}
          style={{
            backgroundColor: "#2A2A2A",
            borderColor:
              errors.nombreNegocio && touched.nombreNegocio
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
        />
        {errors.nombreNegocio && touched.nombreNegocio && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.nombreNegocio}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Nombre o Razón Social *
        </Text>
        <Input
          placeholder="Ingresa el nombre o razón social"
          placeholderTextColor="#808080"
          value={values.nombreRazonSocial}
          onChangeText={handleChange("nombreRazonSocial")}
          style={{
            backgroundColor: "#2A2A2A",
            borderColor:
              errors.nombreRazonSocial && touched.nombreRazonSocial
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
        />
        {errors.nombreRazonSocial && touched.nombreRazonSocial && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.nombreRazonSocial}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Tipo de Persona *
        </Text>
        <Select
          value={
            values.tipoPersona
              ? {
                  label: values.tipoPersona === "fisica" ? "Física" : "Moral",
                  value: values.tipoPersona,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("tipoPersona")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={tipoPersonaRef}
            onTouchStart={() => {
              tipoPersonaRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.tipoPersona && touched.tipoPersona
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
            <SelectValue placeholder="Selecciona el tipo de persona" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Física" value="fisica">
                Física
              </SelectItem>
              <SelectItem label="Moral" value="moral">
                Moral
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.tipoPersona && touched.tipoPersona && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.tipoPersona}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Tipo de Negocio *
        </Text>
        <Select
          value={
            values.tipoNegocio
              ? {
                  label:
                    values.tipoNegocio === "comercio"
                      ? "Comercio"
                      : values.tipoNegocio === "servicios"
                        ? "Servicios"
                        : values.tipoNegocio === "manufactura"
                          ? "Manufactura"
                          : "Otro",
                  value: values.tipoNegocio,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("tipoNegocio")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={tipoNegocioRef}
            onTouchStart={() => {
              tipoNegocioRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.tipoNegocio && touched.tipoNegocio
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
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Comercio" value="comercio">
                Comercio
              </SelectItem>
              <SelectItem label="Servicios" value="servicios">
                Servicios
              </SelectItem>
              <SelectItem label="Manufactura" value="manufactura">
                Manufactura
              </SelectItem>
              <SelectItem label="Otro" value="otro">
                Otro
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.tipoNegocio && touched.tipoNegocio && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.tipoNegocio}
          </Text>
        )}
      </View>

      {values.tipoNegocio === "otro" && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
            Especifica el tipo de negocio
          </Text>
          <Input
            placeholder="Describe el tipo de negocio"
            placeholderTextColor="#808080"
            value={values.otroTipoNegocio}
            onChangeText={handleChange("otroTipoNegocio")}
            style={{
              color: "#E0E0E0",
              backgroundColor: "#2A2A2A",
              borderColor: "#404040",
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
          />
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          ¿Está registrado en el SAT? *
        </Text>
        <Select
          value={
            values.registradoSAT
              ? {
                  label: values.registradoSAT === "si" ? "Sí" : "No",
                  value: values.registradoSAT,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("registradoSAT")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={registradoSATRef}
            onTouchStart={() => {
              registradoSATRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.registradoSAT && touched.registradoSAT
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
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Sí" value="si">
                Sí
              </SelectItem>
              <SelectItem label="No" value="no">
                No
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.registradoSAT && touched.registradoSAT && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.registradoSAT}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Tiempo de Operación *
        </Text>
        <Select
          value={
            values.tiempoOperacion
              ? {
                  label:
                    values.tiempoOperacion === "menos-1"
                      ? "Menos de 1 año"
                      : values.tiempoOperacion === "1-3"
                        ? "1-3 años"
                        : values.tiempoOperacion === "3-5"
                          ? "3-5 años"
                          : "Más de 5 años",
                  value: values.tiempoOperacion,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("tiempoOperacion")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={tiempoOperacionRef}
            onTouchStart={() => {
              tiempoOperacionRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.tiempoOperacion && touched.tiempoOperacion
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
            <SelectValue placeholder="Selecciona el tiempo de operación" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Menos de 1 año" value="menos-1">
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
        {errors.tiempoOperacion && touched.tiempoOperacion && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.tiempoOperacion}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Número de Trabajadores *
        </Text>
        <Select
          value={
            values.numeroTrabajadores
              ? {
                  label:
                    values.numeroTrabajadores === "1-5"
                      ? "1-5"
                      : values.numeroTrabajadores === "6-10"
                        ? "6-10"
                        : values.numeroTrabajadores === "11-20"
                          ? "11-20"
                          : "Más de 20",
                  value: values.numeroTrabajadores,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("numeroTrabajadores")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={numeroTrabajadoresRef}
            onTouchStart={() => {
              numeroTrabajadoresRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.numeroTrabajadores && touched.numeroTrabajadores
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
            <SelectValue placeholder="Selecciona el número de trabajadores" />
          </SelectTrigger>
          <SelectContent insets={insets}>
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
        {errors.numeroTrabajadores && touched.numeroTrabajadores && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.numeroTrabajadores}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = (
    values: ApoyoNegocioForm,
    handleChange: any,
    errors: any,
    touched: any
  ) => (
    <View style={{ gap: 24 }}>
      <Text className="text-xl font-bold mb-4" style={{ color: "#E0E0E0" }}>
        Necesidades y Apoyos
      </Text>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Necesidad Principal *
        </Text>
        <Select
          value={
            values.principalNecesidad
              ? {
                  label:
                    values.principalNecesidad === "capital-trabajo"
                      ? "Capital de trabajo"
                      : values.principalNecesidad === "equipamiento"
                        ? "Equipamiento"
                        : values.principalNecesidad === "infraestructura"
                          ? "Infraestructura"
                          : values.principalNecesidad === "capacitacion"
                            ? "Capacitación"
                            : "Otro",
                  value: values.principalNecesidad,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("principalNecesidad")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={principalNecesidadRef}
            onTouchStart={() => {
              principalNecesidadRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.principalNecesidad && touched.principalNecesidad
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
            <SelectValue placeholder="Selecciona la necesidad principal" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Capital de trabajo" value="capital-trabajo">
                Capital de trabajo
              </SelectItem>
              <SelectItem label="Equipamiento" value="equipamiento">
                Equipamiento
              </SelectItem>
              <SelectItem label="Infraestructura" value="infraestructura">
                Infraestructura
              </SelectItem>
              <SelectItem label="Capacitación" value="capacitacion">
                Capacitación
              </SelectItem>
              <SelectItem label="Otro" value="otro">
                Otro
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.principalNecesidad && touched.principalNecesidad && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.principalNecesidad}
          </Text>
        )}
      </View>

      {values.principalNecesidad === "otro" && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
            Especifica la necesidad
          </Text>
          <Input
            placeholder="Describe la necesidad específica"
            placeholderTextColor="#808080"
            value={values.otraNecesidad}
            onChangeText={handleChange("otraNecesidad")}
            style={{
              color: "#E0E0E0",
              backgroundColor: "#2A2A2A",
              borderColor: "#404040",
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
          />
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          ¿Ha recibido apoyo anterior? *
        </Text>
        <Select
          value={
            values.apoyoAnterior
              ? {
                  label: values.apoyoAnterior === "si" ? "Sí" : "No",
                  value: values.apoyoAnterior,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("apoyoAnterior")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={apoyoAnteriorRef}
            onTouchStart={() => {
              apoyoAnteriorRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.apoyoAnterior && touched.apoyoAnterior
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
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Sí" value="si">
                Sí
              </SelectItem>
              <SelectItem label="No" value="no">
                No
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.apoyoAnterior && touched.apoyoAnterior && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.apoyoAnterior}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Programa *
        </Text>
        <Select
          value={
            values.programa
              ? {
                  label:
                    values.programa === "programa-a"
                      ? "Programa A"
                      : values.programa === "programa-b"
                        ? "Programa B"
                        : "Programa C",
                  value: values.programa,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("programa")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={programaRef}
            onTouchStart={() => {
              programaRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.programa && touched.programa ? "#EF4444" : "#404040",
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
            <SelectValue placeholder="Selecciona el programa" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Programa A" value="programa-a">
                Programa A
              </SelectItem>
              <SelectItem label="Programa B" value="programa-b">
                Programa B
              </SelectItem>
              <SelectItem label="Programa C" value="programa-c">
                Programa C
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.programa && touched.programa && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.programa}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Monto *
        </Text>
        <Input
          placeholder="Ingresa el monto"
          placeholderTextColor="#808080"
          value={values.monto}
          onChangeText={handleChange("monto")}
          keyboardType="numeric"
          style={{
            color: "#E0E0E0",
            backgroundColor: "#2A2A2A",
            borderColor: errors.monto && touched.monto ? "#EF4444" : "#404040",
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
        />
        {errors.monto && touched.monto && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.monto}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Estatus *
        </Text>
        <Select
          value={
            values.estatus
              ? {
                  label:
                    values.estatus === "en-proceso"
                      ? "En proceso"
                      : values.estatus === "aprobado"
                        ? "Aprobado"
                        : values.estatus === "rechazado"
                          ? "Rechazado"
                          : "Pendiente",
                  value: values.estatus,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("estatus")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={estatusRef}
            onTouchStart={() => {
              estatusRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.estatus && touched.estatus ? "#EF4444" : "#404040",
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
            <SelectValue placeholder="Selecciona el estatus" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="En proceso" value="en-proceso">
                En proceso
              </SelectItem>
              <SelectItem label="Aprobado" value="aprobado">
                Aprobado
              </SelectItem>
              <SelectItem label="Rechazado" value="rechazado">
                Rechazado
              </SelectItem>
              <SelectItem label="Pendiente" value="pendiente">
                Pendiente
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.estatus && touched.estatus && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.estatus}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Tipo de Apoyo Solicitado *
        </Text>
        <View style={{ gap: 12 }}>
          {["subsidio", "credito", "garantia", "otro"].map((tipo) => {
            const checked = values.tipoApoyoSolicitado.includes(tipo);
            const labelText =
              tipo === "subsidio"
                ? "Subsidio"
                : tipo === "credito"
                  ? "Crédito"
                  : tipo === "garantia"
                    ? "Garantía"
                    : "Otro";
            return (
              <View
                key={tipo}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Checkbox
                  id={`tipo-apoyo-${tipo}`}
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    if (isChecked) {
                      handleChange("tipoApoyoSolicitado")([
                        ...values.tipoApoyoSolicitado,
                        tipo,
                      ]);
                    } else {
                      handleChange("tipoApoyoSolicitado")(
                        values.tipoApoyoSolicitado.filter((t) => t !== tipo)
                      );
                    }
                  }}
                  checkedClassName="border-[#9A1445] bg-[#9A1445]"
                  indicatorClassName="bg-[#9A1445]"
                />
                <Label
                  htmlFor={`tipo-apoyo-${tipo}`}
                  onPress={Platform.select({
                    native: () => {
                      if (checked) {
                        handleChange("tipoApoyoSolicitado")(
                          values.tipoApoyoSolicitado.filter((t) => t !== tipo)
                        );
                      } else {
                        handleChange("tipoApoyoSolicitado")([
                          ...values.tipoApoyoSolicitado,
                          tipo,
                        ]);
                      }
                    },
                  })}
                >
                  <Text style={{ color: "#E0E0E0" }}>{labelText}</Text>
                </Label>
              </View>
            );
          })}
        </View>
        {errors.tipoApoyoSolicitado && touched.tipoApoyoSolicitado && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.tipoApoyoSolicitado}
          </Text>
        )}
      </View>

      {values.tipoApoyoSolicitado.includes("otro") && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
            Especifica el tipo de apoyo
          </Text>
          <Input
            placeholder="Describe el tipo de apoyo específico"
            placeholderTextColor="#808080"
            value={values.otroTipoApoyo}
            onChangeText={handleChange("otroTipoApoyo")}
            style={{
              color: "#E0E0E0",
              backgroundColor: "#2A2A2A",
              borderColor: "#404040",
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
          />
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          Monto Estimado *
        </Text>
        <Input
          placeholder="Ingresa el monto estimado"
          placeholderTextColor="#808080"
          value={values.montoEstimado}
          onChangeText={handleChange("montoEstimado")}
          keyboardType="numeric"
          style={{
            color: "#E0E0E0",
            backgroundColor: "#2A2A2A",
            borderColor:
              errors.montoEstimado && touched.montoEstimado
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
        />
        {errors.montoEstimado && touched.montoEstimado && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.montoEstimado}
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "#E0E0E0", fontSize: 16, fontWeight: "600" }}>
          ¿Desea formalizar el negocio? *
        </Text>
        <Select
          value={
            values.formalizacionNegocio
              ? {
                  label: values.formalizacionNegocio === "si" ? "Sí" : "No",
                  value: values.formalizacionNegocio,
                }
              : undefined
          }
          onValueChange={(option: Option) => {
            if (option && option.value) {
              handleChange("formalizacionNegocio")(option.value);
            }
          }}
        >
          <SelectTrigger
            ref={formalizacionNegocioRef}
            onTouchStart={() => {
              formalizacionNegocioRef.current?.open();
            }}
            style={{
              backgroundColor: "#2A2A2A",
              borderColor:
                errors.formalizacionNegocio && touched.formalizacionNegocio
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
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent insets={insets}>
            <SelectGroup>
              <SelectItem label="Sí" value="si">
                Sí
              </SelectItem>
              <SelectItem label="No" value="no">
                No
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.formalizacionNegocio && touched.formalizacionNegocio && (
          <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
            {errors.formalizacionNegocio}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      <FormHeader
        step={currentStep}
        totalSteps={2}
        title="Fondos de Financiamiento"
        description={
          currentStep === 1
            ? "Datos Generales del Negocio"
            : "Necesidades y Apoyos"
        }
        icon="💰"
        directionName="Fondos de Financiamiento"
        backRoute="/main"
      />

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <View
              style={{
                gap: 24,
                width: "100%",
                maxWidth: 672,
                marginHorizontal: "auto",
              }}
            >
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
                {currentStep === 1
                  ? renderStep1(values, handleChange, errors, touched)
                  : renderStep2(values, handleChange, errors, touched)}
              </View>

              {/* Botones de navegación */}
              <View
                style={{
                  gap: 16,
                  marginTop: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="outline"
                    onPress={() =>
                      setCurrentStep(currentStep === 1 ? 1 : currentStep - 1)
                    }
                    disabled={currentStep === 1}
                    style={{
                      backgroundColor: "#2A2A2A",
                      borderColor: "#404040",
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 2, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#E0E0E0",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Anterior
                    </Text>
                  </Button>

                  {currentStep < 2 ? (
                    <Button
                      onPress={() => setCurrentStep(currentStep + 1)}
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
                      <Text
                        style={{
                          color: "#E0E0E0",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        Siguiente
                      </Text>
                    </Button>
                  ) : (
                    <Button
                      onPress={() => handleSubmit()}
                      disabled={loading}
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
                      <Text
                        style={{
                          color: "#E0E0E0",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        {loading ? "Enviando..." : "Enviar Formulario"}
                      </Text>
                    </Button>
                  )}
                </View>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FondosFinanciamiento;
