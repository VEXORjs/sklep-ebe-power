import type { Product } from "@/app/types/product";
import { normalizeText, slugify } from "@/app/lib/product";

export interface CategoryFaq {
    question: string;
    answer: string;
}

export interface CategoryHighlight {
    title: string;
    text: string;
}

export interface CategoryDef {
    /** Fragment adresu: /kategoria/{slug} */
    slug: string;
    /** Nazwa wyświetlana */
    name: string;
    /** Krótkie hasło pod nagłówkiem */
    tagline: string;
    /** Opis SEO / wstęp na stronie kategorii */
    description: string;
    /** Nazwy kategorii z bazy danych, które trafiają do tej sekcji */
    match: string[];
    image: string;
    /** Słowa kluczowe do metadanych */
    keywords: string[];
    /** Wyróżniki (3 kafelki pod hero) */
    highlights: CategoryHighlight[];
    /** Poradnik zakupowy — na co zwrócić uwagę */
    buyingGuide: string[];
    /** Typowe zastosowania — chipy nawigacyjne */
    applications: string[];
    faq: CategoryFaq[];
}

export const CATEGORIES: CategoryDef[] = [
    {
        slug: "transformatory",
        name: "Transformatory",
        tagline: "Sieciowe, toroidalne i autotransformatory regulowane",
        description:
            "Transformatory jedno- i trójfazowe do zasilania układów sterowania, oświetlenia niskonapięciowego oraz maszyn przemysłowych. W ofercie znajdziesz klasyczne transformatory sieciowe EI, ciche jednostki toroidalne o wysokiej sprawności oraz autotransformatory z płynną regulacją napięcia do zastosowań laboratoryjnych.",
        match: ["Transformatory", "Transformator"],
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=70&w=800",
        keywords: [
            "transformator sieciowy",
            "transformator toroidalny",
            "autotransformator",
            "transformator 230V 24V",
        ],
        highlights: [
            {
                title: "Moce od 40 VA do 2 kVA",
                text: "Dobierzemy jednostkę pod obciążenie ciągłe oraz prąd rozruchowy Twojej instalacji.",
            },
            {
                title: "Uzwojenia miedziane",
                text: "Niskie straty własne, praca w klasie izolacji F i temperatura pracy do 155 °C.",
            },
            {
                title: "Deklaracja zgodności",
                text: "Każdy egzemplarz z kartą katalogową, atestem i 24-miesięczną gwarancją.",
            },
        ],
        buyingGuide: [
            "Policz moc pozorną (VA) wszystkich odbiorników i dodaj 20–30 % zapasu na rozruch.",
            "Sprawdź wymagane napięcie wtórne — 12 V, 24 V lub podwójne uzwojenie 2×12 V.",
            "Do układów audio i pomiarowych wybierz transformator toroidalny (cichszy, mniejsze pole rozproszenia).",
            "Do stanowisk serwisowych i testowych najlepszy będzie autotransformator z regulacją 0–250 V.",
            "Zwróć uwagę na stopień ochrony obudowy — IP20 do rozdzielnic, IP54 i wyżej do warunków warsztatowych.",
        ],
        applications: [
            "Automatyka przemysłowa",
            "Oświetlenie 12 V",
            "Zasilanie sterowników PLC",
            "Stanowiska laboratoryjne",
        ],
        faq: [
            {
                question: "Czym różni się transformator toroidalny od klasycznego EI?",
                answer:
                    "Rdzeń toroidalny ma mniejsze straty jałowe, pracuje ciszej i emituje słabsze pole rozproszone. Przy tej samej mocy jest lżejszy i niższy, ale ma wyższy prąd załączenia — warto przewidzieć układ soft-start.",
            },
            {
                question: "Czy dobierzecie transformator pod moją aplikację?",
                answer:
                    "Tak. Prześlij listę odbiorników wraz z napięciami i poborem prądu — nasz dział techniczny odpowie z rekomendacją w ciągu jednego dnia roboczego.",
            },
            {
                question: "Czy transformatory są dostępne w wersji na szynę DIN?",
                answer:
                    "Większość jednostek do 250 VA oferujemy w obudowach modułowych montowanych na szynie TH-35, co upraszcza integrację w rozdzielnicy.",
            },
        ],
    },
    {
        slug: "zasilacze",
        name: "Zasilacze",
        tagline: "Impulsowe, na szynę DIN i przetwornice napięcia",
        description:
            "Stabilizowane zasilacze impulsowe DC oraz przetwornice 12 V/230 V z czystym przebiegiem sinusoidalnym. Sprawdzą się w automatyce, monitoringu, instalacjach fotowoltaicznych off-grid i zasilaniu awaryjnym urządzeń wrażliwych na jakość napięcia.",
        match: ["Zasilacze", "Zasilacz", "Przetwornice"],
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=70&w=800",
        keywords: [
            "zasilacz impulsowy",
            "zasilacz na szynę DIN",
            "przetwornica 12V 230V",
            "zasilacz 12V 5A",
        ],
        highlights: [
            {
                title: "Sprawność do 94 %",
                text: "Mniej ciepła w rozdzielnicy i niższe koszty pracy ciągłej przez cały rok.",
            },
            {
                title: "Pełne zabezpieczenia",
                text: "Ochrona przeciwzwarciowa, przeciążeniowa, termiczna i przed przepięciami w standardzie.",
            },
            {
                title: "Czysta sinusoida",
                text: "Przetwornice bezpieczne dla silników, pomp, lodówek i sprzętu elektronicznego.",
            },
        ],
        buyingGuide: [
            "Dobierz prąd wyjściowy z zapasem 30 % względem sumy obciążeń — zasilacz pracujący na 100 % szybciej się starzeje.",
            "Sprawdź, czy potrzebujesz regulacji napięcia wyjściowego (potencjometr) — bywa kluczowa przy długich liniach DC.",
            "W rozdzielnicy zostaw minimum 15 mm odstępu po bokach zasilacza dla konwekcji.",
            "Przy zasilaniu urządzeń indukcyjnych licz moc szczytową, nie ciągłą — rozruch potrafi wymagać 2–3× więcej mocy.",
            "Do pracy 24/7 wybieraj konstrukcje z chłodzeniem pasywnym — brak wentylatora to brak elementu zużywalnego.",
        ],
        applications: [
            "Monitoring CCTV",
            "Kontrola dostępu",
            "Instalacje off-grid",
            "Automatyka budynkowa",
        ],
        faq: [
            {
                question: "Zasilacz impulsowy czy liniowy?",
                answer:
                    "Impulsowy jest lżejszy, sprawniejszy i tańszy w eksploatacji. Liniowy wybieramy tam, gdzie liczy się minimalny poziom zakłóceń — np. w torach pomiarowych i audio.",
            },
            {
                question: "Czy przetwornica uruchomi pompę lub lodówkę?",
                answer:
                    "Tak, pod warunkiem wyboru modelu z czystą sinusoidą i mocą szczytową co najmniej dwukrotnie wyższą od mocy znamionowej urządzenia.",
            },
            {
                question: "Czy można łączyć zasilacze równolegle?",
                answer:
                    "Tylko modele z funkcją równoległej pracy i wyrównywaniem prądu. W pozostałych przypadkach stosuje się moduły diodowe redundancji.",
            },
        ],
    },
    {
        slug: "rozdzielnice-i-zabezpieczenia",
        name: "Rozdzielnice i zabezpieczenia",
        tagline: "Obudowy modułowe, przekaźniki i aparatura łączeniowa",
        description:
            "Rozdzielnice natynkowe i podtynkowe, obudowy hermetyczne oraz aparatura sterownicza: przekaźniki półprzewodnikowe SSR, styczniki i ograniczniki przepięć. Komplet elementów potrzebnych do zbudowania bezpiecznej i uporządkowanej tablicy elektrycznej.",
        match: ["Rozdzielnice i zabezpieczenia", "Rozdzielnice", "Przekaźniki"],
        image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=70&w=800",
        keywords: [
            "rozdzielnica modułowa",
            "rozdzielnica natynkowa",
            "przekaźnik SSR",
            "obudowa hermetyczna",
        ],
        highlights: [
            {
                title: "Od 4 do 72 modułów",
                text: "Obudowy natynkowe, podtynkowe i hermetyczne IP65 do zastosowań zewnętrznych.",
            },
            {
                title: "Szyna TH-35",
                text: "Uniwersalny montaż aparatury modułowej wszystkich popularnych producentów.",
            },
            {
                title: "Materiały samogasnące",
                text: "Tworzywo o odporności na żarzący drut 960 °C — zgodność z PN-EN 61439.",
            },
        ],
        buyingGuide: [
            "Zaplanuj 20–30 % wolnych modułów na przyszłą rozbudowę instalacji.",
            "Do pomieszczeń wilgotnych i na zewnątrz wybieraj obudowy o stopniu ochrony minimum IP54, a najlepiej IP65.",
            "Przekaźniki SSR wymagają radiatora — przyjmij ok. 1 W strat mocy na każdy amper prądu obciążenia.",
            "Pamiętaj o ograniczniku przepięć typu 2 w każdej tablicy z elektroniką.",
            "Opisz obwody na tabliczkach — to wymóg formalny odbioru instalacji i realna oszczędność czasu przy serwisie.",
        ],
        applications: [
            "Tablice mieszkaniowe",
            "Szafy sterownicze",
            "Rozdzielnice budowlane",
            "Sterowanie grzałkami",
        ],
        faq: [
            {
                question: "Ile modułów zajmuje typowa aparatura?",
                answer:
                    "Wyłącznik nadprądowy 1P to 1 moduł, wyłącznik różnicowoprądowy 2P — 2 moduły, a rozłącznik główny 3P — 3 moduły. Do sumy warto dodać przestrzeń na listwy N i PE.",
            },
            {
                question: "Czy przekaźnik SSR nadaje się do silników?",
                answer:
                    "Do obciążeń indukcyjnych dobiera się SSR z zapasem prądowym 3–4× oraz z układem tłumiącym RC. Przy częstych rozruchach bezpieczniejszy bywa klasyczny stycznik.",
            },
            {
                question: "Czy rozdzielnice mają miejsce na licznik?",
                answer:
                    "W ofercie mamy zarówno obudowy czysto modułowe, jak i wersje z polem licznikowym zgodnym z wymaganiami operatorów sieci dystrybucyjnych.",
            },
        ],
    },
    {
        slug: "bezpieczniki",
        name: "Bezpieczniki",
        tagline: "Wyłączniki nadprądowe, różnicowoprądowe i wkładki topikowe",
        description:
            "Aparatura zabezpieczająca instalację przed skutkami zwarć, przeciążeń i porażenia. Wyłączniki nadprądowe o charakterystykach B, C i D, wyłączniki różnicowoprądowe typu AC i A oraz klasyczne wkładki topikowe.",
        match: ["Bezpieczniki", "Bezpiecznik"],
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=70&w=800",
        keywords: [
            "wyłącznik nadprądowy",
            "bezpiecznik B16",
            "wyłącznik różnicowoprądowy",
            "wkładka topikowa",
        ],
        highlights: [
            {
                title: "Zdolność zwarciowa 6 kA",
                text: "Parametr wymagany w instalacjach mieszkaniowych i większości obiektów usługowych.",
            },
            {
                title: "Charakterystyki B, C, D",
                text: "Dobór pod obwody gniazdowe, oświetleniowe oraz odbiorniki o wysokim prądzie rozruchu.",
            },
            {
                title: "Zgodność z PN-EN 60898",
                text: "Aparaty renomowanych producentów z pełną dokumentacją techniczną.",
            },
        ],
        buyingGuide: [
            "Charakterystyka B — obwody gniazdowe i oświetleniowe; C — odbiorniki z umiarkowanym rozruchem; D — silniki i transformatory.",
            "Prąd znamionowy aparatu musi być mniejszy niż obciążalność długotrwała przewodu, nie odwrotnie.",
            "Wyłącznik różnicowoprądowy 30 mA jest obowiązkowy w obwodach gniazd i łazienek.",
            "Typ A zamiast AC — wymagany wszędzie tam, gdzie występuje elektronika i prądy pulsujące.",
            "Sprawdź selektywność: aparat przedlicznikowy powinien mieć wyższy prąd i wolniejszą charakterystykę.",
        ],
        applications: [
            "Instalacje mieszkaniowe",
            "Obwody gniazd",
            "Ochrona przeciwporażeniowa",
            "Obwody silnikowe",
        ],
        faq: [
            {
                question: "B16 czy C16 do zwykłych gniazdek?",
                answer:
                    "W obwodach gniazd stosuje się charakterystykę B — zadziała szybciej przy zwarciu i lepiej chroni przewód. C16 rezerwujemy dla odbiorników o wyższym prądzie rozruchowym.",
            },
            {
                question: "Czy RCD zastępuje wyłącznik nadprądowy?",
                answer:
                    "Nie. Różnicówka chroni ludzi przed porażeniem, nadprądowy chroni przewody przed przeciążeniem. Alternatywą jest aparat łączony RCBO.",
            },
            {
                question: "Jak często testować przycisk TEST w różnicówce?",
                answer:
                    "Producenci zalecają test co najmniej raz na pół roku — to jedyny sposób sprawdzenia mechanizmu wyzwalającego bez przyrządów pomiarowych.",
            },
        ],
    },
    {
        slug: "kable",
        name: "Kable",
        tagline: "Przewody instalacyjne, sterownicze i solarne",
        description:
            "Przewody miedziane do instalacji elektroenergetycznych sprzedawane na metry i w kompletnych bębnach. Wersje jedno- i wielożyłowe, bezhalogenowe, giętkie linki sterownicze oraz dedykowane kable solarne odporne na UV.",
        match: ["Kable", "Kabel", "Przewody"],
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=70&w=800",
        keywords: ["przewód YDY", "kabel miedziany 3x2.5", "przewód instalacyjny", "kabel solarny"],
        highlights: [
            {
                title: "100 % miedzi",
                text: "Pełny przekrój znamionowy potwierdzony pomiarem rezystancji żyły.",
            },
            {
                title: "Cięcie na wymiar",
                text: "Zamawiasz dokładnie tyle metrów, ile potrzebujesz — bez odpadu i dopłat.",
            },
            {
                title: "Klasa 450/750 V",
                text: "Izolacja PVC odporna na temperaturę pracy do 70 °C, wersje LSZH na zamówienie.",
            },
        ],
        buyingGuide: [
            "Obwody oświetleniowe: zwykle 1,5 mm²; gniazda: 2,5 mm²; kuchenka i zasilanie tablicy: 4–6 mm².",
            "Przy długich trasach policz spadek napięcia — powyżej 3 % zwiększ przekrój o jeden stopień.",
            "Przewody sztywne (drut) do instalacji stałych, linki giętkie do szaf sterowniczych i ruchomych elementów.",
            "W drogach ewakuacyjnych i obiektach publicznych stosuj przewody bezhalogenowe LSZH.",
            "Kable układane w ziemi wymagają wersji YKY z izolacją odporną na wilgoć oraz osłony mechanicznej.",
        ],
        applications: [
            "Instalacje mieszkaniowe",
            "Szafy sterownicze",
            "Fotowoltaika",
            "Oświetlenie zewnętrzne",
        ],
        faq: [
            {
                question: "Czy przewody sprzedajecie na metry?",
                answer:
                    "Tak, standardowo tniemy na pełne metry. Przy zamówieniach powyżej 100 m proponujemy fabrycznie zapakowany krążek w korzystniejszej cenie.",
            },
            {
                question: "Jaki przekrój do gniazd w garażu?",
                answer:
                    "Dla obwodu gniazd 16 A wystarczy 2,5 mm². Jeśli planujesz ładowarkę do auta lub spawarkę, przejdź na 4 mm² i osobny obwód.",
            },
            {
                question: "Czym różni się YDY od YKY?",
                answer:
                    "YDY to przewód instalacyjny do układania w budynkach, YKY to kabel ziemny o grubszej izolacji, przystosowany do bezpośredniego układania w gruncie.",
            },
        ],
    },
    {
        slug: "liczniki-i-mierniki",
        name: "Liczniki i mierniki",
        tagline: "Multimetry, cęgi prądowe i liczniki energii",
        description:
            "Przyrządy pomiarowe dla instalatorów i służb utrzymania ruchu: multimetry True RMS, cęgi prądowe AC/DC, mierniki rezystancji izolacji oraz liczniki energii na szynę DIN z komunikacją Modbus.",
        match: ["Liczniki i mierniki", "Mierniki", "Liczniki"],
        image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=70&w=800",
        keywords: ["multimetr True RMS", "cęgi prądowe", "licznik energii DIN", "miernik cyfrowy"],
        highlights: [
            {
                title: "Pomiar True RMS",
                text: "Wiarygodny wynik również przy przebiegach odkształconych przez falowniki i zasilacze.",
            },
            {
                title: "Kategoria CAT III 600 V",
                text: "Bezpieczna praca przy rozdzielnicach i instalacjach stałych.",
            },
            {
                title: "Świadectwo wzorcowania",
                text: "Do wybranych modeli dostępny certyfikat kalibracji z akredytowanego laboratorium.",
            },
        ],
        buyingGuide: [
            "Do pomiarów w rozdzielnicy wybieraj przyrządy o kategorii bezpieczeństwa co najmniej CAT III.",
            "Cęgi z pomiarem DC (efekt Halla) są niezbędne przy fotowoltaice i instalacjach akumulatorowych.",
            "Funkcja NCV i test ciągłości z sygnałem dźwiękowym realnie przyspieszają codzienną diagnostykę.",
            "Licznik energii z wyjściem impulsowym lub Modbus RTU pozwala wpiąć pomiar w system nadzoru.",
            "Zwróć uwagę na klasę dokładności licznika — do rozliczeń podnajemców wymagana jest klasa 1 lub lepsza.",
        ],
        applications: [
            "Serwis i utrzymanie ruchu",
            "Pomiary odbiorcze",
            "Monitoring zużycia energii",
            "Diagnostyka PV",
        ],
        faq: [
            {
                question: "Czy licznik na szynę DIN nadaje się do rozliczeń z najemcą?",
                answer:
                    "Do rozliczeń wewnętrznych tak — wymagany jest licznik z legalizacją MID, który znajdziesz w opisie produktu jako parametr „legalizacja”.",
            },
            {
                question: "Multimetr czy cęgi prądowe?",
                answer:
                    "Cęgi mierzą prąd bez rozłączania obwodu, co jest szybsze i bezpieczniejsze. Multimetr daje z kolei pełniejszy zestaw funkcji pomiarowych napięcia, rezystancji i pojemności.",
            },
            {
                question: "Czy przyrządy mają świadectwo wzorcowania?",
                answer:
                    "Wybrane modele oferujemy z certyfikatem kalibracji. Wystarczy zaznaczyć taką opcję w uwagach do zamówienia — realizacja zajmuje 3–5 dni roboczych.",
            },
        ],
    },
    {
        slug: "agregaty",
        name: "Agregaty",
        tagline: "Agregaty prądotwórcze inwertorowe i budowlane",
        description:
            "Agregaty prądotwórcze do zasilania awaryjnego domu, warsztatu i placu budowy. Modele inwertorowe z czystą sinusoidą bezpieczną dla elektroniki oraz jednostki budowlane o wysokiej mocy z rozruchem elektrycznym i układem AVR.",
        match: ["Agregaty", "Agregat", "Agregaty prądotwórcze"],
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=70&w=800",
        keywords: [
            "agregat prądotwórczy",
            "agregat inwertorowy",
            "generator prądu",
            "zasilanie awaryjne",
        ],
        highlights: [
            {
                title: "Czysta sinusoida",
                text: "THD poniżej 3 % — bezpieczne zasilanie komputerów, pieców i sprzętu pomiarowego.",
            },
            {
                title: "Cicha praca",
                text: "Modele inwertorowe od 58 dB(A) z 7 m — dopuszczone także na kempingach.",
            },
            {
                title: "Serwis w 48 h",
                text: "Własny warsztat, oryginalne części i przeglądy gwarancyjne bez wysyłki do producenta.",
            },
        ],
        buyingGuide: [
            "Zsumuj moce odbiorników i dodaj zapas na rozruch silników — dla pomp i sprężarek nawet 3×.",
            "Do zasilania pieca CO i elektroniki wybierz wyłącznie agregat inwertorowy z czystą sinusoidą.",
            "Rozruch elektryczny i automatyka SZR mają sens tam, gdzie zaniki zasilania zdarzają się często.",
            "Sprawdź pojemność zbiornika i zużycie paliwa — decydują o czasie pracy bez tankowania.",
            "Do zasilania budynku niezbędne jest przełącznik sieć/agregat uniemożliwiający pracę równoległą z siecią.",
        ],
        applications: [
            "Zasilanie awaryjne domu",
            "Place budowy",
            "Imprezy plenerowe",
            "Kempingi i food trucki",
        ],
        faq: [
            {
                question: "Jaki agregat do zasilania domu z piecem gazowym?",
                answer:
                    "Minimum 2–3 kW w wersji inwertorowej. Piec z automatyką wymaga stabilnego napięcia i poprawnego rozdziału przewodu neutralnego — pomożemy dobrać zestaw z przełącznikiem faz.",
            },
            {
                question: "Czy agregat może pracować w garażu?",
                answer:
                    "Nie. Silniki spalinowe emitują tlenek węgla, dlatego agregat pracuje wyłącznie na zewnątrz, minimum kilka metrów od okien i czerpni powietrza.",
            },
            {
                question: "Jak często wymieniać olej?",
                answer:
                    "Pierwsza wymiana po 20 godzinach pracy (docieranie), kolejne co 100 godzin lub raz w sezonie — zależnie od tego, co nastąpi wcześniej.",
            },
        ],
    },
    {
        slug: "stacje-ladowania",
        name: "Stacje ładowania EV",
        tagline: "Wallboxy 7,4–22 kW z Typem 2 i pomiarem energii",
        description:
            "Naścienne stacje ładowania samochodów elektrycznych i hybryd plug-in. Wersje jedno- i trójfazowe z gniazdem lub kablem Typu 2, dynamicznym zarządzaniem mocą, aplikacją mobilną oraz wbudowanym zabezpieczeniem różnicowoprądowym DC 6 mA.",
        match: ["Stacje ładowania EV", "Stacje ładowania", "Wallbox", "Ładowarki EV"],
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=70&w=800",
        keywords: ["wallbox 22kW", "stacja ładowania EV", "ładowarka Typ 2", "ładowanie samochodu"],
        highlights: [
            {
                title: "Do 22 kW mocy",
                text: "Pełne naładowanie akumulatora nawet 8× szybciej niż z gniazda domowego 230 V.",
            },
            {
                title: "DLM w standardzie",
                text: "Dynamiczne zarządzanie mocą chroni przed przekroczeniem mocy przyłączeniowej budynku.",
            },
            {
                title: "IP54 i −30 °C",
                text: "Konstrukcja przystosowana do montażu na zewnątrz przez cały rok.",
            },
        ],
        buyingGuide: [
            "Sprawdź moc przyłączeniową budynku — 22 kW wymaga przyłącza trójfazowego i zwykle zwiększenia mocy umownej.",
            "Zweryfikuj ładowarkę pokładową auta: wiele modeli przyjmuje maksymalnie 11 kW AC, więc 22 kW nie przyspieszy ładowania.",
            "Wallbox z kablem jest wygodniejszy na co dzień, wersja z gniazdem — uniwersalna dla różnych pojazdów.",
            "Wymagane zabezpieczenie: wyłącznik nadprądowy oraz RCD typu A z detekcją prądu stałego 6 mA (często wbudowaną).",
            "Jeśli masz fotowoltaikę, wybierz model z trybem nadwyżek — auto ładuje się wtedy z darmowej energii.",
        ],
        applications: [
            "Garaże domowe",
            "Parkingi firmowe",
            "Wspólnoty mieszkaniowe",
            "Floty pojazdów",
        ],
        faq: [
            {
                question: "Czy montaż wallboxa wymaga zgłoszenia?",
                answer:
                    "Instalację powyżej 11 kW należy zgłosić do operatora sieci dystrybucyjnej. Instalator z uprawnieniami przygotuje dokumentację i protokół pomiarowy.",
            },
            {
                question: "Ile trwa ładowanie z 22 kW?",
                answer:
                    "Akumulator 60 kWh naładujesz od 20 do 80 % w około 1,5–2 godziny, o ile ładowarka pokładowa auta obsługuje pełne 22 kW AC.",
            },
            {
                question: "Czy stacja współpracuje z fotowoltaiką?",
                answer:
                    "Tak. Modele z licznikiem dwukierunkowym i trybem eco ładują wyłącznie nadwyżką produkcji, płynnie regulując prąd od 6 A wzwyż.",
            },
        ],
    },
    {
        slug: "akcesoria",
        name: "Akcesoria",
        tagline: "Osprzęt montażowy, złączki i narzędzia instalatora",
        description:
            "Wszystko, czego brakuje w koszyku tuż przed wyjazdem na budowę: złączki szybkozłączne, listwy zaciskowe, koryta i peszle, opaski, końcówki tulejkowe, oznaczniki oraz drobne narzędzia instalatorskie.",
        match: ["Akcesoria", "Osprzęt", "Akcesoria montażowe"],
        image: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=70&w=800",
        keywords: ["złączki elektryczne", "końcówki tulejkowe", "peszel", "osprzęt instalacyjny"],
        highlights: [
            {
                title: "Sprawdzone marki",
                text: "Osprzęt renomowanych producentów z pełną dokumentacją i atestami.",
            },
            {
                title: "Opakowania zbiorcze",
                text: "Zestawy warsztatowe i opakowania hurtowe w wyraźnie niższej cenie jednostkowej.",
            },
            {
                title: "Kompletacja zamówień",
                text: "Zbierz drobnicę w jednej przesyłce razem z transformatorem lub rozdzielnicą.",
            },
        ],
        buyingGuide: [
            "Do połączeń w puszkach używaj złączek szybkozłącznych — są szybsze i pewniejsze niż skręcanie żył.",
            "Linki zawsze zarabiaj końcówką tulejkową, inaczej zacisk poluzuje się po kilku cyklach termicznych.",
            "Peszel karbowany dobierz o średnicy zapewniającej 40 % wolnej przestrzeni na przyszłe przewody.",
            "Opisane oznaczniki żył skracają czas późniejszego serwisu nawet o połowę.",
            "Trzymaj w aucie zestaw najpopularniejszych rozmiarów — brak jednej złączki potrafi zatrzymać całą robotę.",
        ],
        applications: [
            "Prace instalacyjne",
            "Montaż rozdzielnic",
            "Serwis awaryjny",
            "Wyposażenie warsztatu",
        ],
        faq: [
            {
                question: "Czy wysyłacie drobnicę razem z dużym zamówieniem?",
                answer:
                    "Tak, kompletujemy całe zamówienie w jednej przesyłce. Jeśli część produktów ma dłuższy termin, możemy podzielić wysyłkę bez dodatkowych kosztów.",
            },
            {
                question: "Czy złączki są dopuszczone do instalacji stałych?",
                answer:
                    "Oferowane przez nas złączki spełniają normę PN-EN 60998 i są dopuszczone do połączeń w puszkach instalacyjnych oraz rozdzielnicach.",
            },
            {
                question: "Czy dostępne są opakowania zbiorcze?",
                answer:
                    "Większość drobnicy oferujemy zarówno w opakowaniach detalicznych, jak i w kartonach zbiorczych z rabatem ilościowym.",
            },
        ],
    },
];

