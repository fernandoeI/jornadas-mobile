import { authService } from "@/src/services/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import {
  ResetPasswordFormData,
  resetPasswordValidationSchema,
} from "./schemas/ForgotPasswordForm";

interface UseResetPasswordFormProps {
  userId: string;
  secret: string;
}

export const useResetPasswordForm = ({
  userId,
  secret,
}: UseResetPasswordFormProps) => {
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordValidationSchema),
    defaultValues: {
      userId,
      secret,
      password: "",
      confirmPassword: "",
    },
  });

  // Actualizar valores por defecto si userId o secret cambian
  useEffect(() => {
    reset({
      userId,
      secret,
      password: "",
      confirmPassword: "",
    });
  }, [userId, secret, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      setError(null);
      await authService.resetPassword(data.userId, data.secret, data.password);
    },
    onSuccess: () => {
      // Redirigir al login después de éxito
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      console.error("Error al restablecer contraseña:", error);
      let errorMessage =
        error?.message ||
        "Error al restablecer la contraseña. Por favor intenta nuevamente.";

      // Mensajes de error más específicos
      if (errorMessage.includes("expired") || errorMessage.includes("expiró")) {
        errorMessage =
          "El enlace de recuperación ha expirado. Por favor solicita uno nuevo.";
      } else if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("inválido")
      ) {
        errorMessage =
          "El enlace de recuperación no es válido. Por favor solicita uno nuevo.";
      }

      setError(errorMessage);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    mutation.mutate(data);
  };

  const onPasswordSubmitEditing = () => {
    confirmPasswordInputRef.current?.focus();
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    error,
    passwordInputRef,
    confirmPasswordInputRef,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    onPasswordSubmitEditing,
    isLoading: mutation.isPending,
  };
};

