import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AppErrorBoundary from './components/common/AppErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);

if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Earlier deployments cached large media files. WebKit can retain those
    // caches after a deployment and repeatedly serve a broken/stale page.
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => undefined);
    }
    if ('caches' in window) {
      void caches.keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith('lb-codebase-')).map((key) => caches.delete(key))))
        .catch(() => undefined);
    }
  });
}
