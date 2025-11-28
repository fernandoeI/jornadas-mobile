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
  NIVELES_CONOCIMIENTO,
  OPCIONES_PLATAFORMA,
  OPCIONES_SENALETICA,
  PromocionTuristicaFormData,
  QUIEN_PROMUEVE_OPCIONES,
  SERVICIOS_EXISTENTES,
  TIPOS_ATRACTIVO,
} from "@/src/forms/schemas/PromocionTuristicaForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option, TriggerRef } from "@rn-primitives/select";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Platform, View } from "react-native";

interface IBasicInformation {
  control: Control<PromocionTuristicaFormData, any, any>;
  errors: FieldErrors<PromocionTuristicaFormData>;
  values: PromocionTuristicaFormData;
  setValue: (name: keyof PromocionTuristicaFormData, value: any) => void;
  nivelConocimientoRef: React.RefObject<TriggerRef | null>;
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

export const BasicInformation: React.FC<IBasicInformation> = ({
  control,
  errors,
  values,
  setValue,
  nivelConocimientoRef,
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
      {/* Nombre del atractivo */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nombre del atractivo turístico
        </Text>
        <Controller
          control={control}
          name="nombreAtractivo"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Ingresa el nombre del atractivo..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.nombreAtractivo && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.nombreAtractivo.message}
          </Text>
        )}
      </View>

      {/* Tipo de atractivo */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Tipo de atractivo (marcar todos los que apliquen)
        </Text>
        <View className="gap-3">
          {TIPOS_ATRACTIVO.map((tipo) => {
            const checked = (values.tipoAtractivo || []).includes(tipo);
            const labelText =
              tipo === "gastronomico"
                ? "Gastronómico"
                : tipo === "artesanal"
                  ? "Artesanal"
                  : tipo === "recreativo"
                    ? "Recreativo"
                    : tipo;
            return (
              <View key={tipo} className="flex-row items-center gap-3">
                <Checkbox
                  id={`tipo-${tipo}`}
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    const currentValues = values.tipoAtractivo || [];
                    if (isChecked) {
                      setValue("tipoAtractivo", [...currentValues, tipo]);
                    } else {
                      setValue(
                        "tipoAtractivo",
                        currentValues.filter((v) => v !== tipo)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`tipo-${tipo}`}
                  onPress={Platform.select({
                    native: () => {
                      const currentValues = values.tipoAtractivo || [];
                      if (checked) {
                        setValue(
                          "tipoAtractivo",
                          currentValues.filter((v) => v !== tipo)
                        );
                      } else {
                        setValue("tipoAtractivo", [...currentValues, tipo]);
                      }
                    },
                  })}
                >
                  <Text style={{ textTransform: "capitalize" }}>
                    {labelText}
                  </Text>
                </Label>
              </View>
            );
          })}
        </View>
        {errors.tipoAtractivo && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.tipoAtractivo.message}
          </Text>
        )}

