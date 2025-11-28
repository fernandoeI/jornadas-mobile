import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Monicon } from "@monicon/native";
import React, { useState } from "react";
import { Platform, View } from "react-native";

interface MobileInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: any) => void;
  error?: string;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: any;
  textContentType?: any;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
  showPasswordToggle?: boolean;
}

const MobileInput: React.FC<MobileInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  multiline = false,
  numberOfLines = 1,
  className = "",
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = secureTextEntry || showPasswordToggle;
  const shouldShowPassword = isPasswordField && showPassword;

  return (
    <View style={{ gap: 8 }} className={className}>
      <Text className="text-typography-700 font-medium text-base">{label}</Text>
      <View style={{ position: "relative" }}>
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={isPasswordField && !shouldShowPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          className="bg-white/80 min-h-[56px]"
          style={{
            fontSize: Platform.OS === "web" ? 16 : 18,
            minHeight: 56,
          }}
        />
        {isPasswordField && (
          <View
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: [{ translateY: -10 }],
            }}
          >
            <Button
              variant="link"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Monicon
                name={shouldShowPassword ? "mdi:eye-off" : "mdi:eye"}
                size={20}
                color="#9A1445"
              />
            </Button>
          </View>
        )}
      </View>
      {error && touched && (
        <Text className="text-error-600 text-sm">{error}</Text>
      )}
    </View>
  );
};

export default MobileInput;
