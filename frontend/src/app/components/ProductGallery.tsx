"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Package, Play, X } from "lucide-react";

import FallbackImage from "@/app/components/FallbackImage";
import { Product } from "@/app/types/product";

interface ProductDetailProps {
    product: Product;
}

export default function ProductGallery({ product }: ProductDetailProps) {
    const videos = product.videos ?? [];
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
    const [failed, setFailed] = useState<Set<string>>(() => new Set());

    const visibleImages = useMemo(
        () => (product.images ?? []).filter((url) => !failed.has(url)),
        [product.images, failed]
    );

    const photoIndex =
        visibleImages.length === 0 ? 0 : Math.min(currentImageIndex, visibleImages.length - 1);
    const mediaCount = activeTab === "photos" ? visibleImages.length : videos.length;
    const hasMedia = mediaCount > 0;
    const cover = visibleImages[photoIndex];

    const handleNext = () => {
        if (!hasMedia) return;
        setCurrentImageIndex((index) => (index + 1) % mediaCount);
    };

    const handlePrev = () => {
        if (!hasMedia) return;
        setCurrentImageIndex((index) => (index - 1 + mediaCount) % mediaCount);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
                e.preventDefault();
                handleNext();
            } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
                e.preventDefault();
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // handleNext/handlePrev zamykają aktualny mediaCount — celowo nie wrzucamy ich do deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentImageIndex, activeTab, mediaCount]);

    const handleOpenLightbox = (index: number) => {
        setActiveTab("photos");
        setCurrentImageIndex(index);
        setIsOpen(true);
    };

    const handleTabChange = (tab: "photos" | "videos") => {
        setActiveTab(tab);
        setCurrentImageIndex(0);
    };

    const markFailed = (url: string) => {
        setFailed((prev) => {
            if (prev.has(url)) return prev;
            const next = new Set(prev);
            next.add(url);
            return next;
        });
    };

    return (
        <div className="space-y-3">
            <div
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800 bg-white"
                onClick={() => cover && handleOpenLightbox(photoIndex)}
            >
                {cover ? (
                    <FallbackImage
                        srcs={visibleImages.slice(photoIndex)}
                        alt={product.name}
                        fill
                        priority
                        quality={75}
                        sizes="(max-width: 1024px) calc(100vw - 2rem), 640px"
                        className="cursor-zoom-in object-contain p-6 transition-transform duration-500 hover:scale-105"
                        onError={() => markFailed(cover)}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                        <Package className="h-10 w-10" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Zdjęcie wkrótce
                        </span>
                    </div>
                )}

                {visibleImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            aria-label="Poprzednie zdjęcie"
                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            aria-label="Następne zdjęcie"
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {(visibleImages.length > 1 || videos.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {visibleImages.map((url, index) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => {
                                setActiveTab("photos");
                                setCurrentImageIndex(index);
                            }}
                            aria-label={`Zdjęcie ${index + 1}`}
                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white ${
                                activeTab === "photos" && photoIndex === index
                                    ? "border-emerald-500"
                                    : "border-neutral-800 hover:border-neutral-600"
                            }`}
                        >
                            <FallbackImage
                                srcs={[url]}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-contain p-1"
                                onError={() => markFailed(url)}
                            />
                        </button>
                    ))}
                    {videos.map((url, index) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => {
                                setActiveTab("videos");
                                setCurrentImageIndex(index);
                                setIsOpen(true);
                            }}
                            aria-label={`Wideo ${index + 1}`}
                            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 text-emerald-400 hover:border-emerald-500/60"
                        >
                            <Play className="h-5 w-5" />
                        </button>
                    ))}
                </div>
            )}

            {isOpen && hasMedia && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-12 right-0 inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-white hover:text-emerald-300"
                        >
                            <X className="h-4 w-4" />
                            Zamknij (ESC)
                        </button>

                        {activeTab === "photos" ? (
                            <FallbackImage
                                width={1200}
                                height={900}
                                srcs={visibleImages.slice(photoIndex)}
                                alt={`${product.name} — zdjęcie ${photoIndex + 1}`}
                                className="max-h-[70vh] w-auto rounded-lg object-contain"
                                onError={() => cover && markFailed(cover)}
                            />
                        ) : (
                            <video
                                src={videos[currentImageIndex]}
                                controls
                                autoPlay
                                className="max-h-[70vh] w-full rounded-lg"
                            />
                        )}

                        {mediaCount > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    aria-label="Poprzednie"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-3xl text-white hover:bg-black/70"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={handleNext}
                                    aria-label="Następne"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-3xl text-white hover:bg-black/70"
                                >
                                    ›
                                </button>
                            </>
                        )}

                        <div className="mt-6 flex items-center gap-4">
                            {videos.length > 0 && (
                                <div className="flex gap-2 rounded-full border border-neutral-800 bg-neutral-950 p-1">
                                    <button
                                        onClick={() => handleTabChange("photos")}
                                        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                                            activeTab === "photos"
                                                ? "bg-neutral-800 font-medium text-white"
                                                : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Zdjęcia
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("videos")}
                                        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                                            activeTab === "videos"
                                                ? "bg-neutral-800 font-medium text-white"
                                                : "text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        Wideo
                                    </button>
                                </div>
                            )}
                            <div className="rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-sm text-neutral-400">
                                {(activeTab === "photos" ? photoIndex : currentImageIndex) + 1} / {mediaCount}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
