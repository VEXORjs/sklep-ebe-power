'use client';

import { getPublicApiUrl } from '@/app/lib/api';
import { Product } from '@/app/types/product';

const API_URL = getPublicApiUrl();

export interface AdminStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  paidOutOfStockOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalUsers: number;
  lowStockProducts: Product[];
}

export interface OrderItemDto {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderDto {
  id: number;
  customerEmail: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'PAID_OUT_OF_STOCK' | 'COMPLETED' | 'CANCELLED';
  stripePaymentIntentId: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role?: 'ADMIN' | 'USER';
}

function getApiBase(): string {
  // getPublicApiUrl can return /api/backend in prod which is proxied
  // For client side we want to use it directly
  return API_URL;
}

/**
 * Prosi Next.js o natychmiastowe unieważnienie cache'a stron produktowych
 * (ISR/`revalidate: 300`) zaraz po zmianie w panelu admina — patrz
 * `src/app/api/revalidate/route.ts`. Dzięki temu klient widzi nowe
 * ceny/stany magazynowe od razu, a nie dopiero po odświeżeniu strony po
 * wygaśnięciu 5-minutowego okna cache.
 *
 * Celowo "fire and forget" (błąd rewalidacji nie może zepsuć zapisu
 * produktu, który już się powiódł po stronie backendu).
 */
function triggerCatalogRevalidate(productId?: number): void {
  fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(productId != null ? { productId } : {}),
  }).catch((error) => {
    console.warn('⚠️ Nie udało się odświeżyć cache katalogu:', error);
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${getApiBase()}/api/admin/stats`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Nie udało się pobrać statystyk');
  return res.json();
}

export async function getAllOrders(): Promise<OrderDto[]> {
  const res = await fetch(`${getApiBase()}/api/orders`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Nie udało się pobrać zamówień');
  return res.json();
}

export async function getOrderById(id: number): Promise<OrderDto> {
  const res = await fetch(`${getApiBase()}/api/orders/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Nie udało się pobrać zamówienia');
  return res.json();
}

export async function updateOrderStatus(id: number, status: string): Promise<OrderDto> {
  const res = await fetch(`${getApiBase()}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Nie udało się zaktualizować statusu');
  return res.json();
}

export async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/orders/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Nie udało się usunąć zamówienia');
}

export async function getAllUsers(): Promise<UserDto[]> {
  const res = await fetch(`${getApiBase()}/api/admin/users`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Nie udało się pobrać użytkowników');
  return res.json();
}

// Products - client side versions (using public URL)
export async function getProductsClient(): Promise<Product[]> {
  const res = await fetch(`${getApiBase()}/api/products`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Nie udało się pobrać produktów');
  return res.json();
}

export async function deleteProductClient(id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Nie udało się usunąć produktu');
  triggerCatalogRevalidate(id);
}

export async function createProductClient(data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${getApiBase()}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Błąd tworzenia produktu: ${res.status} ${text}`);
  }
  const created = await res.json();
  triggerCatalogRevalidate(created?.id);
  return created;
}

export async function updateProductClient(id: number, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Błąd aktualizacji produktu: ${res.status} ${text}`);
  }
  const updated = await res.json();
  triggerCatalogRevalidate(id);
  return updated;
}
