import { MenuItem } from "@/src/components/modules/home";

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    title: "Agregar Seguimiento",
    description: "Registra nueva información de seguimiento",
    route: "/agregar-seguimiento",
    color: "#981646",
  },
  {
    title: "Tandas para la mujer",
    description: "Registro para la segunda etapa",
    route: "/economia-social",
    color: "#981646",
  },
  {
    title: "Promoción Turística",
    description: "Registra información de atractivos turísticos",
    route: "/promocion-turistica",
    color: "#981646",
  },
  {
    title: "Cocineras Tradicionales",
    description: "Registro de cocineras tradicionales",
    route: "/cocineras-tradicionales",
    color: "#981646",
  },
];

/**
 * Obtiene los items del menú filtrados según los labels del usuario
 * @param userLabels - Labels del usuario desde Appwrite
 * @returns Array de items del menú filtrados
 */
export const getHomeMenuItems = (userLabels?: string[]): MenuItem[] => {
  return ALL_MENU_ITEMS.filter((item) => {
    // Si es "Tandas para la mujer", solo mostrarlo si el usuario tiene el label "economiasocial"
    if (item.route === "/economia-social") {
      return userLabels?.some(
        (label) => label.toLowerCase() === "economiasocial"
      );
    }
    // Si es "Promoción Turística", solo mostrarlo si el usuario tiene el label "promocionturistica"
    if (item.route === "/promocion-turistica") {
      return userLabels?.some(
        (label) => label.toLowerCase() === "promocionturistica"
      );
    }
    // Si es "Cocineras Tradicionales", solo mostrarlo si el usuario tiene el label "feriasyfestivales"
    if (item.route === "/cocineras-tradicionales") {
      return userLabels?.some(
        (label) => label.toLowerCase() === "feriasyfestivales"
      );
    }
    // Para otros items, mostrarlos siempre
    return true;
  });
};

// Exportar también la constante para compatibilidad (pero se recomienda usar getHomeMenuItems)
export const HOME_MENU_ITEMS = ALL_MENU_ITEMS;
