/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { BookConfig } from '../types/bookfold';
import { GeneratedPattern } from '../utils/patternGenerator';

interface Book3DPreviewProps {
  pattern: GeneratedPattern | null;
  config: BookConfig;
}

export const Book3DPreview: React.FC<Book3DPreviewProps> = ({ pattern, config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Orbit camera angles
  const [rotationX, setRotationX] = useState<number>(25); // degrees
  const [rotationY, setRotationY] = useState<number>(-35); // degrees
  const [zoom, setZoom] = useState<number>(1.0);
  const [openAngle, setOpenAngle] = useState<number>(110); // degrees book is opened
  const [coverColor, setCoverColor] = useState<string>('#451a03'); // rich antique leather brown
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = 360;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1c1917'); // stone-900
    bgGradient.addColorStop(1, '#0c0a09'); // stone-950
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    if (!pattern || pattern.leaves.length === 0) {
      ctx.fillStyle = '#78716c';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Génération de la prévisualisation 3D...', width / 2, height / 2);
      return;
    }

    // 3D perspective setup
    const cx = width / 2;
    const cy = height / 2 + 10;
    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180;
    const bookOpenRad = (openAngle * Math.PI) / 180;

    const bookHeight3D = 170 * zoom;
    const bookDepth3D = 130 * zoom;
    const totalLeaves = pattern.leaves.length;

    // Helper 3D Projection
    const project3D = (x: number, y: number, z: number) => {
      // Rotate around Y axis
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const cameraDist = 450;
      const factor = cameraDist / (cameraDist + z2);
      return {
        screenX: cx + x1 * factor,
        screenY: cy + y2 * factor,
        depth: z2,
      };
    };

    // Draw Book Spine & Covers
    // Left Cover
    const leftCoverAngle = -bookOpenRad / 2;
    const rightCoverAngle = bookOpenRad / 2;

    const spineL = project3D(-12 * zoom, -bookHeight3D / 2, -bookDepth3D * 0.15);
    const spineR = project3D(12 * zoom, -bookHeight3D / 2, -bookDepth3D * 0.15);
    const spineBotL = project3D(-12 * zoom, bookHeight3D / 2, -bookDepth3D * 0.15);
    const spineBotR = project3D(12 * zoom, bookHeight3D / 2, -bookDepth3D * 0.15);

    // Spine surface
    ctx.beginPath();
    ctx.moveTo(spineL.screenX, spineL.screenY);
    ctx.lineTo(spineR.screenX, spineR.screenY);
    ctx.lineTo(spineBotR.screenX, spineBotR.screenY);
    ctx.lineTo(spineBotL.screenX, spineBotL.screenY);
    ctx.closePath();
    ctx.fillStyle = coverColor;
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Book Leaves and Folds
    // We sort leaves from back to front or render fan
    const leafStep = Math.max(1, Math.floor(totalLeaves / 120)); // Limit drawn leaves for crisp 60fps rendering

    for (let i = 0; i < totalLeaves; i += leafStep) {
      const leaf = pattern.leaves[i];
      const t = i / (totalLeaves - 1 || 1);
      const leafAngle = leftCoverAngle + t * (rightCoverAngle - leftCoverAngle);

      // Spine hinge point
      const spineX = Math.sin(leafAngle) * 8 * zoom;
      const spineZ = -bookDepth3D * 0.1;

      // Outer page edge (fore-edge)
      const edgeX = spineX + Math.sin(leafAngle) * bookDepth3D;
      const edgeZ = spineZ + Math.cos(leafAngle) * bookDepth3D * 0.7;

      const pTopSpine = project3D(spineX, -bookHeight3D / 2, spineZ);
      const pBotSpine = project3D(spineX, bookHeight3D / 2, spineZ);
      const pTopEdge = project3D(edgeX, -bookHeight3D / 2, edgeZ);
      const pBotEdge = project3D(edgeX, bookHeight3D / 2, edgeZ);

      // Page surface
      ctx.beginPath();
      ctx.moveTo(pTopSpine.screenX, pTopSpine.screenY);
      ctx.lineTo(pTopEdge.screenX, pTopEdge.screenY);
      ctx.lineTo(pBotEdge.screenX, pBotEdge.screenY);
      ctx.lineTo(pBotSpine.screenX, pBotSpine.screenY);
      ctx.closePath();

      // Ambient shading based on angle
      const shade = 230 + Math.floor(Math.sin(t * Math.PI) * 25);
      ctx.fillStyle = `rgb(${shade}, ${shade - 6}, ${shade - 15})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 190, 180, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Folded 3D Relief Flaps (supports multi-mark folds for E, O, etc.)
      if (leaf.marks && leaf.marks.length >= 2) {
        for (let m = 0; m < leaf.marks.length; m += 2) {
          if (leaf.marks[m + 1] === undefined) break;

          const mark1Ratio = leaf.marks[m] / config.pageHeight;
          const mark2Ratio = leaf.marks[m + 1] / config.pageHeight;

          const foldTopY = -bookHeight3D / 2 + mark1Ratio * bookHeight3D;
          const foldBotY = -bookHeight3D / 2 + mark2Ratio * bookHeight3D;

          // Inward fold depth
          const foldDepth = 22 * zoom;
          const foldInnerX = edgeX - Math.sin(leafAngle) * foldDepth;
          const foldInnerZ = edgeZ - Math.cos(leafAngle) * foldDepth * 0.7;

          const pFoldTopEdge = project3D(edgeX, foldTopY, edgeZ);
          const pFoldBotEdge = project3D(edgeX, foldBotY, edgeZ);
          const pFoldInnerTop = project3D(foldInnerX, foldTopY + 8 * zoom, foldInnerZ);
          const pFoldInnerBot = project3D(foldInnerX, foldBotY - 8 * zoom, foldInnerZ);

          // Draw folded triangle/relief flap
          ctx.beginPath();
          ctx.moveTo(pFoldTopEdge.screenX, pFoldTopEdge.screenY);
          ctx.lineTo(pFoldInnerTop.screenX, pFoldInnerTop.screenY);
          ctx.lineTo(pFoldInnerBot.screenX, pFoldInnerBot.screenY);
          ctx.lineTo(pFoldBotEdge.screenX, pFoldBotEdge.screenY);
          ctx.closePath();

          // High contrast relief shadow
          ctx.fillStyle = '#b45309'; // Warm embossed amber tone
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Fore-edge subtle glow/border
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1.5;
  }, [pattern, config, rotationX, rotationY, zoom, openAngle, coverColor]);

  // Mouse handlers for 3D Orbit Drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setRotationY((prev) => (prev + deltaX * 0.6) % 360);
    setRotationX((prev) => Math.max(-60, Math.min(60, prev - deltaY * 0.6)));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-xl">
      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[360px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-stone-950/80 backdrop-blur border border-stone-700/60 rounded-xl p-1 text-stone-200 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            title="Zoomer"
            className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            title="Dézoomer"
            className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setRotationX(25);
              setRotationY(-35);
              setZoom(1.0);
            }}
            title="Réinitialiser l'angle de vue"
            className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Hint Pill */}
        <div className="absolute bottom-3 left-3 bg-stone-950/75 backdrop-blur border border-stone-800 text-stone-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none shadow">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Glissez la souris pour faire pivoter le livre en 3D</span>
        </div>
      </div>

      {/* Book 3D Setting Bar */}
      <div className="w-full bg-stone-950/90 border-t border-stone-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-stone-400">Ouverture du livre :</span>
          <input
            type="range"
            min="60"
            max="160"
            value={openAngle}
            onChange={(e) => setOpenAngle(parseInt(e.target.value))}
            className="w-28 accent-amber-500 cursor-pointer"
          />
          <span className="text-amber-400 font-mono">{openAngle}°</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-400">Reliure :</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: '#451a03', name: 'Cuir Antique' },
              { id: '#1e3a8a', name: 'Bleu Nuit' },
              { id: '#064e3b', name: 'Vert Forêt' },
              { id: '#831843', name: 'Bordeaux' },
              { id: '#18181b', name: 'Noir Ébène' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCoverColor(c.id)}
                title={c.name}
                style={{ backgroundColor: c.id }}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  coverColor === c.id ? 'border-amber-400 scale-110' : 'border-stone-700 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-stone-400">
          Tranche : <span className="text-amber-400 font-bold">{pattern?.totalFoldedLeaves || 0}</span> feuilles pliées en relief
        </div>
      </div>
    </div>
  );
};
