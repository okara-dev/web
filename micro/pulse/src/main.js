// ============================================================
// Pulse – Jahres-Tracker für Freelancer & Shops
// ============================================================

const STORE_KEY = 'pulse_data_v2';

const $ = (sel) => document.querySelector(sel);

const MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

// ============================================================
// STATE
// ============================================================

let data = loadData();

function loadData() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORE_KEY));
        if (raw && Array.isArray(raw.revenue) && Array.isArray(raw.costs)
            && raw.revenue.length === 12 && raw.costs.length === 12) {
            return raw;
        }
    } catch {}

    return {
        revenue: Array.from({ length: 12 }, () => []),
        costs: Array.from({ length: 12 }, () => [])
    };
}

function saveData() {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

// ============================================================
// HELPERS
// ============================================================

function formatEuro(value) {
    return value.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' €';
}

function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function getMonthTotal(type, monthIndex) {
    return data[type][monthIndex].reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

function getYearTotal(type) {
    return data[type].reduce((sum, monthEntries) =>
        sum + monthEntries.reduce((s, e) => s + (e.amount || 0), 0), 0);
}

// ============================================================
// TABS
// ============================================================

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $('#panel-' + tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'home') renderChart();
    });
});

// ============================================================
// MONTHS LIST (Revenue + Costs)
// ============================================================

function renderMonthsList(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = MONTHS.map((monthName, monthIdx) => {
        const entries = data[type][monthIdx];
        const total = getMonthTotal(type, monthIdx);
        const filled = total > 0;

        const entriesHtml = entries.map((entry, entryIdx) => `
            <div class="entry" data-month="${monthIdx}" data-entry="${entryIdx}">
                <input type="text"
                       class="entry-source"
                       placeholder="Quelle (z. B. Gumroad)"
                       value="${entry.source || ''}"
                       data-type="${type}"
                       data-month="${monthIdx}"
                       data-entry="${entryIdx}"
                       data-field="source">
                <div class="entry-amount-wrapper">
                    <input type="number"
                           class="entry-amount"
                           min="0"
                           step="0.01"
                           placeholder="0.00"
                           value="${entry.amount > 0 ? entry.amount : ''}"
                           data-type="${type}"
                           data-month="${monthIdx}"
                           data-entry="${entryIdx}"
                           data-field="amount">
                    <span class="entry-currency">€</span>
                </div>
                <button class="entry-remove"
                        data-type="${type}"
                        data-month="${monthIdx}"
                        data-entry="${entryIdx}"
                        title="Eintrag löschen">✕</button>
            </div>
        `).join('');

        return `
            <div class="month-block ${filled ? 'filled' : ''} ${type === 'costs' ? 'costs' : ''}">
                <div class="month-header">
                    <span class="month-title">${monthName}</span>
                    <span class="month-total">${formatEuro(total)}</span>
                </div>
                <div class="month-entries">
                    ${entriesHtml}
                </div>
                <button class="btn-add-entry"
                        data-type="${type}"
                        data-month="${monthIdx}">
                    + Eintrag hinzufügen
                </button>
            </div>
        `;
    }).join('');

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', handleEntryInput);
    });

    container.querySelectorAll('.entry-remove').forEach(btn => {
        btn.addEventListener('click', handleEntryRemove);
    });

    container.querySelectorAll('.btn-add-entry').forEach(btn => {
        btn.addEventListener('click', handleAddEntry);
    });
}

function handleEntryInput(e) {
    const input = e.target;
    const type = input.dataset.type;
    const monthIdx = parseInt(input.dataset.month, 10);
    const entryIdx = parseInt(input.dataset.entry, 10);
    const field = input.dataset.field;

    if (!data[type][monthIdx][entryIdx]) return;

    if (field === 'amount') {
        data[type][monthIdx][entryIdx].amount = parseFloat(input.value) || 0;
    } else if (field === 'source') {
        data[type][monthIdx][entryIdx].source = input.value;
    }

    saveData();

    if (field === 'amount') {
        updateMonthTotal(type, monthIdx);
        renderStats();
        updateExportButton();
    }
}

function updateMonthTotal(type, monthIdx) {
    const total = getMonthTotal(type, monthIdx);
    const container = type === 'revenue' ? $('#revenueList') : $('#costsList');
    const monthBlock = container.querySelectorAll('.month-block')[monthIdx];
    if (!monthBlock) return;

    monthBlock.querySelector('.month-total').textContent = formatEuro(total);
    monthBlock.classList.toggle('filled', total > 0);
}

