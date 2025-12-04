import { ESTADOS_MEXICO } from "@/src/constants/tanda";

// Mapeo de códigos de entidad del RENAPO a valores numéricos del formulario
export const CODIGOS_ENTIDAD_RENAPO: Record<string, string> = {
  AS: "1", // AGUASCALIENTES
  BC: "2", // BAJA CALIFORNIA
  BS: "3", // BAJA CALIFORNIA SUR
  CC: "4", // CHIHUAHUA
  CS: "5", // CHIAPAS
  CL: "6", // CAMPECHE
  CM: "7", // CIUDAD DE MEXICO
  DF: "7", // CIUDAD DE MEXICO (alternativo)
  CO: "8", // COAHUILA
  CT: "9", // COLIMA
  CH: "10", // CHIHUAHUA (alternativo)
  DG: "10", // DURANGO
  GT: "11", // GUERRERO
  GR: "11", // GUERRERO (alternativo)
  HG: "12", // GUANAJUATO
  JC: "13", // HIDALGO
  MC: "14", // JALISCO
  MN: "15", // MICHOACAN
  MS: "16", // ESTADO DE MEXICO
  NT: "17", // MORELOS
  NL: "19", // NUEVO LEON
  OC: "20", // OAXACA
  PL: "21", // PUEBLA
  QT: "22", // QUINTANA ROO
  QO: "23", // QUERETARO
  SI: "24", // SINALOA
  SL: "25", // SAN LUIS POTOSI
  SO: "26", // SONORA
  TC: "27", // TABASCO
  TL: "28", // TLAXCALA
  TS: "29", // TAMAULIPAS
  VZ: "30", // VERACRUZ
  YN: "31", // YUCATAN
  ZS: "32", // ZACATECAS
};

// Función para formatear mensajes de error en formato de oración
export const formatErrorMessage = (message: string): string => {
  if (!message) return message;

  // Convertir todo a minúsculas primero
  let formatted = message.toLowerCase().trim();

  // Capitalizar la primera letra
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // Capitalizar después de puntos, signos de interrogación y exclamación
  formatted = formatted.replace(
    /([.!?])\s*([a-z])/g,
    (match, punct, letter) => {
      return punct + " " + letter.toUpperCase();
    }
  );

  // Asegurar que palabras específicas como CURP, RENAPO, etc. mantengan mayúsculas
  formatted = formatted.replace(/\bcurp\b/gi, "CURP");
  formatted = formatted.replace(/\brenapo\b/gi, "RENAPO");

  return formatted;
};

// Función para convertir fecha de formato YYYY-MM-DD o ISO a DD/MM/AAAA
export const formatDateToDDMMYYYY = (dateString: string): string => {
  try {
    // Intentar parsear diferentes formatos
    let date: Date;
    if (dateString.includes("T")) {
      // Formato ISO
      date = new Date(dateString);
    } else if (dateString.includes("-")) {
      // Formato YYYY-MM-DD
      const [year, month, day] = dateString.split("-");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      return dateString; // Si no es un formato conocido, retornar tal cual
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return dateString;
  }
};

// Función para encontrar el valor del estado en ESTADOS_MEXICO por nombre, código numérico o código RENAPO
export const findEstadoValueByName = (codigo: string): string | undefined => {
  // Si es un número, buscar directamente por value
  if (!isNaN(Number(codigo))) {
    const estadoEncontrado = ESTADOS_MEXICO.find(
      (estado) => estado.value === codigo
    );
    if (estadoEncontrado) return estadoEncontrado.value;
  }

  // Buscar por código de entidad del RENAPO (ej: "TC" -> "27")
  const codigoUpper = codigo.toUpperCase();
  if (CODIGOS_ENTIDAD_RENAPO[codigoUpper]) {
    return CODIGOS_ENTIDAD_RENAPO[codigoUpper];
  }

  // Buscar por nombre (insensible a mayúsculas/minúsculas)
  const estadoEncontrado = ESTADOS_MEXICO.find(
    (estado) =>
      estado.label.toUpperCase() === codigo.toUpperCase() ||
      estado.label.toUpperCase().includes(codigo.toUpperCase()) ||
      codigo.toUpperCase().includes(estado.label.toUpperCase())
  );
  return estadoEncontrado?.value;
};

// Función helper para abrir select
export const openSelect = (
  ref: React.RefObject<any>,
  allowEdit: boolean
): void => {
  if (!allowEdit || !ref.current || !("open" in ref.current)) {
    return;
  }
  (ref.current as any).open();
};
