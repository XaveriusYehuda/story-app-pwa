import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'; // Tambahkan CacheFirst
import { ExpirationPlugin } from 'workbox-expiration'; // Tambahkan ExpirationPlugin

// Precache semua aset yang di-generate oleh injectManifest
precacheAndRoute(self.__WB_MANIFEST || []);

// VAPID Public Key Anda
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'; //

// Fungsi untuk urlBase64ToUint8Array (diperlukan untuk konversi VAPID key)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4); //
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/'); //
  const rawData = window.atob(base64); //
  const outputArray = new Uint8Array(rawData.length); //
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i); //
  }
  return outputArray; //
}

console.log('Precached files:', self.__WB_MANIFEST);

// Event listener untuk push notification
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  const showNotification = async () => {
    try {
      let data;
      if (event.data) {
        data = event.data.json();
        console.log('Push data:', data);
      } else {
        console.log('No data in push event, using default');
        data = {
          title: 'New Story',
          options: {
            body: 'A new story has been created',
            icon: '/images/logo-dicoding-story-app-196x196.png',
            badge: '/images/logo-dicoding-story-app-196x196.png'
          }
        };
      }

      await self.registration.showNotification(data.title, data.options);
      console.log('Notification shown successfully');
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  event.waitUntil(showNotification());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close(); //
  event.waitUntil(clients.openWindow('/')); //
});

// Caching API untuk daftar cerita menggunakan StaleWhileRevalidate
registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories'), //
  new StaleWhileRevalidate({
    cacheName: 'story-api-cache', //
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, //
        maxAgeSeconds: 24 * 60 * 60, //
      }),
    ],
  })
);

// Caching untuk aset gambar (icon, badge) yang digunakan dalam notifikasi atau UI
registerRoute(
  ({ request }) => request.destination === 'image', //
  new CacheFirst({ //
    cacheName: 'app-images-cache', //
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60, //
        maxAgeSeconds: 30 * 24 * 60 * 60, //
      }),
    ],
  })
);

// Caching API untuk detail cerita menggunakan StaleWhileRevalidate
registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories/'), // Perhatikan trailing slash untuk detail
  new StaleWhileRevalidate({
    cacheName: 'story-detail-api-cache', // Nama cache baru untuk detail cerita
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20, // Jumlah maksimum detail cerita yang akan disimpan
        maxAgeSeconds: 7 * 24 * 60 * 60, // Data detail cerita bisa disimpan lebih lama, misalnya 7 hari
      }),
    ],
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'clearAllCaches') {
    const port = event.ports[0]; // Port untuk membalas pesan

    caches.keys().then(cacheNames => {
      // Filter cache yang ingin Anda hapus
      const cachesToDelete = cacheNames.filter(name =>
        name === 'story-api-cache' ||
        name === 'story-detail-api-cache'
      );

      Promise.all(cachesToDelete.map(name => caches.delete(name)))
        .then(() => {
          console.log('Cache service worker berhasil dikosongkan.');
          if (port) {
            port.postMessage({ status: 'success' }); // Kirim balasan sukses
          }
        })
        .catch(error => {
          console.error('Gagal mengosongkan cache service worker:', error);
          if (port) {
            port.postMessage({ status: 'error', error: error.message }); // Kirim balasan error
          }
        });
    });
  }
});