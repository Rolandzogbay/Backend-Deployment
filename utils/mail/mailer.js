import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, text, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
        });

        if (error) {
            console.error("Resend API error:", error);
            throw new Error(error.message || "Failed to send email");
        }

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}