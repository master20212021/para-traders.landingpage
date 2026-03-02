# P'Traders — Guía de Configuración: Acceso por Código + Hotmart

## Arquitectura

```
Comprador → Hotmart → Webhook → Supabase Edge Function → course_access table
                                                              ↑
Landing page (auth.js) → Supabase RPC (validate_course_code) ─┘
```

**Componentes:**
- **Supabase** (existente): nueva tabla `course_access` + funciones RPC
- **Supabase Edge Function**: recibe webhooks de Hotmart, genera códigos
- **Landing page**: `auth.js` valida códigos contra Supabase
- **App (para_traders_v2)**: **NO SE MODIFICA** — completamente independiente

---

## Paso 1: Crear la tabla en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/taxokgvwudsjkqgxxntx/sql)
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `01_course_access_table.sql`
4. Ejecuta el script
5. Verifica que la tabla `course_access` aparece en **Table Editor**
6. Verifica que el código legacy `XK7-PT26-9F3M` aparece como registro activo

---

## Paso 2: Desplegar el Edge Function (Hotmart Webhook)

### Opción A: Desde Supabase CLI (recomendado)

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Vincular al proyecto
supabase link --project-ref taxokgvwudsjkqgxxntx

# Crear la función
supabase functions new hotmart-webhook

# Reemplazar el contenido de supabase/functions/hotmart-webhook/index.ts
# con el archivo 02_hotmart_webhook_function.ts

# Configurar secrets
supabase secrets set HOTMART_HOTTOK=tu_hottok_de_hotmart
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Desplegar
supabase functions deploy hotmart-webhook --no-verify-jwt
```

> **IMPORTANTE**: `--no-verify-jwt` es necesario porque Hotmart envía webhooks sin JWT.

### Opción B: Desde el Dashboard

1. Ve a **Edge Functions** en el dashboard de Supabase
2. Crea una nueva función llamada `hotmart-webhook`
3. Pega el código de `02_hotmart_webhook_function.ts`
4. Configura los secrets en **Settings > Edge Functions > Secrets**

---

## Paso 3: Configurar Hotmart

1. Ve a tu producto en [Hotmart](https://app.hotmart.com)
2. **Configuración** → **Webhooks** (o Notificaciones API)
3. Agrega un nuevo webhook:
   - **URL**: `https://taxokgvwudsjkqgxxntx.supabase.co/functions/v1/hotmart-webhook`
   - **Eventos**: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `PURCHASE_CANCELED`, `PURCHASE_CHARGEBACK`
4. Copia el **Hottok** que Hotmart te da
5. Configúralo como secret en Supabase: `HOTMART_HOTTOK=tu_hottok`

---

## Paso 4: Entregar el código al comprador

### Opción A: Email manual
Cuando un comprador realiza la compra:
1. Ve a Supabase → Table Editor → `course_access`
2. Busca el registro creado automáticamente por el webhook
3. Copia el `access_code` (formato PT-XXXX-XXXX)
4. Envíalo al comprador por email

### Opción B: Automático via Hotmart
Configura en Hotmart una "Página de agradecimiento" personalizada que le diga al comprador que recibirá su código por email. Luego puedes automatizar el envío con:
- Hotmart + Zapier/Make → Email con el código
- O un segundo Edge Function que envíe emails via SendGrid/Resend

### Opción C: Generar códigos manualmente (sin webhook)
Si prefieres no configurar el webhook por ahora:
```sql
-- En Supabase SQL Editor:
INSERT INTO course_access (email, access_code, buyer_name, notes)
VALUES ('comprador@email.com', generate_course_code(), 'Nombre del Comprador', 'Venta Hotmart manual');

-- Ver el código generado:
SELECT access_code FROM course_access WHERE email = 'comprador@email.com' ORDER BY created_at DESC LIMIT 1;
```

---

## Administración

### Ver todos los códigos activos
```sql
SELECT email, access_code, buyer_name, created_at
FROM course_access
WHERE active = true
ORDER BY created_at DESC;
```

### Revocar acceso (reembolso manual)
```sql
UPDATE course_access
SET active = false, revoked_at = now()
WHERE email = 'comprador@email.com';
```

### Generar código nuevo para un comprador
```sql
INSERT INTO course_access (email, access_code, buyer_name, notes)
VALUES ('nuevo@email.com', generate_course_code(), 'Nombre', 'Generado manualmente');
```

---

## Flujo del Usuario

1. **Compra en Hotmart** → Webhook crea código automáticamente
2. **Recibe su código** (PT-XXXX-XXXX) por email o thank-you page
3. **Visita paratrades.com** → Hace clic en una herramienta
4. **Modal pide el código** → Ingresa su código único
5. **Validación contra Supabase** → Si es válido, acceso concedido
6. **Código se guarda en localStorage** → No necesita re-ingresarlo
7. **Si hay reembolso** → Webhook desactiva el código automáticamente
8. **Si comparte el URL directo** → Auth guard redirige a la landing page

---

## Seguridad

- ✅ Códigos únicos por comprador (no uno compartido)
- ✅ Validación server-side contra Supabase (no hardcoded)
- ✅ Revocación automática en reembolsos
- ✅ Auth guard en todas las páginas de herramientas
- ✅ RLS habilitado — anon solo puede usar la función RPC
- ✅ Legacy code (`XK7-PT26-9F3M`) sigue funcionando para usuarios existentes
- ✅ La app (para_traders_v2) NO se modifica en absoluto
