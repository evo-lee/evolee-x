interface RateLimitWindow {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitConfig {
  burst: RateLimitWindow;
  sustained: RateLimitWindow;
  daily: RateLimitWindow;
}

interface ClientRecord {
  timestamps: number[];
  lastCleanup: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  burst: { maxRequests: 3, windowMs: 10_000 },
  sustained: { maxRequests: 20, windowMs: 60_000 },
  daily: { maxRequests: 100, windowMs: 86_400_000 },
};

const clients = new Map<string, ClientRecord>();

const CLEANUP_INTERVAL_MS = 300_000;
let lastGlobalCleanup = Date.now();

function pruneStaleClients(now: number) {
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) return;
  lastGlobalCleanup = now;

  const cutoff = now - DEFAULT_CONFIG.daily.windowMs;
  for (const [ip, record] of clients) {
    if (record.timestamps.length === 0 || record.timestamps[record.timestamps.length - 1] < cutoff) {
      clients.delete(ip);
    }
  }
}

export function getClientIP(req: Request): string {
  const cfIP = req.headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const real = req.headers.get("x-real-ip");
  if (real) return real;

  return "unknown";
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  limit: number;
  remaining: number;
  resetMs: number;
  triggeredBy: "burst" | "sustained" | "daily" | null;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): RateLimitResult {
  const now = Date.now();

  pruneStaleClients(now);

  let record = clients.get(ip);
  if (!record) {
    record = { timestamps: [], lastCleanup: now };
    clients.set(ip, record);
  }

  if (now - record.lastCleanup > 60_000) {
    const cutoff = now - config.daily.windowMs;
    record.timestamps = record.timestamps.filter((t) => t > cutoff);
    record.lastCleanup = now;
  }

  const windows: Array<{ name: "burst" | "sustained" | "daily"; config: RateLimitWindow }> = [
    { name: "burst", config: config.burst },
    { name: "sustained", config: config.sustained },
    { name: "daily", config: config.daily },
  ];

  for (const w of windows) {
    const windowStart = now - w.config.windowMs;
    const count = record.timestamps.filter((t) => t > windowStart).length;

    if (count >= w.config.maxRequests) {
      const oldestInWindow = record.timestamps.find((t) => t > windowStart) ?? now;
      const retryAfterMs = oldestInWindow + w.config.windowMs - now;

      return {
        allowed: false,
        retryAfterMs: Math.max(retryAfterMs, 1000),
        limit: w.config.maxRequests,
        remaining: 0,
        resetMs: retryAfterMs,
        triggeredBy: w.name,
      };
    }
  }

  record.timestamps.push(now);

  const sustainedStart = now - config.sustained.windowMs;
  const sustainedCount = record.timestamps.filter((t) => t > sustainedStart).length;

  return {
    allowed: true,
    retryAfterMs: 0,
    limit: config.sustained.maxRequests,
    remaining: config.sustained.maxRequests - sustainedCount,
    resetMs: config.sustained.windowMs,
    triggeredBy: null,
  };
}

const RATE_LIMIT_MESSAGES: Record<string, string> = {
  burst: "请求太频繁，请稍后再试",
  sustained: "请求次数过多，请一分钟后再试",
  daily: "今日对话次数已达上限，请明天再来",
};

export function rateLimitResponse(result: RateLimitResult): Response {
  const message = RATE_LIMIT_MESSAGES[result.triggeredBy ?? "burst"];
  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);

  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    },
  );
}