/** Kategoria „awaryjna" tworzona dla wartości spoza taksonomii (np. nowa kategoria z backendu). */
export function buildFallbackCategory(name: string): CategoryDef {
    return {
        slug: slugify(name),
        name,
        tagline: "Sprawdź pełną ofertę w tej kategorii",
        description: `Produkty z kategorii ${name} dostępne w sklepie TRAFO ENERGIA. Wysyłka w 24 h, faktura VAT i wsparcie techniczne przed zakupem.`,
        match: [name],
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=70&w=800",
        keywords: [name.toLowerCase()],
        highlights: [
            {
                title: "Wysyłka w 24 h",
                text: "Zamówienia złożone do godziny 14:00 pakujemy tego samego dnia roboczego.",
            },
            {
                title: "Doradztwo techniczne",
                text: "Pomożemy dobrać właściwy produkt do Twojej instalacji.",
            },
            {
                title: "Gwarancja 24 miesiące",
                text: "Pełna obsługa gwarancyjna i pogwarancyjna po naszej stronie.",
            },
        ],
        buyingGuide: [],
        applications: [],
        faq: [],
    };
}

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
    const wanted = slug.toLowerCase();
    return CATEGORIES.find((c) => c.slug === wanted);
}

/** Dopasowuje kategorię produktu do definicji z taksonomii. */
export function categoryOf(product: Product): CategoryDef | undefined {
    const raw = product.category?.trim();
    if (!raw) return undefined;
    const normalized = normalizeText(raw);
    return CATEGORIES.find((c) =>
        c.match.some((m) => normalizeText(m) === normalized)
    );
}

