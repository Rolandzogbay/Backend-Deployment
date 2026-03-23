import nodemailer from "nodemailer";

export function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

export async function sendEmail({ to, subject, text, html }) {
    const transporter = createTransporter();

    try {
        await transporter.verify(); // helps expose config/auth errors
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // keep the real error
    }
}