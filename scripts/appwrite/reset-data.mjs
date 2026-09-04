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
const adminEmail = process.env.APPWRITE_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const databaseId = "jornadas";

if (!endpoint || !projectId || !apiKey || !adminEmail)
  throw new Error("Falta la configuración de Appwrite o el correo del administrador inicial");

const headers = {
  "content-type": "application/json",
  "x-appwrite-project": projectId,
  "x-appwrite-key": apiKey,
};

async function call(method, route, body) {
  const response = await fetch(`${endpoint}${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!response.ok)
    throw new Error(`${method} ${route}: ${response.status} ${data.message || raw}`);
  return data;
}

const userQuery = encodeURIComponent(
  JSON.stringify({ method: "equal", attribute: "email", values: [adminEmail] }),
);
const adminUsers = await call("GET", `/users?queries[]=${userQuery}`);
const admin = adminUsers.users?.[0];
if (!admin) throw new Error("No se encontró el administrador inicial; no se eliminó ningún dato");

const adminProfile = await call(
  "GET",
  `/databases/${databaseId}/collections/usuarios_perfil/documents/${admin.$id}`,
);
if (adminProfile.rol !== "super_admin" && adminProfile.rolSistema !== "super_admin")
  throw new Error("La cuenta protegida no es superadministrador; no se eliminó ningún dato");

const collections = [
  "historial_solicitud",
  "documentos_solicitud",
  "solicitudes",
  "requisitos",
  "tramites_servicios",
  "eventos_atencion",
  "configuracion_formulario_global",
  "folio_contadores",
  "unidades_administrativas",
  "usuarios_perfil",
];

const limitQuery = encodeURIComponent(JSON.stringify({ method: "limit", values: [100] }));
for (const collectionId of collections) {
  let deleted = 0;
  while (true) {
    const result = await call(
      "GET",
      `/databases/${databaseId}/collections/${collectionId}/documents?total=false&queries[]=${limitQuery}`,
    );
    const removable = (result.documents || []).filter(
      (document) => !(collectionId === "usuarios_perfil" && document.$id === admin.$id),
    );
    if (!removable.length) break;
    for (const document of removable) {
      await call(
        "DELETE",
        `/databases/${databaseId}/collections/${collectionId}/documents/${document.$id}`,
      );
      deleted += 1;
    }
  }
  console.log(`${collectionId}: ${deleted} registros eliminados`);
}

for (const bucketId of ["catalog-images", "request-documents"]) {
  let deleted = 0;
  while (true) {
    const result = await call("GET", `/storage/buckets/${bucketId}/files?total=false&queries[]=${limitQuery}`);
    if (!result.files?.length) break;
    for (const file of result.files) {
      await call("DELETE", `/storage/buckets/${bucketId}/files/${file.$id}`);
      deleted += 1;
    }
  }
  console.log(`${bucketId}: ${deleted} archivos eliminados`);
}

let removedUsers = 0;
while (true) {
  const result = await call("GET", `/users?total=false&queries[]=${limitQuery}`);
  const removable = (result.users || []).filter((user) => user.$id !== admin.$id);
  if (!removable.length) break;
  for (const user of removable) {
    await call("DELETE", `/users/${user.$id}`);
    removedUsers += 1;
  }
}

console.log(`usuarios: ${removedUsers} cuentas eliminadas`);
console.log("Reinicio terminado. Se conservó únicamente el superadministrador.");
