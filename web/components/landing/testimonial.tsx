import { Avatar } from "@/components/ui";
import { Quote } from "lucide-react";

export function Testimonial() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <figure className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">
            <Quote size={20} aria-hidden />
          </span>
          <blockquote className="mt-8 text-2xl font-medium leading-snug tracking-tight text-text sm:text-3xl">
            &ldquo;We moved from nine spreadsheets and four WhatsApp groups to
            one OS. My site team logs DPRs, finance reconciles the same day, and
            the AI agents answer leads while my sales team sleeps.&rdquo;
          </blockquote>
          <figcaption className="mt-8 flex items-center justify-center gap-3">
            <Avatar name="Priya Nair" size="lg" />
            <div className="text-left">
              <p className="text-sm font-semibold text-text">Priya Nair</p>
              <p className="text-xs text-text-muted">VP Sales · Crestline Developers, Pune</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
