console.log("Hello!")
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/db.js",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
]

const CACHE_NAME = "static-cache"
const DATA_CACHE_NAME = "data-cache"

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("pre-cash money")
            return cache.addAll(FILES_TO_CACHE)
        })
    );

    self.skipWaiting()
})

self.addEventListener("activate", function(e){
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if( key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("removing the old", key);
                        return caches.delete(key)
                    }
                })
            )
        })
    )

    self.clients.claim()
})

self.addEventListener("fetch", function(e){
    if(e.request.url.includes("/api/")){

        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request)
                .then(res => {
                    if(res.status === 200) {
                        cache.put(e.request.url, res.clone())
                    }
                    
                    return res;
                })
                .catch(err=> {
                    return cache.match(e.request)
                })
            }).catch(err => console.log(err))
            )

            return;
        }

        e.respondWith(
            caches.match(e.request).then(function(res) {
                return res || fetch(e.request)
            })
        )
})