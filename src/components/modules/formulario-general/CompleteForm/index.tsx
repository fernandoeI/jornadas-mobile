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
import { Text } from "@/src/components/ui/text";
import type { Option, TriggerRef } from "@rn-primitives/select";
import React, { useRef } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CompleteFormData {
  referidoGobernador: string;
  municipio: string;
  localidad: string;
  grupoSocial: string[];
  telefono: string;
  correo: string;
  negocio: string;
  sat: string;
  tipoNegocio: string;
  otroTipoNegocio: string;
  capacitacion: string[];
  ocupacion: string;
  comentarios: string;
  diagnostico: string[];
  areaRegistro: string;
}

interface CompleteFormProps {
  formData: Partial<CompleteFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<CompleteFormData>>>;
}

const municipios = [
  "Balancán",
  "Cárdenas",
  "Centla",
  "Centro",
  "Comalcalco",
  "Cunduacán",
  "Emiliano Zapata",
  "Huimanguillo",
  "Jalapa",
  "Jalpa de Méndez",
  "Jonuta",
  "Macuspana",
  "Nacajuca",
  "Paraíso",
  "Tacotalpa",
  "Teapa",
  "Tenosique",
];

const gruposSociales = [
  "indígenas",
  "discapacidad",
  "afrodescendiente",
  "adulto mayor",
  "NNA-Niño, niña, adolescente",
  "jóvenes hasta 29 años",
  "ninguno",
];

const tiposNegocio = [
  "artesanías/manualidades",
  "preparación de alimentos",
  "servicios y productos turísticos",
  "servicios",
  "cárnicos",
  "cuidado personal /accesorios",
  "productos para el hogar",
  "abarrotes y misceláneas",
  "papelería",
  "productor /sembrando vida",
  "chocolatero",
  "empresa esencia tabasco",
  "otro",
];

const capacitaciones = [
  "ahorro y crecimiento",
  "registro de marca",
  "emprendimiento",
  "empoderamiento de la mujer",
  "industria ferroviaria",
  "industria energética",
  "industria tecnológica",
  "participación en ferias y festivales",
  "desarrollo de productos turísticos",
];

const diagnosticos = [
  "registro de marca",
  "capacitaciones y asesoramiento",
  "capacitación especializada",
  "potencial turístico",
  "agroindustria",
  "expositor festivales",
  "microcrédito",
  "cocinera tradicional",
  "ventanilla digital tabasco",
];

const areasRegistro = [
  "economía social",
  "desarrollo comercial",
  "impulso y promoción de inversiones",
  "ferias y festivales",
  "desarrollo turístico",
  "planeación, evaluación turística y económica",
  "comisión estatal de mejora regulatoria",
  "unidad de información y tecnología",
];

