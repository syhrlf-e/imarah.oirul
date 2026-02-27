<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
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

        // Langkah 2: Regenerasi sesi — ini menyebabkan Laravel menulis sesi baru
        // ke tabel `sessions` dengan user_id yang sudah dikaitkan dengan user yang login
        $request->session()->regenerate();

        // Langkah 3: SEKARANG baru aman untuk mengecek sesi aktif lain di DB,
        // karena sesi saat ini sudah tersimpan dengan user_id yang benar
        $user = Auth::user();
        $currentSessionId = $request->session()->getId();

        $activeSessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->count();

        if ($activeSessions > 0) {
            // Rollback: logout user, hapus sesi yang baru dibuat, kembalikan ke login
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun ini sedang aktif di perangkat lain. Silakan logout terlebih dahulu.',
            ]);
        }

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
