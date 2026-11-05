/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { BookConfig, LeafMark } from '../types/bookfold';
import { GeneratedPattern } from '../utils/patternGenerator';

interface Pattern2DViewerProps {
  pattern: GeneratedPattern | null;
  config: BookConfig;
  activeLeafIndex: number;
  onSelectLeaf: (index: number) => void;
}

export const Pattern2DViewer: React.FC<Pattern2DViewerProps> = ({
  pattern,
  config,
  activeLeafIndex,
  onSelectLeaf,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hoveredLeaf, setHoveredLeaf] = useState<LeafMark | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isRealProportions, setIsRealProportions] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pattern) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const containerWidth = canvas.parentElement?.clientWidth || 700;
    const displayHeight = isRealProportions ? 260 : 190;

    // In real proportions: 1 leaf folded expands to approx 0.045 cm thickness
    // Ratio width/height = (leafCount * 0.045) / pageHeight
    let displayWidth = containerWidth;
    if (isRealProportions) {
      const realThicknessCm = Math.max(3, pattern.leaves.length * 0.045);
      const ratio = realThicknessCm / config.pageHeight;
      displayWidth = Math.min(containerWidth, Math.max(120, displayHeight * ratio * 2.2));
    }

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Background book edge paper texture
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Margin lines
    const topMarginY = (config.marginTop / config.pageHeight) * displayHeight;
    const botMarginY = displayHeight - (config.marginBottom / config.pageHeight) * displayHeight;

    // Margin shading (non-printable safe zone)
    ctx.fillStyle = 'rgba(230, 220, 210, 0.45)';
    ctx.fillRect(0, 0, displayWidth, topMarginY);
    ctx.fillRect(0, botMarginY, displayWidth, displayHeight - botMarginY);

    ctx.strokeStyle = '#d6d3d1';
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, topMarginY);
    ctx.lineTo(displayWidth, topMarginY);
    ctx.moveTo(0, botMarginY);
    ctx.lineTo(displayWidth, botMarginY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw slices
    const leafCount = pattern.leaves.length;
    const sliceWidth = displayWidth / leafCount;

    pattern.leaves.forEach((leaf, i) => {
      const sliceX = i * sliceWidth;
      const isActive = i === activeLeafIndex;
      const isHovered = hoveredLeaf?.leafIndex === leaf.leafIndex;

      // Draw leaf column fold marks (all segments in multi-mark mode)
      if (leaf.marks && leaf.marks.length >= 2) {
        for (let m = 0; m < leaf.marks.length; m += 2) {
          if (leaf.marks[m + 1] === undefined) break;

          const topRatio = leaf.marks[m] / config.pageHeight;
          const botRatio = leaf.marks[m + 1] / config.pageHeight;

          const y1 = topRatio * displayHeight;
          const y2 = botRatio * displayHeight;

          // Fold area color
          if (isActive) {
            ctx.fillStyle = '#f59e0b'; // Amber 500
          } else if (isHovered) {
            ctx.fillStyle = '#ea580c'; // Orange 600
          } else {
            ctx.fillStyle = '#1c1917'; // Dark stone
          }
          ctx.fillRect(sliceX, y1, Math.max(1, sliceWidth), Math.max(1, y2 - y1));
        }
      }

      // Highlight active column
      if (isActive) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fillRect(sliceX, 0, Math.max(2, sliceWidth), displayHeight);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sliceX, 0, Math.max(2, sliceWidth), displayHeight);
      }
    });
  }, [pattern, config, activeLeafIndex, hoveredLeaf, isRealProportions]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pattern || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const leafCount = pattern.leaves.length;
    const sliceWidth = rect.width / leafCount;

    const index = Math.floor(x / sliceWidth);
    if (index >= 0 && index < leafCount) {
      setHoveredLeaf(pattern.leaves[index]);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredLeaf(null);
    setTooltipPos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pattern || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const leafCount = pattern.leaves.length;
    const sliceWidth = rect.width / leafCount;

    const index = Math.floor(x / sliceWidth);
    if (index >= 0 && index < leafCount) {
      onSelectLeaf(index);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      <div className="w-full bg-stone-900/90 rounded-xl p-3 border border-stone-800 shadow-inner flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-stone-800/80 text-xs">
          <span className="text-stone-300 font-semibold">Mode d'affichage de la tranche :</span>
          <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[11px]">
            <button
              onClick={() => setIsRealProportions(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isRealProportions ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Vue Étendue
            </button>
            <button
              onClick={() => setIsRealProportions(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                isRealProportions ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Proportions Réelles du Livre
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="rounded cursor-crosshair border border-stone-700 bg-white"
        />

        <div className="w-full flex items-center justify-between text-[11px] text-stone-400 mt-2 px-1">
          <span>Haut de page (0 {config.unit})</span>
          <span className="text-amber-400 font-mono">
            {hoveredLeaf ? (
              <>
                Feuillet #{hoveredLeaf.leafIndex} • Page {hoveredLeaf.bookPageNumber} • Repères :{' '}
                {hoveredLeaf.marks.length >= 2
                  ? `${hoveredLeaf.marks[0]} - ${hoveredLeaf.marks[1]} ${config.unit}`
                  : 'Aucun pli'}
              </>
            ) : (
              'Cliquez sur une colonne pour accéder directement au feuillet'
            )}
          </span>
          <span>Bas de page ({config.pageHeight} {config.unit})</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredLeaf && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x + 12}px`,
            top: `${tooltipPos.y - 45}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="bg-stone-900/95 text-stone-100 text-xs py-1.5 px-3 rounded-lg shadow-xl border border-amber-500/50 backdrop-blur"
        >
          <div className="font-bold text-amber-300">
            Feuillet #{hoveredLeaf.leafIndex} (Page {hoveredLeaf.bookPageNumber})
          </div>
          {hoveredLeaf.marks.length >= 2 ? (
            <div className="text-[11px] text-stone-300">
              Repères : <span className="text-amber-400 font-semibold">{hoveredLeaf.marks[0]} {config.unit}</span> et{' '}
              <span className="text-sky-400 font-semibold">{hoveredLeaf.marks[1]} {config.unit}</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-400 italic">Feuillet sans pliage</div>
          )}
        </div>
      )}
    </div>
  );
};
