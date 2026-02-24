import { useAuth } from "@/src/providers/AuthProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { SignUpFormData, signUpValidationSchema } from "./schemas/SignUpForm";
import { authService } from "@/src/services/auth";

export const useSignUpForm = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpValidationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      setError(null);
      // Usar el email como nombre por defecto, Appwrite requiere un nombre
      const response = await authService.register(
        data.email,
        data.password,
        data.email.split("@")[0] || "Usuario", // Usar la parte antes del @ como nombre
        "", // Primer apellido vacío
        undefined // Segundo apellido undefined
      );
      // El registro ya crea la sesión, solo necesitamos actualizar el estado del usuario
      // No necesitamos hacer login de nuevo porque register ya lo hace
      return response;
    },
    onSuccess: (response) => {
      // Actualizar el estado del usuario en el AuthProvider
      // El registro ya creó la sesión, solo necesitamos actualizar el estado
      if (response?.user) {
        setUser(response.user);
      }
      // Navegar al home
      router.replace("/home");
    },
    onError: (error: any) => {
      console.error("Error en registro:", error);
      console.error("Detalles del error:", {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        response: error?.response,
        isRegistrationSuccess: error?.isRegistrationSuccess,
      });
      
      let errorMessage = error?.message || "Error al registrar usuario. Por favor intenta nuevamente.";
      
      // Si el error indica que el registro fue exitoso pero falló la sesión
      if (errorMessage.includes("REGISTRO_EXITOSO_SIN_SESION") || error?.isRegistrationSuccess) {
        // Mostrar mensaje informativo y redirigir al login
        setError(
          "Tu cuenta fue creada exitosamente. Serás redirigido al inicio de sesión..."
        );
        // Esperar un momento para que el usuario vea el mensaje y luego redirigir al login
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
        return;
      }
      
      setError(errorMessage);
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    mutation.mutate(data);
  };

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus();
  };

  const onPasswordSubmitEditing = () => {
    confirmPasswordInputRef.current?.focus();
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    error,
    emailInputRef,
    passwordInputRef,
    confirmPasswordInputRef,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    onEmailSubmitEditing,
    onPasswordSubmitEditing,
    isLoading: mutation.isPending,
  };
};

