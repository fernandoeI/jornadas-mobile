import { isCorsError, sifFetch } from "@/src/utils/sifApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAppwriteAccount, ID, Models } from "./appwrite";

export interface UserData {
  id: string;
  email: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserData;
  sifAccessToken?: string; // Token del SIF para usar en los endpoints
}

const USER_KEY = "auth_user";
const SIF_TOKEN_KEY = "sif_access_token";
const SIF_REFRESH_TOKEN_KEY = "sif_refresh_token";
const SIF_TOKEN_EXPIRY_KEY = "sif_token_expiry";

const SIF_BASE_URL = "https://sif.tabasco.gob.mx";
const SIF_REFRESH_ENDPOINT = `${SIF_BASE_URL}/user/api/token/refresh/`;

const mapAppwriteUserToUser = (
  appwriteUser: Models.User<Models.Preferences>
): UserData => {
  const nameParts = appwriteUser.name?.split(" ") || [];
  const nombre = nameParts[0] || "";
  const primerApellido = nameParts[1] || "";
  const segundoApellido = nameParts.slice(2).join(" ") || undefined;

  return {
    id: appwriteUser.$id,
    email: appwriteUser.email,
    nombre,
    primerApellido,
    segundoApellido,
    role: "user",
  };
};

const setUser = async (user: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user:", error);
  }
};

const mapSifUserToUser = (sifUser: any): UserData => {
  const nameParts = sifUser.full_name?.split(" ") || [];
  const nombre = nameParts[0] || "";
  const primerApellido = nameParts[1] || "";
  const segundoApellido = nameParts.slice(2).join(" ") || undefined;

  return {
    id: sifUser.id?.toString() || "",
    email: sifUser.email || "",
    nombre,
    primerApellido,
    segundoApellido,
    role: sifUser.is_superuser ? "admin" : sifUser.is_staff ? "staff" : "user",
  };
};

const SIF_LOGIN_ENDPOINT = `${SIF_BASE_URL}/user/api/login/`;

