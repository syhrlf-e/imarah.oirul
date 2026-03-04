import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({ status }: { status?: string }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        clearErrors();

        let hasError = false;

        if (!data.email) {
            setError("email", "Alamat email wajib diisi");
            hasError = true;
        } else {
            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(data.email)) {
                setError("email", "Email yang Anda masukkan tidak sesuai");
                hasError = true;
            }
        }

        if (!data.password) {
            setError("password", "Kata sandi wajib diisi");
            hasError = true;
        }

        if (hasError) return;

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk ke Sistem" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg">
                    {status}
                </div>
            )}

            <div className="mb-8 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
                    Imarah
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                    Sistem Manajemen Masjid Digital Terpadu
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className={`peer block w-full px-4 pt-6 pb-2 rounded-xl bg-slate-50 focus:bg-white transition-colors shadow-sm text-sm ${
                                errors.email
                                    ? "!border-red-500 focus:!ring-2 focus:!ring-red-500/20 focus:!border-red-500 !ring-1 !ring-red-500"
                                    : "!border-slate-200 focus:!ring-2 focus:!ring-emerald-500/20 focus:!border-emerald-500"
                            }`}
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => {
                                const val = e.target.value
                                    .toLowerCase()
                                    .replace(/\s/g, "");
                                setData("email", val);
                                if (errors.email && val.length >= 3)
                                    clearErrors("email");
                            }}
                            placeholder=" "
                        />
                        <label
                            htmlFor="email"
                            className={`absolute left-4 top-2 -translate-y-0 text-[11px] font-semibold transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold cursor-text pointer-events-none ${
                                errors.email
                                    ? "text-red-500 peer-focus:text-red-500"
                                    : "text-emerald-600 peer-focus:text-emerald-600"
                            }`}
                        >
                            Alamat Email
                        </label>
                    </div>

                    <InputError message={errors.email} className="mt-2 ml-1" />
                </div>

                <div>
                    <div className="relative">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className={`peer block w-full px-4 pt-6 pb-2 rounded-xl bg-slate-50 focus:bg-white transition-colors shadow-sm text-sm ${
                                errors.password
                                    ? "!border-red-500 focus:!ring-2 focus:!ring-red-500/20 focus:!border-red-500 !ring-1 !ring-red-500"
                                    : "!border-slate-200 focus:!ring-2 focus:!ring-emerald-500/20 focus:!border-emerald-500"
                            }`}
                            autoComplete="current-password"
                            onChange={(e) => {
                                setData("password", e.target.value);
                                if (
                                    errors.password &&
                                    e.target.value.length >= 3
                                )
                                    clearErrors("password");
                            }}
                            placeholder=" "
                        />
                        <label
                            htmlFor="password"
                            className={`absolute left-4 top-2 -translate-y-0 text-[11px] font-semibold transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold cursor-text pointer-events-none ${
                                errors.password
                                    ? "text-red-500 peer-focus:text-red-500"
                                    : "text-emerald-600 peer-focus:text-emerald-600"
                            }`}
                        >
                            Kata Sandi
                        </label>
                    </div>

                    <InputError
                        message={errors.password}
                        className="mt-2 ml-1"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    "remember",
                                    (e.target.checked || false) as false,
                                )
                            }
                            className="rounded border-slate-200 text-emerald-600 shadow-sm focus:!ring-0 focus:!ring-offset-0 focus:outline-none w-5 h-5 cursor-pointer outline-none"
                        />
                        <span className="ms-3 text-sm text-slate-500 group-hover:text-slate-800 transition-colors">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div>
                    <PrimaryButton
                        className="w-full justify-center py-3.5 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md hover:shadow-lg focus:!ring-0 focus:outline-none disabled:opacity-70"
                        disabled={processing}
                    >
                        Masuk Sekarang
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400">
                <p className="font-poppins tracking-wide">
                    © {new Date().getFullYear()} Imarah. Hak Cipta Dilindungi.
                </p>
            </div>
        </GuestLayout>
    );
}
