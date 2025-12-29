import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactLinks, personalPages } from '../data/profile';
import './Contact.css';

export default function Contact() {
  const { t } = useTranslation();
  const [showWechat, setShowWechat] = useState(false);

  return (
    <div className="contact-page">
      <h1>{t('contact.title')}</h1>
      
      <section className="contact-section">
        <h2>{t('contact.methods')}</h2>
        <div className="link-grid">
          {contactLinks.map((link, i) => (
            link.name === 'WeChat' ? (
              <div
                key={link.name}
                className="contact-card"
                onClick={() => setShowWechat(true)}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="icon">{link.icon}</span>
                <span className="name">{link.name}</span>
              </div>
            ) : (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="icon">{link.icon}</span>
                <span className="name">{link.name}</span>
              </a>
            )
          ))}
        </div>
      </section>

      <section className="contact-section">
        <h2>{t('contact.pages')}</h2>
        <div className="link-grid">
          {personalPages.map((link, i) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="icon">{link.icon}</span>
              <span className="name">{link.name}</span>
            </a>
          ))}
        </div>
      </section>

      {showWechat && (
        <div className="modal-overlay" onClick={() => setShowWechat(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowWechat(false)}>×</button>
            <img src={`${import.meta.env.BASE_URL}wechat-qr.png`} alt="WeChat QR Code" className="qr-image" />
            <p>{t('contact.scanWechat')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
