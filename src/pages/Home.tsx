import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { personalInfo } from '../data/profile';
import type { Project } from '../types';
import { TypingAnimation } from '../components/magicui/typing-animation';
import { BlurFade } from '../components/magicui/blur-fade';
import { MagicCard } from '../components/magicui/magic-card';
import { Sparkles } from '../components/magicui/sparkles';
import { Meteors } from '../components/magicui/meteors';
import { IconCloud } from '../components/magicui/icon-cloud';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { ContactButton } from '../components/ContactButton';

export default function Home() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);

  // Sync language with URL
  useEffect(() => {
    const isEn = location.pathname.includes('en-US');
    const targetLang = isEn ? 'en' : 'zh';
    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
  }, [location.pathname, i18n]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}projects/projects.json`);
        const projectIds: string[] = await res.json();
        const loaded = await Promise.all(
          projectIds.slice(0, 3).map(async (id) => {
            const infoRes = await fetch(`${import.meta.env.BASE_URL}projects/${id}/info.json`);
            return infoRes.json();
          })
        );
        setProjects(loaded);
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-6 py-10 flex flex-col items-center">
      <LanguageSwitch />
      <ContactButton />
      
      <div className="w-full max-w-5xl flex flex-col items-center gap-16">
        {/* Hero Section */}
        <section className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden py-16">
          <Sparkles count={30} />
          <Meteors number={15} />
          
          <BlurFade delay={0.1}>
            <motion.div
              className="relative mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] blur-2xl opacity-30 scale-110" />
              <img
                src={personalInfo.avatar}
                alt="avatar"
                className="relative w-36 h-36 rounded-full object-cover border-4 border-transparent bg-gradient-to-r from-[#667eea] to-[#764ba2] p-[2px]"
              />
            </motion.div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <TypingAnimation
              text={`${t('greeting')} ${personalInfo.name}`}
              className="text-4xl md:text-5xl bg-gradient-to-r from-[#667eea] via-[#764ba2] to-pink-400 bg-clip-text text-transparent animate-gradient"
              duration={80}
            />
          </BlurFade>

          <BlurFade delay={0.4}>
            <p className="text-xl text-[#667eea] mt-3">{personalInfo.title}</p>
          </BlurFade>

          <BlurFade delay={0.5}>
            <p className="max-w-xl text-gray-400 mt-3 leading-relaxed px-4">{personalInfo.bio}</p>
          </BlurFade>
        </section>

        {/* Skills Section */}
        <section className="w-full flex flex-col items-center">
          <BlurFade delay={0.2}>
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {t('home.skills')}
            </h2>
          </BlurFade>
          <BlurFade delay={0.3}>
            <IconCloud icons={personalInfo.skills} />
          </BlurFade>
        </section>

        {/* Projects Preview */}
        <section className="w-full flex flex-col items-center">
          <BlurFade delay={0.2}>
            <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {t('home.featured')}
            </h2>
          </BlurFade>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {projects.map((p, i) => (
              <BlurFade key={p.id} delay={0.15 * i}>
                <MagicCard className="cursor-pointer transition-transform duration-300 hover:-translate-y-2 w-full max-w-sm">
                  <img
                    src={`${import.meta.env.BASE_URL}projects/${p.id}/${p.image}`}
                    alt={p.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-gray-400 text-sm">{p.description}</p>
                  </div>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-6 text-gray-500 border-t border-white/5">
          <p>© {new Date().getFullYear()} Portfolio. {t('footer')}</p>
        </footer>
      </div>
    </div>
  );
}
