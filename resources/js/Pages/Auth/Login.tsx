import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

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

            <div className="mb-8 text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    Selamat Datang 👋
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-500">
                    Silakan masuk dengan akun Anda untuk mengakses dashboard
                    manajemen.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Alamat Email"
                        className="mb-1.5 ml-1 text-slate-700 font-semibold"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="admin@masjid.com"
                    />

                    <InputError message={errors.email} className="mt-2 ml-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Kata Sandi"
                        className="mb-1.5 ml-1 text-slate-700 font-semibold"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="••••••••"
                    />

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
                            className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500/30 w-5 h-5 cursor-pointer"
                        />
                        <span className="ms-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
                        >
                            Lupa sandi?
                        </Link>
                    )}
                </div>

                <div>
                    <PrimaryButton
                        className="w-full justify-center py-3.5 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500/50 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
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
