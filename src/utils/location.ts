import { Alert, Platform } from "react-native";
import * as Location from "expo-location";

export const getCurrentLocation = async (): Promise<string> => {
  // Para web, usar navigator.geolocation
  if (Platform.OS === "web") {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      Alert.alert(
        "Error de Geolocalización",
        "La geolocalización no está disponible en este dispositivo."
      );
      reject("Geolocalización no disponible");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        resolve(locationString);
      },
      (error) => {
        let errorMessage = "Error al obtener la ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
        }
        Alert.alert("Error de Geolocalización", errorMessage);
        reject(errorMessage);
      },
      options
    );
  });
  }

  // Para móviles, usar expo-location
  try {
    // Solicitar permisos
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Se necesita permiso para acceder a la ubicación. Por favor, habilita los permisos de ubicación en la configuración de tu dispositivo."
      );
      throw new Error("Permiso de ubicación denegado");
    }

    // Obtener ubicación
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;
    const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    return locationString;
  } catch (error: any) {
    const errorMessage =
      error.message || "No se pudo obtener la ubicación. Verifica que los permisos de ubicación estén habilitados.";
    Alert.alert("Error de Geolocalización", errorMessage);
    throw error;
  }
};

// Función para obtener ubicación (sin fallback a mock)
export const getLocationWithFallback = async (): Promise<string> => {
  return await getCurrentLocation();
};
