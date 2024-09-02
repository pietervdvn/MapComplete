const version = "0.0.0"

interface ServiceWorkerFetchEvent extends Event {
    request: RequestInfo & { url: string }
    respondWith: (response: any | PromiseLike<Response>) => Promise<void>
}

async function install() {
    console.log("Installing service worker!")
}

addEventListener("install", (e) => (<any>e).waitUntil(install()))
addEventListener("activate", (e) => (<any>e).waitUntil(activate()))

async function clearCaches(exceptVersion = undefined) {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => k !== version && caches.delete(k)))
    console.log("Cleared caches")
}

async function activate() {
    console.log("Activating service worker")
    await clearCaches(version)
}

async function fetchAndCache(event: ServiceWorkerFetchEvent): Promise<Response> {
    let networkResponse = await fetch(event.request)
    let cache = await caches.open(version)
    await cache.put(event.request, networkResponse.clone())
    console.log("Cached", event.request)
    return networkResponse
}

async function cacheFirst(event: ServiceWorkerFetchEvent, attemptUpdate: boolean = false) {
    const cacheResponse = await caches.match(event.request, { ignoreSearch: true })
    if (cacheResponse === undefined) {
        return fetchAndCache(event)
    }
    console.debug("Loaded from cache: ", event.request)
    if (attemptUpdate) {
        fetchAndCache(event)
    }
    return cacheResponse
}

const neverCache: RegExp[] = [/\.html$/, /service-worker/]
const neverCacheHost: RegExp[] = [/127\.0\.0\.[0-9]+/, /\.local/, /\.gitpod\.io/, /localhost/]

async function handleRequest(event: ServiceWorkerFetchEvent) {
    const origin = new URL(self.origin)
    const requestUrl = new URL(event.request.url)
    if (requestUrl.pathname.endsWith("service-worker-version")) {
        console.log("Sending version number...")
        await event.respondWith(new Response(JSON.stringify({ "service-worker-version": version })))
        return
    }
    if (requestUrl.pathname.endsWith("/service-worker-clear")) {
        await clearCaches()
        await event.respondWith(new Response(JSON.stringify({ "cache-cleared": true })))
        return
    }

    const shouldBeCached =
        origin.host === requestUrl.host &&
        !neverCacheHost.some((blacklisted) => origin.host.match(blacklisted)) &&
        !neverCache.some((blacklisted) => event.request.url.match(blacklisted))
    if (!shouldBeCached) {
        console.debug("Not intercepting ", requestUrl.toString(), origin.host, requestUrl.host)
        // We return _without_ calling event.respondWith, which signals the browser that it'll have to handle it himself
        return
    }
    await event.respondWith(await cacheFirst(event))
}

self.addEventListener("fetch", async (e) => {
    // Important: this lambda must run synchronously, as the browser will otherwise handle the request
    const event: ServiceWorkerFetchEvent = <ServiceWorkerFetchEvent>e
    try {
        await handleRequest(event)
    } catch (e) {
        console.error("CRASH IN SW:", e)
        await event.respondWith(fetch(event.request.url))
    }
})
