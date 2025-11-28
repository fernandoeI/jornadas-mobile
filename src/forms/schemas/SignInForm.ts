import * as Yup from "yup";

// Tipos para el formulario de inicio de sesión
export interface SignInFormData {
  email: string;
  password: string;
}

// Schema de validación Yup
export const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("El correo electrónico no es válido")
    .required("El correo electrónico es requerido"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
});
