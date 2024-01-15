const version = "0.0.8-GITHUB-COMMIT"

interface ServiceWorkerFetchEvent extends Event {
    request: RequestInfo & { url: string }
    respondWith: (response: any | PromiseLike<Response>) => Promise<void>
}

async function install() {
    console.log("Installing service worker!")
}

addEventListener("install", (e) => (<any>e).waitUntil(install()))
addEventListener("activate", (e) => (<any>e).waitUntil(activate()))

async function activate() {
    console.log("Activating service worker")
    caches
        .keys()
        .then((keys) => {
            // Remove all old caches
            Promise.all(keys.map((key) => key !== version && caches.delete(key)))
        })
        .catch(console.error)
}

const cacheFirst = async (event) => {
    await event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cacheResponse) => {
            if (cacheResponse !== undefined) {
                console.log("Loaded from cache: ", event.request)
                return cacheResponse
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(version).then((cache) => {
                    cache.put(event.request, networkResponse.clone())
                    console.log("Cached", event.request)
                    return networkResponse
                })
            })
        })
    )
}

self.addEventListener("fetch", async (e) => {
    // Important: this lambda must run synchronously, as the browser will otherwise handle the request
    const event = <ServiceWorkerFetchEvent>e
    try {
        const origin = new URL(self.origin)
        const requestUrl = new URL(event.request.url)
        if (requestUrl.pathname.endsWith("service-worker-version")) {
            console.log("Sending version number...")
            await event.respondWith(
                new Response(JSON.stringify({ "service-worker-version": version }))
            )
            return
        }
        const shouldBeCached =
            origin.host === requestUrl.host &&
            origin.hostname !== "127.0.0.1" &&
            origin.hostname !== "localhost" &&
            !origin.hostname.endsWith(".local") &&
            !origin.host.endsWith(".gitpod.io")
        if (!shouldBeCached) {
            console.log("Not intercepting ", requestUrl.toString(), origin.host, requestUrl.host)
            // We return _without_ calling event.respondWith, which signals the browser that it'll have to handle it himself
            return
        }
        await cacheFirst(event)
    } catch (e) {
        console.error("CRASH IN SW:", e)
        await event.respondWith(fetch(event.request.url))
    }
})