// Utilidad para capitalizar solo la primera letra
const toSentenceCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const CompleteFormStep1: React.FC<CompleteFormProps> = ({
  formData,
  setFormData,
}) => {
  const insets = useSafeAreaInsets();
  const municipioRef = useRef<TriggerRef>(null);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    name: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const current = ((prev as any)[name] as string[]) || [];
      return {
        ...prev,
        [name]: checked
          ? [...current, value]
          : current.filter((v) => v !== value),
      };
    });
  };

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={{ gap: 16, width: "100%" }}>
        {/* Referido del Gobernador */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500 font-medium">
            ¿Referenciado del gobernador?
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Button
              variant={
                formData.referidoGobernador === "sí" ? "default" : "outline"
              }
              onPress={() =>
                setFormData((prev) => ({ ...prev, referidoGobernador: "sí" }))
              }
            >
              <Text>Sí</Text>
            </Button>
            <Button
              variant={
                formData.referidoGobernador === "no" ? "default" : "outline"
              }
              onPress={() =>
                setFormData((prev) => ({ ...prev, referidoGobernador: "no" }))
              }
            >
              <Text>No</Text>
            </Button>
          </View>
        </View>

        {/* Municipio */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">Municipio</Text>
          <Select
            value={
              formData.municipio
                ? {
                    label: toSentenceCase(formData.municipio),
                    value: formData.municipio,
                  }
                : undefined
            }
            onValueChange={(option: Option) => {
              if (option && option.value) {
                handleChange("municipio", option.value);
              }
            }}
          >
            <SelectTrigger
              ref={municipioRef}
              onTouchStart={() => {
                municipioRef.current?.open();
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
        </View>

        {/* Localidad */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">Localidad</Text>
          <Input
            placeholder="Ingresa la localidad"
            value={formData.localidad || ""}
            onChangeText={(val) => handleChange("localidad", val)}
          />
        </View>

        {/* Grupo Social */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500 font-medium">Grupo social</Text>
          <View style={{ gap: 12 }}>
            {gruposSociales.map((grupo) => {
              const checked = (formData.grupoSocial || []).includes(grupo);
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
        </View>

        {/* Teléfono */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">Teléfono</Text>
          <Input
            placeholder="Ingresa tu teléfono"
            value={formData.telefono || ""}
            onChangeText={(val) => handleChange("telefono", val)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Correo */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">Correo electrónico</Text>
          <Input
            placeholder="Ingresa tu correo"
            value={formData.correo || ""}
            onChangeText={(val) => handleChange("correo", val)}
            keyboardType="email-address"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export const CompleteFormStep2: React.FC<CompleteFormProps> = ({
  formData,
  setFormData,
}) => {
  const insets = useSafeAreaInsets();
  const tipoNegocioRef = useRef<TriggerRef>(null);
  const areaRegistroRef = useRef<TriggerRef>(null);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    name: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const current = ((prev as any)[name] as string[]) || [];
      return {
        ...prev,
        [name]: checked
          ? [...current, value]
          : current.filter((v) => v !== value),
      };
    });
  };

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={{ gap: 16, width: "100%" }}>
        {/* Negocio */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500 font-medium">
            ¿Cuenta con algún negocio?
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Button
              variant={formData.negocio === "sí" ? "default" : "outline"}
              onPress={() =>
                setFormData((prev) => ({ ...prev, negocio: "sí" }))
              }
            >
              <Text>Sí</Text>
            </Button>
            <Button
              variant={formData.negocio === "no" ? "default" : "outline"}
              onPress={() =>
                setFormData((prev) => ({ ...prev, negocio: "no" }))
              }
            >
              <Text>No</Text>
            </Button>
          </View>
        </View>

        {/* SAT */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500 font-medium">
            ¿Cuenta con registro ante el SAT?
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Button
              variant={formData.sat === "sí" ? "default" : "outline"}
              onPress={() => setFormData((prev) => ({ ...prev, sat: "sí" }))}
            >
              <Text>Sí</Text>
            </Button>
            <Button
              variant={formData.sat === "no" ? "default" : "outline"}
              onPress={() => setFormData((prev) => ({ ...prev, sat: "no" }))}
            >
              <Text>No</Text>
            </Button>
          </View>
        </View>

        {/* Tipo de Negocio */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">Tipo de negocio</Text>
          <Select
            value={
              formData.tipoNegocio
                ? {
                    label: toSentenceCase(formData.tipoNegocio),
                    value: formData.tipoNegocio,
                  }
                : undefined
            }
            onValueChange={(option: Option) => {
              if (option && option.value) {
                handleChange("tipoNegocio", option.value);
              }
            }}
          >
            <SelectTrigger
              ref={tipoNegocioRef}
              onTouchStart={() => {
                tipoNegocioRef.current?.open();
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
        </View>

        {/* Otro tipo de negocio */}
        {formData.tipoNegocio === "otro" && (
          <View style={{ gap: 8 }}>
            <Text className="text-typography-500">
              Especifica otro tipo de negocio
            </Text>
            <Input
              placeholder="Especifica el tipo de negocio"
              value={formData.otroTipoNegocio || ""}
              onChangeText={(val) => handleChange("otroTipoNegocio", val)}
            />
          </View>
        )}

        {/* Capacitación */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500 font-medium">
            ¿Te gustaría capacitarte en algunos de los siguientes temas?
          </Text>
          <View style={{ gap: 12 }}>
            {capacitaciones.map((tema) => {
              const checked = (formData.capacitacion || []).includes(tema);
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
          <Text className="text-typography-500">¿A qué se dedica?</Text>
          <Input
            placeholder="Describe tu ocupación"
            value={formData.ocupacion || ""}
            onChangeText={(val) => handleChange("ocupacion", val)}
          />
        </View>

        {/* Comentarios */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">
            Comentarios del encuestador
          </Text>
          <Input
            placeholder="Agrega comentarios"
            value={formData.comentarios || ""}
            onChangeText={(val) => handleChange("comentarios", val)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Diagnóstico */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500 font-medium">
            Diagnóstico del encuestador
          </Text>
          <View style={{ gap: 12 }}>
            {diagnosticos.map((diagnostico) => {
              const checked = (formData.diagnostico || []).includes(
                diagnostico
              );
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
                      handleCheckboxChange(
                        "diagnostico",
                        diagnostico,
                        !!isChecked
                      );
                    }}
                  />
                  <Label
                    htmlFor={`diagnostico-${diagnostico}`}
                    onPress={Platform.select({
                      native: () => {
                        handleCheckboxChange(
                          "diagnostico",
                          diagnostico,
                          !checked
                        );
                      },
                    })}
                  >
                    {toSentenceCase(diagnostico)}
                  </Label>
                </View>
              );
            })}
          </View>
        </View>

        {/* Área de Registro */}
        <View style={{ gap: 8 }}>
          <Text className="text-typography-500">Área que registra</Text>
          <Select
            value={
              formData.areaRegistro
                ? {
                    label: toSentenceCase(formData.areaRegistro),
                    value: formData.areaRegistro,
                  }
                : undefined
            }
            onValueChange={(option: Option) => {
              if (option && option.value) {
                handleChange("areaRegistro", option.value);
              }
            }}
          >
            <SelectTrigger
              ref={areaRegistroRef}
              onTouchStart={() => {
                areaRegistroRef.current?.open();
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
        </View>
      </View>
    </ScrollView>
  );
};
