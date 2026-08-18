"use client";

import {useEffect, useState} from "react";
import {Product} from "@/app/types/product";
import Image from "next/image";

interface ProductDetailProps {
    product: Product;
}

export default function ProductGallery({product}: ProductDetailProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

    const handleNext = () => {
        if (activeTab === 'photos') {
            if (currentImageIndex === product.images.length - 1) {
                setCurrentImageIndex(0);
            }
            else {
                setCurrentImageIndex(currentImageIndex + 1);
            }
        }
        else {
            if (currentImageIndex === product.videos.length - 1) {
                setCurrentImageIndex(0);
            }
            else {
                setCurrentImageIndex(currentImageIndex + 1);
            }
        }
    };

    const handlePrev = () => {
        if (activeTab === 'photos') {
            if (currentImageIndex === 0) {
                setCurrentImageIndex(product.images.length - 1);
            }
            else {
                setCurrentImageIndex(currentImageIndex - 1);
            }
        }
        else {
            if (currentImageIndex === 0) {
                setCurrentImageIndex(product.videos.length - 1);
            }
            else {
                setCurrentImageIndex(currentImageIndex - 1);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape'){
                setIsOpen(false);
            }
            else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'){
                e.preventDefault();
                handleNext();
            }
            else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'){
                e.preventDefault();
                handlePrev();
            }
        };
        if (isOpen){
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, currentImageIndex, activeTab]);

    const handleOpenLightbox = (index: number) => {
        setActiveTab('photos');
        setIsOpen(true);
        setCurrentImageIndex(index);
    }

    const handleTabChange = (tab: 'photos' | 'videos') => {
        setActiveTab(tab);
        setCurrentImageIndex(0);
    };

return (
    <div className="p-4">
        {/* 🍱 Siatka zdjęć (Grid) */}
        {product?.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                <div
                    className="col-span-3 cursor-pointer overflow-hidden rounded-base border"
                    onClick={() => handleOpenLightbox(0)}
                >
                    <Image
                        width={800}
                        height={600}
                        src={product.images[0]}
                        alt="Główne"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    {product.images.slice(1, 4).map((url, index) => (
                        <div
                            key={index + 1}
                            className="cursor-pointer overflow-hidden rounded-base border aspect-square"
                            onClick={() => handleOpenLightbox(index + 1)}
                        >
                            <Image
                                width={800}
                                height={600}
                                src={url}
                                alt={`Miniatura ${index + 1}`}
                                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
        {isOpen && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
            >
                <div className="relative max-w-3xl max-h-[80vh] flex flex-col items-center p-4"
                onClick={(e) => e.stopPropagation()}
                >

                    {/* ❌ Przycisk zamknięcia */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute -top-12 right-0 text-white text-sm bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-md hover:text-gray-300 transition-colors"
                    >
                        ✕ Zamknij (ESC)
                    </button>

                    {/* 🖼️ Wyświetlanie mediów: Zdjęcie LUB Wideo */}
                    {activeTab === 'photos' ? (
                        <Image
                            width={800}
                            height={600}
                            src={product.images[currentImageIndex]}
                            alt="Podgląd zdjęcia"
                            className="max-w-full max-h-[65vh] object-contain rounded-lg"
                        />
                    ) : (
                        <video
                            src={product.videos?.[currentImageIndex]}
                            controls
                            autoPlay
                            className="max-w-full max-h-[65vh] rounded-lg"
                        />
                    )}

                    {/* ⬅️ Strzałka w lewo */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/40 p-2 rounded-full hover:bg-black/60"
                    >
                        ‹
                    </button>

                    {/* ➡️ Strzałka w prawo */}
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/40 p-2 rounded-full hover:bg-black/60"
                    >
                        ›
                    </button>

                    <div className="flex items-center gap-4 mt-6">

                        {/* 🎛️ Przyciski przełączania (Filtry) */}
                        <div className="flex gap-2 bg-neutral-950 p-1 rounded-full border border-neutral-800">
                            <button
                                onClick={() => handleTabChange('photos')}
                                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                                    activeTab === 'photos'
                                        ? 'bg-neutral-800 text-white font-medium'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                🖼️ Zdjęcia
                            </button>
                            <button
                                onClick={() => handleTabChange('videos')}
                                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                                    activeTab === 'videos'
                                        ? 'bg-neutral-800 text-white font-medium'
                                        : 'text-neutral-400 hover:text-white'
                                }`}
                            >
                                🎥 Wideo
                            </button>
                        </div>

                        {/* 🔢 Dynamiczny licznik (zdjęcia lub wideo) */}
                        <div className="text-neutral-400 text-sm bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {activeTab === 'photos' ? product.images.length : (product.videos?.length || 0)}
                        </div>

                    </div>
                </div>
            </div>
        )}
    </div>
);
}