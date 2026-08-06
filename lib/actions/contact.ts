"use server";

import { Resend } from "resend";

export type BriefFormState = {
  ok: boolean;
  message: string;
};

/** Matches the hidden input in BriefForm. A real visitor never sees it. */
const HONEYPOT_FIELD = "companyWebsite";

const SUCCESS = "Gracias — te escribimos en menos de 48 horas.";

export async function submitBrief(
  _prev: BriefFormState,
  formData: FormData
): Promise<BriefFormState> {
  // Anything in the honeypot means a bot filled the form in. Report the same
  // success a person would get: a bot that learns it was caught just adapts,
  // and a silent no-op costs us nothing.
  if ((formData.get(HONEYPOT_FIELD) as string)?.trim()) {
    return { ok: true, message: SUCCESS };
  }

  const field = (name: string) => ((formData.get(name) as string) || "").trim();

  const name = field("name");
  const company = field("company");
  const email = field("email");
  const interests = field("interests");
  const message = field("message");

  if (!name || !email || !message) {
    return { ok: false, message: "Completa tu nombre, correo y mensaje." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Ese correo no parece válido." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return { ok: false, message: "El formulario aún no está configurado." };
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      // onboarding@resend.dev only delivers to the Resend account owner, which
      // is exactly what this site needs. Setting CONTACT_FROM_EMAIL (after
      // verifying a domain) switches to a real sender with no code change.
      from: process.env.CONTACT_FROM_EMAIL || "Olah Creativa <onboarding@resend.dev>",
      to: toEmail,
      // Replying in the inbox goes straight back to the person who wrote in.
      replyTo: email,
      subject: `Nuevo brief — ${name}${company ? ` (${company})` : ""}`,
      text: [
        `Nombre: ${name}`,
        company && `Empresa: ${company}`,
        `Correo: ${email}`,
        interests && `Interés: ${interests}`,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    return { ok: true, message: SUCCESS };
  } catch {
    return { ok: false, message: "Algo falló al enviar. Intenta de nuevo." };
  }
}
