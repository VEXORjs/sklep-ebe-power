'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAllOrders, OrderDto, updateOrderStatus, deleteOrder } from '@/app/services/adminService';
import { formatPLN } from '@/app/lib/product';

type StatusFilter = 'all' | OrderDto['status'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<OrderDto | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // read ?status from URL
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const s = p.get('status') as StatusFilter | null;
      if (s && ['PENDING', 'PAID', 'PAID_OUT_OF_STOCK', 'COMPLETED', 'CANCELLED'].includes(s)) {
        setStatusFilter(s);
      }
    }
  }, []);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = !search || o.customerEmail.toLowerCase().includes(search.toLowerCase()) || o.id.toString().includes(search) || o.stripePaymentIntentId?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders(prev => prev.map(o => (o.id === id ? updated : o)));
      if (selected?.id === id) setSelected(updated);
    } catch (e) {
      alert('Nie udało się zaktualizować statusu');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Usunąć zamówienie #${id}?`)) return;
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      alert('Błąd usuwania');
    }
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      paid: orders.filter(o => o.status === 'PAID').length,
      out: orders.filter(o => o.status === 'PAID_OUT_OF_STOCK').length,
      completed: orders.filter(o => o.status === 'COMPLETED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      revenue: orders.filter(o => ['PAID', 'COMPLETED', 'PAID_OUT_OF_STOCK'].includes(o.status)).reduce((sum, o) => sum + Number(o.amount), 0),
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl border" />)}
        </div>
        <div className="h-96 bg-white rounded-2xl border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zarządzanie zamówieniami 🛒</h1>
        <p className="text-sm text-slate-500 mt-1">Przychód: {formatPLN(stats.revenue)} brutto • {stats.total} zamówień</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Wszystkie', value: stats.total, key: 'all', color: 'bg-slate-900 text-white' },
          { label: 'Oczekujące', value: stats.pending, key: 'PENDING', color: 'bg-amber-100 text-amber-800' },
          { label: 'Opłacone', value: stats.paid, key: 'PAID', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'Braki', value: stats.out, key: 'PAID_OUT_OF_STOCK', color: 'bg-red-100 text-red-800' },
          { label: 'Zrealizowane', value: stats.completed, key: 'COMPLETED', color: 'bg-blue-100 text-blue-800' },
          { label: 'Anulowane', value: stats.cancelled, key: 'CANCELLED', color: 'bg-slate-100 text-slate-600' },
        ].map(c => (
          <button
            key={c.key}
            onClick={() => setStatusFilter(c.key as StatusFilter)}
            className={`p-3 rounded-2xl border text-left transition ${statusFilter === c.key ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.color}`}>{c.label}</div>
            <div className="text-xl font-bold mt-2">{c.value}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj po e-mailu, ID, PaymentIntent..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white min-w-[200px]">
          <option value="all">Wszystkie statusy</option>
          <option value="PENDING">Oczekujące</option>
          <option value="PAID">Opłacone</option>
          <option value="PAID_OUT_OF_STOCK">Opłacone - braki</option>
          <option value="COMPLETED">Zrealizowane</option>
          <option value="CANCELLED">Anulowane</option>
        </select>
        <button onClick={load} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">🔄 Odśwież</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left p-3 font-semibold">ID</th>
                  <th className="text-left p-3 font-semibold">Klient</th>
                  <th className="text-left p-3 font-semibold">Kwota</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Data</th>
                  <th className="text-right p-3 font-semibold">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(o => (
                  <tr key={o.id} className={`hover:bg-slate-50 transition ${selected?.id === o.id ? 'bg-blue-50/70' : ''}`}>
                    <td className="p-3 font-mono text-xs">#{o.id}</td>
                    <td className="p-3">
                      <div className="truncate max-w-[180px]">{o.customerEmail}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{o.stripePaymentIntentId?.slice(0, 24)}...</div>
                    </td>
                    <td className="p-3 font-medium">{formatPLN(Number(o.amount))}</td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                    <td className="p-3 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString('pl-PL')}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setSelected(o)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-900 hover:text-white flex items-center justify-center transition" title="Szczegóły">👁️</button>
                        <button onClick={() => handleDelete(o.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-500">Brak zamówień dla wybranych filtrów</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold">Zamówienie #{selected.id}</div>
                  <div className="text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString('pl-PL')}</div>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">×</button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Klient</span><span className="font-medium truncate max-w-[160px]">{selected.customerEmail}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Kwota</span><span className="font-bold">{formatPLN(Number(selected.amount))}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">PaymentIntent</span><span className="font-mono text-[10px] truncate max-w-[140px]">{selected.stripePaymentIntentId}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Status</span><StatusBadge status={selected.status} /></div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Zmień status</div>
                <div className="grid grid-cols-2 gap-2">
                  {['PENDING', 'PAID', 'PAID_OUT_OF_STOCK', 'COMPLETED', 'CANCELLED'].map(s => (
                    <button
                      key={s}
                      disabled={updatingId === selected.id}
                      onClick={() => handleStatusChange(selected.id, s)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${selected.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Pozycje ({selected.items?.length || 0})</div>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {selected.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-white border overflow-hidden shrink-0">
                        {item.product?.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{item.product?.name || `Produkt #${item.product?.id}`}</div>
                        <div className="text-[11px] text-slate-500">{item.quantity} × {formatPLN(Number(item.price))}</div>
                      </div>
                      <div className="text-xs font-bold">{formatPLN(Number(item.price) * item.quantity)}</div>
                    </div>
                  ))}
                  {(!selected.items || selected.items.length === 0) && <div className="text-xs text-slate-500">Brak pozycji (zamówienie gościa lub stare dane)</div>}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button onClick={() => { if (selected) window.open(`mailto:${selected.customerEmail}?subject=Zamówienie #${selected.id}`, '_blank'); }} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">📧 Napisz do klienta</button>
                <button onClick={() => selected && handleDelete(selected.id)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm hover:bg-red-50 hover:text-red-600">Usuń</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <div className="text-3xl mb-2">👈</div>
              <div className="font-medium text-sm">Wybierz zamówienie</div>
              <div className="text-xs text-slate-500 mt-1">Kliknij ikonę oka aby zobaczyć szczegóły, zmienić status i skontaktować się z klientem.</div>
              <div className="mt-4 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl text-left">
                <div className="font-semibold mb-1">Statusy:</div>
                <div>• PENDING — oczekuje na płatność</div>
                <div>• PAID — opłacone, do realizacji</div>
                <div>• PAID_OUT_OF_STOCK — opłacone, braki w magazynie</div>
                <div>• COMPLETED — zrealizowane</div>
                <div>• CANCELLED — anulowane</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Oczekujące', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    PAID: { label: 'Opłacone', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    PAID_OUT_OF_STOCK: { label: 'Braki', cls: 'bg-red-100 text-red-800 border-red-200' },
    COMPLETED: { label: 'Zrealizowane', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    CANCELLED: { label: 'Anulowane', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };
  const cfg = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>{cfg.label}</span>;
}
