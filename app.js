/* ═══════════════════════════════════════════════════════════
   VOUCHER GENERATOR – app.js
   Generates 150 PNG images (75 front + 75 back) from CSV data
   ═══════════════════════════════════════════════════════════ */

const STATIC_QR_URL = 'https://docs.google.com/spreadsheets/d/1O9mr3YQwuzzs_5FuGeO25tI7xdE4PUeAZ3ajAAACjls/edit?gid=336715742#gid=336715742';

const MATERIAS = [
    'Sistemas Distribuidos',
    'Sistemas Operativos',
    'Fundamentos de Ciencias de Computación y Programación',
    'Emergentes II',
    'Matemática Computacional',
    'Proyecto de Sistemas',
    'Fundamentos de Electrónica',
    'Taller de Sistemas I'
];

const LEGAL = 'Este voucher es de uso único y personal. Al momento del canje, el documento original debe ser entregado al docente para su validación definitiva.';

/* ── Circuit SVG pattern (inline for html2canvas compatibility) ── */
function circuitSVG() {
    return `<svg class="circuit-bg" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
        <defs><style>line,circle,rect{stroke:currentColor;fill:none;stroke-width:.8}</style></defs>
        <line x1="40" y1="0" x2="40" y2="120"/><line x1="40" y1="120" x2="120" y2="120"/>
        <circle cx="120" cy="120" r="4"/><line x1="120" y1="120" x2="120" y2="200"/>
        <line x1="200" y1="0" x2="200" y2="80"/><line x1="200" y1="80" x2="300" y2="80"/>
        <circle cx="300" cy="80" r="4"/><line x1="300" y1="80" x2="300" y2="180"/>
        <rect x="295" y="180" width="10" height="10"/>
        <line x1="360" y1="0" x2="360" y2="60"/><line x1="360" y1="60" x2="280" y2="60"/>
        <line x1="0" y1="250" x2="80" y2="250"/><circle cx="80" cy="250" r="4"/>
        <line x1="80" y1="250" x2="80" y2="350"/><line x1="80" y1="350" x2="160" y2="350"/>
        <rect x="155" y="345" width="10" height="10"/>
        <line x1="320" y1="250" x2="400" y2="250"/><circle cx="320" cy="250" r="4"/>
        <line x1="320" y1="250" x2="320" y2="320"/><line x1="320" y1="320" x2="240" y2="320"/>
        <line x1="60" y1="400" x2="60" y2="500"/><line x1="60" y1="500" x2="180" y2="500"/>
        <circle cx="180" cy="500" r="4"/>
        <line x1="340" y1="400" x2="340" y2="480"/><line x1="340" y1="480" x2="260" y2="480"/>
        <circle cx="260" cy="480" r="4"/><line x1="260" y1="480" x2="260" y2="560"/>
        <line x1="0" y1="450" x2="40" y2="450"/><line x1="40" y1="450" x2="40" y2="580"/>
        <line x1="160" y1="0" x2="160" y2="40"/><circle cx="160" cy="40" r="3"/>
        <line x1="160" y1="40" x2="220" y2="40"/><line x1="220" y1="40" x2="220" y2="130"/>
        <rect x="215" y="130" width="10" height="10"/>
        <line x1="380" y1="300" x2="400" y2="300"/><line x1="380" y1="300" x2="380" y2="400"/>
        <circle cx="380" cy="400" r="4"/>
        <line x1="0" y1="150" x2="30" y2="150"/><rect x="25" y="145" width="10" height="10"/>
        <line x1="100" y1="420" x2="200" y2="420"/><circle cx="200" cy="420" r="3"/>
        <line x1="200" y1="420" x2="200" y2="550"/>
    </svg>`;
}

/* ── Helpers ── */
const getLastSegment = code => code.split('-').pop();
const getFirstSegment = code => code.split('-')[0];
const catClass = cat => 'voucher--' + cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* ── Build a FRONT voucher DOM node ── */
function buildFront(row, index) {
    const cat = row.Categoria.trim();
    const catLower = cat.toLowerCase();
    const codigo = row.Codigo.trim();
    const valor = row.Valor.trim();
    const lastSeg = getLastSegment(codigo);

    const card = document.createElement('div');
    card.className = `voucher ${catClass(catLower)} front-card`;
    card.style.backgroundImage = `url('plantillas/frontal_${catLower}.png')`;
    card.innerHTML = `
        <div class="v-title-top">Voucher de ${cat}</div>
        <div class="qr-container-front">
            <div class="qr-ring" id="qr-f-${codigo}"></div>
        </div>
        <div class="v-id-front">ID: ${lastSeg}</div>
        <div class="v-value-right">${valor}</div>
    `;
    return card;
}

