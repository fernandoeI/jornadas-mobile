import * as Yup from "yup";

// Tipos para el formulario de recuperación de contraseña
export interface ForgotPasswordFormData {
  email: string;
}

// Schema de validación Yup
export const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("El correo electrónico no es válido")
    .required("El correo electrónico es requerido"),
});

// Tipos para el formulario de restablecer contraseña
export interface ResetPasswordFormData {
  userId: string;
  secret: string;
  password: string;
  confirmPassword: string;
}

// Schema de validación Yup para restablecer contraseña
export const resetPasswordValidationSchema = Yup.object().shape({
  userId: Yup.string().required("El ID de usuario es requerido"),
  secret: Yup.string().required("El código de verificación es requerido"),
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    )
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

