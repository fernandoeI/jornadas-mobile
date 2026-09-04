import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const envText = await fs.readFile(path.join(root, ".env"), "utf8");
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (match && !process.env[match[1]])
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
}

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const siteId = "jornadas-web";
if (!endpoint || !projectId || !apiKey) throw new Error("Falta la configuración de Appwrite");

const headers = { "X-Appwrite-Project": projectId, "X-Appwrite-Key": apiKey };
const archive = path.join(os.tmpdir(), `jornadas-web-${Date.now()}.tar.gz`);
try {
  execFileSync("tar.exe", ["-czf", archive, "-C", path.join(root, "dist"), "."], { stdio: "inherit" });
  const form = new FormData();
  form.append("installCommand", "");
  form.append("buildCommand", "");
  form.append("outputDirectory", ".");
  form.append("activate", "true");
  form.append("code", new Blob([await fs.readFile(archive)], { type: "application/gzip" }), "site.tar.gz");
  const response = await fetch(`${endpoint}/sites/${siteId}/deployments`, { method: "POST", headers, body: form });
  const raw = await response.text();
  const deployment = raw ? JSON.parse(raw) : {};
  if (!response.ok) throw new Error(`${response.status}: ${deployment.message || raw}`);
  console.log(`Deployment creado: ${deployment.$id}`);

  let current = deployment;
  for (let attempt = 0; attempt < 30 && !["ready", "failed"].includes(current.status); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusResponse = await fetch(`${endpoint}/sites/${siteId}/deployments/${deployment.$id}`, { headers });
    current = await statusResponse.json();
  }
  console.log(`Estado: ${current.status}`);
  if (current.status === "failed") throw new Error(current.buildLogs || "Falló el despliegue del sitio");
  const siteResponse = await fetch(`${endpoint}/sites/${siteId}`, { headers });
  const site = await siteResponse.json();
  console.log(`Dominios: ${(site.domains || []).join(", ") || "consulta el sitio en la consola de Appwrite"}`);
} finally {
  await fs.rm(archive, { force: true });
}
