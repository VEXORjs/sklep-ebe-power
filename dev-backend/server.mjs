#!/usr/bin/env node
/**
 * dev-backend — atrapa backendu Spring Boot do developmentu frontendu.
 *
 * PO CO TO JEST?
 *   Panel administratora (i koszyk, i logowanie) potrzebują API pod http://localhost:8080.
 *   Prawdziwy backend wymaga JDK 21 + Maven + PostgreSQL, którego nie zawsze ma się
 *   pod ręką (np. sandbox / praca nad samym frontendem). Ten plik odtwarza kontrakt
 *   REST Spring Boota 1:1 (ścieżki, nazwy pól JSON, kody odpowiedzi) w czystym Node.js,
 *   BEZ żadnych zależności npm.
 *
 * CO DZIAŁA:
 *   - katalog produktów seedowany z backend/src/main/resources/data.sql (parser SQL wbudowany),
 *   - CRUD produktów (/api/products) — także images i parameters jak w ProductController,
 *   - statystyki i użytkownicy (/api/admin/**) oraz zamówienia (/api/orders/**),
 *   - logowanie /api/auth/login, /api/auth/admin-login (wymaga roli ADMIN),
 *     rejestracja /api/auth/register, synchronizacja OAuth /api/auth/oauth-success,
 *   - koszyk serwerowy (/api/cart) z tokenem "user{id}" dokładnie jak JwtService,
 *   - ochrona /api/admin i /api/orders identyczna jak AdminAuthFilter:
 *     bez NEXTAUTH_SECRET → ostrzeżenie + przepuszczenie (tryb dev Springa),
 *     z NEXTAUTH_SECRET → weryfikacja HS256 sesji NextAuth i wymóg role=ADMIN.
 *
 * CZEGO NIE ROBI:
 *   - Płatności Stripe: /api/payment/create-payment-intent zwraca 503 z wyraźnym
 *     komunikatem (atrapa nie zna kluczy Stripe i nie weryfikuje webhooków).
 *   - Wysyłki maili.
 *
 * DANE są w pamięci — restart czyści stan, dokładnie jak `ddl-auto=create` + data.sql
 * na deweloperskim Springu. NIE używaj tego w produkcji.
 *
 * Uruchomienie:  node dev-backend/server.mjs   (albo `npm run dev:backend` z roota)
 * Env:            PORT=8080, ADMIN_EMAIL, ADMIN_PASSWORD, NEXTAUTH_SECRET, DEV_SEED_DEMO=0
 */
