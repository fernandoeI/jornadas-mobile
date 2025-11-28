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
  CONDICIONES_ACCESO,
  ESTADOS_CONSERVACION,
  POTENCIALES_PROMOCIONAL,
  PromocionTuristicaFormData,
} from "@/src/forms/schemas/PromocionTuristicaForm";
import type { Foto } from "@/src/forms/usePromocionTuristicaForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Monicon } from "@monicon/native";
import type { Option, TriggerRef } from "@rn-primitives/select";
import { Image } from "expo-image";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { View } from "react-native";

interface IAdvanceInformation {
  control: Control<PromocionTuristicaFormData, any, any>;
  errors: FieldErrors<PromocionTuristicaFormData>;
  values: PromocionTuristicaFormData;
  setValue: (name: keyof PromocionTuristicaFormData, value: any) => void;
  condicionesAccesoRef: React.RefObject<TriggerRef | null>;
  estadoConservacionRef: React.RefObject<TriggerRef | null>;
  potencialPromocionalRef: React.RefObject<TriggerRef | null>;
  contentInsets: {
    top: number;
    bottom: number | undefined;
    left: number;
    right: number;
  };
  fotos: Foto[];
  onPickImage: () => void;
  onRemoveFoto: (index: number) => void;
  onUpdateFotoDescripcion: (index: number, descripcion: string) => void;
  onGetLocation: () => void;
  onBack: () => void;
  onSubmit: () => void;
  showButtons?: boolean;
}

export const AdvanceInformation: React.FC<IAdvanceInformation> = ({
  control,
  errors,
  values,
  setValue,
  condicionesAccesoRef,
  estadoConservacionRef,
  potencialPromocionalRef,
  contentInsets,
  fotos,
  onPickImage,
  onRemoveFoto,
  onUpdateFotoDescripcion,
  onGetLocation,
  onBack,
  onSubmit,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  return (
    <View className="gap-4 pb-16">
      {/* Condiciones de acceso */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Condiciones de acceso
        </Text>
        <Controller
          control={control}
          name="condicionesAcceso"
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
                ref={condicionesAccesoRef}
                onTouchStart={() => {
                  if (
                    condicionesAccesoRef.current &&
                    "open" in condicionesAccesoRef.current
                  ) {
                    (condicionesAccesoRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona las condiciones de acceso" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {CONDICIONES_ACCESO.map((condicion) => (
                    <SelectItem
                      key={condicion}
                      label={condicion}
                      value={condicion}
                    >
                      {condicion}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.condicionesAcceso && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.condicionesAcceso.message}
          </Text>
        )}
      </View>

      {/* Estado de conservación */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Estado de conservación del sitio
        </Text>
        <Controller
          control={control}
          name="estadoConservacion"
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
                ref={estadoConservacionRef}
                onTouchStart={() => {
                  if (
                    estadoConservacionRef.current &&
                    "open" in estadoConservacionRef.current
                  ) {
                    (estadoConservacionRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el estado de conservación" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {ESTADOS_CONSERVACION.map((estado) => (
                    <SelectItem key={estado} label={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.estadoConservacion && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.estadoConservacion.message}
          </Text>
        )}
      </View>

      {/* Potencial promocional */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Potencial promocional (subjetivo técnico)
        </Text>
        <Controller
          control={control}
          name="potencialPromocional"
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
                ref={potencialPromocionalRef}
                onTouchStart={() => {
                  if (
                    potencialPromocionalRef.current &&
                    "open" in potencialPromocionalRef.current
                  ) {
                    (potencialPromocionalRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el potencial promocional" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {POTENCIALES_PROMOCIONAL.map((potencial) => (
                    <SelectItem
                      key={potencial}
                      label={potencial}
                      value={potencial}
                    >
                      {potencial}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.potencialPromocional && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.potencialPromocional.message}
          </Text>
        )}
      </View>

      {/* Observaciones técnicas */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Observaciones técnicas
        </Text>
        <Controller
          control={control}
          name="observacionesTecnicas"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Describe las observaciones técnicas..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              className="h-[100px]"
            />
          )}
        />
        {errors.observacionesTecnicas && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.observacionesTecnicas.message}
          </Text>
        )}
      </View>

      {/* Geolocalización */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Geolocalización del sitio
        </Text>
        <View className="flex-row gap-3 items-end">
          <View className="flex-1">
            <Controller
              control={control}
              name="geolocalizacion"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Coordenadas GPS (se obtendrán automáticamente)"
                  placeholderTextColor={mutedForegroundColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.geolocalizacion && (
              <Text
                className="text-xs mt-1"
                style={{ color: destructiveColor }}
              >
                {errors.geolocalizacion.message}
              </Text>
            )}
          </View>
          <Button
            variant="outline"
            className="border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
            onPress={onGetLocation}
          >
            <View className="flex-row gap-2 items-center">
              <Monicon name="mdi:map-marker" size={16} color="#9A1445" />
              <Text className="text-[#9A1445] text-sm">Obtener</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Fotografías */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Fotografía (hasta 3 imágenes)
        </Text>
        <View className="gap-3">
          {fotos.length < 3 && (
            <Button
              variant="outline"
              className="border-[#9A1445]/30 bg-white/80 backdrop-blur-sm"
              onPress={onPickImage}
            >
              <View className="flex-row gap-3 items-center">
                <Monicon name="mdi:camera" size={20} color="#9A1445" />
                <Text className="text-[#9A1445]">
                  Agregar fotografía ({fotos.length}/3)
                </Text>
              </View>
            </Button>
          )}
          {fotos.map((foto, index) => (
            <View
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="text-sm"
                  style={{ color: mutedForegroundColor }}
                >
                  Foto {index + 1}
                </Text>
                <Button
                  variant="outline"
                  className="border-error-500"
                  onPress={() => onRemoveFoto(index)}
                >
                  <Text className="text-error-600">Eliminar</Text>
                </Button>
              </View>
              <View className="gap-3">
                <View className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <Image
                    source={{ uri: foto.uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                </View>
                <Input
                  placeholder="Descripción de la fotografía..."
                  placeholderTextColor={mutedForegroundColor}
                  value={foto.descripcion}
                  onChangeText={(text: string) =>
                    onUpdateFotoDescripcion(index, text)
                  }
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Observaciones adicionales */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Observaciones adicionales y actores clave vinculados al sitio
        </Text>
        <Controller
          control={control}
          name="observacionesAdicionales"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Describe observaciones adicionales y actores clave..."
              placeholderTextColor={mutedForegroundColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              className="min-h-[100px]"
            />
          )}
        />
        {errors.observacionesAdicionales && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.observacionesAdicionales.message}
          </Text>
        )}
      </View>
    </View>
  );
};
