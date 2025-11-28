// Constantes para el formulario de Tanda (Economía Social)
// Basado en tanda.model.ts

export const EDO_CIVIL_CHOICES = [
  { value: "casada", label: "CASADA" },
  { value: "soltera", label: "SOLTERA" },
  { value: "union", label: "UNION LIBRE" },
  { value: "viuda", label: "VIUDA" },
];

export const UBICACION_CHOICES = [
  { value: "domicilio", label: "En mi domicilio" },
  { value: "local_propio", label: "En un local propio" },
  { value: "local_rentado", label: "En un local rentado o prestado" },
  { value: "ambulante", label: "Negocio ambulante" },
  { value: "virtual", label: "Negocio virtual" },
];

export const ANTIGUEDAD_CHOICES = [
  { value: "menos_3_meses", label: "Menos de 3 meses" },
  { value: "3_meses_a_6_meses", label: "De 3 meses a 6 meses" },
  { value: "6_meses_a_1_anio", label: "De 6 meses a 1 año" },
  { value: "1_a_2_anios", label: "De 1 a 2 años" },
  { value: "mas_2_anios", label: "Más de 2 años" },
];

export const GANANCIA_CHOICES = [
  { value: "menos_2000", label: "Menos de 2000" },
  { value: "2100_a_4000", label: "De 2100 a 4000" },
  { value: "4100_a_6000", label: "De 4100 a 6000" },
  { value: "6100_a_8000", label: "De 6100 a 8000" },
  { value: "8100_a_10000", label: "De 8100 a 10000" },
  { value: "10000_a_15000", label: "De 10000 a 15000" },
  { value: "15100_a_20000", label: "De 15100 a 20000" },
  { value: "20100_a_25000", label: "De 20100 a 25000" },
  { value: "25100_a_30000", label: "De 25100 a 30000" },
  { value: "mas_de_30000", label: "Más de 30000" },
];

export const GIRO_CHOICES = [
  { value: "comercio", label: "COMERCIO" },
  { value: "servicio", label: "SERVICIOS" },
  { value: "industria", label: "INDUSTRIA" },
];

export const BENEFICIO_CHOICES = [
  { value: "incremento_ventas", label: "Incrementar mis ventas" },
  { value: "mas_clientes", label: "Tener más clientes" },
  { value: "mejorar_producto", label: "Mejorar la calidad de productos" },
];

export const DESTINO_CHOICES = [
  { value: "materia_prima", label: "COMPRA DE MATERIA PRIMA/INSUMOS" },
  { value: "equipo", label: "COMPRA DE EQUIPAMIENTO" },
  { value: "infraestructura", label: "MEJORAMIENTO O RENOVACION" },
];

export const VIALIDAD_CHOICES = [
  { value: "AMPLIACION", label: "AMPLIACION" },
  { value: "ANDADOR", label: "ANDADOR" },
  { value: "AVENIDA", label: "AVENIDA" },
  { value: "BOULEVARD", label: "BOULEVARD" },
  { value: "BRECHA", label: "BRECHA" },
  { value: "CALLE", label: "CALLE" },
  { value: "CALLEJON", label: "CALLEJON" },
  { value: "CALZADA", label: "CALZADA" },
  { value: "CAMINO", label: "CAMINO" },
  { value: "CARRETERA", label: "CARRETERA" },
  { value: "CERRADA", label: "CERRADA" },
  { value: "CIRCUITO", label: "CIRCUITO" },
  { value: "CIRCUNVALACION", label: "CIRCUNVALACION" },
  { value: "CONTINUACION", label: "CONTINUACION" },
  { value: "CORREDOR", label: "CORREDOR" },
  { value: "DIAGONAL", label: "DIAGONAL" },
  { value: "EJE VIAL", label: "EJE VIAL" },
  { value: "NINGUNO", label: "NINGUNO" },
  { value: "PASAJE", label: "PASAJE" },
  { value: "PEATONAL", label: "PEATONAL" },
  { value: "PERIFERICO", label: "PERIFERICO" },
  { value: "PRIVADA", label: "PRIVADA" },
  { value: "PROLONGACION", label: "PROLONGACION" },
  { value: "RETORNO", label: "RETORNO" },
  { value: "TERRACERIA", label: "TERRACERIA" },
  { value: "VEREDA", label: "VEREDA" },
  { value: "VIADUCTO", label: "VIADUCTO" },
];

