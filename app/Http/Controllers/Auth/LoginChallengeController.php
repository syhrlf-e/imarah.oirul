<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LoginChallengeController extends Controller
{
    /**
     * Tampilkan halaman waiting untuk HP B.
     */
    public function waiting(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $token = $request->query('token');

        // Validasi token ada dan masih valid
        if (!$token || !Cache::has("login_challenge_{$token}")) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/LoginWaiting', [
            'token'      => $token,
            'expiresIn'  => 45, // Waktu tunggu baru (di handle frontend)
        ]);
    }



    /**
     * Dipanggil HP B untuk finalize login setelah challenge diapprove HP A.
     * Membuat sesi baru untuk HP B dan redirect ke dashboard.
     */
    public function finalize(Request $request, string $token): RedirectResponse
    {
        $challenge = Cache::get("login_challenge_{$token}");

        // Cek token valid dan statusnya approved
        if (!$challenge || $challenge['status'] !== 'approved') {
            return redirect()->route('login')->withErrors([
                'email' => 'Link konfirmasi tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $user = User::find($challenge['user_id']);
        if (!$user) {
            return redirect()->route('login');
        }

        // Hapus semua sesi lama user ini (HP A sudah logout duluan)
        DB::table('sessions')->where('user_id', $user->id)->delete();

        // Login HP B dan buat sesi baru
        Auth::login($user);
        $request->session()->regenerate();

        // Bersihkan challenge dari cache
        Cache::forget("login_challenge_{$token}");
        Cache::forget("login_challenge_user_{$user->id}");

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Dipanggil HP A saat menekan tombol "Tolak".
     */
    public function reject(Request $request, string $token): JsonResponse
    {
        $challenge = Cache::get("login_challenge_{$token}");

        if (!$challenge) {
            return response()->json(['message' => 'Challenge tidak ditemukan'], 404);
        }

        // Update status → rejected
        $challenge['status'] = 'rejected';
        Cache::put("login_challenge_{$token}", $challenge, 30);
        Cache::put("login_challenge_user_{$challenge['user_id']}", $challenge, 30);

        return response()->json(['message' => 'Challenge ditolak']);
    }

    /**
     * Dipanggil HP B secara polling setiap 1 detik untuk cek status.
     */
    public function status(Request $request, string $token): JsonResponse
    {
        $challenge = Cache::get("login_challenge_{$token}");

        if (!$challenge) {
            // Cache expired = default TOLAK (karena timeout 45s habis dan HP A diam)
            return response()->json(['status' => 'expired']);
        }

        return response()->json(['status' => $challenge['status']]);
    }

    /**
     * Dipanggil oleh HP B untuk finalize login setelah challenge expired/approved.
     * Hapus sesi lama user dan lanjutkan ke dashboard.
     */
    public function approve(Request $request, string $token): JsonResponse
    {
        $challenge = Cache::get("login_challenge_{$token}");

        // Hanya allow jika challenge expired (HP A tidak merespons)
        if ($challenge && $challenge['status'] !== 'expired') {
            return response()->json(['status' => 'not_approved'], 403);
        }

        // Hapus sesi lama user yang masih ada di DB
        if (Auth::check()) {
            $currentSessionId = $request->session()->getId();
            DB::table('sessions')
                ->where('user_id', Auth::id())
                ->where('id', '!=', $currentSessionId)
                ->delete();
        }

        Cache::forget("login_challenge_{$token}");

        return response()->json(['status' => 'approved']);
    }

    /**
     * @deprecated Digantikan oleh SSE endpoint di SSEController
     * Method ini dipertahankan untuk backward compatibility sementara waktu
     */
    public function check(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $challenge = Cache::get("login_challenge_user_{$userId}");

        if (! $challenge || $challenge['status'] !== 'pending') {
            return response()->json(['has_challenge' => false]);
        }

        // Cek apakah challenge sudah expired
        if (now()->timestamp > $challenge['expires_at']) {
            Cache::forget("login_challenge_user_{$userId}");
            return response()->json(['has_challenge' => false]);
        }

        return response()->json([
            'has_challenge'   => true,
            'challenge_token' => $challenge['challenge_token'],
            'device_info'     => "IP: {$challenge['ip']} | " . substr($challenge['device'], 0, 80),
            'expires_at'      => $challenge['expires_at'],
        ]);
    }
}
