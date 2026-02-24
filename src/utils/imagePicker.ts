import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";

export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
};

export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
};

export const pickImageFromCamera = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        "Permiso de cámara requerido",
        "Esta aplicación necesita acceso a la cámara para tomar fotografías. Por favor, habilita el permiso en Configuración.",
        [
          { text: "Cancelar", style: "cancel" },
          ...(Platform.OS !== "web"
            ? [
                {
                  text: "Abrir configuración",
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ]
            : []),
        ]
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error al tomar foto:", error);
    Alert.alert("Error", "No se pudo tomar la foto.");
    return null;
  }
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();

    if (!hasPermission) {
      Alert.alert(
        "Permiso de galería requerido",
        "Esta aplicación necesita acceso a tu galería para seleccionar imágenes. Por favor, habilita el permiso en Configuración.",
        [
          { text: "Cancelar", style: "cancel" },
          ...(Platform.OS !== "web"
            ? [
                {
                  text: "Abrir configuración",
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ]
            : []),
        ]
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
      exif: false,
      allowsMultipleSelection: false, // Mantenemos una imagen a la vez
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error al seleccionar imagen:", error);
    Alert.alert("Error", "No se pudo seleccionar la imagen.");
    return null;
  }
};

export const showImagePickerOptions = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert("Seleccionar Imagen", "¿Cómo deseas agregar la imagen?", [
      {
        text: "Cámara",
        onPress: async () => {
          const uri = await pickImageFromCamera();
          resolve(uri);
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const uri = await pickImageFromGallery();
          resolve(uri);
        },
      },
      {
        text: "Cancelar",
        style: "cancel",
        onPress: () => resolve(null),
      },
    ]);
  });
};

// Función simplificada que abre directamente la cámara (como en INEScannerCamera)
export const openCameraDirectly = async (): Promise<string | null> => {
  try {
    // Solicitar permiso explícitamente
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      // Si el permiso fue denegado, mostrar alerta con opción de ir a configuración
      Alert.alert(
        "Permiso de cámara requerido",
        "Esta aplicación necesita acceso a la cámara para tomar fotografías. Por favor, habilita el permiso en Configuración.",
        [
          { text: "Cancelar", style: "cancel" },
          ...(Platform.OS !== "web"
            ? [
                {
                  text: "Abrir configuración",
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ]
            : []),
        ]
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: false,
      aspect: [4, 3],
      exif: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error al abrir cámara", error);
    Alert.alert("Ocurrió un error al abrir la cámara");
    return null;
  }
};

// Función específica para web que permite selección múltiple
export const pickImagesForWeb = async (
  maxImages: number = 3
): Promise<string[]> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();

    if (!hasPermission) {
      Alert.alert(
        "Permiso de galería requerido",
        "Esta aplicación necesita acceso a tu galería para seleccionar imágenes. Por favor, habilita el permiso en Configuración.",
        [
          { text: "Cancelar", style: "cancel" },
          ...(Platform.OS !== "web"
            ? [
                {
                  text: "Abrir configuración",
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ]
            : []),
        ]
      );
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // En web, no editamos para permitir múltiples
      quality: 0.8,
      base64: false,
      exif: false,
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets.map((asset) => asset.uri);
    }

    return [];
  } catch (error) {
    console.error("Error al seleccionar imágenes:", error);
    Alert.alert("Error", "No se pudieron seleccionar las imágenes.");
    return [];
  }
};
