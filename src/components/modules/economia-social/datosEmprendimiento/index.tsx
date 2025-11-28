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
  ANTIGUEDAD_CHOICES,
  BENEFICIO_CHOICES,
  DESTINO_CHOICES,
  GANANCIA_CHOICES,
  GIRO_CHOICES,
  UBICACION_CHOICES,
  YESNO_CHOICES,
} from "@/src/constants/tanda";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option, TriggerRef } from "@rn-primitives/select";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { View } from "react-native";

interface IDatosEmprendimiento {
  control: Control<EconomiaSocialFormData, any, any>;
  errors: FieldErrors<EconomiaSocialFormData>;
  values: EconomiaSocialFormData;
  setValue: (name: keyof EconomiaSocialFormData, value: any) => void;
  negocioUbicacionRef: React.RefObject<TriggerRef | null>;
  negocioAntiguedadRef: React.RefObject<TriggerRef | null>;
  negocioGananciaRef: React.RefObject<TriggerRef | null>;
  negocioGiroRef: React.RefObject<TriggerRef | null>;
  beneficioTandaRef: React.RefObject<TriggerRef | null>;
  destinoRecursoRef: React.RefObject<TriggerRef | null>;
  contentInsets: {
    top: number;
    bottom: number | undefined;
    left: number;
    right: number;
  };
  onBack: () => void;
  onSubmit: () => void;
  showButtons?: boolean;
}

