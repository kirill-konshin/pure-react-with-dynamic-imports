importScripts('../node_modules/@babel/standalone/babel.js');

// this is needed to activate the worker immediately without reload
//@see https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
self.addEventListener('activate', event => clients.claim());

const globalMap = {
    'react': 'React',
    'react-dom': 'ReactDOM'
};

const getGlobalByUrl = (url) => Object.keys(globalMap).reduce((res, key) => {
    if (res) return res;
    if (matchUrl(url, key)) return globalMap[key];
    return res;
}, null);

const matchUrl = (url, key) => url.includes(`/${key}/`);

self.addEventListener('fetch', (event) => {

    const {request: {url}} = event;

    console.log('Req', url);

    if (Object.keys(globalMap).some(key => matchUrl(url, key))) {
        event.respondWith(
            fetch(url)
                .then(response => response.text())
                .then(body => new Response(`
                        const head = document.getElementsByTagName('head')[0];
                        const script = document.createElement('script');
                        script.innerHTML = "${JSON.stringify(body).slice(1, -1)}";
                        script.setAttribute('type', 'text/javascript');
                        head.appendChild(script);
                        export default window.${getGlobalByUrl(url)};
                    `, {
                        headers: new Headers({
                            'Content-Type': 'application/javascript'
                        })
                    })
                )
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
