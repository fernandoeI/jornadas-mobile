// Tipos para el formulario de Desarrollo Turístico
export interface DesarrolloTuristicoFormData {
  // Sección I: Detección ciudadana y comunitaria
  zonaTuristas: string;
  visitantesRecientes: string;
  organizacionesInteresadas: string;
  elementosInteres: string[];
  otrosElementos: string;

  // Sección II: Diagnóstico técnico del entorno
  infraestructuraAccesos: string[];
  infraestructuraServicios: string[];
  infraestructuraAlojamiento: string[];
  infraestructuraRecreativas: string[];
  infraestructuraComunitarios: string[];
  nivelOrganizacion: string;
  rutasSenderos: string;
  actoresInstitucionales: string;
  principalObstaculo: string;

  // Sección III: Variables técnicas específicas
  potencialDesarrollo: string;
  programaPiloto: string;
  vinculacionFinanciamiento: string;
  geolocalizacion: string;
  fotografias: { uri: string; descripcion: string }[];
  observacionesEstrategicas: string;
}

// Tipos para el formulario de login
export interface LoginFormData {
  email: string;
  password: string;
}

// Tipos para el formulario general de jornada
export interface JornadaFormData {
  // Datos de INE
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  direccion: string;
  genero: "masculino" | "femenino" | "no binaria";
  edad: string;
  curp: string;

  // Datos adicionales
  referidoGobernador: string;
  municipio: string;
  localidad: string;
  grupoSocial: string[];
  telefono: string;
  correo: string;
  negocio: string;
  sat: string;
  tipoNegocio: string;
  otroTipoNegocio: string;
  capacitacion: string[];
  ocupacion: string;
  comentarios: string;
  diagnostico: string[];
  areaRegistro: string;
}
