import { requireUser } from "@/server/auth/session";
import { getSiteContentValue } from "@/server/db/queries/content";
import { getContentBlock } from "@/lib/content-blocks";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactBlock = getContentBlock("contact.info")!;
  const [user, contact] = await Promise.all([
    requireUser(),
    getSiteContentValue("contact.info", contactBlock.defaultValue),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <main className="flex-1 bg-secondary/20">{children}</main>
      <SiteFooter contact={{ address: contact.address, phone: contact.phone, email: contact.email }} />
      <WhatsAppButton phone={contact.phone} />
    </div>
  );
}