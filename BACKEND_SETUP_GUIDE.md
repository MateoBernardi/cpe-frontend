# Guía de setup para Backend - Prisma + Seed

## Requisitos previos

El frontend envía `tenant_id: 1` en las requests POST. Las secciones se crean automáticamente al hacer POST, así que **no hace falta crearlas manualmente**.

---

## 1. Introspección (si las tablas ya existen en la DB)

```bash
npx prisma db pull        # Genera schema.prisma desde las tablas existentes
npx prisma generate       # Genera el Prisma Client
```

Si preferís manejar todo con migraciones de Prisma:

```bash
npx prisma migrate dev --name init
```

---

## 2. Seed mínimo (SQL directo)

```sql
-- Crear tenant por defecto (OBLIGATORIO)
INSERT INTO tenant (name) VALUES ('default');

-- Roles base (para cuando se integre auth)
INSERT INTO role (name, scope) VALUES ('admin', 'SYSTEM');
INSERT INTO role (name, scope) VALUES ('editor', 'TENANT_INTERNAL');

-- Usuario admin (opcional por ahora)
INSERT INTO "user" (username, password, email, name, surname, tenant_id, role_id, user_type)
VALUES ('admin', '$2b$10$placeholder_hash', 'admin@cpe.com', 'Admin', 'CPE', 1, 1, 'STAFF');
```

---

## 3. Seed con Prisma (`prisma/seed.ts`)

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tenant por defecto
  const tenant = await prisma.tenant.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'default' },
  })

  // Roles base
  await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'admin', scope: 'SYSTEM' },
  })

  await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'editor', scope: 'TENANT_INTERNAL' },
  })

  console.log('Seed completado. Tenant ID:', tenant.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 4. Configurar seed en `package.json` del backend

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 5. Ejecutar seed

```bash
npx prisma db seed
```

---

## Resumen

| Paso | Qué hacer | Por qué |
|------|-----------|---------|
| **Tener un `tenant`** con `id=1` | El frontend envía `tenant_id: 1` en el POST | Obligatorio |
| **No crear secciones** | La API las crea on-the-fly | El POST crea `hero`, `about`, etc. al vuelo |
| **Roles + user** | Opcional por ahora | Para cuando se integre auth |

---

## Verificación

Con el backend corriendo en `http://localhost:3000`, probar:

```bash
# Crear contenido en hero
curl -X POST "http://localhost:3000/content/sections" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "tenant_id": 1,
    "section_name": "hero",
    "texts": [
      {
        "title": "Bienvenido",
        "body": "Tu mensaje principal",
        "role": "headline",
        "order": 0
      }
    ]
  }'

# Leer la sección
curl -X GET "http://localhost:3000/content/sections/hero" \
  -H "Accept: application/json"
```

Si ambos responden correctamente, el frontend ya puede consumir la API.
