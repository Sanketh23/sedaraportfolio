/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

exports.onClientEntry = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });

  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames
        .filter(
          name =>
            name.includes('gatsby-plugin-offline') ||
            name.includes('workbox') ||
            name.includes('offline-plugin'),
        )
        .forEach(name => caches.delete(name));
    });
  }
};
