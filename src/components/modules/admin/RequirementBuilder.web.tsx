import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import type { ServiceRequirementInput } from "@/src/services/admin";
import { Pressable, View } from "react-native";

export function RequirementBuilder({ requirements, onChange }: {
  requirements: ServiceRequirementInput[];
  onChange: (requirements: ServiceRequirementInput[]) => void;
}) {
  const updateName = (index: number, name: string) =>
    onChange(requirements.map((item, i) => i === index ? { ...item, name } : item));
  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= requirements.length) return;
    const next = [...requirements];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  };

  return (
    <View className="gap-3 rounded-xl border border-border p-4">
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <Text className="font-bold">Requisitos informativos</Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Agrega las etiquetas que verá el solicitante. Esta sección no solicita ni carga archivos.
          </Text>
        </View>
        <Button variant="outline" onPress={() => onChange([...requirements, { name: "", required: true }])}>
          <Text>+ Agregar requisito</Text>
        </Button>
      </View>

      {requirements.map((item, index) => (
        <View key={index} className="gap-3 rounded-xl bg-muted/50 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold">Requisito {index + 1}</Text>
            <View className="flex-row items-center gap-2">
              <Pressable disabled={!index} onPress={() => move(index, -1)} className="rounded border border-border px-2 py-1">
                <Text className={!index ? "text-muted-foreground" : ""}>↑</Text>
              </Pressable>
              <Pressable disabled={index === requirements.length - 1} onPress={() => move(index, 1)} className="rounded border border-border px-2 py-1">
                <Text className={index === requirements.length - 1 ? "text-muted-foreground" : ""}>↓</Text>
              </Pressable>
              <Pressable onPress={() => onChange(requirements.filter((_, i) => i !== index))}>
                <Text className="text-sm text-destructive">Eliminar</Text>
              </Pressable>
            </View>
          </View>
          <View className="gap-1">
            <Text className="text-sm font-medium">Etiqueta *</Text>
            <Input value={item.name} onChangeText={(name) => updateName(index, name)} placeholder="Ej. INE vigente" />
          </View>
        </View>
      ))}

      {!requirements.length ? (
        <Text className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
          Aún no hay requisitos informativos.
        </Text>
      ) : null}
    </View>
  );
}
