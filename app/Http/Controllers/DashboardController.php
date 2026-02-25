<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Agenda;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $kasCategories = ['infaq', 'infaq_tromol', 'operasional', 'gaji', 'lainnya'];
        $zakatCategories = ['zakat_fitrah', 'zakat_maal'];

        // 1 & 2. Aggregate Queries for Overall and This Month
        // Secara drastis menghemat beban N+1 query dengan single group-by query.
        $kasStats = Transaction::whereIn('category', $kasCategories)
            ->selectRaw('type, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $totalPemasukanKas = $kasStats->has('in') ? $kasStats->get('in')->total : 0;
        $totalPengeluaranKas = $kasStats->has('out') ? $kasStats->get('out')->total : 0;
        $saldoTotalKas = $totalPemasukanKas - $totalPengeluaranKas;
        $totalKasTransactions = ($kasStats->has('in') ? $kasStats->get('in')->count : 0) 
                              + ($kasStats->has('out') ? $kasStats->get('out')->count : 0);

        $kasBulanIniStats = Transaction::whereIn('category', $kasCategories)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->selectRaw('type, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $pemasukanBulanIni = $kasBulanIniStats->has('in') ? $kasBulanIniStats->get('in')->total : 0;
        $pengeluaranBulanIni = $kasBulanIniStats->has('out') ? $kasBulanIniStats->get('out')->total : 0;
        $totalTransaksiBulanIni = ($kasBulanIniStats->has('in') ? $kasBulanIniStats->get('in')->count : 0) 
                                + ($kasBulanIniStats->has('out') ? $kasBulanIniStats->get('out')->count : 0);

        $totalZakat = Transaction::whereIn('category', $zakatCategories)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        
        // 3. Five Latest Kas Transactions for Widget
        $recentTransactions = Transaction::with('creator:id,name')
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

        // 4. Five Upcoming Agendas
        $upcomingAgendas = Agenda::where('start_time', '>=', $now)
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

        // 5. Chart Data (Last 6 Months Income vs Expense) - Diambil 1x via RAM DB
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();
        $chartTransactions = Transaction::whereIn('category', $kasCategories)
            ->where('created_at', '>=', $sixMonthsAgo)
            ->select('type', 'amount', 'created_at')
            ->get();

        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = $now->copy()->subMonths($i)->startOfMonth();
            $monthEnd = $now->copy()->subMonths($i)->endOfMonth();

            $monthlyData = $chartTransactions->filter(function ($t) use ($monthStart, $monthEnd) {
                return $t->created_at >= $monthStart && $t->created_at <= $monthEnd;
            });

            $income = $monthlyData->where('type', 'in')->sum('amount');
            $expense = $monthlyData->where('type', 'out')->sum('amount');

            $chartData[] = [
                'name' => $monthStart->translatedFormat('M y'), // e.g 'Jan 24'
                'pemasukan' => (float) $income,
                'pengeluaran' => (float) $expense,
            ];
        }

        return Inertia::render('Dashboard', [
            'totalSaldo' => $saldoTotalKas,
            'totalZakat' => $totalZakat,
            'totalTransaksiBulanIni' => $totalTransaksiBulanIni,
            'pemasukanBulanIni' => $pemasukanBulanIni,
            'pengeluaranBulanIni' => $pengeluaranBulanIni,
            'recentTransactions' => $recentTransactions,
            'upcomingAgendas' => $upcomingAgendas,
            'chartData' => $chartData,
            'totalKasTransactions' => $totalKasTransactions,
        ]);
    }
}
