import { promocionTuristicaService } from "@/src/services/promocion-turistica";
import { openCameraDirectly, pickImagesForWeb } from "@/src/utils/imagePicker";
import { getLocationWithFallback } from "@/src/utils/location";
import { yupResolver } from "@hookform/resolvers/yup";
import type { TriggerRef } from "@rn-primitives/select";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PromocionTuristicaFormData,
  promocionTuristicaValidationSchema,
} from "./schemas/PromocionTuristicaForm";

export interface Foto {
  uri: string;
  descripcion: string;
}

export const usePromocionTuristicaForm = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0: Información básica, 1: Evaluación técnica
  const [fotos, setFotos] = useState<Foto[]>([]);

  // Refs para los Select components
  const nivelConocimientoRef = useRef<TriggerRef>(null);
  const condicionesAccesoRef = useRef<TriggerRef>(null);
  const estadoConservacionRef = useRef<TriggerRef>(null);
  const potencialPromocionalRef = useRef<TriggerRef>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PromocionTuristicaFormData>({
    resolver: yupResolver(
      promocionTuristicaValidationSchema
    ) as Resolver<PromocionTuristicaFormData>,
    defaultValues: {
      nombreAtractivo: "",
      tipoAtractivo: [],
      otroTipoAtractivo: "",
      quienPromueve: "",
      otroQuienPromueve: "",
      nivelConocimiento: "",
      tieneSenaletica: "",
      enPlataformaDigital: "",
      serviciosExistentes: [],
      otrosServicios: "",
      condicionesAcceso: "",
      estadoConservacion: "",
      potencialPromocional: "",
      observacionesTecnicas: "",
      geolocalizacion: "",
      fotografias: [],
      observacionesAdicionales: "",
    },
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: (data: PromocionTuristicaFormData) => {
      const submissionData = {
        ...data,
        fotografias: fotos,
      };
      return promocionTuristicaService.create(submissionData);
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

  const onSubmit = (data: PromocionTuristicaFormData) => {
    mutation.mutate(data);
  };

  const pickImage = async () => {
    try {
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
            setFotos(newFotos);
          }
        }
      } else {
        // Para móvil o primera foto en web, usar cámara directa
        const imageUri = await openCameraDirectly();
        if (imageUri) {
          const newFotos = [...fotos, { uri: imageUri, descripcion: "" }];
          setFotos(newFotos);
        }
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
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

  const handleGetLocation = async () => {
    try {
      const location = await getLocationWithFallback();
      setValue("geolocalizacion", location, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      // Forzar validación inmediata del campo
      await trigger("geolocalizacion");
    } catch (error) {
      // El error ya se muestra en getLocationWithFallback
    }
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
        return "Identificación de atractivos turísticos";
      case 1:
        return "Observación técnica";
      default:
        return "Promoción y Difusión Turística";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Información básica del atractivo turístico";
      case 1:
        return "Evaluación técnica del atractivo turístico";
      default:
        return "Evaluación de atractivos turísticos";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:map-marker";
      case 1:
        return "mdi:clipboard-check";
      default:
        return "mdi:map-marker-star";
    }
  };

  // Campos obligatorios por paso
  const getRequiredFieldsByStep = (
    currentStep: number
  ): (keyof PromocionTuristicaFormData)[] => {
    switch (currentStep) {
      case 0: // Información básica
        return [
          "nombreAtractivo",
          "tipoAtractivo",
          "quienPromueve",
          "nivelConocimiento",
          "tieneSenaletica",
          "enPlataformaDigital",
          "serviciosExistentes",
        ];
      case 1: // Observación técnica
        return [
          "condicionesAcceso",
          "estadoConservacion",
          "potencialPromocional",
          "observacionesTecnicas",
          "geolocalizacion",
          "observacionesAdicionales",
        ];
      default:
        return [];
    }
  };

  // Validar campos de un paso específico
  const validateStep = async (stepToValidate: number): Promise<boolean> => {
    const fieldsToValidate = getRequiredFieldsByStep(stepToValidate);
    if (fieldsToValidate.length === 0) return true;
    
    // Validar campos condicionales
    if (stepToValidate === 0) {
      // Validar otroTipoAtractivo si "otro" está en tipoAtractivo
      if (values.tipoAtractivo?.includes("otro")) {
        fieldsToValidate.push("otroTipoAtractivo");
      }
      // Validar otroQuienPromueve si quienPromueve es "otro"
      if (values.quienPromueve === "otro") {
        fieldsToValidate.push("otroQuienPromueve");
      }
      // Validar otrosServicios si "otros" está en serviciosExistentes
      if (values.serviciosExistentes?.includes("otros")) {
        fieldsToValidate.push("otrosServicios");
      }
    }
    
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

    if (step < 1) {
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
    trigger,
    values,
    errors,
    step,
    setStep,
    fotos,
    pickImage,
    removeFoto,
    updateFotoDescripcion,
    handleGetLocation,
    contentInsets,
    nivelConocimientoRef,
    condicionesAccesoRef,
    estadoConservacionRef,
    potencialPromocionalRef,
    getStepTitle,
    getStepDescription,
    getStepIcon,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    isLoading: mutation.isPending,
  };
};
