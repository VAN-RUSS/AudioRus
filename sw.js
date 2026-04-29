// sw.js — Service Worker для проксирования аудио с Яндекс.Диска
const CACHE_NAME = 'audiorus-v1';

// Установка Service Worker
self.addEventListener('install', function(event) {
    console.log('Service Worker установлен');
    self.skipWaiting();
});

// Активация
self.addEventListener('activate', function(event) {
    console.log('Service Worker активирован');
    event.waitUntil(clients.claim());
});

// Перехват запросов
self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);

    // Проверяем, это запрос к Яндекс.Диску
    if (url.hostname === 'download.disk.yandex.ru') {
        console.log('Перехвачен запрос к Яндекс.Диску:', url.href);

        // Создаем новый запрос с правильными заголовками
        const modifiedRequest = new Request(event.request.url, {
            method: 'GET',
            headers: new Headers({
                'Referer': 'https://disk.yandex.ru/',
                'Origin': 'https://disk.yandex.ru',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }),
            mode: 'cors',
            credentials: 'omit'
        });

        // Проксируем запрос
        event.respondWith(
            fetch(modifiedRequest)
                .then(response => {
                    // Кешируем успешные ответы для быстрой загрузки
                    if (response.status === 200 || response.status === 206) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(error => {
                    // Пробуем взять из кеша, если нет сети
                    return caches.match(event.request);
                })
        );
    }

    // Для API-запросов к Яндекс.Диску
    if (url.hostname === 'cloud-api.yandex.net') {
        console.log('Перехвачен API-запрос к Яндекс.Диску:', url.href);

        const modifiedRequest = new Request(event.request.url, {
            method: 'GET',
            headers: new Headers({
                'Accept': 'application/json',
                'Referer': 'https://disk.yandex.ru/',
                'Origin': 'https://disk.yandex.ru'
            }),
            mode: 'cors'
        });

        event.respondWith(fetch(modifiedRequest));
    }
});