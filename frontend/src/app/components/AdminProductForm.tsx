'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/app/types/product';
import { uploadProductImage } from '@/lib/uploadImage';
import { getPublicApiUrl } from '@/app/lib/api';

const API_URL = getPublicApiUrl();

interface Props {
  editingProduct: Product | null;
  onSuccess: (product: Product, isEdit: boolean) => void;
  onCancel: () => void;
}

type ParamEntry = { key: string; value: string };

const CATEGORY_OPTIONS = [
  'Agregaty',
  'Akcesoria',
  'Transformatory',
  'Rozdzielnice',
  'Kable',
  'Osprzęt',
  'Inne',
];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  Agregaty: ['gazowe', 'inwerterowe', 'benzynowe', 'diesla'],
  Akcesoria: ['złączki', 'narzędzia', 'montażowe'],
  Transformatory: ['toroidalne', 'bezpieczeństwa', 'separacyjne'],
};

export default function AdminProductForm({ editingProduct, onSuccess, onCancel }: Props) {
  const isEdit = Boolean(editingProduct);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [params, setParams] = useState<ParamEntry[]>([{ key: '', value: '' }]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setPrice(editingProduct.price?.toString() || '');
      setOldPrice(editingProduct.oldPrice?.toString() || '');
      setStock(editingProduct.stock?.toString() || '');
      setSku(editingProduct.sku || '');
      setCategory(editingProduct.category || '');
      setSubcategory(editingProduct.subcategory || '');
      setDescription(editingProduct.description || '');
      setExistingImages(editingProduct.images || []);
      // parse parameters
      if (editingProduct.parameters) {
        if (typeof editingProduct.parameters === 'object' && !Array.isArray(editingProduct.parameters)) {
          const entries = Object.entries(editingProduct.parameters as Record<string, string>).map(([k, v]) => ({ key: k, value: v }));
          setParams(entries.length ? entries : [{ key: '', value: '' }]);
        } else if (typeof editingProduct.parameters === 'string') {
          const parts = (editingProduct.parameters as string).split(/[;\n]+/).map(s => s.trim()).filter(Boolean);
          const entries = parts.map(p => {
            const idx = p.indexOf(':');
            if (idx === -1) return { key: 'param', value: p };
            return { key: p.slice(0, idx).trim(), value: p.slice(idx + 1).trim() };
          });
          setParams(entries.length ? entries : [{ key: '', value: '' }]);
        }
      } else {
        setParams([{ key: '', value: '' }]);
      }
    } else {
      // reset
      setName(''); setPrice(''); setOldPrice(''); setStock(''); setSku(''); setCategory(''); setSubcategory(''); setDescription('');
      setExistingImages([]); setFiles([]); setPreviews([]); setParams([{ key: '', value: '' }]);
    }
  }, [editingProduct]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    const newPreviews = selected.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExisting = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const addParam = () => setParams([...params, { key: '', value: '' }]);
  const updateParam = (i: number, field: 'key' | 'value', val: string) => {
    const copy = [...params];
    copy[i][field] = val;
    setParams(copy);
  };
  const removeParam = (i: number) => {
    if (params.length === 1) {
      setParams([{ key: '', value: '' }]);
    } else {
      setParams(params.filter((_, idx) => idx !== i));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Uzupełnij nazwę i cenę');
      return;
    }
    setLoading(true);
    try {
      // upload new images
      let uploadedUrls: string[] = [];
      if (files.length > 0) {
        const results = await Promise.all(files.map(f => uploadProductImage(f)));
        uploadedUrls = results.filter((u): u is string => Boolean(u));
      }
      const allImages = [...existingImages, ...uploadedUrls];

      // build parameters map
      const paramMap: Record<string, string> = {};
      params.forEach(p => {
        const k = p.key.trim();
        const v = p.value.trim();
        if (k && v) paramMap[k] = v;
      });

      const payload: any = {
        name: name.trim(),
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        stock: stock ? parseInt(stock, 10) : 0,
        sku: sku.trim() || null,
        category: category.trim() || null,
        subcategory: subcategory.trim() || null,
        description: description.trim(),
        images: allImages,
        parameters: paramMap,
      };

      const url = isEdit ? `${API_URL}/api/products/${editingProduct!.id}` : `${API_URL}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Błąd ${res.status}: ${txt}`);
      }

      const saved = await res.json();
      onSuccess(saved, isEdit);
      // reset if not edit
      if (!isEdit) {
        setName(''); setPrice(''); setOldPrice(''); setStock(''); setSku(''); setCategory(''); setSubcategory(''); setDescription('');
        setExistingImages([]); setFiles([]); setPreviews([]); setParams([{ key: '', value: '' }]);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Błąd zapisu produktu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{isEdit ? `Edytujesz: ${editingProduct?.name}` : 'Dodaj nowy produkt'}</h3>
        {isEdit && (
          <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 underline">
            Anuluj edycję
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Nazwa produktu *</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="np. Pramac P3500i — agregat inwerterowy"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Cena netto (PLN) *</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="3200"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Stara cena (promocja)</label>
          <input type="number" step="0.01" value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="np. 3999"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Stan magazynowy</label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="np. 10"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">SKU</label>
          <input value={sku} onChange={e => setSku(e.target.value)} placeholder="np. PRM-P3500I"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Kategoria</label>
          <div className="flex gap-2">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Wybierz kategorię</option>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="lub wpisz własną"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Podkategoria</label>
          <div className="flex gap-2">
            <select value={subcategory} onChange={e => setSubcategory(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Wybierz podkategorię</option>
              {(SUBCATEGORY_OPTIONS[category] || ['gazowe', 'inwerterowe', 'benzynowe', 'diesla', 'inne']).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="lub wpisz własną"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Opis</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Szczegółowy opis produktu..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
      </div>

      {/* Images */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">Zdjęcia produktu</label>
        
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {existingImages.map((url, idx) => (
              <div key={`ex-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExisting(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">Usuń</button>
              </div>
            ))}
          </div>
        )}

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((url, idx) => (
              <div key={`new-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-blue-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`new-${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewFile(idx)}
                  className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">×</button>
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[9px] text-center py-0.5">NOWE</div>
              </div>
            ))}
          </div>
        )}

        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition bg-white">
          <div className="text-2xl">📸</div>
          <div className="text-xs text-slate-500 mt-1">Kliknij aby dodać zdjęcia (wiele plików)</div>
          <div className="text-[10px] text-slate-400">JPG, PNG, WebP — max 5MB każde</div>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </label>
      </div>

      {/* Parameters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">Parametry techniczne</label>
          <button type="button" onClick={addParam} className="text-xs bg-slate-900 text-white px-3 py-1 rounded-full hover:bg-slate-800">+ Dodaj parametr</button>
        </div>
        <div className="space-y-2">
          {params.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input value={p.key} onChange={e => updateParam(i, 'key', e.target.value)} placeholder="np. moc"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={p.value} onChange={e => updateParam(i, 'value', e.target.value)} placeholder="np. 3.5 kW"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={() => removeParam(i)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition">×</button>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-slate-400">Np. klucz: <code>moc_maksymalna</code> wartość: <code>3300 W</code>. Klucze zamieniane są automatycznie na ładne etykiety w sklepie.</div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-300 transition flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Zapisywanie...
            </>
          ) : isEdit ? '💾 Zapisz zmiany' : '✨ Dodaj produkt'}
        </button>
        {isEdit && (
          <button type="button" onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition">
            Anuluj
          </button>
        )}
      </div>
    </form>
  );
}
