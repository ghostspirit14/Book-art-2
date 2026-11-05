/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SettingsPanel } from './components/SettingsPanel';
import { Book3DPreview } from './components/Book3DPreview';
import { Pattern2DViewer } from './components/Pattern2DViewer';
import { StepByStepGuide } from './components/StepByStepGuide';
import { ExportModal } from './components/ExportModal';
import { TutorialModal } from './components/TutorialModal';
import { BookConfig, PatternSource } from './types/bookfold';
import { GeneratedPattern, generatePattern } from './utils/patternGenerator';
import { exportStandaloneWindowsHtml } from './utils/standaloneHtmlExporter';
import { Box, Layers, ListFilter, CheckSquare, Sparkles, HardDrive, Download } from 'lucide-react';

export default function App() {
  // Pattern source configuration
  const [source, setSource] = useState<PatternSource>({
    mode: 'text',
    text: 'LOVE',
    fontFamily: 'Playfair Display',
    fontSize: 120,
    bold: true,
    italic: false,
    letterSpacing: 0,
    lineHeight: 1.1,
    textAlignment: 'center',
    imageUrl: null,
    imageFileName: undefined,
    threshold: 128,
    invert: false,
    contrast: 1,
    smoothing: true,
    presetId: 'heart-classic',
    patternLeaves: 120,
    verticalPosition: 0,
    verticalScale: 90,
    stretchY: 1.0,
    preserveAspectRatio: false,
    strokeWidth: 3.5,
  });

  // Physical book configuration
  const [config, setConfig] = useState<BookConfig>({
    totalBookPages: 400,
    firstNumberedPage: 1,
    leafCount: 120,
    startLeaf: 41,
    startBookPage: 81,
    pageHeight: 21.0,
    marginTop: 2.0,
    marginBottom: 2.0,
    unit: 'cm',
    method: 'multimark',
    foldAngle: '90',
    autoCenter: true,
  });

  // Computed pattern result
  const [pattern, setPattern] = useState<GeneratedPattern | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active leaf index and progress tracking
  const [activeLeafIndex, setActiveLeafIndex] = useState<number>(0);
  const [completedLeaves, setCompletedLeaves] = useState<Set<number>>(new Set());

  // UI state
  const [viewTab, setViewTab] = useState<'3d' | '2d'>('3d');
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // Generate pattern calculation
  const recalculatePattern = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await generatePattern(source, config);
      setPattern(result);
      if (activeLeafIndex >= result.leaves.length) {
        setActiveLeafIndex(0);
      }
    } catch (err) {
      console.error('Failed to generate pattern:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [source, config, activeLeafIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      recalculatePattern();
    }, 120);
    return () => clearTimeout(timer);
  }, [recalculatePattern]);

  const handleToggleComplete = (leafIndex: number) => {
    setCompletedLeaves((prev) => {
      const next = new Set(prev);
      if (next.has(leafIndex)) {
        next.delete(leafIndex);
      } else {
        next.add(leafIndex);
      }
      return next;
    });
  };

  const handleExportWindows = () => {
    exportStandaloneWindowsHtml();
    showNotification(
      'Fichier HTML autonome téléchargé ! Vous pouvez le placer dans n\'importe quel dossier Windows et l\'ouvrir par double-clic.'
    );
  };

  // Filtered leaves for the quick table
  const filteredLeaves = (pattern?.leaves || []).filter((leaf) => {
    const isCompleted = completedLeaves.has(leaf.leafIndex);
    if (filterMode === 'pending' && isCompleted) return false;
    if (filterMode === 'completed' && !isCompleted) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchLeaf = leaf.leafIndex.toString().includes(q);
      const matchPage = leaf.bookPageNumber.toString().includes(q);
      return matchLeaf || matchPage;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 px-4 py-3 rounded-xl shadow-2xl border border-amber-500/50 flex items-center gap-2.5 max-w-md animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs leading-snug">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onExportStandaloneHtml={handleExportWindows}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Settings Panel (4 cols on lg) */}
        <section className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <SettingsPanel
            source={source}
            config={config}
            onUpdateSource={setSource}
            onUpdateConfig={setConfig}
          />

          {/* Quick Windows Offline Banner */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 p-4 rounded-2xl border border-stone-800 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white font-serif">Utilisation Locale Windows</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Ce projet fonctionne sans serveur. Téléchargez le fichier HTML unique pour le conserver dans votre dossier Windows.
              </p>
              <button
                onClick={handleExportWindows}
                className="mt-1 text-xs font-semibold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Télécharger Generateur_Bookfold.html
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Previews, Guide & Table (8 cols on lg) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Top Preview Card with 3D/2D Viewport */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-stone-900">
                  {viewTab === '3d' ? 'Simulation 3D du Livre Ouvert' : 'Aperçu 2D de la Tranche'}
                </h2>
                <p className="text-xs text-stone-500">
                  {viewTab === '3d'
                    ? 'Visualisez en relief le rendu final sur les pages repliées'
                    : 'Visualisation précise tranche par tranche avec repères de coupe'}
                </p>
              </div>

              {/* View Mode Toggle Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setViewTab('3d')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewTab === '3d'
                      ? 'bg-white text-stone-900 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-amber-600" />
                  <span>Simulation 3D</span>
                </button>
                <button
                  onClick={() => setViewTab('2d')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    viewTab === '2d'
                      ? 'bg-white text-stone-900 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Aperçu 2D Tranche</span>
                </button>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="w-full">
              {viewTab === '3d' ? (
                <Book3DPreview pattern={pattern} config={config} />
              ) : (
                <Pattern2DViewer
                  pattern={pattern}
                  config={config}
                  activeLeafIndex={activeLeafIndex}
                  onSelectLeaf={setActiveLeafIndex}
                />
              )}
            </div>
          </div>

          {/* Interactive Step-by-Step Folding Guide */}
          <StepByStepGuide
            pattern={pattern}
            config={config}
            activeLeafIndex={activeLeafIndex}
            completedLeaves={completedLeaves}
            onSelectLeaf={setActiveLeafIndex}
            onToggleComplete={handleToggleComplete}
          />

          {/* Complete Measurement Table with search and filter */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Tableau des Mesures & Suivi
                </h3>
                <p className="text-xs text-stone-500">
                  Cochez les pages effectuées pour enregistrer votre avancement
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Filtrer n° page..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg outline-none w-32 focus:ring-1 focus:ring-amber-500"
                />

                {/* Filter Status */}
                <div className="flex bg-stone-100 p-0.5 rounded-lg text-[11px] font-semibold text-stone-600">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-0.5 rounded ${filterMode === 'all' ? 'bg-white text-stone-900 shadow-xs' : ''}`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setFilterMode('pending')}
                    className={`px-2 py-0.5 rounded ${filterMode === 'pending' ? 'bg-white text-stone-900 shadow-xs' : ''}`}
                  >
                    À faire
                  </button>
                  <button
                    onClick={() => setFilterMode('completed')}
                    className={`px-2 py-0.5 rounded ${filterMode === 'completed' ? 'bg-white text-stone-900 shadow-xs' : ''}`}
                  >
                    Terminées
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 text-stone-700 sticky top-0 border-b border-stone-200 z-10">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Fait</th>
                    <th className="p-2.5 font-bold">Feuillet N°</th>
                    <th className="p-2.5 font-bold">Page du Livre</th>
                    <th className="p-2.5 font-bold text-amber-700">Repère 1 (Haut)</th>
                    <th className="p-2.5 font-bold text-sky-700">Repère 2 (Bas)</th>
                    <th className="p-2.5 text-right font-normal text-stone-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {filteredLeaves.map((leaf) => {
                    const isDone = completedLeaves.has(leaf.leafIndex);
                    const isActive = leaf.leafIndex - 1 === activeLeafIndex;
                    const m1 = leaf.marks[0] !== undefined ? `${leaf.marks[0]} ${config.unit}` : '-';
                    const m2 = leaf.marks[1] !== undefined ? `${leaf.marks[1]} ${config.unit}` : '-';
                    const extraMarksCount = leaf.marks.length > 2 ? leaf.marks.length - 2 : 0;

                    return (
                      <tr
                        key={leaf.leafIndex}
                        onClick={() => setActiveLeafIndex(leaf.leafIndex - 1)}
                        className={`cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-amber-50 font-bold'
                            : isDone
                            ? 'bg-stone-50/60 opacity-60 hover:opacity-100'
                            : 'hover:bg-stone-50'
                        }`}
                      >
                        <td
                          className="p-2 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(leaf.leafIndex);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleToggleComplete(leaf.leafIndex)}
                            className="rounded text-emerald-600 cursor-pointer focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-2 text-stone-700">#{leaf.leafIndex}</td>
                        <td className="p-2 font-bold text-stone-900">p.{leaf.bookPageNumber}</td>
                        <td className="p-2 text-amber-700 font-semibold">{m1}</td>
                        <td className="p-2 text-sky-700 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span>{m2}</span>
                            {extraMarksCount > 0 && (
                              <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                +{extraMarksCount}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLeafIndex(leaf.leafIndex - 1);
                            }}
                            className="text-[11px] font-sans text-amber-700 hover:text-amber-800 underline"
                          >
                            Plier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-1">
              <span>
                Affichage de {filteredLeaves.length} sur {pattern?.leaves.length || 0} feuillets
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const all = new Set((pattern?.leaves || []).map((l) => l.leafIndex));
                    setCompletedLeaves(all);
                  }}
                  className="hover:text-stone-800 underline"
                >
                  Tout marquer comme plié
                </button>
                <span>•</span>
                <button
                  onClick={() => setCompletedLeaves(new Set())}
                  className="hover:text-stone-800 underline"
                >
                  Tout réinitialiser
                </button>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pattern={pattern}
        config={config}
        source={source}
      />

      {/* Tutorial Guide Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
