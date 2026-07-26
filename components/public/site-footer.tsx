import Link from "next/link";
import { Hairline } from "@/components/public/editorial-marks";

const FOOTER_LINKS = [
  { label: "Rooms", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "Dining", href: "/dining" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const footerLinkUnderline =
  "relative pb-0.5 after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-(--duration-hover) after:ease-(--ease-signature) hover:after:scale-x-100";

export function SiteFooter({
  contact,
}: {
  contact: { address: string; phone: string; email: string };
}) {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-xl font-medium tracking-tight text-foreground">Baobab Hotel</p>
          <Hairline className="mt-3 max-w-16" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Rwandan hospitality, refined. A modern sanctuary in the heart of Kigali.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Explore</p>
          <ul className="mt-3 flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href} className="w-fit">
                <Link
                  href={link.href}
                  className={`text-sm text-muted-foreground hover:text-foreground ${footerLinkUnderline}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Contact</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li>{contact.address}</li>
            <li>
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="hover:text-foreground">
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Baobab Hotel, Kigali, Rwanda. All rights reserved.
      </div>
    </footer>
  );
}