import { useAuth } from "@/src/providers/AuthProvider";
import { useRouter } from "expo-router";

export const useHome = () => {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return {
    user,
    handleLogout,
    handleNavigate,
  };
};


// NAVEACION A NEW REQUEST
export const useNewRequest = () => {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };


  const handleNavigate = (data: any, eventId?: string) => {
    router.push({
      pathname: '/new-request',
      params: {
        serviceId: data.id,
        title: data.title,
        subtitle: data.subtitle,
        active: String(data.estado),
        eventId: eventId || "",
      },
    } as any);
  };

  return {
    user,
    handleLogout,
    handleNavigate,
  };
};
