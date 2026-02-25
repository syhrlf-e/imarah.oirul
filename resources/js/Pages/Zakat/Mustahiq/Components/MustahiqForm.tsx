import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { X } from "lucide-react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Dropdown from "@/Components/Dropdown"; // Need to check if Dropdown is suitable context-wise, or just use select
// Checking Components list: Dropdown.tsx exists. Usually for menus.
// For form select, standard <select> or a custom Select component is better.
// I'll use standard <select> with Tailwind classes for now to be safe and consistent.
import FormActions from "@/Components/FormActions";
interface Mustahiq {
    id: string;
    name: string;
    ashnaf: string;
    address: string | null;
    description: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mustahiq?: Mustahiq | null;
}

const ASHNAF_OPTIONS = [
    { value: "fakir", label: "Fakir" },
    { value: "miskin", label: "Miskin" },
    { value: "amil", label: "Amil" },
    { value: "mualaf", label: "Mualaf" },
    { value: "riqab", label: "Riqab" },
    { value: "gharim", label: "Gharim" },
    { value: "fisabilillah", label: "Fisabilillah" },
    { value: "ibnusabil", label: "Ibnu Sabil" },
];

export default function MustahiqForm({ isOpen, onClose, mustahiq }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            ashnaf: "fakir",
            address: "",
            description: "",
        });

    useEffect(() => {
        if (mustahiq) {
            setData({
                name: mustahiq.name,
                ashnaf: mustahiq.ashnaf,
                address: mustahiq.address || "",
                description: mustahiq.description || "",
            });
        } else {
            reset();
            setData("ashnaf", "fakir"); // Default
        }
        clearErrors();
    }, [mustahiq, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        };

        if (mustahiq) {
            put(route("zakat.mustahiq.update", mustahiq.id), options);
        } else {
            post(route("zakat.mustahiq.store"), options);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                        {mustahiq ? "Edit Mustahiq" : "Daftarkan Mustahiq"}
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
                    <div>
                        <InputLabel htmlFor="name" value="Nama Penerima *" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Nama Lengkap / Yayasan"
                            isFocused={isOpen}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="ashnaf"
                            value="Kategori Ashnaf *"
                        />
                        <select
                            id="ashnaf"
                            value={data.ashnaf}
                            onChange={(e) => setData("ashnaf", e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                        >
                            {ASHNAF_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.ashnaf} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="address" value="Alamat" />
                        <textarea
                            id="address"
                            className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            rows={3}
                            placeholder="Alamat lengkap..."
                        />
                        <InputError message={errors.address} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="description"
                            value="Keterangan Tambahan"
                        />
                        <textarea
                            id="description"
                            className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            rows={2}
                            placeholder="Kondisi ekonomi, jumlah tanggungan, dll."
                        />
                        <InputError
                            message={errors.description}
                            className="mt-2"
                        />
                    </div>

                    <FormActions
                        onCancel={onClose}
                        processing={processing}
                        submitText="Simpan Data"
                    />
                </form>
            </div>
        </Modal>
    );
}
