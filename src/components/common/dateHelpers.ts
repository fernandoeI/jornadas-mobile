// Obtener el año mínimo basado en la edad máxima
export const getMinYear = (maxAge: number): number => {
  const today = new Date();
  return today.getFullYear() - maxAge;
};

// Obtener el año máximo basado en la edad mínima
export const getMaxYear = (minAge: number): number => {
  const today = new Date();
  return today.getFullYear() - minAge;
};

// Obtener todos los años disponibles (del más antiguo al más reciente)
export const getAvailableYears = (minAge: number, maxAge: number): number[] => {
  const minYear = getMinYear(maxAge);
  const maxYear = getMaxYear(minAge);
  const years: number[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push(year);
  }
  return years.reverse(); // Más recientes primero
};

// Obtener todos los meses
export const getMonths = (): {
  value: number;
  label: string;
  shortLabel: string;
}[] => {
  return [
    { value: 1, label: "Enero", shortLabel: "Ene" },
    { value: 2, label: "Febrero", shortLabel: "Feb" },
    { value: 3, label: "Marzo", shortLabel: "Mar" },
    { value: 4, label: "Abril", shortLabel: "Abr" },
    { value: 5, label: "Mayo", shortLabel: "May" },
    { value: 6, label: "Junio", shortLabel: "Jun" },
    { value: 7, label: "Julio", shortLabel: "Jul" },
    { value: 8, label: "Agosto", shortLabel: "Ago" },
    { value: 9, label: "Septiembre", shortLabel: "Sep" },
    { value: 10, label: "Octubre", shortLabel: "Oct" },
    { value: 11, label: "Noviembre", shortLabel: "Nov" },
    { value: 12, label: "Diciembre", shortLabel: "Dic" },
  ];
};

// Obtener los días disponibles para un mes y año específicos
export const getAvailableDays = (
  month: number | null,
  year: number | null
): number[] => {
  if (!month || !year) {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

// Validar si una fecha cumple con el rango de edad
export const isValidAgeRange = (
  day: number | null,
  month: number | null,
  year: number | null,
  minAge: number,
  maxAge: number
): boolean => {
  if (!day || !month || !year) return false;

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // Verificar que la fecha sea válida
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return false;
  }

  // Calcular edad
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  const dayDiff = today.getDate() - day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age >= minAge && age <= maxAge;
};

// Convertir día, mes, año a formato DD/MM/YYYY
export const formatDateFromParts = (
  day: number | null,
  month: number | null,
  year: number | null
): string => {
  if (!day || !month || !year) return "";

  const dayStr = String(day).padStart(2, "0");
  const monthStr = String(month).padStart(2, "0");
  const yearStr = String(year);

  return `${dayStr}/${monthStr}/${yearStr}`;
};

// Convertir formato DD/MM/YYYY a día, mes, año
export const parseDateToParts = (
  dateString: string
): {
  day: number | null;
  month: number | null;
  year: number | null;
} => {
  if (!dateString) {
    return { day: null, month: null, year: null };
  }

  const parts = dateString.split("/");
  if (parts.length !== 3) {
    return { day: null, month: null, year: null };
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { day: null, month: null, year: null };
  }

  return { day, month, year };
};

// Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD
export const convertDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) return "";

  const parts = dateString.split("/");
  if (parts.length !== 3) return "";

  const day = parts[0].padStart(2, "0");
  const month = parts[1].padStart(2, "0");
  const year = parts[2];

  return `${year}-${month}-${day}`;
};
