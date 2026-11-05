/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Sparkles,
  Book,
  Sliders,
  Upload,
  Check,
  RotateCcw,
  Maximize2,
  MoveVertical,
} from 'lucide-react';
import { BookConfig, PatternMode, PatternSource } from '../types/bookfold';
import { PRESET_LIBRARY } from '../utils/presets';

interface SettingsPanelProps {
  source: PatternSource;
  config: BookConfig;
  onUpdateSource: (updater: (prev: PatternSource) => PatternSource) => void;
  onUpdateConfig: (updater: (prev: BookConfig) => BookConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  source,
  config,
  onUpdateSource,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'pattern' | 'book' | 'adjust'>('pattern');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      onUpdateSource((prev) => ({
        ...prev,
        imageUrl: url,
        imageFileName: file.name,
        mode: 'image',
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50/70 p-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pattern')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pattern'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>1. Motif</span>
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'book'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Book className="w-3.5 h-3.5 text-amber-600" />
          <span>2. Livre</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'adjust'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600" />
          <span>3. Ajustement</span>
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        {/* ==================================================== */}
        {/* TAB 1: MOTIF / SOURCE (Texte, Image, Préréglages) */}
        {/* ==================================================== */}
        {activeTab === 'pattern' && (
          <div className="space-y-4">
            {/* Sub-mode selector */}
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => onUpdateSource((s) => ({ ...s, mode: 'text' }))}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  source.mode === 'text'
                    ? 'bg-white text-stone-900 shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Texte</span>
              </button>

              <button
                onClick={() => onUpdateSource((s) => ({ ...s, mode: 'image' }))}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  source.mode === 'image'
                    ? 'bg-white text-stone-900 shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image</span>
              </button>

              <button
                onClick={() => onUpdateSource((s) => ({ ...s, mode: 'preset' }))}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  source.mode === 'preset'
                    ? 'bg-white text-stone-900 shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Silhouettes</span>
              </button>
            </div>

            {/* TEXT MODE */}
            {source.mode === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Texte ou mot à plier
                  </label>
                  <textarea
                    rows={2}
                    value={source.text}
                    onChange={(e) => onUpdateSource((s) => ({ ...s, text: e.target.value }))}
                    placeholder="Ex: LOVE, 2026, JULIE..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none uppercase font-serif font-bold tracking-wider"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Les lettres en majuscules offrent généralement le plus beau relief.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Police de caractères
                    </label>
                    <select
                      value={source.fontFamily}
                      onChange={(e) => onUpdateSource((s) => ({ ...s, fontFamily: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs outline-none bg-white"
                    >
                      <option value="Playfair Display">Playfair Serif</option>
                      <option value="Cinzel">Cinzel Royal</option>
                      <option value="Montserrat">Montserrat Moderne</option>
                      <option value="Georgia">Georgia Antique</option>
                      <option value="Impact">Impact Épais</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Style
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={source.bold}
                          onChange={(e) => onUpdateSource((s) => ({ ...s, bold: e.target.checked }))}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Gras</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs text-stone-700 cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={source.italic}
                          onChange={(e) => onUpdateSource((s) => ({ ...s, italic: e.target.checked }))}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Italique</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alignement horizontal
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-lg text-xs text-center font-medium">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdateSource((s) => ({ ...s, textAlignment: align }))}
                        className={`py-1 rounded capitalize ${
                          source.textAlignment === align
                            ? 'bg-white text-stone-900 font-bold shadow-sm'
                            : 'text-stone-600'
                        }`}
                      >
                        {align === 'left' ? 'Gauche' : align === 'center' ? 'Centré' : 'Droite'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Height & Stretch Adjustments */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                      <span>Hauteur du texte (% de la page)</span>
                      <span className="font-mono text-amber-800 font-bold">{source.verticalScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={source.verticalScale}
                      onChange={(e) =>
                        onUpdateSource((s) => ({ ...s, verticalScale: parseInt(e.target.value) }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                      <span>Plus discret (30%)</span>
                      <span>Haut (90%)</span>
                      <span>Plein cadre (100%)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                      <span>Étirement vertical (Hauteur des lettres)</span>
                      <span className="font-mono text-amber-800 font-bold">
                        {Math.round((source.stretchY || 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="220"
                      step="5"
                      value={Math.round((source.stretchY || 1.0) * 100)}
                      onChange={(e) =>
                        onUpdateSource((s) => ({
                          ...s,
                          stretchY: parseInt(e.target.value) / 100,
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                      <span>Renfort des traits fins (Barres du E, O...)</span>
                      <span className="font-mono text-amber-800 font-bold">
                        {source.strokeWidth !== undefined ? source.strokeWidth : 3.5} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.5"
                      value={source.strokeWidth !== undefined ? source.strokeWidth : 3.5}
                      onChange={(e) =>
                        onUpdateSource((s) => ({
                          ...s,
                          strokeWidth: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                      <span>Standard (0)</span>
                      <span>Renforcé (3.5 px)</span>
                      <span>Très Épais (8 px)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IMAGE MODE */}
            {source.mode === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Téléverser une image (logo, silhouette, symbole)
                  </label>
                  <div className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-stone-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 mx-auto text-amber-600 mb-1.5" />
                    <span className="text-xs font-semibold text-stone-700 block">
                      {source.imageFileName || 'Cliquez pour choisir une image'}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      PNG, JPG, SVG, WebP (Privilégiez les silhouettes nettes)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                    <span>Seuil noir & blanc (Binarisation)</span>
                    <span className="font-mono text-amber-700 font-bold">{source.threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="245"
                    value={source.threshold}
                    onChange={(e) =>
                      onUpdateSource((s) => ({ ...s, threshold: parseInt(e.target.value) }))
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                    <span>Plus fin</span>
                    <span>Standard (128)</span>
                    <span>Plus épais</span>
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.invert}
                      onChange={(e) => onUpdateSource((s) => ({ ...s, invert: e.target.checked }))}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">Inverser le noir et le blanc (Effet pochoir / creux)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.preserveAspectRatio ?? false}
                      onChange={(e) =>
                        onUpdateSource((s) => ({ ...s, preserveAspectRatio: e.target.checked }))
                      }
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">Conserver le ratio d'origine (Désactiver pour étirer en hauteur)</span>
                  </label>
                </div>

                {/* Image Height & Stretch */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                      <span>Hauteur de l'image (% de la page)</span>
                      <span className="font-mono text-amber-800 font-bold">{source.verticalScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={source.verticalScale}
                      onChange={(e) =>
                        onUpdateSource((s) => ({ ...s, verticalScale: parseInt(e.target.value) }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                      <span>Étirement vertical de l'image</span>
                      <span className="font-mono text-amber-800 font-bold">
                        {Math.round((source.stretchY || 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="220"
                      step="5"
                      value={Math.round((source.stretchY || 1.0) * 100)}
                      onChange={(e) =>
                        onUpdateSource((s) => ({
                          ...s,
                          stretchY: parseInt(e.target.value) / 100,
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PRESETS MODE */}
            {source.mode === 'preset' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Silhouettes classiques de Book Folding
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 border border-stone-200 rounded-xl">
                  {PRESET_LIBRARY.map((preset) => {
                    const isSelected = source.presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => onUpdateSource((s) => ({ ...s, presetId: preset.id }))}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-sm ring-1 ring-amber-500'
                            : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current mb-1 text-stone-800">
                          <path d={preset.svgPath} />
                        </svg>
                        <span className="text-[10px] text-center leading-tight">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: LIVRE (Nombre de pages, dimensions, marges) */}
        {/* ==================================================== */}
        {activeTab === 'book' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Pages totales du livre
                </label>
                <input
                  type="number"
                  min="50"
                  max="1600"
                  step="2"
                  value={config.totalBookPages}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({
                      ...c,
                      totalBookPages: Math.max(50, parseInt(e.target.value) || 400),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  = {Math.floor(config.totalBookPages / 2)} feuilles papier
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Feuillets pour le motif
                </label>
                <input
                  type="number"
                  min="20"
                  max={Math.floor(config.totalBookPages / 2) - 10}
                  value={source.patternLeaves}
                  onChange={(e) =>
                    onUpdateSource((s) => ({
                      ...s,
                      patternLeaves: Math.max(20, parseInt(e.target.value) || 120),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  = {source.patternLeaves * 2} pages pliées
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Hauteur de la page ({config.unit})
                </label>
                <input
                  type="number"
                  min="10"
                  max="45"
                  step="0.5"
                  value={config.pageHeight}
                  onChange={(e) =>
                    onUpdateConfig((c) => ({
                      ...c,
                      pageHeight: Math.max(10, parseFloat(e.target.value) || 21.0),
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Marge de sécurité ({config.unit})
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="6"
                  step="0.5"
                  value={config.marginTop}
                  onChange={(e) => {
                    const val = Math.max(0.5, parseFloat(e.target.value) || 2.0);
                    onUpdateConfig((c) => ({
                      ...c,
                      marginTop: val,
                      marginBottom: val,
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Centering checkbox */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <label className="flex items-center gap-2 text-xs text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCenter}
                  onChange={(e) => onUpdateConfig((c) => ({ ...c, autoCenter: e.target.checked }))}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold">Centrer automatiquement le motif dans le livre</span>
              </label>
              <p className="text-[11px] text-stone-600 mt-1 pl-5">
                Calcule automatiquement un nombre identique de pages vierges non pliées au début et à la fin du livre.
              </p>
            </div>

            {/* Method */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Méthode de pliage
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onUpdateConfig((c) => ({ ...c, method: 'mmf' }))}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.method === 'mmf'
                      ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-sm'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="font-bold block text-stone-900">MMF Classique</span>
                  <span className="text-[10px] text-stone-500">2 repères par feuille (Recommandé)</span>
                </button>

                <button
                  onClick={() => onUpdateConfig((c) => ({ ...c, method: 'multimark' }))}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.method === 'multimark'
                      ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold shadow-sm'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="font-bold block text-stone-900">Multi-repères</span>
                  <span className="text-[10px] text-stone-500">Pour formes complexes avec trous</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: AJUSTEMENT (Échelle, position verticale) */}
        {/* ==================================================== */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
                  Hauteur globale du motif (% de la page)
                </span>
                <span className="font-mono text-amber-700 font-bold">{source.verticalScale}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={source.verticalScale}
                onChange={(e) =>
                  onUpdateSource((s) => ({ ...s, verticalScale: parseInt(e.target.value) }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <MoveVertical className="w-3.5 h-3.5 text-stone-500" />
                  Facteur d'étirement vertical
                </span>
                <span className="font-mono text-amber-700 font-bold">
                  {Math.round((source.stretchY || 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="220"
                step="5"
                value={Math.round((source.stretchY || 1.0) * 100)}
                onChange={(e) =>
                  onUpdateSource((s) => ({
                    ...s,
                    stretchY: parseInt(e.target.value) / 100,
                  }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Augmentez pour donner une grande hauteur aux lettres ou à l'image.
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <MoveVertical className="w-3.5 h-3.5 text-stone-500" />
                  Position verticale (Décalage haut / bas)
                </span>
                <span className="font-mono text-amber-700 font-bold">
                  {source.verticalPosition > 0 ? `+${source.verticalPosition}` : source.verticalPosition}%
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={source.verticalPosition}
                onChange={(e) =>
                  onUpdateSource((s) => ({ ...s, verticalPosition: parseInt(e.target.value) }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={source.preserveAspectRatio ?? false}
                  onChange={(e) =>
                    onUpdateSource((s) => ({ ...s, preserveAspectRatio: e.target.checked }))
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium">Conserver le ratio d'aspect strict (Non étiré)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Unité de mesure
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['cm', 'mm'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => onUpdateConfig((c) => ({ ...c, unit: u }))}
                    className={`py-2 rounded-xl border text-center font-bold uppercase transition-all ${
                      config.unit === u
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {u === 'cm' ? 'Centimètres (cm)' : 'Millimètres (mm)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onUpdateSource((s) => ({
                  ...s,
                  verticalPosition: 0,
                  verticalScale: 90,
                }));
              }}
              className="w-full py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les ajustements</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Footer Card */}
      <div className="p-4 bg-stone-900 text-stone-200 text-xs border-t border-stone-800 space-y-1">
        <div className="flex justify-between font-medium">
          <span className="text-stone-400">Total pages livre :</span>
          <span className="font-bold text-white">{config.totalBookPages} pages</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-stone-400">Pages pliées pour motif :</span>
          <span className="font-bold text-amber-400">{source.patternLeaves * 2} pages ({source.patternLeaves} feuilles)</span>
        </div>
      </div>
    </div>
  );
};
