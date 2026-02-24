import { jornadasService } from "@/src/services/jornadas";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AgregarSeguimientoFormData,
  agregarSeguimientoValidationSchema,
} from "./schemas/AgregarSeguimientoForm";

const defaultFormValues: AgregarSeguimientoFormData = {
  // Datos de la INE
  nombre: "",
  primerApellido: "",
  segundoApellido: "",
  direccion: "",
  genero: "no binaria",
  edad: "",
  curp: "",
  ineFile: undefined,

  // Datos del formulario completo
  referidoGobernador: "",
  municipio: "",
  localidad: "",
  grupoSocial: [],
  telefono: "",
  correo: "",
  negocio: "",
  sat: "",
  tipoNegocio: "",
  otroTipoNegocio: "",
  capacitacion: [],
  ocupacion: "",
  comentarios: "",
  diagnostico: [],
  areaRegistro: "",
};

export const useAgregarSeguimientoForm = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0: Escaneo INE, 1: Datos INE, 2: Info adicional, 3: Confirmación
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<AgregarSeguimientoFormData>({
    resolver: yupResolver(
      agregarSeguimientoValidationSchema
    ) as Resolver<AgregarSeguimientoFormData>,
    defaultValues: defaultFormValues,
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: async (data: AgregarSeguimientoFormData) => {
      if (!data.ineFile) {
        throw new Error("El archivo INE es requerido");
      }

      // Preparar datos para el backend
      // Mapear los campos del formulario a los nombres de atributos de la colección
      const jornadaData = {
        // Datos de la INE (usar nombreSolicitante en lugar de nombre)
        nombreSolicitante: data.nombre,
        primerApellido: data.primerApellido,
        segundoApellido: data.segundoApellido || "",
        direccion: data.direccion || "",
        genero: data.genero,
        edad: data.edad || "",
        curp: data.curp,

        // Datos del formulario completo
        referidoGobernador: data.referidoGobernador,
        municipio: data.municipio,
        localidad: data.localidad,
        grupoSocial: data.grupoSocial,
        telefono: data.telefono,
        correo: data.correo,
        negocio: data.negocio,
        sat: data.sat,
        tipoNegocio: data.tipoNegocio || "",
        otroTipoNegocio: data.otroTipoNegocio || "",
        capacitacion: data.capacitacion || [],
        ocupacion: data.ocupacion || "",
        comentarios: data.comentarios || "",
        diagnostico: data.diagnostico,
        areaRegistro: data.areaRegistro,
      };

      return await jornadasService.createWithINE(jornadaData, data.ineFile);
    },
    onSuccess: (response) => {
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      let errorMessage =
        error?.message ||
        "No se pudo enviar el formulario. Por favor intenta nuevamente.";

      if (error?.data) {
        const errorData = error.data;
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
        if (errorData.message && !errorMessage.includes(errorData.message)) {
          errorMessage = `${errorData.message}\n\n${errorMessage}`;
        }
      }

      const maxLength = 800;
      if (errorMessage.length > maxLength) {
        errorMessage =
          errorMessage.substring(0, maxLength) +
          "\n\n... (error truncado, ver consola para detalles)";
      }

      const errorTitle = errorMessage.includes("Errores de validación")
        ? "Errores de validación"
        : "Error al enviar formulario";

      Alert.alert(errorTitle, errorMessage);
    },
  });

  const onSubmit = (data: AgregarSeguimientoFormData) => {
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
        return "Escaneo de INE";
      case 1:
        return "Datos de INE";
      case 2:
        return "Información Adicional";
      case 3:
        return "Confirmación";
      default:
        return "Agregar Seguimiento";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Escanea la parte frontal de tu INE";
      case 1:
        return "Verifica y completa los datos de tu INE";
      case 2:
        return "Completa la información adicional requerida";
      case 3:
        return "Revisa y confirma toda la información";
      default:
        return "Formulario de seguimiento";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:camera";
      case 1:
        return "mdi:card-account-details";
      case 2:
        return "mdi:clipboard-text";
      case 3:
        return "mdi:check-circle";
      default:
        return "mdi:form";
    }
  };

  // Campos obligatorios por paso
  const getRequiredFieldsByStep = (
    currentStep: number
  ): (keyof AgregarSeguimientoFormData)[] => {
    switch (currentStep) {
      case 0: // Escaneo INE
        return ["ineFile"];
      case 1: // Datos INE - Todos los campos son obligatorios
        return [
          "nombre",
          "primerApellido",
          "segundoApellido",
          "direccion",
          "curp",
          "genero",
          "edad",
        ];
      case 2: // Información adicional
        return [
          "referidoGobernador",
          "municipio",
          "localidad",
          "grupoSocial",
          "telefono",
          "correo",
          "negocio",
          "sat",
          "diagnostico",
          "areaRegistro",
        ];
      case 3: // Confirmación
        return [];
      default:
        return [];
    }
  };

  // Validar campos de un paso específico
  const validateStep = async (stepToValidate: number): Promise<boolean> => {
    const fieldsToValidate = getRequiredFieldsByStep(stepToValidate);
    if (fieldsToValidate.length === 0) return true;
    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const goToNextStep = async () => {
    // Validar el paso actual antes de avanzar
    const isValid = await validateStep(step);
    if (!isValid) {
      // Mensajes específicos por paso
      if (step === 0) {
        Alert.alert(
          "INE no escaneada",
          "Debes escanear la INE antes de continuar. Por favor captura la imagen de tu INE usando el botón 'Escanear INE'."
        );
      } else {
        Alert.alert(
          "Campos incompletos",
          "Por favor completa todos los campos obligatorios antes de continuar."
        );
      }
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
    setRegistradoPor("");
    setRegistradoPorEmail("");
  };

  // Función para cerrar el modal y regresar al home
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.back();
  };

  // Función para agregar nuevo registro (reinicia el formulario)
  const handleAddNew = () => {
    resetForm();
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
    getStepTitle,
    getStepDescription,
    getStepIcon,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    isLoading: mutation.isPending,
    showSuccessModal,
    handleCloseModal,
    handleAddNew,
  };
};

