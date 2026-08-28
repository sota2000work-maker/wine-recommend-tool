// 02_酒部門/ワインおすすめツール/sw.js
// アプリ本体（HTML/アイコン等）をキャッシュし、オフラインでも起動できるようにする。
// Apps Script への同期リクエスト（他オリジン）はキャッシュ対象外で、通常通りネットワークに任せる。

const CACHE_NAME = 'wine-tool-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (event.request.method !== 'GET' || !isSameOrigin) {
    return; // Apps Scriptへのリクエストなどはブラウザの通常処理に任せる
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
