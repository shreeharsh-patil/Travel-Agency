import { useEffect, useState, useRef, useCallback } from 'react';

const PRIORITY_COUNT = 12; // frames loaded before the loading screen clears
const AHEAD_WINDOW = 45;   // frames preloaded ahead of the current scroll position
const BEHIND_WINDOW = 8;   // frames kept available behind (scrubbing back up)
const MAX_CONCURRENT = 6;  // parallel image downloads
const LOAD_TIMEOUT_MS = 6000; // never block the site behind the frame loader

/**
 * Canvas-frame scrubber with lazy, scroll-following preload.
 *
 * Instead of downloading all 278 hero frames on page load, we load a small
 * priority window immediately (so the hero paints fast) and then stream the
 * remaining frames just ahead of the current scroll position. If the exact
 * frame isn't ready yet, the nearest already-loaded frame is drawn instead,
 * so the scrub never shows a blank canvas.
 */
export function useCanvasVideo(canvasRef, frameCount = 278) {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Mutable loader state lives in refs so the callbacks stay stable and
    // there are no circular useCallback references.
    const stateRef = useRef({
        images: new Array(frameCount).fill(null),
        failed: new Set(),
        queued: new Set(),
        queue: [],
        inFlight: 0,
        loadedCount: 0,
        framePath: (index) =>
            `/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`,
    });

    const pumpRef = useRef(null);
    const drawRef = useRef(null);
    const lastTargetRef = useRef(0);

    // Drain the queue in small concurrent batches.
    const drain = () => {
        const s = stateRef.current;
        while (s.inFlight < MAX_CONCURRENT && s.queue.length > 0) {
            const idx = s.queue.shift();
            s.queued.delete(idx);
            if (s.images[idx] || s.failed.has(idx)) continue;

            const img = new Image();
            img.decoding = 'async';
            s.images[idx] = img;
            s.inFlight += 1;

            img.onload = () => {
                s.inFlight -= 1;
                s.loadedCount += 1;
                if (s.loadedCount >= PRIORITY_COUNT) setIsLoading(false);
                setProgress(
                    Math.round((Math.min(s.loadedCount, PRIORITY_COUNT) / PRIORITY_COUNT) * 100)
                );

                // If the loading overlay was dismissed early (timeout) before
                // any frame arrived, paint the canvas as soon as the first
                // frame finishes loading so the hero is never left black.
                if (s.loadedCount === 1 && drawRef.current) {
                    drawRef.current(lastTargetRef.current);
                }
                pumpRef.current && pumpRef.current();
            };
            img.onerror = () => {
                s.inFlight -= 1;
                s.failed.add(idx);
                s.images[idx] = null;
                pumpRef.current && pumpRef.current();
            };
            img.src = s.framePath(idx);
        }
    };

    // Refs must not be written during render — assign after mount instead.
    useEffect(() => {
        pumpRef.current = drain;
    });

    // Queue a scroll window around the requested frame, then start downloading.
    const enqueue = useCallback(
        (index) => {
            const s = stateRef.current;
            const clamped = Math.min(frameCount - 1, Math.max(0, Math.round(index || 0)));
            const from = Math.max(0, clamped - BEHIND_WINDOW);
            const to = Math.min(frameCount - 1, clamped + AHEAD_WINDOW);
            for (let i = from; i <= to; i++) {
                if (s.images[i] || s.failed.has(i) || s.queued.has(i)) continue;
                s.queued.add(i);
                s.queue.push(i);
            }
            pumpRef.current && pumpRef.current();
        },
        [frameCount]
    );

    // Start the initial priority window immediately (covers the first scroll beats).
    // The pump-assignment effect above runs first, so the drain is ready.
    useEffect(() => {
        enqueue(0);
        enqueue(PRIORITY_COUNT);
    }, [enqueue]);

    // Safety net: hide the loading overlay even if frames never arrive,
    // so the rest of the site is never blocked.
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), LOAD_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, []);

    const drawFrame = useCallback(
        (index) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const context = canvas.getContext('2d', {
                alpha: false,
                colorSpace: 'display-p3',
            });
            if (!context) return;

            // High-DPI support.
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                context.scale(dpr, dpr);
            }

            const width = rect.width;
            const height = rect.height;

            const target = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
            lastTargetRef.current = target;
            enqueue(target);

            const s = stateRef.current;

            // Draw the requested frame if ready; otherwise the nearest loaded one behind it.
            let img = s.images[target];
            if (!img || !img.complete || img.naturalWidth === 0) {
                img = null;
                for (let i = target; i >= 0; i--) {
                    const candidate = s.images[i];
                    if (candidate && candidate.complete && candidate.naturalWidth > 0) {
                        img = candidate;
                        break;
                    }
                }
            }
            if (!img) return;

            // Object-fit: cover.
            const vW = img.naturalWidth;
            const vH = img.naturalHeight;
            const rW = width / vW;
            const rH = height / vH;
            const ratio = Math.max(rW, rH);
            const newW = vW * ratio;
            const newH = vH * ratio;
            const x = (width - newW) / 2;
            const y = (height - newH) / 2;

            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            context.clearRect(0, 0, width, height);
            context.drawImage(img, x, y, newW, newH);
        },
        [canvasRef, frameCount, enqueue]
    );

    useEffect(() => {
        drawRef.current = drawFrame;
    });

    return { progress, isLoading, drawFrame };
}
