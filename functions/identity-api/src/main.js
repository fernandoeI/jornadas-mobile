import fetch from "node-fetch";
import nodemailer from "nodemailer";
import { createHash } from "node:crypto";

const DATABASE_ID = "jornadas";

const findApplicantEmail = (data = {}) => {
  const entry = Object.entries(data).find(([key]) => /correo|email/i.test(key));
  const email = String(entry?.[1] || "")
    .trim()
    .toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

const sendRequestConfirmation = async ({
  to,
  folio,
  eventFolio,
  service,
  unit,
  event,
  requestedAt,
}) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  if (!host || !user || !password || !fromEmail)
    return { sent: false, reason: "SMTP no configurado" };

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure:
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
      Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass: password },
  });
  const lines = [
    "Tu solicitud fue registrada correctamente.",
    "",
    `Folio de la solicitud: ${folio}`,
    `Trámite o programa: ${service.nombre}`,
    `Unidad responsable: ${unit.nombre}`,
    `Evento: ${event.nombre}`,
    `Folio del evento: ${eventFolio}`,
    `Fecha de registro: ${requestedAt.toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}`,
    "Estatus: Enviada",
    "",
    "Conserva este correo para dar seguimiento a tu solicitud.",
  ];
  await transporter.sendMail({
    from: {
      name: process.env.SMTP_FROM_NAME || "Jornadas de Atención",
      address: fromEmail,
    },
    to,
    subject: `Solicitud registrada · ${folio}`,
    text: lines.join("\n"),
  });
  return { sent: true };
};

