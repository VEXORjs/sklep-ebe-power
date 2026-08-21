import { Download } from "lucide-react";

interface DatasheetDownloadProps {
    href?: string | null;
    fileName?: string;
    className?: string;
}

export default function DatasheetDownload({
    href,
    fileName,
    className,
}: DatasheetDownloadProps) {
    if (!href) return null;

    const name = fileName || href.split("/").pop() || "karta-katalogowa.pdf";

    return (
        <a
            href={href}
            download={name}
            target="_blank"
            rel="noopener noreferrer"
            className={
                className ??
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-5 text-sm font-extrabold uppercase tracking-wide text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-500 hover:text-slate-950"
            }
        >
            <Download className="h-4 w-4" />
            Pobierz kartę katalogową (PDF)
        </a>
    );
}
