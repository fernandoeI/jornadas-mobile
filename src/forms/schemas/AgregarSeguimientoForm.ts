import * as Yup from "yup";

// Tipos para el formulario de Agregar Seguimiento
export interface AgregarSeguimientoFormData {
  // Datos de la INE - Todos los campos son obligatorios
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  direccion: string;
  genero: "masculino" | "femenino" | "no binaria";
  edad: string;
  curp: string;
  ineFile?: File | { uri: string; name: string; type: string };

  // Datos del formulario completo
  referidoGobernador: string;
  municipio: string;
  localidad: string;
  grupoSocial: string[];
  telefono: string;
  correo: string;
  negocio: string;
  sat: string;
  tipoNegocio?: string;
  otroTipoNegocio?: string;
  capacitacion: string[];
  ocupacion?: string;
  comentarios?: string;
  diagnostico: string[];
  areaRegistro: string;
}

// Schema de validación Yup
export const agregarSeguimientoValidationSchema = Yup.object().shape({
  // Datos de la INE - Todos los campos son obligatorios
  nombre: Yup.string().required("El nombre es requerido"),
  primerApellido: Yup.string().required("El primer apellido es requerido"),
  segundoApellido: Yup.string().required("El segundo apellido es requerido"),
  direccion: Yup.string().required("La dirección es requerida"),
  genero: Yup.string()
    .oneOf(["masculino", "femenino", "no binaria"], "Género inválido")
    .required("El género es requerido"),
  edad: Yup.string().required("La edad es requerida"),
  curp: Yup.string()
    .required("La CURP es requerida")
    .length(18, "La CURP debe tener 18 caracteres"),
  ineFile: Yup.mixed().required("El archivo de la INE es requerido"),

  // Datos del formulario completo
  referidoGobernador: Yup.string()
    .oneOf(["sí", "no"], "Debes seleccionar una opción")
    .required("Este campo es requerido"),
  municipio: Yup.string().required("El municipio es requerido"),
  localidad: Yup.string().required("La localidad es requerida"),
  grupoSocial: Yup.array()
    .of(Yup.string())
    .min(1, "Debes seleccionar al menos un grupo social")
    .required("El grupo social es requerido"),
  telefono: Yup.string()
    .required("El teléfono es requerido")
    .length(10, "El teléfono debe tener exactamente 10 dígitos")
    .matches(/^[0-9]+$/, "El teléfono solo debe contener números"),
  correo: Yup.string()
    .email("El correo electrónico no es válido")
    .required("El correo electrónico es requerido"),
  negocio: Yup.string()
    .oneOf(["sí", "no"], "Debes seleccionar una opción")
    .required("Este campo es requerido"),
  sat: Yup.string()
    .oneOf(["sí", "no"], "Debes seleccionar una opción")
    .required("Este campo es requerido"),
  tipoNegocio: Yup.string().optional(),
  otroTipoNegocio: Yup.string().optional(),
  capacitacion: Yup.array().of(Yup.string()).optional(),
  ocupacion: Yup.string().optional(),
  comentarios: Yup.string().optional(),
  diagnostico: Yup.array()
    .of(Yup.string())
    .min(1, "Debes seleccionar al menos un diagnóstico")
    .required("El diagnóstico es requerido"),
  areaRegistro: Yup.string().required("El área de registro es requerida"),
});
