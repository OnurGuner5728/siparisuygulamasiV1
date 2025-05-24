// Service Worker utilities for fixing navigation issues

export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }
}

export async function unregisterAllServiceWorkers() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
    }
    console.log('All service workers unregistered');
  }
}

export async function forceRefreshServiceWorker() {
  // Clear all caches
  await clearAllCaches();
  
  // Unregister existing service workers
  await unregisterAllServiceWorkers();
  
  // Re-register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Force fresh SW on every load
      });
      console.log('Service worker re-registered');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}

// Auto fix on visibility change
export function setupNavigationFix() {
  let isFixApplied = false;
  
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && !isFixApplied) {
      // Only apply fix once per session
      isFixApplied = true;
      
      // Clear stale caches
      await clearAllCaches();
      
      // Force router refresh
      if (window.next?.router) {
        window.next.router.reload();
      }
    }
  });
} 