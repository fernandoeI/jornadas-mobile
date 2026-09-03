import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import type { ServiceFormField } from "@/src/types/catalog";
import { TABASCO_MUNICIPALITIES } from "@/src/constants/tabasco";
import { Pressable, View } from "react-native";

type Props = {
  fields: ServiceFormField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  title?: string;
  description?: string;
};

const selectedValues = (value?: string) =>
  value
    ? value
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const isMunicipalityField = (field: ServiceFormField) => {
  const identity = `${field.key} ${field.label}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return identity.includes("municipio");
};

export function DynamicGlobalForm({
  fields,
  values,
  onChange,
  title = "Datos generales",
  description = "Esta información se solicita para todos los trámites.",
}: Props) {
  const setValue = (key: string, value: string) =>
    onChange({ ...values, [key]: value });

  return (
    <View className="gap-5 rounded-2xl border border-border bg-card p-5">
      <View>
        <Text className="text-xl font-bold">{title}</Text>
        <Text className="mt-1 text-muted-foreground">{description}</Text>
      </View>
      {fields.map((field) => {
        const value = values[field.key] || "";
        const options =
          field.options?.length || !isMunicipalityField(field)
            ? field.options || []
            : [...TABASCO_MUNICIPALITIES];
        const selected = selectedValues(value);
        const isChoice =
          field.type === "select" || field.type === "multiselect";

        return (
          <View key={field.key} className="gap-2">
            <Text className="font-medium">
              {field.label}
              {field.required === false ? (
                <Text className="text-muted-foreground"> (opcional)</Text>
              ) : (
                " *"
              )}
            </Text>

            {isChoice ? (
              <View className="flex-row flex-wrap gap-2">
                {options.map((option) => {
                  const active = selected.includes(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        if (field.type === "select") {
                          setValue(field.key, option);
                          return;
                        }
                        const next = active
                          ? selected.filter((item) => item !== option)
                          : [...selected, option];
                        setValue(field.key, next.join("|"));
                      }}
                      className={`rounded-xl border px-4 py-3 ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background"
                      }`}
                    >
                      <Text
                        className={active ? "font-semibold text-primary" : ""}
                      >
                        {field.type === "multiselect"
                          ? `${active ? "✓ " : ""}${option}`
                          : option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : field.type === "boolean" ? (
              <View className="flex-row gap-2">
                {["Sí", "No"].map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setValue(field.key, option)}
                    className={`min-w-24 rounded-xl border px-4 py-3 ${
                      value === option
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <Text
                      className={`text-center ${value === option ? "font-semibold text-primary" : ""}`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Input
                value={value}
                onChangeText={(next) => setValue(field.key, next)}
                placeholder={
                  field.placeholder ||
                  (field.type === "date" ? "AAAA-MM-DD" : undefined)
                }
                keyboardType={
                  field.type === "email"
                    ? "email-address"
                    : field.type === "tel" || field.type === "number"
                      ? "numeric"
                      : "default"
                }
                autoCapitalize={field.type === "email" ? "none" : "sentences"}
                multiline={field.type === "textarea"}
                className={field.type === "textarea" ? "min-h-28" : ""}
              />
            )}
            {field.placeholder && isChoice ? (
              <Text className="text-xs text-muted-foreground">
                {field.placeholder}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export const isDynamicFormComplete = (
  fields: ServiceFormField[],
  values: Record<string, string>,
) =>
  fields
    .filter((field) => field.required !== false)
    .every((field) => Boolean(values[field.key]?.trim()));
