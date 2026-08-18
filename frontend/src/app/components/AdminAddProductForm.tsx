'use client';

import {useEffect, useState} from 'react';
import { uploadProductImage } from '@/lib/uploadImage';
import {Product} from "@/app/types/product";
import Image from "next/image";

interface ProductFormProps {
    onProductAdded: (product: Product) => void;
    onProductUpdated?: (product: Product) => void;
    editingProduct?: Product | null;
    onCancel?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' || 'http://localhost:3000';

export default function ProductForm({ onProductAdded, onProductUpdated, editingProduct, onCancel }: ProductFormProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [editingProductLocal, setEditingProductLocal] = useState<Product | null>(null);

    const isEdit = Boolean(editingProduct);
    const url = isEdit ? `${API_URL}/api/products/${editingProduct?.id}` : `${API_URL}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    useEffect(() => {
        const setters = async () => {
            if (editingProduct) {
                setName(editingProduct.name);
                setPrice(editingProduct.price.toString());
                setDescription(editingProduct.description);
                setEditingProductLocal(editingProduct);
            }
        }

      void setters();
    }, [editingProduct]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        if (!editingProductLocal?.images) return;

        const updatedImages = editingProductLocal?.images.filter((_, index) => index !== indexToRemove);

        setEditingProductLocal({
            ...editingProductLocal,
            images: updatedImages
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEdit) {
            if (!selectedFiles) {
                alert('Proszę wybrać zdjęcie produktu!');
                return;
            }
        }

        setLoading(true);

        try {
            // 1️⃣ Przesyłanie zdjęcia do Supabase Storage
            let publicUrls: string[] = [];

            if (selectedFiles && selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => uploadProductImage(file));
                if (!uploadPromises) {
                    alert('Nie udało się przesłać zdjęcia.');
                    setLoading(false);
                    return;
                }
                const uploadResults = await Promise.all(uploadPromises);
                publicUrls = uploadResults.filter((url): url is string => url !== null);
            }

            // 2️⃣ Przygotowanie danych dla Spring Boota
            const productData = {
                name: name,
                price: parseFloat(price),
                description: description,
                images: publicUrls.length > 0
                    ? [...(editingProductLocal?.images || []), ...publicUrls]
                    : editingProductLocal?.images || []
            };

            // 3️⃣ Wysyłka JSON do backendu
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.status === 200) {
                const savedProduct = await response.json();

                if (isEdit) {
                    if (onProductUpdated) onProductUpdated(savedProduct);
                }
                else {
                    onProductAdded(savedProduct);
                }

                alert('Produkt został pomyślnie zapisany w bazie danych!');
                // Czyszczenie formularza
                setName('');
                setPrice('');
                setDescription('');
                setSelectedFiles(null);
            } else {
                alert('Wystąpił błąd po stronie serwera Spring Boot.');
            }
        } catch (error) {
            console.error('Błąd połączenia:', error);
            alert('Nie można połączyć się z serwerem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Dodaj Nowy Transformator</h2>

            <div>
                <label className="block mb-2.5 text-sm font-medium text-heading">Nazwa produktu</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                />
            </div>

            <div>
                <label className="block mb-2.5 text-sm font-medium text-heading">Cena (PLN)</label>
                <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                />
            </div>

            <div>
                <label className="block mb-2.5 text-sm font-medium text-heading">Opis</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
                    rows={3}
                />
            </div>

            <div>
                <label className="block mb-2.5 text-sm font-medium text-heading">Zdjęcie produktu</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple={true}
                    onChange={handleFileChange}
                    required={!isEdit}
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                />
            </div>

            {isEdit && editingProductLocal?.images && editingProductLocal.images.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                    {editingProductLocal.images.map((url, index) => (
                        <div key={index} className="relative w-16 h-16">
                            <Image
                                src={url}
                                alt="Podgląd"
                                className="w-full h-full object-cover rounded-md border"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex space-x-2">
                {/* Przycisk zapisu (już go masz, zmieniamy tylko tekst w zależności od trybu) */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Zapisz Produkt'}
                </button>

                {/* ❌ Nowy przycisk Anuluj – pojawi się tylko w trybie edycji */}
                {isEdit && (
                    <button
                        type="button" // 👈 Ważne: type="button", żeby nie wysyłał formularza!
                        onClick={onCancel} // 👈 Tutaj wywołujemy nasz przekazany z góry reset
                        className="w-full bg-gray-500 text-white py-2 rounded font-semibold hover:bg-gray-600"
                    >
                        Anuluj
                    </button>
                )}
            </div>
        </form>
    );
}