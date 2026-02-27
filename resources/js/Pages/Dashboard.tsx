import { Head, Link, useRemember } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { formatRupiah } from "@/utils/formatter";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import KasSummaryCards from "@/Components/KasSummaryCards";
import FinancialChart from "@/Components/Dashboard/FinancialChart";
import UpcomingAgendas from "@/Components/Dashboard/UpcomingAgendas";
import RecentTransactions from "@/Components/Dashboard/RecentTransactions";

dayjs.locale("id");

interface Transaction {
    id: number;
    category: string;
    type: "pemasukan" | "pengeluaran";
    amount: number;
    transaction_date: string;
    description: string;
}

interface Agenda {
    id: number;
    title: string;
    type: string;
    start_time: string;
    location: string;
}

interface ChartData {
    name: string;
    pemasukan: number;
    pengeluaran: number;
}

interface ZakatStats {
    total_muzakki: number;
    total_mustahiq: number;
}

interface InventarisStats {
    total_items: number;
    good_items: number;
    broken_items: number;
}

interface TromolStats {
    total_boxes: number;
    active_boxes: number;
}

interface DashboardProps {
    auth: {
        user: {
            name: string;
            role: string;
        };
    };
    totalSaldo: number;
    totalZakat: number;
    totalTransaksiBulanIni: number;
    pemasukanBulanIni: number;
    pengeluaranBulanIni: number;
    recentTransactions: Transaction[];
    upcomingAgendas: Agenda[];
    chartData: ChartData[];
    totalKasTransactions: number;
    zakatStats: ZakatStats | null;
    inventarisStats: InventarisStats | null;
    tromolStats: TromolStats | null;
}

