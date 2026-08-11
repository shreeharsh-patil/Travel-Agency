import { config } from '../config.js';

/**
 * Best-effort enrichment from OPEN, free sources (Wikipedia / Wikimedia Commons).
 * - Never invents data: only fills fields that are still NULL.
 * - Only used when a place already carries a wikipedia or wikidata tag from OSM.
 * - Every request is wrapped in a timeout; failures are silent (enrichment is optional).
 */

const WIKIPEDIA_REST = 'https://en.wikipedia.org/api/rest_v1/page/summary';

function wikiTitle(place) {
    if (place.wikipedia) {
        // Formats: "en:Taj Mahal" or "Taj Mahal"
        const idx = place.wikipedia.indexOf(':');
        return idx >= 0 ? place.wikipedia.slice(idx + 1) : place.wikipedia;
    }
    if (place.wikidata) {
        return null; // wikidata-only → resolve via the wikidata API below
    }
    return null;
}

async function fetchJson(url, headers = {}) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), config.enrichment.timeoutMs);
    try {
        const r = await fetch(url, {
            headers: { 'User-Agent': config.enrichment.userAgent, ...headers },
            signal: controller.signal
        });
        if (!r.ok) return null;
        return await r.json();
    } catch {
        return null;
    } finally {
        clearTimeout(t);
    }
}

/**
 * enrichPlace(place) → { description?, images[] }
 */
export async function enrichPlace(place) {
    if (!config.enrichment.enabled) return { description: null, images: [] };

    let description = null;
    let thumbnail = null;
    const title = wikiTitle(place);

    if (title) {
        const summary = await fetchJson(`${WIKIPEDIA_REST}/${encodeURIComponent(title.replace(/ /g, '_'))}`);
        if (summary) {
            // "extract" is the plain-text intro. Only use the first ~2 sentences.
            if (summary.extract && !place.description) {
                description = summary.extract.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
            }
            thumbnail = summary.thumbnail?.source || null;
        }
    } else if (place.wikidata) {
        // Resolve wikidata entity → en.wikipedia title
        const entity = await fetchJson(
            `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(place.wikidata)}&props=sitelinks&sitefilter=enwiki&format=json`
        );
        const siteLink = entity?.entities?.[place.wikidata]?.sitelinks?.enwiki?.title;
        if (siteLink) {
            const summary = await fetchJson(`${WIKIPEDIA_REST}/${encodeURIComponent(siteLink.replace(/ /g, '_'))}`);
            if (summary?.extract && !place.description) {
                description = summary.extract.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
            }
            thumbnail = summary?.thumbnail?.source || null;
        }
    }

    const images = thumbnail ? [{ url: thumbnail, source: 'Wikimedia Commons', credit: 'Wikimedia Commons' }] : [];
    return { description, images };
}
