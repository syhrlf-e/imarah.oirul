import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "@/Components/Toast";
import { PageProps } from "@/types";

export default function GlobalToastListener() {
    const { props } = usePage<PageProps>();
    const flash = props.flash as
        | Record<string, string | null | undefined>
        | undefined;

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return null;
}
