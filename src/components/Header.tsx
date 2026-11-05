/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, FileDown, Download, HelpCircle, HardDrive } from 'lucide-react';

interface HeaderProps {
  onOpenTutorial: () => void;
  onOpenExportModal: () => void;
  onExportStandaloneHtml: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTutorial,
  onOpenExportModal,
  onExportStandaloneHtml,
}) => {
  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md border border-amber-500/40">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-white tracking-tight">
                Générateur de Bookfold Art
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Style Mint & Heritage
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Patrons de pliage de livre sur mesure (MMF) • Guides imprimables & 3D
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Windows Standalone Offline Exporter button */}
          <button
            onClick={onExportStandaloneHtml}
            title="Télécharger l'application en un fichier HTML unique autonome, utilisable dans n'importe quel dossier Windows sans connexion internet"
            className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 border border-emerald-800/80 font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Enregistrer en</span> Fichier HTML Windows
          </button>

          <button
            onClick={onOpenTutorial}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guide &</span> Astuces
          </button>

          <button
            onClick={onOpenExportModal}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span>Exporter PDF / Patron</span>
          </button>
        </div>
      </div>
    </header>
  );
};
