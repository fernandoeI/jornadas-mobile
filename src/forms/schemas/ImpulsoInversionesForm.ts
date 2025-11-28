// Tipos para el formulario de Impulso y Promoción de Inversiones
export interface ImpulsoInversionesFormData {
  // Sección I: Detección de inversión local
  existeEmpresaAltoImpacto: string;
  nombreRazonSocial: string;
  giro: string;
  otroGiro: string;
  nivelEmpleo: string;

  // Sección II: Diagnóstico de entorno productivo
  necesidadesRegulatorias: string[];
  otrasNecesidades: string;
  oportunidadesInversion: string[];
  otrasOportunidades: string;
  barrerasNormativas: string;
  prediosPotencialInversion: string;
  geolocalizacionInversion: string;
  fotografiasSitio: { uri: string; descripcion: string }[];

  // Sección III: Evaluación técnica del servidor público
  oportunidadVinculacionInstitucional: string[];
  otrasVinculaciones: string;
  viableAgendarSeguimiento: string;
  requiereIntervencionJuridica: string;
  observacionesCompetitividad: string;
}
