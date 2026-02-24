import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ForgotPasswordFormData,
  forgotPasswordValidationSchema,
} from "./schemas/ForgotPasswordForm";
import { authService } from "@/src/services/auth";

export const useForgotPasswordForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordValidationSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      setError(null);
      setSuccess(false);
      await authService.forgotPassword(data.email);
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: any) => {
      console.error("Error en recuperación de contraseña:", error);
      const errorMessage =
        error?.message ||
        "Error al enviar el correo de recuperación. Por favor intenta nuevamente.";
      setError(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    error,
    success,
    isLoading: mutation.isPending,
  };
};

