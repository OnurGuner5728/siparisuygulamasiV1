'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function NavigationLink({ href, children, className, onClick, ...props }) {
  const router = useRouter();

  // Handle click with navigation fix
  const handleClick = useCallback((e) => {
    e.preventDefault();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Force navigation refresh
    if (href) {
      // Clear any stale navigation state
      window.history.replaceState({}, '', window.location.href);
      
      // Use router.push with force refresh
      router.push(href);
      
      // Fallback to window.location if router fails
      setTimeout(() => {
        if (window.location.pathname !== href) {
          window.location.href = href;
        }
      }, 100);
    }
  }, [href, onClick, router]);

  // Fix for tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh router state when tab becomes visible
        router.refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
} 