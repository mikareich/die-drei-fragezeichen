import Link from "next/link";
import { Logo } from "./Logo.tsx";

const LINKS = [
  { title: "Episoden", href: "/episodes" },
  { title: "Personen", href: "/people" },
  { title: "Account", href: "/account" },
] as const;

export function NavBar(): React.ReactNode {
  return (
    <nav className="my-16 flex h-12 w-full items-center gap-4">
      <Link href="/" className="focus:outlined">
        <Logo className="shrink-0" />
      </Link>

      <span className="flex-1" />

      {LINKS.map(({ title, href }) => (
        <Link key={href} href={href} className="h-fit truncate text-link">
          {title}
        </Link>
      ))}
    </nav>
  );
}
