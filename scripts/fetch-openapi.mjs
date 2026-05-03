#!/usr/bin/env node
// Fetches openapi.json from the configured backend and writes it to repo root.
// Reads VITE_BACKEND_URL from .env.development if present, falling back to
// http://localhost:8000.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotenv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
  return out;
}

const env = { ...loadDotenv(resolve(".env.development")), ...process.env };
const backend = env.VITE_BACKEND_URL ?? "http://localhost:8000";
const url = `${backend.replace(/\/$/, "")}/api/openapi.json`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const body = await res.text();
writeFileSync(resolve("openapi.json"), body);
console.log(`Wrote openapi.json from ${url} (${body.length} bytes)`);
