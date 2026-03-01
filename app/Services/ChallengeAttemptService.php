<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class ChallengeAttemptService
{
    // Cooldown per siklus dalam menit
    private const COOLDOWNS = [
        1 => 15,
        2 => 30,
        3 => 60,
        4 => null, // Permanen
    ];

    private const MAX_ATTEMPTS_PER_CYCLE = 3;

    private function getKey(string $ip): string
    {
        return "challenge_attempts_{$ip}";
    }

    /**
     * Cek apakah IP ini sedang diblokir
     */
    public function isBlocked(string $ip): array
    {
        $data = Cache::get($this->getKey($ip));

        if (!$data) {
            return ['blocked' => false];
        }

        // Cek blokir permanen
        if ($data['permanent']) {
            return [
                'blocked'   => true,
                'permanent' => true,
                'message'   => 'Akses Anda telah diblokir secara permanen.',
            ];
        }

        // Cek cooldown sementara
        if ($data['blocked_until'] && now()->timestamp < $data['blocked_until']) {
            $minutesLeft = ceil(($data['blocked_until'] - now()->timestamp) / 60);
            return [
                'blocked'      => true,
                'permanent'    => false,
                'minutes_left' => $minutesLeft,
                'message'      => "Terlalu banyak percobaan. Coba lagi dalam {$minutesLeft} menit.",
            ];
        }

        return ['blocked' => false];
    }

    /**
     * Catat 1 percobaan dan hitung konsekuensinya
     */
    public function recordAttempt(string $ip): void
    {
        $key  = $this->getKey($ip);
        $data = Cache::get($key, [
            'attempts'      => 0,
            'cycle'         => 1,
            'blocked_until' => null,
            'permanent'     => false,
        ]);

        // Reset attempts jika cooldown sudah selesai
        if ($data['blocked_until'] && now()->timestamp >= $data['blocked_until']) {
            $data['attempts']      = 0;
            $data['blocked_until'] = null;
            // Naikkan siklus
            $data['cycle'] = min($data['cycle'] + 1, 4);
        }

        $data['attempts']++;

        // Cek apakah sudah mencapai limit siklus ini
        if ($data['attempts'] >= self::MAX_ATTEMPTS_PER_CYCLE) {
            $cooldownMinutes = self::COOLDOWNS[$data['cycle']] ?? null;

            if ($cooldownMinutes === null) {
                // Siklus 4 — blokir permanen
                $data['permanent'] = true;
                Cache::forever($key, $data);
            } else {
                // Cooldown sementara
                $data['blocked_until'] = now()->addMinutes($cooldownMinutes)->timestamp;
                // Simpan lebih lama dari cooldown agar data siklus tidak hilang
                Cache::put($key, $data, now()->addMinutes($cooldownMinutes + 60));
            }
        } else {
            // Belum limit — simpan dengan TTL 24 jam
            Cache::put($key, $data, now()->addHours(24));
        }
    }

    /**
     * Ambil info status untuk ditampilkan ke user
     */
    public function getStatusInfo(string $ip): array
    {
        $data = Cache::get($this->getKey($ip));

        if (!$data) {
            return ['attempts' => 0, 'cycle' => 1];
        }

        return $data;
    }
}
