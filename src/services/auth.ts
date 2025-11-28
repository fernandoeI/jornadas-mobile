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
}

const USER_KEY = "auth_user";

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

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const account = getAppwriteAccount();

    await account.createEmailPasswordSession(email, password);

    const user = await account.get();
    const userData = mapAppwriteUserToUser(user);

    await setUser(userData);

    return {
      access_token: user.$id,
      user: userData,
    };
  } catch (error: unknown) {
    console.error("Error en login:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al iniciar sesión";
    throw new Error(errorMessage);
  }
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
  try {
    const account = getAppwriteAccount();
    const user = await account.get();
    const userData = mapAppwriteUserToUser(user);

    await setUser(userData);

    return userData;
  } catch {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr) as UserData;
    } catch (storageError) {
      console.error("Error getting user:", storageError);
      return null;
    }
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const account = getAppwriteAccount();
    const session = await account.getSession("current");
    return !!session;
  } catch {
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const account = getAppwriteAccount();
    await account.deleteSession("current");
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error en logout:", error);
    await AsyncStorage.removeItem(USER_KEY);
  }
};

export const authService = {
  login,
  register,
  getUser,
  isAuthenticated,
  logout,
};
