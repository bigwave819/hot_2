import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { getSiteContentValue } from "@/server/db/queries/content";
import { getContentBlock } from "@/lib/content-blocks";
import { Reveal } from "@/components/public/reveal";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Baobab Hotel, Kigali, Rwanda.",
};

export default async function ContactPage() {
  const contactBlock = getContentBlock("contact.info")!;
  const contact = await getSiteContentValue("contact.info", contactBlock.defaultValue);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="max-w-2xl">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Contact</p>
        <h1 className="font-display mt-2 text-4xl font-medium text-foreground sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-muted-foreground">
          Questions about your stay, a special request, or planning an event with us — we&apos;d love to hear from
          you.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <Reveal delay={0.1} className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-muted-foreground">{contact.address}</p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-muted-foreground hover:text-foreground">
              {contact.phone}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-foreground">
              {contact.email}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-3">
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}