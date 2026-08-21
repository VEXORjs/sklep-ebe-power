#!/usr/bin/env python3
"""Generate simple Polish product datasheet PDFs for Pramac generators."""
from pathlib import Path

OUT = Path("/home/user/trafo/frontend/public/datasheets")
OUT.mkdir(parents=True, exist_ok=True)


def pdf_escape(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .encode("latin-1", "replace")
        .decode("latin-1")
    )


def polish_to_ascii(text: str) -> str:
    table = str.maketrans(
        {
            "ą": "a",
            "ć": "c",
            "ę": "e",
            "ł": "l",
            "ń": "n",
            "ó": "o",
            "ś": "s",
            "ż": "z",
            "ź": "z",
            "Ą": "A",
            "Ć": "C",
            "Ę": "E",
            "Ł": "L",
            "Ń": "N",
            "Ó": "O",
            "Ś": "S",
            "Ż": "Z",
            "Ź": "Z",
        }
    )
    return text.translate(table)


def make_pdf(filename: str, model: str, subtitle: str, rows: list[tuple[str, str]]) -> None:
    lines = []
    y = 760
    content = []

    def text_at(x: float, y_pos: float, size: int, s: str) -> None:
        content.append(f"BT /F1 {size} Tf {x:.1f} {y_pos:.1f} Td ({pdf_escape(polish_to_ascii(s))}) Tj ET")

    text_at(50, 800, 11, "ebe power  |  Karta katalogowa PRAMAC")
    text_at(50, 778, 20, model)
    text_at(50, 758, 11, subtitle)
    content.append("0.2 0.7 0.45 RG 50 748 495 1.2 re S")

    y = 720
    text_at(50, y, 12, "Parametry techniczne")
    y -= 22
    for i, (key, value) in enumerate(rows):
        if i % 2 == 0:
            content.append(f"0.95 0.95 0.95 rg 48 {y - 6:.1f} 499 18 re f")
        text_at(56, y, 10, key)
        text_at(280, y, 10, value)
        y -= 18
        if y < 80:
            break

    y -= 16
    content.append("0.2 0.7 0.45 RG 50 {0:.1f} 495 1.2 re S".format(y + 10))
    text_at(50, y - 8, 9, "Dokument na podstawie karty katalogowej producenta PRAMAC.")
    text_at(50, y - 22, 9, "ebe power — Borki 10, 97-400 Belchatow  |  www.ebe-power.pl")
    text_at(50, y - 36, 9, "Gwarancja 24 mies.  |  Faktura VAT  |  Wysylka 24 h")

    stream = "\n".join(content).encode("latin-1")
    objects = []
    objects.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
    objects.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n")
    objects.append(
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
    )
    objects.append(f"4 0 obj << /Length {len(stream)} >> stream\n".encode("latin-1") + stream + b"\nendstream\nendobj\n")
    objects.append("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n")

    xref_positions = []
    body = b"%PDF-1.4\n"
    for obj in objects:
        xref_positions.append(len(body))
        body += obj if isinstance(obj, bytes) else obj.encode("latin-1")

    xref_start = len(body)
    xref = [b"xref\n0 6\n0000000000 65535 f \n"]
    for pos in xref_positions:
        xref.append(f"{pos:010d} 00000 n \n".encode("latin-1"))
    body += b"".join(xref)
    body += (
        f"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode("latin-1")
    )
    (OUT / filename).write_bytes(body)


