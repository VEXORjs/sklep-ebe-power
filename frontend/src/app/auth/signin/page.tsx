import { Suspense } from "react";
import type { Metadata } from "next";

import AuthShell from "@/app/components/AuthShell";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
    title: "Logowanie | ebe power",
    description: "Zaloguj się do sklepu TRAFO ENERGIA — zamówienia, faktury i szybsza kasa.",
};

function SignInFallback() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-3 w-24 rounded bg-neutral-800" />
            <div className="h-8 w-48 rounded bg-neutral-800" />
            <div className="h-12 rounded-lg bg-neutral-900" />
            <div className="h-12 rounded-lg bg-neutral-900" />
            <div className="h-12 rounded-lg bg-neutral-800" />
        </div>
    );
}

export default function SignInPage() {
    return (
        <AuthShell
            eyebrow="Konto klienta"
            headline="Witaj z powrotem w TRAFO ENERGIA"
            description="Zaloguj się, żeby wrócić do zamówień, faktur VAT i zapisanych koszyków. Po zalogowaniu wrócisz dokładnie tam, gdzie skończyłeś."
        >
            <Suspense fallback={<SignInFallback />}>
                <SignInForm />
            </Suspense>
        </AuthShell>
    );
}