export default async ({ req, res, log, error }) => {
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT?.replace(
    /\/$/,
    "",
  );
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  // Instalaciones antiguas de Appwrite pueden exponer la clave dinámica con
  // APPWRITE_API_KEY en lugar de APPWRITE_FUNCTION_API_KEY.
  const apiKey =
    process.env.APPWRITE_SERVER_API_KEY ||
    process.env.APPWRITE_FUNCTION_API_KEY ||
    process.env.APPWRITE_API_KEY;
  const userId = req.headers["x-appwrite-user-id"];
  const userJwt = req.headers["x-appwrite-user-jwt"];

  log(
    `runtime-auth apiKey=${Boolean(apiKey)} jwt=${Boolean(userJwt)} user=${Boolean(userId)}`,
  );
  const call = async (method, route, body, jwt) => {
    const headers = {
      "content-type": "application/json",
      "x-appwrite-project": projectId,
    };
    if (jwt) headers["x-appwrite-jwt"] = jwt;
    else headers["x-appwrite-key"] = apiKey;
    const response = await fetch(`${endpoint}${route}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok)
      throw new Error(
        `${method} ${route}: ${data.message || `Appwrite ${response.status}`}`,
      );
    return data;
  };

  const json = (status, data) => res.json(data, status);
  const nextFolioNumber = async (key) => {
    const documentId = `tramite-${key}`
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(0, 36);
    try {
      const counter = await call(
        "GET",
        `/databases/${DATABASE_ID}/collections/folio_contadores/documents/${documentId}`,
      );
      const next = Number(counter.ultimo || 0) + 1;
      await call(
        "PATCH",
        `/databases/${DATABASE_ID}/collections/folio_contadores/documents/${documentId}`,
        { data: { ultimo: next } },
      );
      return next;
    } catch (cause) {
      if (!String(cause.message).toLowerCase().includes("could not be found"))
        throw cause;
      await call(
        "POST",
        `/databases/${DATABASE_ID}/collections/folio_contadores/documents`,
        {
          documentId,
          data: {
            periodo: createHash("sha1")
              .update(String(key))
              .digest("hex")
              .slice(0, 10),
            ultimo: 1,
          },
        },
      );
      return 1;
    }
  };
  if (!userId || !userJwt)
    return json(401, { message: "Se requiere una sesión válida" });

  try {
    const input =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const account = await call("GET", "/account", undefined, userJwt);
    const user = await call("GET", `/users/${userId}`);
    const labels = user.labels || [];
    const isSuperAdmin = labels.includes("superadmin");
    const profileRoute = `/databases/${DATABASE_ID}/collections/usuarios_perfil/documents/${userId}`;

    let profile;
    try {
      profile = await call("GET", profileRoute);
    } catch (cause) {
      if (!String(cause.message).toLowerCase().includes("could not be found"))
        throw cause;
    }

    if (input.action === "ensureProfile") {
      if (profile) return json(200, profile);
      const data = {
        userId,
        email: account.email,
        nombre: account.name || account.email.split("@")[0],
        rol: "solicitante",
        rolSistema: "solicitante",
        activo: true,
      };
      profile = await call(
        "POST",
        `/databases/${DATABASE_ID}/collections/usuarios_perfil/documents`,
        {
          documentId: userId,
          data,
          permissions: [
            `read(\"user:${userId}\")`,
            `update(\"user:${userId}\")`,
            `read(\"label:superadmin\")`,
            `update(\"label:superadmin\")`,
          ],
        },
      );
      if (!labels.includes("solicitante"))
        await call("PUT", `/users/${userId}/labels`, {
          labels: [...labels, "solicitante"],
        });
      return json(201, profile);
    }

    if (!profile?.activo)
      return json(403, { message: "La cuenta no tiene un perfil activo" });

    if (input.action === "submitRequest") {
      if (!isSuperAdmin && profile.rolSistema !== "capturista")
        return json(403, {
          message: "Solo un capturista puede generar solicitudes",
        });
      if (!input.eventId)
        return json(400, {
          message: "Debes seleccionar un evento de atención",
        });
      const service = await call(
        "GET",
        `/databases/${DATABASE_ID}/collections/tramites_servicios/documents/${input.serviceId}`,
      );
      if (!service.activo)
        return json(409, {
          message: "El trámite no está recibiendo solicitudes",
        });
      const now = Date.now();
      if (
        service.vigenciaInicio &&
        now < new Date(service.vigenciaInicio).getTime()
      )
        return json(409, { message: "El trámite todavía no está abierto" });
      if (service.vigenciaFin && now > new Date(service.vigenciaFin).getTime())
        return json(409, {
          message: "El periodo de recepción de este trámite finalizó",
        });
      const unit = await call(
        "GET",
        `/databases/${DATABASE_ID}/collections/unidades_administrativas/documents/${service.unidadAdministrativaId}`,
      );
      const stamp = new Date();
      let event;
      if (input.eventId) {
        event = await call(
          "GET",
          `/databases/${DATABASE_ID}/collections/eventos_atencion/documents/${input.eventId}`,
        );
        if (!event.activo)
          return json(409, {
            message: "El evento de atención ya no está activo",
          });
      }
      const eventFolio = event
        ? event.prefijoFolio || event.claveMunicipio
        : undefined;
      const folioNumber = await nextFolioNumber(service.$id);
      const programFolio = `${service.prefijoFolioPrograma || service.clave}-${String(folioNumber).padStart(6, "0")}`;
      const folio = programFolio;
      const permissions = [
        `read(\"user:${userId}\")`,
        `update(\"user:${userId}\")`,
        `read(\"team:${unit.teamId}\")`,
        `update(\"team:${unit.teamId}\")`,
        `read(\"label:superadmin\")`,
        `update(\"label:superadmin\")`,
        `read(\"label:secretaria\")`,
      ];
      const request = await call(
        "POST",
        `/databases/${DATABASE_ID}/collections/solicitudes/documents`,
        {
          documentId: "unique()",
          permissions,
          data: {
            folio,
            tramiteServicioId: service.$id,
            unidadAdministrativaId: unit.$id,
            solicitanteUserId: userId,
            estatus: "enviada",
            datosSolicitante: JSON.stringify(input.applicantData || {}),
            datosTramite: JSON.stringify(input.requestData || {}),
            fechaSolicitud: stamp.toISOString(),
            ...(event
              ? { eventoAtencionId: event.$id, folioEvento: eventFolio }
              : {}),
            ...(programFolio ? { folioPrograma: programFolio } : {}),
          },
        },
      );
      await call(
        "POST",
        `/databases/${DATABASE_ID}/collections/historial_solicitud/documents`,
        {
          documentId: "unique()",
          permissions,
          data: {
            solicitudId: request.$id,
            estatusNuevo: "enviada",
            comentario: "Solicitud registrada",
            realizadoPorUserId: userId,
            fecha: stamp.toISOString(),
          },
        },
      );
      const recipient = findApplicantEmail(input.applicantData);
      let emailResult = {
        sent: false,
        reason: recipient
          ? "No se intentó el envío"
          : "La solicitud no contiene un correo válido",
      };
      if (recipient) {
        try {
          emailResult = await sendRequestConfirmation({
            to: recipient,
            folio,
            eventFolio,
            service,
            unit,
            event,
            requestedAt: stamp,
          });
        } catch (cause) {
          emailResult = {
            sent: false,
            reason: cause.message || "No fue posible enviar el correo",
          };
          error(`email-confirmation ${folio}: ${emailResult.reason}`);
        }
      }
      return json(201, {
        id: request.$id,
        folio,
        eventFolio,
        programFolio,
        status: request.estatus,
        emailSent: emailResult.sent,
        emailMessage: emailResult.sent
          ? "Confirmación enviada por correo"
          : emailResult.reason,
      });
    }

    if (input.action === "createStaffUser") {
      if (!isSuperAdmin || profile.rol !== "super_admin")
        return json(403, {
          message: "Acceso exclusivo de superadministración",
        });
      if (
        !String(input.email || "")
          .toLowerCase()
          .endsWith("@tabasco.gob.mx")
      )
        return json(400, {
          message: "El usuario debe usar un correo @tabasco.gob.mx",
        });
      if (!["secretaria", "enlace", "gestor", "capturista"].includes(input.role))
        return json(400, { message: "Rol institucional no permitido" });
      const isSecretary = input.role === "secretaria";
      if (!isSecretary && !input.unitId)
        return json(400, { message: "Debes seleccionar una unidad administrativa" });
      const unit = isSecretary
        ? null
        : await call(
            "GET",
            `/databases/${DATABASE_ID}/collections/unidades_administrativas/documents/${input.unitId}`,
          );
      const created = await call("POST", "/users", {
        userId: "unique()",
        email: input.email,
        password: input.password,
        name: input.name,
      });
      await call("PUT", `/users/${created.$id}/labels`, {
        labels: [input.role],
      });
      if (unit)
        await call("POST", `/teams/${unit.teamId}/memberships`, {
          roles: ["member"],
          userId: created.$id,
        });
      const staffProfile = await call(
        "POST",
        `/databases/${DATABASE_ID}/collections/usuarios_perfil/documents`,
        {
          documentId: created.$id,
          permissions: [
            `read(\"user:${created.$id}\")`,
            `read(\"label:superadmin\")`,
            `update(\"label:superadmin\")`,
          ],
          data: {
            userId: created.$id,
            email: created.email,
            nombre: created.name,
            rol: ["secretaria", "capturista", "gestor"].includes(input.role)
              ? "enlace"
              : input.role,
            rolSistema: input.role,
            ...(unit ? { unidadAdministrativaId: unit.$id } : {}),
            activo: true,
          },
        },
      );
      return json(201, staffProfile);
    }

    if (input.action === "updateStatus") {
      if (
        !isSuperAdmin &&
        profile.rol !== "enlace" &&
        profile.rolSistema !== "gestor"
      )
        return json(403, {
          message: "No tienes permisos para atender solicitudes",
        });
      const request = await call(
        "GET",
        `/databases/${DATABASE_ID}/collections/solicitudes/documents/${input.requestId}`,
      );
      if (
        !isSuperAdmin &&
        request.unidadAdministrativaId !== profile.unidadAdministrativaId
      )
        return json(403, { message: "La solicitud pertenece a otra unidad" });
      const allowed = [
        "recibida",
        "en_revision",
        "requiere_informacion",
        "aprobada",
        "rechazada",
        "cancelada",
        "concluida",
      ];
      if (!allowed.includes(input.status))
        return json(400, { message: "Estatus no permitido" });
      const updated = await call(
        "PATCH",
        `/databases/${DATABASE_ID}/collections/solicitudes/documents/${request.$id}`,
        {
          data: { estatus: input.status, observaciones: input.comment || null },
        },
      );
      await call(
        "POST",
        `/databases/${DATABASE_ID}/collections/historial_solicitud/documents`,
        {
          documentId: "unique()",
          permissions: request.$permissions,
          data: {
            solicitudId: request.$id,
            estatusAnterior: request.estatus,
            estatusNuevo: input.status,
            comentario: input.comment || null,
            realizadoPorUserId: userId,
            fecha: new Date().toISOString(),
          },
        },
      );
      return json(200, updated);
    }

    return json(400, { message: "Acción no reconocida" });
  } catch (cause) {
    error(cause.stack || cause.message);
    return json(500, { message: cause.message || "Error interno" });
  }
};
