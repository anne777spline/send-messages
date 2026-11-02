import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as z from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico inválido").max(150),
  message: z.string().min(10, "El mensaje debe contener al menos 10 caracteres").max(2000),
  website: z.string().optional(), // Honeypot anti-spam
  elapsedMs: z.number().optional(), // Speed trap
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Honeypot check: Si el campo 'website' tiene valor, es un bot
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ success: true, message: "Bot detected" });
    }

    // 2. Speed trap: Descartar si el envío tomó menos de 1.5 segundos
    if (body.elapsedMs && typeof body.elapsedMs === "number" && body.elapsedMs < 1500) {
      return NextResponse.json({ success: true, message: "Submission too fast" });
    }

    // 3. Schema validation
    const data = contactSchema.parse(body);

    if (!process.env.RESEND_API_KEY) {
      console.warn("[Contact API] RESEND_API_KEY not configured. Mocking success for development/staging.");
      return NextResponse.json({
        success: true,
        mocked: true,
        message: "Email service not configured with an API key, but input was valid."
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const toEmail = process.env.CONTACT_RECIPIENT_EMAIL || "info@sixtenet.com";
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "anneris.alonso@gmail.com";
    const fromEmail = process.env.CONTACT_EMAIL_FROM || "Six Tenet <onboarding@resend.dev>";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #000000; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #000000;">Nuevo mensaje de contacto - Broker Assistant</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Recibido a través de la web oficial</p>
        </div>
        <p style="font-size: 14px; margin: 8px 0;"><strong>Nombre:</strong> ${escapeHtml(data.name)}</p>
        <p style="font-size: 14px; margin: 8px 0;"><strong>Email del remitente:</strong> <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb;">${escapeHtml(data.email)}</a></p>
        <p style="font-size: 14px; margin: 16px 0 6px 0;"><strong>Mensaje:</strong></p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #1e293b;">
          ${escapeHtml(data.message)}
        </div>
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
          Six Tenet LLC | Broker Assistant Platform
        </div>
      </div>
    `;

    // Intentar envío inicial al email configurado
    let { data: resendData, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: data.email.trim().toLowerCase(),
      subject: `New Contact Request from ${data.name} (Broker Assistant)`,
      html: htmlContent,
    });

    // Fallback: Si Resend rechaza porque el remitente de pruebas (onboarding@resend.dev)
    // solo permite enviar al correo de la cuenta (adminEmail), reenviar automáticamente al correo verificado.
    if (resendError && (resendError.message?.toLowerCase().includes("testing emails") || resendError.statusCode === 403)) {
      if (toEmail.toLowerCase() !== adminEmail.toLowerCase()) {
        console.warn(`[Contact API] Dominio no verificado en Resend aún. Reintentando al correo de la cuenta (${adminEmail})...`);
        const fallbackRes = await resend.emails.send({
          from: fromEmail,
          to: [adminEmail],
          replyTo: data.email.trim().toLowerCase(),
          subject: `[Nuevo Contacto Web] ${data.name}`,
          html: htmlContent,
        });
        resendData = fallbackRes.data;
        resendError = fallbackRes.error;
      }
    }

    if (resendError) {
      console.error("[Contact API] Resend Error:", JSON.stringify(resendError));
      return NextResponse.json({
        error: resendError.message || "Error al enviar el correo a través de Resend."
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: resendData?.id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Datos de formulario inválidos" }, { status: 400 });
    }
    console.error("[Contact API] Server error:", err);
    return NextResponse.json({ error: err?.message || "Error interno en el servidor." }, { status: 500 });
  }
}