function handleEntryRemove(e) {
    const btn = e.currentTarget;
    const type = btn.dataset.type;
    const monthIdx = parseInt(btn.dataset.month, 10);
    const entryIdx = parseInt(btn.dataset.entry, 10);

    data[type][monthIdx].splice(entryIdx, 1);
    saveData();

    if (type === 'revenue') renderMonthsList('revenueList', 'revenue');
    else renderMonthsList('costsList', 'costs');

    renderStats();
    updateExportButton();
}

function handleAddEntry(e) {
    const btn = e.currentTarget;
    const type = btn.dataset.type;
    const monthIdx = parseInt(btn.dataset.month, 10);

    data[type][monthIdx].push({ source: '', amount: 0 });
    saveData();

    if (type === 'revenue') renderMonthsList('revenueList', 'revenue');
    else renderMonthsList('costsList', 'costs');

    const container = type === 'revenue' ? $('#revenueList') : $('#costsList');
    const monthBlock = container.querySelectorAll('.month-block')[monthIdx];
    const newEntry = monthBlock.querySelectorAll('.entry');
    const lastEntry = newEntry[newEntry.length - 1];
    if (lastEntry) lastEntry.querySelector('.entry-source').focus();
}

// ============================================================
// STATS
// ============================================================

function renderStats() {
    const totalRevenue = getYearTotal('revenue');
    const totalCosts = getYearTotal('costs');
    const totalProfit = totalRevenue - totalCosts;

    let bestMonth = '–';
    let bestValue = -Infinity;
    for (let i = 0; i < 12; i++) {
        const profit = getMonthTotal('revenue', i) - getMonthTotal('costs', i);
        if (profit > bestValue && (getMonthTotal('revenue', i) > 0 || getMonthTotal('costs', i) > 0)) {
            bestValue = profit;
            bestMonth = MONTHS[i];
        }
    }
    if (bestValue <= 0) bestMonth = '–';

    let filledMonths = 0;
    for (let i = 0; i < 12; i++) {
        if (getMonthTotal('revenue', i) > 0 || getMonthTotal('costs', i) > 0) filledMonths++;
    }

    const avgProfit = filledMonths > 0 ? totalProfit / filledMonths : 0;

    $('#statRevenue').textContent = formatEuro(totalRevenue);
    $('#statCosts').textContent = formatEuro(totalCosts);
    $('#statProfit').textContent = formatEuro(totalProfit);
    $('#statProfit').style.color = totalProfit >= 0 ? 'var(--green)' : 'var(--red)';
    $('#statBest').textContent = bestValue > 0 ? `${bestMonth} (${formatEuro(bestValue)})` : '–';
    $('#statAvg').textContent = formatEuro(avgProfit);
    $('#statMonths').textContent = `${filledMonths} / 12`;
}

// ============================================================
// CHART
// ============================================================

let chart = null;

