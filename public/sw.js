self.addEventListener('activate', event => {
    //@see https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
    clients.claim();
});

self.addEventListener('fetch', (event) => {

    const {request: {url}} = event;

    if (url.includes('/react/') || url.includes('/react-dom/')) { //url.endsWith('.js') &&
        event.respondWith(
            fetch(url)
                .then((response) => response.text())
                .then((body) => {

                    body = body.replace(/(typeof exports === 'object')/ig, 'return $1');
                    body = body.replace('(function (global, factory) {', 'export default (function (global = window, factory) {');

                    return new Response(body, {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                })
        )
    }
});
