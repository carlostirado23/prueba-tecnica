import jwt from "jsonwebtoken";

export const generateDownloadToken = (docId, userId) =>
    jwt.sign({ docId, userId, purpose: "download" }, process.env.JWT_SECRET, { expiresIn: "5m" });

export const verifyDownloadToken = (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== "download") throw new Error("Token inválido");
    return payload;
};