function renderChart() {
    const ctx = $('#profitChart').getContext('2d');

    const profits = Array.from({ length: 12 }, (_, i) =>
        getMonthTotal('revenue', i) - getMonthTotal('costs', i)
    );

    const colors = profits.map(p =>
        p > 0 ? 'rgba(16, 185, 129, 0.7)' : (p < 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(138, 148, 168, 0.3)')
    );
    const borderColors = profits.map(p =>
        p > 0 ? '#10b981' : (p < 0 ? '#ef4444' : '#8a94a8')
    );

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MONTHS.map(m => m.substring(0, 3)),
            datasets: [{
                label: 'Gewinn',
                data: profits,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(11, 18, 32, 0.95)',
                    borderColor: '#22d3ee',
                    borderWidth: 1,
                    padding: 12,
                    titleColor: '#e6edf7',
                    bodyColor: '#22d3ee',
                    callbacks: {
                        label: (ctx) => {
                            const i = ctx.dataIndex;
                            const rev = getMonthTotal('revenue', i);
                            const cost = getMonthTotal('costs', i);
                            const profit = rev - cost;
                            return [
                                `Gewinn: ${formatEuro(profit)}`,
                                `Erlös: ${formatEuro(rev)}`,
                                `Kosten: ${formatEuro(cost)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#8a94a8', font: { size: 11, weight: '600' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: {
                        color: '#8a94a8',
                        font: { size: 11 },
                        callback: (v) => v.toLocaleString('de-DE') + ' €'
                    }
                }
            }
        }
    });
}

// ============================================================
// EXPORT
// ============================================================

function countFilledMonths() {
    let count = 0;
    for (let i = 0; i < 12; i++) {
        if (getMonthTotal('revenue', i) > 0 || getMonthTotal('costs', i) > 0) count++;
    }
    return count;
}

function updateExportButton() {
    const filled = countFilledMonths();
    const btn = $('#exportBtn');
    const hint = $('#exportHint');

    if (filled === 12) {
        btn.classList.add('ready');
        hint.textContent = 'Alle 12 Monate eingetragen. Du kannst jetzt deine Jahresübersicht exportieren.';
    } else {
        btn.classList.remove('ready');
        hint.textContent = `Noch ${12 - filled} Monat(e) eintragen, um die Jahresübersicht zu exportieren.`;
    }
}

// ============================================================
// EXPORT – MODAL FLOW (Option B: Button immer klickbar)
// ============================================================

const confirmModal = $('#confirmModal');
const modalCancel = $('#modalCancel');
const modalConfirm = $('#modalConfirm');

$('#exportBtn').addEventListener('click', () => {
    // Wenn noch nicht alle 12 Monate voll → Hinweis + Toast, kein Modal
    if (countFilledMonths() < 12) {
        const missing = 12 - countFilledMonths();
        toast(`Bitte erst alle 12 Monate eintragen. Es fehlen noch ${missing}.`, true);
        return;
    }

    confirmModal.classList.add('open');
    document.body.style.overflow = 'hidden';
});

modalCancel.addEventListener('click', closeModal);

confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal.classList.contains('open')) {
        closeModal();
    }
});

function closeModal() {
    confirmModal.classList.remove('open');
    document.body.style.overflow = '';
}

modalConfirm.addEventListener('click', () => {
    closeModal();

    exportCSV();

    setTimeout(() => {
        data = {
            revenue: Array.from({ length: 12 }, () => []),
            costs: Array.from({ length: 12 }, () => [])
        };
        saveData();
        renderMonthsList('revenueList', 'revenue');
        renderMonthsList('costsList', 'costs');
        renderStats();
        renderChart();
        updateExportButton();
        toast('Export erfolgreich. Neues Jahr gestartet.');
    }, 600);
});

function exportCSV() {
    const header = ['Monat', 'Quelle', 'Typ', 'Betrag (€)'];

    const rows = [];

    for (let i = 0; i < 12; i++) {
        data.revenue[i].forEach(entry => {
            if (entry.amount > 0 || entry.source) {
                rows.push([MONTHS[i], entry.source || '', 'Erlös', entry.amount.toFixed(2).replace('.', ',')]);
            }
        });
        data.costs[i].forEach(entry => {
            if (entry.amount > 0 || entry.source) {
                rows.push([MONTHS[i], entry.source || '', 'Kosten', entry.amount.toFixed(2).replace('.', ',')]);
            }
        });
    }

    rows.push([]);
    rows.push(['Monatliche Summen']);
    rows.push(['Monat', 'Erlös (€)', 'Kosten (€)', 'Gewinn (€)']);

    for (let i = 0; i < 12; i++) {
        const rev = getMonthTotal('revenue', i);
        const cost = getMonthTotal('costs', i);
        const profit = rev - cost;
        rows.push([
            MONTHS[i],
            rev.toFixed(2).replace('.', ','),
            cost.toFixed(2).replace('.', ','),
            profit.toFixed(2).replace('.', ',')
        ]);
    }

    const totalRevenue = getYearTotal('revenue');
    const totalCosts = getYearTotal('costs');
    const totalProfit = totalRevenue - totalCosts;

    rows.push([]);
    rows.push(['Gesamt', totalRevenue.toFixed(2).replace('.', ','), totalCosts.toFixed(2).replace('.', ','), totalProfit.toFixed(2).replace('.', ',')]);

    const csv = [header, ...rows]
        .map(r => r.join(';'))
        .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const year = new Date().getFullYear();
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse_jahresuebersicht_${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================
// INIT
// ============================================================

function init() {
    renderMonthsList('revenueList', 'revenue');
    renderMonthsList('costsList', 'costs');
    renderStats();
    renderChart();
    updateExportButton();
}

document.addEventListener('DOMContentLoaded', init);

console.log('Pulse ready!');