export const ASENTAMIENTO_CHOICES = [
  { value: "COLONIA", label: "COLONIA" },
  { value: "EJIDO", label: "EJIDO" },
  { value: "FRACCIONAMIENTO", label: "FRACCIONAMIENTO" },
  { value: "RANCHERIA", label: "RANCHERIA" },
  { value: "AEROPUERTO", label: "AEROPUERTO" },
  { value: "AMPLIACION", label: "AMPLIACION" },
  { value: "BARRIO", label: "BARRIO" },
  { value: "CANTON", label: "CANTON" },
  { value: "CIUDAD", label: "CIUDAD" },
  { value: "CIUDAD INDUSTRIAL", label: "CIUDAD INDUSTRIAL" },
  { value: "CONDOMINIO", label: "CONDOMINIO" },
  { value: "CONJUNTO HABITACIONAL", label: "CONJUNTO HABITACIONAL" },
  { value: "CORREDOR INDUSTRIAL", label: "CORREDOR INDUSTRIAL" },
  { value: "COTO", label: "COTO" },
  { value: "CUARTEL", label: "CUARTEL" },
  { value: "EXHACIENDA", label: "EXHACIENDA" },
  { value: "FRACCION", label: "FRACCION" },
  { value: "GRANJA", label: "GRANJA" },
  { value: "HACIENDA", label: "HACIENDA" },
  { value: "INGENIO", label: "INGENIO" },
  { value: "MANZANA", label: "MANZANA" },
  { value: "PARAJE", label: "PARAJE" },
  { value: "PARQUE INDUSTRIAL", label: "PARQUE INDUSTRIAL" },
  { value: "PRIVADA", label: "PRIVADA" },
  { value: "PROLONGACION", label: "PROLONGACION" },
  { value: "PUEBLO", label: "PUEBLO" },
  { value: "PUERTO", label: "PUERTO" },
  { value: "RANCHO", label: "RANCHO" },
  { value: "REGION", label: "REGION" },
  { value: "RESIDENCIAL", label: "RESIDENCIAL" },
  { value: "RINCONADA", label: "RINCONADA" },
  { value: "SECCION", label: "SECCION" },
  { value: "SECTOR", label: "SECTOR" },
  { value: "SUPERMANZANA", label: "SUPERMANZANA" },
  { value: "UNIDAD", label: "UNIDAD" },
  { value: "UNIDAD HABITACIONAL", label: "UNIDAD HABITACIONAL" },
  { value: "VILLA", label: "VILLA" },
  { value: "ZONA FEDERAL", label: "ZONA FEDERAL" },
  { value: "ZONA INDUSTRIAL", label: "ZONA INDUSTRIAL" },
  { value: "ZONA MILITAR", label: "ZONA MILITAR" },
  { value: "ZONA NAVAL", label: "ZONA NAVAL" },
  { value: "NINGUNO", label: "NINGUNO" },
];

export const COMPROBANTE_CHOICES = [
  { value: "RESIDENCIA", label: "CONSTANCIA DE RESIDENCIA" },
  { value: "LUZ", label: "RECIBO DE LUZ" },
  { value: "TELEFONO", label: "RECIBO TELEFONICO" },
  { value: "AGUA", label: "RECIBO DE AGUA" },
];

export const ESTADOS_MEXICO = [
  { value: "1", label: "AGUASCALIENTES" },
  { value: "2", label: "BAJA CALIFORNIA" },
  { value: "3", label: "BAJA CALIFORNIA SUR" },
  { value: "4", label: "CHIHUAHUA" },
  { value: "5", label: "CHIAPAS" },
  { value: "6", label: "CAMPECHE" },
  { value: "7", label: "CIUDAD DE MEXICO" },
  { value: "8", label: "COAHUILA" },
  { value: "9", label: "COLIMA" },
  { value: "10", label: "DURANGO" },
  { value: "11", label: "GUERRERO" },
  { value: "12", label: "GUANAJUATO" },
  { value: "13", label: "HIDALGO" },
  { value: "14", label: "JALISCO" },
  { value: "15", label: "MICHOACAN" },
  { value: "16", label: "ESTADO DE MEXICO" },
  { value: "17", label: "MORELOS" },
  { value: "18", label: "NAYARIT" },
  { value: "19", label: "NUEVO LEON" },
  { value: "20", label: "OAXACA" },
  { value: "21", label: "PUEBLA" },
  { value: "22", label: "QUINTANA ROO" },
  { value: "23", label: "QUERETARO" },
  { value: "24", label: "SINALOA" },
  { value: "25", label: "SAN LUIS POTOSI" },
  { value: "26", label: "SONORA" },
  { value: "27", label: "TABASCO" },
  { value: "28", label: "TLAXCALA" },
  { value: "29", label: "TAMAULIPAS" },
  { value: "30", label: "VERACRUZ" },
  { value: "31", label: "YUCATAN" },
  { value: "32", label: "ZACATECAS" },
];

// Municipios de Tabasco (fijos)
export const MUNICIPIOS_TABASCO = [
  { id: 1, nombre: "Balancán" },
  { id: 2, nombre: "Cárdenas" },
  { id: 3, nombre: "Centla" },
  { id: 4, nombre: "Centro" },
  { id: 5, nombre: "Comalcalco" },
  { id: 6, nombre: "Cunduacán" },
  { id: 7, nombre: "Emiliano Zapata" },
  { id: 8, nombre: "Huimanguillo" },
  { id: 9, nombre: "Jalapa" },
  { id: 10, nombre: "Jalpa De Méndez" },
  { id: 11, nombre: "Jonuta" },
  { id: 12, nombre: "Macuspana" },
  { id: 13, nombre: "Nacajuca" },
  { id: 14, nombre: "Paraíso" },
  { id: 15, nombre: "Tacotalpa" },
  { id: 16, nombre: "Teapa" },
  { id: 17, nombre: "Tenosique" },
];

export const YESNO_CHOICES = [
  { value: false, label: "No" },
  { value: true, label: "Sí" },
];

export const GRUPO_INDIGENA_CHOICES = [
  { value: "ninguna", label: "Ninguna" },
  { value: "indigena", label: "Indígena" },
  { value: "afromexicana", label: "Afromexicana" },
];

export const LENGUA_INDIGENA_CHOICES = [
  { value: "no", label: "NO" },
  { value: "si", label: "SI" },
];

export const TIPOS_VIOLENCIA_CHOICES = [
  { value: "fisica", label: "Física" },
  { value: "familiar", label: "Familiar" },
  { value: "economica", label: "Económica o Patrimonial" },
  { value: "emocional", label: "Emocional o Psicológica" },
  { value: "social", label: "Social" },
  { value: "sexual", label: "Sexual" },
];
