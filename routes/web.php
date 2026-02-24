<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Transactions
    // Kas Masjid (Transactions)
    Route::resource('kas', \App\Http\Controllers\TransactionController::class)->parameters(['kas' => 'transaction'])->only(['index', 'create', 'destroy']);
    Route::post('kas', [\App\Http\Controllers\TransactionController::class, 'store'])->name('kas.store')->middleware('throttle:transactions');
    Route::put('kas/{transaction}/verify', [\App\Http\Controllers\TransactionController::class, 'verify'])->name('kas.verify');

    // Zakat
    Route::get('zakat', [\App\Http\Controllers\ZakatController::class, 'index'])->name('zakat.index');
    Route::post('zakat', [\App\Http\Controllers\ZakatController::class, 'store'])->name('zakat.store')->middleware('throttle:transactions');
    Route::post('zakat/kalkulator', [\App\Http\Controllers\ZakatController::class, 'kalkulator'])->name('zakat.kalkulator');
    
    // Zakat Sub-menus (Placeholders)
    Route::get('zakat/muzakki', [\App\Http\Controllers\MuzakkiController::class, 'index'])->name('zakat.muzakki');
    Route::post('zakat/muzakki', [\App\Http\Controllers\MuzakkiController::class, 'store'])->name('zakat.muzakki.store');
    Route::put('zakat/muzakki/{muzakki}', [\App\Http\Controllers\MuzakkiController::class, 'update'])->name('zakat.muzakki.update');
    Route::delete('zakat/muzakki/{muzakki}', [\App\Http\Controllers\MuzakkiController::class, 'destroy'])->name('zakat.muzakki.destroy');
    Route::post('zakat/muzakki/import', [\App\Http\Controllers\MuzakkiController::class, 'import'])->name('zakat.muzakki.import');
    Route::get('zakat/mustahiq', [\App\Http\Controllers\MustahiqController::class, 'index'])->name('zakat.mustahiq');
    Route::post('zakat/mustahiq', [\App\Http\Controllers\MustahiqController::class, 'store'])->name('zakat.mustahiq.store');
    Route::put('zakat/mustahiq/{mustahiq}', [\App\Http\Controllers\MustahiqController::class, 'update'])->name('zakat.mustahiq.update');
    Route::delete('zakat/mustahiq/{mustahiq}', [\App\Http\Controllers\MustahiqController::class, 'destroy'])->name('zakat.mustahiq.destroy');
    Route::post('zakat/mustahiq/import', [\App\Http\Controllers\MustahiqController::class, 'import'])->name('zakat.mustahiq.import');
    Route::get('zakat/penerimaan', [\App\Http\Controllers\ZakatController::class, 'history'])->name('zakat.penerimaan');
    Route::get('zakat/penyaluran', [\App\Http\Controllers\ZakatController::class, 'penyaluran'])->name('zakat.penyaluran');
    Route::post('zakat/penyaluran', [\App\Http\Controllers\ZakatController::class, 'storePenyaluran'])->name('zakat.penyaluran.store')->middleware('throttle:transactions');

    // Tromol
    Route::get('tromol', [\App\Http\Controllers\TromolController::class, 'index'])->name('tromol.index');
    Route::get('tromol/history', [\App\Http\Controllers\TromolController::class, 'history'])->name('tromol.history');
    Route::get('tromol/{tromolBox}/input', [\App\Http\Controllers\TromolController::class, 'input'])->name('tromol.input');
    Route::post('tromol/{tromolBox}/input', [\App\Http\Controllers\TromolController::class, 'store'])->name('tromol.input.store')->middleware('throttle:transactions');

    // Other Features (Placeholders)
    // Inventaris
    Route::resource('inventaris', \App\Http\Controllers\InventoryItemController::class)->parameters(['inventaris' => 'inventoryItem'])->except(['show', 'create', 'edit']);
    Route::resource('agenda', \App\Http\Controllers\AgendaController::class)->except(['create', 'show', 'edit']);
    Route::get('laporan', [\App\Http\Controllers\ReportController::class, 'index'])->name('laporan.index');
    Route::get('laporan/export', [\App\Http\Controllers\ReportController::class, 'export'])->name('laporan.export');
    Route::get('settings', [\App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [\App\Http\Controllers\SettingController::class, 'store'])->name('settings.store');
});

require __DIR__.'/auth.php';
