import * as ImageManipulator from "expo-image-manipulator";
import { Dimensions, Platform } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

export const wp = (percentege: number) => {
  const width = deviceWidth;
  return (percentege * width) / 100;
};

export const hp = (percentege: number) => {
  const height = deviceHeight;
  return (percentege * height) / 100;
};

export interface INEScanResult {
  ine: File | { uri: string; name: string; type: string };
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  direccion: string;
  genero: "masculino" | "femenino" | "no binaria";
  edad: string;
  curp: string;
}

export const scanINEImage = async (
  file: File | { uri: string; name: string; type: string }
): Promise<string | null> => {
  console.log("🔍 Iniciando scanINEImage...");
  console.log("📁 Archivo para OCR:", file);

  const formData = new FormData();

  formData.append("apikey", "K86170781188957");
  formData.append("language", "spa");
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");

  if (Platform.OS === "web") {
    console.log("🌐 Plataforma web detectada");
    formData.append("file", file as File);
  } else {
    console.log("📱 Plataforma móvil detectada");
    formData.append("file", {
      uri: (file as any).uri,
      name: (file as any).name,
      type: (file as any).type,
    } as any);
  }

  try {
    console.log("📡 Enviando petición a OCR.space...");
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    console.log("📡 Respuesta recibida:", response.status, response.statusText);
    const result = await response.json();
    console.log("🔍 OCR SPACE RESULT:", result);

    if (result.IsErroredOnProcessing) {
      console.error("❌ Error de OCR:", result.ErrorMessage);
      return null;
    }

    const parsedText = result.ParsedResults?.[0]?.ParsedText || null;
    console.log("📝 Texto extraído:", parsedText);
    return parsedText;
  } catch (error) {
    console.error("❌ Error en fetch de OCR:", error);
    return null;
  }
};

const cropINE = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context no disponible");

  const { width, height } = img;
  const left = width * 0.08;
  const top = height * 0.22;
  const cropWidth = width * 0.84;
  const cropHeight = height * 0.56;

  canvas.width = cropWidth;
  canvas.height = cropHeight;
  ctx.drawImage(
    img,
    left,
    top,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return canvas;
};

export const compressImage = async (
  file: File | { uri: string; name: string; type: string },
  maxSizeInKB = 800
): Promise<File | { uri: string; name: string; type: string }> => {
  console.log("🔄 Iniciando compresión de imagen...");
  console.log("📁 Archivo original:", file);

  try {
    if (Platform.OS === "web") {
      console.log("🌐 Comprimiendo en web...");
      const webFile = file as File;

      // Crear una imagen para obtener dimensiones
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context no disponible");

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            console.log(
              "📐 Dimensiones originales:",
              img.width,
              "x",
              img.height
            );

            // Calcular nuevas dimensiones manteniendo aspect ratio
            const maxDimension = 1200;
            let { width, height } = img;

            if (width > height) {
              if (width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
            }

            console.log("📐 Dimensiones comprimidas:", width, "x", height);

            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen comprimida
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a blob con calidad reducida
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], webFile.name, {
                    type: "image/jpeg",
                  });
                  console.log("✅ Imagen comprimida en web:", compressedFile);
                  resolve(compressedFile);
                } else {
                  reject(new Error("Error al comprimir imagen"));
                }
              },
              "image/jpeg",
              0.7 // Calidad reducida
            );
          } catch (error) {
            console.error("❌ Error comprimiendo imagen en web:", error);
            reject(error);
          }
        };

        img.onerror = () => {
          console.error("❌ Error cargando imagen");
          reject(new Error("Error cargando imagen"));
        };

        img.src = URL.createObjectURL(webFile);
      });
    } else {
      console.log("📱 Comprimiendo en móvil...");
      const mobileFile = file as { uri: string; name: string; type: string };

      const result = await ImageManipulator.manipulateAsync(
        mobileFile.uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log("✅ Imagen comprimida en móvil:", result);
      return {
        uri: result.uri,
        name: mobileFile.name,
        type: "image/jpeg",
      };
    }
  } catch (error) {
    console.error("❌ Error en compresión:", error);
    // Si falla la compresión, devolver el archivo original
    return file;
  }
};

