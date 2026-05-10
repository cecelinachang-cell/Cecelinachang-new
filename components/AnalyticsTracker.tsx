'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    const recordPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          path: pathname,
          session_id: sessionId
        });
      } catch (err) {
        // Silently fail if schema doesn't exist
      }
    };

    recordPageView();
  }, [pathname]);

  useEffect(() => {
    const handleGlobalClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        let sessionId = sessionStorage.getItem('analytics_session_id') || 'unknown';
        const url = anchor.href;
        const linkText = anchor.innerText || anchor.textContent || '';
        
        try {
          await supabase.from('clicks').insert({
            url: url,
            link_text: linkText.substring(0, 255),
            path: window.location.pathname,
            session_id: sessionId
          });
        } catch (err) {
          // Silently fail if schema doesn't exist
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return null;
}
