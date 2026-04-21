import { requestPasswordService, loginService } from "../services/auth.service.js";

export const requestPassword = async (req, res) => {
    try {
        await requestPasswordService(req.body.cedula);
        res.json({ message: "Código enviado" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const login = async (req, res) => {
    try {
        const token = await loginService(req.body.cedula, req.body.code);
        res.json({ token });
    } catch (e) {
        res.status(401).json({ error: e.message });
    }
};
