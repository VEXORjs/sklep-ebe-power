'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, UserDto } from '@/app/services/adminService';
import { getPublicApiUrl } from '@/app/lib/api';

const API_URL = getPublicApiUrl();

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: number) => {
    if (!confirm('Usunąć użytkownika?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert('Błąd usuwania');
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-2xl border" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Użytkownicy 👥</h1>
        <p className="text-sm text-slate-500 mt-1">{filtered.length} użytkowników</p>
      </div>

      <div className="bg-white rounded-2xl border p-4 flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj po e-mailu, imieniu..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-[11px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Imię</th>
              <th className="text-left p-3">Email</th>
              <th className="text-right p-3">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">#{u.id}</td>
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(u.id)} className="w-8 h-8 rounded-lg bg-white border hover:bg-red-50 hover:text-red-600">🗑️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Brak użytkowników</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
