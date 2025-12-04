import { economiaSocialService } from "@/src/services";
import type { Option } from "@rn-primitives/select";
import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Alert } from "react-native";
import {
  ERROR_MESSAGES,
  extractErrorMessage,
  formatErrorMessage,
  isConnectionError,
  isPhoneRegistered,
  isPhoneValid,
} from "./constants";
import type { Localidad, UseDireccionProps } from "./types";

export const useDireccion = ({
  values,
  setValue,
  onNext,
  validateAndNextRef,
}: UseDireccionProps) => {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isLoadingLocalidades, setIsLoadingLocalidades] = useState(false);
  const [isValidatingTelefono, setIsValidatingTelefono] = useState(false);

  const handlePhoneValidationSuccess = useCallback(() => {
    onNext();
  }, [onNext]);

  const handlePhoneValidationError = useCallback((message: string) => {
    Alert.alert("Teléfono ya registrado", formatErrorMessage(message), [
      { text: "Aceptar", style: "default" },
    ]);
  }, []);

  const handleVerificationError = useCallback((message: string) => {
    Alert.alert("Error de verificación", formatErrorMessage(message), [
      { text: "Aceptar", style: "default" },
    ]);
  }, []);

  const handleValidationError = useCallback(
    (error: any) => {
      const errorMessage = extractErrorMessage(error);
      const connectionError = isConnectionError(errorMessage);

      const errorTitle = connectionError
        ? "Error de conexión"
        : "Error de validación";
      const finalMessage = connectionError
        ? ERROR_MESSAGES.CONNECTION_ERROR
        : formatErrorMessage(errorMessage);

      Alert.alert(errorTitle, finalMessage, [
        {
          text: "Continuar de todas formas",
          onPress: onNext,
          style: "default",
        },
        { text: "Cancelar", style: "cancel" },
      ]);
    },
    [onNext]
  );

  const validatePhoneAndProceed = useCallback(async () => {
    if (!isPhoneValid(values.num_celular1)) {
      Alert.alert("Teléfono requerido", ERROR_MESSAGES.PHONE_REQUIRED);
      return;
    }

    setIsValidatingTelefono(true);
    try {
      const response = await economiaSocialService.precheckTelefono(
        values.num_celular1!
      );

      if (isPhoneRegistered(response)) {
        const errorMessage =
          response.message || ERROR_MESSAGES.PHONE_REGISTERED;
        handlePhoneValidationError(errorMessage);
        return;
      }

      if (response.success === true && response.code === "not_found_local") {
        handlePhoneValidationSuccess();
        return;
      }

      if (response.success === false) {
        const errorMessage =
          response.message || ERROR_MESSAGES.PHONE_VERIFICATION_FAILED;
        handleVerificationError(errorMessage);
        return;
      }

      handlePhoneValidationSuccess();
    } catch (error: any) {
      handleValidationError(error);
    } finally {
      setIsValidatingTelefono(false);
    }
  }, [
    values.num_celular1,
    handlePhoneValidationSuccess,
    handlePhoneValidationError,
    handleVerificationError,
    handleValidationError,
  ]);

  useImperativeHandle(validateAndNextRef, () => validatePhoneAndProceed, [
    validatePhoneAndProceed,
  ]);

  useEffect(() => {
    const loadLocalidades = async () => {
      if (!values.municipio) {
        setLocalidades([]);
        return;
      }

      setIsLoadingLocalidades(true);
      try {
        const localidadesData = await economiaSocialService.getLocalidades(
          values.municipio
        );
        setLocalidades(localidadesData);
      } catch (error: any) {
        setLocalidades([]);
        const errorMessage = error?.message || "Error al cargar localidades";
        if (!errorMessage.includes("CORS")) {
          Alert.alert("Error", ERROR_MESSAGES.LOCALIDADES_LOAD_ERROR);
        }
      } finally {
        setIsLoadingLocalidades(false);
      }
    };

    loadLocalidades();
  }, [values.municipio]);

  const handleMunicipioChange = useCallback(
    (option: Option) => {
      if (option?.value) {
        const municipioId = Number(option.value);
        setValue("municipio", municipioId);
        setValue("localidad", null);
      }
    },
    [setValue]
  );

  const handleNumericInput = useCallback((text: string) => {
    return text.replace(/[^0-9]/g, "");
  }, []);

  const getLocalidadPlaceholder = useCallback(() => {
    if (isLoadingLocalidades) return "Cargando localidades...";
    if (values.municipio) return "Selecciona la localidad";
    return "Primero selecciona un municipio";
  }, [isLoadingLocalidades, values.municipio]);

  return {
    localidades,
    isLoadingLocalidades,
    isValidatingTelefono,
    handleMunicipioChange,
    handleNumericInput,
    getLocalidadPlaceholder,
    validatePhoneAndProceed,
  };
};
