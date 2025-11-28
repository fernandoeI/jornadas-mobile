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
import { EDO_CIVIL_CHOICES, ESTADOS_MEXICO } from "@/src/constants/tanda";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option, TriggerRef } from "@rn-primitives/select";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { View } from "react-native";

interface IDatosSolicitante {
  control: Control<EconomiaSocialFormData, any, any>;
  errors: FieldErrors<EconomiaSocialFormData>;
  values: EconomiaSocialFormData;
  setValue: (name: keyof EconomiaSocialFormData, value: any) => void;
  estadoCivilRef: React.RefObject<TriggerRef | null>;
  entidadNacimientoRef: React.RefObject<TriggerRef | null>;
  contentInsets: {
    top: number;
    bottom: number | undefined;
    left: number;
    right: number;
  };
  onCancel: () => void;
  onNext: () => void;
  showButtons?: boolean;
}

export const DatosSolicitante: React.FC<IDatosSolicitante> = ({
  control,
  errors,
  values,
  setValue,
  estadoCivilRef,
  entidadNacimientoRef,
  contentInsets,
  onCancel,
  onNext,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  return (
    <View className="gap-4">
      {/* Nombre */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre *
        </Text>
        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu nombre..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
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
          Primer Apellido *
        </Text>
        <Controller
          control={control}
          name="apellido1"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu primer apellido..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.apellido1 && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.apellido1.message}
          </Text>
        )}
      </View>

      {/* Segundo Apellido */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Segundo Apellido (opcional)
        </Text>
        <Controller
          control={control}
          name="apellido2"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa tu segundo apellido..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.apellido2 && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.apellido2.message}
          </Text>
        )}
      </View>

      {/* Fecha de Nacimiento */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Fecha de Nacimiento * (DD/MM/AAAA)
        </Text>
        <Controller
          control={control}
          name="fecha_nacimiento"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="DD/MM/AAAA"
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              maxLength={10}
            />
          )}
        />
        {errors.fecha_nacimiento && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.fecha_nacimiento.message}
          </Text>
        )}
      </View>

      {/* Entidad de Nacimiento */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Entidad de Nacimiento *
        </Text>
        <Controller
          control={control}
          name="entidad_nacimiento"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        ESTADOS_MEXICO.find((e) => e.value === value)?.label ||
                        value,
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
                ref={entidadNacimientoRef}
                onTouchStart={() => {
                  if (
                    entidadNacimientoRef.current &&
                    "open" in entidadNacimientoRef.current
                  ) {
                    (entidadNacimientoRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona la entidad de nacimiento" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {ESTADOS_MEXICO.map((estado) => (
                    <SelectItem
                      key={estado.value}
                      label={estado.label}
                      value={estado.value}
                    >
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.entidad_nacimiento && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.entidad_nacimiento.message}
          </Text>
        )}
      </View>

      {/* Estado Civil */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Estado Civil *
        </Text>
        <Controller
          control={control}
          name="estado_civil"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        EDO_CIVIL_CHOICES.find((e) => e.value === value)
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
                ref={estadoCivilRef}
                onTouchStart={() => {
                  if (
                    estadoCivilRef.current &&
                    "open" in estadoCivilRef.current
                  ) {
                    (estadoCivilRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el estado civil" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {EDO_CIVIL_CHOICES.map((estado) => (
                    <SelectItem
                      key={estado.value}
                      label={estado.label}
                      value={estado.value}
                    >
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.estado_civil && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.estado_civil.message}
          </Text>
        )}
      </View>

      {/* CURP */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          CURP * (18 caracteres)
        </Text>
        <Controller
          control={control}
          name="curp_txt"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="ABCD123456HIJKLM01"
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={(text) => {
                const upperText = text.toUpperCase();
                onChange(upperText);
              }}
              onBlur={onBlur}
              maxLength={18}
            />
          )}
        />
        {errors.curp_txt && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.curp_txt.message}
          </Text>
        )}
      </View>

      {/* Correo */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Correo Electrónico *
        </Text>
        <Controller
          control={control}
          name="correo"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="correo@ejemplo.com"
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.correo && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.correo.message}
          </Text>
        )}
      </View>

      {/* Botones de navegación */}
      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onCancel} className="flex-1">
            <Text>Cancelar</Text>
          </Button>
          <Button onPress={onNext} className="flex-1">
            <Text>Siguiente</Text>
          </Button>
        </View>
      )}
    </View>
  );
};
