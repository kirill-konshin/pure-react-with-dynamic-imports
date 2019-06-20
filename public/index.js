if ('serviceWorker' in navigator) {
    (async () => {

        try {

            const config = {
                globalMap: {
                    'react': 'React',
                    'react-dom': 'ReactDOM'
                }
            };

            const registration = await navigator.serviceWorker.register('sw.js?' + JSON.stringify(config));
            await import("../src/index.jsx");
            // or use built version
            // await import("../build/index.js");

        } catch (error) {
            console.error('Service worker registration failed', error);
        }

    })();
} else {
    alert('Service Worker is not supported');
}
