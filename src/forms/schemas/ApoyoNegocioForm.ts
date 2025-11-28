export interface ApoyoNegocioForm {
  // Sección I. Datos Generales del Negocio
  nombreNegocio: string;
  nombreRazonSocial: string;
  tipoPersona: string;
  tipoNegocio: string;
  otroTipoNegocio?: string;
  registradoSAT: string;
  tiempoOperacion: string;
  numeroTrabajadores: string;

  // Sección II. Necesidades y Apoyos
  principalNecesidad: string;
  otraNecesidad?: string;
  apoyoAnterior: string;
  nombreFideicomiso?: string;
  programa?: string;
  monto?: string;
  estatus?: string;
  otraDependencia?: string;
  nombrePrograma?: string;
  montoAsignado?: string;
  tipoApoyoSolicitado: string[];
  otroTipoApoyo?: string;
  montoEstimado: string;
  formalizacionNegocio: string;
}

export interface ApoyoNegocioFormSection1 {
  nombreNegocio: string;
  nombreRazonSocial: string;
  tipoPersona: string;
  tipoNegocio: string;
  otroTipoNegocio?: string;
  registradoSAT: string;
  tiempoOperacion: string;
  numeroTrabajadores: string;
}

export interface ApoyoNegocioFormSection2 {
  principalNecesidad: string;
  otraNecesidad?: string;
  apoyoAnterior: string;
  nombreFideicomiso?: string;
  programa?: string;
  monto?: string;
  estatus?: string;
  otraDependencia?: string;
  nombrePrograma?: string;
  montoAsignado?: string;
  tipoApoyoSolicitado: string[];
  otroTipoApoyo?: string;
  montoEstimado: string;
  formalizacionNegocio: string;
}
