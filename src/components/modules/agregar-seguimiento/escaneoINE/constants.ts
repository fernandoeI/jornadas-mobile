// Constantes para el componente de escaneo INE
export const SCAN_INSTRUCTIONS = {
  title: "Escanea la parte frontal de tu INE",
  description:
    "Asegúrate de que la imagen sea clara y legible. Coloca la INE sobre una superficie plana y bien iluminada, y escanea la parte frontal.",
} as const;

export const ERROR_MESSAGES = {
  NO_IMAGE: "No se pudo leer la INE. Asegúrate de que la imagen sea clara y legible.",
  PROCESSING_ERROR:
    "Error durante el procesamiento de la imagen. Verifica que la imagen sea clara.",
  NO_FILE: "El archivo INE es requerido",
} as const;

