import { FormHeader } from "@/src/components/common";
import {
  CompleteFormStep1,
  CompleteFormStep2,
  INEForm,
  INEScannerCamera,
} from "@/src/components/modules";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { authService } from "@/src/services/auth";
import { jornadasService } from "@/src/services/jornadas";

import { INEScanResult, processINE } from "@/src/utils/functions";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, ScrollView, View } from "react-native";

// Tipo para los datos del formulario completo
interface CompleteFormData {
  referidoGobernador?: string;
  municipio?: string;
  localidad?: string;
  grupoSocial?: string[];
  telefono?: string;
  correo?: string;
  negocio?: string;
  sat?: string;
  tipoNegocio?: string;
  otroTipoNegocio?: string;
  capacitacion?: string[];
  ocupacion?: string;
  comentarios?: string;
  diagnostico?: string[];
  areaRegistro?: string;
}

// Tipo para crear jornada con INE
interface CreateJornadaWithINEDto {
  // Datos de la INE
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  direccion: string;
  genero: string;
  edad: string;
  curp: string;

  // Datos del formulario completo
  referidoGobernador: string;
  municipio: string;
  localidad: string;
  grupoSocial: string[];
  telefono: string;
  correo: string;
  negocio: string;
  sat: string;
  tipoNegocio: string;
  otroTipoNegocio: string;
  capacitacion: string[];
  ocupacion: string;
  comentarios: string;
  diagnostico: string[];
  areaRegistro: string;

  // Archivo INE
  ineFile: File | { uri: string; name: string; type: string };
}

