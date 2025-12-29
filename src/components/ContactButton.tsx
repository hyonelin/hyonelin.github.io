import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaLinkedin, FaWeixin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { IoChatbubbleEllipses, IoClose } from 'react-icons/io5';

const contactItems = [
  { name: 'GitHub', url: 'https://github.com/yourusername', icon: FaGithub, color: '#fff' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/yourusername', icon: FaLinkedin, color: '#0A66C2' },
  { name: 'Email', url: 'mailto:your@email.com', icon: MdEmail, color: '#EA4335' },
  { name: 'WeChat', url: '#', icon: FaWeixin, color: '#07C160' },
];

export function ContactButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showWechat, setShowWechat] = useState(false);

  return (
    <>
      {/* Main Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-2xl shadow-lg shadow-[#667eea]/30 cursor-pointer flex items-center justify-center"
      >
        {isOpen ? <IoClose /> : <IoChatbubbleEllipses />}
      </motion.button>

      {/* Contact Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col gap-3"
          >
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {item.name === 'WeChat' ? (
                    <button
                      onClick={() => setShowWechat(true)}
                      className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-white/10 text-2xl flex items-center justify-center hover:border-[#667eea]/50 transition-colors cursor-pointer"
                      title={item.name}
                      style={{ color: item.color }}
                    >
                      <Icon />
                    </button>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-white/10 text-2xl flex items-center justify-center hover:border-[#667eea]/50 transition-colors"
                      title={item.name}
                      style={{ color: item.color }}
                    >
                      <Icon />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* WeChat QR Modal */}
      <AnimatePresence>
        {showWechat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={() => setShowWechat(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-2xl p-8 text-center relative border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-[#667eea]/50 transition-colors cursor-pointer flex items-center justify-center"
                onClick={() => setShowWechat(false)}
              >
                <IoClose />
              </button>
              <img
                src={`${import.meta.env.BASE_URL}wechat-qr.png`}
                alt="WeChat QR Code"
                className="w-64 h-64 rounded-xl"
              />
              <p className="mt-4 text-gray-400">{t('contact.scanWechat')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
