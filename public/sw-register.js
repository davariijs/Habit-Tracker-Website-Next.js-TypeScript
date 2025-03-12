if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(
        function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        }, 
        function(error) {
          console.log('Service Worker registration failed:', error);
        }
      );
    });
  }