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

        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        $transactions = Transaction::with(['donatur', 'tromolBox', 'creator', 'verifier'])
            ->latest()
            ->paginate(10);

        $summaryData = $this->transactionService->getSummary($month, $year);

        return Inertia::render('Kas/Index', [
            'transactions' => $transactions,
            'summary' => $summaryData['summary'],
            'month' => $month,
            'year' => $year,
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
