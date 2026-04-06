/**
 * SNBT Tracker — Hash-based SPA Router
 */

const routes = {};
let currentPage = null;

export function registerRoute(hash, renderFn) {
  routes[hash] = renderFn;
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function getCurrentRoute() {
  return window.location.hash || '#/';
}

export function initRouter(defaultRoute = '#/') {
  const handleRoute = () => {
    const hash = window.location.hash || defaultRoute;
    const renderFn = routes[hash];
    if (renderFn) {
      if (currentPage !== hash) {
        currentPage = hash;
        renderFn();
      }
    } else {
      // fallback to default
      navigate(defaultRoute);
    }
  };

  window.addEventListener('hashchange', handleRoute);
  // Force initial render
  currentPage = null;
  handleRoute();
}
