'use client';

import { Product } from '@/app/types/product';
import AdminProductForm from '@/app/components/AdminProductForm';

interface ProductFormProps {
  onProductAdded: (product: Product) => void;
  onProductUpdated?: (product: Product) => void;
  editingProduct?: Product | null;
  onCancel?: () => void;
}

/**
 * Wrapper dla kompatybilności wstecznej — nowy formularz ma pełne pola
 * (SKU, kategoria, stan, parametry, zdjęcia) i jest używany w /admin/products.
 * Stary interfejs (onProductAdded / onProductUpdated) jest mapowany na nowy onSuccess.
 */
export default function AdminAddProductForm({
  onProductAdded,
  onProductUpdated,
  editingProduct,
  onCancel,
}: ProductFormProps) {
  return (
    <AdminProductForm
      editingProduct={editingProduct || null}
      onSuccess={(saved, isEdit) => {
        if (isEdit) {
          onProductUpdated?.(saved);
        } else {
          onProductAdded(saved);
        }
      }}
      onCancel={() => onCancel?.()}
    />
  );
}
