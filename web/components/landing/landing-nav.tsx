"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#agents", label: "AI Agents" },
  { href: "#workflow", label: "How it works" },
  { href: "#security", label: "Security" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="EstateFlow — home" className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <Image
            src="/logo-transparent.png"
            alt="EstateFlow"
            width={553}
            height={143}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Launch app
            <ArrowRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div id="landing-mobile-menu" className="border-t border-border bg-surface md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-text transition-colors duration-200 hover:bg-surface-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Launch app
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
