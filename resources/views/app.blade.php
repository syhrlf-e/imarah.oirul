<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia></title>

        <!-- PWA: General -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#ffffff">

        <!-- PWA: Android / Chrome -->
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="application-name" content="Imarah">

        <!-- PWA: iOS / Safari -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Imarah">
        <link rel="apple-touch-icon" href="/images/icon-192.png">

        <!-- PWA: Microsoft (Edge/Windows) -->
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="/images/icon-192.png">


        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .then((registration) => {
                            // Cek update setiap 60 detik
                            setInterval(() => registration.update(), 60 * 1000);

                            registration.addEventListener('updatefound', () => {
                                const newWorker = registration.installing;
                                if (newWorker) {
                                    newWorker.addEventListener('statechange', () => {
                                        if (newWorker.state === 'activated') {
                                            // SW baru aktif → reload otomatis
                                            window.location.reload();
                                        }
                                    });
                                }
                            });
                        })
                        .catch((error) => console.error('PWA SW Registration Failed:', error));

                    // Listener: jika SW mengirim pesan update
                    navigator.serviceWorker.addEventListener('message', (event) => {
                        if (event.data && event.data.type === 'SW_UPDATED') {
                            window.location.reload();
                        }
                    });
                });
            }
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