export const DatosEmprendimiento: React.FC<IDatosEmprendimiento> = ({
  control,
  errors,
  values,
  setValue,
  negocioUbicacionRef,
  negocioAntiguedadRef,
  negocioGananciaRef,
  negocioGiroRef,
  beneficioTandaRef,
  destinoRecursoRef,
  contentInsets,
  onBack,
  onSubmit,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  return (
    <View className="gap-4">
      {/* Monto */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Monto solicitado * (en pesos)
        </Text>
        <Controller
          control={control}
          name="monto"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="5000"
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
        {errors.monto && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.monto.message}
          </Text>
        )}
      </View>

      {/* Ubicación del Negocio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Ubicación del Negocio *
        </Text>
        <Controller
          control={control}
          name="negocio_ubicacion"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        UBICACION_CHOICES.find((u) => u.value === value)
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
                ref={negocioUbicacionRef}
                onTouchStart={() => {
                  if (
                    negocioUbicacionRef.current &&
                    "open" in negocioUbicacionRef.current
                  ) {
                    (negocioUbicacionRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona la ubicación del negocio" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {UBICACION_CHOICES.map((ubicacion) => (
                    <SelectItem
                      key={ubicacion.value}
                      label={ubicacion.label}
                      value={ubicacion.value}
                    >
                      {ubicacion.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.negocio_ubicacion && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_ubicacion.message}
          </Text>
        )}
      </View>

      {/* Antigüedad del Negocio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Antigüedad del Negocio (opcional)
        </Text>
        <Controller
          control={control}
          name="negocio_antiguedad"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        ANTIGUEDAD_CHOICES.find((a) => a.value === value)
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
                ref={negocioAntiguedadRef}
                onTouchStart={() => {
                  if (
                    negocioAntiguedadRef.current &&
                    "open" in negocioAntiguedadRef.current
                  ) {
                    (negocioAntiguedadRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona la antigüedad del negocio" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {ANTIGUEDAD_CHOICES.map((antiguedad) => (
                    <SelectItem
                      key={antiguedad.value}
                      label={antiguedad.label}
                      value={antiguedad.value}
                    >
                      {antiguedad.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.negocio_antiguedad && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_antiguedad.message}
          </Text>
        )}
      </View>

      {/* Ganancia del Negocio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Ganancia Mensual del Negocio (opcional)
        </Text>
        <Controller
          control={control}
          name="negocio_ganancia"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        GANANCIA_CHOICES.find((g) => g.value === value)
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
                ref={negocioGananciaRef}
                onTouchStart={() => {
                  if (
                    negocioGananciaRef.current &&
                    "open" in negocioGananciaRef.current
                  ) {
                    (negocioGananciaRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el rango de ganancia mensual" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {GANANCIA_CHOICES.map((ganancia) => (
                    <SelectItem
                      key={ganancia.value}
                      label={ganancia.label}
                      value={ganancia.value}
                    >
                      {ganancia.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.negocio_ganancia && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_ganancia.message}
          </Text>
        )}
      </View>

      {/* Giro del Negocio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Giro del Negocio (opcional)
        </Text>
        <Controller
          control={control}
          name="negocio_giro"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        GIRO_CHOICES.find((g) => g.value === value)?.label ||
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
                ref={negocioGiroRef}
                onTouchStart={() => {
                  if (
                    negocioGiroRef.current &&
                    "open" in negocioGiroRef.current
                  ) {
                    (negocioGiroRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el giro del negocio" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {GIRO_CHOICES.map((giro) => (
                    <SelectItem
                      key={giro.value}
                      label={giro.label}
                      value={giro.value}
                    >
                      {giro.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.negocio_giro && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_giro.message}
          </Text>
        )}
      </View>

      {/* Beneficio de la Tanda */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Qué beneficio espera obtener de la tanda? *
        </Text>
        <Controller
          control={control}
          name="beneficio_tanda"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        BENEFICIO_CHOICES.find((b) => b.value === value)
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
                ref={beneficioTandaRef}
                onTouchStart={() => {
                  if (
                    beneficioTandaRef.current &&
                    "open" in beneficioTandaRef.current
                  ) {
                    (beneficioTandaRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el beneficio esperado" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {BENEFICIO_CHOICES.map((beneficio) => (
                    <SelectItem
                      key={beneficio.value}
                      label={beneficio.label}
                      value={beneficio.value}
                    >
                      {beneficio.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.beneficio_tanda && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.beneficio_tanda.message}
          </Text>
        )}
      </View>

      {/* Destino del Recurso */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Destino del Recurso (opcional)
        </Text>
        <Controller
          control={control}
          name="destino_recurso"
          render={({ field: { onChange, value } }) => (
            <Select
              value={
                value
                  ? {
                      label:
                        DESTINO_CHOICES.find((d) => d.value === value)?.label ||
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
                ref={destinoRecursoRef}
                onTouchStart={() => {
                  if (
                    destinoRecursoRef.current &&
                    "open" in destinoRecursoRef.current
                  ) {
                    (destinoRecursoRef.current as any).open();
                  }
                }}
              >
                <SelectValue placeholder="Selecciona el destino del recurso" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                <SelectGroup>
                  {DESTINO_CHOICES.map((destino) => (
                    <SelectItem
                      key={destino.value}
                      label={destino.label}
                      value={destino.value}
                    >
                      {destino.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.destino_recurso && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.destino_recurso.message}
          </Text>
        )}
      </View>

      {/* Participación en Negocio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Participa en el negocio? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.negocio_participacion === opcion.value
                  ? "default"
                  : "outline"
              }
              onPress={() => setValue("negocio_participacion", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.negocio_participacion && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_participacion.message}
          </Text>
        )}
      </View>

      {/* Cooperativa */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Es cooperativa? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.negocio_cooperativa === opcion.value
                  ? "default"
                  : "outline"
              }
              onPress={() => setValue("negocio_cooperativa", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.negocio_cooperativa && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_cooperativa.message}
          </Text>
        )}
      </View>

      {/* Marca */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          ¿Tiene marca? *
        </Text>
        <View className="flex-row gap-4 flex-wrap">
          {YESNO_CHOICES.map((opcion) => (
            <Button
              key={String(opcion.value)}
              variant={
                values.negocio_marca === opcion.value ? "default" : "outline"
              }
              onPress={() => setValue("negocio_marca", opcion.value)}
            >
              <Text>{opcion.label}</Text>
            </Button>
          ))}
        </View>
        {errors.negocio_marca && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_marca.message}
          </Text>
        )}
      </View>

      {/* Marca Registrada */}
      {values.negocio_marca && (
        <View className="gap-2">
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿La marca está registrada? *
          </Text>
          <View className="flex-row gap-4 flex-wrap">
            {YESNO_CHOICES.map((opcion) => (
              <Button
                key={String(opcion.value)}
                variant={
                  values.negocio_marca_registrada === opcion.value
                    ? "default"
                    : "outline"
                }
                onPress={() =>
                  setValue("negocio_marca_registrada", opcion.value)
                }
              >
                <Text>{opcion.label}</Text>
              </Button>
            ))}
          </View>
          {errors.negocio_marca_registrada && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.negocio_marca_registrada.message}
            </Text>
          )}
        </View>
      )}

      {/* Descripción del Negocio */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Descripción del Negocio (opcional)
        </Text>
        <Controller
          control={control}
          name="negocio_descripcion"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Describe tu negocio..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              className="h-[100px]"
            />
          )}
        />
        {errors.negocio_descripcion && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.negocio_descripcion.message}
          </Text>
        )}
      </View>

      {/* Comentarios */}
      <View className="gap-2">
        <Text
          className="text-base font-semibold"
          style={{ color: foregroundColor }}
        >
          Comentarios Adicionales (opcional)
        </Text>
        <Controller
          control={control}
          name="comentarios"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Comentarios adicionales..."
              placeholderTextColor={mutedForegroundColor}
              value={value || ""}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              className="h-[100px]"
            />
          )}
        />
        {errors.comentarios && (
          <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
            {errors.comentarios.message}
          </Text>
        )}
      </View>

      {/* Botones de navegación */}
      {showButtons && (
        <View className="flex-row gap-4 mt-6">
          <Button variant="outline" onPress={onBack} className="flex-1">
            <Text>Regresar</Text>
          </Button>
          <Button onPress={onSubmit} className="flex-1">
            <Text>Finalizar</Text>
          </Button>
        </View>
      )}
    </View>
  );
};
