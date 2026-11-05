/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, FileDown, FileSpreadsheet, HardDrive, Check, Printer, Sparkles } from 'lucide-react';
import { BookConfig, PatternSource } from '../types/bookfold';
import { GeneratedPattern } from '../utils/patternGenerator';
import { generateBookfoldPDF, PDFExportOptions } from '../utils/pdfGenerator';
import { exportStandaloneWindowsHtml } from '../utils/standaloneHtmlExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: GeneratedPattern | null;
  config: BookConfig;
  source: PatternSource;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pattern,
  config,
  source,
}) => {
  const [projectTitle, setProjectTitle] = useState<string>(
    source.mode === 'text' && source.text ? `Livre Plié - ${source.text.toUpperCase()}` : 'Mon Patron Bookfold'
  );
  const [includeCover, setIncludeCover] = useState<boolean>(true);
  const [includeTable, setIncludeTable] = useState<boolean>(true);
  const [includeStrips, setIncludeStrips] = useState<boolean>(true);
  const [includeCombPattern, setIncludeCombPattern] = useState<boolean>(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  if (!isOpen || !pattern) return null;

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      try {
        const options: PDFExportOptions = {
          includeCover,
          includeTable,
          includeStrips,
          includeCombPattern,
          projectTitle,
        };
        const doc = generateBookfoldPDF(pattern, config, source, options);
        doc.save(`${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_patron.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 150);
  };

  const handleDownloadCSV = () => {
    let csv = `Feuillet,Page_Livre,Repere_1_Haut_${config.unit},Repere_2_Bas_${config.unit}\n`;
    pattern.leaves.forEach((l) => {
      const m1 = l.marks[0] !== undefined ? l.marks[0] : '';
      const m2 = l.marks[1] !== undefined ? l.marks[1] : '';
      csv += `${l.leafIndex},${l.bookPageNumber},${m1},${m2}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_mesures.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 p-4 px-6 flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-500" />
              Exporter le Patron & Guides d'Impression
            </h3>
            <p className="text-xs text-stone-400">
              Prêt pour impression A4 ou utilisation locale sous Windows
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Titre du projet (affiché sur le PDF)
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* PDF Options */}
          <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-xs font-bold text-stone-800 block mb-2">
              Contenu à inclure dans le document PDF :
            </span>

            <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
              />
              <div>
                <span className="font-bold block text-stone-900">
                  Page de couverture & Guide pas-à-pas illustré
                </span>
                <span className="text-[11px] text-stone-500">
                  Récapitulatif des paramètres du livre, numéros de début/fin, et méthode MMF illustrée.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeTable}
                onChange={(e) => setIncludeTable(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
              />
              <div>
                <span className="font-bold block text-stone-900">
                  Grand tableau des mesures avec cases à cocher
                </span>
                <span className="text-[11px] text-stone-500">
                  Tableau dense et économique en papier (3 colonnes par page A4) avec cases à cocher.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeStrips}
                onChange={(e) => setIncludeStrips(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
              />
              <div>
                <span className="font-bold block text-stone-900 flex items-center gap-1.5">
                  <span>Réglettes / Bandes de pliage à découper (Style Mint & Heritage)</span>
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-bold text-[9px]">
                    Populaire
                  </span>
                </span>
                <span className="text-[11px] text-stone-500">
                  Bandes verticales à l'échelle 1:1 à découper et glisser entre les pages pour marquer les plis instantanément.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer pt-1 border-t border-stone-200/60">
              <input
                type="checkbox"
                checked={includeCombPattern}
                onChange={(e) => setIncludeCombPattern(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
              />
              <div>
                <span className="font-bold block text-stone-900 flex items-center gap-1.5">
                  <span>Patron Visuel Continu en Peigne (Multi-pages A4 à assembler)</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[9px]">
                    Nouveau
                  </span>
                </span>
                <span className="text-[11px] text-stone-500">
                  Comme sur votre photo : grand patron continu découpé sur plusieurs pages A4 avec zones grisées, repères de raccordement, carré de calibration 20×20 mm et ligne d'appui du livre.
                </span>
              </div>
            </label>
          </div>

          {/* Action 1: Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <FileDown className="w-5 h-5" />
            <span>{isGeneratingPDF ? 'Génération du PDF en cours...' : 'Télécharger le PDF d\'Impression A4'}</span>
          </button>

          {/* Action 2: CSV Export */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exporter en Tableau CSV (Excel)</span>
            </button>
          </div>

          {/* Action 3: Windows Standalone HTML file */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-xs text-emerald-950">
                Application Autonome pour Dossier Windows
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Téléchargez l'application sous la forme d'un fichier HTML unique. Vous pourrez le copier dans n'importe quel dossier Windows et l'utiliser hors-ligne par simple double-clic.
            </p>
            <button
              onClick={exportStandaloneWindowsHtml}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow flex items-center justify-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Télécharger l'Application HTML (.html) pour Windows</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-6 bg-stone-100 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
