import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import type { Option } from "@rn-primitives/select";
import { Controller } from "react-hook-form";
import { Platform, ScrollView, View } from "react-native";
import {
  areasRegistro,
  capacitaciones,
  diagnosticos,
  gruposSociales,
  municipios,
  openSelect,
  tiposNegocio,
  toSentenceCase,
} from "./constants";
import { type IInformacionAdicional } from "./types";
import { useInformacionAdicional } from "./useInformacionAdicional";

export const InformacionAdicional: React.FC<IInformacionAdicional> = ({
  control,
  errors,
  values,
  setValue,
  trigger,
  municipioRef,
  tipoNegocioRef,
  areaRegistroRef,
  contentInsets,
  onBack,
  onNext,
  showButtons = true,
}) => {
  const { colorScheme } = useTheme();
  const foregroundColor = THEME[colorScheme].foreground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;
  const destructiveColor = THEME[colorScheme].destructive;

  const { isFormComplete } = useInformacionAdicional({ values, errors });

  const handleCheckboxChange = (
    name: "grupoSocial" | "capacitacion" | "diagnostico",
    value: string,
    checked: boolean
  ) => {
    const current = (values[name] as string[]) || [];
    const newValue = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    setValue(name, newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={{ gap: 16, width: "100%" }}>
        {/* Referido del Gobernador */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿Referenciado del gobernador?
          </Text>
          <Controller
            control={control}
            name="referidoGobernador"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Button
                  variant={value === "sí" ? "default" : "outline"}
                  onPress={() => onChange("sí")}
                  className="flex-1"
                >
                  <Text>Sí</Text>
                </Button>
                <Button
                  variant={value === "no" ? "default" : "outline"}
                  onPress={() => onChange("no")}
                  className="flex-1"
                >
                  <Text>No</Text>
                </Button>
              </View>
            )}
          />
          {errors.referidoGobernador && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.referidoGobernador.message}
            </Text>
          )}
        </View>

        {/* Municipio */}
        <View style={{ gap: 8 }}>
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
                        label: toSentenceCase(value),
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
                  ref={municipioRef}
                  onTouchStart={() => {
                    openSelect(municipioRef);
                  }}
                >
                  <SelectValue placeholder="Selecciona un municipio" />
                </SelectTrigger>
                <SelectContent insets={contentInsets}>
                  <SelectGroup>
                    {municipios.map((municipio) => (
                      <SelectItem
                        key={municipio}
                        label={toSentenceCase(municipio)}
                        value={municipio}
                      >
                        {toSentenceCase(municipio)}
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
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Localidad
          </Text>
          <Controller
            control={control}
            name="localidad"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Ingresa la localidad"
                placeholderTextColor={mutedForegroundColor}
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.localidad && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.localidad.message}
            </Text>
          )}
        </View>

        {/* Grupo Social */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Grupo social
          </Text>
          <View style={{ gap: 12 }}>
            {gruposSociales.map((grupo) => {
              const checked = (values.grupoSocial || []).includes(grupo);
              return (
                <View
                  key={grupo}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <Checkbox
                    id={`grupo-social-${grupo}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      handleCheckboxChange("grupoSocial", grupo, !!isChecked);
                    }}
                  />
                  <Label
                    htmlFor={`grupo-social-${grupo}`}
                    onPress={Platform.select({
                      native: () => {
                        handleCheckboxChange("grupoSocial", grupo, !checked);
                      },
                    })}
                  >
                    {toSentenceCase(grupo)}
                  </Label>
                </View>
              );
            })}
          </View>
          {errors.grupoSocial && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.grupoSocial.message}
            </Text>
          )}
        </View>

        {/* Teléfono */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Teléfono
          </Text>
          <Controller
            control={control}
            name="telefono"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Ingresa tu teléfono"
                placeholderTextColor={mutedForegroundColor}
                value={value || ""}
                onChangeText={(text) => {
                  // Solo permitir números y limitar a 10 dígitos
                  const numbersOnly = text.replace(/[^0-9]/g, "").slice(0, 10);
                  onChange(numbersOnly);
                  trigger("telefono");
                }}
                onBlur={onBlur}
                keyboardType="phone-pad"
                maxLength={10}
              />
            )}
          />
          {errors.telefono && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.telefono.message}
            </Text>
          )}
        </View>

        {/* Correo */}
        <View style={{ gap: 8 }}>
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
                placeholder="Ingresa tu correo"
                placeholderTextColor={mutedForegroundColor}
                value={value || ""}
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

        {/* Negocio */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿Cuenta con algún negocio?
          </Text>
          <Controller
            control={control}
            name="negocio"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Button
                  variant={value === "sí" ? "default" : "outline"}
                  onPress={() => onChange("sí")}
                  className="flex-1"
                >
                  <Text>Sí</Text>
                </Button>
                <Button
                  variant={value === "no" ? "default" : "outline"}
                  onPress={() => onChange("no")}
                  className="flex-1"
                >
                  <Text>No</Text>
                </Button>
              </View>
            )}
          />
          {errors.negocio && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.negocio.message}
            </Text>
          )}
        </View>

        {/* SAT */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿Cuenta con registro ante el SAT?
          </Text>
          <Controller
            control={control}
            name="sat"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Button
                  variant={value === "sí" ? "default" : "outline"}
                  onPress={() => onChange("sí")}
                  className="flex-1"
                >
                  <Text>Sí</Text>
                </Button>
                <Button
                  variant={value === "no" ? "default" : "outline"}
                  onPress={() => onChange("no")}
                  className="flex-1"
                >
                  <Text>No</Text>
                </Button>
              </View>
            )}
          />
          {errors.sat && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.sat.message}
            </Text>
          )}
        </View>

        {/* Tipo de Negocio */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Tipo de negocio <Text style={{ color: mutedForegroundColor, fontWeight: "normal" }}>(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="tipoNegocio"
            render={({ field: { onChange, value } }) => (
              <Select
                value={
                  value
                    ? {
                        label: toSentenceCase(value),
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
                  ref={tipoNegocioRef}
                  onTouchStart={() => {
                    openSelect(tipoNegocioRef);
                  }}
                >
                  <SelectValue placeholder="Selecciona el tipo de negocio" />
                </SelectTrigger>
                <SelectContent insets={contentInsets}>
                  <SelectGroup>
                    {tiposNegocio.map((tipo) => (
                      <SelectItem
                        key={tipo}
                        label={toSentenceCase(tipo)}
                        value={tipo}
                      >
                        {toSentenceCase(tipo)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipoNegocio && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.tipoNegocio?.message}
            </Text>
          )}
        </View>

        {/* Otro tipo de negocio */}
        {values.tipoNegocio === "otro" && (
          <View style={{ gap: 8 }}>
            <Text
              className="text-base font-semibold"
              style={{ color: foregroundColor }}
            >
              Especifica otro tipo de negocio <Text style={{ color: mutedForegroundColor, fontWeight: "normal" }}>(opcional)</Text>
            </Text>
            <Controller
              control={control}
              name="otroTipoNegocio"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Especifica el tipo de negocio"
                  placeholderTextColor={mutedForegroundColor}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.otroTipoNegocio && (
              <Text
                className="text-xs mt-1"
                style={{ color: destructiveColor }}
              >
                {errors.otroTipoNegocio?.message}
              </Text>
            )}
          </View>
        )}

        {/* Capacitación */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿Te gustaría capacitarte en algunos de los siguientes temas? <Text style={{ color: mutedForegroundColor, fontWeight: "normal" }}>(opcional)</Text>
          </Text>
          <View style={{ gap: 12 }}>
            {capacitaciones.map((tema) => {
              const checked = (values.capacitacion || []).includes(tema);
              return (
                <View
                  key={tema}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <Checkbox
                    id={`capacitacion-${tema}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      handleCheckboxChange("capacitacion", tema, !!isChecked);
                    }}
                  />
                  <Label
                    htmlFor={`capacitacion-${tema}`}
                    onPress={Platform.select({
                      native: () => {
                        handleCheckboxChange("capacitacion", tema, !checked);
                      },
                    })}
                  >
                    {toSentenceCase(tema)}
                  </Label>
                </View>
              );
            })}
          </View>
        </View>

        {/* Ocupación */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            ¿A qué se dedica? <Text style={{ color: mutedForegroundColor, fontWeight: "normal" }}>(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="ocupacion"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Describe tu ocupación"
                placeholderTextColor={mutedForegroundColor}
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.ocupacion && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.ocupacion?.message}
            </Text>
          )}
        </View>

        {/* Comentarios */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Comentarios del encuestador <Text style={{ color: mutedForegroundColor, fontWeight: "normal" }}>(opcional)</Text>
          </Text>
          <Controller
            control={control}
            name="comentarios"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Agrega comentarios"
                placeholderTextColor={mutedForegroundColor}
                value={value || ""}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
              />
            )}
          />
          {errors.comentarios && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.comentarios?.message}
            </Text>
          )}
        </View>

        {/* Diagnóstico */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Diagnóstico del encuestador
          </Text>
          <View style={{ gap: 12 }}>
            {diagnosticos.map((diagnostico) => {
              const checked = (values.diagnostico || []).includes(diagnostico);
              return (
                <View
                  key={diagnostico}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <Checkbox
                    id={`diagnostico-${diagnostico}`}
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      handleCheckboxChange("diagnostico", diagnostico, !!isChecked);
                    }}
                  />
                  <Label
                    htmlFor={`diagnostico-${diagnostico}`}
                    onPress={Platform.select({
                      native: () => {
                        handleCheckboxChange("diagnostico", diagnostico, !checked);
                      },
                    })}
                  >
                    {toSentenceCase(diagnostico)}
                  </Label>
                </View>
              );
            })}
          </View>
          {errors.diagnostico && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.diagnostico.message}
            </Text>
          )}
        </View>

        {/* Área de Registro */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-base font-semibold"
            style={{ color: foregroundColor }}
          >
            Área que registra
          </Text>
          <Controller
            control={control}
            name="areaRegistro"
            render={({ field: { onChange, value } }) => (
              <Select
                value={
                  value
                    ? {
                        label: toSentenceCase(value),
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
                  ref={areaRegistroRef}
                  onTouchStart={() => {
                    openSelect(areaRegistroRef);
                  }}
                >
                  <SelectValue placeholder="Selecciona el área" />
                </SelectTrigger>
                <SelectContent insets={contentInsets}>
                  <SelectGroup>
                    {areasRegistro.map((area) => (
                      <SelectItem
                        key={area}
                        label={toSentenceCase(area)}
                        value={area}
                      >
                        {toSentenceCase(area)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.areaRegistro && (
            <Text className="text-xs mt-1" style={{ color: destructiveColor }}>
              {errors.areaRegistro.message}
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
    </ScrollView>
  );
};