const AgregarSeguimiento = () => {
  const [step, setStep] = useState(0);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState<Partial<INEScanResult>>({});
  const [completeFormData, setCompleteFormData] = useState<CompleteFormData>(
    {}
  );
  const [showImage, setShowImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Verificar autenticación al cargar
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      Alert.alert("No autenticado", "Debes iniciar sesión para continuar", [
        {
          text: "OK",
          onPress: () => {
            // Redirigir al login
            // router.push("/login");
          },
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (loadingOCR) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [loadingOCR, rotateAnim]);

  const getImageUri = () => {
    if (formData.ine) {
      if (typeof formData.ine === "string") {
        return formData.ine;
      }
      if (formData.ine instanceof File) {
        return URL.createObjectURL(formData.ine);
      }
      if (typeof formData.ine === "object" && "uri" in formData.ine) {
        return (formData.ine as any).uri;
      }
    }
    return null;
  };

  const imageUri = getImageUri();

  const handleScan = async (
    file: File | { uri: string; name: string; type: string },
    setLoading: (val: boolean) => void,
    setFormDataFromScan: (data: {
      nombre: string;
      primerApellido: string;
      segundoApellido?: string;
      direccion?: string;
      genero?: string;
      edad?: string;
      curp: string;
      ine?: File | { uri: string; name: string; type: string };
    }) => void
  ) => {
    console.log("🔍 Iniciando proceso de escaneo...");
    console.log("📁 Archivo recibido:", file);

    setLoadingOCR(true);
    setError(null);

    try {
      console.log("🔄 Procesando imagen con OCR...");
      const result = await processINE(file);

      if (!result) {
        setError(
          "No se pudo leer la INE. Asegúrate de que la imagen sea clara y legible."
        );
        setLoadingOCR(false);
        return;
      }

      console.log("✅ Resultado del OCR:", result);
      setFormDataFromScan(result);
      setStep(1);
      console.log("✅ Proceso completado exitosamente");
    } catch (err) {
      console.error("❌ Error durante el procesamiento:", err);
      setError(
        "Error durante el procesamiento de la imagen. Verifica que la imagen sea clara."
      );
    } finally {
      setLoadingOCR(false);
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!authService.isAuthenticated()) {
      Alert.alert("Error", "Debes iniciar sesión para continuar");
      return;
    }

    setLoadingSubmit(true);
    setError(null);

    try {
      // Validar datos requeridos
      if (!formData.nombre || !formData.primerApellido || !formData.curp) {
        throw new Error("Faltan datos básicos de la INE");
      }

      if (!completeFormData.areaRegistro) {
        throw new Error("Debes seleccionar un área de registro");
      }

      // Preparar datos para el backend
      const jornadaData: CreateJornadaWithINEDto = {
        // Datos de la INE
        nombre: formData.nombre!,
        primerApellido: formData.primerApellido!,
        segundoApellido: formData.segundoApellido || "",
        direccion: formData.direccion || "",
        genero: formData.genero || "no binaria",
        edad: formData.edad || "",
        curp: formData.curp!,

        // Datos del formulario completo
        referidoGobernador: completeFormData.referidoGobernador || "No",
        municipio: completeFormData.municipio || "",
        localidad: completeFormData.localidad || "",
        grupoSocial: completeFormData.grupoSocial || [],
        telefono: completeFormData.telefono || "",
        correo: completeFormData.correo || "",
        negocio: completeFormData.negocio || "No",
        sat: completeFormData.sat || "No",
        tipoNegocio: completeFormData.tipoNegocio || "",
        otroTipoNegocio: completeFormData.otroTipoNegocio || "",
        capacitacion: completeFormData.capacitacion || [],
        ocupacion: completeFormData.ocupacion || "",
        comentarios: completeFormData.comentarios || "",
        diagnostico: completeFormData.diagnostico || [],
        areaRegistro: completeFormData.areaRegistro!,

        // Archivo INE
        ineFile: formData.ine!,
      };

      console.log("📤 Enviando jornada al backend:", jornadaData);

      // Crear jornada con INE
      if (formData.ine instanceof File) {
        const result = await jornadasService.createWithINE(
          jornadaData,
          formData.ine
        );
        console.log("✅ Jornada creada exitosamente:", result);
      } else {
        throw new Error("El archivo INE debe ser un archivo válido");
      }

      Alert.alert("¡Éxito!", "La jornada se ha registrado correctamente", [
        {
          text: "OK",
          onPress: () => {
            // Resetear formulario y volver al inicio
            setFormData({});
            setCompleteFormData({});
            setStep(0);
            setError(null);
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Error enviando jornada:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(`Error al enviar la jornada: ${errorMessage}`);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return "Escaneo de INE";
      case 1:
        return "Datos de INE";
      case 2:
        return "Información Adicional";
      case 3:
        return "Confirmación";
      default:
        return "Formulario";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0:
        return "Escanea la parte frontal de tu INE";
      case 1:
        return "Verifica y completa los datos de tu INE";
      case 2:
        return "Completa la información adicional requerida";
      case 3:
        return "Revisa y confirma toda la información";
      default:
        return "Completa el formulario";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 0:
        return "mdi:camera";
      case 1:
        return "mdi:card-account-details";
      case 2:
        return "mdi:clipboard-text";
      case 3:
        return "mdi:check-circle";
      default:
        return "mdi:form";
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 0:
        return !!formData.ine;
      case 1:
        return !!(formData.nombre && formData.primerApellido && formData.curp);
      case 2:
        return !!completeFormData.areaRegistro;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <View>
      <FormHeader
        step={step}
        totalSteps={4}
        title={getStepTitle()}
        description={getStepDescription()}
        icon={getStepIcon()}
        directionName="Formulario General"
        backRoute="/main"
      />

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Mostrar error si existe */}
          {error && (
            <View>
              <Text className="text-red-600 font-medium">Error</Text>
              <Text className="text-red-500 text-sm">{error}</Text>
            </View>
          )}

          {/* Contenido del paso */}
          {step === 0 ? (
            <View>
              <View>
                <View>
                  {/* Image component - using placeholder */}
                  <View
                    style={{
                      width: 384,
                      height: 384,
                      alignSelf: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F5F5F5",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#999" }}>GIF de escaneo INE</Text>
                  </View>
                </View>

                <View>
                  <Text className="text-xl font-bold text-typography-900 text-center">
                    Escanea la parte frontal de tu INE
                  </Text>
                  <Text className="text-center text-typography-600 text-base leading-relaxed">
                    Asegúrate de que la imagen sea clara y legible. Coloca la
                    INE sobre una superficie plana y bien iluminada, y escanea
                    la parte frontal.
                  </Text>
                </View>

                <INEScannerCamera
                  onScan={handleScan}
                  setLoadingOCR={setLoadingOCR}
                  setFormData={setFormData}
                />
              </View>
            </View>
          ) : step === 1 ? (
            <View>
              <INEForm
                formData={formData}
                setFormData={setFormData}
                imageUri={imageUri}
                showImage={showImage}
                setShowImage={setShowImage}
              />
            </View>
          ) : step === 2 ? (
            <View>
              <CompleteFormStep1
                formData={completeFormData}
                setFormData={setCompleteFormData}
              />
            </View>
          ) : (
            <View>
              <CompleteFormStep2
                formData={completeFormData}
                setFormData={setCompleteFormData}
              />
            </View>
          )}

          {/* Botones de navegación */}
          <View>
            <View style={{ flexDirection: "row" }}>
              <Button
                variant="outline"
                onPress={handlePreviousStep}
                disabled={step === 0}
                className="flex-1"
              >
                <Text>Anterior</Text>
              </Button>

              {step < 3 ? (
                <Button
                  onPress={handleNextStep}
                  disabled={!canGoNext() || loadingOCR}
                  className="flex-1 bg-[#9A1445]"
                >
                  <Text>Siguiente</Text>
                </Button>
              ) : (
                <Button
                  onPress={handleSubmit}
                  disabled={!canGoNext() || loadingSubmit}
                  className="flex-1 bg-[#9A1445]"
                >
                  <Text>
                    {loadingSubmit ? "Enviando..." : "Enviar Jornada"}
                  </Text>
                </Button>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal para mostrar imagen - usando placeholder */}
      {showImage && imageUri && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 16,
              width: "90%",
              maxHeight: "80%",
            }}
          >
            <Button
              onPress={() => setShowImage(false)}
              style={{ marginBottom: 16 }}
            >
              <Text>Cerrar</Text>
            </Button>
            {/* Image component - using placeholder */}
            <View
              style={{
                width: "100%",
                height: 256,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#999" }}>
                Imagen INE: {imageUri.substring(0, 50)}...
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AgregarSeguimiento;
