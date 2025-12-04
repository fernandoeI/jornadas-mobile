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
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option } from "@rn-primitives/select";
import { Controller } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { openSelect, PHONE_LENGTH, POSTAL_CODE_LENGTH } from "./constants";
import type { IDireccion } from "./types";
import { useDireccion } from "./useDireccion";

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
  validateAndNextRef,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  const {
    localidades,
    isLoadingLocalidades,
    isValidatingTelefono,
    handleMunicipioChange,
    handleNumericInput,
    getLocalidadPlaceholder,
    validatePhoneAndProceed,
  } = useDireccion({
    values,
    setValue,
    onNext,
    validateAndNextRef,
  });

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Municipio
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
                onChange(option?.value ? Number(option.value) : null);
                handleMunicipioChange(option);
              }}
            >
              <SelectTrigger
                ref={municipioRef}
                onTouchStart={() => openSelect(municipioRef)}
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Localidad
        </Text>
        <Controller
          control={control}
          name="localidad"
          render={({ field: { onChange, value } }) => (
            <View style={{ position: "relative" }}>
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
                  if (option?.value) {
                    onChange(Number(option.value));
                  }
                }}
                disabled={!values.municipio || isLoadingLocalidades}
              >
                <SelectTrigger
                  ref={localidadRef}
                  onTouchStart={() => openSelect(localidadRef)}
                >
                  <SelectValue placeholder={getLocalidadPlaceholder()} />
                </SelectTrigger>
                <SelectContent insets={contentInsets}>
                  <SelectGroup>
                    {isLoadingLocalidades ? (
                      <SelectItem
                        label="Cargando localidades..."
                        value="loading"
                        disabled
                      >
                        Cargando localidades...
                      </SelectItem>
                    ) : localidades.length > 0 ? (
                      localidades.map((localidad) => (
                        <SelectItem
                          key={localidad.id}
                          label={localidad.nombre}
                          value={String(localidad.id)}
                        >
                          {localidad.nombre}
                        </SelectItem>
                      ))
                    ) : values.municipio ? (
                      <SelectItem
                        label="No hay localidades disponibles"
                        value="none"
                        disabled
                      >
                        No hay localidades disponibles
                      </SelectItem>
                    ) : null}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {isLoadingLocalidades && (
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="small" />
                </View>
              )}
            </View>
          )}
        />
        {errors.localidad && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.localidad.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Tipo de asentamiento
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
                if (option?.value) {
                  onChange(option.value);
                }
              }}
            >
              <SelectTrigger
                ref={asentamientoTipoRef}
                onTouchStart={() => openSelect(asentamientoTipoRef)}
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre del asentamiento
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Tipo de vialidad
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
                if (option?.value) {
                  onChange(option.value);
                }
              }}
            >
              <SelectTrigger
                ref={vialidadTipoRef}
                onTouchStart={() => openSelect(vialidadTipoRef)}
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre de la vialidad
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número exterior
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número interior (opcional)
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

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Código postal
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
                onChange(handleNumericInput(text));
              }}
              onBlur={onBlur}
              keyboardType="numeric"
              maxLength={POSTAL_CODE_LENGTH}
            />
          )}
        />
        {errors.codigo_postal && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.codigo_postal.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número de celular 1
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
                onChange(handleNumericInput(text));
              }}
              onBlur={onBlur}
              keyboardType="phone-pad"
              maxLength={PHONE_LENGTH}
            />
          )}
        />
        {errors.num_celular1 && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.num_celular1.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Número de celular 2 (opcional)
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
                const numbersOnly = handleNumericInput(text);
                onChange(numbersOnly || undefined);
              }}
              onBlur={onBlur}
              keyboardType="phone-pad"
              maxLength={PHONE_LENGTH}
            />
          )}
        />
        {errors.num_celular2 && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.num_celular2.message}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Comprobante de domicilio (opcional)
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
                if (option?.value) {
                  onChange(option.value);
                }
              }}
            >
              <SelectTrigger
                ref={comprobanteDomicilioRef}
                onTouchStart={() => openSelect(comprobanteDomicilioRef)}
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

      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onBack} className="flex-1">
            <Text>Regresar</Text>
          </Button>
          <Button
            onPress={validatePhoneAndProceed}
            className="flex-1"
            disabled={isValidatingTelefono}
          >
            {isValidatingTelefono ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <Text>Validando...</Text>
              </View>
            ) : (
              <Text>Siguiente</Text>
            )}
          </Button>
        </View>
      )}
    </View>
  );
};
