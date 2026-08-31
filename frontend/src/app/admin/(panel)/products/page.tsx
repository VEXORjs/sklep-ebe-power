'use client';

import { useEffect, useState, useMemo } from 'react';
import { Product } from '@/app/types/product';
import { getProductsClient, deleteProductClient } from '@/app/services/adminService';
import AdminProductForm from '@/app/components/AdminProductForm';
import { formatPLN } from '@/app/lib/product';

type FilterType = 'all' | 'low' | 'out' | 'in';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<FilterType>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsClient();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // parse URL filter param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const f = params.get('filter') as FilterType | null;
      if (f && ['low', 'out', 'in', 'all'].includes(f)) setStockFilter(f);
    }
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const stock = p.stock ?? 0;
      let matchesStock = true;
      if (stockFilter === 'low') matchesStock = stock > 0 && stock <= 5;
      if (stockFilter === 'out') matchesStock = stock <= 0;
      if (stockFilter === 'in') matchesStock = stock > 5;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt? Tej operacji nie można cofnąć.')) return;
    try {
      await deleteProductClient(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      alert('Nie udało się usunąć produktu');
    }
  };

  const handleSuccess = (saved: Product, isEdit: boolean) => {
    if (isEdit) {
      setProducts(prev => prev.map(p => (p.id === saved.id ? { ...p, ...saved } : p)));
      setEditingProduct(null);
    } else {
      setProducts(prev => [saved, ...prev]);
    }
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-20 bg-white rounded-2xl border border-slate-200" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zarządzanie produktami 📦</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} z {products.length} produktów • {products.filter(p => (p.stock ?? 0) <= 0).length} braków • {products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length} niski stan
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition shadow-sm"
        >
          + Dodaj produkt
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <AdminProductForm
            editingProduct={editingProduct}
            onSuccess={handleSuccess}
            onCancel={() => {
              setEditingProduct(null);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj po nazwie, SKU, kategorii..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white min-w-[160px]"
        >
          <option value="all">Wszystkie kategorie</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value as FilterType)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white min-w-[160px]"
        >
          <option value="all">Wszystkie stany</option>
          <option value="in">Dostępne (&gt;5)</option>
          <option value="low">Niski stan (1-5)</option>
          <option value="out">Brak (0)</option>
        </select>
        <button
          onClick={() => { setSearch(''); setCategoryFilter('all'); setStockFilter('all'); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white hover:bg-slate-50"
        >
          Wyczyść
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="text-left p-3 font-semibold">Produkt</th>
                <th className="text-left p-3 font-semibold">Kategoria</th>
                <th className="text-left p-3 font-semibold">Cena</th>
                <th className="text-left p-3 font-semibold">Magazyn</th>
                <th className="text-left p-3 font-semibold">SKU</th>
                <th className="text-right p-3 font-semibold">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map(product => {
                const stock = product.stock ?? 0;
                const stockTone = stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'in';
                return (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition group">
                    <td className="p-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {product.images && product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">📦</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[260px]" title={product.name}>{product.name}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[260px]">{product.description?.slice(0, 80) || 'Brak opisu'}</div>
                          {product.images && product.images.length > 1 && (
                            <div className="text-[10px] text-slate-400">+{product.images.length - 1} zdjęć</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-xs">
                        <div className="font-medium">{product.category || '—'}</div>
                        <div className="text-slate-500">{product.subcategory || ''}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{formatPLN(Number(product.price))}</div>
                      {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                        <div className="text-xs text-slate-400 line-through">{formatPLN(Number(product.oldPrice))}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${stockTone === 'out' ? 'bg-red-50 text-red-700 border-red-200' : stockTone === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stockTone === 'out' ? 'bg-red-500' : stockTone === 'low' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {stock} szt.
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{product.sku || '—'}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleEdit(product)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center transition" title="Edytuj">✏️</button>
                        <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition" title="Usuń">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-medium">Brak produktów spełniających kryteria</div>
                    <div className="text-xs text-slate-500 mt-1">Spróbuj zmienić filtry lub dodaj nowy produkt</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="text-xs text-slate-500">Strona {currentPage} z {totalPages} • {filtered.length} produktów</div>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs disabled:opacity-50 hover:bg-slate-50">← Poprzednia</button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-xs font-medium border ${currentPage === pageNum ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>{pageNum}</button>
                );
              })}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs disabled:opacity-50 hover:bg-slate-50">Następna →</button>
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        💡 Wskazówka: kliknij ✏️ aby edytować produkt. Zmiany są widoczne natychmiast w sklepie (cache 60s). Zdjęcia z Supabase Storage są automatycznie optymalizowane przez Next.js.
      </div>
    </div>
  );
}
