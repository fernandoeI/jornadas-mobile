import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Pressable, View } from "react-native";

const SUGGESTIONS = [
  "Público en general",
  "Mujeres",
  "Jóvenes",
  "Personas adultas mayores",
  "Personas con discapacidad",
  "Emprendedores y comerciantes",
  "Prestadores de servicios turísticos",
];

export function TargetAudienceBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="gap-3 rounded-xl border border-border p-4">
      <View>
        <Text className="font-bold">Población objetivo *</Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          Selecciona una opción como base o describe con precisión quién puede solicitarlo.
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => {
          const selected = value.trim() === suggestion;
          return (
            <Pressable
              key={suggestion}
              onPress={() => onChange(suggestion)}
              className={`rounded-full border px-3 py-2 ${selected ? "border-primary bg-primary/10" : "border-border bg-background"}`}
            >
              <Text className={selected ? "text-primary" : "text-foreground"}>
                {suggestion}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="gap-1">
        <Text className="text-sm font-medium">Descripción de la población</Text>
        <Input
          value={value}
          onChangeText={onChange}
          placeholder="Ej. Mujeres mayores de 18 años residentes en Tabasco que tengan un negocio"
        />
        <Text className="text-xs text-muted-foreground">
          Este texto se mostrará en la sección “¿Para quién aplica?” del trámite.
        </Text>
      </View>
    </View>
  );
}
