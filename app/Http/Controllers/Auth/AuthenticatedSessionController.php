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

        // Langkah 2: Cek apakah ada sesi ONLINE lain untuk user ini
        // Kita anggap "online" jika ada aktivitas dalam 3 menit terakhir
        // (karena AppLayout.tsx mengirim heartbeat setiap 2 menit)
        $onlineThreshold = now()->subMinutes(3)->timestamp;

        $currentSessionId = $request->session()->getId();

        $hasActiveSession = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->where('last_activity', '>=', $onlineThreshold)
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
}
