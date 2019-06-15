importScripts('../node_modules/@babel/standalone/babel.js');

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
    } else if (event.request.url.endsWith('.css')) {
        event.respondWith(
            fetch(event.request.url)
                .then((response) => response.text())
                .then((body) => {
                    // Export the response body as a JavaSript string.
                    // The response body has to be sanitized before turning it
                    // into JavaScript code.
                    // Credits: https://stackoverflow.com/a/22837870
                    const newBody = `
                        const head = document.getElementsByTagName('head')[0];
                        const style = document.createElement('style');
                        style.setAttribute('type', 'text/css');
                        style.appendChild(document.createTextNode("${JSON.stringify(body).slice(1, -1)}"));
                        head.appendChild(style);
                        export default null;`;

                    // Replace the original response with an ES6 module
                    return new Response(newBody, {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                })
        )
    } else if (event.request.url.endsWith('.jsx')) {
        event.respondWith(
            fetch(event.request.url)
                .then((response) => response.text())
                .then((body) => new Response(
                    Babel.transform(body, {
                        presets: [
                            'react',
                        ],
                        plugins: [
                            'syntax-dynamic-import'
                        ],
                        sourceMaps: true
                    }).code,
                    { //TODO Cache
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
        )
    }

});
