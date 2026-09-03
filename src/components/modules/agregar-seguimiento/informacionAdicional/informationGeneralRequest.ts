import { useMemo } from "react";

interface UserRequestInformation {
    values: any,
    errors: any,
}


export const useInformationGeneralRequest = ({
    values,
    errors
}: UserRequestInformation) => {

    const isFormComplete = useMemo(() => {
        const requiredFields = {
            referidoGobernador: !!values.referidoGobernador?.trim(),
            municipio: !!values.municipio?.trim(),
            localidad: !!values.localidad?.trim(),
            grupoSocial: Array.isArray(values.grupoSocial) && values.grupoSocial.length > 0,
            telefono: /^\d{10}$/.test(values.telefono ?? ""),
            correo: !!values.correo?.trim(),
            negocio: !!values.negocio?.trim(),
            sat: !!values.sat?.trim(),
            diagnostico: Array.isArray(values.diagnostico) && values.diagnostico.length > 0,
            areaRegistro: !!values.areaRegistro?.trim(),
        };

        const allFieldsComplete = Object.values(requiredFields).every(
            (isComplete) => isComplete
        );

        const hasNoErrors = Object.keys(requiredFields).every(
            (field) => !errors[field]
        );

        return allFieldsComplete && hasNoErrors;

    }, [values, errors]);

    return {
        isFormComplete
    };
}
