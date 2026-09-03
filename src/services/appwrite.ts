import Constants from "expo-constants";
import {
  Account,
  Client,
  Databases,
  Functions,
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

  const endpoint = (
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
    Constants.expoConfig?.extra?.appwriteEndpoint ||
    process.env.VITE_APPWRITE_PUBLIC_ENDPOINT ||
    ""
  ).trim();

  const projectId = (
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
    Constants.expoConfig?.extra?.appwriteProjectId ||
    process.env.VITE_APPWRITE_PROJECT_ID ||
    ""
  ).trim();

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
      "Appwrite configuration is missing. Please set EXPO_PUBLIC_APPWRITE_ENDPOINT and EXPO_PUBLIC_APPWRITE_PROJECT_ID in your .env file or app.json",
    );
  }

  return { endpoint, projectId, platform };
};

// Inicializar cliente de Appwrite
let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;
let storage: Storage | null = null;
let functions: Functions | null = null;

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

export const getAppwriteFunctions = (): Functions => {
  if (!functions) {
    functions = new Functions(getAppwriteClient());
  }
  return functions;
};

// IDs de las bases de datos y colecciones (deberás crearlos en Appwrite Console)
export const APPWRITE_CONFIG = {
  DATABASE_ID: "jornadas",
  COLLECTIONS: {
    UNIDADES_ADMINISTRATIVAS: "unidades_administrativas",
    USUARIOS_PERFIL: "usuarios_perfil",
    TRAMITES_SERVICIOS: "tramites_servicios",
    REQUISITOS: "requisitos",
    SOLICITUDES: "solicitudes",
    DOCUMENTOS_SOLICITUD: "documentos_solicitud",
    HISTORIAL_SOLICITUD: "historial_solicitud",
    FOLIO_CONTADORES: "folio_contadores",
    CONFIGURACION_FORMULARIO_GLOBAL: "configuracion_formulario_global",
    EVENTOS_ATENCION: "eventos_atencion",
    JORNADAS: "69543f1c00020e3d9923",
    APOYO_NEGOCIO: "apoyo_negocio",
    FERIAS_FESTIVALES: "ferias_festivales",
    DESARROLLO_COMERCIAL: "desarrollo_comercial",
    DESARROLLO_TURISTICO: "desarrollo_turistico",
    PROMOCION_TURISTICA: "690d186000159d33beab",
    ECONOMIA_SOCIAL: "69583dca003293334a52",
    IMPULSO_INVERSIONES: "impulso_inversiones",
    FONDOS_FINANCIAMIENTO: "fondos_financiamiento",
    COCINERAS_TRADICIONALES: "cocineras_tradicionales",
  },
  STORAGE_BUCKETS: {
    CATALOG_IMAGES: "catalog-images",
    IMAGES: "690cf3490012abf5e098", // ID de tu bucket de almacenamiento en Appwrite
    INE_IMAGES: "694ef0a10023fc5b74e1",
  },
};

export { ID, Models };
