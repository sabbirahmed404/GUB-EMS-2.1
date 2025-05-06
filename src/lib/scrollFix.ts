/**
 * Scroll detection fix for browsers that might not trigger scroll events properly
 * This works by running a series of checks and forcefully triggering detection
 */

export function initScrollFix() {
  if (typeof window === 'undefined') return;
  
  // Ensure the page has a scrollbar by forcing minimum height
  document.documentElement.style.minHeight = '101vh';
  
  // Track page scrolling state in local storage (persists between refreshes)
  const hasScrolled = () => {
    localStorage.setItem('page_has_scrolled', 'true');
    document.body.classList.add('page-scrolled');
    
    // Also trigger global events
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new CustomEvent('app:scrolled', { detail: { scrollY: window.scrollY } }));
  };
  
  // Add event listeners
  window.addEventListener('scroll', hasScrolled, { passive: true });
  
  // Force a tiny scroll after a delay
  setTimeout(() => {
    // Only force scroll if we haven't scrolled yet
    if (!localStorage.getItem('page_has_scrolled') && window.scrollY < 1) {
      console.log('ScrollFix: Forcing initial scroll');
      window.scrollTo(0, 1);
      
      // Reset position after a moment
      setTimeout(() => {
        window.scrollTo(0, 0);
        
        // Force a scroll event
        hasScrolled();
      }, 100);
    }
  }, 500);
  
  // Also check periodically to ensure scroll state is detected
  setInterval(() => {
    if (window.scrollY > 0) {
      hasScrolled();
    }
  }, 1000);
  
  // Check scroll position now
  if (window.scrollY > 0) {
    hasScrolled();
  }
  
  return () => {
    window.removeEventListener('scroll', hasScrolled);
  };
} 