import http from "node:http";
import { createHmac, createDecipheriv, hkdfSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET?.trim() || "";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@ebe-power.pl").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SEED_DEMO = process.env.DEV_SEED_DEMO !== "0";

/* ---------------------------------------------------------------------------
 * Parser backend/src/main/resources/data.sql (INSERT ... VALUES z '' escape)
 * ------------------------------------------------------------------------- */

function extractInsert(sql, table) {
    const re = new RegExp(`INSERT\\s+INTO\\s+${table}\\s*\\([^)]*\\)\\s*VALUES`, "i");
    const m = re.exec(sql);
    if (!m) return "";
    let depth = 0;
    let inStr = false;
    for (let i = m.index + m[0].length; i < sql.length; i++) {
        const c = sql[i];
        if (inStr) {
            if (c === "'") {
                if (sql[i + 1] === "'") i++;
                else inStr = false;
            }
            continue;
        }
        if (c === "'") inStr = true;
        else if (c === "(") depth++;
        else if (c === ")") depth--;
        else if (c === ";" && depth === 0) return sql.slice(m.index, i);
    }
    return sql.slice(m.index);
}

function splitTuples(valuesPart) {
    const tuples = [];
    let depth = 0, inStr = false, start = -1;
    for (let i = 0; i < valuesPart.length; i++) {
        const c = valuesPart[i];
        if (inStr) {
            if (c === "'") {
                if (valuesPart[i + 1] === "'") i++;
                else inStr = false;
            }
            continue;
        }
        if (c === "'") inStr = true;
        else if (c === "(") {
            if (depth === 0) start = i + 1;
            depth++;
        } else if (c === ")") {
            depth--;
            if (depth === 0) tuples.push(valuesPart.slice(start, i));
        }
    }
    return tuples;
}

function splitValues(tuple) {
    const out = [];
    let depth = 0, inStr = false, cur = "";
    for (let i = 0; i < tuple.length; i++) {
        const c = tuple[i];
        if (inStr) {
            cur += c;
            if (c === "'") {
                if (tuple[i + 1] === "'") { cur += "'"; i++; }
                else inStr = false;
            }
            continue;
        }
        if (c === "'") { inStr = true; cur += c; continue; }
        if (c === "(") depth++;
        if (c === ")") depth--;
        if (c === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
        cur += c;
    }
    if (cur.trim().length) out.push(cur.trim());
    return out;
}

function parseValue(raw) {
    if (/^NULL$/i.test(raw)) return null;
    if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
    if (raw.startsWith("'")) return raw.slice(1, -1).replace(/''/g, "'");
    return raw;
}

function parseInsert(sql, table) {
    const stmt = extractInsert(sql, table);
    if (!stmt) return [];
    const valuesIdx = stmt.toUpperCase().indexOf("VALUES");
    return splitTuples(stmt.slice(valuesIdx + 6)).map((t) => splitValues(t).map(parseValue));
}

/* ---------------------------------------------------------------------------
 * "Baza danych" w pamięci
 * ------------------------------------------------------------------------- */

let nextProductId = 1;
/** @type {Array<{id:number,name:string,price:number,oldPrice:number|null,stock:number|null,category:string,subcategory:string,sku:string,description:string,images:string[],parameters:Record<string,string>}>} */
let products = [];
let nextUserId = 1;
/** @type {Array<{id:number,name:string,email:string,password:string,role:string}>} hasła JAWNE — tylko dev! */
let users = [];
let nextOrderId = 1;
/** @type {Array<{id:number,customerEmail:string,amount:number,status:string,stripePaymentIntentId:string,createdAt:string,items:Array<{id:number,quantity:number,price:number,product:object}>}>} */
let orders = [];
let nextOrderItemId = 1;
/** @type {Map<string, Map<number, number>>} userId -> (productId -> quantity) */
const carts = new Map();

function seedFromDataSql() {
    const dataSqlPath = path.join(ROOT, "backend", "src", "main", "resources", "data.sql");
    if (!fs.existsSync(dataSqlPath)) {
        console.warn(`[dev-backend] UWAGA: nie znaleziono ${dataSqlPath} — katalog produktów będzie pusty.`);
        return;
    }
    const sql = fs.readFileSync(dataSqlPath, "utf8");

    // INSERT INTO products (name, price, old_price, stock, description, category, subcategory, sku)
    const paramRows = parseInsert(sql, "product_parameters"); // (product_id, key, value)
    const parametersByProduct = new Map();
    for (const [productId, key, value] of paramRows) {
        const map = parametersByProduct.get(productId) || new Map();
        map.set(key, value);
        parametersByProduct.set(productId, map);
    }

    products = parseInsert(sql, "products").map((r, i) => {
        const id = i + 1; // data.sql używa TRUNCATE ... RESTART IDENTITY → id od 1
        const params = parametersByProduct.get(id);
        return {
            id,
            name: r[0],
            price: r[1],
            oldPrice: r[2],
            stock: r[3],
            description: r[4],
            category: r[5],
            subcategory: r[6],
            sku: r[7],
            // data.sql celowo nie seeduje zdjęć (są w Supabase) — jak na prawdziwym backendzie
            images: [],
            parameters: params ? Object.fromEntries(params) : {},
        };
    });
    nextProductId = products.length + 1;
}

function seedUsers() {
    users = [
        { id: nextUserId++, name: "Administrator", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "ADMIN" },
    ];
    if (SEED_DEMO) {
        users.push(
            { id: nextUserId++, name: "Klient Demo", email: "klient@demo.pl", password: "klient123", role: "USER" },
            { id: nextUserId++, name: "Anna Kowalska", email: "anna@demo.pl", password: "anna1234", role: "USER" },
        );
    }
}

function isoDaysAgo(days, h = 12, m = 0) {
    const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    d.setHours(h, m, 0, 0);
    // Format jak Jackson dla LocalDateTime: ISO bez strefy
    return d.toISOString().slice(0, 19);
}

function demoOrder(customerEmail, status, daysAgo, lines) {
    const items = lines.map(([product, quantity]) => ({
        id: nextOrderItemId++,
        quantity,
        price: product.price,
        product: { ...product },
    }));
    const amount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    orders.push({
        id: nextOrderId++,
        customerEmail,
        amount: Math.round(amount * 100) / 100,
        status,
        stripePaymentIntentId: `pi_demo_${Math.random().toString(36).slice(2, 12)}`,
        createdAt: isoDaysAgo(daysAgo, 9 + (daysAgo % 8), (daysAgo * 17) % 60),
        items,
    });
}

function seedDemoOrders() {
    if (!SEED_DEMO || products.length === 0) return;
    const bySku = (sku) => products.find((p) => p.sku === sku) || products[0];
    demoOrder("klient@demo.pl", "COMPLETED", 12, [[bySku("PRM-P3500I"), 1]]);
    demoOrder("anna@demo.pl", "PAID", 4, [[bySku("CGM-6000SP"), 2], [bySku("PRM-E4000"), 1]]);
    demoOrder("klient@demo.pl", "PENDING", 1, [[bySku("PRM-GA13000"), 1]]);
    demoOrder("anna@demo.pl", "CANCELLED", 20, [[bySku("PRM-P3000I"), 1]]);
}

/* ---------------------------------------------------------------------------
 * Karta koszyka (CartDto jak w CartController)
 * ------------------------------------------------------------------------- */

function cartDto(userId) {
    const itemsMap = carts.get(String(userId)) || new Map();
    const items = [...itemsMap.entries()].map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return {
            productId,
            productName: product ? product.name : `(produkt #${productId} usunięty)`,
            productPrice: product ? product.price : 0,
            quantity,
            totalPrice: product ? Math.round(product.price * quantity * 100) / 100 : 0,
        };
    });
    const cartTotal = Math.round(items.reduce((s, it) => s + it.totalPrice, 0) * 100) / 100;
    return { userId: String(userId), items, cartTotal };
}

