/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MeasurementUnit = 'cm' | 'mm';

export type FoldingMethod = 'mmf' | 'multimark' | 'cut_and_fold';

export type FoldingAngle = '45' | '90' | '180';

export interface BookConfig {
  totalBookPages: number;      // Total numbered pages in the physical book (e.g. 400)
  firstNumberedPage: number;   // Page number where user wants to start count from (usually 1 or odd)
  leafCount: number;           // Number of folded sheets needed for the pattern (1 leaf = 2 pages)
  startLeaf: number;           // Offset leaf index where the pattern starts
  startBookPage: number;       // The actual physical page number in the book where fold 1 begins
  pageHeight: number;          // Real book page height (in cm or mm)
  marginTop: number;           // Upper safety margin (in cm or mm)
  marginBottom: number;        // Lower safety margin (in cm or mm)
  unit: MeasurementUnit;       // 'cm' or 'mm'
  method: FoldingMethod;       // 'mmf' | 'multimark' | 'cut_and_fold'
  foldAngle: FoldingAngle;     // '45' | '90' | '180'
  autoCenter: boolean;         // Automatically center pattern in book
}

export type PatternMode = 'text' | 'image' | 'preset';

export interface PatternSource {
  mode: PatternMode;
  // Text options
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  letterSpacing: number;
  lineHeight: number;
  textAlignment: 'center' | 'left' | 'right';
  // Image options
  imageUrl: string | null;
  imageFileName?: string;
  threshold: number;           // 0 to 255 for black/white binarization
  invert: boolean;             // Invert black/white
  contrast: number;            // Contrast multiplier
  smoothing: boolean;
  // Preset options
  presetId: string;
  // Common sizing within pattern area
  patternLeaves: number;       // Target leaves/sheets for the design
  verticalPosition: number;    // -50% to +50% vertical offset
  verticalScale: number;       // 20% to 100% scale
  stretchY: number;            // Vertical stretch multiplier (0.5 to 3.0)
  preserveAspectRatio: boolean;// Keep original aspect ratio for images/presets or stretch to fill height
  strokeWidth: number;         // Stroke reinforcement for thin crossbars/serifs (0 to 10px)
}

export interface LeafMark {
  leafIndex: number;           // 1 to N
  bookPageNumber: number;      // Actual book page (e.g. 101)
  marks: number[];             // Measurements from top of page (e.g. [4.5, 12.8] in cm)
  isCompleted?: boolean;
}

export interface PresetItem {
  id: string;
  name: string;
  category: 'symbol' | 'animal' | 'love' | 'nature' | 'monogram';
  svgPath: string;
}
