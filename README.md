# Módulo de Consulta y Descarga de Documentos Clínicos
### IPS Salud Ocupacional de los Andes

Backend desarrollado como prueba técnica. Permite a pacientes autenticarse mediante cédula y un código temporal, consultar sus documentos clínicos y descargarlos en formato PDF generado dinámicamente.

---

## Requisitos previos

- Node.js v18+
- PostgreSQL (base de datos creada previamente)

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Editar el archivo .env con tus credenciales (ver sección Variables de entorno)

# 3. Crear tablas en la base de datos (solo la primera vez)
# En .env, cambiar MIGRATE=true, iniciar el servidor, luego volver a MIGRATE=false

# 4. Iniciar servidor
npm run dev
```

Servidor disponible en: `http://localhost:4000`

Documentación interactiva (Swagger): `http://localhost:4000/api-docs`

---

## Variables de entorno

```env
PORT=4000

# Base de datos
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=prueba-tecnica

# JWT
JWT_SECRET=clave_secreta_larga

# Migraciones automáticas (true solo la primera vez)
MIGRATE=false

# Clave para endpoints administrativos
ADMIN_KEY=admin123

# Correo electrónico (dejar EMAIL_USER vacío para usar consola en desarrollo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=app_password_de_16_digitos
EMAIL_FROM=noreply@saludocupacional.com
```

> Para Gmail: activar verificación en 2 pasos y generar una **contraseña de aplicación** en `myaccount.google.com/security`.

---

## Arquitectura

El sistema sigue una **arquitectura en capas** con separación clara de responsabilidades:

```
main.js                        → Bootstrap: carga rutas, swagger, inicia DB
src/
  config/
    database.js                → Instancia única de Sequelize (PostgreSQL)
    swagger.js                 → Especificación OpenAPI 3.0
  models/                      → Definición de entidades (Sequelize)
  repositories/                → Acceso a datos, sin lógica de negocio
  services/                    → Lógica de negocio pura
  controllers/                 → Manejo de request/response HTTP
  routes/                      → Definición de endpoints y middlewares por módulo
  middlewares/                 → JWT auth, validación de clave admin
```

### Entidades

