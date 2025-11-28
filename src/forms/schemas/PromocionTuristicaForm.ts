import * as Yup from "yup";

// Tipos para el formulario de Promoción y Difusión Turística
export interface PromocionTuristicaFormData {
  // Sección I: Identificación de atractivos turísticos
  nombreAtractivo: string;
  tipoAtractivo: string[];
  otroTipoAtractivo?: string;
  quienPromueve: string;
  otroQuienPromueve?: string;
  nivelConocimiento: string;
  tieneSenaletica: string;
  enPlataformaDigital: string;
  serviciosExistentes: string[];
  otrosServicios?: string;

  // Sección II: Observación técnica (servidor público)
  condicionesAcceso: string;
  estadoConservacion: string;
  potencialPromocional: string;
  observacionesTecnicas: string;
  geolocalizacion: string;
  fotografias: { uri: string; descripcion: string }[];
  observacionesAdicionales: string;
}

// Schema de validación Yup
export const promocionTuristicaValidationSchema = Yup.object().shape({
  nombreAtractivo: Yup.string().required("Este campo es requerido"),
  tipoAtractivo: Yup.array()
    .min(1, "Selecciona al menos un tipo")
    .required("Este campo es requerido"),
  otroTipoAtractivo: Yup.string().when("tipoAtractivo", {
    is: (val: string[]) => val?.includes("otro"),
    then: (schema) => schema.required("Especifica el otro tipo"),
    otherwise: (schema) => schema.optional(),
  }),
  quienPromueve: Yup.string().required("Este campo es requerido"),
  otroQuienPromueve: Yup.string().when("quienPromueve", {
    is: "otro",
    then: (schema) => schema.required("Especifica quién promueve"),
    otherwise: (schema) => schema.optional(),
  }),
  nivelConocimiento: Yup.string().required("Este campo es requerido"),
  tieneSenaletica: Yup.string().required("Este campo es requerido"),
  enPlataformaDigital: Yup.string().required("Este campo es requerido"),
  serviciosExistentes: Yup.array()
    .min(1, "Selecciona al menos un servicio")
    .required("Este campo es requerido"),
  otrosServicios: Yup.string().when("serviciosExistentes", {
    is: (val: string[]) => val?.includes("otros"),
    then: (schema) => schema.required("Especifica otros servicios"),
    otherwise: (schema) => schema.optional(),
  }),
  condicionesAcceso: Yup.string().required("Este campo es requerido"),
  estadoConservacion: Yup.string().required("Este campo es requerido"),
  potencialPromocional: Yup.string().required("Este campo es requerido"),
  observacionesTecnicas: Yup.string().required("Este campo es requerido"),
  geolocalizacion: Yup.string().required("Este campo es requerido"),
  fotografias: Yup.array()
    .of(
      Yup.object().shape({
        uri: Yup.string().required("La fotografía debe tener una URI"),
        descripcion: Yup.string().optional(),
      })
    )
    .max(3, "Puedes agregar hasta 3 fotografías"),
  observacionesAdicionales: Yup.string().required("Este campo es requerido"),
});

// Opciones constantes para los campos del formulario
export const TIPOS_ATRACTIVO = [
  "natural",
  "cultural",
  "historico",
  "religioso",
  "gastronomico",
  "artesanal",
  "recreativo",
  "otro",
] as const;

export const QUIEN_PROMUEVE_OPCIONES = [
  "comunidad",
  "municipio",
  "nadie",
  "otro",
] as const;

export const NIVELES_CONOCIMIENTO = ["alto", "medio", "bajo"] as const;

export const OPCIONES_SENALETICA = ["si", "no", "parcial-deteriorada"] as const;

export const OPCIONES_PLATAFORMA = ["si", "no", "no-sabe"] as const;

export const SERVICIOS_EXISTENTES = [
  "restaurante",
  "guia-local",
  "transporte",
  "hospedaje",
  "sanitarios",
  "otros",
] as const;

export const CONDICIONES_ACCESO = [
  "pavimentado",
  "terraceria-transitable",
  "terraceria-dificil",
  "solo-pie-lancha-caballo",
] as const;

export const ESTADOS_CONSERVACION = [
  "bueno",
  "regular",
  "deteriorado",
] as const;

export const POTENCIALES_PROMOCIONAL = [
  "muy-alto",
  "alto",
  "medio",
  "bajo",
] as const;
