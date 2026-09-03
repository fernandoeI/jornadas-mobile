# Infraestructura de Appwrite

El aprovisionador crea de forma idempotente la base de datos, colecciones, atributos, índices, equipos por unidad administrativa y datos iniciales.

Variables requeridas en `.env`:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://servidor.example/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=project_id
APPWRITE_API_KEY=secret
```

Ejecutar:

```bash
npm run appwrite:provision
```

Para crear el primer superadministrador, agrega temporalmente las variables
`APPWRITE_BOOTSTRAP_ADMIN_EMAIL`, `APPWRITE_BOOTSTRAP_ADMIN_PASSWORD` y,
opcionalmente, `APPWRITE_BOOTSTRAP_ADMIN_NAME`; después ejecuta:

```bash
npm run appwrite:bootstrap-admin
```

Desplegar o actualizar la función administrativa segura:

```bash
npm run appwrite:deploy-function
```

Los nombres oficiales y el catálogo inicial se editan en `seed.json`. La API key es exclusivamente administrativa y nunca debe usar el prefijo `EXPO_PUBLIC_`.
