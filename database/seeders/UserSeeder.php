<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Ust. Lorem',
                'email' => 'super_admin@masjid.com',
                'password' => env('SEEDER_SUPER_ADMIN_PASSWORD', 'password'),
                'role' => 'super_admin',
            ],
            [
                'name' => 'Bpk. Lorem',
                'email' => 'bendahara@masjid.com',
                'password' => env('SEEDER_BENDAHARA_PASSWORD', 'password'),
                'role' => 'bendahara',
            ],
            [
                'name' => 'Bpk. Lorem',
                'email' => 'petugas@masjid.com',
                'password' => env('SEEDER_PETUGAS_PASSWORD', 'password'),
                'role' => 'petugas_zakat',
            ],
            [
                'name' => 'Bpk. Lorem (Viewer)',
                'email' => 'viewer@masjid.com',
                'password' => env('SEEDER_VIEWER_PASSWORD', 'password'),
                'role' => 'viewer',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'role' => $userData['role'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
