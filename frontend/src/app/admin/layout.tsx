'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Pulpit', icon: '📊', exact: true },
  { href: '/admin/products', label: 'Produkty', icon: '📦' },
  { href: '/admin/orders', label: 'Zamówienia', icon: '🛒' },
  { href: '/admin/users', label: 'Użytkownicy', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 z-40 h-screen w-[280px] bg-slate-950 text-white
          flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg">
              T
            </div>
            <div>
              <div className="font-bold tracking-tight">ebe power Admin</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-widest">Panel zarządzania</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive(item.href, item.exact)
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {isActive(item.href, item.exact) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          ))}

          <div className="pt-6 mt-6 border-t border-slate-800">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Sklep
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>🏠</span> Wróć do sklepu
            </Link>
            <Link
              href="/kategoria"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>🗂️</span> Kategorie
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
            <div className="text-xs text-slate-400">Zalogowany jako</div>
            <div className="text-sm font-medium truncate">Administrator</div>
            <div className="mt-2 text-[11px] text-slate-500">v2.0 • ebe power</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center"
          >
            ☰
          </button>
          <div className="font-semibold">ebe power Admin</div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>

        <footer className="px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          © {new Date().getFullYear()} ebe power • Panel administracyjny • Wszystkie operacje są logowane
        </footer>
      </div>
    </div>
  );
}
