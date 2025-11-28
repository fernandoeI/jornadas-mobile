import { useAuth } from "@/src/providers/AuthProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { SignInFormData, signInValidationSchema } from "./schemas/SignInForm";

export const useSignInForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInValidationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SignInFormData) => {
      setError(null);
      await login(data.email, data.password);
    },
    onSuccess: () => {
      router.replace("/home");
    },
    onError: (error: any) => {
      console.error("Error en login:", error);
      const errorMessage =
        error?.message ||
        "Error al iniciar sesión. Por favor intenta nuevamente.";
      setError(errorMessage);
    },
  });

  const onSubmit = (data: SignInFormData) => {
    mutation.mutate(data);
  };

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus();
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    error,
    passwordInputRef,
    showPassword,
    setShowPassword,
    onEmailSubmitEditing,
    isLoading: mutation.isPending,
  };
};
