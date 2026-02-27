<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Events\LoginChallengeIssued;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
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

        // Langkah 2: Cek apakah ada sesi aktif lain untuk user ini
        $lifetime       = config('session.lifetime') * 60;
        $expirationTime = now()->timestamp - $lifetime;

        // Hindari mendeteksi sesi yang baru saja dibuat oleh request authenticate() ini sendiri
        $currentSessionId = $request->session()->getId();

        $hasActiveSession = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->where('last_activity', '>=', $expirationTime)
            ->exists();

        if ($hasActiveSession) {
            // Ada sesi aktif di HP lain → Trigger Login Challenge
            // Buat token challenge dan simpan di cache
            $token      = Str::uuid()->toString();
            $deviceInfo = $request->header('User-Agent', 'Perangkat tidak dikenal');
            $ip         = $request->ip();
            $expiresAt  = now()->addSeconds(15)->timestamp;

            Cache::put("login_challenge_{$token}", [
                'user_id'    => $user->id,
                'status'     => 'pending',
                'ip'         => $ip,
                'device'     => $deviceInfo,
                'expires_at' => $expiresAt,
                // Simpan kredensial session HP B agar bisa dilanjutkan setelah approved
                'session_id' => $request->session()->getId(),
            ], 20);

            // Broadcast event ke HP A via Reverb WebSocket
            broadcast(new LoginChallengeIssued(
                userId:         (string) $user->id,
                challengeToken: $token,
                deviceInfo:     "IP: {$ip} | " . substr($deviceInfo, 0, 80),
                expiresAt:      $expiresAt,
            ));

            // Logout HP B sementara (sesi challenge belum dikonfirmasi)
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect HP B ke halaman waiting dengan token challenge
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
