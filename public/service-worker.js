const CACHE_NAME = "my-site-cache-v1";
const ANOTHER_CACHE_NAME = "data-cache-v1";

const MY_CACHE = [
  "/",
  "/db.js",
  "/index.js",
  "/index.html",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(MY_CACHE))
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(ANOTHER_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  self.addEventListener('activate', function (event) {

    var cacheList = [CACHE_NAME, ANOTHER_CACHE_NAME];

    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (cacheList.indexOf(key) === -1) {
              return caches.delete(key);
            }
          })
        );
      })
    );
  });

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
