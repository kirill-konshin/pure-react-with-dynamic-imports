if ('serviceWorker' in navigator) {
    (async () => {

        try {

            const production = window.location.toString().includes('index-production.html');

            const config = {
                globalMap: {
                    'react': 'React',
                    'react-dom': 'ReactDOM'
                },
                production
            };

            const registration = await navigator.serviceWorker.register('sw.js?' + JSON.stringify(config));

            if (production) {
                await import("../build/index.js");
            } else {
                await import("../src/index.jsx");
            }

        } catch (error) {
            console.error('Service worker registration failed', error);
        }

    })();
} else {
    alert('Service Worker is not supported');
}
