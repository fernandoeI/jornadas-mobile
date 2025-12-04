import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { economiaSocialService } from "@/src/services/economia-social";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { Alert } from "react-native";
import { findEstadoValueByName, formatErrorMessage } from "./constants";
import { ERROR_MESSAGES } from "./types";

interface UseDatosSolicitanteProps {
  values: EconomiaSocialFormData;
  errors: FieldErrors<EconomiaSocialFormData>;
  setValue: (
    name: keyof EconomiaSocialFormData,
    value: any,
    options?: {
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }
  ) => void;
  trigger?: (
    name?: keyof EconomiaSocialFormData | (keyof EconomiaSocialFormData)[]
  ) => Promise<boolean>;
}

export const useDatosSolicitante = ({
  values,
  errors,
  setValue,
  trigger,
}: UseDatosSolicitanteProps) => {
  const [isValidatingCurp, setIsValidatingCurp] = useState(false);
  const [isCurpValidated, setIsCurpValidated] = useState(false);
  const [allowManualEdit, setAllowManualEdit] = useState(false);

  // Resetear el estado de validación cuando cambie el CURP
  useEffect(() => {
    setIsCurpValidated(false);
    setAllowManualEdit(false);
  }, [values.curp_txt]);

  // Verificar si el formulario está completo para este paso
  const isFormComplete = useMemo(() => {
    // Campos requeridos para el paso de datos del solicitante
    const requiredFields = {
      curp_txt: values.curp_txt?.trim().length === 18,
      nombre: !!values.nombre?.trim(),
      apellido1: !!values.apellido1?.trim(),
      fecha_nacimiento: !!values.fecha_nacimiento?.trim(),
      entidad_nacimiento: !!values.entidad_nacimiento?.trim(),
      estado_civil: !!values.estado_civil?.trim(),
      correo: !!values.correo?.trim() && values.correo.includes("@"), // Validación básica de email
    };

    // Verificar que todos los campos requeridos estén completos
    const allFieldsComplete = Object.values(requiredFields).every(
      (isComplete) => isComplete
    );

    // El formulario está completo solo si:
    // 1. Todos los campos requeridos están llenos
    // 2. La CURP está validada O se permitió edición manual
    // 3. No hay errores en los campos requeridos
    const hasNoErrors =
      !errors.nombre &&
      !errors.apellido1 &&
      !errors.fecha_nacimiento &&
      !errors.entidad_nacimiento &&
      !errors.estado_civil &&
      !errors.curp_txt &&
      !errors.correo;

    return (
      allFieldsComplete && hasNoErrors && (isCurpValidated || allowManualEdit)
    );
  }, [
    values.curp_txt,
    values.nombre,
    values.apellido1,
    values.fecha_nacimiento,
    values.entidad_nacimiento,
    values.estado_civil,
    values.correo,
    errors.nombre,
    errors.apellido1,
    errors.fecha_nacimiento,
    errors.entidad_nacimiento,
    errors.estado_civil,
    errors.curp_txt,
    errors.correo,
    isCurpValidated,
    allowManualEdit,
  ]);

  const handleValidateCurp = useCallback(async () => {
    const curp = values.curp_txt?.trim().toUpperCase();

    if (!curp || curp.length !== 18) {
      Alert.alert("Error de validación", ERROR_MESSAGES.CURP_REQUIRED);
      return;
    }

    setIsValidatingCurp(true);
    try {
      // Primero verificar si ya existe un registro previo
      try {
        const precheckResponse = await economiaSocialService.precheckCurp(curp);

        // Si existe un registro previo, mostrar error y no continuar
        const hasExistingRecord =
          precheckResponse.success === false &&
          (precheckResponse.code === "exists_tanda2" ||
            precheckResponse.exists === true ||
            precheckResponse.registered === true);

        if (hasExistingRecord) {
          const errorMessage =
            precheckResponse.message || ERROR_MESSAGES.CURP_ALREADY_REGISTERED;

          // Si hay información del registro existente, incluirla en el mensaje
          let fullMessage = errorMessage;
          if (precheckResponse.existing_record?.folio) {
            fullMessage = `${errorMessage}\n\nFolio: ${precheckResponse.existing_record.folio}`;
            if (precheckResponse.existing_record.nombre) {
              fullMessage += `\nNombre: ${precheckResponse.existing_record.nombre}`;
            }
          }

          Alert.alert("CURP ya registrada", formatErrorMessage(fullMessage), [
            { text: "Aceptar", style: "default" },
          ]);
          return;
        }

        // Si success es false pero no es por registro existente, también detener
        if (precheckResponse.success === false) {
          const errorMessage =
            precheckResponse.message || ERROR_MESSAGES.CURP_PRECHECK_FAILED;
          Alert.alert(
            "Error de verificación",
            formatErrorMessage(errorMessage),
            [{ text: "Aceptar", style: "default" }]
          );
          return;
        }
      } catch (precheckError: any) {
        // Si el precheck falla, continuar con la validación RENAPO
        // (puede ser un error de conexión temporal)
        console.warn(
          "Error en precheck CURP, continuando con validación RENAPO:",
          precheckError
        );
      }

      // Si no existe registro previo, continuar con la validación RENAPO
      const response = await economiaSocialService.validateRenapo(curp);

      // Verificar si la respuesta existe
      if (!response) {
        Alert.alert(
          "Error de conexión",
          formatErrorMessage(ERROR_MESSAGES.NO_SERVER_RESPONSE),
          [
            {
              text: "Continuar sin validar",
              onPress: () => setAllowManualEdit(true),
              style: "default",
            },
            { text: "Cancelar", style: "cancel" },
          ]
        );
        return;
      }

      // La respuesta del RENAPO tiene estructura anidada: { success, message, data: { codigo, mensaje, datos } }
      if (response.success === false) {
        const errorMessage =
          response.data?.mensaje ||
          (response as any).message ||
          ERROR_MESSAGES.CURP_VALIDATION_FAILED;
        Alert.alert("Error de validación", formatErrorMessage(errorMessage), [
          {
            text: "Continuar sin validar",
            onPress: () => setAllowManualEdit(true),
            style: "default",
          },
          { text: "Cancelar", style: "cancel" },
        ]);
        return;
      }

      // Si success es true pero no hay data, mostrar error genérico
      if (!response.data) {
        Alert.alert(
          "Error de validación",
          formatErrorMessage(ERROR_MESSAGES.CURP_VALIDATION_FAILED),
          [
            {
              text: "Continuar sin validar",
              onPress: () => setAllowManualEdit(true),
              style: "default",
            },
            { text: "Cancelar", style: "cancel" },
          ]
        );
        return;
      }

      // Los datos están dentro de response.data
      const renapoData = response.data;

      // Verificar el código de respuesta interno
      if (renapoData.codigo !== "00" || !renapoData.datos) {
        const errorMessage =
          renapoData.mensaje || ERROR_MESSAGES.CURP_VALIDATION_FAILED;
        Alert.alert("Error de validación", formatErrorMessage(errorMessage), [
          {
            text: "Continuar sin validar",
            onPress: () => setAllowManualEdit(true),
            style: "default",
          },
          { text: "Cancelar", style: "cancel" },
        ]);
        return;
      }

      const datos = renapoData.datos;

      // Mapear los datos al formulario usando setValue con opciones
      const updates: {
        field: keyof EconomiaSocialFormData;
        value: any;
      }[] = [];

      if (datos?.nombres) {
        updates.push({ field: "nombre", value: datos.nombres });
      }
      if (datos?.apellido1) {
        updates.push({ field: "apellido1", value: datos.apellido1 });
      }
      if (datos?.apellido2) {
        updates.push({ field: "apellido2", value: datos.apellido2 });
      }
      if (datos?.fechNac) {
        // La fecha ya viene en formato DD/MM/YYYY desde el RENAPO
        updates.push({ field: "fecha_nacimiento", value: datos.fechNac });
      }
      if (datos?.cveEntidadNac) {
        // cveEntidadNac viene como código (ej: "TC" para Tabasco)
        const estadoValue = findEstadoValueByName(datos.cveEntidadNac);
        if (estadoValue) {
          updates.push({ field: "entidad_nacimiento", value: estadoValue });
        }
      }

      // Aplicar todas las actualizaciones usando setValue con todas las opciones
      await Promise.all(
        updates.map(async ({ field, value }) => {
          setValue(field, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        })
      );

      // Forzar validación de los campos actualizados después de setValue
      if (trigger && updates.length > 0) {
        const fieldsToTrigger = updates.map((u) => u.field);
        try {
          await trigger(fieldsToTrigger);
        } catch (triggerError) {
          console.error("Error en trigger:", triggerError);
        }
      }

      // Marcar la CURP como validada exitosamente
      setIsCurpValidated(true);

      // Pequeño delay para asegurar que los valores se establezcan antes del alert
      await new Promise((resolve) => setTimeout(resolve, 100));

      Alert.alert("Éxito", "Los datos se han completado automáticamente");
    } catch (error: any) {
      console.error("Error validando CURP:", error);

      // Intentar extraer el mensaje de error más específico
      let errorMessage = ERROR_MESSAGES.CURP_VALIDATION_FAILED;

      if (error?.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.data?.mensaje) {
        errorMessage = error.data.mensaje;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Detectar si es error de conexión
      const isConnectionError =
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("conexión") ||
        errorMessage.toLowerCase().includes("connection") ||
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("failed to fetch");

      let errorTitle = "Error de validación";

      if (isConnectionError) {
        errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
        errorTitle = "Error de conexión";
      }

      Alert.alert(errorTitle, formatErrorMessage(errorMessage), [
        {
          text: "Continuar sin validar",
          onPress: () => setAllowManualEdit(true),
          style: "default",
        },
        { text: "Cancelar", style: "cancel" },
      ]);
    } finally {
      setIsValidatingCurp(false);
    }
  }, [values.curp_txt, setValue, trigger]);

  return {
    isValidatingCurp,
    isCurpValidated,
    allowManualEdit,
    isFormComplete,
    handleValidateCurp,
  };
};
