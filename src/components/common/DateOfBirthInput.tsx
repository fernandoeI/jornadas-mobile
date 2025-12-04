import { Input } from "@/src/components/ui/input";
import { THEME } from "@/src/components/ui/lib/theme";
import { cn } from "@/src/components/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option, TriggerRef } from "@rn-primitives/select";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import {
  formatDateFromParts,
  getAvailableDays,
  getAvailableYears,
  getMonths,
  parseDateToParts,
} from "./dateHelpers";

interface DateOfBirthInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  minAge: number;
  maxAge: number;
  contentInsets?: {
    top: number;
    bottom: number | undefined;
    left: number;
    right: number;
  };
}

// Función helper para abrir select
const openSelect = (ref: React.RefObject<any>, allowEdit: boolean): void => {
  if (!allowEdit || !ref.current || !("open" in ref.current)) {
    return;
  }
  (ref.current as any).open();
};

export const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  minAge,
  maxAge,
  contentInsets,
}) => {
  const { colorScheme } = useTheme();
  const isWeb = Platform.OS === "web";

  const { day, month, year } = parseDateToParts(value);
  const [localDay, setLocalDay] = useState<number | null>(day);
  const [localMonth, setLocalMonth] = useState<number | null>(month);
  const [localYear, setLocalYear] = useState<number | null>(year);

  const dayRef = useRef<TriggerRef | null>(null);
  const monthRef = useRef<TriggerRef | null>(null);
  const yearRef = useRef<TriggerRef | null>(null);

  const years = useMemo(
    () => getAvailableYears(minAge, maxAge),
    [minAge, maxAge]
  );
  const months = getMonths();
  const days = useMemo(
    () => getAvailableDays(localMonth, localYear),
    [localMonth, localYear]
  );

  // Actualizar valores locales cuando cambia el valor externo
  useEffect(() => {
    const parsed = parseDateToParts(value);
    setLocalDay(parsed.day);
    setLocalMonth(parsed.month);
    setLocalYear(parsed.year);
  }, [value]);

  const handleDayChange = (option: Option) => {
    const newDay = option?.value ? Number(option.value) : null;
    setLocalDay(newDay);
    const formatted = formatDateFromParts(newDay, localMonth, localYear);
    onChange(formatted);
  };

  const handleMonthChange = (option: Option) => {
    const newMonth = option?.value ? Number(option.value) : null;
    setLocalMonth(newMonth);

    // Si cambia el mes, ajustar el día si es necesario
    let adjustedDay = localDay;
    if (newMonth && localYear && localDay) {
      const maxDays = getAvailableDays(newMonth, localYear).length;
      if (localDay > maxDays) {
        adjustedDay = maxDays;
        setLocalDay(adjustedDay);
      }
    }

    const formatted = formatDateFromParts(
      adjustedDay || localDay,
      newMonth,
      localYear
    );
    onChange(formatted);
  };

  const handleYearChange = (option: Option) => {
    const newYear = option?.value ? Number(option.value) : null;
    setLocalYear(newYear);

    // Si cambia el año, ajustar el día si es necesario
    let adjustedDay = localDay;
    if (localMonth && newYear && localDay) {
      const maxDays = getAvailableDays(localMonth, newYear).length;
      if (localDay > maxDays) {
        adjustedDay = maxDays;
        setLocalDay(adjustedDay);
      }
    }

    const formatted = formatDateFromParts(
      adjustedDay || localDay,
      localMonth,
      newYear
    );
    onChange(formatted);
  };

  // Para web, usar input type="date" nativo
  if (isWeb) {
    // Convertir DD/MM/YYYY a YYYY-MM-DD para input type="date"
    const convertToInputFormat = (dateStr: string): string => {
      if (!dateStr) return "";
      const parts = dateStr.split("/");
      if (parts.length !== 3) return "";
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    };

    // Convertir YYYY-MM-DD a DD/MM/YYYY
    const convertFromInputFormat = (dateStr: string): string => {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      if (parts.length !== 3) return "";
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const minDate = `${years[years.length - 1]}-01-01`;
    const maxDate = `${years[0]}-12-31`;
    const inputValue = convertToInputFormat(value);

    // Para web, usar input HTML nativo con type="date"
    return (
      <View>
        {Platform.OS === "web" ? (
          React.createElement("input", {
            type: "date",
            value: inputValue,
            onChange: (e: any) => {
              const dateValue = e.target.value;
              if (dateValue) {
                onChange(convertFromInputFormat(dateValue));
              }
            },
            onBlur: onBlur,
            disabled: disabled,
            min: minDate,
            max: maxDate,
            className: cn(
              "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
              disabled &&
                "opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
              "placeholder:text-muted-foreground outline-none transition-[color,box-shadow] md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              error &&
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            ),
          })
        ) : (
          <Input
            value={inputValue}
            onChangeText={(text) => {
              if (text) {
                onChange(convertFromInputFormat(text));
              }
            }}
            onBlur={onBlur}
            editable={!disabled}
            placeholder="DD/MM/AAAA"
          />
        )}
        {error && (
          <Text
            className="text-xs mt-1"
            style={{ color: THEME[colorScheme].destructive }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }

  // Para móvil, usar tres selects
  return (
    <View>
      <View className="flex-row gap-2">
        {/* Día */}
        <View className="flex-1">
          <Select
            value={
              localDay
                ? {
                    label: String(localDay),
                    value: String(localDay),
                  }
                : undefined
            }
            onValueChange={handleDayChange}
            disabled={disabled}
          >
            <SelectTrigger
              ref={dayRef}
              onTouchStart={() => openSelect(dayRef, !disabled)}
            >
              <SelectValue placeholder="Día" />
            </SelectTrigger>
            <SelectContent insets={contentInsets}>
              <SelectGroup>
                {days.map((d) => (
                  <SelectItem key={d} label={String(d)} value={String(d)}>
                    {String(d)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        {/* Mes */}
        <View className="flex-1">
          <Select
            value={
              localMonth
                ? {
                    label:
                      months.find((m) => m.value === localMonth)?.shortLabel ||
                      "",
                    value: String(localMonth),
                  }
                : undefined
            }
            onValueChange={handleMonthChange}
            disabled={disabled}
          >
            <SelectTrigger
              ref={monthRef}
              onTouchStart={() => openSelect(monthRef, !disabled)}
              className="min-w-0 flex-1"
            >
              <SelectValue
                placeholder="Mes"
                className="truncate flex-1 min-w-0"
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets}>
              <SelectGroup>
                {months.map((m) => (
                  <SelectItem
                    key={m.value}
                    label={m.label}
                    value={String(m.value)}
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        {/* Año */}
        <View className="flex-1">
          <Select
            value={
              localYear
                ? {
                    label: String(localYear),
                    value: String(localYear),
                  }
                : undefined
            }
            onValueChange={handleYearChange}
            disabled={disabled}
          >
            <SelectTrigger
              ref={yearRef}
              onTouchStart={() => openSelect(yearRef, !disabled)}
            >
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent insets={contentInsets}>
              <SelectGroup>
                {years.map((y) => (
                  <SelectItem key={y} label={String(y)} value={String(y)}>
                    {String(y)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
      </View>
      {error && (
        <Text
          className="text-xs mt-1"
          style={{ color: THEME[colorScheme].destructive }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
