import { FormHeader } from "@/src/components/common";
import { AdvanceInformation } from "@/src/components/modules/touristic-promotion/advanceInformation";
import { BasicInformation } from "@/src/components/modules/touristic-promotion/basicInformation";
import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Text } from "@/src/components/ui/text";
import { usePromocionTuristicaForm } from "@/src/forms/usePromocionTuristicaForm";
import { useTheme } from "@/src/providers/ThemeProvider";
import { useRouter } from "expo-router";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PromocionTuristicaScreen() {
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
    values,
    errors,
    step,
    fotos,
    pickImage,
    removeFoto,
    updateFotoDescripcion,
    handleGetLocation,
    contentInsets,
    nivelConocimientoRef,
    condicionesAccesoRef,
    estadoConservacionRef,
    potencialPromocionalRef,
    getStepTitle,
    getStepDescription,
    getStepIcon,
    goToNextStep,
    goToPreviousStep,
  } = usePromocionTuristicaForm();

  const handleCancel = () => {
    router.push("/(protected)/(tabs)/home");
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
          totalSteps={2}
          title={getStepTitle()}
          description={getStepDescription()}
          icon={getStepIcon()}
          directionName="Promoción y Difusión Turística"
          backRoute="/home"
        />

        <ScrollView
          className="flex-1 px-6 pb-6 bg-transparent"
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 1 }}
          contentContainerStyle={
            Platform.OS !== "web"
              ? {
                  paddingBottom: insets.bottom + 16 + 56 + 16 + 16, // safe area + padding + button height + gap + extra padding
                }
              : undefined
          }
          scrollEventThrottle={16}
        >
          <View className="gap-6 w-full max-w-[672px] mx-auto">
            {step === 0 && (
              <BasicInformation
                control={control}
                errors={errors}
                values={values}
                setValue={setValue}
                nivelConocimientoRef={nivelConocimientoRef}
                contentInsets={contentInsets}
                onCancel={handleCancel}
                onNext={goToNextStep}
                showButtons={Platform.OS === "web"}
              />
            )}

            {step === 1 && (
              <AdvanceInformation
                control={control}
                errors={errors}
                values={values}
                setValue={setValue}
                condicionesAccesoRef={condicionesAccesoRef}
                estadoConservacionRef={estadoConservacionRef}
                potencialPromocionalRef={potencialPromocionalRef}
                contentInsets={contentInsets}
                fotos={fotos}
                onPickImage={pickImage}
                onRemoveFoto={removeFoto}
                onUpdateFotoDescripcion={updateFotoDescripcion}
                onGetLocation={handleGetLocation}
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
                <Button onPress={goToNextStep} className="flex-1">
                  <Text>Siguiente</Text>
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
                <Button onPress={handleSubmit} className="flex-1">
                  <Text>Finalizar</Text>
                </Button>
              </>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
