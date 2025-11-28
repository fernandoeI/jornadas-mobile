import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { THEME } from "@/src/components/ui/lib/theme";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Text } from "@/src/components/ui/text";
import {
  GRUPO_INDIGENA_CHOICES,
  LENGUA_INDIGENA_CHOICES,
  TIPOS_VIOLENCIA_CHOICES,
  YESNO_CHOICES,
} from "@/src/constants/tanda";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option, TriggerRef } from "@rn-primitives/select";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Platform, View } from "react-native";

interface IInformacionSocial {
  control: Control<EconomiaSocialFormData, any, any>;
  errors: FieldErrors<EconomiaSocialFormData>;
  values: EconomiaSocialFormData;
  setValue: (name: keyof EconomiaSocialFormData, value: any) => void;
  grupoIndigenaRef: React.RefObject<TriggerRef | null>;
  lenguaIndigenaRef: React.RefObject<TriggerRef | null>;
  contentInsets: {
    top: number;
    bottom: number | undefined;
    left: number;
    right: number;
  };
  onBack: () => void;
  onNext: () => void;
  showButtons?: boolean;
}

export const InformacionSocial: React.FC<IInformacionSocial> = ({
  control,
  errors,
  values,
  setValue,
  grupoIndigenaRef,
  lenguaIndigenaRef,
  contentInsets,
  onBack,
  onNext,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  return (
    <View className="gap-4">
      {/* Fuente de Ingreso */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene fuente de ingreso? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.fuente_ingreso === opcion.value ? "default" : "outline"
              }
              onPress={() => setValue("fuente_ingreso", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.fuente_ingreso && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.fuente_ingreso.message}
          </Text>
        )}
      </View>

      {/* RFC */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene RFC? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.rfc_boolean === opcion.value ? "default" : "outline"
              }
              onPress={() => setValue("rfc_boolean", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.rfc_boolean && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.rfc_boolean.message}
          </Text>
        )}
      </View>

      {/* Servicio de Electricidad */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene servicio de electricidad? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.servicio_electricidad === opcion.value
                  ? "default"
                  : "outline"
              }
              onPress={() => setValue("servicio_electricidad", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.servicio_electricidad && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.servicio_electricidad.message}
          </Text>
        )}
      </View>

      {/* Servicio de Agua */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene servicio de agua? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.servicio_agua === opcion.value ? "default" : "outline"
              }
              onPress={() => setValue("servicio_agua", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.servicio_agua && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.servicio_agua.message}
          </Text>
        )}
      </View>

      {/* Servicio de Drenaje */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene servicio de drenaje? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.servicio_drenaje === opcion.value ? "default" : "outline"
              }
              onPress={() => setValue("servicio_drenaje", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.servicio_drenaje && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.servicio_drenaje.message}
          </Text>
        )}
      </View>

      {/* Piso */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene piso? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={values.piso === opcion.value ? "default" : "outline"}
              onPress={() => setValue("piso", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.piso && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.piso.message}
          </Text>
        )}
      </View>

      {/* Grupo Indígena */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Grupo Indígena (opcional)
        </Text>
        <Controller
          control={control}
          name="grupo_indigena"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        GRUPO_INDIGENA_CHOICES.find((g) => g.value === value)
                          ?.label || value,
                      value: value,
                    }
                  : undefined
              }
              onValueChange={(option: Option) => {
                if (option && option.value) {
                  onChange(option.value);
                }
              }}
            >
              <SelectTrigger
                ref={grupoIndigenaRef}
                onTouchStart={() => {
                  if (
                    grupoIndigenaRef.current &&
                    "open" in grupoIndigenaRef.current
                  ) {
                    (grupoIndigenaRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el grupo indígena" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {GRUPO_INDIGENA_CHOICES.map((grupo) => (
                    <SelectItem
                      key={grupo.value}
                      label={grupo.label}
                      value={grupo.value}
                    >
                      {grupo.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.grupo_indigena && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.grupo_indigena.message}
          </Text>
        )}
      </View>

      {/* Lengua Indígena */}
      {values.grupo_indigena && values.grupo_indigena !== "ninguna" && (
        <View className="gap-2">
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿Habla lengua indígena? (opcional)
          </Text>
          <Controller
            control={control}
            name="lengua_indigena"
            render={({ field: { onChange, value } }) => (
              <Select
                value={
                  value
                    ? {
                        label:
                          LENGUA_INDIGENA_CHOICES.find((l) => l.value === value)
                            ?.label || value,
                        value: value,
                      }
                    : undefined
                }
                onValueChange={(option: Option) => {
                  if (option && option.value) {
                    onChange(option.value);
                  }
                }}
              >
                <SelectTrigger
                  ref={lenguaIndigenaRef}
                  onTouchStart={() => {
                    if (
                      lenguaIndigenaRef.current &&
                      "open" in lenguaIndigenaRef.current
                    ) {
                      (lenguaIndigenaRef.current as any).open();
                    }
                  }}
                >
                  <SelectValue placeholder="Selecciona si habla lengua indígena" />
                </SelectTrigger>
                <SelectContent insets={contentInsets}>
                  <SelectGroup>
                    {LENGUA_INDIGENA_CHOICES.map((lengua) => (
                      <SelectItem
                        key={lengua.value}
                        label={lengua.label}
                        value={lengua.value}
                      >
                        {lengua.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.lengua_indigena && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.lengua_indigena.message}
            </Text>
          )}

          {values.lengua_indigena === "si" && (
            <View className="gap-2 mt-4">
              <Text
                className="text-base font-semibold"
                style={{ color: foregroundColor }}
              >
                Especifica las lenguas (opcional)
              </Text>
              <Controller
                control={control}
                name="lenguas_txt"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Ej: Chol, Tzeltal, Maya..."
                    placeholderTextColor={mutedForegroundColor}
                    value={value || ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.lenguas_txt && (
                <Text
                  className="text-xs mt-1"
                  style={{ color: destructiveColor }}
                >
                  {errors.lenguas_txt.message}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Violencia */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Ha experimentado algún tipo de violencia? (opcional)
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.violencia_bool === opcion.value ? "default" : "outline"
              }
              onPress={() => setValue("violencia_bool", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.violencia_bool && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.violencia_bool.message}
          </Text>
        )}

        {values.violencia_bool === true && (
          <View className="gap-2 mt-4">
            <Text
              className="text-base font-semibold"
              style={{ color: foregroundColor }}
            >
              Tipo de violencia (marcar todos los que apliquen)
            </Text>
            <View className="gap-3">
              {TIPOS_VIOLENCIA_CHOICES.map((tipo) => {
                const checked = Array.isArray(values.violencia)
                  ? values.violencia.includes(tipo.value)
                  : false;
                return (
                  <View
                    key={tipo.value}
                    className="flex-row items-center gap-3"
                  >
                    <Checkbox
                      id={`violencia-${tipo.value}`}
                      checked={checked}
                      onCheckedChange={(isChecked) => {
                        const currentValues = Array.isArray(values.violencia)
                          ? values.violencia
                          : [];
                        if (isChecked) {
                          setValue("violencia", [...currentValues, tipo.value]);
                        } else {
                          setValue(
                            "violencia",
                            currentValues.filter((v) => v !== tipo.value)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`violencia-${tipo.value}`}
                      onPress={Platform.select({
                        native: () => {
                          const currentValues = Array.isArray(values.violencia)
                            ? values.violencia
                            : [];
                          if (checked) {
                            setValue(
                              "violencia",
                              currentValues.filter((v) => v !== tipo.value)
                            );
                          } else {
                            setValue("violencia", [
                              ...currentValues,
                              tipo.value,
                            ]);
                          }
                        },
                      })}
                    >
                      <Text style={{ color: foregroundColor }}>
                        {tipo.label}
                      </Text>
                    </Label>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Botones de navegación */}
      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onBack} className="flex-1">
            <Text>Regresar</Text>
          </Button>
          <Button onPress={onNext} className="flex-1">
            <Text>Siguiente</Text>
          </Button>
        </View>
      )}
    </View>
  );
};
