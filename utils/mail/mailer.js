import nodemailer from "nodemailer";

export function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_SECURE) === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: true,
        debug: true,
    });
}

export async function sendEmail({ to, subject, text, html }) {
    const transporter = createTransporter();

    try {
        console.log("MAIL CONFIG", {
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            secure: String(process.env.EMAIL_SECURE) === "true",
            user: process.env.EMAIL_USER,
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            hasPass: Boolean(process.env.EMAIL_PASS),
            passLength: process.env.EMAIL_PASS?.length || 0,
        });

        await transporter.verify();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });

        console.log("EMAIL SENT", info.messageId);
        return info;
    } catch (error) {
        console.error("MAIL ERROR FULL:", error);
        console.error("MAIL ERROR DETAILS:", {
            message: error?.message,
            code: error?.code,
            command: error?.command,
            response: error?.response,
            responseCode: error?.responseCode,
        });
        throw error;
    }
}