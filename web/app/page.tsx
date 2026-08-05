import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Agents } from "@/components/landing/agents";
import { Platform } from "@/components/landing/platform";
import { Workflow } from "@/components/landing/workflow";
import { Security } from "@/components/landing/security";
import { Testimonial } from "@/components/landing/testimonial";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <Hero />
        <Stats />
        <Agents />
        <Platform />
        <Workflow />
        <Security />
        <Testimonial />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
