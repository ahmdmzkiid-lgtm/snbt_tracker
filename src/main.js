/**
 * SNBT Tracker — Main Entry Point
 */
import './styles/index.css';
import './styles/components.css';
import './styles/onboarding.css';
import './styles/dashboard.css';
import './styles/syllabus.css';
import './styles/tryout.css';
import './styles/weakness.css';
import './styles/timer.css';

import { registerRoute, initRouter, navigate } from './router.js';
import { isOnboarded, isLoggedIn } from './store.js';
import { renderSidebar, renderBottomNav } from './components/sidebar.js';
import { renderOnboarding, cleanupOnboarding } from './pages/onboarding.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderSyllabus } from './pages/syllabus.js';
import { renderTryout } from './pages/tryout.js';
import { renderWeakness } from './pages/weakness.js';
import { renderTimer } from './pages/timer.js';
import { renderSettings } from './pages/settings.js';

// Wrapper to ensure sidebar and bottom nav are up-to-date
function withNav(renderFn) {
  return () => {
    // If not logged in or not onboarded, redirect to onboarding
    if (!isLoggedIn() || !isOnboarded()) {
      navigate('#/onboarding');
      return;
    }
    cleanupOnboarding();
    renderSidebar();
    renderBottomNav();
    renderFn();
  };
}

// Register routes
registerRoute('#/onboarding', renderOnboarding);
registerRoute('#/', withNav(renderDashboard));
registerRoute('#/syllabus', withNav(renderSyllabus));
registerRoute('#/tryout', withNav(renderTryout));
registerRoute('#/weakness', withNav(renderWeakness));
registerRoute('#/timer', withNav(renderTimer));
registerRoute('#/settings', withNav(renderSettings));

// Init — determine starting route based on auth + onboarding state
const isReady = isLoggedIn() && isOnboarded();
const defaultRoute = isReady ? '#/' : '#/onboarding';

// Set hash if empty or if not ready
if (!window.location.hash || (!isReady && window.location.hash !== '#/onboarding')) {
  window.location.hash = defaultRoute;
}

initRouter(defaultRoute);
