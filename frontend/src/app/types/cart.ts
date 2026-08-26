// types/cart.ts
export interface CartItemDto {
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface CartDto {
    userId: string;
    items: CartItemDto[];
        cartTotal: number;
    firstStartup?: boolean;
}