import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
    ],

    theme: {
        extend: {
            colors: {
                emerald: {
                    50: "#F2FDF5",
                    100: "#E1FCE9",
                    200: "#C2F8D5",
                    300: "#90F1B5",
                    400: "#56E091",
                    500: "#2EC571",
                    600: "#20A159", // Primary Button & Accent (Deep Mint / Spring Green)
                    700: "#1B8049", // Hover states
                    800: "#18643C",
                    900: "#145233",
                    950: "#0B2E1E",
                },
            },
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", ...defaultTheme.fontFamily.sans],
                poppins: ["Poppins", ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