**Paciente** (`pacientes`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| cedula | STRING | Número de cédula (único) |
| email | STRING | Correo para envío de código |
| temp_code | STRING | Código temporal hasheado (bcrypt) |
| temp_code_expires | DATE | Expiración del código (10 min) |
| created_at | TIMESTAMP | Fecha de registro |

**Documento** (`documentos`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| patient_id | UUID | FK → Paciente |
| type | STRING | Tipo de documento |
| status | ENUM | activo / pendiente / inactivo |
| metadata | JSON | Contenido clínico estructurado |
| created_at | TIMESTAMP | Fecha de creación |

---

## Flujo de uso

### 1. Registro de paciente (Admin)
```
POST /admin/patients
Header: x-admin-key: admin123

{
  "cedula": "1005523753",
  "email": "paciente@correo.com"
}
```

### 2. Creación de documento (Admin)
```
POST /admin/documents
Header: x-admin-key: admin123

{
  "cedula": "1005523753",
  "type": "concepto_medico",
  "content": {
    "paciente": "Carlos Tirado",
    "cedula": "1005523753",
    "fecha": "2026-04-21",
    "medico": "Dr. García",
    "diagnostico": "Apto para trabajo en alturas",
    "concepto": "APTO",
    "recomendaciones": "Uso obligatorio de arnés"
  }
}
```

### 3. Solicitar código de acceso (Paciente)
```
POST /auth/request-password

{ "cedula": "1005523753" }
→ El código llega al correo registrado
```

### 4. Login
```
POST /auth/login

{ "cedula": "1005523753", "code": "482931" }
→ { "token": "eyJ..." }
```

### 5. Consultar documentos
```
GET /documents
Authorization: Bearer eyJ...

→ Lista de documentos del paciente
```

### 6. Solicitar URL de descarga firmada
```
GET /documents/:id/download
Authorization: Bearer eyJ...

→ { "url": "http://localhost:4000/documents/:id/file?token=eyJ...", "expiresIn": 300 }
```

### 7. Descargar PDF
```
GET /documents/:id/file?token=eyJ...
→ Archivo PDF generado al instante
```

---

## Endpoints completos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/request-password` | — | Solicita código temporal |
| POST | `/auth/login` | — | Login y obtención de JWT |
| GET | `/documents` | Bearer JWT | Lista documentos del paciente |
| GET | `/documents/:id` | Bearer JWT | Detalle de un documento |
| GET | `/documents/:id/download` | Bearer JWT | Genera URL firmada (5 min) |
| GET | `/documents/:id/file?token=` | Token en query | Descarga el PDF |
| POST | `/admin/patients` | x-admin-key | Registra un paciente |
| POST | `/admin/documents` | x-admin-key | Crea un documento clínico |
| GET | `/api-docs` | — | Documentación Swagger UI |

---

## Tipos de documentos soportados

| Tipo | Campos requeridos en `content` |
|------|-------------------------------|
| `concepto_medico` | paciente, cedula, fecha, medico, diagnostico, concepto, recomendaciones |
| `paraclinico` | paciente, cedula, fecha, laboratorio, examenes[ ] |
| `examen_complementario` | paciente, cedula, fecha, tipoExamen, medico, hallazgos, conclusion |

> El sistema es **extensible**: agregar un nuevo tipo de documento requiere únicamente añadir una función de plantilla en `pdf.service.js`, sin modificar la base de datos ni la lógica de rutas.

---

## Seguridad implementada

- **Autenticación sin contraseña fija**: código temporal de 6 dígitos, válido 10 minutos, de un solo uso.
- **Bcrypt**: el código temporal se almacena hasheado en la base de datos; nunca en texto plano.
- **JWT**: token de sesión firmado con expiración de 1 hora.
- **URLs firmadas para descarga**: se genera un JWT de propósito específico (`purpose: "download"`) con vigencia de 5 minutos. El paciente recibe la URL temporal y la usa para descargar sin necesidad de exponer su token de sesión.
- **Validación de propiedad**: antes de generar la URL o el PDF, se verifica que el documento pertenezca al paciente autenticado (`WHERE id = ? AND patient_id = ?`).
- **Rate limiting**: los endpoints de autenticación están limitados a 10 solicitudes por IP cada 15 minutos para prevenir fuerza bruta.
- **Módulo admin aislado**: protegido por clave estática en header `x-admin-key`, completamente separado del flujo de pacientes.

---

## Decisiones técnicas

### Generación dinámica de PDF vs. almacenamiento de archivos

El requerimiento original especificaba un campo `file_url` para almacenar la ruta de un archivo PDF previamente subido. Se tomó la decisión de reemplazar este enfoque por **generación dinámica de PDF en tiempo de descarga** usando `pdfkit`.

**Razones:**

1. **Simplicidad operacional**: no se requiere sistema de almacenamiento de archivos (carpeta local, S3, etc.), lo que reduce la complejidad de infraestructura y facilita el despliegue.

2. **Datos estructurados**: al almacenar el contenido clínico como JSON en el campo `metadata`, los documentos son consultables, filtrables y auditables directamente desde la base de datos. Un archivo PDF binario no lo es.

3. **Consistencia garantizada**: el PDF siempre refleja los datos actuales en la base de datos. Un archivo almacenado puede quedar desactualizado si se modifica la información del paciente.

4. **Escalabilidad**: en una arquitectura de microservicios o con múltiples instancias, el almacenamiento local de archivos crea problemas de sincronización. La generación dinámica es stateless y escala horizontalmente sin configuración adicional.

5. **Extensibilidad de tipos**: el diseño de plantillas en `pdf.service.js` permite agregar nuevos tipos de documentos sin ningún cambio en la base de datos, solo añadiendo una función de renderizado.

El campo `file_url` fue eliminado del modelo dado que su rol queda cubierto por el endpoint `GET /documents/:id/file`. En un entorno de producción real, si se requiriera cacheo de PDFs por volumen, se podría almacenar el PDF generado en un servicio como S3 y guardar esa URL en `file_url`, siendo esta una extensión natural del diseño actual sin cambios estructurales.

---

## Prueba de endpoints con Swagger

1. Iniciar el servidor: `npm run dev`
2. Abrir `http://localhost:4000/api-docs`
3. Usar el flujo descrito arriba directamente desde la interfaz
4. Para endpoints protegidos con JWT: hacer login → copiar token → clic en **Authorize** → pegar `Bearer <token>`
