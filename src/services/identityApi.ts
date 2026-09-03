import { ExecutionMethod } from "react-native-appwrite";
import { getAppwriteFunctions } from "./appwrite";

const FUNCTION_ID = "identity-api";

async function execute<T>(payload: Record<string, unknown>): Promise<T> {
  const execution = await getAppwriteFunctions().createExecution(
    FUNCTION_ID,
    JSON.stringify(payload),
    false,
    undefined,
    ExecutionMethod.POST,
  );
  const response = execution.responseBody
    ? JSON.parse(execution.responseBody)
    : {};
  if (execution.status === "failed" || execution.responseStatusCode >= 400) {
    throw new Error(response.message || "La operación no pudo completarse");
  }
  return response as T;
}

export interface SubmittedRequest {
  id: string;
  folio: string;
  eventFolio?: string;
  programFolio?: string;
  status: string;
}

export const identityApi = {
  ensureProfile: () => execute({ action: "ensureProfile" }),
  submitRequest: (
    serviceId: string,
    applicantData: unknown,
    requestData: unknown,
    eventId?: string,
  ) =>
    execute<SubmittedRequest>({
      action: "submitRequest",
      serviceId,
      applicantData,
      requestData,
      eventId,
    }),
  createStaffUser: (data: {
    email: string;
    password: string;
    name: string;
    unitId?: string;
    role: "secretaria" | "enlace" | "gestor" | "capturista";
  }) => execute({ action: "createStaffUser", ...data }),
  updateStatus: (requestId: string, status: string, comment?: string) =>
    execute({ action: "updateStatus", requestId, status, comment }),
};
