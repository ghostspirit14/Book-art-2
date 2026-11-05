/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, CheckSquare, Sparkles, AlertCircle, Scissors } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 px-6 flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Guide Complet du Pliage de Livre (Style Mint & Heritage)
            </h3>
            <p className="text-xs text-stone-400">
              Technique Measure, Mark & Fold (MMF) pas à pas pour les débutants et passionnés
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-stone-800 text-xs leading-relaxed">
          {/* Section 1: Choosing a Book */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-sans font-bold">
                1
              </span>
              Comment bien choisir son livre
            </h4>
            <p>
              Le choix du livre est déterminant pour la réussite de votre œuvre :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>
                <strong>Couverture rigide (Hardcover) :</strong> Idéale car elle permet au livre de tenir debout tout seul comme une sculpture décorative.
              </li>
              <li>
                <strong>Nombre de pages :</strong> Choisissez un livre qui a <em>au moins</em> 40 à 60 pages de plus que le nombre requis par le motif pour laisser des feuilles blanches élégantes au début et à la fin.
              </li>
              <li>
                <strong>Épaisseur du papier :</strong> Un papier standard de roman (80g/m²) est parfait. Évitez les papiers glacés ou trop fins (comme les dictionnaires).
              </li>
            </ul>
          </div>

          {/* Section 2: Equipment */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-sans font-bold">
                2
              </span>
              Le matériel indispensable
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block mb-0.5">📏 Règle ou Réglettes</span>
                <span className="text-stone-600">
                  Une règle métallique millimétrée ou les <strong>réglettes découpables</strong> générées par notre application.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block mb-0.5">✏️ Crayon à papier fin</span>
                <span className="text-stone-600">
                  Un critérium fin (0.5 mm) ou crayon bien taillé pour des repères discrets et précis.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block mb-0.5">🦴 Plioir (Bone folder)</span>
                <span className="text-stone-600">
                  Un plioir en os ou en plastique (ou le dos d'une règle) pour marquer des plis nets sans froisser le papier.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block mb-0.5">🎗️ Ruban ou Élastique</span>
                <span className="text-stone-600">
                  Pour maintenir les pages déjà pliées sur le côté et garder votre champ de travail dégagé.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: The MMF Technique Step by Step */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-sans font-bold">
                3
              </span>
              La technique MMF (Measure, Mark & Fold) pas à pas
            </h4>

            <div className="space-y-2 text-stone-600">
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-700 font-mono">A.</span>
                <div>
                  <strong>Ouvrez à la première page pliée :</strong> Utilisez la valeur de début (ex: Page 81) calculée par l'application. Ne pliez pas les pages précédentes.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-700 font-mono">B.</span>
                <div>
                  <strong>Placer la mesure :</strong> Posez votre règle le long de la tranche verticale de la page, avec le <strong>0 calé tout en haut</strong> de la page.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-700 font-mono">C.</span>
                <div>
                  <strong>Faire les deux repères :</strong> Marquez au crayon un petit point pour le <em>Repère 1 (Haut)</em> et un second pour le <em>Repère 2 (Bas)</em>.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-700 font-mono">D.</span>
                <div>
                  <strong>Plier vers l'intérieur :</strong> Prenez le coin supérieur droit de la feuille et pliez-le vers la reliure intérieure jusqu'au premier point. Faites de même pour le coin inférieur droit jusqu'au second point.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-700 font-mono">E.</span>
                <div>
                  <strong>Lisser le pli :</strong> Appuyez fermement avec votre plioir pour obtenir une arête parfaitement droite et nette.
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-700 font-mono">F.</span>
                <div>
                  <strong>Cocher le tableau :</strong> Cochez la ligne dans le tableau ou sur l'application, tournez la page et recommencez pour le feuillet suivant !
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 space-y-1.5 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Astuces d'expert Mint & Heritage :</span>
            </div>
            <p className="text-[11px] text-amber-800">
              • Utilisez les <strong>réglettes de pliage à découper</strong> : en imprimant les bandelettes fournies dans le PDF, vous gagnez jusqu'à 60% de temps en évitant d'avoir à regarder la graduation d'une règle physique à chaque page !
            </p>
            <p className="text-[11px] text-amber-800">
              • Maintenez une pression et un angle constants tout au long du livre pour que le relief soit uniforme et sans vagues.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-stone-100 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            J'ai compris, commencer mon pliage
          </button>
        </div>
      </div>
    </div>
  );
};
