export interface FondosFinanciamientoForm {
  // Datos personales
  nombreSolicitante: string;
  primerApellido: string;
  segundoApellido?: string;
  curp: string;
  direccion: string;
  municipio: string;
  localidad: string;
  telefono: string;
  correo?: string;

  // Información del proyecto
  tipoProyecto: string;
  descripcionProyecto?: string;
  montoSolicitado: number;
  fuenteFinanciamiento: string;
  programa: string;
  convocatoria: string;
  fechaLimite?: string;
  estadoSolicitud: string;
  observaciones?: string;
  documentosAdjuntos?: string[];
}

export interface FondosFinanciamientoFormStep1 {
  nombreSolicitante: string;
  primerApellido: string;
  segundoApellido?: string;
  curp: string;
  direccion: string;
  municipio: string;
  localidad: string;
  telefono: string;
  correo?: string;
}

export interface FondosFinanciamientoFormStep2 {
  tipoProyecto: string;
  descripcionProyecto?: string;
  montoSolicitado: number;
  fuenteFinanciamiento: string;
  programa: string;
  convocatoria: string;
  fechaLimite?: string;
}

export interface FondosFinanciamientoFormStep3 {
  estadoSolicitud: string;
  observaciones?: string;
  documentosAdjuntos?: string[];
}
