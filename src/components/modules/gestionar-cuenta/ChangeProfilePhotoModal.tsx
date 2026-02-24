import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import { useAuth } from "@/src/providers/AuthProvider";
import { authService } from "@/src/services/auth";
import { filesService } from "@/src/services/files";
import { showImagePickerOptions } from "@/src/utils/imagePicker";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, View } from "react-native";

interface ChangeProfilePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChangeProfilePhotoModal({
  open,
  onOpenChange,
  onSuccess,
}: ChangeProfilePhotoModalProps) {
  const { setUser } = useAuth();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const handlePickImage = async () => {
    // Cerrar el modal antes de abrir el selector de imágenes
    setIsPickingImage(true);
    onOpenChange(false);

    // Pequeño delay para asegurar que el modal se cierre completamente
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const uri = await showImagePickerOptions();
      setIsPickingImage(false);

      if (uri) {
        setSelectedImageUri(uri);
        // Reabrir el modal con la imagen seleccionada después de un pequeño delay
        await new Promise((resolve) => setTimeout(resolve, 200));
        onOpenChange(true);
      } else {
        // Si el usuario canceló, reabrir el modal sin cambios
        await new Promise((resolve) => setTimeout(resolve, 200));
        onOpenChange(true);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      setIsPickingImage(false);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
      // Reabrir el modal en caso de error
      await new Promise((resolve) => setTimeout(resolve, 200));
      onOpenChange(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedImageUri) {
      Alert.alert("Error", "Por favor selecciona una imagen");
      return;
    }

    setIsUploading(true);
    try {
      // Subir imagen a Appwrite Storage
      const uploaded = await filesService.uploadImage({
        uri: selectedImageUri,
        name: `profile-${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      console.log("ChangeProfilePhotoModal - uploaded.url:", uploaded.url);
      console.log(
        "ChangeProfilePhotoModal - uploaded.filename (fileId):",
        uploaded.filename
      );

      // Actualizar foto de perfil en Appwrite (guardar URL y fileId)
      const updatedUser = await authService.updateProfilePhoto(
        uploaded.url,
        uploaded.filename
      );

      console.log("ChangeProfilePhotoModal - updatedUser:", updatedUser);
      console.log(
        "ChangeProfilePhotoModal - updatedUser.profilePhoto:",
        updatedUser.profilePhoto
      );

      // Actualizar directamente el estado del AuthProvider
      setUser(updatedUser);

      Alert.alert("Éxito", "Foto de perfil actualizada correctamente");
      setSelectedImageUri(null);
      onOpenChange(false);

      // Llamar a onSuccess para cualquier otra acción necesaria
      onSuccess?.();
    } catch (error: any) {
      console.error("Error al actualizar foto de perfil:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo actualizar la foto de perfil"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading && !isPickingImage) {
      setSelectedImageUri(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar foto de perfil</DialogTitle>
          <DialogDescription>
            Selecciona una nueva imagen para tu foto de perfil
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4">
          {selectedImageUri && (
            <View className="items-center">
              <Image
                source={{ uri: selectedImageUri }}
                style={{ width: 200, height: 200, borderRadius: 100 }}
                resizeMode="cover"
              />
            </View>
          )}

          <Button
            onPress={handlePickImage}
            disabled={isUploading}
            variant="outline"
          >
            <Text>
              {selectedImageUri ? "Cambiar imagen" : "Seleccionar imagen"}
            </Text>
          </Button>

          {selectedImageUri && (
            <Button
              onPress={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text>Subiendo...</Text>
                </View>
              ) : (
                <Text>Guardar</Text>
              )}
            </Button>
          )}
        </View>

        <DialogFooter>
          <Button
            variant="outline"
            onPress={handleClose}
            disabled={isUploading}
          >
            <Text>Cancelar</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
