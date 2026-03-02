<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    use AuthorizesRequests;
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Transaction::class);

        $month    = $request->get('month', date('m'));
        $year     = $request->get('year', date('Y'));
        $type     = $request->get('type');
        $category = $request->get('category');
        $search   = $request->get('search');
        $sort     = $request->get('sort', 'terbaru'); // default terbaru

        // Set fixed items per page to 5 for consistent fixed-height layout
        $perPage = 5;

        $transactions = Transaction::with(['creator', 'verifier'])
            ->when($type,     fn ($q) => $q->where('type', $type))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($search,   fn ($q) => $q->where('notes', 'ilike', "%{$search}%"))
            ->when($sort === 'terlama', fn($q) => $q->oldest(), fn($q) => $q->latest())
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($t) => array_merge($t->toArray(), [
                'user' => $t->creator,
            ]));

        $summaryData = $this->transactionService->getSummary($month, $year);

        // Rincian pemasukan per kategori bulan ini
        $rincianPemasukan = Transaction::where('type', 'in')
            ->whereMonth('created_at', (int) $month)
            ->whereYear('created_at', (int) $year)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => ['category' => $item->category, 'total' => (int) $item->total]);

        // Rincian pengeluaran per kategori bulan ini
        $rincianPengeluaran = Transaction::where('type', 'out')
            ->whereMonth('created_at', (int) $month)
            ->whereYear('created_at', (int) $year)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => ['category' => $item->category, 'total' => (int) $item->total]);

        return Inertia::render('Kas/Index', [
            'transactions' => $transactions,
            'summary'      => $summaryData['summary'],
            'month'        => $month,
            'year'         => $year,
            'filters'      => [
                'type'     => $type,
                'category' => $category,
                'search'   => $search,
                'sort'     => $sort,
            ],
            'breakdown'    => [
                'pemasukan'   => $rincianPemasukan,
                'pengeluaran' => $rincianPengeluaran,
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Transaction::class);

        return Inertia::render('Kas/Create');
    }

    public function store(StoreTransactionRequest $request)
    {
        $this->authorize('create', Transaction::class);

        $this->transactionService->store($request->validated(), $request->user());

        return redirect()->route('kas.index')->with('success', 'Transaction created successfully.');
    }

    public function verify(Transaction $transaction, Request $request)
    {
        $this->authorize('update', $transaction);

        $this->transactionService->verify($transaction, $request->user());

        return redirect()->back()->with('success', 'Transaction verified successfully.');
    }

    public function destroy(Transaction $transaction, Request $request)
    {
        $this->authorize('delete', $transaction);

        $reason = $request->input('reason', 'Deleted by admin'); // Should validate reason if needed

        $this->transactionService->softDelete($transaction, $request->user(), $reason);

        return redirect()->back()->with('success', 'Transaction deleted successfully.');
    }
}
