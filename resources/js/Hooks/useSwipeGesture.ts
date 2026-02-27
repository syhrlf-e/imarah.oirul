import { useEffect, useRef } from "react";

interface SwipeConfig {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    threshold?: number; // minimum jarak swipe dalam px (default: 60)
    velocity?: number; // minimum kecepatan swipe (default: 0.3)
    enabled?: boolean; // aktif atau tidak (default: true)
}

export const useSwipeGesture = (
    ref: React.RefObject<HTMLElement>,
    config: SwipeConfig,
) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        threshold = 60,
        velocity = 0.3,
        enabled = true,
    } = config;
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(
        null,
    );

    useEffect(() => {
        if (!enabled || !ref.current) return;
        const el = ref.current;

        const handleTouchStart = (e: TouchEvent) => {
            touchStart.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                time: Date.now(),
            };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart.current) return;

            const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
            const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
            const deltaTime = Date.now() - touchStart.current.time;
            const swipeVelocity = Math.abs(deltaX) / Math.max(deltaTime, 1);

            // Abaikan jika lebih banyak scroll vertikal
            if (Math.abs(deltaY) > Math.abs(deltaX)) return;

            // Abaikan jika tidak memenuhi threshold dan velocity
            if (Math.abs(deltaX) < threshold || swipeVelocity < velocity)
                return;

            if (deltaX < 0) {
                onSwipeLeft(); // swipe ke kiri → halaman berikutnya
            } else {
                onSwipeRight(); // swipe ke kanan → halaman sebelumnya
            }

            touchStart.current = null;
        };

        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchend", handleTouchEnd);
        };
    }, [enabled, onSwipeLeft, onSwipeRight, threshold, velocity]);
};
