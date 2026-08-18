'use client'
export const dynamic = 'force-dynamic';

import ProductForm from "@/app/components/AdminAddProductForm";
import {useEffect, useState} from "react";
import {Product} from "@/app/types/product";
import {getProducts, deleteProduct} from "@/app/services/productService";

 export default function AdminProducts() {
     const [products, setProducts] = useState<Product[]>([]);
     const [editingProduct, setEditingProduct] = useState<Product | null>(null);

     useEffect(() => {
         const fetchData = async () => {
             try {
                  const data = await getProducts();
                  setProducts(data);
             } catch (error) {
                 console.error("Nie udało się załadować produktów:", error);
             }
         };

         fetchData();
     }, []);

     const handleDelete = async (id: number) => {
         if (confirm("Czy na pewno chcesz usunąć ten produkt?")){
            try {
             await deleteProduct(id);

             setProducts(products.filter(p => p.id !== id));

             alert("Produkt został usunięty!");
            } catch (error) {
                console.error("Pełny opis błędu usuwania:", error);
             alert("Nie udało się usunąć produktu.");
            }
         }
     };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Zarządzanie produktami 📦</h1>
                <p className="text-sm text-gray-500 mt-1">Dodaj nowe transformatory do oferty swojego sklepu.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                {/* Gotowy komponent formularza */}
                <ProductForm onProductAdded={(newProduct) => setProducts([...products, newProduct])}
                    onProductUpdated={(updateProduct) => {
                        setProducts(products.map(p => p.id === updateProduct.id ? updateProduct : p));
                        setEditingProduct(null);
                    }}
                             editingProduct={editingProduct}
                             onCancel={() => setEditingProduct(null)}
                />
            </div>
            <table>
            <thead>
            <tr>
                <th>Zdjęcie</th>
                <th>Nazwa</th>
                <th>Cena</th>
                <th>Opis</th>
                <th>Akcje</th>
            </tr>
            </thead>
            <tbody>
            {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                        {product.images && product.images.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {product.images.map((url, index) => (
                                    <img key={index}
                                         src={url}
                                         alt={`${product.name} - ${index + 1}`}
                                         className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                    />
                                ))}
                            </div>
                            ) : (
                                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md text-gray-400 text-xs">
                                    Brak
                                </div>
                            )}
                    </td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.price} zł</td>
                    <td className="p-3 max-w-xs truncate">{product.description}</td>
                    <td className="p-3">
                        <button
                            onClick={() => setEditingProduct(product)}
                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                            ✏️ Edytuj
                        </button>
                        <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                            🗑️ Usuń
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
            </table>

            {editingProduct && (
                <div className="mt-8 p-4 border rounded bg-gray-50">
                    <h2 className="text-xl font-bold mb-4">Edytujesz: {editingProduct.name}</h2>
                    {/* Tutaj pojawi się nasz formularz */}
                    <button
                        onClick={() => setEditingProduct(null)}
                        className="text-gray-500 underline text-sm"
                    >
                        Anuluj edycję
                    </button>
                </div>
            )}
        </div>

    );
}