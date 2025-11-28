import Constants from "expo-constants";
import {
  Account,
  Client,
  Databases,
  ID,
  Models,
  Storage,
} from "react-native-appwrite";

// Configuración de Appwrite usando variables de entorno
const getAppwriteConfig = () => {
  // En Expo, las variables de entorno pueden estar en:
  // 1. process.env.EXPO_PUBLIC_* (para variables públicas)
  // 2. Constants.expoConfig.extra (configurado en app.json)
  // 3. process.env.VITE_* (compatibilidad con Vite)

  const endpoint =
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
    Constants.expoConfig?.extra?.appwriteEndpoint ||
    process.env.VITE_APPWRITE_PUBLIC_ENDPOINT ||
    "";

  const projectId =
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
    Constants.expoConfig?.extra?.appwriteProjectId ||
    process.env.VITE_APPWRITE_PROJECT_ID ||
    "";

  const platform = Constants.expoConfig?.slug || "com.jornadasdeatencion.app";

  if (!endpoint || !projectId) {
    console.error("Appwrite configuration missing:", {
      endpoint: endpoint ? "✓" : "✗",
      projectId: projectId ? "✓" : "✗",
      availableEnvVars: {
        EXPO_PUBLIC_APPWRITE_ENDPOINT:
          !!process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
        EXPO_PUBLIC_APPWRITE_PROJECT_ID:
          !!process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
        VITE_APPWRITE_PUBLIC_ENDPOINT:
          !!process.env.VITE_APPWRITE_PUBLIC_ENDPOINT,
        VITE_APPWRITE_PROJECT_ID: !!process.env.VITE_APPWRITE_PROJECT_ID,
        appConfig: !!Constants.expoConfig?.extra,
      },
    });
    throw new Error(
      "Appwrite configuration is missing. Please set EXPO_PUBLIC_APPWRITE_ENDPOINT and EXPO_PUBLIC_APPWRITE_PROJECT_ID in your .env file or app.json"
    );
  }

  return { endpoint, projectId, platform };
};

// Inicializar cliente de Appwrite
let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;
let storage: Storage | null = null;

export const getAppwriteClient = (): Client => {
  if (!client) {
    const config = getAppwriteConfig();
    client = new Client();
    client
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setPlatform(config.platform);
  }
  return client;
};

export const getAppwriteAccount = (): Account => {
  if (!account) {
    account = new Account(getAppwriteClient());
  }
  return account;
};

export const getAppwriteDatabases = (): Databases => {
  if (!databases) {
    databases = new Databases(getAppwriteClient());
  }
  return databases;
};

export const getAppwriteStorage = (): Storage => {
  if (!storage) {
    storage = new Storage(getAppwriteClient());
  }
  return storage;
};

// IDs de las bases de datos y colecciones (deberás crearlos en Appwrite Console)
export const APPWRITE_CONFIG = {
  DATABASE_ID: "6909241100357bdd2bcf", // ID de tu base de datos en Appwrite
  COLLECTIONS: {
    JORNADAS: "jornadas",
    APOYO_NEGOCIO: "apoyo_negocio",
    FERIAS_FESTIVALES: "ferias_festivales",
    DESARROLLO_COMERCIAL: "desarrollo_comercial",
    DESARROLLO_TURISTICO: "desarrollo_turistico",
    PROMOCION_TURISTICA: "promocion_turistica",
    ECONOMIA_SOCIAL: "economia_social",
    IMPULSO_INVERSIONES: "impulso_inversiones",
    FONDOS_FINANCIAMIENTO: "fondos_financiamiento",
  },
  STORAGE_BUCKETS: {
    IMAGES: "690cf3490012abf5e098", // ID de tu bucket de almacenamiento en Appwrite
    INE_IMAGES: "ine_images",
  },
};

export { ID, Models };
