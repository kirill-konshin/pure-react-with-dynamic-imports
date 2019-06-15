importScripts('../node_modules/@babel/standalone/babel.js');

// this is needed to activate the worker immediately without reload
//@see https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
self.addEventListener('activate', event => clients.claim());

self.addEventListener('fetch', (event) => {

    const {request: {url}} = event;

    console.log('Req', url);

    if (url.includes('/react/') || url.includes('/react-dom/')) {
        event.respondWith(
            fetch(url)
                .then(response => response.text())
                .then(body => {

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
                .then(response => response.text())
                .then(body => new Response(
                    //TODO We don't track instances, so 2x import will result in 2x <style> tags
                    `
                        const head = document.getElementsByTagName('head')[0];
                        const style = document.createElement('style');
                        style.setAttribute('type', 'text/css');
                        style.appendChild(document.createTextNode("${JSON.stringify(body).slice(1, -1)}"));
                        head.appendChild(style);
                        export default null;
                    `,
                    {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
        )
    } else if (event.request.url.endsWith('.jsx')) {
        event.respondWith(
            fetch(event.request.url)
                .then(response => response.text())
                .then(body => new Response(
                    //TODO Cache
                    Babel.transform(body, {
                        presets: [
                            'react',
                        ],
                        plugins: [
                            'syntax-dynamic-import'
                        ],
                        sourceMaps: true
                    }).code,
                    {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
        )
    }

});
