import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/global.css';
import './styles/navbar.css';
import { Toaster } from 'sonner';

// iOS and PWA detection for viewport fixes
function iosFixes() {
  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Add iOS class to html for specific CSS targeting
  if (isIOS) {
    document.documentElement.classList.add('ios');
    
    // Fix for iPhone XR bottom area
    if (window.innerWidth === 414 && window.innerHeight === 896) {
      document.documentElement.style.setProperty('--ios-bottom-fix', '35px');
    }
    
    // Fix for notched iPhones
    if (window.screen && (window.screen.height >= 812 || window.screen.width >= 812)) {
      document.documentElement.classList.add('iphone-notch');
      document.documentElement.style.setProperty('--ios-bottom-fix', '30px');
    }
    
    // Apply variable height fix
    function setVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Setup viewport handling
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });
    
    // Force window to top
    window.scrollTo(0, 0);
  }
}

// Run fixes immediately
iosFixes();

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" richColors />
  </StrictMode>
);