        {(values.tipoAtractivo || []).includes("otro") && (
          <View className="gap-2 mt-4">
            <Text
              className="text-base font-semibold"
              style={{ color: foregroundColor }}
            >
              Especifica otro tipo:
            </Text>
            <Controller
              control={control}
              name="otroTipoAtractivo"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Describe el otro tipo de atractivo..."
                  placeholderTextColor={mutedForegroundColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.otroTipoAtractivo && (
              <Text
                className="text-xs mt-1"
                style={{ color: destructiveColor }}
              >
                {errors.otroTipoAtractivo.message}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Quién promueve */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Quién lo promueve actualmente?
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {QUIEN_PROMUEVE_OPCIONES.map((opcion) => (
            <Button
              key={opcion}
              variant={values.quienPromueve === opcion ? "default" : "outline"}
              onPress={() => setValue("quienPromueve", opcion)}
            >
              <Text style={{ textTransform: "capitalize" }}>{opcion}</Text>
            </Button>
          ))}
        </View>
        {errors.quienPromueve && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.quienPromueve.message}
          </Text>
        )}

        {values.quienPromueve === "otro" && (
          <View className="gap-2 mt-4">
            <Text
              className="text-base font-semibold"
              style={{ color: foregroundColor }}
            >
              Especifica quién promueve:
            </Text>
            <Controller
              control={control}
              name="otroQuienPromueve"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Describe quién promueve el atractivo..."
                  placeholderTextColor={mutedForegroundColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.otroQuienPromueve && (
              <Text
                className="text-xs mt-1"
                style={{ color: destructiveColor }}
              >
                {errors.otroQuienPromueve.message}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Nivel de conocimiento */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Nivel de conocimiento local
        </Text>
        <Controller
          control={control}
          name="nivelConocimiento"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label: value,
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
                ref={nivelConocimientoRef}
                onTouchStart={() => {
                  if (
                    nivelConocimientoRef.current &&
                    "open" in nivelConocimientoRef.current
                  ) {
                    (nivelConocimientoRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el nivel de conocimiento" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {NIVELES_CONOCIMIENTO.map((nivel) => (
                    <SelectItem key={nivel} label={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.nivelConocimiento && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.nivelConocimiento.message}
          </Text>
        )}
      </View>

      {/* Señalética */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Cuenta con señalética turística?
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {OPCIONES_SENALETICA.map((opcion) => (
            <Button
              key={opcion}
              variant={
                values.tieneSenaletica === opcion ? "default" : "outline"
              }
              onPress={() => setValue("tieneSenaletica", opcion)}
            >
              <Text style={{ textTransform: "capitalize" }}>
                {opcion === "parcial-deteriorada"
                  ? "Parcial / deteriorada"
                  : opcion}
              </Text>
            </Button>
          ))}
        </View>
        {errors.tieneSenaletica && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.tieneSenaletica.message}
          </Text>
        )}
      </View>

      {/* Plataforma digital */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Está en alguna plataforma digital o catálogo institucional?
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {OPCIONES_PLATAFORMA.map((opcion) => (
            <Button
              key={opcion}
              variant={
                values.enPlataformaDigital === opcion ? "default" : "outline"
              }
              onPress={() => setValue("enPlataformaDigital", opcion)}
            >
              <Text style={{ textTransform: "capitalize" }}>
                {opcion === "no-sabe" ? "No sabe" : opcion}
              </Text>
            </Button>
          ))}
        </View>
        {errors.enPlataformaDigital && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.enPlataformaDigital.message}
          </Text>
        )}
      </View>

      {/* Servicios existentes */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Qué servicios existen en torno al atractivo?
        </Text>
        <View className="gap-3">
          {SERVICIOS_EXISTENTES.map((servicio) => {
            const checked = (values.serviciosExistentes || []).includes(
              servicio
            );
            const labelText =
              servicio === "guia-local"
                ? "Guía local"
                : servicio === "otros"
                  ? "Otros"
                  : servicio;
            return (
              <View key={servicio} className="flex-row items-center gap-3">
                <Checkbox
                  id={`servicio-${servicio}`}
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    const currentValues = values.serviciosExistentes || [];
                    if (isChecked) {
                      setValue("serviciosExistentes", [
                        ...currentValues,
                        servicio,
                      ]);
                    } else {
                      setValue(
                        "serviciosExistentes",
                        currentValues.filter((v) => v !== servicio)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`servicio-${servicio}`}
                  onPress={Platform.select({
                    native: () => {
                      const currentValues = values.serviciosExistentes || [];
                      if (checked) {
                        setValue(
                          "serviciosExistentes",
                          currentValues.filter((v) => v !== servicio)
                        );
                      } else {
                        setValue("serviciosExistentes", [
                          ...currentValues,
                          servicio,
                        ]);
                      }
                    },
                  })}
                >
                  <Text style={{ textTransform: "capitalize" }}>
                    {labelText}
                  </Text>
                </Label>
              </View>
            );
          })}
        </View>
        {errors.serviciosExistentes && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.serviciosExistentes.message}
          </Text>
        )}

        {(values.serviciosExistentes || []).includes("otros") && (
          <View className="gap-2 mt-4">
            <Text
              className="text-base font-semibold"
              style={{ color: foregroundColor }}
            >
              Especifica otros servicios:
            </Text>
            <Controller
              control={control}
              name="otrosServicios"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Describe otros servicios disponibles..."
                  placeholderTextColor={mutedForegroundColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.otrosServicios && (
              <Text
                className="text-xs mt-1"
                style={{ color: destructiveColor }}
              >
                {errors.otrosServicios.message}
              </Text>
            )}
          </View>
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
