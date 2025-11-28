import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Monicon } from "@monicon/native";
import React from "react";
import { View } from "react-native";

interface MobileButtonProps {
  title: string;
  subtitle?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const MobileButton: React.FC<MobileButtonProps> = ({
  title,
  subtitle,
  icon,
  variant = "primary",
  size = "lg",
  onPress,
  disabled = false,
  loading = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-12",
    md: "h-14",
    lg: "h-16",
    xl: "h-20",
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#9A1445] to-[#9A1445]/80",
    secondary:
      "bg-gradient-to-r from-[#9A1445]/10 to-[#9A1445]/20 border border-[#9A1445]/30",
    outline: "border-[#9A1445]/30 bg-white/80",
  };

  const textClasses = {
    primary: "text-white",
    secondary: "text-[#9A1445]",
    outline: "text-[#9A1445]",
  };

  const iconSize = size === "xl" ? 28 : size === "lg" ? 24 : 20;

  return (
    <Button
      variant={variant === "outline" ? "outline" : "default"}
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        height:
          size === "sm" ? 48 : size === "md" ? 56 : size === "lg" ? 64 : 80,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <Text
            className={`font-semibold text-lg ${textClasses[variant]}`}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className={`text-sm ${
                variant === "primary" ? "text-white/80" : "text-typography-600"
              }`}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {icon && (
          <View
            style={{
              borderRadius: 12,
              padding: 8,
              backgroundColor:
                variant === "primary"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(154, 20, 69, 0.1)",
            }}
          >
            <Monicon
              name={icon}
              size={iconSize}
              color={variant === "primary" ? "white" : "#9A1445"}
            />
          </View>
        )}
        {loading && (
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 999,
              padding: 8,
            }}
          >
            <Monicon name="mdi:loading" size={20} color="white" />
          </View>
        )}
      </View>
    </Button>
  );
};

export default MobileButton;
