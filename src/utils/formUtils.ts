import * as Yup from "yup";

// Esquemas de validación comunes
export const emailValidation = Yup.string()
  .email("Correo electrónico inválido")
  .required("El correo es requerido");

export const passwordValidation = Yup.string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .required("La contraseña es requerida");

export const requiredFieldValidation = Yup.string().required(
  "Este campo es requerido"
);

// Función para capitalizar texto
export const toSentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Función para formatear fecha
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Función para validar coordenadas GPS
export const validateGPS = (gps: string): boolean => {
  const gpsRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
  return gpsRegex.test(gps);
};

// Función para generar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Función para validar teléfono mexicano
export const validateMexicanPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+52|52)?[1-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Función para validar CURP
export const validateCURP = (curp: string): boolean => {
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  return curpRegex.test(curp.toUpperCase());
};
