import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "IPS Salud Ocupacional de los Andes – API",
            version: "1.0.0",
            description: "Módulo de consulta y descarga de documentos clínicos",
        },
        servers: [{ url: `https://prueba-tecnica-go9k.onrender.com` }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            },
            schemas: {
                Patient: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        cedula: { type: "string" },
                        email: { type: "string", format: "email" },
                        created_at: { type: "string", format: "date-time" },
                    },
                },
                Document: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        patient_id: { type: "string", format: "uuid" },
                        type: { type: "string", example: "concepto_medico" },
                        file_url: { type: "string" },
                        metadata: { type: "object" },
                        created_at: { type: "string", format: "date-time" },
                    },
                },
            },
        },
        tags: [
            { name: "Auth", description: "Autenticación de pacientes" },
            { name: "Documents", description: "Consulta y descarga de documentos" },
            { name: "Admin", description: "Gestión administrativa (requiere x-admin-key)" },
        ],
        paths: {
            "/auth/request-password": {
                post: {
                    tags: ["Auth"],
                    summary: "Solicitar código temporal",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { cedula: { type: "string" } },
                                    required: ["cedula"],
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Código enviado al correo registrado" },
                        400: { description: "Usuario no encontrado" },
                    },
                },
            },
            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Iniciar sesión con código temporal",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { cedula: { type: "string" }, code: { type: "string" } },
                                    required: ["cedula", "code"],
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "JWT retornado",
                            content: {
                                "application/json": {
                                    schema: { type: "object", properties: { token: { type: "string" } } },
                                },
                            },
                        },
                        401: { description: "Código incorrecto o expirado" },
                    },
                },
            },
            "/documents": {
                get: {
                    tags: ["Documents"],
                    summary: "Listar documentos del paciente autenticado",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: "Lista de documentos",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/Document" } },
                                },
                            },
                        },
                        401: { description: "No autorizado" },
                    },
                },
            },
            "/documents/{id}": {
                get: {
                    tags: ["Documents"],
                    summary: "Obtener detalle de un documento",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
                    ],
                    responses: {
                        200: {
                            description: "Documento encontrado",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Document" } } },
                        },
                        404: { description: "No encontrado" },
                    },
                },
            },
            "/documents/{id}/download": {
                get: {
                    tags: ["Documents"],
                    summary: "Descargar PDF del documento",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
                    ],
                    responses: {
                        200: { description: "Archivo PDF", content: { "application/pdf": {} } },
                        404: { description: "No encontrado" },
                    },
                },
            },
            "/admin/patients": {
                post: {
                    tags: ["Admin"],
                    summary: "Registrar paciente",
                    parameters: [{ in: "header", name: "x-admin-key", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { cedula: { type: "string" }, email: { type: "string" } },
                                    required: ["cedula", "email"],
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Paciente creado",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Patient" } } },
                        },
                        400: { description: "Error de validación" },
                        403: { description: "Acceso denegado" },
                    },
                },
            },
            "/admin/documents": {
                post: {
                    tags: ["Admin"],
                    summary: "Subir documento PDF para un paciente",
                    parameters: [{ in: "header", name: "x-admin-key", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        cedula: { type: "string" },
                                        type: {
                                            type: "string",
                                            enum: ["concepto_medico", "paraclinico", "examen_complementario"],
                                        },
                                        file: { type: "string", format: "binary" },
                                    },
                                    required: ["cedula", "type", "file"],
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Documento subido",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Document" } } },
                        },
                        400: { description: "Error de validación" },
                        403: { description: "Acceso denegado" },
                    },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
