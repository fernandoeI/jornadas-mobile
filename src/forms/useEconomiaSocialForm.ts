import { yupResolver } from "@hookform/resolvers/yup";
import type { TriggerRef } from "@rn-primitives/select";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  EconomiaSocialFormData,
  economiaSocialValidationSchema,
} from "./schemas/EconomiaSocialForm";

export const useEconomiaSocialForm = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0: Datos solicitante, 1: Dirección, 2: Info social, 3: Emprendimiento

  // Refs para los Select components
  const estadoCivilRef = useRef<TriggerRef>(null);
  const entidadNacimientoRef = useRef<TriggerRef>(null);
  const municipioRef = useRef<TriggerRef>(null);
  const localidadRef = useRef<TriggerRef>(null);
  const asentamientoTipoRef = useRef<TriggerRef>(null);
  const vialidadTipoRef = useRef<TriggerRef>(null);
  const comprobanteDomicilioRef = useRef<TriggerRef>(null);
  const grupoIndigenaRef = useRef<TriggerRef>(null);
  const lenguaIndigenaRef = useRef<TriggerRef>(null);
  const negocioUbicacionRef = useRef<TriggerRef>(null);
  const negocioAntiguedadRef = useRef<TriggerRef>(null);
  const negocioGananciaRef = useRef<TriggerRef>(null);
  const negocioGiroRef = useRef<TriggerRef>(null);
  const beneficioTandaRef = useRef<TriggerRef>(null);
  const destinoRecursoRef = useRef<TriggerRef>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EconomiaSocialFormData>({
    resolver: yupResolver(
      economiaSocialValidationSchema
    ) as Resolver<EconomiaSocialFormData>,
    defaultValues: {
      // Datos del solicitante
      nombre: "",
      apellido1: "",
      apellido2: "",
      fecha_nacimiento: "",
      entidad_nacimiento: "",
      estado_civil: "",
      curp_txt: "",
      correo: "",

      // Dirección
      municipio: null,
      localidad: null,
      asentammiento_tipo: "",
      asentammiento_nombre: "",
      vialidad_tipo: "",
      vialidad_nombre: "",
      num_celular1: "",
      num_celular2: "",
      codigo_postal: "",
      numero_ext: null,
      numero_int: null,
      comprobante_domicilio_choices: "",

      // Información social
      fuente_ingreso: false,
      rfc_boolean: false,
      servicio_electricidad: false,
      servicio_agua: false,
      servicio_drenaje: false,
      piso: false,
      grupo_indigena: "",
      lengua_indigena: "",
      lenguas_txt: "",
      violencia_bool: false,
      violencia: undefined,

      // Datos del emprendimiento
      monto: null,
      negocio_ubicacion: "",
      negocio_antiguedad: "",
      negocio_ganancia: "",
      negocio_giro: "",
      beneficio_tanda: "",
      destino_recurso: "",
      negocio_participacion: false,
      negocio_cooperativa: false,
      negocio_marca: false,
      negocio_marca_registrada: false,
      negocio_descripcion: "",

      // Otros
      comentarios: "",
      capturista: "",
      folio: "",
    },
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: (data: EconomiaSocialFormData) => {
      // TODO: Implementar servicio de economía social
      console.log("Formulario Economía Social:", data);
      return Promise.resolve({ success: true });
    },
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

  const onSubmit = (data: EconomiaSocialFormData) => {
    mutation.mutate(data);
  };

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "Datos del solicitante";
      case 1:
        return "Dirección";
      case 2:
        return "Información social";
      case 3:
        return "Datos del emprendimiento";
      default:
        return "Economía Social";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Información personal del solicitante";
      case 1:
        return "Dirección de residencia";
      case 2:
        return "Información social y condiciones";
      case 3:
        return "Información del emprendimiento";
      default:
        return "Formulario de economía social";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:account";
      case 1:
        return "mdi:map-marker";
      case 2:
        return "mdi:account-group";
      case 3:
        return "mdi:store";
      default:
        return "mdi:store-outline";
    }
  };

  const goToNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    values,
    errors,
    step,
    setStep,
    contentInsets,
    estadoCivilRef,
    entidadNacimientoRef,
    municipioRef,
    localidadRef,
    asentamientoTipoRef,
    vialidadTipoRef,
    comprobanteDomicilioRef,
    grupoIndigenaRef,
    lenguaIndigenaRef,
    negocioUbicacionRef,
    negocioAntiguedadRef,
    negocioGananciaRef,
    negocioGiroRef,
    beneficioTandaRef,
    destinoRecursoRef,
    getStepTitle,
    getStepDescription,
    getStepIcon,
    goToNextStep,
    goToPreviousStep,
    isLoading: mutation.isPending,
  };
};
