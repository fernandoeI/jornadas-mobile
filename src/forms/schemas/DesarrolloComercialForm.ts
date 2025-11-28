// Tipos para el formulario de Desarrollo Comercial
export interface DesarrolloComercialFormData {
  // Sección I: Caracterización del entorno comercial
  negociosFormales: string;
  negociosInformales: string;
  negociosAmbulantes: string;
  tiposNegociosPredominantes: string[];
  otroTipoNegocio: string;
  operacionNegocios: string[];
  otraOperacion: string;

  // Sección II: Levantamiento con propietarios
  nombreNegocio: string;
  registradoHacienda: string;
  principalNecesidad: string[];
  otraNecesidad: string;
  interesProgramaApoyo: string;
  conoceCanalesInstitucionales: string;
  ventasAumentanJornada: string;
  productosMasVendidos: string;
  geolocalizacionNegocio: string;
  fotografiasNegocio: { uri: string; descripcion: string }[];

  // Sección III: Evaluación técnica del servidor público
  concentracionGirosAfines: string;
  potencialMercadoComunitario: string;
  requiereIntervencion: string[];
  otraIntervencion: string;
  observacionesMapaEconomico: string;
}