function getOrCreateCart(userId) {
    const key = String(userId);
    if (!carts.has(key)) carts.set(key, new Map());
    return carts.get(key);
}

/* ---------------------------------------------------------------------------
 * Tokeny — lustrzane odbicie JwtService
 * ------------------------------------------------------------------------- */

/** "user<id>" (bez kropki) przechodzi bez zmian; JWT HS256 dekodujemy przy NEXTAUTH_SECRET. */
function verifyTokenAndGetUserId(token) {
    if (!token) return null;
    if (!token.includes(".")) {
        const m = /^user(\d+)$/.exec(token);
        return m ? m[1] : null;
    }
    if (!NEXTAUTH_SECRET) return null;
    try {
        const payload = verifyNextAuthJwt(token);
        if (!payload || tokenExpired(payload)) return null;
        return String(payload.sub ?? payload.id ?? "") || null;
    } catch {
        return null;
    }
}

function base64urlDecode(s) {
    return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

/**
 * NextAuth v4 wystawia sesję DOMYŚLNIE jako JWE (alg=dir, enc=A256GCM) —
 * klucz wyprowadzany HKDF-SHA256 z NEXTAUTH_SECRET:
 *   hkdf(ikm=secret, salt="", info="NextAuth.js Generated Encryption Key", 32)
 * Obsługujemy JWE oraz klasyczne podpisane JWT (HS256/384/512) jako fallback.
 */
function verifyNextAuthJwt(token) {
    const parts = token.split(".");
    if (parts.length === 5) {
        let header;
        try {
            header = JSON.parse(base64urlDecode(parts[0]));
        } catch {
            return null;
        }
        if (header.alg !== "dir" || header.enc !== "A256GCM") return null;
        try {
            const key = Buffer.from(
                hkdfSync("sha256", Buffer.from(NEXTAUTH_SECRET, "utf8"), Buffer.from("", "utf8"), Buffer.from("NextAuth.js Generated Encryption Key", "utf8"), 32)
            );
            const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(parts[2], "base64url"));
            decipher.setAAD(Buffer.from(parts[0], "ascii"));
            decipher.setAuthTag(Buffer.from(parts[4], "base64url"));
            const plaintext = Buffer.concat([decipher.update(Buffer.from(parts[3], "base64url")), decipher.final()]).toString("utf8");
            return JSON.parse(plaintext);
        } catch {
            return null;
        }
    }
    if (parts.length === 3) {
        try {
            const header = JSON.parse(base64urlDecode(parts[0]));
            const alg = { HS256: "sha256", HS384: "sha384", HS512: "sha512" }[header.alg];
            if (!alg) return null;
            const expected = createHmac(alg, NEXTAUTH_SECRET).update(`${parts[0]}.${parts[1]}`).digest("base64url");
            if (expected !== parts[2]) return null;
            return JSON.parse(base64urlDecode(parts[1]));
        } catch {
            return null;
        }
    }
    return null;
}

