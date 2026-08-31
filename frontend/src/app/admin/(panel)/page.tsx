'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats, AdminStats, getAllOrders, OrderDto } from '@/app/services/adminService';
import { formatPLN } from '@/app/lib/product';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, orders] = await Promise.all([getAdminStats(), getAllOrders()]);
        setStats(s);
        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Błąd ładowania danych');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h2 className="font-semibold text-red-800">Błąd ładowania panelu</h2>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <p className="text-xs text-slate-500 mt-3">Upewnij się, że backend działa (http://localhost:8080 lub /api/backend proxy).</p>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Wszystkie produkty',
      value: stats.totalProducts,
      sub: `${stats.inStock} dostępnych`,
      icon: '📦',
      color: 'from-blue-500 to-indigo-600',
      href: '/admin/products',
    },
    {
      label: 'Niski stan',
      value: stats.lowStock,
      sub: '≤ 5 szt.',
      icon: '⚠️',
      color: 'from-amber-500 to-orange-600',
      href: '/admin/products?filter=low',
    },
    {
      label: 'Brak w magazynie',
      value: stats.outOfStock,
      sub: 'wymaga uzupełnienia',
      icon: '🚫',
      color: 'from-red-500 to-rose-600',
      href: '/admin/products?filter=out',
    },
    {
      label: 'Użytkownicy',
      value: stats.totalUsers,
      sub: 'zarejestrowanych',
      icon: '👥',
      color: 'from-slate-700 to-slate-900',
      href: '/admin',
    },
    {
      label: 'Zamówienia',
      value: stats.totalOrders,
      sub: `${stats.pendingOrders} oczekujących`,
      icon: '🛒',
      color: 'from-violet-500 to-purple-600',
      href: '/admin/orders',
    },
    {
      label: 'Opłacone',
      value: stats.paidOrders,
      sub: `${stats.paidOutOfStockOrders} z brakami`,
      icon: '✅',
      color: 'from-emerald-500 to-teal-600',
      href: '/admin/orders?status=PAID',
    },
    {
      label: 'Ukończone',
      value: stats.completedOrders,
      sub: `${stats.cancelledOrders} anulowanych`,
      icon: '🏁',
      color: 'from-cyan-500 to-blue-600',
      href: '/admin/orders?status=COMPLETED',
    },
    {
      label: 'Przychód',
      value: formatPLN(Number(stats.totalRevenue)),
      sub: 'brutto',
      icon: '💰',
      color: 'from-green-500 to-emerald-600',
      href: '/admin/orders',
      isCurrency: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Pulpit administratora</h1>
          <p className="text-sm text-slate-500 mt-1">Przegląd stanu sklepu, magazynu i sprzedaży • {new Date().toLocaleDateString('pl-PL')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">
            + Dodaj produkt
          </Link>
          <Link href="/admin/orders" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition">
            Zobacz zamówienia
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${c.color} opacity-10 rounded-bl-[100px] group-hover:opacity-15 transition`} />
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-sm`}>
                {c.icon}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Live</span>
            </div>
            <div className="mt-4">
              <div className={`font-bold tracking-tight ${c.isCurrency ? 'text-lg' : 'text-2xl'}`}>{c.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
              <div className="text-[11px] text-slate-400 mt-1">{c.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low stock */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold">⚠️ Niski stan magazynowy</h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{stats.lowStockProducts?.length || 0}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-auto">
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((p) => (
                <div key={p.id} className="p-4 flex gap-3 hover:bg-slate-50 transition">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs overflow-hidden">
                    {p.images && p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-slate-500">SKU: {p.sku || '—'} • {p.category || 'Brak kategorii'}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full h-fit ${Number(p.stock) === 0 ? 'bg-red-100 text-red-700' : Number(p.stock) <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock ?? 0} szt.
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">Brak produktów z niskim stanem 🎉</div>
            )}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <Link href="/admin/products?filter=low" className="text-xs font-medium text-slate-700 hover:text-slate-900">
              Zobacz wszystkie → 
            </Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold">🛒 Ostatnie zamówienia</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-blue-600 hover:text-blue-700">Zobacz wszystkie</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left p-3 font-semibold">ID</th>
                  <th className="text-left p-3 font-semibold">Klient</th>
                  <th className="text-left p-3 font-semibold">Kwota</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs">#{o.id}</td>
                    <td className="p-3 truncate max-w-[180px]">{o.customerEmail}</td>
                    <td className="p-3 font-medium">{formatPLN(Number(o.amount))}</td>
                    <td className="p-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString('pl-PL')}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Brak zamówień</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 text-white p-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <div className="font-semibold">💡 Wskazówki dla administratora</div>
          <ul className="mt-2 text-sm text-slate-300 list-disc pl-5 space-y-1">
            <li>Dodawaj zdjęcia w formacie JPG/WebP, max 2MB — automatycznie trafią do Supabase Storage.</li>
            <li>Używaj SKU do identyfikacji produktów (np. PRM-P3500I) — ułatwia wyszukiwanie i integrację.</li>
            <li>Parametry techniczne dodawaj jako klucz:wartość (np. moc: 3.5kW) — pojawią się w karcie produktu.</li>
            <li>Zamówienia ze statusem PAID_OUT_OF_STOCK wymagają ręcznej weryfikacji magazynu.</li>
          </ul>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/admin/products" className="px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-medium">Zarządzaj produktami</Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Oczekujące', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    PAID: { label: 'Opłacone', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    PAID_OUT_OF_STOCK: { label: 'Opłacone - brak', cls: 'bg-red-100 text-red-800 border-red-200' },
    COMPLETED: { label: 'Zrealizowane', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    CANCELLED: { label: 'Anulowane', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };
  const cfg = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>{cfg.label}</span>;
}
