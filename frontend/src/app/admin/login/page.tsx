import { Suspense } from "react";
import type { Metadata } from "next";

import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
    title: "Panel administratora — logowanie",
    description: "Prywatny panel zarządzania sklepem ebe power.",
    robots: { index: false, follow: false },
};

function LoginFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md space-y-4 animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <div className="h-3 w-24 rounded bg-slate-800" />
                <div className="h-8 w-56 rounded bg-slate-800" />
                <div className="h-12 rounded-xl bg-slate-800" />
                <div className="h-12 rounded-xl bg-slate-800" />
                <div className="h-12 rounded-xl bg-slate-800" />
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <AdminLoginForm />
        </Suspense>
    );
}
