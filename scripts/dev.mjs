#!/usr/bin/env node
/**
 * Uruchamia jednocześnie:
 *   1. dev-backend  (atrapa API Spring Boot na :8080 — bez Javy/Mavena/Postgresa)
 *   2. frontend     (next dev na :3001)
 *
 * Dzięki temu panel /admin, koszyk i logowanie działają od razu — bez błędów
 * „Nie udało się pobrać statystyk/zamówień/użytkowników”, które pojawiają się,
 * gdy nic nie nasłuchuje na localhost:8080.
 *
 * Użycie:  npm run dev   (z katalogu głównego repo)
 * Wyjście: Ctrl+C zamyka oba procesy.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FRONTEND_DIR = path.join(ROOT, "frontend");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const children = [];

function start(name, command, args, cwd, color) {
    const child = spawn(command, args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
    });
    const prefix = (line) => `${color}[${name}]\x1b[0m ${line}`;
    const pipe = (stream, log) => {
        let buffer = "";
        stream.setEncoding("utf8");
        stream.on("data", (chunk) => {
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) log(prefix(line));
        });
        stream.on("end", () => buffer && log(prefix(buffer)));
    };
    pipe(child.stdout, (l) => process.stdout.write(l + "\n"));
    pipe(child.stderr, (l) => process.stderr.write(l + "\n"));
    child.on("exit", (code) => {
        console.log(`[${name}] zakończony (kod ${code})`);
    });
    children.push(child);
    return child;
}

function shutdown() {
    for (const child of children) {
        if (!child.killed) child.kill("SIGTERM");
    }
    // Dać dzieciom chwilę, potem wymusić
    setTimeout(() => {
        for (const child of children) {
            if (!child.killed) child.kill("SIGKILL");
        }
        process.exit(0);
    }, 2000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Ostrzeżenie, gdy frontend nie ma sekretu NextAuth (sesje admina go potrzebują).
const envLocal = path.join(FRONTEND_DIR, ".env.local");
const hasSecretInEnv = Boolean(process.env.NEXTAUTH_SECRET);
const hasSecretInFile = fs.existsSync(envLocal) && /^NEXTAUTH_SECRET=/m.test(fs.readFileSync(envLocal, "utf8"));
if (!hasSecretInEnv && !hasSecretInFile) {
    console.log(
        "\x1b[33m[dev]\x1b[0m NEXTAUTH_SECRET nie jest ustawiony — sesje logowania mogą nie działać poprawnie.\n" +
            "      Utwórz frontend/.env.local z linią:  NEXTAUTH_SECRET=<losowy ciąg, np. `openssl rand -base64 32`>\n"
    );
}

// 1. Atrapa backendu (port 8080)
start("backend-dev", process.execPath, [path.join(ROOT, "dev-backend", "server.mjs")], ROOT, "\x1b[36m");

// 2. Next.js (port 3001)
start("frontend", npmCommand, ["run", "dev"], FRONTEND_DIR, "\x1b[35m");

console.log(
    "\x1b[1m[dev]\x1b[0m Sklep:      http://localhost:3001\n" +
        "\x1b[1m[dev]\x1b[0m Panel:      http://localhost:3001/admin  (logowanie: admin@ebe-power.pl / admin123 — patrz logi backend-dev)\n" +
        "\x1b[1m[dev]\x1b[0m Atrapa API: http://localhost:8080\n"
);
