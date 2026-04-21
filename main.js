import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { initDB } from "./src/db/init.js";
import { swaggerSpec } from "./src/config/swagger.js";
import authRoutes from "./src/routes/auth.routes.js";
import documentRoutes from "./src/routes/document.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => res.json({ message: "pong" }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/admin", adminRoutes);

app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message || "Error interno" });
});

// const start = async () => {
//     await initDB();
//     app.listen(process.env.PORT || 4000, () => {
//         console.log(`Servidor corriendo en puerto ${process.env.PORT || 4000}`);
//         console.log(`Docs: http://localhost:${process.env.PORT || 4000}/api-docs`);
//     });
// };

// start();

let initialized = false;

export default async function handler(req, res) {
    try {
        if (!initialized) {
            await initDB();
            initialized = true;
        }

        return app(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}