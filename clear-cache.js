// Cache clearing script
console.log('🗑️ Clearing all caches...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  console.log('✅ localStorage cleared');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
}

// Clear caches
if (typeof caches !== 'undefined') {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ All caches cleared');
  });
}

// Force reload
console.log('🔄 Reloading page...');
window.location.reload(true);
