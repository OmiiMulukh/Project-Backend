
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const result = await transporter.sendMail({
    from: `"BrandNest" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log("Email sent successfully:", result.messageId);
  return result;
};
