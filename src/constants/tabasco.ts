export const TABASCO_MUNICIPALITIES = [
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

export const municipalityFolioCode = (municipality: string) =>
  municipality
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();

export const resolveTabascoMunicipality = (value: string) => {
  const normalized = municipalityFolioCode(value)
    .replace(/^MUNICIPIODE/, "")
    .replace(/^MUNICIPIO/, "");
  return (
    TABASCO_MUNICIPALITIES.find((municipality) =>
      normalized.includes(municipalityFolioCode(municipality)),
    ) || ""
  );
};

export const TABASCO_CENTER: [number, number] = [17.8409, -92.6189];
