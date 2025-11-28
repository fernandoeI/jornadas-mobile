import React from "react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { INEScanResult } from "@/src/utils/functions";
import { View } from "react-native";

interface INEFormProps {
  formData: Partial<INEScanResult>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<INEScanResult>>>;
  imageUri?: string | null;
  showImage: boolean;
  setShowImage: (show: boolean) => void;
}

export const INEForm: React.FC<INEFormProps> = ({
  formData,
  setFormData,
  imageUri,
  showImage,
  setShowImage,
}) => {
  return (
    <View style={{ gap: 16, marginTop: 16, width: "100%" }}>
      {/* Previsualización de la imagen */}
      {imageUri && (
        <View style={{ gap: 8, marginBottom: 16 }}>
          <Button
            variant="outline"
            onPress={() => setShowImage(!showImage)}
            style={{ alignSelf: "flex-start" }}
          >
            <Text className="text-primary-500">
              {showImage ? "Ocultar imagen" : "Ver imagen escaneada"}
            </Text>
          </Button>
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">Nombre</Text>
        <Input
          placeholder="Fernando"
          value={formData.nombre ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({ ...prev, nombre: val }))
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">Primer Apellido</Text>
        <Input
          placeholder="López"
          value={formData.primerApellido ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({ ...prev, primerApellido: val }))
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">Segundo Apellido</Text>
        <Input
          placeholder="Ramírez"
          value={formData.segundoApellido ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({ ...prev, segundoApellido: val }))
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">Dirección</Text>
        <Input
          placeholder="Av. Reforma 123, CDMX"
          value={formData.direccion ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({ ...prev, direccion: val }))
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">CURP</Text>
        <Input
          placeholder="LOPR800101HDFRML04"
          value={formData.curp ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({ ...prev, curp: val }))
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">Género</Text>
        <Input
          placeholder="masculino / femenino"
          value={formData.genero ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({
              ...prev,
              genero:
                val === "masculino" || val === "femenino" ? val : prev.genero,
            }))
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text className="text-typography-500">Edad</Text>
        <Input
          placeholder="25"
          keyboardType="numeric"
          value={formData.edad ?? ""}
          onChangeText={(val) =>
            setFormData((prev) => ({ ...prev, edad: val }))
          }
        />
      </View>
    </View>
  );
};
