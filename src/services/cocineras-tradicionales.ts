import { CocinerasTradicionalesFormData } from "@/src/forms/schemas/CocinerasTradicionalesForm";
import { ID } from "react-native-appwrite";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
} from "./appwrite";

const getCurrentUserId = async (): Promise<string> => {
  const account = getAppwriteAccount();
  const user = await account.get().catch(() => null);
  return user?.$id ?? "anonymous";
};

const create = async (data: CocinerasTradicionalesFormData): Promise<any> => {
  const databases = getAppwriteDatabases();
  const userId = await getCurrentUserId();
  const timestamp = new Date().toISOString();

  const documentData = {
    nombre: data.nombre,
    rutaTuristica: data.rutaTuristica,
    municipio: data.municipio,
    localidad: data.localidad,
    direccion: data.direccion,
    cuentaEstablecimiento: data.cuentaEstablecimiento === "si",
    nombreEstablecimiento:
      data.cuentaEstablecimiento === "si" ? data.nombreEstablecimiento : null,
    telefono: data.telefono,
    email: data.email,
    redesSociales: data.redesSociales || null,
    platilloEspecialidades: data.platilloEspecialidades,
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const document = await databases.createDocument(
    APPWRITE_CONFIG.DATABASE_ID,
    APPWRITE_CONFIG.COLLECTIONS.COCINERAS_TRADICIONALES,
    ID.unique(),
    documentData
  );

  return document;
};

export const cocinerasTradicionalesService = {
  create,
};
