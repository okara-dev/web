// ============================================================
// Diary – Digitales Buch (Logik)
// ============================================================

const STORE_KEY = 'diary_entries_v2';
const PASS_KEY = 'diary_password_hash';

const $ = (sel) => document.querySelector(sel);

let entries = loadEntries();
let currentViewDate = new Date();
let selectedDateKey = null;
let currentPhotoBase64 = null;

const MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const MOOD_EMOJIS = {
    1: '😭', 2: '😢', 3: '😔', 4: '😕', 5: '😐',
    6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩'
};

function getMoodColor(mood) {
    if (mood <= 3) return '#8b2b2b'; // Rot
    if (mood <= 7) return '#aa8c2c'; // Gold
    return '#2b6b3c'; // Grün
}

// ============================================================
// STORAGE & AUTH
// ============================================================

function loadEntries() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
}

function saveEntries() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(entries)); }
    catch (e) {
        console.error('Speicher voll!', e);
        toast('Speicher voll! Bitte exportiere deine Daten.', true);
    }
}

function hashPassword(pass) {
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
        const char = pass.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function checkAuth() {
    const storedHash = localStorage.getItem(PASS_KEY);
    if (!storedHash) {
        $('#setup-modal').classList.add('open');
        $('#lock-screen').classList.add('hidden');
    } else {
        $('#setup-modal').classList.remove('open');
        $('#lock-screen').classList.remove('hidden');
        $('#main-app').classList.add('hidden');
    }
}

$('#setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = $('#setup-pass').value;
    if (pass.length < 4) return;
    localStorage.setItem(PASS_KEY, hashPassword(pass));
    $('#setup-modal').classList.remove('open');
    unlockApp();
});

$('#unlock-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = $('#unlock-password').value;
    if (hashPassword(pass) === localStorage.getItem(PASS_KEY)) {
        $('#lock-error').classList.add('hidden');
        $('#unlock-password').value = '';
        unlockApp();
    } else {
        $('#lock-error').classList.remove('hidden');
        $('#unlock-password').value = '';
    }
});

function unlockApp() {
    $('#lock-screen').classList.add('hidden');
    setTimeout(() => {
        $('#main-app').classList.remove('hidden');
        renderCalendar();
        closeEntryForm(); // Zeigt den leeren Zustand
    }, 400);
}

$('#btn-lock').addEventListener('click', () => {
    $('#main-app').classList.add('hidden');
    $('#lock-screen').classList.remove('hidden');
    $('#unlock-password').focus();
});

// ============================================================
// HELPERS
// ============================================================

function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayKey() { return dateKey(new Date()); }

function formatDateLong(key) {
    const [y, m, d] = key.split('-').map(Number);
    return `${d}. ${MONTHS[m - 1]} ${y}`;
}

function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

// ============================================================
// BILD KOMPRIMIEREN
// ============================================================

function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// ============================================================
// KALENDER RENDERN
// ============================================================

function renderCalendar() {
    const grid = $('#calendar-grid');
    const title = $('#calendar-title');

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    title.textContent = `${MONTHS[month]} ${year}`;
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    for (let i = 0; i < startOffset; i++) {
        grid.innerHTML += `<div class="cal-day empty"></div>`;
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayKey();

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const key = dateKey(dateObj);
        const entry = entries[key];

        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        if (key === today) dayEl.classList.add('today');
        if (key === selectedDateKey) dayEl.classList.add('selected');

        dayEl.innerHTML = `<span>${d}</span>`;

        if (entry) {
            dayEl.classList.add('has-entry');
            if (entry.photo) dayEl.style.backgroundImage = `url(${entry.photo})`;
            if (entry.mood) {
                const dot = document.createElement('span');
                dot.className = 'cal-mood-dot';
                dot.style.background = getMoodColor(entry.mood);
                dayEl.appendChild(dot);
            }
        }

        dayEl.addEventListener('click', () => {
            if (entry) openViewModal(key, entry);
            else openEntryForm(key);
        });

        grid.appendChild(dayEl);
    }
}

// ============================================================
// EINTRAG ANSEHEN & BEARBEITEN
// ============================================================

function openViewModal(dateKeyStr, entry) {
    selectedDateKey = dateKeyStr;
    $('#empty-state').classList.add('hidden');
    $('#entry-form').classList.add('hidden');
    $('#view-mode').classList.remove('hidden');

    $('#view-date-title').textContent = formatDateLong(dateKeyStr);
    $('#view-mood-badge').textContent = `Tag ${entry.mood || 5}/10 ${MOOD_EMOJIS[entry.mood || 5]}`;
    
    if (entry.photo) {
        $('#view-photo').src = entry.photo;
        $('#view-photo').classList.remove('hidden');
    } else {
        $('#view-photo').classList.add('hidden');
    }

    $('#view-text-content').textContent = entry.text || '';
    renderCalendar(); // Für die Hervorhebung
}

function openEntryForm(dateKeyStr) {
    selectedDateKey = dateKeyStr;
    const entry = entries[dateKeyStr];

    $('#empty-state').classList.add('hidden');
    $('#view-mode').classList.add('hidden');
    $('#entry-form').classList.remove('hidden');

    $('#entry-date-title-input').value = formatDateLong(dateKeyStr);

    if (entry) {
        $('#entry-text').value = entry.text || '';
        $('#mood-slider').value = entry.mood || 5;
        updateMoodUI(entry.mood || 5);
        if (entry.photo) {
            currentPhotoBase64 = entry.photo;
            $('#photo-preview').src = entry.photo;
            $('#photo-preview').classList.remove('hidden');
            $('#photo-placeholder').classList.add('hidden');
            $('#remove-photo').classList.remove('hidden');
        } else resetPhotoUI();
    } else {
        $('#entry-text').value = '';
        $('#mood-slider').value = 5;
        updateMoodUI(5);
        resetPhotoUI();
    }
    renderCalendar();
}

