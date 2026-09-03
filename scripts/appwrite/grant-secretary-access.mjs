import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const envText = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (match && !process.env[match[1]])
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
}

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "jornadas";
if (!endpoint || !projectId || !apiKey) throw new Error("Falta la configuración de Appwrite en .env");

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": projectId,
  "X-Appwrite-Key": apiKey,
};
const secretaryPermission = 'read("label:secretaria")';

async function call(method, pathname, body) {
  const response = await fetch(`${endpoint}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  const result = raw ? JSON.parse(raw) : {};
  if (!response.ok) throw new Error(`${response.status}: ${result.message || raw}`);
  return result;
}

for (const collectionId of ["solicitudes", "historial_solicitud"]) {
  let offset = 0;
  let updated = 0;
  while (true) {
    const queries = [JSON.stringify({ method: "limit", values: [100] }), JSON.stringify({ method: "offset", values: [offset] })];
    const params = new URLSearchParams();
    queries.forEach((query) => params.append("queries[]", query));
    const page = await call("GET", `/databases/${databaseId}/collections/${collectionId}/documents?${params}`);
    for (const document of page.documents) {
      const permissions = document.$permissions || [];
      if (!permissions.includes(secretaryPermission)) {
        await call("PATCH", `/databases/${databaseId}/collections/${collectionId}/documents/${document.$id}`, {
          data: {},
          permissions: [...permissions, secretaryPermission],
        });
        updated += 1;
      }
    }
    if (page.documents.length < 100) break;
    offset += 100;
  }
  console.log(`${collectionId}: ${updated} documentos actualizados`);
}
