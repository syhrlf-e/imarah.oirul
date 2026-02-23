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
     *
     * @param string|int $month
     * @param string|int $year
     * @return array
     */
    public function getSummary($month, $year): array
    {
        // Query Rekap Bulanan
        $query = Transaction::whereMonth('created_at', $month)
                            ->whereYear('created_at', $year);

        // Agregasi Bulanan
        $pemasukan = (clone $query)->where('type', 'in')->sum('amount');
        $pengeluaran = (clone $query)->where('type', 'out')->sum('amount');
        $saldo_akhir_bulan = $pemasukan - $pengeluaran;

        // Breakdown per Kategori (Pemasukan)
        $pemasukan_by_category = (clone $query)->where('type', 'in')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        // Breakdown per Kategori (Pengeluaran)
        $pengeluaran_by_category = (clone $query)->where('type', 'out')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        // Saldo Kas Keseluruhan (Sepanjang Waktu)
        $total_pemasukan_all = Transaction::where('type', 'in')->sum('amount');
        $total_pengeluaran_all = Transaction::where('type', 'out')->sum('amount');
        $saldo_total = $total_pemasukan_all - $total_pengeluaran_all;

        return [
            'summary' => [
                'pemasukan_bulan_ini' => $pemasukan,
                'pengeluaran_bulan_ini' => $pengeluaran,
                'saldo_akhir_bulan' => $saldo_akhir_bulan,
                'saldo_total_kas' => $saldo_total,
            ],
            'breakdown' => [
                'pemasukan' => $pemasukan_by_category,
                'pengeluaran' => $pengeluaran_by_category,
            ]
        ];
    }
}
