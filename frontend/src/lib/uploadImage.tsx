import { getSupabase } from '@/lib/supabase';

export const uploadProductImage = async (file: File) => {
    try {
        const supabase = getSupabase();
        // Tworzymy unikalną nazwę pliku, łącząc znacznik czasu z oryginalną nazwą
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Wysyłamy plik do Supabase Storage
        const { data, error } = await supabase.storage
            .from('product_images')
            .upload(filePath, file, {
                cacheControl: "31536000",
            });

        if (error) throw error;

        // Pobieramy publiczny adres URL do tego pliku
        const { data: { publicUrl } } = supabase.storage
            .from('product_images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Błąd podczas wgrywania zdjęcia:', error);
        return null;
    }
};