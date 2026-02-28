<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserRole::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
            'super_admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            // Biarkan Laravel memproses error validasi (redirect kembali dengan pesan error form)
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return null;
            }

            $status = 500;
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                $status = $e->getStatusCode();
            }

            // Memaksa JSON response untuk mempermudah handler global di Axios jika origin berupa Fetch/XHR
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage() ?: 'Server Error',
                ], $status);
            }

            // Rendisi fallback component via Inertia khusus untuk error page (bukan environment DEV)
            if (!app()->environment('local') && in_array($status, [ 500, 503, 404, 403 ])) {
                return \Inertia\Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return null; // Biarkan default handling Laravel bekerja (menampilkan laravel ignition debug if app_debug=true)
        });
    })->create();
