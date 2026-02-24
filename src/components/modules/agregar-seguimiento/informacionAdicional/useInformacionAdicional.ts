import { AgregarSeguimientoFormData } from "@/src/forms/schemas/AgregarSeguimientoForm";
import { useMemo } from "react";
import type { FieldErrors } from "react-hook-form";

interface UseInformacionAdicionalProps {
  values: AgregarSeguimientoFormData;
  errors: FieldErrors<AgregarSeguimientoFormData>;
}

export const useInformacionAdicional = ({
  values,
  errors,
}: UseInformacionAdicionalProps) => {
  // Verificar si el formulario está completo para este paso
  const isFormComplete = useMemo(() => {
    const requiredFields = {
      referidoGobernador: !!values.referidoGobernador,
      municipio: !!values.municipio?.trim(),
      localidad: !!values.localidad?.trim(),
      grupoSocial: Array.isArray(values.grupoSocial) && values.grupoSocial.length > 0,
      telefono: !!values.telefono?.trim() && values.telefono.length === 10,
      correo: !!values.correo?.trim() && values.correo.includes("@"),
      negocio: !!values.negocio,
      sat: !!values.sat,
      diagnostico: Array.isArray(values.diagnostico) && values.diagnostico.length > 0,
      areaRegistro: !!values.areaRegistro?.trim(),
    };

    const allFieldsComplete = Object.values(requiredFields).every(
      (isComplete) => isComplete
    );

    const hasNoErrors =
      !errors.referidoGobernador &&
      !errors.municipio &&
      !errors.localidad &&
      !errors.grupoSocial &&
      !errors.telefono &&
      !errors.correo &&
      !errors.negocio &&
      !errors.sat &&
      !errors.diagnostico &&
      !errors.areaRegistro;

    return allFieldsComplete && hasNoErrors;
  }, [
    values.referidoGobernador,
    values.municipio,
    values.localidad,
    values.grupoSocial,
    values.telefono,
    values.correo,
    values.negocio,
    values.sat,
    values.diagnostico,
    values.areaRegistro,
    errors.referidoGobernador,
    errors.municipio,
    errors.localidad,
    errors.grupoSocial,
    errors.telefono,
    errors.correo,
    errors.negocio,
    errors.sat,
    errors.diagnostico,
    errors.areaRegistro,
  ]);

  return {
    isFormComplete,
  };
};

