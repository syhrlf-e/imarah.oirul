<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Bersihkan sesi expired setiap 15 menit (pengganti session:gc yang belum tersedia)
Schedule::call(function () {
    $lifetime = config('session.lifetime', 30);
    DB::table('sessions')
        ->where('last_activity', '<', now()->subMinutes($lifetime)->timestamp)
        ->delete();
})->everyFifteenMinutes();
