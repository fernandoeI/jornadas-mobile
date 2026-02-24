import * as Yup from "yup";

// Tipos para el formulario de registro
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Schema de validación Yup
export const signUpValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("El correo electrónico no es válido")
    .required("El correo electrónico es requerido"),
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

