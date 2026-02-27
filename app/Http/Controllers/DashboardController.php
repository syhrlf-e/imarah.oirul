<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Agenda;
use App\Models\Donatur;
use App\Models\Mustahiq;
use App\Models\InventoryItem;
use App\Models\TromolBox;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userRole = $request->user()->role;
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Default Data Structure
        $data = [
            'totalSaldo' => 0,
            'totalZakat' => 0,
            'totalTransaksiBulanIni' => 0,
            'pemasukanBulanIni' => 0,
            'pengeluaranBulanIni' => 0,
            'recentTransactions' => [],
            'upcomingAgendas' => [],
            'chartData' => [],
            'totalKasTransactions' => 0,
            'zakatStats' => null,
            'inventarisStats' => null,
            'tromolStats' => null,
        ];

        // 1. Kas, Bendahara, Super Admin
        if (in_array($userRole, ['super_admin', 'bendahara'])) {
            $kasCategories = ['infaq', 'infaq_tromol', 'operasional', 'gaji', 'lainnya'];
            
            $kasStats = Transaction::whereIn('category', $kasCategories)
                ->selectRaw('type, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('type')
                ->get()
                ->keyBy('type');

            $totalPemasukanKas = $kasStats->has('in') ? $kasStats->get('in')->total : 0;
            $totalPengeluaranKas = $kasStats->has('out') ? $kasStats->get('out')->total : 0;
            $data['totalSaldo'] = $totalPemasukanKas - $totalPengeluaranKas;
            $data['totalKasTransactions'] = ($kasStats->has('in') ? $kasStats->get('in')->count : 0) 
                                  + ($kasStats->has('out') ? $kasStats->get('out')->count : 0);

            $kasBulanIniStats = Transaction::whereIn('category', $kasCategories)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->selectRaw('type, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('type')
                ->get()
                ->keyBy('type');

            $data['pemasukanBulanIni'] = $kasBulanIniStats->has('in') ? $kasBulanIniStats->get('in')->total : 0;
            $data['pengeluaranBulanIni'] = $kasBulanIniStats->has('out') ? $kasBulanIniStats->get('out')->total : 0;
            $data['totalTransaksiBulanIni'] = ($kasBulanIniStats->has('in') ? $kasBulanIniStats->get('in')->count : 0) 
                                    + ($kasBulanIniStats->has('out') ? $kasBulanIniStats->get('out')->count : 0);

            $data['recentTransactions'] = Transaction::with('creator:id,name')
                ->whereIn('category', $kasCategories)
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'category' => $item->category,
                        'type' => $item->type === 'in' ? 'pemasukan' : 'pengeluaran',
                        'amount' => $item->amount,
                        'transaction_date' => $item->created_at->format('Y-m-d'),
                        'description' => $item->notes ?? '',
                    ];
                });

            $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();
            $chartTransactions = Transaction::whereIn('category', $kasCategories)
                ->where('created_at', '>=', $sixMonthsAgo)
                ->selectRaw('
                    EXTRACT(YEAR FROM created_at) as year,
                    EXTRACT(MONTH FROM created_at) as month,
                    type,
                    SUM(amount) as total
                ')
                ->groupByRaw('EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), type')
                ->get();

            $chartData = [];
            for ($i = 5; $i >= 0; $i--) {
                $monthObj = $now->copy()->subMonths($i);
                $year = $monthObj->year;
                $month = $monthObj->month;

                $income = $chartTransactions->where('year', $year)
                                            ->where('month', $month)
                                            ->where('type', 'in')
                                            ->sum('total');

                $expense = $chartTransactions->where('year', $year)
                                             ->where('month', $month)
                                             ->where('type', 'out')
                                             ->sum('total');

                $chartData[] = [
                    'name' => $monthObj->translatedFormat('M y'),
                    'pemasukan' => (float) $income,
                    'pengeluaran' => (float) $expense,
                ];
            }
            $data['chartData'] = $chartData;

            // Tromol Stats
            $data['tromolStats'] = [
                'total_boxes' => TromolBox::count(),
                'active_boxes' => TromolBox::where('status', 'active')->count()
            ];
        }

        // 2. Zakat, Petugas Zakat, Super Admin, Bendahara
        if (in_array($userRole, ['super_admin', 'petugas_zakat', 'bendahara'])) {
            $zakatCategories = ['zakat_fitrah', 'zakat_maal'];
            $data['totalZakat'] = Transaction::whereIn('category', $zakatCategories)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            if ($userRole === 'petugas_zakat') {
                $data['zakatStats'] = [
                    'total_muzakki' => Donatur::count(),
                    'total_mustahiq' => Mustahiq::count(),
                ];
            }
        }

        // 3. Agenda, Super Admin
        if ($userRole === 'super_admin') {
            $data['upcomingAgendas'] = Agenda::where('start_time', '>=', $now)
                ->orderBy('start_time', 'asc')
                ->take(5)
                ->get()
                ->map(function ($agenda) {
                    return [
                        'id' => $agenda->id,
                        'title' => $agenda->title,
                        'type' => $agenda->type,
                        'start_time' => $agenda->start_time->format('Y-m-d H:i'),
                        'location' => $agenda->location,
                    ];
                });
        }

        // 4. Inventaris, Sekretaris, Super Admin
        if ($userRole === 'sekretaris') {
            $inventaris = InventoryItem::selectRaw('condition, COUNT(*) as count, SUM(quantity) as total_quantity')
                ->groupBy('condition')
                ->get()
                ->keyBy('condition');
            
            $data['inventarisStats'] = [
                'total_items' => $inventaris->sum('total_quantity'),
                'good_items' => $inventaris->has('baik') ? $inventaris->get('baik')->total_quantity : 0,
                'broken_items' => $inventaris->has('rusak') ? $inventaris->get('rusak')->total_quantity : 0,
            ];
        }

        return Inertia::render('Dashboard', $data);
    }
}
