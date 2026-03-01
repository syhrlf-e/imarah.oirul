<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SSEController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $user = Auth::user();

        return response()->stream(function () use ($user) {
            // Matikan semua buffering di level PHP agar SSE bisa streaming real-time
            // Penting untuk PHP-FPM yang secara default men-buffer output
            set_time_limit(0);
            ini_set('output_buffering', 'off');
            ini_set('zlib.output_compression', false);
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            // Set header untuk SSE
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('X-Accel-Buffering: no'); // Penting untuk Nginx

            $lastCheck = null;

            while (true) {
                // Cek apakah koneksi masih aktif
                if (connection_aborted()) {
                    break;
                }

                // Cek challenge pending untuk user ini
                $challenge = Cache::get("login_challenge_user_{$user->id}");

                // HANYA kirim event jika challenge MASIH pending (bukan rejected/expired/approved)
                if ($challenge && $challenge['status'] === 'pending' && $challenge !== $lastCheck) {
                    $lastCheck = $challenge;

                    // Kirim event ke HP A
                    echo "event: challenge\n";
                    echo "data: " . json_encode([
                        'token'      => $challenge['token'] ?? $challenge['challenge_token'] ?? '',
                        'expires_at' => $challenge['expires_at'],
                    ]) . "\n\n";
                }

                // Kirim heartbeat setiap 30 detik agar koneksi tidak timeout
                echo "event: ping\n";
                echo "data: " . json_encode(['time' => now()->timestamp]) . "\n\n";

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();

                // Cek setiap 1 detik
                sleep(1);
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
