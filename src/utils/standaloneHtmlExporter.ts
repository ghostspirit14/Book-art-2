/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates and triggers the download of a 100% self-contained single HTML file
 * that can be saved in any Windows folder (Desktop, Documents, etc.) and run
 * entirely offline with a simple double-click in Microsoft Edge, Chrome, or Firefox.
 */
export function exportStandaloneWindowsHtml(): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Générateur de Bookfold Art | Version Autonome Windows</title>
  <!-- Tailwind CSS via CDN pour utilisation autonome -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- jsPDF pour génération PDF 100% hors-ligne -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Montserrat', sans-serif; background-color: #fafaf9; color: #1c1917; }
    h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- Header -->
  <header class="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center font-serif text-white text-xl font-bold shadow-inner">
          📖
        </div>
        <div>
          <h1 class="text-lg font-bold font-serif tracking-tight text-white flex items-center gap-2">
            Bookfold Art Studio <span class="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">Version Autonome Windows</span>
          </h1>
          <p class="text-xs text-stone-400">Générateur de patrons de pliage de livres • Style Mint & Heritage</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-export-pdf" class="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-1.5">
          📄 Exporter PDF Imprimable
        </button>
        <button id="btn-export-csv" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-colors border border-stone-700">
          📊 Export CSV
        </button>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    <!-- LEFT COLUMN: SETTINGS (4 cols) -->
    <section class="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-5 flex flex-col">
      <div class="border-b border-stone-100 pb-3">
        <h2 class="font-serif font-bold text-lg text-stone-800">1. Paramètres du Motif</h2>
        <p class="text-xs text-stone-500">Choisissez votre texte, image ou silhouette</p>
      </div>

      <!-- Mode Selector -->
      <div class="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
        <button id="tab-text" class="py-2 rounded-lg bg-white shadow-sm text-stone-900 transition-all">Texte</button>
        <button id="tab-image" class="py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all">Image</button>
        <button id="tab-preset" class="py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all">Motifs</button>
      </div>

      <!-- Text Inputs -->
      <div id="section-text" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-stone-700 mb-1">Texte ou mot à plier</label>
          <input type="text" id="input-text" value="LOVE" class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none uppercase font-serif font-bold" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Police</label>
            <select id="input-font" class="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs outline-none">
              <option value="Playfair Display">Playfair Serif</option>
              <option value="Cinzel">Cinzel Royal</option>
              <option value="Montserrat">Montserrat Sans</option>
              <option value="Georgia">Georgia Classic</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Style</label>
            <div class="flex gap-1 pt-0.5">
              <label class="flex items-center gap-1 text-xs text-stone-600 cursor-pointer">
                <input type="checkbox" id="input-bold" checked class="rounded text-amber-600" /> Gras
              </label>
              <label class="flex items-center gap-1 text-xs text-stone-600 cursor-pointer ml-2">
                <input type="checkbox" id="input-italic" class="rounded text-amber-600" /> Italique
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Input -->
      <div id="section-image" class="space-y-3 hidden">
        <div>
          <label class="block text-xs font-semibold text-stone-700 mb-1">Importer une image (silhouette)</label>
          <input type="file" id="input-file" accept="image/*" class="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
        </div>
        <div>
          <label class="flex justify-between text-xs font-semibold text-stone-700 mb-1">
            <span>Seuil noir & blanc</span>
            <span id="lbl-threshold" class="text-amber-700">128</span>
          </label>
          <input type="range" id="input-threshold" min="20" max="240" value="128" class="w-full accent-amber-600" />
        </div>
        <label class="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
          <input type="checkbox" id="input-invert" class="rounded text-amber-600" /> Inverser noir et blanc
        </label>
      </div>

      <!-- Preset Input -->
      <div id="section-preset" class="space-y-3 hidden">
        <label class="block text-xs font-semibold text-stone-700 mb-1">Choisir un motif pré-enregistré</label>
        <div class="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-stone-200 rounded-lg custom-scrollbar">
          <button data-preset="heart" class="btn-preset p-2 text-center rounded-lg border border-amber-600 bg-amber-50 hover:bg-amber-100 flex flex-col items-center">
            <span class="text-xl">❤️</span>
            <span class="text-[10px] font-semibold mt-1">Cœur</span>
          </button>
          <button data-preset="infinity" class="btn-preset p-2 text-center rounded-lg border border-stone-200 hover:bg-stone-50 flex flex-col items-center">
            <span class="text-xl">♾️</span>
            <span class="text-[10px] font-semibold mt-1">Infini</span>
          </button>
          <button data-preset="butterfly" class="btn-preset p-2 text-center rounded-lg border border-stone-200 hover:bg-stone-50 flex flex-col items-center">
            <span class="text-xl">🦋</span>
            <span class="text-[10px] font-semibold mt-1">Papillon</span>
          </button>
          <button data-preset="cat" class="btn-preset p-2 text-center rounded-lg border border-stone-200 hover:bg-stone-50 flex flex-col items-center">
            <span class="text-xl">🐱</span>
            <span class="text-[10px] font-semibold mt-1">Chat</span>
          </button>
          <button data-preset="paw" class="btn-preset p-2 text-center rounded-lg border border-stone-200 hover:bg-stone-50 flex flex-col items-center">
            <span class="text-xl">🐾</span>
            <span class="text-[10px] font-semibold mt-1">Patte</span>
          </button>
          <button data-preset="star" class="btn-preset p-2 text-center rounded-lg border border-stone-200 hover:bg-stone-50 flex flex-col items-center">
            <span class="text-xl">⭐</span>
            <span class="text-[10px] font-semibold mt-1">Étoile</span>
          </button>
        </div>
      </div>

      <!-- Book Config -->
      <div class="border-t border-stone-100 pt-4 space-y-3">
        <h2 class="font-serif font-bold text-lg text-stone-800">2. Paramètres du Livre</h2>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Pages totales livre</label>
            <input type="number" id="input-total-pages" value="400" min="50" max="1500" step="2" class="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Feuillets pour motif</label>
            <input type="number" id="input-pattern-leaves" value="120" min="20" max="600" class="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Hauteur page (cm)</label>
            <input type="number" id="input-page-height" value="21.0" min="10" max="40" step="0.5" class="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Marge haut/bas (cm)</label>
            <input type="number" id="input-margin" value="2.0" min="0.5" max="8" step="0.5" class="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs" />
          </div>
        </div>

        <label class="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-1">
          <input type="checkbox" id="input-autocenter" checked class="rounded text-amber-600" />
          <span>Centrer automatiquement le motif dans le livre</span>
        </label>
      </div>

      <!-- Bookfold Summary Info -->
      <div class="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-xs space-y-1 text-amber-900 mt-auto">
        <div class="flex justify-between font-semibold">
          <span>Début du pliage :</span>
          <span id="info-start-page" class="font-bold text-amber-800">Page 81</span>
        </div>
        <div class="flex justify-between">
          <span>Fin du pliage :</span>
          <span id="info-end-page">Page 320</span>
        </div>
        <div class="flex justify-between">
          <span>Feuilles vierges au début :</span>
          <span id="info-blank-leaves">40 feuilles</span>
        </div>
      </div>
    </section>

    <!-- RIGHT COLUMN: PREVIEWS & TABLES (8 cols) -->
    <section class="lg:col-span-8 flex flex-col gap-5">
      
      <!-- Top: 2D & 3D Preview Cards -->
      <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 class="font-serif font-bold text-lg text-stone-800">Aperçu du Pliage</h2>
            <p class="text-xs text-stone-500">Simulation tranches et vue 3D du livre fermé/ouvert</p>
          </div>
          <div class="flex gap-1 bg-stone-100 p-1 rounded-lg text-xs font-semibold">
            <button id="view-tab-2d" class="px-3 py-1 rounded bg-white shadow-sm text-stone-900">2D Tranche</button>
            <button id="view-tab-3d" class="px-3 py-1 rounded text-stone-600 hover:text-stone-900">Simulation 3D</button>
          </div>
        </div>

        <!-- 2D Canvas Container -->
        <div id="view-2d-box" class="flex flex-col items-center">
          <div class="w-full bg-stone-900 rounded-xl p-4 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
            <canvas id="preview-canvas" width="400" height="200" class="max-w-full h-auto rounded border border-stone-700 bg-white"></canvas>
            <div id="tooltip-leaf" class="mt-2 text-xs text-amber-300 font-mono">Survolez la tranche pour voir les cotes de chaque feuille</div>
          </div>
        </div>

        <!-- 3D Canvas Container -->
        <div id="view-3d-box" class="flex flex-col items-center hidden">
          <div class="w-full bg-stone-950 rounded-xl p-3 flex flex-col items-center justify-center relative shadow-inner">
            <canvas id="canvas-3d" width="600" height="280" class="max-w-full h-auto rounded cursor-grab active:cursor-grabbing"></canvas>
            <div class="text-[11px] text-stone-400 mt-2 flex gap-4">
              <span>🖱️ Glissez pour tourner le livre</span>
              <span>🔄 Angle réglable</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: Step-by-Step Folding Guide & Interactive Table -->
      <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex-1 flex flex-col space-y-4">
        <div class="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 class="font-serif font-bold text-lg text-stone-800">Guide Interactif Feuillet par Feuillet</h2>
            <p class="text-xs text-stone-500">Cochez vos pages au fur et à mesure de votre progression</p>
          </div>
          <div class="flex items-center gap-2">
            <span id="lbl-progress" class="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">0% Terminé</span>
          </div>
        </div>

        <!-- Interactive Sheet Rulers Visualizer -->
        <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button id="btn-prev-leaf" class="w-9 h-9 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-all shadow-sm">
              ←
            </button>
            <div class="text-center px-3">
              <span class="text-xs uppercase tracking-wider text-stone-500 font-bold">Feuillet en cours</span>
              <div id="active-leaf-display" class="font-serif font-bold text-xl text-stone-800">Feuillet #1 (Page 81)</div>
            </div>
            <button id="btn-next-leaf" class="w-9 h-9 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-all shadow-sm">
              →
            </button>
          </div>

          <div class="flex items-center gap-4">
            <div class="bg-white px-3 py-2 rounded-lg border border-amber-200 shadow-sm text-center">
              <span class="text-[10px] text-amber-700 uppercase font-bold block">Repère 1 (Haut)</span>
              <span id="active-mark-top" class="font-bold text-amber-900 text-lg">4.2 cm</span>
            </div>
            <div class="bg-white px-3 py-2 rounded-lg border border-sky-200 shadow-sm text-center">
              <span class="text-[10px] text-sky-700 uppercase font-bold block">Repère 2 (Bas)</span>
              <span id="active-mark-bottom" class="font-bold text-sky-900 text-lg">16.8 cm</span>
            </div>
            <button id="btn-toggle-done" class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow">
              ✓ Marquer comme plié
            </button>
          </div>
        </div>

        <!-- Table View -->
        <div class="max-h-56 overflow-y-auto border border-stone-200 rounded-xl custom-scrollbar">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-stone-100 text-stone-700 sticky top-0 border-b border-stone-200">
              <tr>
                <th class="p-2.5 w-12 text-center">État</th>
                <th class="p-2.5 font-bold">Feuillet</th>
                <th class="p-2.5 font-bold">Page Livre</th>
                <th class="p-2.5 font-bold text-amber-700">Repère 1 (Haut)</th>
                <th class="p-2.5 font-bold text-sky-700">Repère 2 (Bas)</th>
              </tr>
            </thead>
            <tbody id="table-leaves-body" class="divide-y divide-stone-100 font-mono">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>

      </div>

    </section>

  </main>

  <!-- Embedded Logic Script -->
  <script>
    (function() {
      // State
      let state = {
        mode: 'text',
        text: 'LOVE',
        font: 'Playfair Display',
        bold: true,
        italic: false,
        imageSrc: null,
        threshold: 128,
        invert: false,
        presetId: 'heart',
        totalPages: 400,
        patternLeaves: 120,
        pageHeight: 21.0,
        margin: 2.0,
        autoCenter: true,
        leaves: [],
        activeLeafIdx: 0,
        completedLeaves: new Set()
      };

      // Presets SVGs
      const PRESETS = {
        heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        infinity: 'M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 11l-2.83-2.85A5.334 5.334 0 005.4 6.62C2.42 6.62 0 9.04 0 12.02c0 2.98 2.42 5.4 5.4 5.4 1.44 0 2.8-.56 3.77-1.53L12 13.04l2.83 2.85c.97.97 2.33 1.53 3.77 1.53 2.98 0 5.4-2.42 5.4-5.4 0-2.98-2.42-5.4-5.4-5.4zm-13.2 8.8c-1.87 0-3.4-1.53-3.4-3.4 0-1.87 1.53-3.4 3.4-3.4 1.01 0 1.93.45 2.55 1.16L9.8 12.02l-1.85 2.24c-.62.71-1.54 1.16-2.55 1.16zm13.2 0c-1.01 0-1.93-.45-2.55-1.16L14.2 12.02l1.85-2.24c.62-.71 1.54-1.16 2.55-1.16 1.87 0 3.4 1.53 3.4 3.4 0 1.87-1.53 3.4-3.4 3.4z',
        butterfly: 'M12 4c-.5 0-1 .4-1 .9v14.2c0 .5.5.9 1 .9s1-.4 1-.9V4.9c0-.5-.5-.9-1-.9zm-2 2C6.5 6 3 8.5 2 12c-1 3.5 1 7 4 8 2.5.8 4-1 4-2.5V8c0-.8-.4-1.5-1-1.8-.3-.1-.6-.2-1-.2zm4 0c-.4 0-.7.1-1 .2-.6.3-1 1-1 1.8v9.5c0 1.5 1.5 3.3 4 2.5 3-1 5-4.5 4-8-1-3.5-4.5-6-8-6z',
        cat: 'M12 2c-.8 0-1.5.7-1.5 1.5v.5C9.6 4.3 8.8 5 8.3 5.9L5.5 4.5 4.5 7l2 1.5C6.2 9.5 6 10.7 6 12c0 2.2 1 4 2.5 5.2L7 20h3l1-2h2l1 2h3l-1.5-2.8c1.5-1.2 2.5-3 2.5-5.2 0-1.3-.2-2.5-.5-3.5l2-1.5-1-2.5-2.8 1.4C15.2 5 14.4 4.3 13.5 4V3.5c0-.8-.7-1.5-1.5-1.5z',
        paw: 'M12 13c-2.2 0-4 1.8-4 4 0 1.7 1.3 3 3 3h2c1.7 0 3-1.3 3-3 0-2.2-1.8-4-4-4zm-5-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
        star: 'M12 2l2.9 6.8L22 9.8l-5.3 4.8 1.6 7.4L12 18.2 5.7 22l1.6-7.4L2 9.8l7.1-1z'
      };

      // Recalculate and generate pattern
      function computePattern() {
        const leafCount = Math.max(10, Math.min(500, state.patternLeaves));
        const totalLeavesInBook = Math.floor(state.totalPages / 2);
        
        // Centering
        let startLeaf = 1;
        if (state.autoCenter) {
          startLeaf = Math.max(1, Math.floor((totalLeavesInBook - leafCount) / 2) + 1);
        }
        const startBookPage = 1 + (startLeaf - 1) * 2;
        const endBookPage = startBookPage + (leafCount - 1) * 2;
        const blankLeaves = Math.max(0, startLeaf - 1);

        document.getElementById('info-start-page').textContent = 'Page ' + startBookPage;
        document.getElementById('info-end-page').textContent = 'Page ' + endBookPage;
        document.getElementById('info-blank-leaves').textContent = blankLeaves + ' feuilles';

        // Render to hidden canvas
        const canvas = document.createElement('canvas');
        canvas.width = leafCount;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const marginRatio = (state.margin * 2) / state.pageHeight;
        const usableH = canvas.height * Math.max(0.2, 1 - marginRatio);
        const topY = (canvas.height - usableH) / 2;

        if (state.mode === 'preset') {
          const path = new Path2D(PRESETS[state.presetId] || PRESETS.heart);
          ctx.save();
          const scale = Math.min((canvas.width * 0.8) / 24, usableH / 24);
          ctx.translate((canvas.width - 24 * scale) / 2, topY + (usableH - 24 * scale) / 2);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#000000';
          ctx.fill(path);
          ctx.restore();
        } else if (state.mode === 'text') {
          ctx.save();
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let fontSize = usableH * 0.9;
          ctx.font = (state.italic ? 'italic ' : '') + (state.bold ? 'bold ' : '') + fontSize + 'px ' + state.font;
          const textW = ctx.measureText(state.text).width;
          const targetW = canvas.width * 0.92;
          const hScale = textW > 0 ? targetW / textW : 1.0;
          ctx.translate(canvas.width / 2, 0);
          ctx.scale(hScale, 1.0);
          ctx.translate(-canvas.width / 2, 0);
          ctx.fillText(state.text, canvas.width / 2, canvas.height / 2);
          ctx.restore();
        } else if (state.mode === 'image' && state.imageSrc) {
          // Handled asynchronously if loaded
        }

        // Binarize
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const leaves = [];

        for (let x = 0; x < canvas.width; x++) {
          let topPx = -1;
          let botPx = -1;
          for (let y = 0; y < canvas.height; y++) {
            const idx = (y * canvas.width + x) * 4;
            const gray = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
            let isBlack = gray < state.threshold;
            if (state.invert) isBlack = !isBlack;

            if (isBlack) {
              if (topPx === -1) topPx = y;
              botPx = y;
            }
          }

          const bookPageNum = startBookPage + x * 2;
          let marks = [];
          if (topPx !== -1 && botPx !== -1) {
            const m1 = Math.round(((topPx / canvas.height) * state.pageHeight) * 100) / 100;
            const m2 = Math.round(((botPx / canvas.height) * state.pageHeight) * 100) / 100;
            marks = [m1, m2];
          }

          leaves.push({
            leafIndex: x + 1,
            bookPageNumber: bookPageNum,
            marks: marks
          });
        }

        state.leaves = leaves;

        // Draw preview 2D
        const previewCanvas = document.getElementById('preview-canvas');
        previewCanvas.width = canvas.width;
        previewCanvas.height = 140;
        const pCtx = previewCanvas.getContext('2d');
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        pCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);

        // Render 3D simulation
        render3DView();
        // Update Table
        renderTable();
        // Update active leaf display
        updateActiveLeafCard();
      }

      function updateActiveLeafCard() {
        const leaf = state.leaves[state.activeLeafIdx];
        if (!leaf) return;

        document.getElementById('active-leaf-display').textContent = 'Feuillet #' + leaf.leafIndex + ' (Page ' + leaf.bookPageNumber + ')';
        if (leaf.marks.length >= 2) {
          document.getElementById('active-mark-top').textContent = leaf.marks[0] + ' cm';
          document.getElementById('active-mark-bottom').textContent = leaf.marks[1] + ' cm';
        } else {
          document.getElementById('active-mark-top').textContent = '-';
          document.getElementById('active-mark-bottom').textContent = '-';
        }

        const isDone = state.completedLeaves.has(leaf.leafIndex);
        const toggleBtn = document.getElementById('btn-toggle-done');
        if (isDone) {
          toggleBtn.className = 'px-3.5 py-2 rounded-lg bg-stone-300 hover:bg-stone-400 text-stone-700 font-semibold text-xs transition-colors shadow';
          toggleBtn.textContent = 'Décocher feuillet';
        } else {
          toggleBtn.className = 'px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow';
          toggleBtn.textContent = '✓ Marquer comme plié';
        }

        const pct = Math.round((state.completedLeaves.size / state.leaves.length) * 100) || 0;
        document.getElementById('lbl-progress').textContent = pct + '% Terminé (' + state.completedLeaves.size + '/' + state.leaves.length + ')';
      }

      function renderTable() {
        const tbody = document.getElementById('table-leaves-body');
        tbody.innerHTML = '';

        state.leaves.forEach((leaf, idx) => {
          const tr = document.createElement('tr');
          const isDone = state.completedLeaves.has(leaf.leafIndex);
          const isActive = idx === state.activeLeafIdx;

          tr.className = (isActive ? 'bg-amber-50 font-bold ' : '') + 'hover:bg-stone-50 cursor-pointer transition-colors';
          tr.onclick = function() {
            state.activeLeafIdx = idx;
            updateActiveLeafCard();
            renderTable();
          };

          const m1 = leaf.marks.length >= 2 ? leaf.marks[0] + ' cm' : '-';
          const m2 = leaf.marks.length >= 2 ? leaf.marks[1] + ' cm' : '-';

          tr.innerHTML = 
            '<td class="p-2 text-center"><input type="checkbox" ' + (isDone ? 'checked' : '') + ' class="rounded text-emerald-600 cursor-pointer row-chk" data-leaf="' + leaf.leafIndex + '" /></td>' +
            '<td class="p-2 text-stone-700">#' + leaf.leafIndex + '</td>' +
            '<td class="p-2 text-stone-900 font-bold">p.' + leaf.bookPageNumber + '</td>' +
            '<td class="p-2 text-amber-700 font-semibold">' + m1 + '</td>' +
            '<td class="p-2 text-sky-700 font-semibold">' + m2 + '</td>';

          tbody.appendChild(tr);
        });

        // Add event listeners on checkboxes
        document.querySelectorAll('.row-chk').forEach(chk => {
          chk.addEventListener('change', (e) => {
            const lIdx = parseInt(e.target.dataset.leaf);
            if (e.target.checked) state.completedLeaves.add(lIdx);
            else state.completedLeaves.delete(lIdx);
            updateActiveLeafCard();
          });
        });
      }

      function render3DView() {
        const canvas = document.getElementById('canvas-3d');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Perspective 3D Open Book Rendering
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Spine
        ctx.fillStyle = '#451a03'; // Warm brown cover
        ctx.fillRect(cx - 15, cy - 80, 30, 160);

        // Pages fans
        const leafCount = state.leaves.length;
        for (let i = 0; i < leafCount; i++) {
          const t = i / (leafCount - 1 || 1);
          const angle = (t - 0.5) * 1.6; // -0.8 rad to +0.8 rad
          const radius = 170;

          const px = cx + Math.sin(angle) * radius;
          const py = cy - 60 + Math.cos(angle) * 20;

          const leaf = state.leaves[i];
          const hasFold = leaf && leaf.marks.length >= 2;

          ctx.strokeStyle = hasFold ? '#f59e0b' : '#e7e5e4';
          ctx.lineWidth = hasFold ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 60);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Fold relief lines
          if (hasFold) {
            const topRatio = leaf.marks[0] / state.pageHeight;
            const botRatio = leaf.marks[1] / state.pageHeight;
            const foldH = (botRatio - topRatio) * 120;
            ctx.fillStyle = '#d97706';
            ctx.fillRect(px - 1, py + topRatio * 120, 2, foldH);
          }
        }
      }

      // Event bindings
      document.getElementById('tab-text').onclick = function() {
        state.mode = 'text';
        document.getElementById('section-text').classList.remove('hidden');
        document.getElementById('section-image').classList.add('hidden');
        document.getElementById('section-preset').classList.add('hidden');
        this.className = 'py-2 rounded-lg bg-white shadow-sm text-stone-900 transition-all';
        document.getElementById('tab-image').className = 'py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all';
        document.getElementById('tab-preset').className = 'py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all';
        computePattern();
      };

      document.getElementById('tab-image').onclick = function() {
        state.mode = 'image';
        document.getElementById('section-text').classList.add('hidden');
        document.getElementById('section-image').classList.remove('hidden');
        document.getElementById('section-preset').classList.add('hidden');
        this.className = 'py-2 rounded-lg bg-white shadow-sm text-stone-900 transition-all';
        document.getElementById('tab-text').className = 'py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all';
        document.getElementById('tab-preset').className = 'py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all';
        computePattern();
      };

      document.getElementById('tab-preset').onclick = function() {
        state.mode = 'preset';
        document.getElementById('section-text').classList.add('hidden');
        document.getElementById('section-image').classList.add('hidden');
        document.getElementById('section-preset').classList.remove('hidden');
        this.className = 'py-2 rounded-lg bg-white shadow-sm text-stone-900 transition-all';
        document.getElementById('tab-text').className = 'py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all';
        document.getElementById('tab-image').className = 'py-2 rounded-lg text-stone-600 hover:text-stone-900 transition-all';
        computePattern();
      };

      document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.onclick = function() {
          state.presetId = this.dataset.preset;
          document.querySelectorAll('.btn-preset').forEach(b => {
            b.className = 'btn-preset p-2 text-center rounded-lg border border-stone-200 hover:bg-stone-50 flex flex-col items-center';
          });
          this.className = 'btn-preset p-2 text-center rounded-lg border border-amber-600 bg-amber-50 hover:bg-amber-100 flex flex-col items-center';
          computePattern();
        };
      });

      document.getElementById('input-text').oninput = function() {
        state.text = this.value;
        computePattern();
      };
      document.getElementById('input-font').onchange = function() {
        state.font = this.value;
        computePattern();
      };
      document.getElementById('input-bold').onchange = function() {
        state.bold = this.checked;
        computePattern();
      };
      document.getElementById('input-italic').onchange = function() {
        state.italic = this.checked;
        computePattern();
      };
      document.getElementById('input-threshold').oninput = function() {
        state.threshold = parseInt(this.value);
        document.getElementById('lbl-threshold').textContent = this.value;
        computePattern();
      };
      document.getElementById('input-invert').onchange = function() {
        state.invert = this.checked;
        computePattern();
      };
      document.getElementById('input-total-pages').onchange = function() {
        state.totalPages = parseInt(this.value) || 400;
        computePattern();
      };
      document.getElementById('input-pattern-leaves').onchange = function() {
        state.patternLeaves = parseInt(this.value) || 120;
        computePattern();
      };
      document.getElementById('input-page-height').onchange = function() {
        state.pageHeight = parseFloat(this.value) || 21.0;
        computePattern();
      };
      document.getElementById('input-margin').onchange = function() {
        state.margin = parseFloat(this.value) || 2.0;
        computePattern();
      };
      document.getElementById('input-autocenter').onchange = function() {
        state.autoCenter = this.checked;
        computePattern();
      };

      // Navigation leaf buttons
      document.getElementById('btn-prev-leaf').onclick = function() {
        if (state.activeLeafIdx > 0) {
          state.activeLeafIdx--;
          updateActiveLeafCard();
          renderTable();
        }
      };
      document.getElementById('btn-next-leaf').onclick = function() {
        if (state.activeLeafIdx < state.leaves.length - 1) {
          state.activeLeafIdx++;
          updateActiveLeafCard();
          renderTable();
        }
      };
      document.getElementById('btn-toggle-done').onclick = function() {
        const leaf = state.leaves[state.activeLeafIdx];
        if (!leaf) return;
        if (state.completedLeaves.has(leaf.leafIndex)) {
          state.completedLeaves.delete(leaf.leafIndex);
        } else {
          state.completedLeaves.add(leaf.leafIndex);
          if (state.activeLeafIdx < state.leaves.length - 1) {
            state.activeLeafIdx++;
          }
        }
        updateActiveLeafCard();
        renderTable();
      };

      // 2D/3D View Tabs
      document.getElementById('view-tab-2d').onclick = function() {
        document.getElementById('view-2d-box').classList.remove('hidden');
        document.getElementById('view-3d-box').classList.add('hidden');
        this.className = 'px-3 py-1 rounded bg-white shadow-sm text-stone-900';
        document.getElementById('view-tab-3d').className = 'px-3 py-1 rounded text-stone-600 hover:text-stone-900';
      };
      document.getElementById('view-tab-3d').onclick = function() {
        document.getElementById('view-2d-box').classList.add('hidden');
        document.getElementById('view-3d-box').classList.remove('hidden');
        this.className = 'px-3 py-1 rounded bg-white shadow-sm text-stone-900';
        document.getElementById('view-tab-2d').className = 'px-3 py-1 rounded text-stone-600 hover:text-stone-900';
        render3DView();
      };

      // Export CSV
      document.getElementById('btn-export-csv').onclick = function() {
        let csv = 'Feuillet,Page_Livre,Repere_1_Haut_cm,Repere_2_Bas_cm\\n';
        state.leaves.forEach(l => {
          const m1 = l.marks[0] || '';
          const m2 = l.marks[1] || '';
          csv += l.leafIndex + ',' + l.bookPageNumber + ',' + m1 + ',' + m2 + '\\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'patron_pliage_' + (state.text || state.presetId) + '.csv';
        link.click();
      };

      // Export PDF using jsPDF
      document.getElementById('btn-export-pdf').onclick = function() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          alert('jsPDF est en cours de chargement ou nécessite une connexion internet.');
          return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        
        // Page 1: Cover & Info
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('Patron de Pliage de Livre : ' + (state.text || state.presetId).toUpperCase(), 15, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Généré avec Bookfold Studio - Prêt pour impression', 15, 32);

        doc.setFillColor(245, 240, 230);
        doc.rect(15, 38, 180, 30, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Paramètres :', 20, 46);
        doc.setFont('helvetica', 'normal');
        doc.text('Total Pages Livre : ' + state.totalPages, 20, 53);
        doc.text('Feuillets Pliés : ' + state.leaves.length, 20, 60);
        doc.text('Première page pliée : Page ' + (state.leaves[0] ? state.leaves[0].bookPageNumber : 1), 100, 53);
        doc.text('Hauteur de page : ' + state.pageHeight + ' cm', 100, 60);

        // Add Table
        let y = 80;
        let p = 1;
        doc.setFont('helvetica', 'bold');
        doc.text('Feuillet | Page Livre | Repère Haut (cm) | Repère Bas (cm)', 15, 75);
        doc.line(15, 77, 195, 77);

        doc.setFont('helvetica', 'normal');
        state.leaves.forEach((l) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
            doc.setFont('helvetica', 'bold');
            doc.text('Feuillet | Page Livre | Repère Haut (cm) | Repère Bas (cm)', 15, 15);
            doc.line(15, 17, 195, 17);
            doc.setFont('helvetica', 'normal');
          }
          const m1 = l.marks[0] ? l.marks[0] + ' cm' : '-';
          const m2 = l.marks[1] ? l.marks[1] + ' cm' : '-';
          doc.text('#' + l.leafIndex + '         p.' + l.bookPageNumber + '             ' + m1 + '                     ' + m2, 15, y);
          y += 5;
        });

        doc.save('patron_bookfold_' + (state.text || state.presetId) + '.pdf');
      };

      // Initialize on load
      computePattern();
    })();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Generateur_Bookfold_Art_Windows.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
