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
        console.log(`Tracking page view: ${pathname}`);
        const { error } = await supabase.from('page_views').insert({
          path: pathname,
          session_id: sessionId
        });
        if (error) {
           console.warn('Could not record page view (possibly missing tables or RLS enabled):', error.message || error.code || 'Unknown error');
        }
      } catch (err) {
        console.warn('Unexpected error recording page view:', err);
      }
    };

    recordPageView();

    // Active usage heartbeat
    const interval = setInterval(async () => {
       try {
         await supabase.from('page_views').insert({
           path: pathname,
           session_id: sessionId
         });
       } catch (e) {}
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    const handleGlobalClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        let sessionId = sessionStorage.getItem('analytics_session_id') || 'unknown';
        const url = anchor.href;
        const linkText = anchor.innerText || anchor.textContent || '';
        
        console.log(`Tracking click: ${linkText} -> ${url}`);
        try {
          const { error } = await supabase.from('clicks').insert({
            url: url,
            link_text: linkText.substring(0, 255),
            path: window.location.pathname,
            session_id: sessionId
          });
          if (error) {
            console.warn('Could not record click:', error.message || error.code || 'Unknown error');
          }
        } catch (err) {
          console.warn('Unexpected error recording click:', err);
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
