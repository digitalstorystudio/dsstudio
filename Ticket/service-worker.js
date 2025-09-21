const CACHE_NAME = 'ticket-system-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/verify.html',
    '/login.html',
    '/generator_login.html',
    '/style.css',
    '/script.js',
    '/verify.js',
    '/login.js',
    '/generator_login.js',
    'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js',
    'https://unpkg.com/html5-qrcode/html5-qrcode.min.js'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .catch((error) => console.error('Cache installation failed:', error))
    );
});

// Fetch event with network-first strategy for API calls
self.addEventListener('fetch', (event) => {
    // Handle API calls with network-first strategy
    if (event.request.url.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // If successful, update cache
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Handle static assets with cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline ticket generation
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-tickets') {
        event.waitUntil(syncOfflineTickets());
    }
});

async function syncOfflineTickets() {
    try {
        // Get offline tickets from IndexedDB
        const offlineTickets = await getOfflineTickets();
        
        for (const ticket of offlineTickets) {
            try {
                // Attempt to sync with server
                await syncTicketToServer(ticket);
                // Remove from offline storage if successful
                await removeOfflineTicket(ticket.id);
            } catch (error) {
                console.error('Failed to sync ticket:', ticket.id, error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification for verification updates
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New verification update',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/verify.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification('Ticket System', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});