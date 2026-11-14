// ============================================================
// TimeLock – Briefe an dein zukünftiges Ich
// ============================================================

const STORE_KEY = 'timelock_letters';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// STATE
// ============================================================

let letters = loadLetters();

// ============================================================
// STORAGE
// ============================================================

function loadLetters() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveLetters() {
    localStorage.setItem(STORE_KEY, JSON.stringify(letters));
}

// ============================================================
// HELPERS
// ============================================================

function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getRemainingTime(ms) {
    if (ms <= 0) return 'Bereit zum Öffnen';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    
    let str = '';
    if (days > 0) str += `${days} Tag${days === 1 ? '' : 'e'} `;
    if (hours > 0 || days > 0) str += `${hours} Std `;
    str += `${minutes} Min`;
    
    return `Öffnet in ${str}`;
}

// ============================================================
// INIT / NAVIGATION
// ============================================================

function init() {
    // Datum im Brief-Formular setzen
    const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
    $('#current-date').textContent = `Heute, ${today}`;

    // Prüfen ob Briefe existieren
    if (letters.length > 0) {
        $('#btn-view-letters').classList.remove('hidden');
    }

    showScreen('start-screen');
}

function showScreen(screenId) {
    $$('.screen').forEach(s => s.classList.add('hidden'));
    $('#' + screenId).classList.remove('hidden');
}

// ============================================================
// EVENTS: NAVIGATION
// ============================================================

$('#btn-new-letter').addEventListener('click', () => {
    // Formular leeren
    $('#letter-title').value = '';
    $('#letter-text').value = '';
    document.querySelector('input[name="unlock-time"][value="3m"]').checked = true;
    
    showScreen('write-screen');
    $('#letter-title').focus();
});

$('#back-to-start').addEventListener('click', () => showScreen('start-screen'));

$('#btn-view-letters').addEventListener('click', () => {
    renderLettersList();
    showScreen('list-screen');
});

$('#back-from-list').addEventListener('click', () => showScreen('start-screen'));

// ============================================================
// BRIEF VERSIEGELN
// ============================================================

$('#btn-seal').addEventListener('click', () => {
    const title = $('#letter-title').value.trim() || 'Ohne Titel';
    const text = $('#letter-text').value.trim();
    const unlockValue = document.querySelector('input[name="unlock-time"]:checked').value;

    if (!text) {
        toast('Du musst einen Brief schreiben, bevor du ihn versiegelst.', true);
        return;
    }

    // Öffnungsdatum berechnen
    const now = new Date();
    const unlockDate = new Date(now);

    if (unlockValue === '3m') {
        unlockDate.setMonth(unlockDate.getMonth() + 3);
    } else if (unlockValue === '6m') {
        unlockDate.setMonth(unlockDate.getMonth() + 6);
    } else if (unlockValue === '1y') {
        unlockDate.setFullYear(unlockDate.getFullYear() + 1);
    }

    const newLetter = {
        id: Date.now() + Math.random(),
        title,
        text,
        createdAt: now.toISOString(),
        unlockAt: unlockDate.toISOString()
    };

    letters.push(newLetter);
    saveLetters();

    toast('Brief versiegelt! Er wird sicher aufbewahrt.');
    
    // UI aktualisieren
    $('#btn-view-letters').classList.remove('hidden');
    
    setTimeout(() => {
        showScreen('start-screen');
        renderLettersList(); // Liste im Hintergrund aktualisieren
    }, 1500);
});

// ============================================================
// BRIEFE ANZEIGEN (LISTE)
// ============================================================

function renderLettersList() {
    const grid = $('#letters-grid');
    grid.innerHTML = '';

    if (letters.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-dim); grid-column: 1/-1;">Du hast noch keine Briefe geschrieben.</p>`;
        return;
    }

    // Neueste zuerst
    const sorted = [...letters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const now = new Date().getTime();

    sorted.forEach(letter => {
        const unlockTime = new Date(letter.unlockAt).getTime();
        const isLocked = now < unlockTime;
        const remainingMs = unlockTime - now;

        const card = document.createElement('div');
        card.className = 'letter-card';
        
        card.innerHTML = `
            <h3 class="card-title">${escapeHtml(letter.title)}</h3>
            <p class="card-date">Geschrieben am ${formatDate(letter.createdAt)}</p>
            <div class="card-status">
                ${isLocked 
                    ? `<div class="status-locked">
                           <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                           ${getRemainingTime(remainingMs)}
                       </div>`
                    : `<div class="status-open">Öffnen</div>`
                }
            </div>
        `;

        if (!isLocked) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => openLetterModal(letter));
        }

        grid.appendChild(card);
    });
}

// ============================================================
// BRIEF LESEN (MODAL)
// ============================================================

function openLetterModal(letter) {
    $('#read-letter-title').textContent = letter.title;
    $('#read-letter-date').textContent = `Geschrieben am ${formatDate(letter.createdAt)}`;
    $('#read-letter-content').textContent = letter.text;

    $('#open-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

$('#close-letter-modal').addEventListener('click', () => {
    $('#open-modal').classList.remove('open');
    document.body.style.overflow = '';
});

// ============================================================
// UTILS
// ============================================================

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Start
init();
console.log('TimeLock ready!');