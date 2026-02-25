import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { formatRupiah } from "@/utils/formatter";
import {
    Wallet,
    RefreshCw,
    Calendar,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    LogOut,
    ChevronDown,
    ChevronRight,
    Bell,
    Clock,
    MapPin,
    CalendarDays,
    Activity,
    FileText,
    Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import KasSummaryCards from "@/Components/KasSummaryCards";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

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
}

export default function Dashboard({
    auth,
    totalSaldo = 0,
    totalZakat = 0,
    totalTransaksiBulanIni = 0,
    pemasukanBulanIni = 0,
    pengeluaranBulanIni = 0,
    recentTransactions = [],
    upcomingAgendas = [],
    chartData = [],
    totalKasTransactions = 0,
}: DashboardProps) {
    const [loading, setLoading] = useState(true);
    const [hijriDate, setHijriDate] = useState<string>("");

    // Format Number Compact for Chart YAxis (e.g 10M, 500K)
    const formatCompactNumber = (number: number) => {
        return new Intl.NumberFormat("id-ID", {
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(number);
    };

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
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const masehiDateStr = dayjs().format("dddd, D MMMM YYYY");

    const stats = []; // Removed because using custom themed cards based on Laporan

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-sm">
                    <p className="font-bold text-slate-800 mb-2">{label}</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="text-slate-600">Pemasukan:</span>
                            <span className="font-semibold text-slate-800">
                                {formatRupiah(payload[0].value)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <span className="text-slate-600">Pengeluaran:</span>
                            <span className="font-semibold text-slate-800">
                                {formatRupiah(payload[1].value)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout title="Dashboard">
            <Head title="Beranda" />

            <div className="flex flex-col flex-1 lg:min-h-0">
                {/* Mobile Greeting Section */}
                <div className="flex flex-col md:hidden px-4 mb-4 shrink-0">
                    <p className="text-sm font-normal text-slate-900 lowercase">
                        assalamualaikum
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
                        {/* Top Stats Grid */}
                        <KasSummaryCards
                            totalSaldo={totalSaldo}
                            pemasukanBulanIni={pemasukanBulanIni}
                            pengeluaranBulanIni={pengeluaranBulanIni}
                            loading={loading}
                            formatter={formatRupiah}
                            className="shrink-0"
                        />

                        {/* 6-Month Chart Trend */}
                        <div className="hidden md:flex bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-col flex-1 lg:min-h-0">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-emerald-500" />
                                        Grafik Arus Kas
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Sirkulasi dana 6 bulan terakhir
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 w-full min-h-0">
                                {loading ? (
                                    <div className="w-full h-full bg-slate-100/50 animate-pulse rounded-xl"></div>
                                ) : (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                        minHeight={250}
                                    >
                                        <AreaChart
                                            data={chartData}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="colorIdPemasukan"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0.2}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="colorIdPengeluaran"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#ef4444"
                                                        stopOpacity={0.2}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#ef4444"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e2e8f0"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#64748b",
                                                    fontSize: 12,
                                                }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#64748b",
                                                    fontSize: 12,
                                                }}
                                                tickFormatter={
                                                    formatCompactNumber
                                                }
                                            />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="pemasukan"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorIdPemasukan)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="pengeluaran"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorIdPengeluaran)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Agenda & Recent Transactions */}
                    <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6 lg:min-h-0">
                        {/* Upcoming Agendas Widget */}
                        <div className="order-2 lg:order-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col shrink-0">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                                <h3 className="font-semibold text-slate-800 text-base">
                                    Agenda Mendatang
                                </h3>
                                <Link
                                    href="/agenda"
                                    className="text-xs text-emerald-600 font-medium hover:text-emerald-700 flex items-center"
                                >
                                    Semua{" "}
                                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Link>
                            </div>
                            <div className="p-2 flex flex-col pt-3">
                                {loading ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="h-16 bg-slate-100 animate-pulse rounded-xl"
                                            ></div>
                                        ))}
                                    </div>
                                ) : upcomingAgendas.length > 0 ? (
                                    <div className="space-y-1">
                                        {upcomingAgendas.map((agenda) => {
                                            return (
                                                <div
                                                    key={agenda.id}
                                                    className="flex gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors items-start"
                                                >
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0 text-emerald-700">
                                                        <span className="text-[10px] font-semibold uppercase leading-none mb-1">
                                                            {dayjs(
                                                                agenda.start_time,
                                                            ).format("MMM")}
                                                        </span>
                                                        <span className="text-base font-bold leading-none">
                                                            {dayjs(
                                                                agenda.start_time,
                                                            ).format("DD")}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-800 text-sm truncate">
                                                            {agenda.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <span className="flex items-center text-xs text-slate-500">
                                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                                {dayjs(
                                                                    agenda.start_time,
                                                                ).format(
                                                                    "HH:mm",
                                                                )}{" "}
                                                                WIB
                                                            </span>
                                                            <span className="flex items-center text-xs text-slate-500 truncate">
                                                                <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                                                                <span className="truncate">
                                                                    {
                                                                        agenda.location
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                        <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium text-sm">
                                            Tidak ada agenda dekat
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions Widget */}
                        <div className="order-1 lg:order-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-semibold text-slate-800 text-base">
                                    Transaksi Terbaru
                                </h3>
                                <Link
                                    href="/kas"
                                    className="text-xs text-emerald-600 font-medium hover:text-emerald-700 flex items-center"
                                >
                                    Semua{" "}
                                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Link>
                            </div>
                            <div className="p-2 flex-1 flex flex-col min-h-0 custom-scrollbar">
                                {loading ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="h-16 bg-slate-100 animate-pulse rounded-xl"
                                            ></div>
                                        ))}
                                    </div>
                                ) : recentTransactions.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {recentTransactions
                                            .slice(0, 4)
                                            .map((trx) => (
                                                <div
                                                    key={trx.id}
                                                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-100"
                                                >
                                                    <div className="flex gap-3 items-center min-w-0">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-800 text-xs truncate flex items-center">
                                                                {trx.category
                                                                    .replace(
                                                                        /_/g,
                                                                        " ",
                                                                    )
                                                                    .toUpperCase()}
                                                                {trx.type ===
                                                                "pemasukan" ? (
                                                                    <TrendingUp className="w-3.5 h-3.5 inline-block ml-1.5 text-emerald-500" />
                                                                ) : (
                                                                    <TrendingDown className="w-3.5 h-3.5 inline-block ml-1.5 text-red-500" />
                                                                )}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                                                {dayjs(
                                                                    trx.transaction_date,
                                                                ).format(
                                                                    "DD MMM YYYY",
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 pl-2">
                                                        <p
                                                            className={`font-semibold text-xs font-mono tracking-tight ${trx.type === "pemasukan" ? "text-emerald-600" : "text-slate-800"}`}
                                                        >
                                                            {trx.type ===
                                                            "pemasukan"
                                                                ? "+"
                                                                : "-"}
                                                            {formatRupiah(
                                                                trx.amount,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        {totalKasTransactions > 4 && (
                                            <div className="text-center py-2 mt-auto border-t border-slate-100 shrink-0">
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    ... dan{" "}
                                                    {totalKasTransactions - 4}{" "}
                                                    transaksi lainnya
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[150px]">
                                        <Wallet className="w-10 h-10 text-slate-300 mb-3" />
                                        <p className="text-slate-500 text-sm font-medium">
                                            Belum ada transaksi
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Report Full-width Shortcut */}
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 md:mt-6 shrink-0">
                    <div className="flex items-center">
                        <div className="hidden md:flex p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4 shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                Laporan Keuangan {dayjs().format("MMMM YYYY")}
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
            </div>
        </AppLayout>
    );
}
