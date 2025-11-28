// Tipos para el formulario de Ferias y Festivales
export interface FeriasFestivalesFormData {
  // Sección I: Levantamiento comunitario y cultural
  fiestasFestivales: string;
  nombreEvento: string;
  fechaRealizacion: string;
  origen: string;
  otroOrigen: string;
  quienOrganiza: string;
  otroQuienOrganiza: string;
  numeroAsistentes: string;
  apoyoInstitucional: string;
  actividadesRealizadas: string[];
  otrasActividades: string;
  fortalecerFestividad: string;

  // Sección II: Diagnóstico técnico (servidor público)
  impactoEconomico: string;
  espaciosPublicos: string;
  accesibilidadVial: string;
  infraestructuraEscenica: string;
  potencialCalendarioEstatal: string;
  vinculacionPatrocinadores: string;
  geolocalizacion: string;
  fotografias: { uri: string; descripcion: string }[];
  observacionesActores: string;
}
