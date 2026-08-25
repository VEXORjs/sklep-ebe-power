"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";

/** Znane marki rozpoznawane przez adres (?producent=...). */
export type BrandParam = "pramac" | "cgm";

/** Wartości checkboxa „Producent” w katalogu dla każdej marki. */
export const PRODUCER_LABELS: Record<BrandParam, string> = {
    pramac: "Pramac",
    cgm: "CGM",
};

/**
 * Normalizuje wartość parametru ?producent= na znaną markę.
 * Zwraca null dla nieznanych wartości, żeby nie zanieczyszczać adresów.
 */
export function producerFromValue(value: string | null | undefined): BrandParam | null {
    const normalized = (value ?? "").trim().toLowerCase();
    if (normalized === "pramac") return "pramac";
    if (normalized === "cgm") return "cgm";
    return null;
}

function appendProducer(href: string, producer: BrandParam): string {
    const [path, hash] = href.split("#");
    if (path.includes("producent=")) return href;
    const separator = path.includes("?") ? "&" : "?";
    const target = `${path}${separator}producent=${producer}`;
    return hash ? `${target}#${hash}` : target;
}

interface ProducerParamLinkProps {
    href: string;
    className?: string;
    children: ReactNode;
}

function ProducerParamLinkInner({ href, className, children }: ProducerParamLinkProps) {
    const searchParams = useSearchParams();
    const producer = producerFromValue(searchParams.get("producent"));
    const target = producer ? appendProducer(href, producer) : href;

    return (
        <Link href={target} className={className}>
            {children}
        </Link>
    );
}

/**
 * Link, który przenosi aktywną markę (?producent=pramac|cgm) z obecnego
 * adresu do docelowego. Dzięki temu filtr producenta wybrany przy wejściu
 * w kategorię z siatki marek przetrwa przejście do podkategorii.
 */
export default function ProducerParamLink({ href, className, children }: ProducerParamLinkProps) {
    return (
        <Suspense fallback={<Link href={href} className={className}>{children}</Link>}>
            <ProducerParamLinkInner href={href} className={className}>
                {children}
            </ProducerParamLinkInner>
        </Suspense>
    );
}
