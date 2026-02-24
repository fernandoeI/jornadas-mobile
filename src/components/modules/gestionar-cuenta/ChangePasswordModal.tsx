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
import { Monicon } from "@monicon/native";
import { Alert, ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
  onSuccess,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son requeridos");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert("Error", "La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setIsLoading(true);
    try {
      await authService.updatePassword(oldPassword, newPassword);
      Alert.alert("Éxito", "Contraseña actualizada correctamente");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al actualizar contraseña:", error);
      let errorMessage = "No se pudo actualizar la contraseña";
      
      if (error.message?.includes("Invalid credentials") || error.message?.includes("invalid")) {
        errorMessage = "La contraseña actual es incorrecta";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y la nueva contraseña
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4">
          <View className="gap-1.5">
            <Label htmlFor="oldPassword">Contraseña actual</Label>
            <View style={{ position: "relative" }}>
              <Input
                id="oldPassword"
                placeholder="Ingresa tu contraseña actual"
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
                editable={!isLoading}
                className="pr-12"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Monicon
                  name={showOldPassword ? "mdi:eye-off" : "mdi:eye"}
                  size={20}
                  color="#981646"
                />
              </Pressable>
            </View>
          </View>

          <View className="gap-1.5">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <View style={{ position: "relative" }}>
              <Input
                id="newPassword"
                placeholder="Ingresa tu nueva contraseña"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!isLoading}
                className="pr-12"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Monicon
                  name={showNewPassword ? "mdi:eye-off" : "mdi:eye"}
                  size={20}
                  color="#981646"
                />
              </Pressable>
            </View>
          </View>

          <View className="gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <View style={{ position: "relative" }}>
              <Input
                id="confirmPassword"
                placeholder="Confirma tu nueva contraseña"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
                className="pr-12"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Monicon
                  name={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                  size={20}
                  color="#981646"
                />
              </Pressable>
            </View>
          </View>
        </View>

        <DialogFooter>
          <Button
            variant="outline"
            onPress={handleClose}
            disabled={isLoading}
          >
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

const styles = StyleSheet.create({
  eyeButton: {
    position: "absolute",
    right: 8,
    top: "40%",
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 1,
  },
});

