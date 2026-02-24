import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect } from "react";

export function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // Manejar deep links cuando la app está abierta
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      console.log("Deep link recibido:", url);

      // Parsear la URL
      const parsedUrl = Linking.parse(url);
      
      // Verificar si es el deep link de reset password
      // Appwrite puede enviar la URL de diferentes formas:
      // - jornadas://reset-password?userId=XXX&secret=YYY
      // - jornadas://reset-password/?userId=XXX&secret=YYY
      if (parsedUrl.scheme === "jornadas") {
        const path = parsedUrl.path || parsedUrl.hostname || "";
        
        if (path.includes("reset-password") || parsedUrl.hostname === "reset-password") {
          const userId = parsedUrl.queryParams?.userId as string;
          const secret = parsedUrl.queryParams?.secret as string;

          if (userId && secret) {
            // Navegar a la pantalla de reset password con los parámetros
            router.push({
              pathname: "/(auth)/reset-password",
              params: {
                userId,
                secret,
              },
            });
          } else {
            console.error("Deep link de reset password sin userId o secret:", parsedUrl);
          }
        }
      }
    };

    // Escuchar deep links cuando la app está abierta
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Manejar deep link inicial si la app se abrió desde un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Limpiar listener al desmontar
    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}

