<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Langkah 1: Verifikasi kredensial (email + password)
        $request->authenticate();

        $user = Auth::user();

        // Langkah 2: Cek apakah ada sesi ONLINE lain untuk user ini menggunakan transaksi dan lock
        return DB::transaction(function () use ($request, $user) {
            $onlineThreshold = now()->subMinutes(3)->timestamp;
            $currentSessionId = $request->session()->getId();

            // Gunakan lockForUpdate untuk mencegah dua request login paralel lolos check ini bersamaan
            $hasActiveSession = DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->where('last_activity', '>=', $onlineThreshold)
                ->lockForUpdate()
                ->exists();

            if ($hasActiveSession) {
                // Ada sesi aktif di perangkat lain → Trigger Login Challenge
                $token      = Str::uuid()->toString();
                $deviceInfo = $request->header('User-Agent', 'Perangkat tidak dikenal');
                $ip         = $request->ip();
                $expiresAt  = now()->addSeconds(15)->timestamp;

                $challengeData = [
                    'user_id'         => $user->id,
                    'status'          => 'pending',
                    'ip'              => $ip,
                    'device'          => $deviceInfo,
                    'expires_at'      => $expiresAt,
                    'challenge_token' => $token,
                ];

                // Cache 1: Untuk HP B polling status via token
                Cache::put("login_challenge_{$token}", $challengeData, 20);

                // Cache 2: Untuk HP A polling check via user_id (HP A tidak tahu token)
                Cache::put("login_challenge_user_{$user->id}", $challengeData, 20);

                // Logout HP B sementara (challenge belum dikonfirmasi)
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Redirect HP B ke halaman waiting
                return redirect()->route('login.challenge.waiting', ['token' => $token]);
            }

            // Tidak ada konflik — langsung masuk dashboard
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard', absolute: false));
        });
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Destroy an authenticated session via beacon (when app is closed).
     */
    public function destroyBeacon(Request $request): \Illuminate\Http\Response
    {
        // Poin 3: Amankan endpoint beacon dari domain luar
        $origin = $request->headers->get('Origin') ?? $request->headers->get('Referer');
        $allowedOrigin = rtrim(config('app.url'), '/');

        if ($origin && !str_starts_with($origin, $allowedOrigin)) {
            abort(403, 'Unauthorized origin');
        }

        if (Auth::check()) {
            DB::table('sessions')->where('user_id', Auth::id())->delete();
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }
}
