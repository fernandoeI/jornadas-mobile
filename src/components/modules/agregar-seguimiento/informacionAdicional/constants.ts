import React from "react";

// Constantes para el componente de información adicional
export const municipios = [
  "Balancán",
  "Cárdenas",
  "Centla",
  "Centro",
  "Comalcalco",
  "Cunduacán",
  "Emiliano Zapata",
  "Huimanguillo",
  "Jalapa",
  "Jalpa de Méndez",
  "Jonuta",
  "Macuspana",
  "Nacajuca",
  "Paraíso",
  "Tacotalpa",
  "Teapa",
  "Tenosique",
] as const;

export const gruposSociales = [
  "indígenas",
  "discapacidad",
  "afrodescendiente",
  "adulto mayor",
  "NNA-Niño, niña, adolescente",
  "jóvenes hasta 29 años",
  "ninguno",
] as const;

export const tiposNegocio = [
  "artesanías/manualidades",
  "preparación de alimentos",
  "servicios y productos turísticos",
  "servicios",
  "cárnicos",
  "cuidado personal /accesorios",
  "productos para el hogar",
  "abarrotes y misceláneas",
  "papelería",
  "productor /sembrando vida",
  "chocolatero",
  "empresa esencia tabasco",
  "otro",
] as const;

export const capacitaciones = [
  "ahorro y crecimiento",
  "registro de marca",
  "emprendimiento",
  "empoderamiento de la mujer",
  "industria ferroviaria",
  "industria energética",
  "industria tecnológica",
  "participación en ferias y festivales",
  "desarrollo de productos turísticos",
] as const;

export const diagnosticos = [
  "registro de marca",
  "capacitaciones y asesoramiento",
  "capacitación especializada",
  "potencial turístico",
  "agroindustria",
  "expositor festivales",
  "microcrédito",
  "cocinera tradicional",
  "ventanilla digital tabasco",
] as const;

export const areasRegistro = [
  "economía social",
  "desarrollo comercial",
  "impulso y promoción de inversiones",
  "ferias y festivales",
  "desarrollo turístico",
  "planeación, evaluación turística y económica",
  "comisión estatal de mejora regulatoria",
  "unidad de información y tecnología",
] as const;

// Utilidad para capitalizar solo la primera letra
export const toSentenceCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Función helper para abrir un Select de forma segura
export const openSelect = (
  ref: React.RefObject<{ open?: () => void } | null>
): void => {
  if (ref.current && "open" in ref.current && typeof ref.current.open === "function") {
    ref.current.open();
  }
};

