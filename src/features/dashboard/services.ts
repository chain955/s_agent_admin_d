import type { DashboardHealth, ServiceId, ServiceTone } from "./types";

// Candidate keys per service, ordered by preference. The first key that
// appears in `health.checks` wins. Matching is case-insensitive.
const SERVICE_KEY_CANDIDATES: Record<ServiceId, readonly string[]> = {
  postgres: ["postgres", "postgresql", "db", "database"],
  redis: ["redis", "cache"],
  llm: ["llm", "llm_backend", "ollama", "vllm"],
  embeddings: ["embeddings", "embeddings_backend", "embedding"],
};

export function resolveCheck(
  health: DashboardHealth | undefined,
  service: ServiceId,
): { value: string; tone: ServiceTone } {
  if (!health) return { value: "", tone: "unknown" };
  const checks = health.checks ?? {};
  const lookup = new Map<string, string>(
    Object.entries(checks).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const candidate of SERVICE_KEY_CANDIDATES[service]) {
    const hit = lookup.get(candidate);
    if (hit !== undefined) return { value: hit, tone: toneOf(hit) };
  }
  return { value: "", tone: "unknown" };
}

export function toneOf(value: string): ServiceTone {
  const v = value.trim().toLowerCase();
  if (v === "ok" || v === "up" || v === "ready" || v === "healthy") return "ok";
  if (v === "degraded" || v === "warn" || v === "warning" || v === "slow") return "degraded";
  if (v === "down" || v === "fail" || v === "failed" || v === "error" || v === "unhealthy")
    return "down";
  if (!v) return "unknown";
  // Any other non-empty value is treated as degraded so a misspelling does
  // not paint a healthy probe red. Tests assert on the canonical vocabulary.
  return "degraded";
}
