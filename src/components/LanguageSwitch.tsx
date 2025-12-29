import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isZh = location.pathname.includes('zh-CN');

  const toggleLang = () => {
    const newPath = isZh ? '/en-US' : '/zh-CN';
    const newLang = isZh ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLang}
      className="fixed top-6 right-6 z-50 text-3xl cursor-pointer"
      title={isZh ? 'Switch to English' : '切换到中文'}
    >
      {isZh ? '🇨🇳' : '🇺🇸'}
    </motion.button>
  );
}
