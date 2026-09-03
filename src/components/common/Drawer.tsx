import { Button } from "@/src/components/ui/button";
import { THEME } from "@/src/components/ui/lib/theme";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { HOME_MENU_ITEMS } from "@/src/constants/home";
import { useAuth } from "@/src/providers/AuthProvider";
import { useTheme } from "@/src/providers/ThemeProvider";
import Monicon from "@monicon/native";
import Constants from "expo-constants";
import { usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DrawerContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  translateX: SharedValue<number>;
  drawerWidth: number;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within DrawerProvider");
  }
  return context;
};

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const DRAWER_WIDTH = Math.min(340, screenWidth * 0.88);
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const { colorScheme } = useTheme();
  const backgroundColor = THEME[colorScheme].background;

  useEffect(() => {
    if (!isOpen) {
      translateX.value = -DRAWER_WIDTH;
    }
  }, [DRAWER_WIDTH, isOpen, translateX]);

  const open = () => {
    setIsOpen(true);
    // Pequeño delay para asegurar que el modal esté montado
    setTimeout(() => {
      translateX.value = withSpring(0, {
        damping: 130,
        stiffness: 500,
        velocity: 800,
      });
    }, 10);
  };

  const close = () => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
    setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: isOpen ? withTiming(0.5, { duration: 250 }) : 0,
    };
  });

  return (
    <DrawerContext.Provider
      value={{ open, close, isOpen, translateX, drawerWidth: DRAWER_WIDTH }}
    >
      <View className="flex-1 overflow-hidden">
      <Animated.View
        style={[
          {
            flex: 1,
          },
          useAnimatedStyle(() => {
            // Mover el contenido principal hacia la derecha cuando el drawer está abierto
            return {
              transform: [{ translateX: 0 }],
            };
          }),
        ]}
      >
        {children}
      </Animated.View>
      </View>
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        <View className="flex-1" style={{ position: "relative" }}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={close}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "black",
                },
                overlayStyle,
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Drawer - Posicionado desde la izquierda */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: DRAWER_WIDTH,
                backgroundColor,
                zIndex: 1000,
              },
              animatedStyle,
            ]}
            className="bg-background"
          >
            <DrawerContent onClose={close} />
          </Animated.View>
        </View>
      </Modal>
    </DrawerContext.Provider>
  );
}

function DrawerContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { colorScheme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const pathName = usePathname();
  const iconColor = THEME[colorScheme].foreground;


  const handleNavigate = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      >
        <View className="px-4">
          {/* Header */}
          <View className="pt-6 pb-2">
            <Text className="text-2xl font-bold text-foreground mb-2">
              Atención Ciudada
            </Text>
            {/* {user?.nombre && (
              <Text className="text-sm text-muted-foreground">
                {`Hola ${user.nombre}`}
              </Text>
            )} */}
          </View>

          <Separator className="mb-4" />

          {/* Menu Items */}
          {/* Menu Items */}
          <View className="gap-2 mb-4">
            {HOME_MENU_ITEMS.map((item) => {
              const isActive = pathName === item.route;

              return (
                <Pressable
                  key={item.route}
                  onPress={() => handleNavigate(item.route)}
                  className={`flex flex-row items-center gap-4 py-3 px-4 rounded-md ${isActive ? "bg-primary" : "active:bg-accent"
                    }`}
                >
                  <Monicon
                    name="ic:outline-home"
                    size={24}
                    color={isActive ? "#ffffff" : iconColor}
                  />

                  <Text
                    className={`text-base font-medium ${isActive ? "text-white" : "text-foreground"
                      }`}
                  >
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Separator className="mb-4" />
        </View>
      </ScrollView>

      <View
        className="px-4"
        style={{
          paddingBottom: insets.bottom + 12,
        }}
      >
        {/* Bottom actions */}
        {/* Settings Button */}
        <Pressable
          onPress={() => handleNavigate("/(protected)/gestionar-cuenta")}
          className="flex-row items-center justify-between py-3 px-4 rounded-md active:bg-accent mb-4"
        >
          <View className="flex-row items-center gap-3">
            <Monicon
              name="ic:outline-settings"
              size={24}
              color={iconColor}
            />
            <Text className="text-base text-foreground font-medium">
              Configuración
            </Text>
          </View>
        </Pressable>

        {/* Theme Toggle */}
        <Pressable
          onPress={toggleTheme}
          className="flex-row items-center justify-between py-3 px-4 rounded-md active:bg-accent mb-4"
        >
          <View className="flex-row items-center gap-3">
            <Monicon
              name={
                colorScheme === "dark"
                  ? "ic:outline-light-mode"
                  : "ic:outline-dark-mode"
              }
              size={24}
              color={iconColor}
            />
            <Text className="text-base text-foreground font-medium">
              {colorScheme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </Text>
          </View>
        </Pressable>

        <Separator className="mb-4" />

        {/* Logout Button */}
        <Button
          variant="outline"
          onPress={handleLogout}
          className="border-destructive mb-4"
        >
          <View className="flex-row items-center gap-2">
            <Monicon
              name="ic:outline-logout"
              size={20}
              color={THEME[colorScheme].destructive}
            />
            <Text className="text-destructive font-medium">
              Cerrar Sesión
            </Text>
          </View>
        </Button>

        {/* App Version */}
        <View className="items-center mt-auto pt-4">
          <Text className="text-xs text-muted-foreground">
            Versión {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
      </View>
    </View>
  );
}
