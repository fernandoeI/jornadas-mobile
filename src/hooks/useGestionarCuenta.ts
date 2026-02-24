import { useAuth } from "@/src/providers/AuthProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Alert } from "react-native";
import { createSettingsGroups } from "@/src/constants/gestionar-cuenta";
import { SettingsGroup } from "@/src/types/gestionar-cuenta";

export const useGestionarCuenta = () => {
  const router = useRouter();
  const { user, refreshUser, setUser } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangeProfilePhotoModal, setShowChangeProfilePhotoModal] = useState(false);
  const [showUpdateNameModal, setShowUpdateNameModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleChangeProfilePhoto = () => {
    setShowChangeProfilePhotoModal(true);
  };

  const handleUpdateName = () => {
    setShowUpdateNameModal(true);
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleEnable2FA = () => {
    // TODO: Implementar autenticación en 2 pasos
    console.log("Habilitar autenticación en 2 pasos");
  };

  const handlePrivacyPolicy = async () => {
    const url = "https://turismo.tabasco.gob.mx/aviso-privacidad/";
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se pudo abrir la URL");
      }
    } catch (error) {
      console.error("Error al abrir aviso de privacidad:", error);
      Alert.alert("Error", "No se pudo abrir el aviso de privacidad");
    }
  };

  const handleTermsAndConditions = async () => {
    const url = "https://turismo.tabasco.gob.mx/terminos-y-condiciones/";
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se pudo abrir la URL");
      }
    } catch (error) {
      console.error("Error al abrir términos y condiciones:", error);
      Alert.alert("Error", "No se pudo abrir los términos y condiciones");
    }
  };

  const handleEULA = async () => {
    const url = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se pudo abrir la URL");
      }
    } catch (error) {
      console.error("Error al abrir EULA:", error);
      Alert.alert("Error", "No se pudo abrir el EULA");
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = async () => {
    // TODO: Implementar eliminación de cuenta
    console.log("Eliminar cuenta");
    setShowDeleteDialog(false);
    // Aquí se implementaría la lógica para eliminar la cuenta
  };

  const getInitials = () => {
    if (!user?.nombre) return "U";
    const names = user.nombre.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.nombre[0].toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "";
    const parts = [user.nombre, user.primerApellido, user.segundoApellido].filter(Boolean);
    return parts.join(" ");
  };

  const handleModalSuccess = async () => {
    // Refrescar el usuario desde Appwrite para obtener los datos actualizados
    await refreshUser();
  };

  const settingsGroups: SettingsGroup[] = createSettingsGroups({
    handleChangeProfilePhoto,
    handleUpdateName,
    handleChangePassword,
    handleEnable2FA,
    handlePrivacyPolicy,
    handleTermsAndConditions,
    handleEULA,
    handleDeleteAccount,
  });

  return {
    user,
    showDeleteDialog,
    setShowDeleteDialog,
    showChangeProfilePhotoModal,
    setShowChangeProfilePhotoModal,
    showUpdateNameModal,
    setShowUpdateNameModal,
    showChangePasswordModal,
    setShowChangePasswordModal,
    settingsGroups,
    getInitials,
    getFullName,
    confirmDeleteAccount,
    handleModalSuccess,
  };
};

