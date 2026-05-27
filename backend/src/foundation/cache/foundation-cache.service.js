const foundationCacheStore = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

function normalizeCacheKeyPart(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized !== "" ? normalized : null;
}

function normalizeTtl(ttlMs) {
  return Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_TTL_MS;
}

function readCacheEntry(cacheKey) {
  const entry = foundationCacheStore.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (entry.expires_at <= Date.now()) {
    foundationCacheStore.delete(cacheKey);
    return null;
  }

  return entry;
}

export function buildFoundationCacheKey(...parts) {
  const normalizedParts = parts
    .map(normalizeCacheKeyPart)
    .filter(Boolean);

  return normalizedParts.join(":");
}

export function getCachedValue(cacheKey) {
  const entry = readCacheEntry(cacheKey);
  return entry ? entry.value : null;
}

export function setCachedValue(cacheKey, value, options = {}) {
  foundationCacheStore.set(cacheKey, {
    value,
    expires_at: Date.now() + normalizeTtl(options.ttlMs)
  });

  return value;
}

export function deleteCachedValue(cacheKey) {
  return foundationCacheStore.delete(cacheKey);
}

export function clearFoundationCache() {
  foundationCacheStore.clear();
}

export async function getOrSetCachedValue(cacheKey, factory, options = {}) {
  const entry = readCacheEntry(cacheKey);

  if (entry) {
    return entry.value;
  }

  const nextValue = await factory();
  return setCachedValue(cacheKey, nextValue, options);
}
