import { Alert } from "react-native";

export const getCurrentLocation = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Verificar si la geolocalización está disponible
    if (!navigator.geolocation) {
      Alert.alert(
        "Error de Geolocalización",
        "La geolocalización no está disponible en este dispositivo."
      );
      reject("Geolocalización no disponible");
      return;
    }

    // Configurar opciones de geolocalización
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    // Obtener la ubicación actual
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(
          6
        )}`;
        console.log("Ubicación obtenida:", locationString);
        resolve(locationString);
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
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
};

// Función para obtener ubicación con fallback a coordenadas mock
export const getLocationWithFallback = async (): Promise<string> => {
  try {
    const location = await getCurrentLocation();
    return location;
  } catch (error) {
    // Coordenadas mock como fallback
    const mockLocation = "19.4326, -99.1332"; // Coordenadas de ejemplo
    console.log("Usando ubicación mock:", mockLocation);
    return mockLocation;
  }
};
