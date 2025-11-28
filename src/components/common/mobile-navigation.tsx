import React from "react";
import { View } from "react-native";
import MobileButton from "./mobile-button";

interface MobileNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  onFinish?: () => void;
  backText?: string;
  nextText?: string;
  cancelText?: string;
  finishText?: string;
  showBack?: boolean;
  showNext?: boolean;
  showCancel?: boolean;
  showFinish?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onBack,
  onNext,
  onCancel,
  onFinish,
  backText = "Regresar",
  nextText = "Siguiente",
  cancelText = "Cancelar",
  finishText = "Finalizar",
  showBack = true,
  showNext = true,
  showCancel = false,
  showFinish = false,
  loading = false,
  disabled = false,
  className = "",
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 16,
        marginTop: 32,
      }}
      className={className}
    >
      {showCancel && onCancel && (
        <MobileButton
          title={cancelText}
          variant="outline"
          size="lg"
          onPress={onCancel}
          disabled={disabled}
          className="flex-1"
        />
      )}

      {showBack && onBack && (
        <MobileButton
          title={backText}
          variant="outline"
          size="lg"
          onPress={onBack}
          disabled={disabled}
          className="flex-1"
        />
      )}

      {showNext && onNext && (
        <MobileButton
          title={nextText}
          variant="primary"
          size="lg"
          onPress={onNext}
          loading={loading}
          disabled={disabled}
          className="flex-1"
        />
      )}

      {showFinish && onFinish && (
        <MobileButton
          title={finishText}
          variant="primary"
          size="lg"
          onPress={onFinish}
          loading={loading}
          disabled={disabled}
          className="flex-1"
        />
      )}
    </View>
  );
};

export default MobileNavigation;
