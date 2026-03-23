import nodemailer from "nodemailer";

export function createTransporter() {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_SECURE) === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
    const transporter = createTransporter();

    try {
        console.log("Email config check:", {
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            secure: String(process.env.EMAIL_SECURE) === "true",
            user: process.env.EMAIL_USER,
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            hasPass: Boolean(process.env.EMAIL_PASS),
        });

        await transporter.verify();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });

        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode,
        });
        throw error;
    }
}