import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import Monicon from "@monicon/native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface INEScannerCameraProps {
  onScan: (
    file: File | { uri: string; name: string; type: string },
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
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isIneAligned, setIsIneAligned] = useState(false);

  React.useEffect(() => {
    if (showCamera) {
      // Animación de pulso para el marco
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      setIsIneAligned(false);
    }
  }, [showCamera, pulseAnim]);

  const openCameraOrPicker = async () => {
    try {
      // En web, usar ImagePicker como fallback
      if (Platform.OS === "web") {
        const permissionResult =
          await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert(
            "Permiso de cámara requerido",
            "Esta aplicación necesita acceso a la cámara para tomar fotografías. Por favor, habilita el permiso en la configuración de tu navegador.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Abrir configuración",
                onPress: () => {
                  // En web, no podemos abrir configuración directamente
                  // pero podemos mostrar instrucciones
                  Alert.alert(
                    "Configuración del navegador",
                    "Por favor, ve a la configuración de tu navegador y habilita el permiso de cámara para este sitio."
                  );
                },
              },
            ]
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
          base64: false,
          aspect: [1.585, 1], // Proporción del INE
          exif: false,
        });

        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File([blob], "ine.jpg", { type: blob.type });
          onScan(file, setLoadingOCR, setFormData);
        }
        return;
      }

      // Para móviles, usar la cámara personalizada
      // Solicitar permisos de cámara explícitamente
      // Siempre solicitar el permiso para asegurarnos de que iOS lo registre
      let cameraPermission = permission;

      // Si no tenemos información del permiso o no está concedido, solicitarlo
      if (!cameraPermission || !cameraPermission.granted) {
        cameraPermission = await requestPermission();

        if (!cameraPermission.granted) {
          // El usuario denegó el permiso o no está disponible
          // En iOS, si el permiso fue denegado, aparecerá en Configuración
          Alert.alert(
            "Permiso de cámara requerido",
            "Esta aplicación necesita acceso a la cámara para tomar fotografías de documentos de identificación. Por favor, habilita el permiso en Configuración.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Abrir configuración",
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ]
          );
          return;
        }
      }

      setShowCamera(true);
    } catch (error) {
      console.error("Error al abrir cámara:", error);
      Alert.alert("Error", "No se pudo abrir la cámara");
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setShowCamera(false);

        if (Platform.OS === "web") {
          const response = await fetch(photo.uri);
          const blob = await response.blob();
          const file = new File([blob], "ine.jpg", { type: blob.type });
          onScan(file, setLoadingOCR, setFormData);
        } else {
          const file = {
            uri: photo.uri,
            name: "ine.jpg",
            type: "image/jpeg",
          };
          onScan(file, setLoadingOCR, setFormData);
        }
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const closeCamera = () => {
    setIsIneAligned(false);
    setShowCamera(false);
  };

  // Calcular dimensiones del overlay del INE
  // El INE tiene proporción aproximada de 8.56cm x 5.4cm (ratio ~1.585)
  const overlayWidth = SCREEN_WIDTH * 0.85;
  const overlayHeight = overlayWidth / 1.585;

  return (
    <>
      {renderButton ? (
        renderButton({ openCameraOrPicker })
      ) : (
        <View style={{ gap: 12, alignItems: "center" }}>
          <Image
            source={require("@/src/assets/images/ine-scan.gif")}
            style={{
              width: "100%",
              maxWidth: 400,
              height: 400,
              resizeMode: "contain",
            }}
          />
          <Button
            onPress={openCameraOrPicker}
            className="w-full"
            style={{
              height: 56,
              backgroundColor: "#9A1445",
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Monicon name="mdi:camera" size={20} color="white" />
            <Text
              className="text-base font-semibold"
              style={{ color: "white" }}
            >
              Escanear INE
            </Text>
          </Button>
        </View>
      )}

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            mode="picture"
          />

          {/* Overlay del INE - Fuera del CameraView con flexbox */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              paddingTop: Platform.OS === "ios" ? 50 : 30,
              paddingBottom: Platform.OS === "ios" ? 50 : 30,
            }}
          >
            {/* Instrucciones - Parte superior */}
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  maxWidth: 280,
                  borderWidth: 1,
                  borderColor: "rgba(154, 20, 69, 0.3)",
                }}
              >
                <Monicon
                  name="mdi:card-account-details"
                  size={24}
                  color="#fff"
                />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginTop: 8,
                    marginBottom: 8,
                    textShadowColor: "rgba(0, 0, 0, 0.75)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Coloca tu INE dentro del marco
                </Text>
                <View
                  style={{
                    width: "100%",
                    gap: 4,
                    flexDirection: "row",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#9A1445",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </Text>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        opacity: 0.85,
                      }}
                    >
                      Buena iluminación
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#9A1445",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </Text>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        opacity: 0.85,
                      }}
                    >
                      Sin reflejos
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#9A1445",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </Text>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        opacity: 0.85,
                      }}
                    >
                      Toda la tarjeta visible
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Marco del INE con animación - Parte central */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Animated.View
                style={{
                  borderWidth: 4,
                  borderRadius: 12,
                  backgroundColor: "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                  elevation: 10,
                  borderColor: isIneAligned ? "#22c55e" : "#9A1445",
                  shadowColor: isIneAligned ? "#22c55e" : "#9A1445",
                  width: overlayWidth + 30,
                  height: overlayHeight + 30,
                  transform: [{ scale: pulseAnim }],
                }}
              >
                {/* Borde brillante del marco */}
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isIneAligned
                      ? "rgba(34, 197, 94, 0.5)"
                      : "rgba(154, 20, 69, 0.3)",
                  }}
                />

                {/* Esquinas decorativas mejoradas */}
                <View
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    top: 5,
                    left: 5,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      width: 30,
                      height: 30,
                      borderTopWidth: 4,
                      borderLeftWidth: 4,
                      borderColor: isIneAligned ? "#22c55e" : "#9A1445",
                    }}
                  />
                </View>
                <View
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    top: 5,
                    right: -5,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      width: 30,
                      height: 30,
                      borderTopWidth: 4,
                      borderRightWidth: 4,
                      borderColor: isIneAligned ? "#22c55e" : "#9A1445",
                    }}
                  />
                </View>
                <View
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    bottom: -2,
                    left: 5,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      width: 30,
                      height: 30,
                      borderBottomWidth: 4,
                      borderLeftWidth: 4,
                      borderColor: isIneAligned ? "#22c55e" : "#9A1445",
                    }}
                  />
                </View>
                <View
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    bottom: -2,
                    right: -2,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      width: 30,
                      height: 30,
                      borderBottomWidth: 4,
                      borderRightWidth: 4,
                      borderColor: isIneAligned ? "#22c55e" : "#9A1445",
                    }}
                  />
                </View>

                {/* Guías de alineación */}
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: isIneAligned
                      ? "rgba(34, 197, 94, 0.5)"
                      : "rgba(154, 20, 69, 0.3)",
                    top: "20%",
                    left: 0,
                    right: 0,
                    height: 1,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: isIneAligned
                      ? "rgba(34, 197, 94, 0.5)"
                      : "rgba(154, 20, 69, 0.3)",
                    bottom: "20%",
                    left: 0,
                    right: 0,
                    height: 1,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: isIneAligned
                      ? "rgba(34, 197, 94, 0.5)"
                      : "rgba(154, 20, 69, 0.3)",
                    left: "20%",
                    top: 0,
                    bottom: 0,
                    width: 1,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: isIneAligned
                      ? "rgba(34, 197, 94, 0.5)"
                      : "rgba(154, 20, 69, 0.3)",
                    right: "20%",
                    top: 0,
                    bottom: 0,
                    width: 1,
                  }}
                />

                {/* Indicador de alineación exitosa */}
                {isIneAligned && (
                  <View
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: [{ translateX: -24 }, { translateY: -24 }],
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      borderRadius: 50,
                      width: 100,
                      height: 100,
                      borderWidth: 3,
                      borderColor: "#22c55e",
                    }}
                  >
                    <Monicon
                      name="mdi:check-circle"
                      size={48}
                      color="#22c55e"
                    />
                    <Text
                      style={{
                        color: "#22c55e",
                        fontSize: 12,
                        fontWeight: "bold",
                        marginTop: 4,
                        textShadowColor: "rgba(0, 0, 0, 0.75)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      ¡Perfecto!
                    </Text>
                  </View>
                )}
              </Animated.View>
            </View>

            {/* Controles de la cámara - Parte inferior */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                paddingHorizontal: 40,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
                onPress={closeCamera}
                activeOpacity={0.7}
              >
                <Monicon name="mdi:close" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={takePicture}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 5,
                    borderColor: "#9A1445",
                    shadowColor: "#9A1445",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "#9A1445",
                    }}
                  />
                </View>
              </TouchableOpacity>

              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  }}
                  onPress={() =>
                    setFacing((current) =>
                      current === "back" ? "front" : "back"
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Monicon name="mdi:camera-flip" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