/** Slug kategorii dla danego produktu (z fallbackiem na slug z nazwy). */
export function categorySlugOf(product: Product): string | null {
    const def = categoryOf(product);
    if (def) return def.slug;
    return product.category ? slugify(product.category) : null;
}

export function productsInCategory(products: Product[], category: CategoryDef): Product[] {
    const matches = category.match.map(normalizeText);
    return products.filter((p) => {
        const raw = p.category?.trim();
        if (!raw) return false;
        const normalized = normalizeText(raw);
        return matches.includes(normalized) || slugify(raw) === category.slug;
    });
}

/**
 * Zwraca definicję kategorii dla sluga — z taksonomii albo zbudowaną
 * na podstawie kategorii występujących w danych produktowych.
 */
export function resolveCategory(slug: string, products: Product[]): CategoryDef | null {
    const known = getCategoryBySlug(slug);
    if (known) return known;

    const fromData = products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c))
        .find((c) => slugify(c) === slug.toLowerCase());

    return fromData ? buildFallbackCategory(fromData) : null;
}

/** Wszystkie kategorie: z taksonomii + te wykryte w danych produktowych. */
export function allCategories(products: Product[]): CategoryDef[] {
    const extra = Array.from(
        new Set(
            products
                .map((p) => p.category?.trim())
                .filter((c): c is string => Boolean(c))
                .filter((c) => !CATEGORIES.some((def) => def.match.some((m) => normalizeText(m) === normalizeText(c))))
        )
    ).map(buildFallbackCategory);

    return [...CATEGORIES, ...extra];
}
