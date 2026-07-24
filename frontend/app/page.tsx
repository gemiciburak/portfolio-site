import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import ExperienceSection from "@/sections/ExperienceSection";
import SkillsSection from "@/sections/SkillsSection";
import ProjectsSection from "@/sections/ProjectsSection";
import ContactSection from "@/sections/ContactSection";
import { getSiteContent } from "@/lib/api";

/**
 * İstek anında render edilir; veri katmanı 60 saniyelik cache'e sahiptir
 * (bkz. lib/api.ts). Böylece konteyner build'i API'ye bağımlı olmaz ve içerik
 * güncellemeleri yeniden dağıtım gerektirmez.
 */
export const dynamic = "force-dynamic";

/**
 * Sunucu bileşeni: içeriğin tamamı tek API çağrısıyla gelir ve bölümlere prop
 * olarak geçer. Bölümler istemci bileşeni olarak kalır — animasyonlar aynen çalışır.
 */
export default async function Home() {
  const { profile, skills, projects, experiences } = await getSiteContent();

  return (
    <main id="main-content">
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <ExperienceSection experiences={experiences} />
      <SkillsSection categories={skills} />
      <ProjectsSection projects={projects} />
      <ContactSection profile={profile} />
    </main>
  );
}
