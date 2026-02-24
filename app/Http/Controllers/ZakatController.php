<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreZakatRequest;
use App\Models\Transaction;
use App\Models\Donatur;
use App\Models\Mustahiq;
use App\Services\TransactionService;
use App\Services\ZakatService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ZakatController extends Controller
{
    use AuthorizesRequests;
    protected $zakatService;
    protected $transactionService;

    public function __construct(ZakatService $zakatService, TransactionService $transactionService)
    {
        $this->zakatService = $zakatService;
        $this->transactionService = $transactionService;
    }

    public function index()
    {
        return Inertia::render('Zakat/Index');
    }

    public function history()
    {
        // Fetch separate transactions for Zakat Maal and Fitrah
        $transactions = Transaction::query()
            ->with(['donatur', 'creator'])
            ->where('type', 'in')
            ->whereIn('category', ['zakat_maal', 'zakat_fitrah'])
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($trx) => [
                'id' => $trx->id,
                'created_at' => $trx->created_at->format('Y-m-d H:i:s'),
                'donatur_name' => $trx->donatur ? $trx->donatur->name : '-',
                'category' => $trx->category,
                'amount' => $trx->amount,
                'payment_method' => $trx->payment_method,
                'notes' => $trx->notes,
                'status' => $trx->status ?? 'verified',
            ]);

        // Fetch Muzakkis for the form
        $muzakkis = Donatur::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Zakat/Penerimaan/Index', [
            'transactions' => $transactions,
            'muzakkis' => $muzakkis,
        ]);
    }

    public function kalkulator(StoreZakatRequest $request)
    {
        $validated = $request->validated();
        $result = 0;

        if ($validated['type'] === 'maal') {
            $result = $this->zakatService->hitungZakatMaal($validated['amount']);
        } elseif ($validated['type'] === 'fitrah') {
            $result = $this->zakatService->hitungZakatFitrah($validated['jiwa'], $validated['nominal_per_jiwa']);
        }

        return response()->json([
            'amount' => $result,
            'is_nishab' => $validated['type'] === 'maal' ? $this->zakatService->cekNishab($validated['amount'], 85000000) : true,
        ]);
    }

    public function store(StoreZakatRequest $request)
    {
        $validated = $request->validated();
        $finalAmount = 0;

        if ($validated['type'] === 'maal') {
            $finalAmount = $this->zakatService->hitungZakatMaal($validated['amount']);
        } else {
            $finalAmount = $this->zakatService->hitungZakatFitrah($validated['jiwa'], $validated['nominal_per_jiwa']);
        }

        $transactionData = [
            'type' => 'in',
            'category' => $validated['type'] === 'maal' ? 'zakat_maal' : 'zakat_fitrah',
            'amount' => $finalAmount,
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'],
            'donatur_id' => $validated['donatur_id'],
        ];

        $this->transactionService->store($transactionData, $request->user());

        return redirect()->route('zakat.penerimaan')->with('success', 'Penerimaan Zakat berhasil dicatat.');
    }

    public function penyaluran()
    {
        $transactions = Transaction::query()
            ->with(['mustahiq', 'creator'])
            ->where('type', 'out')
            ->whereIn('category', ['zakat_maal', 'zakat_fitrah'])
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($trx) => [
                'id' => $trx->id,
                'transaction_date' => $trx->transaction_date ? \Carbon\Carbon::parse($trx->transaction_date)->format('Y-m-d') : $trx->created_at->format('Y-m-d'),
                'mustahiq_name' => $trx->mustahiq ? $trx->mustahiq->name : '-',
                'category' => $trx->category,
                'amount' => $trx->amount,
                'payment_method' => $trx->payment_method,
                'notes' => $trx->notes,
                'status' => $trx->status ?? 'verified',
            ]);

        $mustahiqs = Mustahiq::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Zakat/Penyaluran/Index', [
            'transactions' => $transactions,
            'mustahiqs' => $mustahiqs,
        ]);
    }

    public function storePenyaluran(Request $request)
    {
        $validated = $request->validate([
            'mustahiq_id' => 'required|exists:mustahiqs,id',
            'type' => 'required|in:fitrah,maal',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'payment_method' => 'required|in:tunai,transfer',
            'notes' => 'nullable|string',
        ]);

        $category = $validated['type'] === 'maal' ? 'zakat_maal' : 'zakat_fitrah';

        // Check balance
        $totalIn = Transaction::where('category', $category)->where('type', 'in')->sum('amount');
        $totalOut = Transaction::where('category', $category)->where('type', 'out')->sum('amount');
        $balance = $totalIn - $totalOut;

        if ($validated['amount'] > $balance) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'amount' => 'Saldo zakat tidak mencukupi (Sisa: Rp ' . number_format($balance, 0, ',', '.') . ')',
            ]);
        }

        $transactionData = [
            'type' => 'out',
            'category' => $category,
            'amount' => $validated['amount'],
            'transaction_date' => $validated['transaction_date'],
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'],
            'mustahiq_id' => $validated['mustahiq_id'],
        ];

        $this->transactionService->store($transactionData, $request->user());

        return redirect()->route('zakat.penyaluran')->with('success', 'Penyaluran Zakat berhasil dicatat.');
    }
}
