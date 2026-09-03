import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const text = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
for (const line of text.split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
}

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const email = process.env.APPWRITE_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.APPWRITE_BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.APPWRITE_BOOTSTRAP_ADMIN_NAME?.trim() || "Super Administrador";
if (!endpoint || !projectId || !apiKey || !email || !password) throw new Error("Faltan las variables Appwrite o APPWRITE_BOOTSTRAP_ADMIN_EMAIL/APPWRITE_BOOTSTRAP_ADMIN_PASSWORD en .env");
if (!email.endsWith("@tabasco.gob.mx")) throw new Error("El superadministrador debe usar un correo @tabasco.gob.mx");
if (password.length < 8) throw new Error("La contraseña inicial debe tener al menos 8 caracteres");

const headers = { "content-type": "application/json", "x-appwrite-project": projectId, "x-appwrite-key": apiKey };
async function call(method, route, body) {
  const response = await fetch(`${endpoint}${route}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!response.ok) { const err = new Error(data.message || `Appwrite ${response.status}`); err.status = response.status; throw err; }
  return data;
}

let user;
const users = await call("GET", `/users?queries[]=${encodeURIComponent(JSON.stringify({ method: "equal", attribute: "email", values: [email] }))}`);
if (users.users?.length) {
  user = users.users[0];
  console.log("= Usuario administrador existente");
} else {
  user = await call("POST", "/users", { userId: "unique()", email, password, name });
  console.log("+ Usuario administrador");
}

await call("PUT", `/users/${user.$id}/labels`, { labels: [...new Set([...(user.labels || []), "superadmin"])] });

const profileRoute = `/databases/jornadas/collections/usuarios_perfil/documents/${user.$id}`;
try {
  await call("GET", profileRoute);
  await call("PATCH", profileRoute, { data: { nombre: name, rol: "super_admin", rolSistema: "super_admin", activo: true } });
  console.log("= Perfil super_admin actualizado");
} catch (error) {
  if (error.status !== 404) throw error;
  await call("POST", "/databases/jornadas/collections/usuarios_perfil/documents", {
    documentId: user.$id,
    permissions: [`read(\"user:${user.$id}\")`, `read(\"label:superadmin\")`, `update(\"label:superadmin\")`],
    data: { userId: user.$id, email, nombre: name, rol: "super_admin", rolSistema: "super_admin", activo: true }
  });
  console.log("+ Perfil super_admin");
}

console.log("Superadministrador inicial listo.");
