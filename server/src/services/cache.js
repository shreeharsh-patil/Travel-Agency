import { config } from '../config.js';

/**
 * Lightweight in-memory cache with TTL. A Map keyed by query string.
 * Swap for Redis later without touching call sites.
 */

const memory = new Map();
const ttlMs = config.search.cacheTtlSeconds * 1000;

export async function cacheGet(key) {
    const hit = memory.get(key);
    if (hit && hit.expiresAt > Date.now()) {
        hit.lastAccess = Date.now();
        return hit.value;
    }
    memory.delete(key);
    return null;
}

export async function cacheSet(key, value) {
    memory.set(key, { value, expiresAt: Date.now() + ttlMs, lastAccess: Date.now() });
}

export async function cacheDeletePrefix(prefix) {
    for (const key of memory.keys()) {
        if (key.startsWith(prefix)) memory.delete(key);
    }
}

/** Best-effort eviction of expired entries — call periodically. */
export async function sweepCache() {
    const now = Date.now();
    for (const [key, entry] of memory) {
        if (entry.expiresAt <= now) memory.delete(key);
    }
}
