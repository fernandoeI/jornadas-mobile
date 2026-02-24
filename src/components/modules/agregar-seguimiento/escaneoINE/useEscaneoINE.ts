import { AgregarSeguimientoFormData } from "@/src/forms/schemas/AgregarSeguimientoForm";
import {
  compressImage,
  INEScanResult,
  processINE,
} from "@/src/utils/functions";
import { useCallback, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { Alert } from "react-native";
import { ERROR_MESSAGES } from "./constants";
import { UseEscaneoINEProps } from "./types";

export const useEscaneoINE = ({
  values,
  errors,
  setValue,
  trigger,
}: UseEscaneoINEProps) => {
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleScan = useCallback(
    async (
      file: File | { uri: string; name: string; type: string },
      setLoading: (val: boolean) => void,
      setFormDataFromScan: (data: INEScanResult) => void
    ): Promise<boolean> => {
      setLoadingOCR(true);
      setError(null);
      setLoading(true);
      setScanSuccess(false);

      try {
        // SIEMPRE guardar la imagen primero, independientemente del OCR
        // Comprimir la imagen para guardarla
        const compressedFile = await compressImage(file, 800);
        
        // Guardar la imagen en el formulario SIEMPRE
        setValue("ineFile", compressedFile, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        // Intentar procesar con OCR (puede fallar, pero la imagen ya está guardada)
        try {
          const result = await processINE(file);

          if (result) {
            // Si el OCR fue exitoso, mapear los datos al formulario
            if (result.nombre) {
              setValue("nombre", result.nombre, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            if (result.primerApellido) {
              setValue("primerApellido", result.primerApellido, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            if (result.segundoApellido) {
              setValue("segundoApellido", result.segundoApellido, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            if (result.direccion) {
              setValue("direccion", result.direccion, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            if (result.genero) {
              setValue("genero", result.genero, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            if (result.edad) {
              setValue("edad", result.edad, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            if (result.curp) {
              setValue("curp", result.curp, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }

            setFormDataFromScan(result);
          } else {
            // OCR falló pero la imagen está guardada
            setError(
              "La imagen de la INE se guardó correctamente, pero no se pudieron leer los datos automáticamente. Por favor completa los datos manualmente."
            );
          }
        } catch (ocrError) {
          // OCR falló pero la imagen está guardada
          setError(
            "La imagen de la INE se guardó correctamente, pero no se pudieron leer los datos automáticamente. Por favor completa los datos manualmente."
          );
        }

        // Forzar validación de los campos
        if (trigger) {
          await trigger([
            "nombre",
            "primerApellido",
            "segundoApellido",
            "direccion",
            "curp",
            "genero",
            "edad",
            "ineFile",
          ]);
        }

        // La imagen siempre se guarda, así que siempre retornamos true
        setScanSuccess(true);
        return true;
      } catch (err) {
        setError(
          "Error al procesar la imagen. Por favor intenta nuevamente."
        );
        setScanSuccess(false);
        return false;
      } finally {
        setLoadingOCR(false);
        setLoading(false);
      }
    },
    [setValue, trigger]
  );

  // Verificar si el formulario está completo para este paso
  const isFormComplete = !!values.ineFile;

  return {
    loadingOCR,
    error,
    handleScan,
    isFormComplete,
    scanSuccess,
  };
};

