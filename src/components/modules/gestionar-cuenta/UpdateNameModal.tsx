import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Text } from "@/src/components/ui/text";
import { authService } from "@/src/services/auth";
import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

interface UpdateNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSuccess?: () => void;
}

export function UpdateNameModal({
  open,
  onOpenChange,
  currentName,
  onSuccess,
}: UpdateNameModalProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }

    if (name.trim() === currentName) {
      Alert.alert("Info", "No has realizado cambios");
      return;
    }

    setIsLoading(true);
    try {
      await authService.updateName(name.trim());
      Alert.alert("Éxito", "Nombre actualizado correctamente");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al actualizar nombre:", error);
      Alert.alert("Error", error.message || "No se pudo actualizar el nombre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName(currentName);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar nombre</DialogTitle>
          <DialogDescription>
            Ingresa tu nuevo nombre completo
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4">
          <View className="gap-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Ingresa tu nombre completo"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={handleClose} disabled={isLoading}>
            <Text>Cancelar</Text>
          </Button>
          <Button onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <Text>Guardando...</Text>
              </View>
            ) : (
              <Text>Guardar</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
