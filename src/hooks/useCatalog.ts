import { catalogService } from "@/src/services/catalog";
import { useQuery } from "@tanstack/react-query";

export const useServicesCatalog = () => useQuery({
  queryKey: ["catalog", "services"],
  queryFn: catalogService.listServices,
});

export const useServiceRequirements = (serviceId: string) => useQuery({
  queryKey: ["catalog", "requirements", serviceId],
  queryFn: () => catalogService.listRequirements(serviceId),
  enabled: Boolean(serviceId && serviceId !== "unknown"),
});

export const useCatalogService = (serviceId: string) => useQuery({
  queryKey: ["catalog", "service", serviceId],
  queryFn: () => catalogService.getService(serviceId),
  enabled: Boolean(serviceId && serviceId !== "unknown"),
});

export const useGlobalForm = () => useQuery({
  queryKey: ["catalog", "global-form"],
  queryFn: catalogService.getGlobalForm,
});

export const useActiveEvents = () => useQuery({
  queryKey: ["catalog", "events", "active"],
  queryFn: catalogService.listActiveEvents,
});
