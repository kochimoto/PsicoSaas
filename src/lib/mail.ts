import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordRecoveryEmail(email: string, name: string, token: string) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
  const resetLink = `${protocol}://${host.replace(/^https?:\/\//, "")}/redefinir-senha?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Gestão Terapêutica"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "Recuperação de Senha - Gestão Terapêutica",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(to bottom right, #2563eb, #4f46e5); border-radius: 12px; color: white; font-weight: bold; font-size: 24px; line-height: 48px;">G</div>
          <h1 style="color: #0f172a; margin-top: 10px;">Gestão Terapêutica</h1>
        </div>
        
        <p>Olá, <strong>${name}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Gestão Terapêutica</strong>.</p>
        <p>Se você não solicitou essa alteração, pode ignorar este e-mail com segurança.</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
            Redefinir Minha Senha
          </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">Este link expirará em 1 hora.</p>
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:<br>
          <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          &copy; ${new Date().getFullYear()} Gestão Terapêutica. Todos os direitos reservados.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
