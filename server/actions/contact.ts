"use server";

import { resend } from "@/server/resend";
import { contactInquirySchema, type ContactInquiryInput } from "@/lib/validation/contact";
import type { ActionResult } from "@/types/action-result";

/**
 * Deliberately no auth check — this is the public contact form, meant
 * for anonymous visitors. No spam protection (rate limiting, CAPTCHA)
 * yet either; worth adding before this sees real traffic.
 *
 * Email-only by decision — no DB record of inquiries. That means a
 * failed send is a genuinely lost message, so failure is surfaced
 * honestly to the visitor rather than showing a false success state.
 */
export async function submitContactInquiry(input: ContactInquiryInput): Promise<ActionResult> {
  const parsed = contactInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, message } = parsed.data;

  const notifyEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!notifyEmail || !fromEmail) {
    return { success: false, error: "Contact form isn't configured yet. Please call or WhatsApp us instead." };
  }

  try {
    const { error } = await resend.emails.send({
      from: `Baobab Hotel Website <${fromEmail}>`,
      to: notifyEmail,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (error) {
      return { success: false, error: "Couldn't send your message. Please try again or contact us directly." };
    }

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Couldn't send your message. Please try again or contact us directly." };
  }
}