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
