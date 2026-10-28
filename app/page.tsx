import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import ExperienceSection from "@/sections/ExperienceSection";
import SkillsSection from "@/sections/SkillsSection";
import ProjectsSection from "@/sections/ProjectsSection";
import ContactSection from "@/sections/ContactSection";
import JsonLd from "@/components/JsonLd";
import { getSiteContent } from "@/lib/content";
import { homeJsonLd } from "@/lib/structured-data";

/**
 * Sunucu bileşeni: içerik build anında okunur ve bölümlere prop olarak geçer.
 * Bölümler istemci bileşeni olarak kalır — animasyonlar aynen çalışır.
 */
export default function Home() {
  const content = getSiteContent();
  const { profile, skills, projects, experiences } = content;

  return (
    <main id="main-content">
      <JsonLd data={homeJsonLd(content)} />
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <ExperienceSection experiences={experiences} />
      <SkillsSection categories={skills} />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
    </main>
  );
}
