import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendTempCode = async (email, code) => {
    if (!process.env.EMAIL_USER) {
        console.log(`[EMAIL] → ${email} | Código: ${code}`);
        return;
    }
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@saludocupacional.com",
        to: email,
        subject: "Código de acceso - Salud Ocupacional de los Andes",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #1a5276;">Código de acceso</h2>
                <p>Tu código de acceso temporal es:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                            background: #f0f4f8; padding: 16px; text-align: center;
                            border-radius: 8px; margin: 16px 0;">
                    ${code}
                </div>
                <p style="color: #666;">Este código expira en <strong>10 minutos</strong>.</p>
                <p style="color: #999; font-size: 12px;">
                    Si no solicitaste este código, ignora este mensaje.
                </p>
            </div>
        `,
    });
};