/** Czy wygasł (tolerancja 15 s jak w next-auth jwtDecrypt)? */
function tokenExpired(payload) {
    return typeof payload.exp === "number" && payload.exp < Date.now() / 1000 - 15;
}

/* ---------------------------------------------------------------------------
 * Ochrona /api/admin i /api/orders — jak AdminAuthFilter (Spring Security)
 * ------------------------------------------------------------------------- */

let warnedMissingSecret = false;

function extractSessionToken(req) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    for (const part of cookies.split(";")) {
        const [name, ...rest] = part.trim().split("=");
        if (name === "next-auth.session-token" || name === "__Secure-next-auth.session-token") {
            return decodeURIComponent(rest.join("="));
        }
    }
    return null;
}

/** Zwraca Response|null — null = przepuść (autoryzacja OK albo tryb dev bez sekretu). */
function adminAuthGate(req) {
    if (!NEXTAUTH_SECRET) {
        if (!warnedMissingSecret) {
            warnedMissingSecret = true;
            console.warn(
                "[dev-backend] NEXTAUTH_SECRET nieustawione — ochrona /api/admin i /api/orders NIEAKTYWNA " +
                    "(identycznie jak na Springu bez sekretu). Ustaw NEXTAUTH_SECRET, aby wymusić rolę ADMIN."
            );
        }
        return null;
    }
    const token = extractSessionToken(req);
    const payload = token ? verifyNextAuthJwt(token) : null;
    if (!payload || tokenExpired(payload)) return json(401, { error: "admin_unauthorized", message: "Brak aktywnej sesji administratora." });
    if (payload.role !== "ADMIN") return json(403, { error: "admin_forbidden", message: "To konto nie ma uprawnień administratora." });
    return null;
}

/* ---------------------------------------------------------------------------
 * Serwer
 * ------------------------------------------------------------------------- */

function json(status, body, extraHeaders = {}) {
    const payload = typeof body === "string" ? body : JSON.stringify(body);
    return new Response(payload === undefined ? null : payload, {
        status,
        headers: {
            "Content-Type": typeof body === "string" ? "text/plain; charset=UTF-8" : "application/json",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            ...extraHeaders,
        },
    });
}

const ORDER_STATUSES = ["PENDING", "PAID", "PAID_OUT_OF_STOCK", "COMPLETED", "CANCELLED"];

function publicUser(u) {
    // User ma @JsonIgnore na password — nigdy nie zwracamy hasła
    const { password, ...rest } = u;
    void password;
    return rest;
}

