import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Layout.css';

export default function Layout() {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">Portfolio</div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>{t('nav.home')}</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>{t('nav.projects')}</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>{t('nav.contact')}</NavLink>
          <button className="lang-btn" onClick={toggleLang}>
            {i18n.language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Portfolio. {t('footer')}</p>
      </footer>
    </div>
  );
}
