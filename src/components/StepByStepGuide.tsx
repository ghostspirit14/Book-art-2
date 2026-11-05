/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Bookmark,
} from 'lucide-react';
import { BookConfig } from '../types/bookfold';
import { GeneratedPattern } from '../utils/patternGenerator';

interface StepByStepGuideProps {
  pattern: GeneratedPattern | null;
  config: BookConfig;
  activeLeafIndex: number;
  completedLeaves: Set<number>;
  onSelectLeaf: (index: number) => void;
  onToggleComplete: (leafIndex: number) => void;
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({
  pattern,
  config,
  activeLeafIndex,
  completedLeaves,
  onSelectLeaf,
  onToggleComplete,
}) => {
  const [jumpInput, setJumpInput] = useState<string>('');

  const totalLeaves = pattern?.leaves.length || 0;
  const currentLeaf = pattern?.leaves[activeLeafIndex] || pattern?.leaves[0];
  const isDone = currentLeaf ? completedLeaves.has(currentLeaf.leafIndex) : false;
  const progressPercent = totalLeaves > 0 ? Math.round((completedLeaves.size / totalLeaves) * 100) : 0;

  const m1 = currentLeaf?.marks && currentLeaf.marks.length >= 1 ? currentLeaf.marks[0] : null;
  const m2 = currentLeaf?.marks && currentLeaf.marks.length >= 2 ? currentLeaf.marks[1] : null;

  const handleNext = () => {
    if (activeLeafIndex < totalLeaves - 1) {
      onSelectLeaf(activeLeafIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeLeafIndex > 0) {
      onSelectLeaf(activeLeafIndex - 1);
    }
  };

  const handleToggleAndNext = () => {
    if (!currentLeaf) return;
    onToggleComplete(currentLeaf.leafIndex);
    if (!isDone) {
      // Trigger small celebration if all completed!
      if (completedLeaves.size + 1 >= totalLeaves) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else if (activeLeafIndex < totalLeaves - 1) {
        onSelectLeaf(activeLeafIndex + 1);
      }
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern || pattern.leaves.length === 0) return;
    const val = parseInt(jumpInput, 10);
    if (isNaN(val)) return;

    // Search by book page number first, or leaf index
    const leafByPage = pattern.leaves.findIndex(
      (l) => l.bookPageNumber === val || l.bookPageNumber === val - 1
    );
    if (leafByPage !== -1) {
      onSelectLeaf(leafByPage);
      setJumpInput('');
      return;
    }

    const leafByIdx = pattern.leaves.findIndex((l) => l.leafIndex === val);
    if (leafByIdx !== -1) {
      onSelectLeaf(leafByIdx);
      setJumpInput('');
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!pattern || pattern.leaves.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleToggleAndNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLeafIndex, isDone, completedLeaves, totalLeaves, pattern]);

  if (!pattern || pattern.leaves.length === 0 || !currentLeaf) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-5">
      {/* Header and Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-600" />
              Assistant de Pliage Pas-à-Pas
            </h2>
            {progressPercent === 100 && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5" /> Pliage Terminé !
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Naviguez feuille par feuille. Raccourcis : [←] [→] pour naviguer, [Espace] pour valider.
          </p>
        </div>

        {/* Jump Form */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 self-start sm:self-auto">
          <input
            type="number"
            placeholder="N° Page ou Feuille..."
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            className="w-36 px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors border border-stone-200"
          >
            Aller
          </button>
        </form>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-stone-600 font-medium">
          <span>
            Progression : <strong className="text-stone-900">{completedLeaves.size}</strong> sur{' '}
            <strong className="text-stone-900">{totalLeaves}</strong> feuillets pliés
          </span>
          <span className="font-bold text-amber-700">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Leaf Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch bg-stone-50/80 p-4 rounded-xl border border-stone-200">
        
        {/* Left Column: Leaf Controls & Status (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={activeLeafIndex <= 0}
              className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
              title="Feuillet précédent (Touche Flèche Gauche)"
            >
              <ChevronLeft className="w-5 h-5 text-stone-700" />
            </button>

            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Feuillet Actuel
              </span>
              <div className="font-serif font-bold text-2xl text-stone-900">
                #{currentLeaf.leafIndex} <span className="text-stone-400 font-sans text-lg font-normal">/ {totalLeaves}</span>
              </div>
              <div className="inline-block mt-0.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
                Page {currentLeaf.bookPageNumber} du livre
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={activeLeafIndex >= totalLeaves - 1}
              className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
              title="Feuillet suivant (Touche Flèche Droite)"
            >
              <ChevronRight className="w-5 h-5 text-stone-700" />
            </button>
          </div>

          {/* Validation Button */}
          <button
            onClick={handleToggleAndNext}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              isDone
                ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
            }`}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Marqué comme Plié (Cliquer pour annuler)
              </>
            ) : (
              <>
                <Circle className="w-5 h-5" />
                Valider et passer au feuillet suivant [Espace]
              </>
            )}
          </button>
        </div>

        {/* Right Column: Life-size Visual Ruler & Fold Indicators (7 cols) */}
        <div className="md:col-span-7 bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-center">
          {m1 !== null && m2 !== null ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Mesures depuis le haut de la page :
              </div>

              <div className="space-y-2">
                {Array.from({ length: Math.floor(currentLeaf.marks.length / 2) }).map((_, segIdx) => {
                  const segM1 = currentLeaf.marks[segIdx * 2];
                  const segM2 = currentLeaf.marks[segIdx * 2 + 1];
                  const isMulti = currentLeaf.marks.length > 2;

                  return (
                    <div key={segIdx} className="space-y-1">
                      {isMulti && (
                        <span className="text-[10px] font-bold text-stone-500 uppercase">
                          Segment {segIdx + 1} :
                        </span>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Repere 1 */}
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border-2 border-amber-300/80 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow text-xs">
                            <ArrowDown className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-amber-800 uppercase block">
                              Haut ({segIdx * 2 + 1})
                            </span>
                            <span className="text-xl font-black text-amber-950 font-mono">
                              {segM1} <span className="text-xs font-sans text-amber-700">{config.unit}</span>
                            </span>
                          </div>
                        </div>

                        {/* Repere 2 */}
                        <div className="p-2.5 rounded-xl bg-sky-50/80 border-2 border-sky-300/80 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold shadow text-xs">
                            <ArrowUp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-sky-800 uppercase block">
                              Bas ({segIdx * 2 + 2})
                            </span>
                            <span className="text-xl font-black text-sky-950 font-mono">
                              {segM2} <span className="text-xs font-sans text-sky-700">{config.unit}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual Leaf Schematic */}
              <div className="relative h-16 bg-stone-100 rounded-lg border border-stone-300 flex items-center px-4 overflow-hidden">
                {Array.from({ length: Math.floor(currentLeaf.marks.length / 2) }).map((_, segIdx) => {
                  const segM1 = currentLeaf.marks[segIdx * 2];
                  const segM2 = currentLeaf.marks[segIdx * 2 + 1];
                  const leftPct = (segM1 / config.pageHeight) * 85;
                  const widthPct = Math.max(1, ((segM2 - segM1) / config.pageHeight) * 85);

                  return (
                    <div
                      key={segIdx}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                      className="absolute top-1.5 bottom-1.5 bg-amber-400/50 border-x-2 border-amber-600 flex items-center justify-center text-[9px] font-bold text-amber-950 rounded-sm"
                    >
                      Pli {segIdx + 1}
                    </div>
                  );
                })}

                <span className="text-[10px] text-stone-400 absolute left-2 top-0.5 font-mono">Haut (0)</span>
                <span className="text-[10px] text-stone-400 absolute right-2 bottom-0.5 font-mono">
                  Bas ({config.pageHeight})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-stone-400">
              <span className="text-2xl block mb-1">📖</span>
              <span className="font-semibold text-stone-600 block text-sm">Feuillet sans pli</span>
              <p className="text-xs mt-1">Laissez cette page droite ou pliez-la selon vos préférences.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
