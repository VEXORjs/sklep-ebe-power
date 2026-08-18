export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    images: string[];
    videos: string[];
    parameters: string;
    category?: string;
    sku?: string;
    oldPrice?: number;
    badge?: string;
    rating?: number;
    reviews?: number;
}