function closeEntryForm() {
    selectedDateKey = null;
    $('#view-mode').classList.add('hidden');
    $('#entry-form').classList.add('hidden');
    $('#empty-state').classList.remove('hidden');
    renderCalendar();
}

function resetPhotoUI() {
    currentPhotoBase64 = null;
    $('#photo-preview').src = '';
    $('#photo-preview').classList.add('hidden');
    $('#photo-placeholder').classList.remove('hidden');
    $('#remove-photo').classList.add('hidden');
    $('#photo-input').value = '';
}

function updateMoodUI(value) {
    $('#mood-value').textContent = value;
    $('#mood-emoji').textContent = MOOD_EMOJIS[value];
}

$('#mood-slider').addEventListener('input', (e) => updateMoodUI(e.target.value));

$('#photo-area').addEventListener('click', (e) => {
    if (!e.target.closest('#remove-photo')) $('#photo-input').click();
});

$('#photo-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
        currentPhotoBase64 = await compressImage(file, 800, 0.7);
        $('#photo-preview').src = currentPhotoBase64;
        $('#photo-preview').classList.remove('hidden');
        $('#photo-placeholder').classList.add('hidden');
        $('#remove-photo').classList.remove('hidden');
    } catch { toast('Bild-Fehler', true); }
});

$('#remove-photo').addEventListener('click', (e) => { e.stopPropagation(); resetPhotoUI(); });

$('#entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedDateKey) return;

    const text = $('#entry-text').value.trim();
    const mood = parseInt($('#mood-slider').value);

    if (!text && !currentPhotoBase64) return toast('Schreibe etwas oder füge ein Foto hinzu.', true);

    entries[selectedDateKey] = { text, mood, photo: currentPhotoBase64, updatedAt: new Date().toISOString() };
    saveEntries();
    openViewModal(selectedDateKey, entries[selectedDateKey]); // Wechselt zurück in den Lese-Modus
    toast('Eintrag gespeichert!');
});

$('#cancel-entry').addEventListener('click', closeEntryForm);
$('#close-entry').addEventListener('click', closeEntryForm);

// ============================================================
// EDIT / DELETE ACTIONS
// ============================================================

$('#edit-entry').addEventListener('click', () => openEntryForm(selectedDateKey));

$('#delete-entry').addEventListener('click', () => {
    if (!selectedDateKey) return;
    if (confirm('Diesen Eintrag wirklich löschen?')) {
        delete entries[selectedDateKey];
        saveEntries();
        closeEntryForm();
        toast('Eintrag gelöscht');
    }
});

// ============================================================
// MONTH IN REVIEW
// ============================================================

$('#btn-review').addEventListener('click', () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const monthEntries = Object.keys(entries).filter(k => k.startsWith(monthStr)).map(k => ({ date: k, ...entries[k] }));

    if (monthEntries.length === 0) return toast('Keine Einträge in diesem Monat.', true);

    let totalMood = 0, bestDay = null, bestMood = 0, worstDay = null, worstMood = 11, photoCount = 0, wordCount = 0;

    monthEntries.forEach(e => {
        if (e.mood) {
            totalMood += e.mood;
            if (e.mood > bestMood) { bestMood = e.mood; bestDay = e; }
            if (e.mood < worstMood) { worstMood = e.mood; worstDay = e; }
        }
        if (e.photo) photoCount++;
        if (e.text) wordCount += e.text.split(/\s+/).length;
    });

    const avgMood = (totalMood / monthEntries.length).toFixed(1);

    $('#review-title').textContent = `Rückblick: ${MONTHS[month]}`;
    $('#review-content').innerHTML = `
        <div class="review-card"><div class="review-value">${monthEntries.length}</div><div class="review-label">Einträge</div></div>
        <div class="review-card"><div class="review-value">${avgMood}</div><div class="review-label">Ø Stimmung</div></div>
        <div class="review-card"><div class="review-value">${photoCount}</div><div class="review-label">Fotos</div></div>
        <div class="review-card"><div class="review-value">${wordCount}</div><div class="review-label">Wörter</div></div>
        ${bestDay ? `<div class="review-card full-width"><div class="review-label">Bester Tag</div><div class="review-value" style="font-size:1.5rem">${MOOD_EMOJIS[bestMood]} ${formatDateLong(bestDay.date)}</div></div>` : ''}
    `;
    $('#review-modal').classList.add('open');
});

$('#close-review-modal').addEventListener('click', () => $('#review-modal').classList.remove('open'));

// ============================================================
// EXPORT / IMPORT
// ============================================================

$('#btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `diary_backup_${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup heruntergeladen!');
});

$('#btn-import').addEventListener('click', () => $('#import-file').click());

$('#import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (typeof imported !== 'object') throw new Error();
            if (confirm('Daten importieren? Aktuelle Einträge werden überschrieben!')) {
                entries = imported;
                saveEntries();
                renderCalendar();
                closeEntryForm();
                toast('Import erfolgreich!');
            }
        } catch { toast('Fehlerhafte Datei.', true); }
        $('#import-file').value = '';
    };
    reader.readAsText(file);
});

// ============================================================
// NAVIGATION & INIT
// ============================================================

$('#prev-month').addEventListener('click', () => { currentViewDate.setMonth(currentViewDate.getMonth() - 1); renderCalendar(); });
$('#next-month').addEventListener('click', () => { currentViewDate.setMonth(currentViewDate.getMonth() + 1); renderCalendar(); });

checkAuth();
console.log('Diary ready!');