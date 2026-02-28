import axios from "axios";
import { toast } from "@/Components/Toast";

window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Global Axios Interceptor for Error Handling
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            toast.error(
                "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
            );
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        switch (status) {
            case 401:
            case 419:
                toast.error(
                    data?.message ||
                        "Sesi Anda telah habis. Silakan muat ulang halaman atau login kembali.",
                );
                if (status === 401 && window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                break;
            case 403:
                toast.error(
                    data?.message ||
                        "Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.",
                );
                break;
            case 404:
                toast.error(
                    data?.message ||
                        "Data atau rute yang diminta tidak ditemukan.",
                );
                break;
            case 422:
                // Biasanya error validasi form diextract dari data.errors di komponen spesifik
                toast.error(
                    data?.message ||
                        "Data yang dikirimkan tidak valid, mohon periksa kembali isian Anda.",
                );
                break;
            case 500:
                toast.error(
                    "Terjadi kesalahan pada server lokal. Tim kami sedang meninjaunya.",
                );
                break;
            case 503:
                toast.error(
                    "Layanan sedang dalam pemeliharaan. Silakan coba lagi nanti.",
                );
                break;
            default:
                toast.error(
                    data?.message ||
                        "Terjadi kesalahan sistem yang tidak diketahui.",
                );
                break;
        }

        return Promise.reject(error);
    },
);
