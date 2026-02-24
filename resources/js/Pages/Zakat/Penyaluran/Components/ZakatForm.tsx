import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { X } from "lucide-react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { formatRupiah } from "@/utils/formatter"; // Ensure this exists or I'll fix it
import { Loader2 } from "lucide-react";
import RupiahInput from "@/Components/RupiahInput"; // Need to check if this exists
import { useNetwork } from "@/Hooks/useNetwork";

// Checking components: RupiahInput.tsx exists.

interface Mustahiq {
    id: string;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mustahiqs: Mustahiq[]; // Passed from parent
}

export default function ZakatForm({ isOpen, onClose, mustahiqs }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            mustahiq_id: "",
            type: "fitrah", // fitrah | maal
            amount: 0, // For Maal base amount (harta) or Fitrah direct amount?
            jiwa: 1,
            nominal_per_jiwa: 45000,
            transaction_date: new Date().toISOString().split("T")[0],
            payment_method: "tunai",
            notes: "",
        });

    const isOnline = useNetwork();
    const [calculatedZakat, setCalculatedZakat] = useState(0);

    // Auto-calculate logic
    useEffect(() => {
        if (data.type === "fitrah") {
            setCalculatedZakat(data.jiwa * data.nominal_per_jiwa);
        } else {
            // Maal 2.5%
            setCalculatedZakat(Math.floor(data.amount * 0.025));
        }
    }, [data.type, data.amount, data.jiwa, data.nominal_per_jiwa]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("zakat.penyaluran.store"), {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                        Form Penyaluran Zakat
                    </h2>
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mustahiq Select */}
                    <div>
                        <InputLabel htmlFor="mustahiq_id" value="Mustahiq" />
                        <select
                            id="mustahiq_id"
                            value={data.mustahiq_id}
                            onChange={(e) =>
                                setData("mustahiq_id", e.target.value)
                            }
                            className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                        >
                            <option value="">-- Pilih Mustahiq --</option>
                            {mustahiqs.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <InputError
                            message={errors.mustahiq_id}
                            className="mt-2"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Belum ada?{" "}
                            <a
                                href={route("zakat.mustahiq")}
                                className="text-emerald-600 hover:underline"
                            >
                                Tambah Mustahiq
                            </a>
                        </p>
                    </div>

                    {/* Tanggal Penyaluran */}
                    <div>
                        <InputLabel
                            htmlFor="transaction_date"
                            value="Tanggal Penyaluran"
                        />
                        <TextInput
                            id="transaction_date"
                            type="date"
                            value={data.transaction_date}
                            onChange={(e) =>
                                setData("transaction_date", e.target.value)
                            }
                            className="mt-1 block w-full"
                        />
                        <InputError
                            message={errors.transaction_date}
                            className="mt-2"
                        />
                    </div>

                    {/* Type Selection */}
                    <div>
                        <InputLabel value="Jenis Zakat" />
                        <div className="mt-2 flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-emerald-600 focus:ring-emerald-500"
                                    name="type"
                                    value="fitrah"
                                    checked={data.type === "fitrah"}
                                    onChange={() => setData("type", "fitrah")}
                                />
                                <span className="ml-2">Zakat Fitrah</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-emerald-600 focus:ring-emerald-500"
                                    name="type"
                                    value="maal"
                                    checked={data.type === "maal"}
                                    onChange={() => setData("type", "maal")}
                                />
                                <span className="ml-2">Zakat Maal</span>
                            </label>
                        </div>
                        <InputError message={errors.type} className="mt-2" />
                    </div>

                    {/* Conditional Fields */}
                    {data.type === "fitrah" ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="jiwa"
                                    value="Jumlah Jiwa"
                                />
                                <TextInput
                                    id="jiwa"
                                    type="number"
                                    min="1"
                                    value={data.jiwa}
                                    onChange={(e) =>
                                        setData(
                                            "jiwa",
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError
                                    message={errors.jiwa}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="nominal_per_jiwa"
                                    value="Nominal / Jiwa"
                                />
                                <RupiahInput
                                    value={data.nominal_per_jiwa}
                                    onValueChange={(val) =>
                                        setData("nominal_per_jiwa", val)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError
                                    message={errors.nominal_per_jiwa}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <InputLabel
                                htmlFor="amount"
                                value="Nominal Penyaluran (Rp)"
                            />
                            <RupiahInput
                                value={data.amount}
                                onValueChange={(val) => setData("amount", val)}
                                className="mt-1 block w-full"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Masukkan nominal zakat yang akan disalurkan.
                            </p>
                            <InputError
                                message={errors.amount}
                                className="mt-2"
                            />
                        </div>
                    )}

                    {/* Calculator Result Box */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
                        <span className="text-emerald-800 font-medium">
                            Total Penyaluran:
                        </span>
                        <span className="text-xl font-bold text-emerald-700">
                            {formatRupiah(
                                data.type === "fitrah"
                                    ? calculatedZakat
                                    : data.amount,
                            )}
                        </span>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <InputLabel
                            htmlFor="payment_method"
                            value="Metode Pembayaran"
                        />
                        <select
                            id="payment_method"
                            value={data.payment_method}
                            onChange={(e) =>
                                setData("payment_method", e.target.value)
                            }
                            className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                        >
                            <option value="tunai">Tunai</option>
                            <option value="transfer">Transfer Bank</option>
                            <option value="qris">QRIS</option>
                        </select>
                        <InputError
                            message={errors.payment_method}
                            className="mt-2"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <InputLabel
                            htmlFor="notes"
                            value="Keterangan (Opsional)"
                        />
                        <textarea
                            id="notes"
                            className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={2}
                            placeholder="Catatan tambahan..."
                        />
                        <InputError message={errors.notes} className="mt-2" />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <SecondaryButton
                            onClick={onClose}
                            disabled={processing}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing || !isOnline}>
                            {processing ? "Menyimpan..." : "Simpan Penyaluran"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
