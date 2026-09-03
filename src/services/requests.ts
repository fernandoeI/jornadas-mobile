import { Query } from "react-native-appwrite";
import { ServiceRequest } from "@/src/types/request";
import { APPWRITE_CONFIG, getAppwriteDatabases } from "./appwrite";

const mapDoc = (doc: any): ServiceRequest => ({
  id: doc.$id,
  folio: doc.folio,
  serviceId: doc.tramiteServicioId,
  unitId: doc.unidadAdministrativaId,
  applicantUserId: doc.solicitanteUserId,
  status: doc.estatus,
  requestedAt: doc.fechaSolicitud,
  assignedUserId: doc.asignadoAUserId,
  notes: doc.observaciones,
  eventId: doc.eventoAtencionId,
  eventFolio: doc.folioEvento,
  programFolio: doc.folioPrograma,
});

export const requestsService = {
  /** Lista todas las solicitudes accesibles (hasta 100, orden descendente por fecha) */
  async listAccessible(): Promise<ServiceRequest[]> {
    const result = await getAppwriteDatabases().listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.SOLICITUDES,
      [Query.orderDesc("fechaSolicitud"), Query.limit(100)]
    );
    return result.documents.map(mapDoc);
  },

  /** Obtiene todos los documentos accesibles para reportes, recorriendo la paginacion. */
  async listAllAccessible(): Promise<ServiceRequest[]> {
    const documents: any[] = [];
    const pageSize = 100;
    let offset = 0;
    while (true) {
      const result = await getAppwriteDatabases().listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.SOLICITUDES,
        [
          Query.orderDesc("fechaSolicitud"),
          Query.limit(pageSize),
          Query.offset(offset),
        ],
      );
      documents.push(...result.documents);
      if (result.documents.length < pageSize) break;
      offset += pageSize;
    }
    return documents.map(mapDoc);
  },

  /** Lista solicitudes filtradas por un evento de atención específico */
  async listByEvent(eventId: string): Promise<ServiceRequest[]> {
    const result = await getAppwriteDatabases().listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.SOLICITUDES,
      [
        Query.equal("eventoAtencionId", eventId),
        Query.orderDesc("fechaSolicitud"),
        Query.limit(200),
      ]
    );
    return result.documents.map(mapDoc);
  },
};
