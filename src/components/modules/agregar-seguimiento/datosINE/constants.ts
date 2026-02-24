// Constantes para el componente de datos INE
export const INE_FIELDS = {
  nombre: "Nombre",
  primerApellido: "Primer Apellido",
  segundoApellido: "Segundo Apellido (opcional)",
  direccion: "Dirección",
  curp: "CURP",
  genero: "Género",
  edad: "Edad",
} as const;

export const GENERO_OPTIONS = [
  { label: "Masculino", value: "masculino" },
  { label: "Femenino", value: "femenino" },
  { label: "No binaria", value: "no binaria" },
] as const;

