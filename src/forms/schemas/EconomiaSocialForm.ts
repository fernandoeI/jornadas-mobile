import * as Yup from "yup";

// Tipos para el formulario de Economía Social basado en Tanda2Request
export interface EconomiaSocialFormData {
  // Datos del solicitante
  nombre: string;
  apellido1: string;
  apellido2?: string;
  fecha_nacimiento: string;
  entidad_nacimiento: string;
  estado_civil: string;
  curp_txt: string;
  correo: string;

  // Dirección
  municipio: number | null;
  localidad: number | null;
  asentammiento_tipo: string;
  asentammiento_nombre: string;
  vialidad_tipo: string;
  vialidad_nombre: string;
  num_celular1: string;
  num_celular2?: string;
  codigo_postal: string;
  numero_ext: number | null;
  numero_int?: number | null;
  comprobante_domicilio_choices?: string;

  // Información social
  fuente_ingreso: boolean;
  rfc_boolean: boolean;
  servicio_electricidad: boolean;
  servicio_agua: boolean;
  servicio_drenaje: boolean;
  piso: boolean;
  grupo_indigena?: string;
  lengua_indigena?: string;
  lenguas_txt?: string;
  violencia_bool?: boolean;
  violencia?: any;

  // Datos del emprendimiento
  monto: number | null;
  negocio_ubicacion: string;
  negocio_antiguedad?: string;
  negocio_ganancia?: string;
  negocio_giro?: string;
  beneficio_tanda: string;
  destino_recurso?: string;
  negocio_participacion: boolean;
  negocio_cooperativa: boolean;
  negocio_marca: boolean;
  negocio_marca_registrada: boolean;
  negocio_descripcion?: string;

  // Otros
  comentarios?: string;
  capturista?: string;
  folio?: string;
}

// Schema de validación Yup
export const economiaSocialValidationSchema = Yup.object().shape({
  // Datos del solicitante
  nombre: Yup.string().required("El nombre es requerido"),
  apellido1: Yup.string().required("El primer apellido es requerido"),
  apellido2: Yup.string().optional(),
  fecha_nacimiento: Yup.string().required(
    "La fecha de nacimiento es requerida"
  ),
  entidad_nacimiento: Yup.string().required(
    "La entidad de nacimiento es requerida"
  ),
  estado_civil: Yup.string().required("El estado civil es requerido"),
  curp_txt: Yup.string()
    .required("La CURP es requerida")
    .length(18, "La CURP debe tener 18 caracteres"),
  correo: Yup.string()
    .email("El correo electrónico no es válido")
    .required("El correo electrónico es requerido"),

  // Dirección
  municipio: Yup.number().nullable().required("El municipio es requerido"),
  localidad: Yup.number().nullable().required("La localidad es requerida"),
  asentammiento_tipo: Yup.string().required(
    "El tipo de asentamiento es requerido"
  ),
  asentammiento_nombre: Yup.string().required(
    "El nombre del asentamiento es requerido"
  ),
  vialidad_tipo: Yup.string().required("El tipo de vialidad es requerido"),
  vialidad_nombre: Yup.string().required(
    "El nombre de la vialidad es requerido"
  ),
  num_celular1: Yup.string()
    .required("El número de celular es requerido")
    .min(10, "El número de celular debe tener al menos 10 dígitos"),
  num_celular2: Yup.string().optional(),
  codigo_postal: Yup.string()
    .required("El código postal es requerido")
    .length(5, "El código postal debe tener 5 dígitos"),
  numero_ext: Yup.number()
    .nullable()
    .required("El número exterior es requerido"),
  numero_int: Yup.number().nullable().optional(),
  comprobante_domicilio_choices: Yup.string().optional(),

  // Información social
  fuente_ingreso: Yup.boolean().required("Este campo es requerido"),
  rfc_boolean: Yup.boolean().required("Este campo es requerido"),
  servicio_electricidad: Yup.boolean().required("Este campo es requerido"),
  servicio_agua: Yup.boolean().required("Este campo es requerido"),
  servicio_drenaje: Yup.boolean().required("Este campo es requerido"),
  piso: Yup.boolean().required("Este campo es requerido"),
  grupo_indigena: Yup.string().optional(),
  lengua_indigena: Yup.string().optional(),
  lenguas_txt: Yup.string().optional(),
  violencia_bool: Yup.boolean().optional(),
  violencia: Yup.mixed().optional(),

  // Datos del emprendimiento
  monto: Yup.number().nullable().required("El monto es requerido"),
  negocio_ubicacion: Yup.string().required(
    "La ubicación del negocio es requerida"
  ),
  negocio_antiguedad: Yup.string().optional(),
  negocio_ganancia: Yup.string().optional(),
  negocio_giro: Yup.string().optional(),
  beneficio_tanda: Yup.string().required(
    "El beneficio de la tanda es requerido"
  ),
  destino_recurso: Yup.string().optional(),
  negocio_participacion: Yup.boolean().required("Este campo es requerido"),
  negocio_cooperativa: Yup.boolean().required("Este campo es requerido"),
  negocio_marca: Yup.boolean().required("Este campo es requerido"),
  negocio_marca_registrada: Yup.boolean().required("Este campo es requerido"),
  negocio_descripcion: Yup.string().optional(),

  // Otros
  comentarios: Yup.string().optional(),
  capturista: Yup.string().optional(),
  folio: Yup.string().optional(),
});
