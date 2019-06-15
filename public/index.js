if ('serviceWorker' in navigator) {
    (async () => {

        try {

            const registration = await navigator.serviceWorker.register('sw.js');
            await import("../build/index.js");

        } catch (error) {
            console.error('Service worker registration failed', error);
        }

    })();
} else {
    alert('Service Worker is not supported');
}
