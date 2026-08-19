-- 1. Czyszczenie tabel powiązanych
TRUNCATE TABLE product_parameters RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- 2. Wstawianie produktów z dopasowanymi nazwami kategorii
INSERT INTO products (name, price, old_price, stock, description, category, sku) VALUES
                                                                                     ('Transformator sieciowy TS40', 89.99, 109.99, 15, 'Klasyczny transformator sieciowy do układów zasilania niskonapięciowego.', 'Transformatory', 'TRA-0001'),
                                                                                     ('Zasilacz impulsowy 12V 5A', 45.50, NULL, 30, 'Stabilizowany zasilacz impulsowy w obudowie modułowej na szynę DIN.', 'Zasilacze', 'TRA-0002'),
                                                                                     ('Przewód instalacyjny miedziany 3x2.5mm² (1m)', 5.20, NULL, 250, 'Jednożyłowy przewód miedziany do instalacji elektroenergetycznych.', 'Kable', 'TRA-0003'),
                                                                                     ('Agregat prądotwórczy inwertorowy 3.5 kW', 2499.00, NULL, 8, 'Cichy agregat prądotwórczy z pełną sinusoidą, bezpieczny dla elektroniki.', 'Agregaty', 'TRA-0004'),
                                                                                     ('Stacja ładowania EV Wallbox 22 kW', 3199.00, NULL, 5, 'Trójfazowa naścienna stacja ładowania samochodów elektrycznych z gniazdem Typu 2.', 'Stacje ładowania EV', 'TRA-0005'),
                                                                                     ('Transformator toroidalny 150VA 230V/24V', 139.00, NULL, 12, 'Wysokosprawny transformator toroidalny o niskim poziomie hałasu i strat własnych.', 'Transformatory', 'TRA-0006'),
                                                                                     ('Przetwornica napięcia 12V/230V 1000W/2000W', 389.90, NULL, 18, 'Przetwornica z czystym sinusem przeznaczona do zasilania urządzeń indukcyjnych.', 'Zasilacze', 'TRA-0007'),
                                                                                     ('Miernik cyfrowy True RMS z cęgami', 215.00, NULL, 20, 'Profesjonalny multimetr cęgowy do pomiaru prądu przemiennego i stałego.', 'Liczniki i mierniki', 'TRA-0008'),
                                                                                     ('Przekaźnik półprzewodnikowy SSR 40A', 64.50, NULL, 45, 'Bezstykowe sterowanie obciążeniami przemysłowymi o wysokiej częstotliwości łączeń.', 'Rozdzielnice i zabezpieczenia', 'TRA-0009'),
                                                                                     ('Autotransformator regulowany 0-250V 2kVA', 899.00, NULL, 4, 'Laboratoryjny autotransformator ze wskaźnikiem analogowym i płynną regulacją.', 'Transformatory', 'TRA-0010');

-- 3. Zdjęcia produktów
INSERT INTO product_images (product_id, image_url) VALUES
                                                       (1, 'https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783722183263.png'),
                                                       (1, 'https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783719987438.jpg'),
                                                       (2, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800'),
                                                       (3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'),
                                                       (4, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'),
                                                       (5, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'),
                                                       (6, 'https://images.unsplash.com/photo-1589276534126-adef63a95e05?q=80&w=1170&auto=format&fit=crop&q=80&w=800'),
                                                       (7, 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800'),
                                                       (8, 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800'),
                                                       (9, 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800'),
                                                       (10, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800');

-- 4. Parametry techniczne
INSERT INTO product_parameters (product_id, parameter_key, parameter_value) VALUES
                                                                                (1, 'moc', '40VA'),
                                                                                (1, 'napiecie_wejsciowe', '230V'),
                                                                                (1, 'napiecie_wyjsciowe', '12V / 24V'),
                                                                                (2, 'napiecie_wyjsciowe', '12V DC'),
                                                                                (2, 'prad_maksymalny', '5A'),
                                                                                (2, 'sprawnosc', '88%'),
                                                                                (3, 'przekroj', '3x2.5 mm²'),
                                                                                (3, 'material', 'Miedź (Cu)'),
                                                                                (3, 'klasa_napieciowa', '450/750V'),
                                                                                (4, 'moc_znamionowa', '3500W'),
                                                                                (4, 'rodzaj_paliwa', 'Benzyna bezołowiowa 95'),
                                                                                (4, 'rozruch', 'Elektryczny / Ręczny'),
                                                                                (5, 'moc_ladowania', '22kW'),
                                                                                (5, 'zlacze', 'Typ 2 (Mennekes)'),
                                                                                (5, 'stopien_ochrony', 'IP54'),
                                                                                (6, 'moc', '150VA'),
                                                                                (6, 'napiecie_wtórne', '24V AC'),
                                                                                (7, 'moc_ciagla', '1000W'),
                                                                                (7, 'przebieg_napiecia', 'Czysta sinusoida'),
                                                                                (8, 'kategoria_pomiarowa', 'CAT III 600V'),
                                                                                (8, 'pomiar_pradu', 'do 400A AC/DC'),
                                                                                (9, 'prad_pracy', '40A'),
                                                                                (9, 'napiecie_sterujace', '3-32V DC'),
                                                                                (10, 'zakres_regulacji', '0-250V AC'),
                                                                                (10, 'prad_wyjsciowy', '8A');