// COPY-AND-REPLACE: ./src/components/visualizers/GridVisualizer.tsx
import { useEffect, useRef } from 'react';

interface GridVisualizerProps {
  name: string;
  value: any; // 2D array: rows x cols. Cells: 0/1 or 0..255 or any number
}

export function GridVisualizer({ name, value }: GridVisualizerProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const is2D =
    Array.isArray(value) &&
    value.length > 0 &&
    Array.isArray(value[0]) &&
    value[0].length > 0;

  useEffect(() => {
    if (!is2D) return;
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const rows = value.length;
      const cols = value[0].length;

      const cssW = wrap.clientWidth || 1;
      const cssH = wrap.clientHeight || 1;
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const cellW = Math.max(1, Math.floor(cssW / cols));
      const cellH = Math.max(1, Math.floor(cssH / rows));

      const gridW = cellW * cols;
      const gridH = cellH * rows;
      const offX = Math.floor((cssW - gridW) / 2);
      const offY = Math.floor((cssH - gridH) / 2);

      const fg = getCSS('--foreground', 'rgba(240,240,240,1)');
      const bg = getCSS('--background', 'rgba(20,20,20,1)');

      for (let r = 0; r < rows; r++) {
        const row = value[r];
        for (let c = 0; c < cols; c++) {
          const v = row[c];

          let g: number;
          if (v === 0 || v === 1) g = v * 255;
          else if (typeof v === 'number' && isFinite(v)) g = Math.max(0, Math.min(255, v));
          else g = 0;

          const gray = g / 255;
          ctx.fillStyle = mixGray(bg, fg, gray);
          ctx.fillRect(offX + c * cellW, offY + r * cellH, cellW, cellH);
        }
      }
    };

    const getCSS = (varName: string, fallback: string) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return v || fallback;
    };

    function mixGray(bgColor: string, fgColor: string, t: number) {
      // @ts-ignore
      if (CSS && CSS.supports && CSS.supports('color', 'color-mix(in oklab, black, white)')) {
        return `color-mix(in oklab, ${fgColor} ${Math.round(t * 100)}%, ${bgColor})`;
        }
      const g = Math.round(t * 255);
      return `rgb(${g},${g},${g})`;
    }

    // ResizeObserver guard for JSDOM
    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    const ro = RO ? new RO(draw) : null;
    ro?.observe(wrap);

    draw();
    return () => ro?.disconnect();
  }, [value, is2D]);

  if (!is2D) {
    return (
      <div>
        <div className="font-medium mb-2">{name}:</div>
        <p className="text-destructive text-sm">Cannot render as grid: expected 2D array</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="font-medium mb-2">{name}:</div>
      <div
        ref={wrapRef}
        className="relative w-full h-[min(70vh,600px)] min-h-0 rounded overflow-hidden border border-border bg-muted/20 font-mono"
        role="group"
        aria-label={`${name} grid`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={`${name} canvas`}
        />
      </div>
    </div>
  );
}
