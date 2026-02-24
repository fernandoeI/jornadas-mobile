import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
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
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option } from "@rn-primitives/select";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { GENERO_OPTIONS, INE_FIELDS } from "./constants";
import { type IDatosINE } from "./types";
import { useDatosINE } from "./useDatosINE";

export const DatosINE: React.FC<IDatosINE> = ({
  control,
  errors,
  values,
  setValue,
  trigger,
  contentInsets,
  onBack,
  onNext,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  const { isFormComplete } = useDatosINE({ values, errors });

  return (
    <View className="gap-4">
      {/* Nombre */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.nombre}
        </Text>
        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu nombre..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                onChange(text);
                trigger("nombre");
              }}
              onBlur={onBlur}
            />
          )}
        />
        {errors.nombre && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.nombre.message}
          </Text>
        )}
      </View>

      {/* Primer Apellido */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.primerApellido}
        </Text>
        <Controller
          control={control}
          name="primerApellido"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu primer apellido..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                onChange(text);
                trigger("primerApellido");
              }}
              onBlur={onBlur}
            />
          )}
        />
        {errors.primerApellido && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.primerApellido.message}
          </Text>
        )}
      </View>

      {/* Segundo Apellido */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.segundoApellido}
        </Text>
        <Controller
          control={control}
          name="segundoApellido"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu segundo apellido..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                onChange(text);
                trigger("segundoApellido");
              }}
              onBlur={onBlur}
            />
          )}
        />
        {errors.segundoApellido && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.segundoApellido?.message}
          </Text>
        )}
      </View>

      {/* Dirección */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.direccion}
        </Text>
        <Controller
          control={control}
          name="direccion"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu dirección..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                onChange(text);
                trigger("direccion");
              }}
              onBlur={onBlur}
            />
          )}
        />
        {errors.direccion && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.direccion?.message}
          </Text>
        )}
      </View>

      {/* CURP */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.curp}
        </Text>
        <Controller
          control={control}
          name="curp"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="XEXX010101HNEXXXA4"
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                const upperText = text.toUpperCase();
                onChange(upperText);
                trigger("curp");
              }}
              onBlur={onBlur}
              maxLength={18}
            />
          )}
        />
        {errors.curp && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.curp.message}
          </Text>
        )}
      </View>

      {/* Género */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.genero}
        </Text>
        <Controller
          control={control}
          name="genero"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        GENERO_OPTIONS.find((g) => g.value === value)?.label ||
                        value,
                      value: value,
                    }
                  : undefined
              }
              onValueChange={(option: Option) => {
                if (option && option.value) {
                  onChange(option.value);
                  trigger("genero");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el género" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {GENERO_OPTIONS.map((genero) => (
                    <SelectItem
                      key={genero.value}
                      label={genero.label}
                      value={genero.value}
                    >
                      {genero.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.genero && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.genero.message}
          </Text>
        )}
      </View>

      {/* Edad */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          {INE_FIELDS.edad}
        </Text>
        <Controller
          control={control}
          name="edad"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu edad..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                onChange(text);
                trigger("edad");
              }}
              onBlur={onBlur}
              keyboardType="numeric"
            />
          )}
        />
        {errors.edad && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.edad?.message}
          </Text>
        )}
      </View>

      {/* Botones de navegación */}
      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onBack} className="flex-1">
            <Text>Regresar</Text>
          </Button>
          <Button
            onPress={onNext}
            disabled={!isFormComplete}
            className="flex-1"
          >
            <Text>Siguiente</Text>
          </Button>
        </View>
      )}
    </View>
  );
};

