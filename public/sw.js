const {globalMap, production} = JSON.parse((decodeURIComponent(self.location.search) || '?{}').substr(1));

if (!production) importScripts('../node_modules/@babel/standalone/babel.js');

//this is needed to activate the worker immediately without reload
//@see https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
self.addEventListener('activate', event => self.clients.claim());

const getGlobalByUrl = (url) => Object.keys(globalMap).reduce((res, key) => {
    if (res) return res;
    if (matchUrl(url, key)) return globalMap[key];
    return res;
}, null);

const matchUrl = (url, key) => url.includes(`/${key}/`);

const removeSpaces = str => str.split(/^ +/m).join('').trim();

self.addEventListener('fetch', (event) => {

    let {request: {url}} = event;

    const fileName = url.split('/').pop();
    const ext = fileName.includes('.') ? url.split('.').pop() : '';

    if (!ext) {
        url = url + '.js' + (url.includes('/src/') ? 'x' : '');
    }

    console.log('Req', url, ext);

    if (globalMap && Object.keys(globalMap).some(key => matchUrl(url, key))) {
        event.respondWith(
            fetch(url)
                .then(response => response.text())
                .then(body => new Response(removeSpaces(`
                        const head = document.getElementsByTagName('head')[0];
                        const script = document.createElement('script');
                        script.setAttribute('type', 'text/javascript');
                        script.appendChild(document.createTextNode(${JSON.stringify(body)}));
                        head.appendChild(script);
                        export default window.${getGlobalByUrl(url)};
                    `), {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
        )
    } else if (url.endsWith('.css')) {
        event.respondWith(
            fetch(url)
                .then(response => response.text())
                .then(body => new Response(removeSpaces(`
                        const head = document.getElementsByTagName('head')[0];
                        const style = document.createElement('style');
                        style.setAttribute('type', 'text/css');
                        style.appendChild(document.createTextNode(${JSON.stringify(body)}));
                        head.appendChild(style);
                        export default null; // here we can export CSS module instead
                    `),
                    {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
        )
    } else if (url.endsWith('.jsx')) {
        event.respondWith(
            fetch(url)
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
    } else if (url.endsWith('.js')) { // rewrite for import('./Panel') with no extension
        event.respondWith(
            fetch(url)
                .then(response => response.text())
                .then(body => new Response(
                    body,
                    {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
        )
    }

});
