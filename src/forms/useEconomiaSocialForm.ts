import { economiaSocialService } from "@/src/services/economia-social";
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

const defaultFormValues: EconomiaSocialFormData = {
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
};

export const useEconomiaSocialForm = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0: Datos solicitante, 1: Dirección, 2: Info social, 3: Emprendimiento
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [folio, setFolio] = useState<string>("");

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
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<EconomiaSocialFormData>({
    resolver: yupResolver(
      economiaSocialValidationSchema
    ) as Resolver<EconomiaSocialFormData>,
    defaultValues: defaultFormValues,
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: async (data: EconomiaSocialFormData) => {
      return await economiaSocialService.createTanda2Request(data);
    },
    onSuccess: (response) => {
      const folioValue = response?.folio || response?.data?.folio || "N/A";
      setFolio(folioValue);
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      console.error("❌ Error enviando formulario:", error);
      console.error("📋 Datos completos del error:", {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        data: error?.data,
        stack: error?.stack,
      });

      // Extraer el mensaje de error
      let errorMessage =
        error?.message ||
        "No se pudo enviar el formulario. Por favor intenta nuevamente.";

      // Si el mensaje contiene información de errores de validación, mejorarlo
      if (error?.data) {
        const errorData = error.data;

        // Si hay errores de validación específicos por campo
        if (errorData.errors || errorData.error) {
          const validationErrors = errorData.errors || errorData.error;

          if (
            typeof validationErrors === "object" &&
            !Array.isArray(validationErrors)
          ) {
            const fieldErrors: string[] = [];

            Object.keys(validationErrors).forEach((field) => {
              const fieldError = validationErrors[field];
              if (Array.isArray(fieldError)) {
                fieldErrors.push(`• ${field}: ${fieldError.join(", ")}`);
              } else if (typeof fieldError === "string") {
                fieldErrors.push(`• ${field}: ${fieldError}`);
              }
            });

            if (fieldErrors.length > 0) {
              errorMessage = `Errores de validación:\n\n${fieldErrors.join("\n")}`;
            }
          }
        }

        // Si hay un mensaje general adicional, agregarlo
        if (errorData.message && !errorMessage.includes(errorData.message)) {
          errorMessage = `${errorData.message}\n\n${errorMessage}`;
        }
      }

      // Truncar si es muy largo (Alert de React Native tiene límites)
      const maxLength = 800;
      if (errorMessage.length > maxLength) {
        errorMessage =
          errorMessage.substring(0, maxLength) +
          "\n\n... (error truncado, ver consola para detalles)";
      }

      // Determinar el título del alert
      const errorTitle = errorMessage.includes("Errores de validación")
        ? "Errores de validación"
        : "Error al enviar formulario";

      Alert.alert(errorTitle, errorMessage);
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

  // Campos obligatorios por paso
  const getRequiredFieldsByStep = (
    currentStep: number
  ): (keyof EconomiaSocialFormData)[] => {
    switch (currentStep) {
      case 0: // Datos del solicitante
        return [
          "curp_txt",
          "nombre",
          "apellido1",
          "fecha_nacimiento",
          "entidad_nacimiento",
          "estado_civil",
          "correo",
        ];
      case 1: // Dirección
        return [
          "municipio",
          "localidad",
          "asentammiento_tipo",
          "asentammiento_nombre",
          "vialidad_tipo",
          "vialidad_nombre",
          "num_celular1",
          "codigo_postal",
          "numero_ext",
        ];
      case 2: // Información social
        return [
          "fuente_ingreso",
          "rfc_boolean",
          "servicio_electricidad",
          "servicio_agua",
          "servicio_drenaje",
          "piso",
        ];
      case 3: // Datos del emprendimiento
        return [
          "monto",
          "negocio_ubicacion",
          "beneficio_tanda",
          "negocio_participacion",
          "negocio_cooperativa",
          "negocio_marca",
          "negocio_marca_registrada",
        ];
      default:
        return [];
    }
  };

  // Validar campos de un paso específico
  const validateStep = async (stepToValidate: number): Promise<boolean> => {
    const fieldsToValidate = getRequiredFieldsByStep(stepToValidate);
    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const goToNextStep = async () => {
    // Validar el paso actual antes de avanzar
    const isValid = await validateStep(step);
    if (!isValid) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos obligatorios antes de continuar."
      );
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Función para reiniciar el formulario
  const resetForm = () => {
    reset(defaultFormValues);
    setStep(0);
    setShowSuccessModal(false);
    setFolio("");
  };

  // Función para cerrar el modal y regresar al home
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push("/(protected)/(tabs)/home");
  };

  // Función para agregar nuevo registro (reinicia el formulario)
  const handleAddNew = () => {
    resetForm();
  };

  // Funciones de validación para usar en el formulario
  const validateCurp = async (curp: string) => {
    try {
      const result = await economiaSocialService.precheckCurp(curp);
      return result;
    } catch (error: any) {
      throw new Error(
        error.message ||
          "Error al validar la CURP. Por favor intenta nuevamente."
      );
    }
  };

  const validateCurpRenapo = async (curp: string) => {
    try {
      const result = await economiaSocialService.validateRenapo(curp);
      return result;
    } catch (error: any) {
      throw new Error(
        error.message ||
          "Error al validar la CURP con RENAPO. Por favor intenta nuevamente."
      );
    }
  };

  const validateTelefono = async (telefono: string) => {
    try {
      const result = await economiaSocialService.precheckTelefono(telefono);
      return result;
    } catch (error: any) {
      throw new Error(
        error.message ||
          "Error al validar el teléfono. Por favor intenta nuevamente."
      );
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    trigger,
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
    validateStep,
    isLoading: mutation.isPending,
    validateCurp,
    validateCurpRenapo,
    validateTelefono,
    showSuccessModal,
    folio,
    handleCloseModal,
    handleAddNew,
  };
};
