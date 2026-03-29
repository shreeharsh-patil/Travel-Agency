import { useEffect, useState, useRef } from 'react';

export function useCanvasVideo(canvasRef, frameCount = 278) {
    const [images, setImages] = useState([]);
    const [loadedCount, setLoadedCount] = useState(0);

    // Constants for correct path resolution
    // Vite serves public/ folder at root
    const imageFolder = "/frames/";
    const imagePrefix = "ezgif-frame-";
    const imageExtension = ".jpg";

    // We use a ref to store images to avoid re-renders on every load
    const savedImages = useRef([]);

    // Preload images on mount
    useEffect(() => {
        const loadedImages = [];
        let loadCounter = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            // Pad numbers to 3 digits (001, 002, etc.)
            const padNumber = (num) => num.toString().padStart(3, '0');
            const filename = `${imagePrefix}${padNumber(i)}${imageExtension}`;
            img.src = `${imageFolder}${filename}`;

            img.onload = () => {
                loadCounter++;
                setLoadedCount(loadCounter);
            };

            savedImages.current[i - 1] = img; // Store in order
            loadedImages.push(img);
        }

        // Sort logic not strictly needed if we access by index, but good for array state
        // We use a ref for immediate access in the loop anyway
    }, [frameCount]);

    // Draw function
    const drawFrame = (index) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', {
            alpha: false,
            colorSpace: 'display-p3'
        });
        if (!context) return;

        // High-DPI Support
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Only potential resize if dimensions mismatch to avoid clearing unnecessarily if we handle it elsewhere
        // But for a simple approach, we enforce it here or ensures it matches
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            context.scale(dpr, dpr);
        }

        // Logical width/height for calculations (CSS pixels)
        const width = rect.width;
        const height = rect.height;

        const imgIndex = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
        const img = savedImages.current[imgIndex];

        if (!img || !img.complete || img.naturalWidth === 0) return;

        // Object Fit: Cover Logic
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
    };

    return {
        progress: (loadedCount / frameCount) * 100,
        isLoading: loadedCount < frameCount,
        drawFrame
    };
}
