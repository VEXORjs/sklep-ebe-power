"use client";

import { useState, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

type FallbackImageProps = Omit<ImageProps, "src"> & {
    /** Kolejne adresy zdjęcia — po błędzie ładowania bierzemy następny. */
    srcs: Array<string | undefined | null>;
    /** Renderowane, gdy żaden z adresów się nie załadował. */
    fallback?: ReactNode;
};

function normalizeSrcs(srcs: Array<string | undefined | null>): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of srcs) {
        const trimmed = value?.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        result.push(trimmed);
    }
    return result;
}

/**
 * `next/image` z listą zapasowych URL-i.
 *
 * Okładka produktu jest liczona ze storage Supabase (`…/products/{id}.jpg`).
 * Gdy pliku jeszcze nie ma (404) albo optimizer go odrzuci, automatycznie
 * pokazujemy kolejny URL z listy (albo `fallback`).
 */
export default function FallbackImage({ srcs, fallback = null, onError, alt, ...rest }: FallbackImageProps) {
    const candidates = normalizeSrcs(srcs);
    const signature = candidates.join("\0");
    const [index, setIndex] = useState(0);
    const [seenSignature, setSeenSignature] = useState(signature);

    if (signature !== seenSignature) {
        setSeenSignature(signature);
        setIndex(0);
    }

    const src = candidates[signature === seenSignature ? index : 0];
    if (!src) {
        return <>{fallback}</>;
    }

    return (
        <Image
            {...rest}
            alt={alt ?? ""}
            src={src}
            onError={(event) => {
                setIndex((current) => current + 1);
                onError?.(event);
            }}
        />
    );
}