const loginSIF = async (
  email: string,
  password: string
): Promise<{ access: string; refresh: string; user: any }> => {
  try {
    const response = await sifFetch(SIF_LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error en login SIF: ${response.status}`
      );
    }

    const data = await response.json();
    return {
      access: data.tokens.access,
      refresh: data.tokens.refresh,
      user: data.user,
    };
  } catch (error: unknown) {
    console.error("Error en login SIF:", error);

    // Si es un error de CORS, proporcionar mensaje más útil
    if (isCorsError(error)) {
      throw error; // El error ya tiene un mensaje mejorado
    }

    throw error;
  }
};

const setSifTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(SIF_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(SIF_REFRESH_TOKEN_KEY, refreshToken);
    // Guardar timestamp de expiración (1 hora desde ahora, menos 5 minutos de margen)
    const expiryTime = Date.now() + 55 * 60 * 1000; // 55 minutos
    await AsyncStorage.setItem(SIF_TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error("Error guardando tokens SIF:", error);
  }
};

const getSifRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SIF_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error obteniendo refresh token SIF:", error);
    return null;
  }
};

export const getSifAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SIF_TOKEN_KEY);
  } catch (error) {
    console.error("Error obteniendo token SIF:", error);
    return null;
  }
};

/**
 * Refresca el token de acceso usando el refresh token
 * Endpoint: POST /user/api/token/refresh/
 * Body: { refresh: string }
 * Response: { access: string, refresh?: string }
 */
export const refreshSifToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getSifRefreshToken();
    if (!refreshToken) {
      console.error("No hay refresh token disponible");
      return null;
    }

    const response = await sifFetch(SIF_REFRESH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error refrescando token:", errorData);
      // Si el refresh token también expiró, limpiar todo
      await logout();
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access || data.tokens?.access;
    const newRefreshToken =
      data.refresh || data.tokens?.refresh || refreshToken;

    if (newAccessToken) {
      await setSifTokens(newAccessToken, newRefreshToken);
      console.log("Token refrescado exitosamente");
      return newAccessToken;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error refrescando token SIF:", error);
    // Si es un error de CORS, no hacer logout (probablemente es desarrollo web)
    if (!isCorsError(error)) {
      await logout();
    }
    return null;
  }
};

/**
 * Obtiene el token de acceso, refrescándolo si es necesario
 */
export const getValidSifAccessToken = async (): Promise<string | null> => {
  try {
    // Verificar si el token está por expirar
    const expiryStr = await AsyncStorage.getItem(SIF_TOKEN_EXPIRY_KEY);
    const now = Date.now();

    if (expiryStr) {
      const expiryTime = parseInt(expiryStr, 10);
      // Si queda menos de 5 minutos o ya expiró, refrescar
      if (now >= expiryTime) {
        console.log("Token por expirar o expirado, refrescando...");
        const newToken = await refreshSifToken();
        if (newToken) {
          return newToken;
        }
      }
    }

    // Si no necesita refrescar, devolver el token actual
    return await getSifAccessToken();
  } catch (error) {
    console.error("Error obteniendo token válido:", error);
    return null;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  // TEMPORALMENTE DESACTIVADO: Login con Appwrite
  // Solo usar login del SIF
  // let userData: UserData | null = null;
  // let accessToken = "";
  // let sifAccessToken: string | undefined;

  // // Intentar login en Appwrite primero
  // try {
  //   const account = getAppwriteAccount();
  //   await account.createEmailPasswordSession(email, password);
  //   const user = await account.get();
  //   userData = mapAppwriteUserToUser(user);
  //   accessToken = user.$id;
  // } catch (appwriteError) {
  //   console.log("Login en Appwrite falló, intentando SIF:", appwriteError);
  // }

  // Intentar login en SIF (único método activo)
  let userData: UserData | null = null;
  let accessToken = "";
  let sifAccessToken: string | undefined;

  try {
    const sifResult = await loginSIF(email, password);
    await setSifTokens(sifResult.access, sifResult.refresh);
    sifAccessToken = sifResult.access;

    // Usar el usuario del SIF
    userData = mapSifUserToUser(sifResult.user);
    accessToken = sifResult.access;
  } catch (sifError) {
    console.log("Login en SIF falló:", sifError);
    const errorMessage =
      sifError instanceof Error ? sifError.message : "Error al iniciar sesión";
    throw new Error(errorMessage);
  }

  // Guardar y retornar
  if (userData) {
    await setUser(userData);
    return {
      access_token: accessToken,
      user: userData,
      sifAccessToken,
    };
  }

  throw new Error("Error al iniciar sesión");
};

export const register = async (
  email: string,
  password: string,
  nombre: string,
  primerApellido: string,
  segundoApellido?: string
): Promise<LoginResponse> => {
  try {
    const account = getAppwriteAccount();

    const fullName =
      `${nombre} ${primerApellido} ${segundoApellido || ""}`.trim();

    await account.create(ID.unique(), email, password, fullName);
    await account.createEmailPasswordSession(email, password);

    const user = await account.get();

    const userData: UserData = {
      id: user.$id,
      email: user.email,
      nombre,
      primerApellido,
      segundoApellido,
      role: "user",
    };

    await setUser(userData);

    return {
      access_token: user.$id,
      user: userData,
    };
  } catch (error: unknown) {
    console.error("Error en registro:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al registrar usuario";
    throw new Error(errorMessage);
  }
};

export const getUser = async (): Promise<UserData | null> => {
  // TEMPORALMENTE DESACTIVADO: Appwrite
  // Solo usar datos guardados localmente
  try {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr) as UserData;
  } catch (storageError) {
    console.error("Error getting user:", storageError);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  // TEMPORALMENTE DESACTIVADO: Appwrite
  // Verificar si hay token SIF o usuario guardado
  try {
    const token = await getSifAccessToken();
    if (token) return true;

    const userStr = await AsyncStorage.getItem(USER_KEY);
    return !!userStr;
  } catch {
    return false;
  }
};

export const logout = async (): Promise<void> => {
  // TEMPORALMENTE DESACTIVADO: Appwrite
  // Solo limpiar datos locales
  try {
    // Limpiar todos los datos de autenticación
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(SIF_TOKEN_KEY);
    await AsyncStorage.removeItem(SIF_REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(SIF_TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error("Error en logout:", error);
  }
};

export const authService = {
  login,
  register,
  getUser,
  isAuthenticated,
  logout,
  getSifAccessToken,
  getValidSifAccessToken,
  refreshSifToken,
};
