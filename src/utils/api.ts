// Configuración de la API
export const API_CONFIG = {
  BASE_URL: "http://localhost:3000",
  GRAPHQL_URL: "http://localhost:3000/graphql",
  TIMEOUT: 10000,
};

// Tipos de respuesta de la API
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    primerApellido: string;
    segundoApellido?: string;
    role: string;
  };
}

export interface FileUploadResponse {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface JornadaResponse {
  id: string;
  nombreSolicitante: string;
  primerApellido: string;
  segundoApellido?: string;
  curp: string;
  direccion: string;
  municipio: string;
  localidad: string;
  telefono: string;
  correo?: string;
  ineImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIError {
  message: string;
  status?: number;
}

// Función helper para hacer requests a la API
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};
