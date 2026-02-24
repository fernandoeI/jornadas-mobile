import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Text } from "@/src/components/ui/text";
import { THEME } from "@/src/components/ui/lib/theme";
import { useTheme } from "@/src/providers/ThemeProvider";
import { UserData } from "@/src/services/auth";
import { filesService } from "@/src/services/files";
import { BlurView } from "expo-blur";
import { Platform, View, Image } from "react-native";
import { useMemo } from "react";

interface ProfileCardProps {
  user: UserData | null;
  getInitials: () => string;
}

export function ProfileCard({ user, getInitials }: ProfileCardProps) {
  const { colorScheme } = useTheme();
  const borderColor = THEME[colorScheme].border;
  const cardForegroundColor = THEME[colorScheme].cardForeground;
  const mutedForegroundColor = THEME[colorScheme].mutedForeground;

  const cardBackgroundColor =
    colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 1)";

  // Generar URL de la imagen construyendo la URL completa manualmente
  const imageUrl = useMemo(() => {
    let fileId: string | null = null;
    
    // Prioridad 1: Si tenemos el fileId directamente
    if (user?.profilePhotoFileId) {
      fileId = user.profilePhotoFileId;
    }
    // Prioridad 2: Si hay profilePhoto, extraer el fileId de la URL
    else if (user?.profilePhoto) {
      // Extraer el fileId de la URL (formato: /storage/buckets/.../files/FILE_ID/view?...)
      const fileIdMatch = user.profilePhoto.match(/\/files\/([a-zA-Z0-9]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        fileId = fileIdMatch[1];
      }
      // Si la URL ya es completa (empieza con http/https), usarla directamente
      else if (user.profilePhoto.startsWith("http://") || user.profilePhoto.startsWith("https://")) {
        return user.profilePhoto;
      }
    }
    
    // Si tenemos un fileId, construir la URL completa
    if (fileId) {
      const url = filesService.getImageUrl(fileId, "images");
      console.log("ProfileCard - FileId:", fileId);
      console.log("ProfileCard - URL generada:", url);
      return url;
    }
    
    return null;
  }, [user?.profilePhoto, user?.profilePhotoFileId]);

  // Debug: verificar si hay foto de perfil
  console.log("ProfileCard - user.profilePhoto:", user?.profilePhoto);
  console.log("ProfileCard - user.profilePhotoFileId:", user?.profilePhotoFileId);
  console.log("ProfileCard - imageUrl generada:", imageUrl);

  const cardContent = (
    <View className="flex-row items-center gap-4 px-4 py-5">
      {imageUrl ? (
        <View className="size-16 rounded-full overflow-hidden bg-primary items-center justify-center">
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 64, height: 64 }}
            resizeMode="cover"
            onError={(error) => {
              // Evitar error de estructura cíclica en JSON.stringify
              const errorInfo = {
                errorType: error?.nativeEvent?.error || "Unknown error",
                uri: imageUrl,
                profilePhoto: user?.profilePhoto,
                fileId: user?.profilePhotoFileId,
              };
              console.error("Error cargando imagen de perfil:", errorInfo);
            }}
            onLoadStart={() => {
              console.log("Iniciando carga de imagen:", imageUrl);
            }}
            onLoadEnd={() => {
              console.log("Carga de imagen finalizada");
            }}
          />
        </View>
      ) : (
        <Avatar
          alt={`${user?.nombre || "Usuario"}'s avatar`}
          className="size-16"
        >
          <AvatarFallback className="bg-primary">
            <Text className="text-primary-foreground text-xl font-semibold">
              {getInitials()}
            </Text>
          </AvatarFallback>
        </Avatar>
      )}
      <View className="flex-1">
        <Text
          className="text-lg font-semibold"
          style={{ color: cardForegroundColor }}
        >
          {user?.nombre || "Usuario"}
        </Text>
        {user?.email && (
          <Text
            className="text-sm mt-1"
            style={{ color: mutedForegroundColor }}
          >
            {user.email}
          </Text>
        )}
        {(user?.labels && user.labels.length > 0) ? (
          <View className="mt-2 flex-row flex-wrap gap-2">
            {user.labels.map((label, index) => (
              <View
                key={index}
                className="px-2 py-1 rounded-full"
                style={{
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: mutedForegroundColor }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        ) : user?.role ? (
          <View className="mt-2">
            <View
              className="px-2 py-1 rounded-full self-start"
              style={{
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: mutedForegroundColor }}
              >
                {user.role}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor,
          borderWidth: 0.5,
        }}
      >
        {cardContent}
      </View>
    );
  }

  return (
    <BlurView
      intensity={colorScheme === "dark" ? 20 : 30}
      tint={colorScheme === "dark" ? "dark" : "light"}
      className="rounded-lg overflow-hidden"
      style={{ borderColor: borderColor, borderWidth: 0.5 }}
    >
      {cardContent}
    </BlurView>
  );
}


