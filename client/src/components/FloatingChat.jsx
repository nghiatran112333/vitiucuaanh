import { useState } from 'react';
import { chatContacts } from '../config/chatContacts.js';

export default function FloatingChat({ notify }) {
  const [open, setOpen] = useState(false);
  const links = [
    { key: 'zalo', label: 'Zalo', className: 'social-zalo' },
    { key: 'messenger', label: 'Messenger', className: 'social-messenger' },
    { key: 'tiktok', label: 'TikTok', className: 'social-tiktok' },
    { key: 'instagram', label: 'Instagram', className: 'social-instagram' }
  ];

  return <div className="floating-chat">
    {open && <section className="chat-popover" aria-label="Kênh liên hệ Vịtiu">
      <div className="chat-popover-heading"><span>♡</span><div><b>Vịtiu luôn ở đây</b><small>Nàng cần tụi mình tư vấn điều gì?</small></div></div>
      <div className="chat-social-section"><span>Nhắn tin hoặc theo dõi Vịtiu</span><div className="chat-social-grid">{links.map(link => chatContacts[link.key]
        ? <a className={`chat-social-button ${link.className}`} key={link.key} href={chatContacts[link.key]} target="_blank" rel="noreferrer"><SocialIcon name={link.key}/><b>{link.label}</b><span>↗</span></a>
        : <button className={`chat-social-button ${link.className} is-unavailable`} key={link.key} onClick={() => notify('Vịtiu đang cập nhật liên kết này ♡')}><SocialIcon name={link.key}/><b>{link.label}</b><small>đang cập nhật</small></button>
      )}</div></div>
      <p>Nàng chọn kênh mình yêu thích nha ♡</p>
    </section>}
    <button className={`floating-chat-toggle${open ? ' is-open' : ''}`} aria-label={open ? 'Đóng chat' : 'Mở chat với Vịtiu'} aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span>{open ? '×' : '☏'}</span><b>{open ? 'Đóng' : 'Chat với Vịtiu'}</b>{!open && <i>♡</i>}
    </button>
  </div>;
}

function SocialIcon({ name }) {
  if (name === 'zalo') return <span className="social-letter" aria-hidden="true">Z</span>;
  if (name === 'messenger') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.8 3 3 6.6 3 11.2c0 2.5 1.1 4.6 3 6v3l3.1-1.7c.9.3 1.9.5 2.9.5 5.2 0 9-3.6 9-8.1S17.2 3 12 3Zm1 11.1-2.3-2.5-4.4 2.5 4.8-5.1 2.4 2.5 4.3-2.5-4.8 5.1Z"/></svg>;
  if (name === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle className="social-icon-dot" cx="17.7" cy="6.6" r="1"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.1 3.2c.4 2.5 1.8 4 4.4 4.2v3.1a8 8 0 0 1-4.4-1.4v5.8a6.1 6.1 0 1 1-6.1-6.1c.5 0 1 .1 1.5.2v3.3a3 3 0 1 0 1.4 2.6V3.2h3.2Z"/></svg>;
}
