import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Icon } from "@/src/components/ui/icon";
import { THEME } from "@/src/components/ui/lib/theme";
import { cn } from "@/src/components/ui/lib/utils";
import { Text } from "@/src/components/ui/text";
import { useTheme } from "@/src/providers/ThemeProvider";
import { UserData } from "@/src/services/auth";
import { LogOutIcon } from "lucide-react-native";
import * as React from "react";
import { Modal, Platform, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UserMenuProps {
  user: UserData | null;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const backgroundColor = THEME[colorScheme].background;
  const borderColor = THEME[colorScheme].border;

  const UserMenuContent = () => (
    <View className="border-border gap-3 border-b p-3">
      <View className="flex-row items-center gap-3">
        <UserAvatar className="size-10" user={user} />
        <View className="flex-1">
          <Text className="font-medium leading-5">
            {user?.nombre || "Usuario"}
          </Text>
          {user?.email ? (
            <Text className="text-muted-foreground text-sm font-normal leading-4">
              {user.email}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="flex-row flex-wrap gap-3 py-0.5">
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            setIsOpen(false);
            onLogout();
          }}
        >
          <Icon
            as={LogOutIcon}
            className="size-4"
            color={THEME[colorScheme].destructive}
          />
          <Text style={{ color: THEME[colorScheme].destructive }}>
            Cerrar Sesión
          </Text>
        </Button>
      </View>
    </View>
  );

  // En móvil usar Modal, en web usar DropdownMenu
  if (Platform.OS !== "web") {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onPress={() => setIsOpen(true)}
        >
          <UserAvatar user={user} />
        </Button>
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View
              className="flex-1 items-end justify-start"
              style={{
                paddingTop: insets.top,
                paddingRight: 16,
                paddingLeft: 16,
              }}
            >
              <TouchableWithoutFeedback>
                <View
                  className="bg-popover border-border rounded-md border shadow-lg"
                  style={{
                    width: 320,
                    marginTop: 60,
                    backgroundColor,
                    borderColor,
                  }}
                >
                  <UserMenuContent />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <UserMenuContent />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserAvatar({
  className,
  user,
  ...props
}: Omit<React.ComponentProps<typeof Avatar>, "alt"> & {
  user: UserData | null;
}) {
  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user?.nombre) return "U";
    const names = user.nombre.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.nombre[0].toUpperCase();
  };

  return (
    <Avatar
      alt={`${user?.nombre || "Usuario"}'s avatar`}
      className={cn("size-8", className)}
      {...props}
    >
      <AvatarFallback className="bg-primary">
        <Text className="text-primary-foreground text-sm font-semibold">
          {getInitials()}
        </Text>
      </AvatarFallback>
    </Avatar>
  );
}
