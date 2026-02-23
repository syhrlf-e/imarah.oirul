import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl border border-transparent bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-600 focus:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 active:bg-green-700 ${
                    disabled && "opacity-60 cursor-not-allowed"
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
