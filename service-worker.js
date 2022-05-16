import {manifest, version} from '@parcel/service-worker';

async function install() {
    console.log("Installing service worker!")
    const cache = await caches.open(version);
    console.log("Manifest file", manifest)
    // await cache.addAll(manifest);
    /* await cache.add({
         cache: "force-cache",
         url: "http://4.bp.blogspot.com/-_vTDmo_fSTw/T3YTV0AfGiI/AAAAAAAAAX4/Zjh2HaoU5Zo/s1600/beautiful%2Bkitten.jpg",
         destination: "image",
     })//*/
}

addEventListener('install', e => e.waitUntil(install()));

async function activate() {
    console.log("Activating service worker")
    /*self.registration.showNotification("SW started", {
        actions: [{
            action: "OK",
            title: "Some action"
        }]
    })*/
    const keys = await caches.keys();
    await Promise.all(
        keys.map(key => key !== version && caches.delete(key))
    );
}

addEventListener('activate', e => e.waitUntil(activate()));

self.addEventListener('fetch', (event) => {
    try {

        if (event.request.url === "http://127.0.0.1:1234/somedata") {
            console.log("Sending hi to 'somedata'")
            event.respondWith(new Response("Service worker is active"))
            return
        }
        const origin = new URL(self.origin)
        const requestUrl = new URL(event.request.url)
        console.log("Testing cache", origin.host, requestUrl.host, origin.host === requestUrl.host)
        if (origin.host !== requestUrl.host) {
            event.respondWith(fetch(event.request));
            return
        }
        event.respondWith(
            async () => {
            const matched = caches.match(event.request)
                if(matched){
                    return matched
                }
                const response = fetch(event.request); 
                const cache = await caches.open(version);
                await cache.put(event.request.url, response);
                console.log("Put ",event.request.url,"into the cache")
                return response
            }
        );
    } catch (e) {
        console.error("CRASH IN SW:", e)
        event.respondWith(fetch(event.request));
    }
});
