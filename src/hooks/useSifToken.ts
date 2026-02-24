import { useQuery } from "@tanstack/react-query";
import { getSifToken } from "@/src/services/tandas";

/**
 * Hook para obtener y cachear el token SIF usando TanStack Query
 * El token se cachea en memoria por 55 minutos (staleTime)
 * y se mantiene en cache por 60 minutos (cacheTime)
 */
export const useSifToken = () => {
  return useQuery({
    queryKey: ["tandas", "sif-token"],
    queryFn: getSifToken,
    staleTime: 55 * 60 * 1000, // 55 minutos
    gcTime: 60 * 60 * 1000, // 60 minutos (anteriormente cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

