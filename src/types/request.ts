export type RequestStatus = "borrador" | "enviada" | "recibida" | "en_revision" | "requiere_informacion" | "aprobada" | "rechazada" | "cancelada" | "concluida";

export interface ServiceRequest {
  id: string;
  folio: string;
  serviceId: string;
  unitId: string;
  applicantUserId: string;
  status: RequestStatus;
  requestedAt: string;
  assignedUserId?: string;
  notes?: string;
  eventId?: string;
  eventFolio?: string;
  programFolio?: string;
}
