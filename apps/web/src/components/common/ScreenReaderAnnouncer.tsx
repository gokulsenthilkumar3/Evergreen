import React, { useEffect, useState } from 'react';

/**
 * Screen Reader Announcer
 * Announces changes to screen readers using ARIA live regions
 */
export const useScreenReaderAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
    setPoliteness(priority);
  };

  return { announce, announcement, politeness };
};

interface ScreenReaderAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * Screen Reader Announcer Component
 * Place this at the root of your app to enable screen reader announcements
 */
export const ScreenReaderAnnouncer: React.FC = () => {
  const [messages, setMessages] = useState<{ id: string; text: string; politeness: 'polite' | 'assertive' }[]>([]);

  useEffect(() => {
    const handleAnnounce = (e: CustomEvent<{ message: string; politeness: 'polite' | 'assertive' }>) => {
      const id = Math.random().toString(36).substr(2, 9);
      setMessages(prev => [...prev, { id, text: e.detail.message, politeness: e.detail.politeness }]);
      
      // Remove message after announcement
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== id));
      }, 1000);
    };

    window.addEventListener('announce' as any, handleAnnounce);
    return () => window.removeEventListener('announce' as any, handleAnnounce);
  }, []);

  return (
    <>
      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {messages.filter(m => m.politeness === 'polite').map(m => m.text).join(' ')}
      </div>
      
      {/* Assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {messages.filter(m => m.politeness === 'assertive').map(m => m.text).join(' ')}
      </div>
    </>
  );
};

/**
 * Global announce function
 * Can be called from anywhere to announce to screen readers
 */
export const announceToScreenReader = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  window.dispatchEvent(new CustomEvent('announce', { detail: { message, politeness } }));
};

export default ScreenReaderAnnouncer;
