import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { X } from "lucide-react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import FormActions from "@/Components/FormActions";
interface Muzakki {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    muzakki?: Muzakki | null;
}

export default function MuzakkiForm({ isOpen, onClose, muzakki }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            phone: "",
            address: "",
        });

    useEffect(() => {
        if (muzakki) {
            setData({
                name: muzakki.name,
                phone: muzakki.phone || "",
                address: muzakki.address || "",
            });
        } else {
            reset();
        }
        clearErrors();
    }, [muzakki, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        };

        if (muzakki) {
            put(route("zakat.muzakki.update", muzakki.id), options);
        } else {
            post(route("zakat.muzakki.store"), options);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                        {muzakki ? "Edit Muzakki" : "Daftarkan Muzakki"}
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
                        <InputLabel htmlFor="name" value="Nama Lengkap *" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: Abdullah"
                            isFocused={isOpen} // Focus when opened
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="phone"
                            value="Nomor HP (WhatsApp)"
                        />
                        <TextInput
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="0812..."
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="address" value="Alamat" />
                        <textarea
                            id="address"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            rows={3}
                            placeholder="Alamat lengkap..."
                        />
                        <InputError message={errors.address} className="mt-2" />
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
