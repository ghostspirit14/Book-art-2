/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import { BookConfig, PatternSource } from '../types/bookfold';
import { GeneratedPattern } from './patternGenerator';

export interface PDFExportOptions {
  includeCover: boolean;
  includeTable: boolean;
  includeStrips: boolean;
  includeCombPattern: boolean;
  projectTitle: string;
}

export function generateBookfoldPDF(
  pattern: GeneratedPattern,
  config: BookConfig,
  source: PatternSource,
  options: PDFExportOptions
): jsPDF {
  // A4 dimensions: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let isFirstPage = true;

  // Helper for adding new page safely
  const ensurePage = () => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;
  };

  // Helper header/footer
  const addHeaderFooter = (pageTitle: string, pageNum: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Patron de Pliage de Livre - ${options.projectTitle || 'Bookfold'}`, margin, 10);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 10, { align: 'right' });
    doc.line(margin, 12, pageWidth - margin, 12);

    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text('Généré par Générateur de Bookfold Art (Style Mint & Heritage)', margin, pageHeight - 6);
    doc.text(`Unité : ${config.unit.toUpperCase()} | Méthode : ${config.method.toUpperCase()}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  let currentPageIndex = 1;

  // ==========================================
  // PAGE 1: COVER & INSTRUCTIONS
  // ==========================================
  if (options.includeCover) {
    ensurePage();
    addHeaderFooter('Fiche Récapitulative & Instructions', currentPageIndex++);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(40, 30, 20);
    doc.text(options.projectTitle || 'Patron de Pliage de Livre', margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Guide complet et patron haute précision pour art du pliage de livre', margin, 33);

    // Summary Box
    doc.setFillColor(248, 245, 240);
    doc.roundedRect(margin, 38, contentWidth, 54, 3, 3, 'F');
    doc.setDrawColor(220, 210, 195);
    doc.roundedRect(margin, 38, contentWidth, 54, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 45, 40);
    doc.text('PARAMÈTRES DU LIVRE & DU MOTIF', margin + 6, 46);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70, 65, 60);

    const leftColX = margin + 6;
    const rightColX = margin + contentWidth / 2 + 4;
    const endBookPage = pattern.effectiveStartPage + (pattern.leaves.length - 1) * 2;
    const totalBookLeaves = Math.floor(config.totalBookPages / 2);
    const startLeaf = Math.round((pattern.effectiveStartPage - config.firstNumberedPage) / 2) + 1;
    const unusedStartLeaves = Math.max(0, startLeaf - 1);
    const unusedEndLeaves = Math.max(0, totalBookLeaves - (startLeaf + pattern.leaves.length - 1));

    doc.text(`• Total pages du livre : ${config.totalBookPages} pages (${totalBookLeaves} feuillets)`, leftColX, 54);
    doc.text(`• Feuillets pliés pour le motif : ${pattern.leaves.length} feuillets`, leftColX, 61);
    doc.text(`• Première page pliée : Page ${pattern.effectiveStartPage}`, leftColX, 68);
    doc.text(`• Dernière page pliée : Page ${endBookPage}`, leftColX, 75);
    doc.text(`• Feuillets vierges au début : ${unusedStartLeaves} (${unusedStartLeaves * 2} pages)`, leftColX, 82);

    doc.text(`• Hauteur du livre : ${config.pageHeight} ${config.unit}`, rightColX, 54);
    doc.text(`• Marges de sécurité : Haut ${config.marginTop} ${config.unit} | Bas ${config.marginBottom} ${config.unit}`, rightColX, 61);
    doc.text(`• Méthode de pliage : ${config.method === 'mmf' ? 'MMF (Mesurer, Marquer, Plier)' : config.method === 'cut_and_fold' ? 'Cut & Fold (Découpe)' : 'Multi-repères'}`, rightColX, 68);
    doc.text(`• Feuillets vierges à la fin : ${unusedEndLeaves} (${unusedEndLeaves * 2} pages)`, rightColX, 75);
    doc.text(`• Statut centrage : ${config.autoCenter ? 'Centré automatiquement' : 'Position manuelle'}`, rightColX, 82);

    // Pattern Preview image
    try {
      const dataUrl = pattern.previewCanvas.toDataURL('image/png');
      const previewW = contentWidth;
      const previewH = 42;
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, 98, previewW, previewH, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, 98, previewW, previewH, 'S');
      doc.addImage(dataUrl, 'PNG', margin + 2, 100, previewW - 4, previewH - 4);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Aperçu du motif déplié sur la tranche du livre', margin, 145);
    } catch {
      // Ignore preview image error
    }

    // Step-by-Step Instructions (Mint & Heritage Style)
    const instY = 152;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 35, 30);
    doc.text('GUIDE PAS-À-PAS DU PLIAGE DE LIVRE (MÉTHODE MMF)', margin, instY);

    const steps = [
      {
        num: '1',
        title: 'Préparer le livre',
        desc: `Placez le livre à plat devant vous. Ouvrez-le à la page ${pattern.effectiveStartPage} (premier feuillet du motif). Laissez les premières ${unusedStartLeaves * 2} pages non pliées.`,
      },
      {
        num: '2',
        title: 'Reporter les repères',
        desc: `Prenez une règle de précision (ou découpez nos bandelettes imprimées). Alignez le 0 tout en haut de la page. Faites un point léger au crayon pour le Repère 1 (Haut) et le Repère 2 (Bas).`,
      },
      {
        num: '3',
        title: 'Plier les coins vers l\'intérieur',
        desc: `Prenez le coin supérieur droit et pliez-le vers la reliure jusqu\'au premier point (angle de 90° ou 45°). Faites de même pour le coin inférieur droit jusqu\'au second point.`,
      },
      {
        num: '4',
        title: 'Marquer le pli et cocher la ligne',
        desc: `Passez un plioir (ou le dos d\'une règle) pour bien aplatir le pli. Cochez la case dans le tableau pour ne jamais perdre votre page, puis tournez la feuille !`,
      },
    ];

    let stepCursorY = instY + 8;
    steps.forEach((step) => {
      doc.setFillColor(180, 83, 9); // Amber 700
      doc.circle(margin + 4, stepCursorY + 3, 3.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(step.num, margin + 4, stepCursorY + 4.2, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 35, 30);
      doc.text(step.title, margin + 11, stepCursorY + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 75, 70);
      const splitDesc = doc.splitTextToSize(step.desc, contentWidth - 14);
      doc.text(splitDesc, margin + 11, stepCursorY + 9);

      stepCursorY += 16;
    });

    // Pro Tips Box
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, stepCursorY + 2, contentWidth, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('ASTUCE DE PRO MINT & HERITAGE :', margin + 5, stepCursorY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const tipText = 'Si une page n\'a pas de repère dans le tableau, pliez simplement la page entière à 90° ou laissez-la dépliée selon l\'effet de fond souhaité. Utilisez un élastique ou un ruban pour maintenir les pages déjà pliées.';
    doc.text(doc.splitTextToSize(tipText, contentWidth - 10), margin + 5, stepCursorY + 12);
  }

  // ==========================================
  // PAGE 2+: MEASUREMENT TABLES (Tableau de repères)
  // ==========================================
  if (options.includeTable) {
    const leaves = pattern.leaves;
    const colsCount = 3; // 3 columns per page to maximize density and save paper
    const colGap = 4;
    const colW = (contentWidth - colGap * (colsCount - 1)) / colsCount;
    const rowH = 5.2;
    const tableStartY = 20;
    const tableMaxY = pageHeight - 16;
    const rowsPerPage = Math.floor((tableMaxY - tableStartY - 8) / rowH);
    const leavesPerPage = rowsPerPage * colsCount;

    const totalTablePages = Math.ceil(leaves.length / leavesPerPage);

    for (let p = 0; p < totalTablePages; p++) {
      ensurePage();
      addHeaderFooter(`Tableau des Mesures (${p + 1}/${totalTablePages})`, currentPageIndex++);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(40, 30, 20);
      doc.text(`TABLEAU DES MESURES PAGE PAR PAGE (Unité : ${config.unit.toUpperCase()})`, margin, 17);

      const pageLeaves = leaves.slice(p * leavesPerPage, (p + 1) * leavesPerPage);

      // Render columns
      for (let c = 0; c < colsCount; c++) {
        const colStartX = margin + c * (colW + colGap);
        const colLeaves = pageLeaves.slice(c * rowsPerPage, (c + 1) * rowsPerPage);
        if (colLeaves.length === 0) continue;

        // Column Header
        doc.setFillColor(235, 230, 220);
        doc.rect(colStartX, tableStartY, colW, 6.5, 'F');
        doc.setDrawColor(200, 190, 180);
        doc.rect(colStartX, tableStartY, colW, 6.5, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(60, 50, 40);

        doc.text('F.', colStartX + 4, tableStartY + 4.5);
        doc.text('Page', colStartX + 12, tableStartY + 4.5);
        doc.text('Haut', colStartX + 27, tableStartY + 4.5);
        doc.text('Bas', colStartX + 42, tableStartY + 4.5);

        // Rows
        colLeaves.forEach((leaf, rIdx) => {
          const rowY = tableStartY + 6.5 + rIdx * rowH;
          const isEven = rIdx % 2 === 0;

          if (isEven) {
            doc.setFillColor(252, 250, 246);
            doc.rect(colStartX, rowY, colW, rowH, 'F');
          }
          doc.setDrawColor(230, 225, 220);
          doc.rect(colStartX, rowY, colW, rowH, 'S');

          // Checkbox square
          doc.setDrawColor(160, 150, 140);
          doc.rect(colStartX + 1.5, rowY + 1.2, 2.8, 2.8, 'S');

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(70, 65, 60);

          // Leaf index
          doc.text(`${leaf.leafIndex}`, colStartX + 5.5, rowY + 3.8);

          // Book page number (bold)
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 30, 30);
          doc.text(`p.${leaf.bookPageNumber}`, colStartX + 12, rowY + 3.8);

          // Marks
          doc.setFont('helvetica', 'normal');
          if (leaf.marks.length >= 2) {
            doc.setTextColor(180, 83, 9); // Amber for mark 1
            doc.text(`${leaf.marks[0]}`, colStartX + 27, rowY + 3.8);

            doc.setTextColor(3, 105, 161); // Blue for mark 2
            doc.text(`${leaf.marks[1]}`, colStartX + 42, rowY + 3.8);

            // If extra marks (multi-mark)
            if (leaf.marks.length > 2) {
              doc.setFontSize(6);
              doc.setTextColor(100, 100, 100);
              doc.text(`(+${leaf.marks.length - 2})`, colStartX + colW - 6, rowY + 3.8);
            }
          } else {
            doc.setTextColor(160, 160, 160);
            doc.text('-', colStartX + 28, rowY + 3.8);
            doc.text('-', colStartX + 43, rowY + 3.8);
          }
        });
      }
    }
  }

  // ==========================================
  // PAGE 3+: PRINTABLE STRIP RULERS (Réglettes de pliage Mint & Heritage)
  // ==========================================
  if (options.includeStrips) {
    const leaves = pattern.leaves;
    // Scale to real book height: 1 cm in real life = 10 mm in PDF
    const bookHeightMm = config.unit === 'cm' ? config.pageHeight * 10 : config.pageHeight;
    const maxBookHeightOnA4 = 240; // max mm printable on A4 with margins
    const scaleFactor = bookHeightMm > maxBookHeightOnA4 ? maxBookHeightOnA4 / bookHeightMm : 1;
    const displayHeightMm = bookHeightMm * scaleFactor;

    const stripWidthMm = 14;
    const stripGapMm = 2.5;
    const stripsPerPage = Math.floor(contentWidth / (stripWidthMm + stripGapMm));
    const totalStripPages = Math.ceil(leaves.length / stripsPerPage);

    for (let sp = 0; sp < totalStripPages; sp++) {
      ensurePage();
      addHeaderFooter(`Réglettes de Pliage à Découper (${sp + 1}/${totalStripPages})`, currentPageIndex++);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 30, 20);
      doc.text('RÉGLETTES DE PLIAGE RAPIDE À DÉCOUPER (Style Mint & Heritage)', margin, 17);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const isScaled = scaleFactor < 1;
      doc.text(
        isScaled
          ? `Échelle ajustée (${Math.round(scaleFactor * 100)}%) pour tenir sur A4. Découpez chaque bande et alignez-la avec le haut et le bas de la page.`
          : 'Échelle 1:1 exacte ! Découpez chaque bande le long des pointillés et glissez-la contre la page pour marquer les plis instantanément.',
        margin,
        22
      );

      const stripStartY = 28;
      const pageStrips = leaves.slice(sp * stripsPerPage, (sp + 1) * stripsPerPage);

      pageStrips.forEach((leaf, sIdx) => {
        const stripX = margin + sIdx * (stripWidthMm + stripGapMm);

        // Strip border (dotted for cutting)
        doc.setDrawColor(180, 175, 170);
        doc.setLineDashPattern([1, 1], 0);
        doc.rect(stripX, stripStartY, stripWidthMm, displayHeightMm, 'S');
        doc.setLineDashPattern([], 0); // reset to solid

        // Header info on strip
        doc.setFillColor(245, 240, 230);
        doc.rect(stripX + 0.5, stripStartY + 0.5, stripWidthMm - 1, 9, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(40, 40, 40);
        doc.text(`F.${leaf.leafIndex}`, stripX + stripWidthMm / 2, stripStartY + 4, { align: 'center' });
        doc.setFontSize(6);
        doc.text(`p.${leaf.bookPageNumber}`, stripX + stripWidthMm / 2, stripStartY + 7.5, { align: 'center' });

        // Footer info on strip
        doc.setFillColor(245, 240, 230);
        doc.rect(stripX + 0.5, stripStartY + displayHeightMm - 6.5, stripWidthMm - 1, 6, 'F');
        doc.setFontSize(5.5);
        doc.text(`F.${leaf.leafIndex}`, stripX + stripWidthMm / 2, stripStartY + displayHeightMm - 2.5, { align: 'center' });

        // Fold lines on strip (all segments in multi-mark)
        if (leaf.marks.length >= 2) {
          for (let m = 0; m < leaf.marks.length; m += 2) {
            if (leaf.marks[m + 1] === undefined) break;

            const m1 = leaf.marks[m];
            const m2 = leaf.marks[m + 1];

            // Convert mark to mm from top
            const m1Mm = (config.unit === 'cm' ? m1 * 10 : m1) * scaleFactor;
            const m2Mm = (config.unit === 'cm' ? m2 * 10 : m2) * scaleFactor;

            const lineY1 = stripStartY + m1Mm;
            const lineY2 = stripStartY + m2Mm;

            // Fill shaded area between marks (the fold zone!)
            if (lineY2 > lineY1) {
              doc.setFillColor(254, 243, 199); // Amber tint
              doc.rect(stripX + 1, lineY1, stripWidthMm - 2, lineY2 - lineY1, 'F');
            }

            // Mark 1 Line
            doc.setDrawColor(217, 119, 6); // Amber
            doc.setLineWidth(0.35);
            doc.line(stripX, lineY1, stripX + stripWidthMm, lineY1);

            // Mark 2 Line
            doc.setDrawColor(2, 132, 199); // Blue
            doc.setLineWidth(0.35);
            doc.line(stripX, lineY2, stripX + stripWidthMm, lineY2);

            doc.setLineWidth(0.2); // reset

            // Text label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(4.8);
            doc.setTextColor(180, 83, 9);
            doc.text(`${m1}`, stripX + stripWidthMm / 2, lineY1 - 0.6, { align: 'center' });

            doc.setTextColor(3, 105, 161);
            doc.text(`${m2}`, stripX + stripWidthMm / 2, lineY2 + 2.0, { align: 'center' });
          }
        } else {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(5.5);
          doc.setTextColor(160, 160, 160);
          doc.text('Pas de pli', stripX + stripWidthMm / 2, stripStartY + displayHeightMm / 2, { align: 'center' });
        }
      });
    }
  }

  // ==========================================
  // PAGE 4+: PATRON VISUEL CONTINU EN PEIGNE (Comb Pattern Multi-pages A4)
  // ==========================================
  if (options.includeCombPattern) {
    const leaves = pattern.leaves;
    const bookHeightMm = config.unit === 'cm' ? config.pageHeight * 10 : config.pageHeight;
    const maxPatternHeightMm = 225; // max printable height on A4 portrait with headers & alignment footer
    const scaleFactor = bookHeightMm > maxPatternHeightMm ? maxPatternHeightMm / bookHeightMm : 1.0;
    const displayHeightMm = bookHeightMm * scaleFactor;

    const leftRulerWidth = 14; // mm for metric ruler along left side
    const rightMargin = 14;    // mm for overlap connection zone
    const usableWidthMm = pageWidth - margin - leftRulerWidth - rightMargin;

    // Width per leaf column (approx 3.2 mm for high precision)
    const colWidthMm = 3.2;
    const leavesPerSheet = Math.floor(usableWidthMm / colWidthMm);
    const totalCombPages = Math.ceil(leaves.length / leavesPerSheet);

    const startY = 36;
    const bottomY = startY + displayHeightMm;

    for (let cp = 0; cp < totalCombPages; cp++) {
      ensurePage();
      const sheetLeaves = leaves.slice(cp * leavesPerSheet, (cp + 1) * leavesPerSheet);
      const firstLeaf = sheetLeaves[0];
      const lastLeaf = sheetLeaves[sheetLeaves.length - 1];

      addHeaderFooter(`Patron Visuel Continu (${cp + 1}/${totalCombPages})`, currentPageIndex++);

      // Sheet Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 30, 20);
      doc.text(
        `PATRON VISUEL CONTINU EN PEIGNE — Feuille ${cp + 1} / ${totalCombPages}`,
        margin,
        18
      );

      // Subtitle & Leaf Range
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(90, 80, 70);
      doc.text(
        `Feuillets #${firstLeaf.leafIndex} à #${lastLeaf.leafIndex} (Pages ${firstLeaf.bookPageNumber} à ${lastLeaf.bookPageNumber} du livre) • ${scaleFactor === 1 ? 'Échelle 1:1 Réelle' : `Échelle ${Math.round(scaleFactor * 100)}%`}`,
        margin,
        22.5
      );

      // Instructions under title
      doc.setFontSize(7);
      doc.setTextColor(110, 100, 90);
      doc.text(
        'Posez le bas de la page du livre sur la ligne d\'alignement inférieure et marquez les zones grisées au crayon.',
        margin,
        26.5
      );

      // Calibration Square (20 mm x 20 mm) at top right
      const testSquareX = pageWidth - margin - 22;
      const testSquareY = 14;
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.3);
      doc.rect(testSquareX, testSquareY, 20, 20, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(60, 60, 60);
      doc.text('TEST ÉCHELLE', testSquareX + 10, testSquareY + 7, { align: 'center' });
      doc.text('20 mm × 20 mm', testSquareX + 10, testSquareY + 12, { align: 'center' });
      doc.setFontSize(4.5);
      doc.setFont('helvetica', 'normal');
      doc.text('100% réel', testSquareX + 10, testSquareY + 16, { align: 'center' });

      // Left Vertical Ruler (Règle graduée sur le bord gauche)
      const rulerX = margin;
      doc.setFillColor(248, 245, 240);
      doc.rect(rulerX, startY, leftRulerWidth, displayHeightMm, 'F');
      doc.setDrawColor(180, 170, 160);
      doc.rect(rulerX, startY, leftRulerWidth, displayHeightMm, 'S');

      // Draw cm ticks on left ruler
      const totalCm = Math.ceil(config.pageHeight);
      for (let cm = 0; cm <= totalCm; cm++) {
        const tickY = startY + (cm / config.pageHeight) * displayHeightMm;
        if (tickY <= bottomY + 0.5) {
          doc.setDrawColor(120, 110, 100);
          doc.line(rulerX + leftRulerWidth - 5, tickY, rulerX + leftRulerWidth, tickY);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          doc.setTextColor(60, 50, 40);
          doc.text(`${cm}`, rulerX + 3, tickY + 1.8);
        }
      }

      // Grid start X
      const gridStartX = rulerX + leftRulerWidth;
      const actualGridWidth = sheetLeaves.length * colWidthMm;

      // Draw horizontal guide lines across the whole grid every 1 cm and 5 mm
      for (let cm = 0; cm <= totalCm; cm++) {
        const lineY = startY + (cm / config.pageHeight) * displayHeightMm;
        if (lineY <= bottomY) {
          doc.setDrawColor(220, 215, 210);
          doc.setLineWidth(0.2);
          doc.line(gridStartX, lineY, gridStartX + actualGridWidth, lineY);
        }
      }

      // Draw Each Leaf Column in this Sheet
      sheetLeaves.forEach((leaf, idx) => {
        const colX = gridStartX + idx * colWidthMm;

        // Vertical column separator line
        doc.setDrawColor(200, 195, 190);
        doc.setLineWidth(0.15);
        doc.line(colX, startY - 7, colX, bottomY + 7);

        // Header column labels (Leaf # & Page #)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(40, 40, 40);
        // Vertical or compact header
        doc.text(`${leaf.leafIndex}`, colX + colWidthMm / 2, startY - 4, { align: 'center' });
        doc.setFontSize(4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 100, 80);
        doc.text(`${leaf.bookPageNumber}`, colX + colWidthMm / 2, startY - 1, { align: 'center' });

        // Footer column labels
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4.5);
        doc.setTextColor(60, 60, 60);
        doc.text(`${leaf.leafIndex}`, colX + colWidthMm / 2, bottomY + 4, { align: 'center' });

        // Shaded Fold Segments for this Leaf Column
        if (leaf.marks && leaf.marks.length >= 2) {
          for (let m = 0; m < leaf.marks.length; m += 2) {
            if (leaf.marks[m + 1] === undefined) break;

            const m1 = leaf.marks[m];
            const m2 = leaf.marks[m + 1];

            const segTopY = startY + (m1 / config.pageHeight) * displayHeightMm;
            const segBotY = startY + (m2 / config.pageHeight) * displayHeightMm;
            const segHeight = Math.max(0.6, segBotY - segTopY);

            // Shaded dark block for the pattern shape (like in the user's photo!)
            doc.setFillColor(55, 65, 81); // Slate-700
            doc.rect(colX, segTopY, colWidthMm, segHeight, 'F');

            // Top and bottom boundary lines
            doc.setDrawColor(17, 24, 39); // Dark border
            doc.setLineWidth(0.25);
            doc.line(colX, segTopY, colX + colWidthMm, segTopY);
            doc.line(colX, segBotY, colX + colWidthMm, segBotY);
          }
        }
      });

      // Right boundary of the grid
      const gridEndX = gridStartX + actualGridWidth;
      doc.setDrawColor(160, 150, 140);
      doc.setLineWidth(0.3);
      doc.line(gridEndX, startY - 7, gridEndX, bottomY + 7);

      // Overlap Connection Strip on Right (Zone de raccord pour coller la feuille suivante)
      if (cp < totalCombPages - 1) {
        const overlapX = gridEndX + 2;
        doc.setDrawColor(180, 140, 100);
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(overlapX, startY - 7, overlapX, bottomY + 7);
        doc.setLineDashPattern([], 0); // reset

        doc.setFillColor(254, 243, 199);
        doc.rect(overlapX + 0.5, startY, 8, displayHeightMm, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(180, 83, 9);
        // Vertical text in overlap zone
        doc.text('LIGNE DE RACCORD', overlapX + 5, startY + displayHeightMm / 2, {
          angle: 90,
          align: 'center',
        });
      }

      // Bottom Book Alignment Baseline (Ligne d'alignement du bas du livre)
      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.8);
      doc.line(rulerX, bottomY, gridEndX + 10, bottomY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(180, 83, 9);
      doc.text(
        '▲ ▲ ▲ ALIGNER LE BAS DE LA PAGE DU LIVRE SUR CETTE LIGNE ▲ ▲ ▲',
        gridStartX + actualGridWidth / 2,
        bottomY + 12,
        { align: 'center' }
      );
    }
  }

  return doc;
}
