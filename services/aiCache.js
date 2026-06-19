const cache = new Map();

const TTL_MS = Number(process.env.AI_CACHE_TTL_MS || 30 * 60 * 1000); // default 30 minutes

export const getCachedReport = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

export const setCachedReport = (key, value) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + TTL_MS,
  });
};