function productFromBody(body, existing) {
    const b = body || {};
    const p = existing ? { ...existing } : { id: nextProductId, images: [], parameters: {} };
    p.name = b.name ?? p.name;
    p.price = b.price ?? p.price;
    p.oldPrice = b.oldPrice ?? null;
    if (b.stock !== undefined && b.stock !== null) p.stock = b.stock;
    p.category = b.category ?? p.category ?? null;
    p.subcategory = b.subcategory ?? p.subcategory ?? null;
    p.sku = b.sku ?? p.sku ?? null;
    p.description = b.description ?? p.description ?? null;
    // images ustawiamy zawsze (jak ProductController), parameters tylko gdy przesłane
    p.images = Array.isArray(b.images) ? b.images : [];
    if (b.parameters && typeof b.parameters === "object") p.parameters = b.parameters;
    return p;
}

function spring404(req) {
    return json(404, { timestamp: new Date().toISOString(), status: 404, error: "Not Found", path: req.url.split("?")[0] });
}

async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (!chunks.length) return {};
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return null;
    }
}

async function handle(req) {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const method = req.method.toUpperCase();

    if (method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Max-Age": "86400" } });

    // --- Diagnostyka ---
    if (pathname === "/" || pathname === "/api" || pathname === "/actuator/health") {
        return json(200, {
            ok: true,
            service: "ebe-power-dev-backend",
            hint: "Atrapa API Spring Boot do developmentu frontendu (bez Javy). NIE używać na produkcji.",
            products: products.length,
            users: users.length,
            orders: orders.length,
            nextauthGuard: NEXTAUTH_SECRET ? "ACTIVE (role=ADMIN wymagana)" : "INACTIVE (ustaw NEXTAUTH_SECRET)",
        });
    }

    // --- Produkty ---
    if (pathname === "/api/products" && method === "GET") return json(200, products);

    let m = /^\/api\/products\/(\d+)$/.exec(pathname);
    if (m) {
        const id = Number(m[1]);
        const product = products.find((p) => p.id === id);
        if (method === "GET") return product ? json(200, product) : spring404(req);
        if (method === "PUT") {
            if (!product) return spring404(req);
            const body = await readJsonBody(req);
            if (body === null) return json(400, { error: "Nieprawidłowy JSON" });
            Object.assign(product, productFromBody(body, product));
            return json(200, product);
        }
        if (method === "DELETE") {
            if (!product) return spring404(req);
            products = products.filter((p) => p.id !== id);
            carts.forEach((items) => items.delete(id));
            return new Response(null, { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }
    if (pathname === "/api/products" && method === "POST") {
        const body = await readJsonBody(req);
        if (body === null) return json(400, { error: "Nieprawidłowy JSON" });
        if (!body.name || body.price === undefined || body.price === null) {
            return json(400, { error: "Produkt wymaga nazwy (name) i ceny (price)" });
        }
        const product = productFromBody(body, null);
        nextProductId++;
        products.push(product);
        return json(200, product);
    }

    // --- Panel: statystyki / użytkownicy (ochrona jak AdminAuthFilter) ---
    if (pathname.startsWith("/api/admin")) {
        const gate = adminAuthGate(req);
        if (gate) return gate;

        if (pathname === "/api/admin/stats" && method === "GET") {
            const totalProducts = products.length;
            const outOfStock = products.filter((p) => p.stock === null || p.stock <= 0).length;
            const lowStock = products.filter((p) => p.stock !== null && p.stock > 0 && p.stock <= 5).length;
            const count = (s) => orders.filter((o) => o.status === s).length;
            const totalRevenue = orders
                .filter((o) => o.status === "PAID" || o.status === "COMPLETED" || o.status === "PAID_OUT_OF_STOCK")
                .reduce((s, o) => s + (o.amount || 0), 0);
            const lowStockProducts = products
                .filter((p) => p.stock !== null && p.stock <= 5)
                .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
                .slice(0, 10);
            return json(200, {
                totalProducts,
                inStock: totalProducts - outOfStock,
                lowStock,
                outOfStock,
                totalOrders: orders.length,
                pendingOrders: count("PENDING"),
                paidOrders: count("PAID"),
                paidOutOfStockOrders: count("PAID_OUT_OF_STOCK"),
                completedOrders: count("COMPLETED"),
                cancelledOrders: count("CANCELLED"),
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalUsers: users.length,
                lowStockProducts,
            });
        }

        if (pathname === "/api/admin/users" && method === "GET") return json(200, users.map(publicUser));

        m = /^\/api\/admin\/users\/(\d+)$/.exec(pathname);
        if (m && method === "DELETE") {
            const id = Number(m[1]);
            if (!users.some((u) => u.id === id)) return spring404(req);
            users = users.filter((u) => u.id !== id);
            return new Response(null, { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }

    // --- Zamówienia (ochrona jak AdminAuthFilter) ---
    if (pathname.startsWith("/api/orders")) {
        const gate = adminAuthGate(req);
        if (gate) return gate;

        if (pathname === "/api/orders" && method === "GET") return json(200, orders);

        m = /^\/api\/orders\/(\d+)$/.exec(pathname);
        if (m) {
            const id = Number(m[1]);
            const order = orders.find((o) => o.id === id);
            if (method === "GET") return order ? json(200, order) : spring404(req);
            if (method === "DELETE") {
                if (!order) return spring404(req);
                orders = orders.filter((o) => o.id !== id);
                return new Response(null, { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
            }
        }

        m = /^\/api\/orders\/(\d+)\/status$/.exec(pathname);
        if (m && method === "PUT") {
            const order = orders.find((o) => o.id === Number(m[1]));
            const body = await readJsonBody(req);
            const status = body?.status;
            if (!status) return json(400, { error: "Brak statusu" });
            if (!ORDER_STATUSES.includes(String(status).toUpperCase())) {
                return json(400, { error: `Nieprawidłowy status: ${status}` });
            }
            if (!order) return spring404(req);
            order.status = String(status).toUpperCase();
            return json(200, order);
        }
    }

    // --- Uwierzytelnianie ---
    if (pathname.startsWith("/api/auth")) {
        if (method !== "POST") return spring404(req);
        const body = await readJsonBody(req);
        if (body === null) return json(400, { error: "Nieprawidłowy JSON" });

        if (pathname === "/api/auth/login" || pathname === "/api/auth/admin-login") {
            const user = users.find(
                (u) => u.email.toLowerCase() === String(body.email || "").trim().toLowerCase() && u.password === body.password
            );
            if (!user) return json(401, "Nieprawidłowy email lub hasło");
            if (pathname === "/api/auth/admin-login" && user.role !== "ADMIN") {
                return json(403, "To konto nie ma uprawnień administratora");
            }
            return json(200, {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                mockToken: `user${user.id}`,
            });
        }

        if (pathname === "/api/auth/register") {
            const email = String(body.email || "").trim().toLowerCase();
            if (!email || !body.password || !body.name) return json(400, "Nieprawidłowe dane rejestracji");
            if (users.some((u) => u.email.toLowerCase() === email)) return json(409, "Email jest już zajęty");
            users.push({ id: nextUserId++, name: body.name, email, password: body.password, role: "USER" });
            return json(200, "Udało się zarejestrować");
        }

        if (pathname === "/api/auth/oauth-success") {
            const email = String(body.email || "").trim().toLowerCase();
            let user = users.find((u) => u.email.toLowerCase() === email);
            if (!user) {
                user = { id: nextUserId++, name: body.name || email, email, password: `oauth-${Date.now()}`, role: "USER" };
                users.push(user);
            }
            return json(200, { id: user.id, email: user.email, mockToken: `user${user.id}`, message: "Synchronizacja OAuth zakończona pomyślnie" });
        }
    }

    // --- Koszyk ---
    if (pathname === "/api/cart" && method === "GET") {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return json(200, { items: [], totalItems: 0, isGuest: true });
        }
        const userId = verifyTokenAndGetUserId(auth.slice(7));
        if (!userId) return json(401, "Token wygasł lub jest nieprawidłowy");
        return json(200, cartDto(userId));
    }

    m = /^\/api\/cart\/([^/]+)\/add$/.exec(pathname);
    if (m && method === "POST") {
        const productId = Number(url.searchParams.get("productId"));
        const quantity = Number(url.searchParams.get("quantity") || 1);
        const product = products.find((p) => p.id === productId);
        if (!product) return json(404, { error: "Produkt nie został znaleziony" });
        const cart = getOrCreateCart(m[1]);
        cart.set(productId, (cart.get(productId) || 0) + (quantity || 1));
        return json(200, cartDto(m[1]));
    }

    m = /^\/api\/cart\/([^/]+)\/remove\/(\d+)$/.exec(pathname);
    if (m && method === "DELETE") {
        const cart = getOrCreateCart(m[1]);
        cart.delete(Number(m[2]));
        return json(200, cartDto(m[1]));
    }

    m = /^\/api\/cart\/([^/]+)\/item\/(\d+)$/.exec(pathname);
    if (m && method === "PATCH") {
        const productId = Number(m[2]);
        const quantity = Number(url.searchParams.get("quantity"));
        const cart = getOrCreateCart(m[1]);
        if (quantity <= 0) {
            cart.delete(productId);
        } else if (!cart.has(productId)) {
            const product = products.find((p) => p.id === productId);
            if (!product) return json(404, { error: "Produkt nie został znaleziony" });
            cart.set(productId, quantity);
        } else {
            cart.set(productId, quantity);
        }
        return json(200, cartDto(m[1]));
    }

    m = /^\/api\/cart\/([^/]+)\/clear$/.exec(pathname);
    if (m && method === "DELETE") {
        carts.set(m[1], new Map());
        return json(200, cartDto(m[1]));
    }

    // --- Płatności (atrapa) ---
    if (pathname === "/api/payment/create-payment-intent" && method === "POST") {
        return json(503, {
            error: "Dev backend: Stripe nie jest skonfigurowany w atrapie (to środowisko frontendowe). Płatności testuj na prawdziwym backendzie Spring Boot.",
        });
    }
    if (pathname.startsWith("/api/payment/") && method === "POST") {
        return json(503, { error: "Dev backend: endpoint płatności/pocztowy nie jest dostępny w atrapie." });
    }

    // --- Kontakt (jeśli frontend kiedyś doda) ---
    if (pathname === "/api/contact" && method === "POST") {
        return json(200, { ok: true, message: "Dev backend: wiadomość przyjęta (atrapa — nic nie zostanie wysłane)." });
    }

    return spring404(req);
}

const server = http.createServer(async (req, res) => {
    try {
        const response = await handle(req);
        const headers = Object.fromEntries(response.headers.entries());
        res.writeHead(response.status, headers);
        if (response.body) {
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
            }
        }
        res.end();
    } catch (err) {
        console.error("[dev-backend] Błąd obsługi żądania:", req.method, req.url, err);
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ error: "Internal Server Error (dev-backend)", message: String(err?.message || err) }));
    }
});

seedFromDataSql();
seedUsers();
seedDemoOrders();

server.listen(PORT, HOST, () => {
    console.log("──────────────────────────────────────────────────────────────────────");
    console.log("  ebe power — DEV BACKEND (atrapa Spring Boot, bez Javy)");
    console.log(`  http://${HOST}:${PORT}   (frontend i tak woła /api/backend → localhost:8080)`);
    console.log(`  Produkty: ${products.length} (seed z backend/src/main/resources/data.sql)`);
    console.log(`  Konta: ${users.map((u) => `${u.email} [${u.role}]`).join(", ")}`);
    console.log(`  Zamówienia demo: ${orders.length} (DEV_SEED_DEMO=0 wyłącza)`);
    console.log(`  Ochrona /api/admin: ${NEXTAUTH_SECRET ? "AKTYWNA (NEXTAUTH_SECRET ustawiony)" : "WYŁĄCZONA — jak na Springu bez sekretu"}`);
    if (!process.env.ADMIN_PASSWORD) {
        console.log("  ⚠ Hasło administratora to deweloperskie domyślne „admin123” — tylko do lokalnej pracy!");
    }
    console.log("  ⚠ Dane trzymam w pamięci — restart czyści stan. NIE używać na produkcji.");
    console.log("──────────────────────────────────────────────────────────────────────");
});
