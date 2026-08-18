-- 1. Czyszczenie tabel powiązanych
TRUNCATE TABLE product_parameters RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;

-- 2. Czyszczenie tabeli głównej
TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- 3. Wstawianie produktów (ID generowane sekwencyjnie 1..10)
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

-- 4. Zdjęcia produktów powiązane przez product_id
INSERT INTO product_images (product_id, image_url) VALUES
                                                       -- ID 1: TS40
                                                       (1, 'https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783722183263.png'),
                                                       (1, 'https://iyugrhskjjyegxppeqoj.supabase.co/storage/v1/object/public/product_images/products/1783719987438.jpg'),
                                                       -- ID 2: Zasilacz 12V
                                                       (2, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 3: Przewód
                                                       (3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 4: Agregat
                                                       (4, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 5: Wallbox EV
                                                       (5, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 6: Toroid
                                                       (6, 'https://unsplash.com/photos/two-square-blue-led-lights-ImcUkZ72oUs'),
                                                       -- ID 7: Przetwornica
                                                       (7, 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 8: Miernik
                                                       (8, 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 9: Przekaźnik SSR
                                                       (9, 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800'),
                                                       -- ID 10: Autotransformator
                                                       (10, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800');

-- 5. Parametry techniczne powiązane przez product_id
INSERT INTO product_parameters (product_id, parameter_key, parameter_value) VALUES
                                                                                -- ID 1: TS40
                                                                                (1, 'moc', '40VA'),
                                                                                (1, 'napiecie_wejsciowe', '230V'),
                                                                                (1, 'napiecie_wyjsciowe', '12V / 24V'),
                                                                                -- ID 2: Zasilacz
                                                                                (2, 'napiecie_wyjsciowe', '12V DC'),
                                                                                (2, 'prad_maksymalny', '5A'),
                                                                                (2, 'sprawnosc', '88%'),
                                                                                -- ID 3: Przewód
                                                                                (3, 'przekroj', '3x2.5 mm²'),
                                                                                (3, 'material', 'Miedź (Cu)'),
                                                                                (3, 'klasa_napieciowa', '450/750V'),
                                                                                -- ID 4: Agregat
                                                                                (4, 'moc_znamionowa', '3500W'),
                                                                                (4, 'rodzaj_paliwa', 'Benzyna bezołowiowa 95'),
                                                                                (4, 'rozruch', 'Elektryczny / Ręczny'),
                                                                                -- ID 5: Wallbox EV
                                                                                (5, 'moc_ladowania', '22kW'),
                                                                                (5, 'zlacze', 'Typ 2 (Mennekes)'),
                                                                                (5, 'stopien_ochrony', 'IP54'),
                                                                                -- ID 6: Toroid
                                                                                (6, 'moc', '150VA'),
                                                                                (6, 'napiecie_wtórne', '24V AC'),
                                                                                -- ID 7: Przetwornica
                                                                                (7, 'moc_ciagla', '1000W'),
                                                                                (7, 'przebieg_napiecia', 'Czysta sinusoida'),
                                                                                -- ID 8: Miernik
                                                                                (8, 'kategoria_pomiarowa', 'CAT III 600V'),
                                                                                (8, 'pomiar_pradu', 'do 400A AC/DC'),
                                                                                -- ID 9: SSR
                                                                                (9, 'prad_pracy', '40A'),
                                                                                (9, 'napiecie_sterujace', '3-32V DC'),
                                                                                -- ID 10: Autotransformator
                                                                                (10, 'zakres_regulacji', '0-250V AC'),
                                                                                (10, 'prad_wyjsciowy', '8A');