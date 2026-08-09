import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Your App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text, // optional plain-text fallback
    });

    return info;
  } catch (err) {
    console.error("Email send error:", err.message);
    throw new Error("Failed to send email");
  }
};

export default transporter;