const calcularEdadDesdeFecha = (fechaStr: string): string => {
  if (!fechaStr) return "";

  try {
    const [dia, mes, año] = fechaStr.split("/").map(Number);
    const fechaNacimiento = new Date(año, mes - 1, dia);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNacimiento.getMonth();

    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())
    ) {
      return String(edad - 1);
    }

    return String(edad);
  } catch (error) {
    console.error("❌ Error calculando edad:", error);
    return "";
  }
};

const extractCURPFromLines = (lines: string[]): string => {
  const curpRegex = /[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    const inline = line.match(curpRegex);
    if (inline) return inline[0];
    const next = lines[i + 1]?.toUpperCase() || "";
    const match = next.match(curpRegex);
    if (match) return match[0];
  }
  const fallback = lines.join(" ").match(curpRegex);
  return fallback?.[0] || "";
};

export const processINE = async (
  file: File | { uri: string; name: string; type: string }
): Promise<INEScanResult | null> => {
  console.log("🔍 Iniciando processINE...");
  console.log("📁 Archivo de entrada:", file);

  try {
    console.log("🔄 Comprimiendo imagen...");
    const compressedFile = await compressImage(file, 800);
    console.log("✅ Imagen comprimida:", compressedFile);

    console.log("🔍 Enviando a OCR...");
    const text = await scanINEImage(compressedFile);
    console.log("📝 Texto extraído del OCR:", text);

    if (!text) {
      console.error("❌ No se obtuvo texto del OCR");
      return null;
    }

    console.log("🔍 Procesando líneas de texto...");
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    console.log("📝 Líneas encontradas:", lines);

    const indexNombre = lines.findIndex((line) => line === "NOMBRE");
    console.log("👤 Índice de NOMBRE:", indexNombre);

    const apellidoPaterno = lines[indexNombre + 1] || "";
    const apellidoMaterno = lines[indexNombre + 2] || "";
    const nombre = lines[indexNombre + 3] || "";

    console.log("👤 Datos extraídos:", {
      apellidoPaterno,
      apellidoMaterno,
      nombre,
    });

    const direccionIndex = lines.findIndex((line) => line === "DOMICILIO");
    console.log("🏠 Índice de DOMICILIO:", direccionIndex);

    const direccion = [
      lines[direccionIndex + 1],
      lines[direccionIndex + 2],
      lines[direccionIndex + 3],
    ]
      .filter(Boolean)
      .join(" ");

    console.log("🏠 Dirección extraída:", direccion);

    const curp = extractCURPFromLines(lines);
    console.log("🆔 CURP extraída:", curp);

    const fechaNacimiento =
      lines.find((line) => /^\d{2}\/\d{2}\/\d{4}$/.test(line)) ?? "";
    console.log("📅 Fecha de nacimiento:", fechaNacimiento);

    const sexoLine =
      lines.find((line) => line.startsWith("SEXO"))?.toUpperCase() || "";
    console.log("👥 Línea de sexo:", sexoLine);

    const sexo = sexoLine.includes("H")
      ? "masculino"
      : sexoLine.includes("M")
      ? "femenino"
      : "no binaria";

    console.log("👥 Sexo determinado:", sexo);

    const result = {
      ine: compressedFile, // Guardar la imagen comprimida
      nombre,
      primerApellido: apellidoPaterno,
      segundoApellido: apellidoMaterno,
      direccion,
      genero: sexo as "masculino" | "femenino" | "no binaria",
      edad: calcularEdadDesdeFecha(fechaNacimiento),
      curp,
    };

    console.log("✅ Resultado final:", result);
    return result;
  } catch (error) {
    console.error("❌ Error en processINE:", error);
    throw error;
  }
};
