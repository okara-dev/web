// ============================================================
// Days – Aurora Glass Kalender
// ============================================================

const STORE_KEY = 'days_events';

const $ = (sel) => document.querySelector(sel);

// ============================================================
// STATE
// ============================================================

let events = loadEvents();
let currentViewDate = new Date();
let selectedDateKey = null;

const MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const CATEGORY_LABELS = {
    arbeit: 'Arbeit',
    privat: 'Privat',
    termin: 'Termin',
    sport: 'Sport',
    sonstiges: 'Sonstiges'
};

const PRIORITY_LABELS = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch'
};

// ============================================================
// STORAGE
// ============================================================

function loadEvents() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveEvents() {
    localStorage.setItem(STORE_KEY, JSON.stringify(events));
}

// ============================================================
// HELPERS
// ============================================================

function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function todayKey() {
    return dateKey(new Date());
}

function formatDateLong(key) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][date.getDay()];
    return `${weekday}, ${d}. ${MONTHS[m - 1]} ${y}`;
}

function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================
// CALENDAR RENDER
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

    // Leere Zellen
    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayKey();

    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';

        const dateObj = new Date(year, month, d);
        const key = dateKey(dateObj);

        // Verzögerte Animation beim Erscheinen
        dayEl.style.animationDelay = `${Math.min(d * 0.012, 0.4)}s`;

        const numberEl = document.createElement('span');
        numberEl.className = 'day-number';
        numberEl.textContent = d;
        dayEl.appendChild(numberEl);

        const dayEvents = events.filter(ev => ev.date === key);

        if (dayEvents.length > 0) {
            dayEl.classList.add('has-events');

            const dotsWrapper = document.createElement('div');
            dotsWrapper.className = 'cal-day-dots';

            const uniqueCategories = [...new Set(dayEvents.map(e => e.category))];
            const maxDots = 4;

            uniqueCategories.slice(0, maxDots).forEach(cat => {
                const dot = document.createElement('span');
                dot.className = `cal-dot ${cat}`;
                dotsWrapper.appendChild(dot);
            });

            if (uniqueCategories.length > maxDots) {
                const more = document.createElement('span');
                more.className = 'cal-dot';
                dotsWrapper.appendChild(more);
            }

            dayEl.appendChild(dotsWrapper);
        }

        if (key === today) dayEl.classList.add('today');
        if (key === selectedDateKey) dayEl.classList.add('selected');

        dayEl.addEventListener('click', () => {
            selectedDateKey = (selectedDateKey === key) ? null : key;
            renderCalendar();
            renderDayDetails();
        });

        grid.appendChild(dayEl);
    }
}

// ============================================================
// DAY DETAILS
// ============================================================

function renderDayDetails() {
    const card = $('#day-details-card');
    const title = $('#day-details-title');
    const list = $('#day-event-list');

    if (!selectedDateKey) {
        card.classList.add('hidden');
        return;
    }

    card.classList.remove('hidden');
    title.textContent = formatDateLong(selectedDateKey);

    const dayEvents = events
        .filter(ev => ev.date === selectedDateKey)
        .sort((a, b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });

    list.innerHTML = '';

    if (dayEvents.length === 0) {
        list.innerHTML = `
            <li class="empty-day-msg">
                Keine Termine an diesem Tag.
            </li>
        `;
        return;
    }

    dayEvents.forEach((ev, index) => {
        const li = document.createElement('li');
        li.className = `event-item ${ev.category} ${ev.priority === 'high' ? 'priority-high' : ''}`;
        li.style.animationDelay = `${index * 0.05}s`;

        const timeHtml = ev.time ? `<span>🕒 ${ev.time}</span>` : '';
        const priorityHtml = ev.priority !== 'medium'
            ? `<span class="event-priority ${ev.priority}">${PRIORITY_LABELS[ev.priority]}</span>`
            : '';
        const noteHtml = ev.note ? `<div class="event-note">${escapeHtml(ev.note)}</div>` : '';

        li.innerHTML = `
            <div class="event-content">
                <div class="event-title">
                    ${escapeHtml(ev.title)}
                    ${priorityHtml}
                </div>
                <div class="event-meta">
                    <span>${CATEGORY_LABELS[ev.category]}</span>
                    ${timeHtml}
                </div>
                ${noteHtml}
            </div>
            <button class="event-delete" data-id="${ev.id}" title="Termin löschen">✕</button>
        `;

        li.querySelector('.event-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteEvent(ev.id);
        });

        list.appendChild(li);
    });
}

