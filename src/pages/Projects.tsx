import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Project } from '../types';
import './Projects.css';

export default function Projects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}projects/projects.json`);
        const projectIds: string[] = await res.json();
        const loaded = await Promise.all(
          projectIds.map(async (id) => {
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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((p) => p.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || p.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [projects, searchTerm, selectedTag]);

  async function openProject(project: Project) {
    setSelectedProject(project);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}projects/${project.id}/${project.markdown}`);
      const text = await res.text();
      setMarkdownContent(text);
    } catch (e) {
      setMarkdownContent(`# ${t('projects.loadFailed')}`);
    }
  }

  return (
    <div className="projects-page">
      <h1>{t('projects.title')}</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder={t('projects.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="tag-select"
        >
          <option value="">{t('projects.allTags')}</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="project-grid">
        {filteredProjects.map((p, i) => (
          <div key={p.id} className="project-card" onClick={() => openProject(p)} style={{ animationDelay: `${i * 0.1}s` }}>
            <img src={`${import.meta.env.BASE_URL}projects/${p.id}/${p.image}`} alt={p.title} />
            <div className="card-content">
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="tags">
                {p.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProject(null)}>×</button>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
