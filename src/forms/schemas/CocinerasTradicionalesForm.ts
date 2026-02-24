// Formulario Cocineras Tradicionales - Dirección de Ferias y Festivales

export interface CocinerasTradicionalesFormData {
  // Datos generales
  nombre: string;
  rutaTuristica: string;
  municipio: string;
  localidad: string;
  direccion: string;
  cuentaEstablecimiento: string; // "si" | "no" (en Appwrite se guarda como boolean)
  nombreEstablecimiento: string;

  // Datos de contacto
  telefono: string;
  email: string;
  redesSociales: string;

  // Perfil gastronómico
  platilloEspecialidades: string;
}
