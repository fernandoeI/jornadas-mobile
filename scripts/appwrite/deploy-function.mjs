import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const envText = await fs.readFile(path.join(root, ".env"), "utf8");
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
}

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
if (!endpoint || !projectId || !apiKey) throw new Error("Falta la configuración de Appwrite en .env");

const sourceDir = path.join(root, "functions", "identity-api");
const archive = path.join(os.tmpdir(), `identity-api-${Date.now()}.tar.gz`);
try {
  execFileSync("tar.exe", ["-czf", archive, "package.json", "src"], { cwd: sourceDir, stdio: "inherit" });
  const bytes = await fs.readFile(archive);
  const form = new FormData();
  form.append("entrypoint", "src/main.js");
  form.append("commands", "npm install");
  form.append("activate", "true");
  form.append("code", new Blob([bytes], { type: "application/gzip" }), "code.tar.gz");
  const response = await fetch(`${endpoint}/functions/identity-api/deployments`, {
    method: "POST",
    headers: { "X-Appwrite-Project": projectId, "X-Appwrite-Key": apiKey },
    body: form,
  });
  const raw = await response.text();
  const result = raw ? JSON.parse(raw) : {};
  if (!response.ok) throw new Error(`${response.status}: ${result.message || raw}`);
  console.log(`Deployment creado: ${result.$id}`);
  console.log(`Estado inicial: ${result.status}`);
} finally {
  await fs.rm(archive, { force: true });
}
