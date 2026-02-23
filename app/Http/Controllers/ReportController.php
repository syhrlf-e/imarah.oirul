<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;
use App\Exports\LaporanBulananExport;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        // Viewers (Jamaah umum) dan admin/bendahara diizinkan
        abort_if(!in_array(auth()->user()->role, ['super_admin', 'bendahara', 'petugas_zakat', 'viewer']), 403, 'Akses ditolak.');
        
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
        abort_if(!in_array(auth()->user()->role, ['super_admin', 'bendahara', 'petugas_zakat']), 403, 'Akses ditolak.');

        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));
        $fileName = 'Laporan_Keuangan_' . $month . '_' . $year . '.xlsx';

        return Excel::download(new LaporanBulananExport($month, $year), $fileName);
    }
}
