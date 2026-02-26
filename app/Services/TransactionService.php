<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionService
{
    protected $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Store a new transaction.
     *
     * @param  array  $validated
     * @param  User  $actor
     * @return Transaction
     * @throws Exception
     */
    public function store(array $validated, User $actor): Transaction
    {
        return DB::transaction(function () use ($validated, $actor) {
            $transaction = Transaction::create([
                'type' => $validated['type'],
                'category' => $validated['category'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'donatur_id' => $validated['donatur_id'] ?? null,
                'tromol_box_id' => $validated['tromol_box_id'] ?? null,
                'created_by' => $actor->id,
            ]);

            $this->activityLogService->log($actor, 'create', $transaction, [], $transaction->toArray());

            return $transaction;
        });
    }

    /**
     * Verify a transaction.
     *
     * @param  Transaction  $transaction
     * @param  User  $actor
     * @return Transaction
     */
    public function verify(Transaction $transaction, User $actor): Transaction
    {
        $oldValues = $transaction->toArray();

        $transaction->update([
            'verified_at' => now(),
            'verified_by' => $actor->id,
        ]);

        $this->activityLogService->log($actor, 'verify', $transaction, $oldValues, $transaction->toArray());

        return $transaction;
    }

    public function softDelete(Transaction $transaction, User $actor, string $reason): void
    {
        $oldValues = $transaction->toArray();

        $transaction->delete();

        // Log the deletion with the reason in new_values
        $this->activityLogService->log($actor, 'delete', $transaction, $oldValues, ['reason' => $reason]);
    }

    /**
     * Get transaction summary and breakdown.
     * Dioptimasi dari 6 query terpisah menjadi 2 query.
     *
     * @param string|int $month
     * @param string|int $year
     * @return array
     */
    public function getSummary($month, $year): array
    {
        // Query 1: Breakdown bulanan per type + category (menggantikan 4 query terpisah)
        $monthlyBreakdown = Transaction::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->selectRaw('type, category, SUM(amount) as total')
            ->groupBy('type', 'category')
            ->get();

        // Hitung summary dari hasil query tunggal
        $pemasukan = $monthlyBreakdown->where('type', 'in')->sum('total');
        $pengeluaran = $monthlyBreakdown->where('type', 'out')->sum('total');

        // Breakdown per kategori
        $pemasukan_by_category = $monthlyBreakdown->where('type', 'in')
            ->map(fn ($item) => (object) ['category' => $item->category, 'total' => $item->total])
            ->values();
        $pengeluaran_by_category = $monthlyBreakdown->where('type', 'out')
            ->map(fn ($item) => (object) ['category' => $item->category, 'total' => $item->total])
            ->values();

        // Query 2: Saldo total sepanjang waktu (menggantikan 2 query terpisah)
        $saldoTotal = Transaction::selectRaw("
            SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) -
            SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as saldo
        ")->value('saldo') ?? 0;

        return [
            'summary' => [
                'pemasukan_bulan_ini' => $pemasukan,
                'pengeluaran_bulan_ini' => $pengeluaran,
                'saldo_akhir_bulan' => $pemasukan - $pengeluaran,
                'saldo_total_kas' => $saldoTotal,
            ],
            'breakdown' => [
                'pemasukan' => $pemasukan_by_category,
                'pengeluaran' => $pengeluaran_by_category,
            ]
        ];
    }
}
