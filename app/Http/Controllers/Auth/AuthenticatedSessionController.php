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
use App\Services\ChallengeAttemptService;

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
    public function store(LoginRequest $request, ChallengeAttemptService $attemptService): RedirectResponse
    {
        $ip = $request->ip();

        // 1. Cek apakah IP ini sedang diblokir SEBELUM validasi kredensial
        $blockStatus = $attemptService->isBlocked($ip);
        if ($blockStatus['blocked']) {
            if ($blockStatus['permanent']) {
                return back()->withErrors([
                    'email' => 'Akses Anda telah diblokir secara permanen dari sistem ini.',
                ]);
            }
            return back()->withErrors([
                'email' => "Akses sementara diblokir. Silakan coba lagi dalam {$blockStatus['minutes_left']} menit.",
            ]);
        }

        // Langkah 1: Verifikasi kredensial (email + password)
        $request->authenticate();

        $user = Auth::user();

        // Langkah 2: Cek apakah ada sesi ONLINE lain untuk user ini menggunakan transaksi dan lock
        return DB::transaction(function () use ($request, $user, $ip, $attemptService) {
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
                // 3. Catat percobaan log in karena menabrak sesi yang ada
                $attemptService->recordAttempt($ip);

                // Buat challenge token
                $token = Str::uuid()->toString();
                $expiresAt = now()->addSeconds(45)->timestamp; // Ubah dari 20 → 45 detik

                $challengeData = [
                    'token'      => $token,
                    'user_id'    => $user->id,
                    'status'     => 'pending',
                    'expires_at' => $expiresAt,
                ];

                // Simpan di Cache dengan TTL 45 detik
                Cache::put("login_challenge_{$token}", $challengeData, 45);
                Cache::put("login_challenge_user_{$user->id}", $challengeData, 45);

                // Logout HP B sementara
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Redirect HP B ke halaman waiting
                return redirect()->route('login.waiting', ['token' => $token]);
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
    public function destroyBeacon(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        // Poin 3: Amankan endpoint beacon dari domain luar (bandingkan hostname saja, abaikan http/https)
        $origin = $request->headers->get('Origin') ?? $request->headers->get('Referer');
        $allowedHost = parse_url(config('app.url'), PHP_URL_HOST);

        if ($origin && parse_url($origin, PHP_URL_HOST) !== $allowedHost) {
            return response('Unauthorized origin', 403);
        }

        if (Auth::check()) {
            DB::table('sessions')->where('user_id', Auth::id())->delete();
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    /**
     * Dipanggil HP A saat menekan tombol "Ya, Izinkan".
     * Mengubah status challenge menjadi approved lalu me-logout HP A itu sendiri.
     */
    public function approveChallengeAndLogout(Request $request): RedirectResponse
    {
        $token = $request->input('token');
        $challenge = Cache::get("login_challenge_{$token}");

        if (!$challenge || $challenge['status'] !== 'pending') {
            return redirect()->route('dashboard');
        }

        // Update status challenge → approved
        $challenge['status'] = 'approved';
        Cache::put("login_challenge_{$token}", $challenge, 30);
        Cache::put("login_challenge_user_{$challenge['user_id']}", $challenge, 30);

        // Hapus sesi HP A dari DB secara eksplisit sebelum logout
        // (Auth::logout() saja tidak menghapus baris dari tabel sessions)
        DB::table('sessions')->where('user_id', Auth::id())->delete();

        // Logout HP A (dirinya sendiri yang menyetujui)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect HP A ke form login dengan visual sukses logout
        return redirect()->route('login')->with('challenge_approved', true);
    }
}
