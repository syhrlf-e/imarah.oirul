import React, { createContext, useContext, useState, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";

const NavigationContext = createContext<{
    direction: number;
    currentIndex: number;
    navigateTo: (href: string, index: number) => void;
    navItems: { href: string; index: number; label: string }[];
}>({
    direction: 0,
    currentIndex: 0,
    navigateTo: () => {},
    navItems: [],
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider = ({
    children,
    url,
}: {
    children: React.ReactNode;
    url: string;
}) => {
    const { props } = usePage<any>();
    const role = props.auth?.user?.role;

    const [direction, setDirection] = useState(0);

    // Kumpulkan rute yang valid dinamis berdasarkan role supaya fitur Swap aman untuk non-admin
    const navItems = useMemo(() => {
        const items = [];
        items.push({ href: "/dashboard", label: "Dashboard", index: 0 });

        if (["super_admin", "bendahara"].includes(role)) {
            items.push({ href: "/kas", label: "Kas", index: 1 });
        } else if (role === "sekretaris") {
            items.push({ href: "/inventaris", label: "Inventaris", index: 1 });
        }

        if (["super_admin", "bendahara", "petugas_zakat"].includes(role)) {
            items.push({
                href: role === "petugas_zakat" ? "/zakat/muzakki" : "/zakat",
                label: "Zakat",
                index: 2,
            });
        }

        if (["super_admin", "bendahara"].includes(role)) {
            items.push({ href: "/laporan", label: "Laporan", index: 3 });
        }

        items.push({ href: "/profil-mobile", label: "Profil", index: 4 });

        return items;
    }, [role]);

    // Berdasar kecocokan awalan path, kecuali dashboard yang strict
    const getCurrentItem = () => {
        if (url === "/" || url === "/dashboard")
            return navItems.find((i) => i.index === 0);
        return (
            navItems
                .slice()
                .reverse()
                .find((item) => url.startsWith(item.href)) || navItems[0]
        );
    };

    const currentItem = getCurrentItem();
    const currentIndex = currentItem ? currentItem.index : 0;

    const navigateTo = (href: string, targetIndex: number) => {
        const dir = targetIndex > currentIndex ? 1 : -1;
        setDirection(dir);
        router.visit(href);
    };

    return (
        <NavigationContext.Provider
            value={{ direction, currentIndex, navigateTo, navItems }}
        >
            {children}
        </NavigationContext.Provider>
    );
};
