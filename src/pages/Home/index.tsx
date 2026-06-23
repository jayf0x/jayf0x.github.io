import { DefaultLayout } from "@/layouts/DefaultLayout";
import { Flagship } from "./Flagship";
import { FooterSection } from "./FooterSection";
import { Hero } from "./Hero";
import { ProjectSection } from "./ProjectsSearch";
import { WelcomeModal } from "./WelcomeModal";

export const Home = () => (
  <DefaultLayout>
    <div className="flex-1 flex flex-col min-h-0">
      <WelcomeModal />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Hero />
        <Flagship />
        <ProjectSection />
      </div>
      <FooterSection />
    </div>
  </DefaultLayout>
);
