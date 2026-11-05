/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookConfig, LeafMark, PatternSource } from '../types/bookfold';
import { PRESET_LIBRARY } from './presets';

export interface GeneratedPattern {
  leaves: LeafMark[];
  patternWidth: number;
  patternHeight: number;
  previewCanvas: HTMLCanvasElement;
  binaryMatrix: boolean[][]; // [x][y]: true = black/fold area
  effectiveStartPage: number;
  totalFoldedLeaves: number;
}

/**
 * Generates the pattern matrix and precise measurement marks for each leaf/sheet
 */
export async function generatePattern(
  source: PatternSource,
  config: BookConfig
): Promise<GeneratedPattern> {
  const leafCount = Math.max(10, Math.min(600, source.patternLeaves));
  const canvasHeight = 600;
  const canvasWidth = leafCount;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Fill white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Calculate printable vertical bounding box
  const marginRatio = (config.marginTop + config.marginBottom) / config.pageHeight;
  const usableHeightRatio = Math.max(0.2, 1 - marginRatio);
  const vScale = (source.verticalScale / 100) * usableHeightRatio;
  const targetAreaHeight = canvasHeight * vScale;
  const vOffset = (source.verticalPosition / 100) * (canvasHeight - targetAreaHeight);
  const targetAreaY = (canvasHeight - targetAreaHeight) / 2 + vOffset;

  const stretchY = source.stretchY || 1.0;
  const preserveRatio = source.preserveAspectRatio ?? false;

  // 2. Render content based on mode
  if (source.mode === 'preset') {
    const preset = PRESET_LIBRARY.find((p) => p.id === source.presetId) || PRESET_LIBRARY[0];
    const path2D = new Path2D(preset.svgPath);

    ctx.save();
    let scaleX = (canvasWidth * 0.88) / 24;
    let scaleY = (targetAreaHeight * stretchY) / 24;

    if (preserveRatio) {
      const uniformScale = Math.min(scaleX, scaleY);
      scaleX = uniformScale;
      scaleY = uniformScale;
    }

    const drawW = 24 * scaleX;
    const drawH = 24 * scaleY;
    const offsetX = (canvasWidth - drawW) / 2;
    const offsetY = targetAreaY + (targetAreaHeight - drawH) / 2;

    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = '#000000';
    ctx.fill(path2D);
    ctx.restore();
  } else if (source.mode === 'text') {
    const text = source.text.trim() || 'LIVRE';
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.textAlign = source.textAlignment;
    ctx.textBaseline = 'middle';

    const lines = text.split('\n');
    const totalLines = lines.length;
    const fontStyle = `${source.italic ? 'italic ' : ''}${source.bold ? 'bold ' : ''}`;

    // Desired font height based on user's target vertical height and stretch
    const baseLineHeight = (targetAreaHeight * stretchY) / (totalLines * 1.05);
    const calculatedFontSize = baseLineHeight * 0.88;
    ctx.font = `${fontStyle}${calculatedFontSize}px "${source.fontFamily}", sans-serif`;

    // Measure max line width at full height
    let maxLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    }

    const targetWidth = canvasWidth * 0.92;
    let horizontalScale = 1.0;
    if (maxLineWidth > targetWidth) {
      horizontalScale = targetWidth / maxLineWidth;
    } else if (!preserveRatio && maxLineWidth > 0) {
      // If user doesn't preserve ratio, gently expand text to fill available leaves
      horizontalScale = Math.min(2.0, targetWidth / maxLineWidth);
    }

    const lineHeightPx = calculatedFontSize * source.lineHeight;
    const totalBlockHeight = totalLines * lineHeightPx;
    const startY = targetAreaY + (targetAreaHeight - totalBlockHeight) / 2 + lineHeightPx / 2;

    let posX = canvasWidth / 2;
    if (source.textAlignment === 'left') posX = canvasWidth * 0.05;
    if (source.textAlignment === 'right') posX = canvasWidth * 0.95;

    // Apply horizontal scaling centered around posX
    ctx.translate(posX, 0);
    ctx.scale(horizontalScale, 1.0);
    ctx.translate(-posX, 0);

    // Apply stroke reinforcement to preserve thin horizontal bars, serifs, and loops
    const strokeW = source.strokeWidth !== undefined ? source.strokeWidth : 3.5;
    if (strokeW > 0) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = strokeW;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      lines.forEach((line, index) => {
        ctx.strokeText(line, posX, startY + index * lineHeightPx);
      });
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, posX, startY + index * lineHeightPx);
    });

    ctx.restore();
  } else if (source.mode === 'image' && source.imageUrl) {
    try {
      const img = await loadImage(source.imageUrl);
      ctx.save();
      const imgAspect = img.width / img.height;

      let drawW: number;
      let drawH: number;

      if (preserveRatio) {
        drawW = canvasWidth * 0.92;
        drawH = drawW / imgAspect;
        if (drawH > targetAreaHeight * stretchY) {
          drawH = targetAreaHeight * stretchY;
          drawW = drawH * imgAspect;
        }
      } else {
        // Stretch to fill height and width requested by crafter
        drawW = canvasWidth * 0.92;
        drawH = Math.min(canvasHeight * 0.95, targetAreaHeight * stretchY);
      }

      const drawX = (canvasWidth - drawW) / 2;
      const drawY = targetAreaY + (targetAreaHeight - drawH) / 2;

      ctx.imageSmoothingEnabled = source.smoothing;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch {
      // Fallback text if image load fails
      ctx.fillStyle = '#000000';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Image introuvable', canvasWidth / 2, canvasHeight / 2);
    }
  }

  // 3. Pixel processing: apply threshold and inversion
  const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imgData.data;
  const binaryMatrix: boolean[][] = [];

  const threshold = source.threshold;
  const invert = source.invert;

  for (let x = 0; x < canvasWidth; x++) {
    binaryMatrix[x] = [];
    for (let y = 0; y < canvasHeight; y++) {
      const idx = (y * canvasWidth + x) * 4;
      // Luminance formula
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      // In text mode, ensure anti-aliased crossbars and curves are captured
      const effectiveThreshold = source.mode === 'text' ? Math.max(threshold, 215) : threshold;
      let isDark = gray < effectiveThreshold;
      if (invert) {
        isDark = !isDark;
      }

      // Respect upper & lower safety margins in pixel space
      const isWithinMargin = y >= (config.marginTop / config.pageHeight) * canvasHeight &&
                            y <= canvasHeight - (config.marginBottom / config.pageHeight) * canvasHeight;

      const finalVal = isDark && isWithinMargin;
      binaryMatrix[x][y] = finalVal;

      // Update canvas for visual feedback
      const col = finalVal ? 20 : 255;
      data[idx] = col;
      data[idx + 1] = col;
      data[idx + 2] = col;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 4. Calculate start leaf and start book page
  const totalBookLeaves = Math.floor(config.totalBookPages / 2);
  let startLeaf = config.startLeaf;
  if (config.autoCenter) {
    startLeaf = Math.max(1, Math.floor((totalBookLeaves - leafCount) / 2) + 1);
  }
  // 1 leaf = 2 book pages. If book starts at firstNumberedPage (e.g. 1), leaf 1 = pages 1-2, leaf 2 = pages 3-4, etc.
  const effectiveStartPage = config.firstNumberedPage + (startLeaf - 1) * 2;

  // 5. Calculate precise marks for each leaf column
  const leaves: LeafMark[] = [];
  let totalFoldedLeaves = 0;

  for (let x = 0; x < leafCount; x++) {
    const leafIndex = x + 1;
    const bookPageNumber = effectiveStartPage + x * 2;
    const colMarks: number[] = [];

    // Find black spans in column x
    const spans: { top: number; bottom: number }[] = [];
    let inSpan = false;
    let spanTop = 0;

    for (let y = 0; y < canvasHeight; y++) {
      const isBlack = binaryMatrix[x][y];
      if (isBlack && !inSpan) {
        inSpan = true;
        spanTop = y;
      } else if (!isBlack && inSpan) {
        inSpan = false;
        spans.push({ top: spanTop, bottom: y - 1 });
      }
    }
    if (inSpan) {
      spans.push({ top: spanTop, bottom: canvasHeight - 1 });
    }

    if (spans.length > 0) {
      totalFoldedLeaves++;
      if (config.method === 'mmf' || config.method === 'cut_and_fold') {
        // Classic MMF: Outer boundaries of the pattern for this column (Mark 1 = topmost, Mark 2 = bottommost)
        const topPx = spans[0].top;
        const botPx = spans[spans.length - 1].bottom;

        const mark1 = pixelToRealMeasure(topPx, canvasHeight, config.pageHeight, config.unit);
        const mark2 = pixelToRealMeasure(botPx, canvasHeight, config.pageHeight, config.unit);

        colMarks.push(mark1, mark2);
      } else {
        // Multi-mark: includes interior cut segments (for shapes with holes like O, A, 8)
        for (const span of spans) {
          const m1 = pixelToRealMeasure(span.top, canvasHeight, config.pageHeight, config.unit);
          const m2 = pixelToRealMeasure(span.bottom, canvasHeight, config.pageHeight, config.unit);
          colMarks.push(m1, m2);
        }
      }
    }

    leaves.push({
      leafIndex,
      bookPageNumber,
      marks: colMarks,
      isCompleted: false,
    });
  }

  return {
    leaves,
    patternWidth: canvasWidth,
    patternHeight: canvasHeight,
    previewCanvas: canvas,
    binaryMatrix,
    effectiveStartPage,
    totalFoldedLeaves,
  };
}

function pixelToRealMeasure(
  pixelY: number,
  totalHeightPixels: number,
  pageHeight: number,
  unit: 'cm' | 'mm'
): number {
  const fraction = pixelY / totalHeightPixels;
  let val = fraction * pageHeight;
  if (unit === 'mm') {
    // Round to 1 decimal place (0.1 mm precision)
    return Math.round(val * 10) / 10;
  } else {
    // In cm, round to 2 decimal places (0.01 cm = 0.1 mm precision)
    return Math.round(val * 100) / 100;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