// ============================================================
// EVENTS – CRUD
// ============================================================

function addEvent({ title, date, time, category, priority, note }) {
    events.push({
        id: Date.now() + Math.random(),
        title,
        date,
        time: time || '',
        category: category || 'privat',
        priority: priority || 'medium',
        note: note || ''
    });
    saveEvents();
}

function deleteEvent(id) {
    events = events.filter(ev => ev.id !== id);
    saveEvents();
    renderCalendar();
    renderDayDetails();
    toast('Termin gelöscht');
}

// ============================================================
// MODAL – NEUER TERMIN
// ============================================================

const addModal = $('#add-modal');

function openAddModal() {
    $('#date').value = todayKey();
    addModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#title').focus(), 250);
}

function closeAddModal() {
    addModal.classList.remove('open');
    document.body.style.overflow = '';
    $('#add-form').reset();
    $('#priority').value = 'medium';
    $('#category').value = 'privat';
}

$('#new-event-btn').addEventListener('click', openAddModal);
$('#close-add-modal').addEventListener('click', closeAddModal);
$('#cancel-add').addEventListener('click', closeAddModal);

addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeAddModal();
});

// ============================================================
// FORM SUBMIT
// ============================================================

$('#add-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = $('#title').value.trim();
    const date = $('#date').value;
    const time = $('#time').value;
    const category = $('#category').value;
    const priority = $('#priority').value;
    const note = $('#note').value.trim();

    if (!title || !date) return;

    addEvent({ title, date, time, category, priority, note });

    const [y, m] = date.split('-').map(Number);
    if (y !== currentViewDate.getFullYear() || (m - 1) !== currentViewDate.getMonth()) {
        currentViewDate = new Date(y, m - 1, 1);
    }

    selectedDateKey = date;

    closeAddModal();
    renderCalendar();
    renderDayDetails();
    toast('Termin hinzugefügt');
});

// ============================================================
// MONATS-NAVIGATION
// ============================================================

$('#prev-month').addEventListener('click', () => {
    currentViewDate = new Date(
        currentViewDate.getFullYear(),
        currentViewDate.getMonth() - 1,
        1
    );
    renderCalendar();
});

$('#next-month').addEventListener('click', () => {
    currentViewDate = new Date(
        currentViewDate.getFullYear(),
        currentViewDate.getMonth() + 1,
        1
    );
    renderCalendar();
});

// ============================================================
// DAY DETAILS CLOSE
// ============================================================

$('#close-day-details').addEventListener('click', () => {
    selectedDateKey = null;
    renderCalendar();
    renderDayDetails();
});

// ============================================================
// MAINTENANCE
// ============================================================

function countPastEvents() {
    const today = todayKey();
    return events.filter(ev => ev.date < today).length;
}

$('#maintenance-btn').addEventListener('click', () => {
    const count = countPastEvents();

    if (count === 0) {
        toast('Keine vergangenen Termine vorhanden');
        return;
    }

    $('#modal-count').textContent = `${count} Termin${count === 1 ? '' : 'e'} werden gelöscht.`;
    $('#confirm-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
});

$('#modal-cancel').addEventListener('click', closeConfirmModal);

$('#confirm-modal').addEventListener('click', (e) => {
    if (e.target === $('#confirm-modal')) closeConfirmModal();
});

function closeConfirmModal() {
    $('#confirm-modal').classList.remove('open');
    document.body.style.overflow = '';
}

$('#modal-confirm').addEventListener('click', () => {
    const today = todayKey();
    const before = events.length;
    events = events.filter(ev => ev.date >= today);
    saveEvents();

    closeConfirmModal();
    renderCalendar();
    renderDayDetails();

    const removed = before - events.length;
    toast(`${removed} Termin${removed === 1 ? '' : 'e'} gelöscht`);
});

// ============================================================
// ESC-HANDLER
// ============================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if ($('#confirm-modal').classList.contains('open')) {
            closeConfirmModal();
        } else if (addModal.classList.contains('open')) {
            closeAddModal();
        }
    }
});

// ============================================================
// INIT
// ============================================================

function init() {
    renderCalendar();
    renderDayDetails();
}

init();

console.log('Days ready!');