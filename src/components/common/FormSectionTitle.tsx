import { Text } from "@/src/components/ui/text";
import { Monicon } from "@monicon/native";
import React from "react";
import { View } from "react-native";

interface FormSectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

const FormSectionTitle: React.FC<FormSectionTitleProps> = ({
  title,
  subtitle,
  icon = "mdi:clipboard-text",
}) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(154, 20, 69, 0.1)",
            borderRadius: 999,
            padding: 8,
          }}
        >
          <Monicon name={icon} size={20} color="#9A1445" />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="text-lg font-bold text-typography-900">{title}</Text>
          {subtitle && (
            <Text className="text-sm text-typography-600">{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default FormSectionTitle;