export default function Dashboard({
    auth,
    totalSaldo: propTotalSaldo = 0,
    totalZakat: propTotalZakat = 0,
    totalTransaksiBulanIni: propTotalTransaksiBulanIni = 0,
    pemasukanBulanIni: propPemasukanBulanIni = 0,
    pengeluaranBulanIni: propPengeluaranBulanIni = 0,
    recentTransactions: propRecentTransactions = [],
    upcomingAgendas: propUpcomingAgendas = [],
    chartData: propChartData = [],
    totalKasTransactions: propTotalKasTransactions = 0,
    zakatStats: propZakatStats = null,
    inventarisStats: propInventarisStats = null,
    tromolStats: propTromolStats = null,
}: DashboardProps) {
    // Cache data dashboard agar saat kembali dari halaman lain, data langsung tampil tanpa loading ulang
    const [dashboardData, setDashboardData] = useRemember(
        {
            totalSaldo: propTotalSaldo,
            totalZakat: propTotalZakat,
            totalTransaksiBulanIni: propTotalTransaksiBulanIni,
            pemasukanBulanIni: propPemasukanBulanIni,
            pengeluaranBulanIni: propPengeluaranBulanIni,
            recentTransactions: propRecentTransactions,
            upcomingAgendas: propUpcomingAgendas,
            chartData: propChartData,
            totalKasTransactions: propTotalKasTransactions,
            zakatStats: propZakatStats,
            inventarisStats: propInventarisStats,
            tromolStats: propTromolStats,
        },
        "dashboard-summary",
    );

    // Selalu update cache saat props berubah (data baru dari server)
    useEffect(() => {
        setDashboardData({
            totalSaldo: propTotalSaldo,
            totalZakat: propTotalZakat,
            totalTransaksiBulanIni: propTotalTransaksiBulanIni,
            pemasukanBulanIni: propPemasukanBulanIni,
            pengeluaranBulanIni: propPengeluaranBulanIni,
            recentTransactions: propRecentTransactions,
            upcomingAgendas: propUpcomingAgendas,
            chartData: propChartData,
            totalKasTransactions: propTotalKasTransactions,
            zakatStats: propZakatStats,
            inventarisStats: propInventarisStats,
            tromolStats: propTromolStats,
        });
    }, [
        propTotalSaldo,
        propTotalZakat,
        propTotalTransaksiBulanIni,
        propPemasukanBulanIni,
        propPengeluaranBulanIni,
        propTotalKasTransactions,
    ]);

    // Destructure dari cache
    const {
        totalSaldo,
        totalZakat,
        totalTransaksiBulanIni,
        pemasukanBulanIni,
        pengeluaranBulanIni,
        recentTransactions,
        upcomingAgendas,
        chartData,
        totalKasTransactions,
        zakatStats,
        inventarisStats,
        tromolStats,
    } = dashboardData;

    const [loading, setLoading] = useState(false);
    const [hijriDate, setHijriDate] = useState<string>("");

    const getHijriDateString = () => {
        try {
            const date = new Date();
            const format = new Intl.DateTimeFormat("id-TN-u-ca-islamic", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(date);
            return format.replace(/ H$/i, "") + " H";
        } catch (e) {
            return "Tanggal Hijriyah";
        }
    };

    useEffect(() => {
        setHijriDate(getHijriDateString());
    }, []);

    const masehiDateStr = dayjs().format("dddd, D MMMM YYYY");

    return (
        <AppLayout title="Dashboard">
            <Head title="Beranda" />

            <div className="flex flex-col flex-1 lg:min-h-0">
                {/* Mobile Greeting Section */}
                <div className="flex flex-col md:hidden px-4 mb-4 shrink-0">
                    <p className="text-sm font-normal text-slate-900 lowercase">
                        Assalamu'alaikum,
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-bold text-slate-900">
                            {auth.user.name}
                        </span>
                        <span className="text-[10px] font-medium text-[#22C55E] bg-white border border-[#22C55E] rounded-full px-1.5 py-[2px] capitalize">
                            {auth.user.role.replace("_", " ")}
                        </span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-400 mt-1">
                        {masehiDateStr} · {hijriDate}
                    </p>
                </div>

                {/* Desktop Greeting Header Section */}
                <div className="hidden md:flex mb-6 flex-row items-center justify-between gap-4 shrink-0 px-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
                            Assalamu'alaikum, {auth.user.name}! 👋
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            sebagai{" "}
                            <span className="capitalize">
                                {auth.user.role.replace("_", " ")}
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                            {masehiDateStr}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {hijriDate}
                        </p>
                    </div>
                </div>

                {/* Main Layout Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 flex-1 lg:min-h-0">
                    {/* Left Section: Stats & Chart */}
                    <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 lg:min-h-0">
                        {/* Summary Zakat (Petugas Zakat) */}
                        {auth.user.role === "petugas_zakat" && zakatStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                                    <p className="text-slate-500 text-sm mb-1">
                                        Total Muzakki
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {zakatStats.total_muzakki}{" "}
                                        <span className="text-sm font-normal text-slate-500">
                                            Orang
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                                    <p className="text-slate-500 text-sm mb-1">
                                        Total Mustahiq
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {zakatStats.total_mustahiq}{" "}
                                        <span className="text-sm font-normal text-slate-500">
                                            Orang
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-200 bg-emerald-50">
                                    <p className="text-emerald-700 text-sm mb-1">
                                        Ringkasan Zakat Terkumpul
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-800">
                                        {formatRupiah(totalZakat)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Summary Inventaris (Sekretaris) */}
                        {auth.user.role === "sekretaris" && inventarisStats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                                    <p className="text-slate-500 text-sm mb-1">
                                        Total Item Inventaris
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {inventarisStats.total_items}{" "}
                                        <span className="text-sm font-normal text-slate-500">
                                            Unit
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                                    <p className="text-emerald-700 text-sm mb-1">
                                        Kondisi Baik
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-800">
                                        {inventarisStats.good_items}{" "}
                                        <span className="text-sm font-normal text-emerald-700">
                                            Unit
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                                    <p className="text-red-700 text-sm mb-1">
                                        Kondisi Rusak
                                    </p>
                                    <p className="text-2xl font-bold text-red-800">
                                        {inventarisStats.broken_items}{" "}
                                        <span className="text-sm font-normal text-red-700">
                                            Unit
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Top Stats Grid Kas (Bendahara & Super Admin) */}
                        {["super_admin", "bendahara"].includes(
                            auth.user.role,
                        ) && (
                            <KasSummaryCards
                                totalSaldo={totalSaldo}
                                pemasukanBulanIni={pemasukanBulanIni}
                                pengeluaranBulanIni={pengeluaranBulanIni}
                                loading={loading}
                                formatter={formatRupiah}
                                className="shrink-0"
                            />
                        )}

                        {/* 6-Month Chart Trend Kas */}
                        {["super_admin", "bendahara"].includes(
                            auth.user.role,
                        ) && (
                            <FinancialChart
                                data={chartData}
                                loading={loading}
                            />
                        )}
                    </div>

                    {/* Right Section: Agenda & Recent Transactions */}
                    <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6 lg:min-h-0">
                        {/* Upcoming Agendas Widget (Hanya Super Admin) */}
                        {auth.user.role === "super_admin" && (
                            <UpcomingAgendas
                                agendas={upcomingAgendas}
                                loading={loading}
                            />
                        )}

                        {/* Recent Transactions Widget (Super Admin & Bendahara) */}
                        {["super_admin", "bendahara"].includes(
                            auth.user.role,
                        ) && (
                            <RecentTransactions
                                transactions={recentTransactions}
                                totalCount={totalKasTransactions}
                                loading={loading}
                            />
                        )}
                    </div>
                </div>

                {/* Monthly Report Full-width Shortcut (Super Admin & Bendahara) */}
                {["super_admin", "bendahara"].includes(auth.user.role) && (
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 md:mt-6 shrink-0">
                        <div className="flex items-center">
                            <div className="hidden md:flex p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4 shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                    Laporan Keuangan{" "}
                                    {dayjs().format("MMMM YYYY")}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Unduh rekapitulasi pemasukan dan pengeluaran
                                    bulan ini.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 mt-4 sm:mt-0 w-full sm:w-auto">
                            <Link
                                href="/laporan"
                                className="inline-flex w-full sm:w-[140px] items-center justify-center px-6 py-2.5 bg-white border border-emerald-500 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-700 shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/50 focus:outline-none cursor-pointer"
                            >
                                Lihat Disini
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
