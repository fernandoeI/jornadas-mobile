import { AgregarSeguimientoFormData } from "@/src/forms/schemas/AgregarSeguimientoForm";
import { useMemo } from "react";
import type { FieldErrors } from "react-hook-form";

interface UseDatosINEProps {
  values: AgregarSeguimientoFormData;
  errors: FieldErrors<AgregarSeguimientoFormData>;
}

export const useDatosINE = ({ values, errors }: UseDatosINEProps) => {
  // Verificar si el formulario está completo para este paso
  // Todos los campos son obligatorios
  const isFormComplete = useMemo(() => {
    const requiredFields = {
      nombre: !!values.nombre?.trim(),
      primerApellido: !!values.primerApellido?.trim(),
      segundoApellido: !!values.segundoApellido?.trim(),
      direccion: !!values.direccion?.trim(),
      curp: !!values.curp?.trim() && values.curp.length === 18,
      genero: !!values.genero,
      edad: !!values.edad?.trim(),
    };

    const allFieldsComplete = Object.values(requiredFields).every(
      (isComplete) => isComplete
    );

    const hasNoErrors =
      !errors.nombre &&
      !errors.primerApellido &&
      !errors.segundoApellido &&
      !errors.direccion &&
      !errors.curp &&
      !errors.genero &&
      !errors.edad;

    return allFieldsComplete && hasNoErrors;
  }, [
    values.nombre,
    values.primerApellido,
    values.segundoApellido,
    values.direccion,
    values.curp,
    values.genero,
    values.edad,
    errors.nombre,
    errors.primerApellido,
    errors.segundoApellido,
    errors.direccion,
    errors.curp,
    errors.genero,
    errors.edad,
  ]);

  return {
    isFormComplete,
  };
};

