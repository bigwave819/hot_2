import Image from "next/image";
import Link from "next/link";

type AuthSplitShellProps = {
  imageSrc: string;
  imageAlt: string;
  headline: string;
  subtext: string;
  children: React.ReactNode;
};
export function AuthSplitShell({ imageSrc, imageAlt, headline, subtext, children }: AuthSplitShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-5">
      {/* Photo pane — hidden on small screens, the form is the priority there */}
      <div className="relative hidden bg-forest lg:col-span-3 lg:block">
        <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <h1 className="font-display max-w-lg text-4xl leading-tight font-medium text-white xl:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 max-w-md text-white/70">{subtext}</p>
        </div>
      </div>

      {/* Form pane */}
      <div className="bg-abyss text-abyss-foreground flex flex-col lg:col-span-2">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <Link href="/" className="font-display mb-10 text-2xl font-medium">
            Baobab Hotel
          </Link>
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-abyss-foreground-muted px-6 pb-8 text-center text-xs tracking-[0.15em] uppercase sm:px-12 lg:px-16">
          © {new Date().getFullYear()} Baobab Hotel · Kigali, Rwanda
        </p>
      </div>
    </div>
  );
}