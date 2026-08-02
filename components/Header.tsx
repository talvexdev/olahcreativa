import Link from "next/link";

type NavLink = { label: string; href: string };

export function Header({ brandName, navLinks }: { brandName: string; navLinks?: NavLink[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-moss/40 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-tight text-paper">
          {brandName}
        </Link>
        <nav className="flex gap-8">
          {(navLinks || []).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="frame-label text-paper/80 transition-colors hover:text-brass"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
