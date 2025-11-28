import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import Monicon from "@monicon/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Platform } from "react-native";

interface INEScannerCameraProps {
  onScan: (
    file: File,
    setLoading: (val: boolean) => void,
    setFormData: (data: any) => void
  ) => void;
  setLoadingOCR: (val: boolean) => void;
  setFormData: (data: any) => void;
  renderButton?: (props: { openCameraOrPicker: () => void }) => React.ReactNode;
}

export const INEScannerCamera: React.FC<INEScannerCameraProps> = ({
  onScan,
  setLoadingOCR,
  setFormData,
  renderButton,
}) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const openCameraOrPicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permiso de cámara requerido");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.3, // 🔽 captura directamente con baja calidad (0 a 1)
        base64: false,
        aspect: [4, 3], // opcional
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setPreviewUri(asset.uri);

        if (Platform.OS === "web") {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File([blob], "ine.jpg", { type: blob.type });
          onScan(file, setLoadingOCR, setFormData);
        } else {
          // Solo manda la URI en móviles; conviértelo en backend si es necesario
          const file = {
            uri: asset.uri,
            name: "ine.jpg",
            type: "image/jpeg",
          };
          onScan(file as any, setLoadingOCR, setFormData); // Puedes adaptar el tipo de archivo según el flujo móvil
        }
      }
    } catch (error) {
      console.error("Error al abrir cámara o seleccionar imagen", error);
      alert("Ocurrió un error");
    }
  };

  return (
    <Button
      onPress={openCameraOrPicker}
      className="w-full bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80 shadow-lg"
      style={{
        height: 80,
      }}
    >
      <Monicon name="mdi:camera" size={24} color="white" />
      <Text className="text-lg font-semibold">Escanear INE</Text>
    </Button>
  );
};