/* ── Build a BACK voucher DOM node ── */
function buildBack(row, index) {
    const cat = row.Categoria.trim();
    const catLower = cat.toLowerCase();
    const codigo = row.Codigo.trim();
    const valor = row.Valor.trim();
    const firstSeg = getFirstSegment(codigo);
    const lastSeg = getLastSegment(codigo);

    const materiasHTML = MATERIAS.map(m => `<li>${m}</li>`).join('');
    const card = document.createElement('div');
    card.className = `voucher ${catClass(catLower)} back-card`;
    card.style.backgroundImage = `url('plantillas/posterior_${catLower}.png')`;
    card.innerHTML = `
        <div class="qr-container-back-corner">
            <div class="qr-ring-small" id="qr-b-${codigo}"></div>
            <div class="v-ref-back">Ref: ${firstSeg}</div>
        </div>
        <div class="v-title-top">LEGADO 2026</div>
        <div class="materias-container">
            <div class="materias-title">Materias Válidas:</div>
            <ul class="v-materias">${materiasHTML}</ul>
        </div>
        <div class="v-id-front">ID: ${lastSeg}</div>
        <div class="v-value-right">${valor}</div>
    `;
    return card;
}

/* ── Generate QR into a container ── */
function makeQR(el, data, size = 120) {
    if (!el) return;
    el.innerHTML = '';
    new QRCode(el, { text: data, width: size, height: size, correctLevel: QRCode.CorrectLevel.H });
}

/* ── State ── */
let voucherData = [];

/* ── DOM refs ── */
const csvInput = document.getElementById('csv-input');
const btnDemo = document.getElementById('btn-demo');
const btnGen = document.getElementById('btn-generate');
const badge = document.getElementById('badge');
const badgeN = document.getElementById('badge-n');
const emptyState = document.getElementById('empty-state');
const previewGrid = document.getElementById('preview-grid');
const progressWrap = document.getElementById('progress-wrap');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const renderArea = document.getElementById('render-area');

/* ── CSV Parsing ── */
function loadCSV(file) {
    Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: res => { voucherData = res.data; onDataLoaded(); }
    });
}

/* ── Load demo CSV (works from file:// and http://) ── */
async function loadDemo() {
    try {
        const resp = await fetch('data/vouchers.csv');
        const text = await resp.text();
        const res = Papa.parse(text, { header: true, skipEmptyLines: true });
        voucherData = res.data;
    } catch (_) {
        // Fallback: inline sample data for file:// protocol
        voucherData = [
            { Codigo: 'b5afce2-951b-47d0-be84-a9d0d27ca00c', Categoria: 'Oro', Valor: '12 pts' },
            { Codigo: 'c7e3a91-4f2d-48a1-9c56-b8e1f34dc01a', Categoria: 'Oro', Valor: '12 pts' },
            { Codigo: 'd9f4b83-6a3e-49b2-ad67-c9f2045ed12b', Categoria: 'Oro', Valor: '12 pts' },
            { Codigo: '1a2b3c4-5d6e-7f80-9a1b-2c3d4e5f6a7b', Categoria: 'Plata', Valor: '8 pts' },
            { Codigo: '3c4d5e6-7f8a-9b0c-1d2e-4f5a6b7c8d9e', Categoria: 'Plata', Valor: '8 pts' },
            { Codigo: '5e6f7a8-9b0c-1d2e-3f4a-6b7c8d9e0f1a', Categoria: 'Plata', Valor: '8 pts' },
            { Codigo: 'aa1b2c3-4d5e-6f7a-8b9c-d0e1f2a3b4c5', Categoria: 'Bronce', Valor: '4 pts' },
            { Codigo: 'cc3d4e5-6f7a-8b9c-0d1e-f2a3b4c5d6e7', Categoria: 'Bronce', Valor: '4 pts' },
            { Codigo: 'ee5f6a7-8b9c-0d1e-2f3a-b4c5d6e7f8a9', Categoria: 'Bronce', Valor: '4 pts' },
        ];
    }
    onDataLoaded();
}

/* ── After data is loaded ── */
function onDataLoaded() {
    badge.hidden = false;
    badgeN.textContent = voucherData.length;
    btnGen.disabled = false;
    btnGen.querySelector('span') 
        ? btnGen.querySelector('span').textContent = `Generar ${voucherData.length * 2} PNG`
        : btnGen.textContent = `⚡ Generar ${voucherData.length * 2} PNG`;
    emptyState.style.display = 'none';
    previewGrid.hidden = false;
    renderPreview();
}

