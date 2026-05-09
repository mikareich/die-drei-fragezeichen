import Link from "next/link";
import Logo from "./Logo";

const LINKS = [
  { title: "Episoden", href: "/episodes" },
  { title: "Personen", href: "/people" },
  { title: "Account", href: "/account" },
];

export default function NavBar() {
  return (
    <nav className="h-12 flex my-16 w-full gap-4 items-center">
      <Link href="/" className="focus:outlined">
        <Logo className="shrink-0" />
      </Link>

      <span className="flex-1" />

      {LINKS.map(({ title, href }) => (
        <Link key={href} href={href} className="text-link h-fit truncate">
          {title}
        </Link>
      ))}
    </nav>
  );
}
