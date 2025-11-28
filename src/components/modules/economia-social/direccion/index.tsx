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
import {
  ASENTAMIENTO_CHOICES,
  COMPROBANTE_CHOICES,
  MUNICIPIOS_TABASCO,
  VIALIDAD_CHOICES,
} from "@/src/constants/tanda";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option, TriggerRef } from "@rn-primitives/select";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { View } from "react-native";

interface IDireccion {
  control: Control<EconomiaSocialFormData, any, any>;
  errors: FieldErrors<EconomiaSocialFormData>;
  values: EconomiaSocialFormData;
  setValue: (name: keyof EconomiaSocialFormData, value: any) => void;
  municipioRef: React.RefObject<TriggerRef | null>;
  localidadRef: React.RefObject<TriggerRef | null>;
  asentamientoTipoRef: React.RefObject<TriggerRef | null>;
  vialidadTipoRef: React.RefObject<TriggerRef | null>;
  comprobanteDomicilioRef: React.RefObject<TriggerRef | null>;
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

export const Direccion: React.FC<IDireccion> = ({
  control,
  errors,
  values,
  setValue,
  municipioRef,
  localidadRef,
  asentamientoTipoRef,
  vialidadTipoRef,
  comprobanteDomicilioRef,
  contentInsets,
  onBack,
  onNext,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  // TODO: Implementar carga de localidades basado en municipio seleccionado
  const localidades: { id: number; nombre: string }[] = [];

  return (
    <View className="gap-4">
      {/* Municipio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Municipio *
        </Text>
        <Controller
          control={control}
          name="municipio"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        MUNICIPIOS_TABASCO.find((m) => m.id === value)
                          ?.nombre || "",
                      value: String(value),
                    }
                  : undefined
              }
              onValueChange={(option: Option) => {
                if (option && option.value) {
                  onChange(Number(option.value));
                  // Reset localidad cuando cambia municipio
                  setValue("localidad", null);
                }
              }}
            >
              <SelectTrigger
                ref={municipioRef}
                onTouchStart={() => {
                  if (municipioRef.current && "open" in municipioRef.current) {
                    (municipioRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el municipio" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {MUNICIPIOS_TABASCO.map((municipio) => (
                    <SelectItem
                      key={municipio.id}
                      label={municipio.nombre}
                      value={String(municipio.id)}
                    >
                      {municipio.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.municipio && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.municipio.message}
          </Text>
        )}
      </View>

      {/* Localidad */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Localidad *
        </Text>
        <Controller
          control={control}
          name="localidad"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        localidades.find((l) => l.id === value)?.nombre || "",
                      value: String(value),
                    }
                  : undefined
              }
              onValueChange={(option: Option) => {
                if (option && option.value) {
                  onChange(Number(option.value));
                }
              }}
              disabled={!values.municipio}
            >
              <SelectTrigger
                ref={localidadRef}
                onTouchStart={() => {
                  if (localidadRef.current && "open" in localidadRef.current) {
                    (localidadRef.current as any).open();
                  }
                }}
              >
                <SelectValue
                  placeholder={
                    values.municipio
                      ? "Selecciona la localidad"
                      : "Primero selecciona un municipio"
                  }
                />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {localidades.length > 0 ? (
                    localidades.map((localidad) => (
                      <SelectItem
                        key={localidad.id}
                        label={localidad.nombre}
                        value={String(localidad.id)}
                      >
                        {localidad.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem
                      label="No hay localidades disponibles"
                      value="none"
                      disabled
                    >
                      No hay localidades disponibles
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.localidad && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.localidad.message}
          </Text>
        )}
      </View>

      {/* Tipo de Asentamiento */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Tipo de Asentamiento *
        </Text>
        <Controller
          control={control}
          name="asentammiento_tipo"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        ASENTAMIENTO_CHOICES.find((a) => a.value === value)
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
                ref={asentamientoTipoRef}
                onTouchStart={() => {
                  if (
                    asentamientoTipoRef.current &&
                    "open" in asentamientoTipoRef.current
                  ) {
                    (asentamientoTipoRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el tipo de asentamiento" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {ASENTAMIENTO_CHOICES.map((asentamiento) => (
                    <SelectItem
                      key={asentamiento.value}
                      label={asentamiento.label}
                      value={asentamiento.value}
                    >
                      {asentamiento.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.asentammiento_tipo && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.asentammiento_tipo.message}
          </Text>
        )}
      </View>

      {/* Nombre del Asentamiento */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre del Asentamiento *
        </Text>
        <Controller
          control={control}
          name="asentammiento_nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ej: Centro, Colonia Nueva..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.asentammiento_nombre && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.asentammiento_nombre.message}
          </Text>
        )}
      </View>

      {/* Tipo de Vialidad */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Tipo de Vialidad *
        </Text>
        <Controller
          control={control}
          name="vialidad_tipo"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        VIALIDAD_CHOICES.find((v) => v.value === value)
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
                ref={vialidadTipoRef}
                onTouchStart={() => {
                  if (
                    vialidadTipoRef.current &&
                    "open" in vialidadTipoRef.current
                  ) {
                    (vialidadTipoRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el tipo de vialidad" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {VIALIDAD_CHOICES.map((vialidad) => (
                    <SelectItem
                      key={vialidad.value}
                      label={vialidad.label}
                      value={vialidad.value}
                    >
                      {vialidad.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.vialidad_tipo && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.vialidad_tipo.message}
          </Text>
        )}
      </View>

      {/* Nombre de la Vialidad */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre de la Vialidad *
        </Text>
        <Controller
          control={control}
          name="vialidad_nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ej: Juárez, Hidalgo..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.vialidad_nombre && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.vialidad_nombre.message}
          </Text>
        )}
      </View>

      {/* Número Exterior */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número Exterior *
        </Text>
        <Controller
          control={control}
          name="numero_ext"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="123"
              placeholderTextColor={mutedForegroundColor}
              value={value ? String(value) : ""}
              onChangeText={(text) => {
                const num = text ? Number(text) : null;
                onChange(num);
              }}
              onBlur={onBlur}
              keyboardType="numeric"
            />
          )}
        />
        {errors.numero_ext && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.numero_ext.message}
          </Text>
        )}
      </View>

      {/* Número Interior */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número Interior (opcional)
        </Text>
        <Controller
          control={control}
          name="numero_int"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="A, B, 1, 2..."
              placeholderTextColor={mutedForegroundColor}
              value={value ? String(value) : ""}
              onChangeText={(text) => {
                const num = text ? Number(text) : null;
                onChange(num);
              }}
              onBlur={onBlur}
              keyboardType="numeric"
            />
          )}
        />
        {errors.numero_int && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.numero_int.message}
          </Text>
        )}
      </View>

      {/* Código Postal */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Código Postal * (5 dígitos)
        </Text>
        <Controller
          control={control}
          name="codigo_postal"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="86000"
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={(text) => {
                const numbersOnly = text.replace(/[^0-9]/g, "");
                onChange(numbersOnly);
              }}
              onBlur={onBlur}
              keyboardType="numeric"
              maxLength={5}
            />
          )}
        />
        {errors.codigo_postal && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.codigo_postal.message}
          </Text>
        )}
      </View>

      {/* Número de Celular 1 */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número de Celular 1 *
        </Text>
        <Controller
          control={control}
          name="num_celular1"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="9931234567"
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={(text) => {
                const numbersOnly = text.replace(/[^0-9]/g, "");
                onChange(numbersOnly);
              }}
              onBlur={onBlur}
              keyboardType="phone-pad"
              maxLength={10}
            />
          )}
        />
        {errors.num_celular1 && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.num_celular1.message}
          </Text>
        )}
      </View>

      {/* Número de Celular 2 */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número de Celular 2 (opcional)
        </Text>
        <Controller
          control={control}
          name="num_celular2"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="9931234567"
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={(text) => {
                const numbersOnly = text.replace(/[^0-9]/g, "");
                onChange(numbersOnly || undefined);
              }}
              onBlur={onBlur}
              keyboardType="phone-pad"
              maxLength={10}
            />
          )}
        />
        {errors.num_celular2 && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.num_celular2.message}
          </Text>
        )}
      </View>

      {/* Comprobante de Domicilio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Comprobante de Domicilio (opcional)
        </Text>
        <Controller
          control={control}
          name="comprobante_domicilio_choices"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        COMPROBANTE_CHOICES.find((c) => c.value === value)
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
                ref={comprobanteDomicilioRef}
                onTouchStart={() => {
                  if (
                    comprobanteDomicilioRef.current &&
                    "open" in comprobanteDomicilioRef.current
                  ) {
                    (comprobanteDomicilioRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el comprobante de domicilio" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {COMPROBANTE_CHOICES.map((comprobante) => (
                    <SelectItem
                      key={comprobante.value}
                      label={comprobante.label}
                      value={comprobante.value}
                    >
                      {comprobante.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.comprobante_domicilio_choices && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.comprobante_domicilio_choices.message}
          </Text>
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
