<?php

namespace App\Http\Controllers\Auth;

use App\Events\LoginChallengeIssued;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
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
    public function waiting(Request $request): Response
    {
        $token = $request->query('token');

        return Inertia::render('Auth/LoginWaiting', [
            'token'    => $token,
            'timeout'  => 10,
        ]);
    }

    /**
     * Dipanggil dari AuthenticatedSessionController saat conflict terdeteksi.
     * Broadcast event ke HP A dan kembalikan token challenge ke HP B.
     */
    public function issue(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Buat token unik untuk challenge ini
        $token = Str::uuid()->toString();

        // Device info HP B (yang mau masuk)
        $deviceInfo = $request->header('User-Agent', 'Perangkat tidak dikenal');
        $ip         = $request->ip();
        $expiresAt  = now()->addSeconds(15)->timestamp;

        // Simpan challenge di cache selama 15 detik (buffer lebih dari 10 det countdown)
        Cache::put("login_challenge_{$token}", [
            'user_id'    => $user->id,
            'status'     => 'pending',
            'ip'         => $ip,
            'device'     => $deviceInfo,
            'expires_at' => $expiresAt,
        ], 15);

        // Broadcast ke HP A via Reverb WebSocket
        broadcast(new LoginChallengeIssued(
            userId:        $user->id,
            challengeToken: $token,
            deviceInfo:    "IP: {$ip} | " . substr($deviceInfo, 0, 80),
            expiresAt:     $expiresAt,
        ));

        return response()->json([
            'status' => 'challenge_pending',
            'token'  => $token,
        ]);
    }

    /**
     * Dipanggil HP A saat menekan tombol "Tolak".
     */
    public function reject(Request $request, string $token): JsonResponse
    {
        $challenge = Cache::get("login_challenge_{$token}");

        if (! $challenge || $challenge['user_id'] !== Auth::id()) {
            return response()->json(['status' => 'not_found'], 404);
        }

        // Tandai sebagai rejected
        $challenge['status'] = 'rejected';
        Cache::put("login_challenge_{$token}", $challenge, 10);

        return response()->json(['status' => 'rejected']);
    }

    /**
     * Dipanggil HP B secara polling setiap 1 detik untuk cek status.
     */
    public function status(string $token): JsonResponse
    {
        $challenge = Cache::get("login_challenge_{$token}");

        if (! $challenge) {
            // Cache sudah expired = timeout, HP B diizinkan masuk
            return response()->json(['status' => 'expired']);
        }

        return response()->json([
            'status'     => $challenge['status'],
            'expires_at' => $challenge['expires_at'],
        ]);
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
     * Dipanggil HP A via polling setiap 3 detik untuk cek apakah ada challenge.
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
