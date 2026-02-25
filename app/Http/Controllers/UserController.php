<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('name')->get();

        return Inertia::render('UserManagement/Index', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:bendahara,petugas_zakat,sekretaris',
            'seckey' => 'required|string'
        ], [
            'seckey.required' => 'Permintaan ditolak. Autentikasi keamanan gagal.'
        ]);

        // Secret Code Verification - Melindungi privilege escalation
        $secretCode = env('APP_ADMIN_SECRET', 'Imarah2024Secure!');
        if ($request->seckey !== $secretCode) {
            return back()->withErrors(['seckey' => 'Kode keamanan sistem tidak valid.']);
        }

        User::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);

        return redirect()->route('users.index')->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function destroy(User $user)
    {
        // 1. Mencegah Hapus Diri Sendiri
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        // 2. Mencegah penghapusan jika ini super_admin satu-satunya
        if ($user->role === 'super_admin') {
            return back()->with('error', 'Akun Super Admin Utama tidak dapat dihapus.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'Akses pengguna berhasil dicabut (Akses ke aplikasi diblokir).');
    }
}

