<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Inertia\Response;
use Illuminate\Support\Carbon;
use App\Exports\LaporanBulananExport;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('view-reports');
        
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        $summaryData = app(\App\Services\TransactionService::class)->getSummary($month, $year);

        return Inertia::render('Laporan/Index', [
            'month' => $month,
            'year' => $year,
            'summary' => $summaryData['summary'],
            'breakdown' => $summaryData['breakdown'],
        ]);
    }

    /**
     * Export laporan bulanan ke Excel (.xlsx)
     */
    public function export(Request $request)
    {
        Gate::authorize('export-reports');

        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));
        $fileName = 'Laporan_Keuangan_' . $month . '_' . $year . '.xlsx';

        return Excel::download(new LaporanBulananExport($month, $year), $fileName);
    }
}
