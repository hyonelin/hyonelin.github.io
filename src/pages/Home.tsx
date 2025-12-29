import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { personalInfo } from '../data/profile';
import type { Project } from '../types';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayText, setDisplayText] = useState('');
  const fullText = `${t('greeting')} ${personalInfo.name}`;

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [fullText]);

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
    <div className="home">
      <section className="hero">
        <div className="avatar-wrapper">
          <img src={personalInfo.avatar} alt="avatar" className="avatar" />
          <div className="avatar-glow"></div>
        </div>
        <h1 className="typing-text">
          {displayText}<span className="cursor">|</span>
        </h1>
        <p className="title fade-in">{personalInfo.title}</p>
        <p className="bio fade-in delay-1">{personalInfo.bio}</p>
      </section>

      <section className="skills-section fade-in delay-2">
        <h2>{t('home.skills')}</h2>
        <div className="skills">
          {personalInfo.skills.map((skill, i) => (
            <span key={skill} className="skill-tag" style={{ animationDelay: `${i * 0.1}s` }}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="preview-section fade-in delay-3">
        <h2>{t('home.featured')}</h2>
        <div className="project-grid">
          {projects.map((p, i) => (
            <Link to="/projects" key={p.id} className="project-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <img src={`${import.meta.env.BASE_URL}projects/${p.id}/${p.image}`} alt={p.title} />
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </Link>
          ))}
        </div>
        <Link to="/projects" className="view-all">{t('home.viewAll')}</Link>
      </section>
    </div>
  );
}
