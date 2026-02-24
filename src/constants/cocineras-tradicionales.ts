// Lista de todos los municipios con su ruta turística (la ruta se autocompleta al elegir municipio)
export interface MunicipioConRuta {
  value: string;
  label: string;
  rutaValue: string;
  rutaLabel: string;
}

const MUNICIPIOS_CON_RUTA_RAW: MunicipioConRuta[] = [
  {
    value: "centro",
    label: "Centro",
    rutaValue: "villahermosa",
    rutaLabel: "Villahermosa",
  },
  {
    value: "nacajuca",
    label: "Nacajuca",
    rutaValue: "biji-yokotan",
    rutaLabel: "Biji Yokotan",
  },
  {
    value: "jalpa-de-mendez",
    label: "Jalpa de Méndez",
    rutaValue: "biji-yokotan",
    rutaLabel: "Biji Yokotan",
  },
  {
    value: "tacotalpa",
    label: "Tacotalpa",
    rutaValue: "aventura-en-la-sierra",
    rutaLabel: "Aventura en la Sierra",
  },
  {
    value: "teapa",
    label: "Teapa",
    rutaValue: "aventura-en-la-sierra",
    rutaLabel: "Aventura en la Sierra",
  },
  {
    value: "macuspana",
    label: "Macuspana",
    rutaValue: "aventura-en-la-sierra",
    rutaLabel: "Aventura en la Sierra",
  },
  {
    value: "jalapa",
    label: "Jalapa",
    rutaValue: "aventura-en-la-sierra",
    rutaLabel: "Aventura en la Sierra",
  },
  {
    value: "huimanguillo",
    label: "Huimanguillo",
    rutaValue: "olmeca-zoque",
    rutaLabel: "Olmeca-Zoque",
  },
  {
    value: "cardenas",
    label: "Cárdenas",
    rutaValue: "olmeca-zoque",
    rutaLabel: "Olmeca-Zoque",
  },
  {
    value: "jonuta",
    label: "Jonuta",
    rutaValue: "rios-mayas",
    rutaLabel: "Ríos Mayas",
  },
  {
    value: "balancan",
    label: "Balancán",
    rutaValue: "rios-mayas",
    rutaLabel: "Ríos Mayas",
  },
  {
    value: "tenosique",
    label: "Tenosique",
    rutaValue: "rios-mayas",
    rutaLabel: "Ríos Mayas",
  },
  {
    value: "emiliano-zapata",
    label: "Emiliano Zapata",
    rutaValue: "rios-mayas",
    rutaLabel: "Ríos Mayas",
  },
  {
    value: "cunduacan",
    label: "Cunduacán",
    rutaValue: "del-cacao-al-chocolate",
    rutaLabel: "Del Cacao al Chocolate",
  },
  {
    value: "comalcalco",
    label: "Comalcalco",
    rutaValue: "del-cacao-al-chocolate",
    rutaLabel: "Del Cacao al Chocolate",
  },
  {
    value: "paraiso",
    label: "Paraíso",
    rutaValue: "del-cacao-al-chocolate",
    rutaLabel: "Del Cacao al Chocolate",
  },
  {
    value: "centla",
    label: "Centla",
    rutaValue: "pantanos",
    rutaLabel: "Pantanos",
  },
];

export const MUNICIPIOS_CON_RUTA = [...MUNICIPIOS_CON_RUTA_RAW].sort((a, b) =>
  a.label.localeCompare(b.label, "es")
);

export const OPCIONES_SI_NO = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];
