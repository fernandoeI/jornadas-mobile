import { DateOfBirthInput } from "@/src/components/common";
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
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option } from "@rn-primitives/select";
import { Controller } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { openSelect } from "./constants";
import { type IDatosSolicitante } from "./types";
import { useDatosSolicitante } from "./useDatosSolicitante";

export const DatosSolicitante: React.FC<IDatosSolicitante> = ({
  control,
  errors,
  values,
  setValue,
  trigger,
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

  const {
    isValidatingCurp,
    isCurpValidated,
    allowManualEdit,
    isFormComplete,
    handleValidateCurp,
  } = useDatosSolicitante({
    values,
    errors,
    setValue,
    trigger,
  });

  return (
    <View className="gap-4">
      {/* CURP */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Curp
        </Text>
        <View style={{ position: "relative" }}>
          <Controller
            control={control}
            name="curp_txt"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="XEXX010101HNEXXXA4"
                placeholderTextColor={mutedForegroundColor}
                value={value}
                onChangeText={(text) => {
                  const upperText = text.toUpperCase();
                  onChange(upperText);
                }}
                onBlur={onBlur}
                maxLength={18}
                className="pr-24"
                style={{ paddingRight: 90 }}
              />
            )}
          />
          <View
            style={{
              position: "absolute",
              right: 8,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isCurpValidated ? (
              <Button
                disabled
                size="sm"
                style={{
                  minWidth: 70,
                  height: 32,
                  backgroundColor: "#22c55e",
                  opacity: 1,
                }}
              >
                <Text className="text-xs text-white">Validado</Text>
              </Button>
            ) : (
              <Button
                onPress={handleValidateCurp}
                disabled={
                  isValidatingCurp ||
                  !values.curp_txt ||
                  values.curp_txt.length !== 18
                }
                size="sm"
                style={{ minWidth: 70, height: 32 }}
              >
                {isValidatingCurp ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs">Validar</Text>
                )}
              </Button>
            )}
          </View>
        </View>
        {errors.curp_txt && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.curp_txt.message}
          </Text>
        )}
      </View>

      {/* Nombre */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre
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
              editable={allowManualEdit}
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
          Primer apellido
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
              editable={allowManualEdit}
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
          Segundo apellido (opcional)
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
              editable={allowManualEdit}
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
          Fecha de nacimiento
        </Text>
        <Controller
          control={control}
          name="fecha_nacimiento"
          render={({ field: { onChange, onBlur, value } }) => (
            <DateOfBirthInput
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              disabled={!allowManualEdit}
              error={errors.fecha_nacimiento?.message}
              contentInsets={contentInsets}
              minAge={30}
              maxAge={59}
            />
          )}
        />
      </View>

      {/* Entidad de Nacimiento */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Entidad de nacimiento
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
              disabled={!allowManualEdit}
            >
              <SelectTrigger
                ref={entidadNacimientoRef}
                disabled={!allowManualEdit}
                onTouchStart={() =>
                  openSelect(entidadNacimientoRef, allowManualEdit)
                }
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
          Estado civil
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
              disabled={!isCurpValidated && !allowManualEdit}
            >
              <SelectTrigger
                ref={estadoCivilRef}
                disabled={!isCurpValidated && !allowManualEdit}
                onTouchStart={() =>
                  openSelect(estadoCivilRef, isCurpValidated || allowManualEdit)
                }
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

      {/* Correo */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Correo electrónico
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
              editable={isCurpValidated || allowManualEdit}
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