/* ── Render preview cards on screen ── */
function renderPreview() {
    previewGrid.innerHTML = '';
    // Show only first 9 for preview
    const preview = voucherData.slice(0, 9);
    preview.forEach((row, i) => {
        const pair = document.createElement('div');
        pair.className = 'pair';
        pair.style.animationDelay = `${i * 0.08}s`;

        const label = document.createElement('div');
        label.className = 'pair-label';
        label.textContent = `${row.Categoria} — ${getLastSegment(row.Codigo)}`;

        const front = buildFront(row, i + 1);
        front.classList.add('preview-card');
        const back = buildBack(row, i + 1);
        back.classList.add('preview-card');

        pair.appendChild(label);
        pair.appendChild(front);
        pair.appendChild(back);
        previewGrid.appendChild(pair);

        // Generate QRs after DOM insertion
        setTimeout(() => {
            makeQR(front.querySelector('.qr-ring'), STATIC_QR_URL, 160);
            makeQR(back.querySelector('.qr-ring-small'), row.Codigo.trim(), 80);
        }, 100);
    });

    // Info about remaining
    if (voucherData.length > 9) {
        const info = document.createElement('div');
        info.className = 'pair';
        info.innerHTML = `<div style="padding:40px;text-align:center;color:var(--t2);font-size:.85rem;border:1px dashed rgba(255,255,255,.08);border-radius:12px;">
            +${voucherData.length - 9} vouchers más · Presione <strong style="color:var(--accent)">⚡ Generar PNG</strong> para exportar todos
        </div>`;
        previewGrid.appendChild(info);
    }
}

/* ═══════════════════════════════════════════════════════════
   BATCH PNG EXPORT (LOCAL SAVE TO /prueba)
   ═══════════════════════════════════════════════════════════ */
async function generateAllPNG() {
    btnGen.disabled = true;
    progressWrap.hidden = false;
    const total = voucherData.length * 2;
    let done = 0;

    function updateProgress() {
        done++;
        const pct = Math.round((done / total) * 100);
        progressBar.style.width = pct + '%';
        progressText.textContent = `Guardando en carpeta /prueba: ${pct}% (${done}/${total})`;
    }

    for (let i = 0; i < voucherData.length; i++) {
        const row = voucherData[i];
        const codigo = row.Codigo.trim();
        const cat = row.Categoria.trim().toLowerCase();
        const idx = String(i + 1).padStart(3, '0');

        // ── FRONT ──
        const front = buildFront(row, i + 1);
        renderArea.innerHTML = '';
        renderArea.appendChild(front);
        await new Promise(r => setTimeout(r, 50));
        makeQR(front.querySelector('.qr-ring'), STATIC_QR_URL, 160);
        await new Promise(r => setTimeout(r, 150));

        try {
            const canvasF = await html2canvas(front, {
                width: 640, height: 400, scale: 2,
                backgroundColor: null, useCORS: true
            });
            const dataF = canvasF.toDataURL('image/png').split(',')[1];
            const respF = await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: `${idx}_${cat}_frente_${getLastSegment(codigo)}.png`, image: dataF })
            });
            if (!respF.ok) throw new Error('El servidor local rechazó la imagen');
        } catch (e) { 
            progressText.textContent = '❌ Error Frontal: ' + e.message;
            progressText.style.color = 'red';
            btnGen.disabled = false;
            return;
        }
        updateProgress();

        // ── BACK ──
        const back = buildBack(row, i + 1);
        renderArea.innerHTML = '';
        renderArea.appendChild(back);
        await new Promise(r => setTimeout(r, 50));
        makeQR(back.querySelector('.qr-ring-small'), codigo, 80);
        await new Promise(r => setTimeout(r, 150));

        try {
            const canvasB = await html2canvas(back, {
                width: 640, height: 400, scale: 2,
                backgroundColor: null, useCORS: true
            });
            const dataB = canvasB.toDataURL('image/png').split(',')[1];
            const respB = await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: `${idx}_${cat}_dorso_${getFirstSegment(codigo)}.png`, image: dataB })
            });
            if (!respB.ok) throw new Error('El servidor local rechazó la imagen');
        } catch (e) { 
            progressText.textContent = '❌ Error Trasero: ' + e.message;
            progressText.style.color = 'red';
            btnGen.disabled = false;
            return;
        }
        updateProgress();
    }

    renderArea.innerHTML = '';
    progressText.textContent = '✅ ¡Las 150 imágenes se han guardado en la carpeta "prueba" del proyecto!';
    btnGen.disabled = false;
}

/* ── Event Listeners ── */
csvInput.addEventListener('change', e => { if (e.target.files[0]) loadCSV(e.target.files[0]); });

// Also handle the second upload button in empty state
const csvInput2 = document.getElementById('csv-upload-2');
if (csvInput2) csvInput2.addEventListener('change', e => { if (e.target.files[0]) loadCSV(e.target.files[0]); });

btnDemo.addEventListener('click', loadDemo);
btnGen.addEventListener('click', generateAllPNG);
