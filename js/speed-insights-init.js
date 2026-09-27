// Vercel Speed Insights initialization
// This script initializes Speed Insights for performance tracking
(function() {
  // Initialize the queue for Speed Insights
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };
  
  // Only inject in production environment (Vercel deployment)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Create and inject the Speed Insights script
    const script = document.createElement('script');
    script.src = '/_vercel/speed-insights/script.js';
    script.defer = true;
    script.onerror = function() {
      console.log('[Vercel Speed Insights] Failed to load script. This is expected in local development.');
    };
    document.head.appendChild(script);
  }
})();
