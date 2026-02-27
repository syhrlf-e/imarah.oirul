<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileMobileController extends Controller
{
    /**
     * Tampilkan halaman profil khusus Mobile.
     */
    public function index(Request $request)
    {
        return Inertia::render('Profile/Mobile', [
            'user' => $request->user()->only('id', 'name', 'email', 'role'),
        ]);
    }
}
