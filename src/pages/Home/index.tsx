import { DefaultLayout } from "@/layouts/DefaultLayout";
import { FooterSection } from "./FooterSection";
import { Hero } from "./Hero";
import { ProjectSection } from "./ProjectsSearch";
import { Showcase } from "./Showcase";
import { WelcomeModal } from "./WelcomeModal";

export const Home = () => (
  <DefaultLayout>
    <div className="flex-1 flex flex-col min-h-0">
      <WelcomeModal />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Hero />
        <Showcase />
        <div className="mx-auto w-full max-w-6xl px-8">
          <div className="flex items-center gap-4 border-t border-border/40 pt-8">
            <h2 className="font-display text-xl font-semibold tracking-tight text-text">
              The full index
            </h2>
            <span className="h-px flex-1 bg-(--border)" />
            <span className="font-mono text-nano uppercase tracking-widest text-(--muted)">
              search &amp; filter
            </span>
          </div>
        </div>
        <ProjectSection />
      </div>
      <FooterSection />
    </div>
  </DefaultLayout>
);
