const CACHE_NAME = "colabwize-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/css/main.css",
  "/static/js/main.js",
  "/logo192.png",
  "/logo512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      // Filter out any URLs with unsupported schemes
      const validUrls = urlsToCache.filter((url) => {
        try {
          const urlObj = new URL(url, self.location.origin);
          return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch (e) {
          // If we can't parse the URL, skip it
          return false;
        }
      });
      return cache.addAll(validUrls);
    })
  );
});

// // Fetch event - serve cached content when offline
// // DISABLED to prevent infinite loading loop
// self.addEventListener("fetch", (event) => {
//   // Only cache GET requests
//   if (event.request.method !== "GET") {
//     return;
//   }
// 
//   // Only cache requests from supported schemes (http, https)
//   const requestUrl = new URL(event.request.url);
//   if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
//     return;
//   }
// 
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       // Return cached version or fetch from network
//       return (
//         response ||
//         fetch(event.request).then((response) => {
//           // Check if we received a valid response
//           if (
//             !response ||
//             response.status !== 200 ||
//             response.type !== "basic"
//           ) {
//             return response;
//           }
// 
//           // Clone the response to put in cache
//           const responseToCache = response.clone();
// 
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(event.request, responseToCache);
//           });
// 
//           return response;
//         })
//       );
//     })
//   );
// });

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline changes
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-changes") {
    event.waitUntil(syncOfflineChanges());
  }
});

// Function to sync offline changes when online
async function syncOfflineChanges() {
  // This will be implemented in the frontend service
  // For now, we'll just log that sync is happening
  console.log("Syncing offline changes");

  // In a real implementation, we would:
  // 1. Retrieve pending changes from IndexedDB
  // 2. Send them to the server
  // 3. Update the UI to reflect synced status
}