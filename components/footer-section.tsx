import Link from "next/link";
import type { ReactNode } from "react";

const footerLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

function SocialLink({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] text-sm font-semibold text-white/58 transition hover:border-white/24 hover:bg-white/[0.09] hover:text-white"
    >
      {children}
    </a>
  );
}

export function FooterSection() {
  return (
    <footer className="relative overflow-hidden bg-[#030303] px-5 pb-6 pt-12 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-10">
        <div className="flex flex-col items-start gap-5">
          <div className="flex flex-col gap-3">
            <SocialLink href="https://x.com" label="MUSIC on X">
              X
            </SocialLink>
            <SocialLink href="https://www.threads.net" label="MUSIC on Threads">
              @
            </SocialLink>
            <SocialLink href="https://www.youtube.com" label="MUSIC on YouTube">
              ▶
            </SocialLink>
          </div>
          <p className="text-xs font-medium text-white/34">@2026</p>
        </div>

        <nav className="flex flex-col items-end gap-3 text-right text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-16 max-w-6xl">
        <p className="select-none text-center text-[18vw] font-black uppercase leading-[0.78] tracking-normal text-white/[0.055] sm:text-[16vw]">
          MUSIC
        </p>
      </div>
    </footer>
  );
}
