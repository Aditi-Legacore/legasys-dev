import nodemailer from "nodemailer";
import { hashReferenceId } from "./hashReferenceId";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendIntakeReferenceEmail(to: string, name: string, caseType: string, referenceId: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2 style="color: #333;">Hello ${name},</h2>
      <p>Thank you for starting your <b>${caseType}</b> case with us.</p>
      <p>Your reference ID is:</p>
      <p style="font-size: 18px; font-weight: bold; color: #0070f3;">${referenceId}</p>
      <p>Please keep this ID for future communication.</p>
      <p>You can access your form using this link below!</p>
      <p>${process.env.NEXTAUTH_URL}/intake-form-hash?ref=${hashReferenceId(referenceId)}</p>
      <br/>
      <p>— The Legasys Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your ${caseType} Case Reference ID`,
    html: htmlContent,
  });
}
