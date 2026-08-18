import Link from 'next/link';

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100 text-black">
            {/* 🧭 Boczny pasek nawigacyjny (Sidebar) */}
            <aside className="w-64 bg-slate-900 text-white p-6 space-y-6">
                <div className="text-xl font-bold tracking-wider border-b border-slate-700 pb-4">
                    ⚙️ Trafo Admin
                </div>

                <nav className="flex flex-col space-y-2">
                    <Link href="/admin" className="p-3 hover:bg-slate-800 rounded transition-colors flex items-center gap-2">
                        📊 Pulpit
                    </Link>
                    <Link href="/admin/products" className="p-3 hover:bg-slate-800 rounded transition-colors flex items-center gap-2">
                        📦 Produkty
                    </Link>
                    <Link href="/admin/orders" className="p-3 hover:bg-slate-800 rounded transition-colors flex items-center gap-2">
                        🛒 Zamówienia
                    </Link>
                </nav>
            </aside>

            {/* 🖥️ Główna zawartość podstron */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}