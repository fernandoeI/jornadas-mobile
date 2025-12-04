import { FormHeader } from "@/src/components/common";
import {
  DatosEmprendimiento,
  DatosSolicitante,
  Direccion,
  InformacionSocial,
  SuccessModal,
} from "@/src/components/modules/economia-social";
import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { useEconomiaSocialForm } from "@/src/forms/useEconomiaSocialForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EconomiaSocialScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const primaryColor = THEME[colorScheme].primary;
  const secondaryColor = THEME[colorScheme].secondary;
  const mutedColor = THEME[colorScheme].muted;
  const backgroundColor = THEME[colorScheme].background;
  const opacity = colorScheme === "dark" ? 0.1 : 0.05;
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    values,
    errors,
    step,
    contentInsets,
    estadoCivilRef,
    entidadNacimientoRef,
    municipioRef,
    localidadRef,
    asentamientoTipoRef,
    vialidadTipoRef,
    comprobanteDomicilioRef,
    grupoIndigenaRef,
    lenguaIndigenaRef,
    negocioUbicacionRef,
    negocioAntiguedadRef,
    negocioGananciaRef,
    negocioGiroRef,
    beneficioTandaRef,
    destinoRecursoRef,
    getStepTitle,
    getStepDescription,
    getStepIcon,
    goToNextStep,
    goToPreviousStep,
    showSuccessModal,
    folio,
    handleCloseModal,
    handleAddNew,
  } = useEconomiaSocialForm();

  const handleCancel = () => {
    router.push("/(protected)/(tabs)/home");
  };

  // Ref para acceder a la función de validación del componente Direccion
  const direccionValidateRef = useRef<(() => Promise<void>) | null>(null);

  // Función para manejar el siguiente paso con validación
  const handleNextWithValidation = async () => {
    if (step === 1 && direccionValidateRef.current) {
      // Si estamos en el step de dirección, usar la función de validación de teléfono
      await direccionValidateRef.current();
    } else {
      // En otros steps, validar y avanzar
      await goToNextStep();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-background" style={{ position: "relative" }}>
        {/* Formas decorativas orgánicas de fondo */}
        {/* Forma orgánica 1 - Esquina superior derecha */}
        <View
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 350,
            height: 380,
            borderRadius: 200,
            borderTopLeftRadius: 50,
            borderBottomRightRadius: 250,
            backgroundColor: primaryColor,
            opacity,
            transform: [{ rotate: "-15deg" }],
          }}
        />
        {/* Forma orgánica 2 - Lado izquierdo */}
        <View
          style={{
            position: "absolute",
            top: 180,
            left: -100,
            width: 320,
            height: 280,
            borderRadius: 180,
            borderTopRightRadius: 80,
            borderBottomLeftRadius: 200,
            backgroundColor: secondaryColor,
            opacity,
            transform: [{ rotate: "25deg" }],
          }}
        />
        {/* Forma orgánica 3 - Esquina inferior derecha */}
        <View
          style={{
            position: "absolute",
            bottom: 150,
            right: -120,
            width: 450,
            height: 420,
            borderRadius: 250,
            borderTopLeftRadius: 150,
            borderBottomRightRadius: 300,
            backgroundColor: primaryColor,
            opacity: opacity * 0.7,
            transform: [{ rotate: "20deg" }],
          }}
        />
        {/* Forma orgánica 4 - Esquina inferior izquierda */}
        <View
          style={{
            position: "absolute",
            bottom: -180,
            left: -70,
            width: 400,
            height: 380,
            borderRadius: 220,
            borderTopRightRadius: 200,
            borderBottomLeftRadius: 100,
            backgroundColor: secondaryColor,
            opacity: opacity * 0.8,
            transform: [{ rotate: "-30deg" }],
          }}
        />
        {/* Forma orgánica 5 - Centro derecho */}
        <View
          style={{
            position: "absolute",
            top: SCREEN_HEIGHT * 0.35,
            right: SCREEN_WIDTH * 0.15,
            width: 220,
            height: 200,
            borderRadius: 120,
            borderTopLeftRadius: 60,
            borderBottomRightRadius: 140,
            backgroundColor: mutedColor,
            opacity: opacity * 1.2,
            transform: [{ rotate: "45deg" }],
          }}
        />
        {/* Forma orgánica 6 - Centro superior */}
        <View
          style={{
            position: "absolute",
            top: SCREEN_HEIGHT * 0.15,
            left: SCREEN_WIDTH * 0.4,
            width: 180,
            height: 160,
            borderRadius: 100,
            borderTopRightRadius: 80,
            borderBottomLeftRadius: 90,
            backgroundColor: primaryColor,
            opacity: opacity * 0.6,
            transform: [{ rotate: "-20deg" }],
          }}
        />

        <FormHeader
          step={step}
          totalSteps={4}
          title={getStepTitle()}
          description={getStepDescription()}
          icon={getStepIcon()}
          directionName="Economía Social"
          backRoute="/home"
        />

        <ScrollView
          className="flex-1 px-6 pb-6 bg-transparent"
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 1 }}
          contentContainerStyle={
            Platform.OS !== "web"
              ? {
                  paddingBottom: insets.bottom + 16 + 56 + 16 + 16,
                }
              : undefined
          }
          scrollEventThrottle={16}
        >
          <View className="gap-6 w-full max-w-[672px] mx-auto">
            {step === 0 && (
              <DatosSolicitante
                control={control}
                errors={errors}
                values={values}
                setValue={setValue}
                trigger={trigger}
                estadoCivilRef={estadoCivilRef}
                entidadNacimientoRef={entidadNacimientoRef}
                contentInsets={contentInsets}
                onCancel={handleCancel}
                onNext={handleNextWithValidation}
                showButtons={Platform.OS === "web"}
              />
            )}

            {step === 1 && (
              <Direccion
                control={control}
                errors={errors}
                values={values}
                setValue={setValue}
                municipioRef={municipioRef}
                localidadRef={localidadRef}
                asentamientoTipoRef={asentamientoTipoRef}
                vialidadTipoRef={vialidadTipoRef}
                comprobanteDomicilioRef={comprobanteDomicilioRef}
                contentInsets={contentInsets}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
                showButtons={Platform.OS === "web"}
                validateAndNextRef={direccionValidateRef}
              />
            )}

            {step === 2 && (
              <InformacionSocial
                control={control}
                errors={errors}
                values={values}
                setValue={setValue}
                grupoIndigenaRef={grupoIndigenaRef}
                lenguaIndigenaRef={lenguaIndigenaRef}
                contentInsets={contentInsets}
                onBack={goToPreviousStep}
                onNext={handleNextWithValidation}
                showButtons={Platform.OS === "web"}
              />
            )}

            {step === 3 && (
              <DatosEmprendimiento
                control={control}
                errors={errors}
                values={values}
                setValue={setValue}
                negocioUbicacionRef={negocioUbicacionRef}
                negocioAntiguedadRef={negocioAntiguedadRef}
                negocioGananciaRef={negocioGananciaRef}
                negocioGiroRef={negocioGiroRef}
                beneficioTandaRef={beneficioTandaRef}
                destinoRecursoRef={destinoRecursoRef}
                contentInsets={contentInsets}
                onBack={goToPreviousStep}
                onSubmit={handleSubmit}
                showButtons={Platform.OS === "web"}
              />
            )}
          </View>
        </ScrollView>

        {/* Botones fijos en móvil */}
        {Platform.OS !== "web" && (
          <View
            className="absolute bottom-0 left-0 right-0 flex-row gap-4 px-6 border-t border-black/10"
            style={{
              zIndex: 10,
              backgroundColor,
              paddingBottom: insets.bottom,
              paddingTop: 16,
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }
                : {
                    elevation: 8,
                  }),
            }}
          >
            {step === 0 ? (
              <>
                <Button
                  variant="outline"
                  onPress={handleCancel}
                  className="flex-1"
                >
                  <Text>Cancelar</Text>
                </Button>
                <Button onPress={handleNextWithValidation} className="flex-1">
                  <Text>Siguiente</Text>
                </Button>
              </>
            ) : step === 3 ? (
              <>
                <Button
                  variant="outline"
                  onPress={goToPreviousStep}
                  className="flex-1"
                >
                  <Text>Regresar</Text>
                </Button>
                <Button onPress={handleSubmit} className="flex-1">
                  <Text>Finalizar</Text>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onPress={goToPreviousStep}
                  className="flex-1"
                >
                  <Text>Regresar</Text>
                </Button>
                <Button onPress={handleNextWithValidation} className="flex-1">
                  <Text>Siguiente</Text>
                </Button>
              </>
            )}
          </View>
        )}

        {/* Modal de éxito */}
        <SuccessModal
          open={showSuccessModal}
          folio={folio}
          onClose={handleCloseModal}
          onAddNew={handleAddNew}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