SHEETS = [
    (
        "DX8500.pdf",
        "PRAMAC DX8500 PRO+",
        "Agregat prądotwórczy diesla, zabudowa wyciszona, AVR, Stage V",
        [
            ("Producent", "PRAMAC"),
            ("Model", "DX8500 PRO+"),
            ("Rodzaj paliwa", "Diesel"),
            ("Norma emisji", "Stage V"),
            ("Regulacja napiecia", "AVR"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "400 / 230 V"),
            ("Liczba faz", "3"),
            ("Moc maksymalna ESP", "8,5 kVA / 6,8 kW"),
            ("Moc ciagla COP", "7,7 kVA / 6,2 kW"),
            ("Rozruch", "Elektryczny"),
            ("Gniazda", "1x CEE 400 V, 1x Schuko 230 V 16 A"),
            ("Poziom halasu LWA", "97 dB(A)"),
            ("Obudowa", "Wyciszona, canopy"),
            ("Zastosowanie", "Budowa, zasilanie awaryjne, wynajem"),
        ],
    ),
    (
        "P3500i.pdf",
        "PRAMAC P 3500i",
        "Agregat inwerterowy 230 V — PowerRush, Stage V",
        [
            ("Producent", "PRAMAC"),
            ("Model", "P 3500i"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc maksymalna", "3,3 kW"),
            ("Moc znamionowa", "3,0 kW"),
            ("Regulacja napiecia", "Inwerter"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Elektryczny + reczny"),
            ("Pojemnosc zbiornika", "10 l"),
            ("Zuzycie paliwa 75%", "1,5 l/h"),
            ("Czas pracy 75%", "6,3 h"),
            ("Halas LWA", "88 dB(A)"),
            ("Wymiary (DxSxW)", "601 x 458 x 552 mm"),
            ("Waga (sucha)", "49,5 kg"),
            ("Funkcje", "PowerRush, praca rownolegla (opcja)"),
        ],
    ),
    (
        "P3000i.pdf",
        "PRAMAC P 3000i",
        "Agregat inwerterowy 230 V — PowerRush, Stage V",
        [
            ("Producent", "PRAMAC"),
            ("Model", "P 3000i"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc maksymalna", "2,5 kW"),
            ("Moc znamionowa", "2,3 kW"),
            ("Regulacja napiecia", "Inwerter"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Reczny"),
            ("Pojemnosc zbiornika", "4 l"),
            ("Zuzycie paliwa 75%", "1,14 l/h"),
            ("Czas pracy 75%", "3,5 h"),
            ("Halas LWA / 7 m", "88 / 61 dB(A)"),
            ("Wymiary (DxSxW)", "565 x 339 x 467 mm"),
            ("Waga (sucha)", "27 kg"),
            ("Gniazda", "2x Schuko 230 V 16 A"),
            ("Funkcje", "PowerRush"),
        ],
    ),
    (
        "E4000.pdf",
        "PRAMAC E4000 230 V 50 Hz",
        "Agregat benzynowy ramowy — silnik Honda GX200",
        [
            ("Producent", "PRAMAC"),
            ("Model", "E4000 230 V 50 Hz"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc maksymalna ESP", "3,1 kW / 3,4 kVA"),
            ("Moc ciagla COP", "2,6 kW / 2,9 kVA"),
            ("Wspolczynnik mocy", "cos fi 0,9"),
            ("Silnik", "Honda GX200, 196 cm3"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Reczny"),
            ("Pojemnosc zbiornika", "3,1 l"),
            ("Czas pracy 75%", "2,65 h"),
            ("Halas LWA / 7 m", "96 / 68 dB(A)"),
            ("Wymiary (DxSxW)", "625 x 455 x 455 mm"),
            ("Waga (sucha)", "36 kg"),
            ("Gniazda", "2x 230 V 16 A"),
        ],
    ),
    (
        "MES8000.pdf",
        "PRAMAC MES 8000 400 V 50 Hz",
        "Agregat benzynowy ramowy 3-fazowy — silnik Honda GX390",
        [
            ("Producent", "PRAMAC"),
            ("Model", "MES8000 400 V 50 Hz"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "400 / 230 V"),
            ("Liczba faz", "3"),
            ("Moc maksymalna 3f", "8,3 kVA / 6,6 kW"),
            ("Moc znamionowa 3f", "7,0 kVA / 5,6 kW"),
            ("Moc maksymalna 1f", "4,0 kVA"),
            ("Moc znamionowa 1f", "3,7 kVA"),
            ("Silnik", "Honda GX390, 389 cm3"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Reczny"),
            ("Pojemnosc zbiornika", "6,5 l"),
            ("Wymiary (DxSxW)", "750 x 543 x 520 mm"),
            ("Waga (sucha)", "75 kg"),
            ("Gniazda", "1x 230 V 16 A, 1x CEE 230 V 16 A, 1x CEE 400 V 16 A"),
        ],
    ),
    (
        "WX6250ES.pdf",
        "PRAMAC WX 6250 ES",
        "Agregat benzynowy 400 V, AVR, rozruch elektryczny",
        [
            ("Producent", "PRAMAC"),
            ("Model", "WX 6250 ES"),
            ("Kod", "PR552TXBZ00"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "400 / 230 V"),
            ("Liczba faz", "3"),
            ("Moc maksymalna ESP 400 V", "6,0 kVA / 4,8 kW"),
            ("Moc ciagla COP 400 V", "5,0 kVA / 4,0 kW"),
            ("Regulacja napiecia", "AVR"),
            ("Silnik", "PRAMAC OHV 420 cm3, Stage V"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Elektryczny"),
            ("Pojemnosc zbiornika", "26 l"),
            ("Waga (sucha)", "90 kg"),
            ("Wymiary", "800 x 698 x 620 mm"),
            ("Gniazda", "1x CEE 400 V 16 A, 2x Schuko 230 V 16 A"),
        ],
    ),
    (
        "WX7000.pdf",
        "PRAMAC WX 7000",
        "Agregat benzynowy 230 V, AVR, rozruch elektryczny",
        [
            ("Producent", "PRAMAC"),
            ("Model", "WX 7000"),
            ("Kod", "PR582SXBZ00"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc maksymalna", "6,1 kW"),
            ("Moc ciagla COP", "5,8 kW"),
            ("Regulacja napiecia", "AVR"),
            ("Norma emisji", "Stage V"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Elektryczny + reczny"),
            ("Pojemnosc zbiornika", "26 l"),
            ("Zuzycie paliwa 50%", "2,3 l/h"),
            ("Czas pracy 50%", "11,3 h"),
            ("Halas LWA / 7 m", "97 / 69 dB(A)"),
            ("Gniazda", "2x Schuko 230 V 16 A, 1x CEE 230 V 32 A"),
        ],
    ),
    (
        "PMi4500.pdf",
        "PRAMAC PMi 4500",
        "Agregat inwerterowy 3XTRA Control — ATS, pilot, 2-wire start",
        [
            ("Producent", "PRAMAC"),
            ("Model", "PMi 4500"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc maksymalna", "4,2 kW"),
            ("Moc znamionowa", "3,8 kW"),
            ("Regulacja napiecia", "Inwerter"),
            ("Silnik", "PRAMAC OHV, Stage V"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Elektryczny + reczny"),
            ("Pojemnosc zbiornika", "12 l"),
            ("Zuzycie paliwa 50%", "1,2 l/h"),
            ("Czas pracy 50% Eco", "9,7 h"),
            ("Halas LWA / 7 m", "93 / 68 dB(A)"),
            ("Wymiary (DxSxW)", "578 x 422 x 500 mm"),
            ("Waga (sucha)", "42,5 kg"),
            ("Gniazda", "2x Schuko 230 V 16 A IP44, DC 12 V 6 A"),
            ("Sterowanie", "3XTRA: ATS, pilot, 2-wire start"),
        ],
    ),
    (
        "S12000.pdf",
        "PRAMAC S12000 400 V 50 Hz #AVR #CONN #DPP",
        "Agregat profesjonalny 3-fazowy — Honda GX630, AVR, CONN, DPP",
        [
            ("Producent", "PRAMAC"),
            ("Model", "S12000 400 V 50 Hz #AVR #CONN #DPP"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "400 / 230 V"),
            ("Liczba faz", "3"),
            ("Moc maksymalna ESP", "13,9 kVA / 11,1 kW"),
            ("Moc ciagla COP", "11,8 kVA / 9,5 kW"),
            ("Moc 1-fazowa max / COP", "5,6 / 5,0 kVA"),
            ("Silnik", "Honda GX630, 688 cm3"),
            ("Paliwo", "Benzyna"),
            ("Rozruch", "Elektryczny"),
            ("Regulacja napiecia", "AVR (ASR)"),
            ("Pojemnosc zbiornika", "24 l"),
            ("Czas pracy 75%", "5,67 h"),
            ("Wymiary (DxSxW)", "960 x 641 x 667 mm"),
            ("Waga (sucha)", "162 kg"),
            ("Wyposazenie", "AVR, CONN (AMF), DPP (roznicowka)"),
            ("Gniazda", "CEE 400 V 16 A, CEE 230 V 16 A, Schuko 230 V"),
        ],
    ),
    (
        "GA20000.pdf",
        "PRAMAC GA 20000",
        "Agregat gazowy standby — LPG / gaz ziemny, 400 V",
        [
            ("Producent", "PRAMAC"),
            ("Model", "GA 20000"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "400 V"),
            ("Liczba faz", "3"),
            ("Moc ESP LPG", "20 kVA / 16 kW"),
            ("Moc ESP gaz ziemny", "17 kVA / 13,6 kW"),
            ("Silnik", "Generac G-FORCE 1000, 999 cm3, 2 cyl."),
            ("Paliwo", "LPG lub gaz ziemny"),
            ("Rozruch", "Elektryczny"),
            ("Obroty", "3000 obr/min, regulator elektroniczny"),
            ("Prad max LPG / NG", "28,87 A / 24,53 A"),
            ("Wylacznik", "32 A"),
            ("Zuzycie NG 50/100%", "4,50 / 7,02 m3/h"),
            ("Zuzycie LPG 50/100%", "6,83 / 10,86 l/h"),
            ("Wymiary (DxSxW)", "1232 x 648 x 733 mm"),
            ("Waga", "220 kg"),
        ],
    ),
    (
        "GA10000.pdf",
        "PRAMAC GA 10000",
        "Agregat gazowy standby — LPG / gaz ziemny, 230 V",
        [
            ("Producent", "PRAMAC"),
            ("Model", "GA 10000"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc ESP LPG", "10 kVA"),
            ("Moc ESP gaz ziemny", "10 kVA"),
            ("Silnik", "Generac G-FORCE OHV"),
            ("Paliwo", "LPG lub gaz ziemny"),
            ("Rozruch", "Elektryczny"),
            ("Obroty", "3000 obr/min, regulator elektroniczny"),
            ("Prad max", "43,48 A"),
            ("Wylacznik", "40 A"),
            ("Zuzycie NG 50/100%", "3,51 / 5,30 m3/h"),
            ("Zuzycie LPG 50/100%", "4,79 / 7,62 l/h"),
            ("Wymiary (DxSxW)", "1232 x 648 x 733 mm"),
            ("Waga", "176 kg"),
        ],
    ),
    (
        "GA13000.pdf",
        "PRAMAC GA 13000",
        "Agregat gazowy standby — LPG / gaz ziemny, 230 V",
        [
            ("Producent", "PRAMAC"),
            ("Model", "GA 13000"),
            ("Czestotliwosc", "50 Hz"),
            ("Napiecie", "230 V"),
            ("Liczba faz", "1"),
            ("Moc ESP LPG", "13 kVA"),
            ("Moc ESP gaz ziemny", "13 kVA"),
            ("Silnik", "Generac G-FORCE OHV, 999 cm3"),
            ("Paliwo", "LPG lub gaz ziemny"),
            ("Rozruch", "Elektryczny"),
            ("Obroty", "3000 obr/min, regulator elektroniczny"),
            ("Prad max", "56,52 A"),
            ("Wylacznik", "63 A"),
            ("Zuzycie NG 50/100%", "4,02 / 6,48 m3/h"),
            ("Zuzycie LPG 50/100%", "5,58 / 8,86 l/h"),
            ("Wymiary (DxSxW)", "1232 x 648 x 733 mm"),
            ("Waga", "193 kg"),
        ],
    ),
]


if __name__ == "__main__":
    for item in SHEETS:
        make_pdf(*item)
        print("wrote", item[0])
