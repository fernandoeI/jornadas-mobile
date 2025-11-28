import { Text } from "@/src/components/ui/text";
import React from "react";
import { Platform } from "react-native";

interface MobileTextProps {
  children: string;
  variant?: "title" | "subtitle" | "body" | "caption";
  color?: "primary" | "secondary" | "white" | "muted";
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  className?: string;
}

const MobileText: React.FC<MobileTextProps> = ({
  children,
  variant = "body",
  color = "primary",
  numberOfLines,
  ellipsizeMode = "tail",
  className = "",
}) => {
  const variantClasses = {
    title: "font-bold text-lg leading-tight",
    subtitle: "font-semibold text-base leading-tight",
    body: "font-medium text-base leading-relaxed",
    caption: "font-normal text-sm leading-tight",
  };

  const colorClasses = {
    primary: "text-typography-900",
    secondary: "text-typography-700",
    white: "text-white",
    muted: "text-typography-600",
  };

  const fontSize =
    Platform.OS === "web"
      ? variant === "title"
        ? 18
        : variant === "subtitle"
          ? 16
          : variant === "body"
            ? 16
            : 14
      : variant === "title"
        ? 20
        : variant === "subtitle"
          ? 18
          : variant === "body"
            ? 18
            : 16;

  return (
    <Text
      className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={{
        fontSize,
        lineHeight: fontSize * 1.2,
      }}
    >
      {children}
    </Text>
  );
};

export default MobileText;
