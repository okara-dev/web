// ============================================================
// Cake – Geburtstags-Kalender mit Generator
// ============================================================

const STORE_KEY = 'cake_birthdays';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// STATE
// ============================================================

let birthdays = loadBirthdays();
let currentGeneratorPerson = null;

// ============================================================
// STORAGE
// ============================================================

function loadBirthdays() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveBirthdays() {
    localStorage.setItem(STORE_KEY, JSON.stringify(birthdays));
}

// ============================================================
// HELPERS
// ============================================================

const MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function calcAge(birthDate) {
    const today = new Date();
    const bd = new Date(birthDate);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age;
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
// KALENDER RENDERN
// ============================================================

function renderCalendar() {
    const calendar = $('#calendar');
    calendar.innerHTML = '';

    // Legende
    const legend = $('#legend');
    legend.innerHTML = `
        <span class="legend-item"><span class="legend-dot familie"></span>Familie</span>
        <span class="legend-item"><span class="legend-dot freunde"></span>Freunde</span>
        <span class="legend-item"><span class="legend-dot arbeit"></span>Arbeit</span>
        <span class="legend-item"><span class="legend-dot sonstiges"></span>Sonstiges</span>
    `;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    for (let m = 0; m < 12; m++) {
        const monthEl = document.createElement('div');
        monthEl.className = 'month';

        const title = document.createElement('div');
        title.className = 'month-title';
        title.textContent = MONTHS[m];
        monthEl.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'month-grid';

        DAYS_SHORT.forEach(d => {
            const lbl = document.createElement('div');
            lbl.className = 'day-label';
            lbl.textContent = d;
            grid.appendChild(lbl);
        });

        const firstDay = new Date(today.getFullYear(), m, 1);
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        for (let i = 0; i < startOffset; i++) {
            const empty = document.createElement('div');
            empty.className = 'day empty';
            grid.appendChild(empty);
        }

        const daysInMonth = new Date(today.getFullYear(), m + 1, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = d;

            const isToday = (m === currentMonth && d === currentDay);

            const dayBirthdays = birthdays.filter(b => {
                const bd = new Date(b.date);
                return bd.getMonth() === m && bd.getDate() === d;
            });

            if (dayBirthdays.length > 0) {
                dayEl.classList.add('has-birthday');
                const gruppe = dayBirthdays[0].group || 'sonstiges';
                dayEl.classList.add(`gruppe-${gruppe}`);

                const tooltip = document.createElement('div');
                tooltip.className = 'day-tooltip';
                tooltip.innerHTML = dayBirthdays.map(b => {
                    const age = calcAge(b.date);
                    return `${b.name} (${age})`;
                }).join('<br>');
                dayEl.appendChild(tooltip);

                dayEl.addEventListener('click', () => {
                    if (dayBirthdays.length === 1) {
                        openGenerator(dayBirthdays[0]);
                    } else {
                        const names = dayBirthdays.map(b => b.name).join(', ');
                        const choice = prompt(`Mehrere Geburtstage an diesem Tag:\n${names}\n\nNamen eingeben für Generator:`);
                        if (choice) {
                            const found = dayBirthdays.find(b => b.name.toLowerCase() === choice.toLowerCase());
                            if (found) openGenerator(found);
                        }
                    }
                });
            }

            if (isToday) dayEl.classList.add('today');

            grid.appendChild(dayEl);
        }

        monthEl.appendChild(grid);
        calendar.appendChild(monthEl);
    }
}

// ============================================================
// FORMULAR – Geburtstag hinzufügen
// ============================================================

$('#add-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#name').value.trim();
    const date = $('#date').value;
    const group = $('#group').value;
    const note = $('#note').value.trim();

    if (!name || !date) return;

    birthdays.push({
        id: Date.now() + Math.random(),
        name,
        date,
        group,
        note
    });

    saveBirthdays();
    renderCalendar();
    e.target.reset();
    burstConfetti(8);
});

// ============================================================
// KONFETTI
// ============================================================

function burstConfetti(count = 12) {
    const colors = ['#f472b6', '#a78bfa', '#fbbf24', '#6ee7b7', '#38bdf8'];
    for (let i = 0; i < count; i++) {
        const c = document.createElement('div');
        c.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 2px;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: transform 1s ease-out, opacity 1s ease-out;
        `;
        document.body.appendChild(c);

        requestAnimationFrame(() => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 200;
            c.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) rotate(${Math.random() * 720}deg)`;
            c.style.opacity = '0';
        });

        setTimeout(() => c.remove(), 1100);
    }
}

// ============================================================
// GENERATOR
// ============================================================

function openGenerator(person) {
    currentGeneratorPerson = person;
    $('#modal-person-name').textContent = person.name;
    $('#generator-modal').classList.add('open');

    $('#gen-message').value = `Alles Gute zum Geburtstag, ${person.name}!\nIch wünsche dir einen wundervollen Tag voller Freude und Liebe.`;
    $('#gen-from').value = '';
    $('#gen-wishes').value = 'Gesundheit\nGlück\nErfolg\nFreude';
    $('#gen-gift').value = 'Eine kleine Überraschung für dich!';

    updatePreview();
}

$('#close-modal').addEventListener('click', () => {
    $('#generator-modal').classList.remove('open');
});

$('#generator-modal').addEventListener('click', (e) => {
    if (e.target === $('#generator-modal')) {
        $('#generator-modal').classList.remove('open');
    }
});

['#gen-message', '#gen-from', '#gen-wishes', '#gen-gift', '#gen-template'].forEach(sel => {
    const el = $(sel);
    if (el) {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
    }
});

$('#btn-preview').addEventListener('click', updatePreview);

function updatePreview() {
    if (!currentGeneratorPerson) return;
    const html = generateBirthdayHTML(currentGeneratorPerson);
    $('#preview-frame').srcdoc = html;
}

$('#btn-download').addEventListener('click', () => {
    if (!currentGeneratorPerson) return;
    const html = generateBirthdayHTML(currentGeneratorPerson);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geburtstag_${currentGeneratorPerson.name.toLowerCase().replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    burstConfetti(20);
});

// ============================================================
// HTML GENERATOR
// ============================================================

function generateBirthdayHTML(person) {
    const name = escapeHtml(person.name);
    const message = escapeHtml($('#gen-message').value || `Alles Gute zum Geburtstag, ${person.name}!`);
    const from = escapeHtml($('#gen-from').value || '');
    const wishesRaw = $('#gen-wishes').value || '';
    const wishes = wishesRaw.split('\n').map(w => w.trim()).filter(Boolean);
    const giftMessage = escapeHtml($('#gen-gift').value || 'Eine kleine Überraschung für dich!');
    const template = $('#gen-template').value;
    const age = calcAge(person.date);

    const messagesHtml = message.split('\n').map(l => `<p>${escapeHtml(l)}</p>`).join('');
    const wishesHtml = wishes.map((w, i) => `
        <li style="animation-delay: ${i * 0.15}s">
            <span class="wish-icon">*</span> ${escapeHtml(w)}
        </li>
    `).join('');

    const fromHtml = from ? `<p class="from">- von ${from}</p>` : '';

    const baseStyles = getTemplateStyles(template);
    const decorations = getTemplateDecorations(template);

    return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Happy Birthday, ${name}!</title>
<style>
${baseStyles}
</style>
</head>
<body>
    ${decorations}
    <div class="container">
        <div class="card">
            <div class="age-badge">${age} Jahre</div>
            <h1>Happy Birthday,<br><span class="name">${name}</span>!</h1>
            <div class="message">
                ${messagesHtml}
            </div>
            ${fromHtml}
            ${wishes.length ? `
            <div class="wishes-section">
                <h2>Meine Wünsche für dich</h2>
                <ul class="wishes">${wishesHtml}</ul>
            </div>` : ''}

            <!-- KUCHEN MIT KERZEN -->
            <div class="cake-section">
                <h2 class="cake-title">Blas die Kerzen aus!</h2>
                <p class="cake-hint" id="cakeHint">Klick auf die Kerzen oder puste ins Mikrofon</p>
                <div class="cake">
                    <div class="candles" id="candles"></div>
                    <div class="cake-top"></div>
                    <div class="cake-middle"></div>
                    <div class="cake-bottom"></div>
                </div>
                <div class="cake-wish" id="cakeWish"></div>
            </div>

            <!-- GESCHENK -->
            <div class="gift-section">
                <button class="gift-btn" onclick="openGift()">
                    <span class="gift-emoji">🎁</span>
                    <span class="gift-text">Geschenk öffnen</span>
                </button>
                <div class="gift-reveal" id="giftReveal">
                    <div class="gift-message">${giftMessage}</div>
                </div>
            </div>

            <!-- MUSIK-BUTTON -->
            <button class="music-toggle" id="musicToggle" onclick="toggleMusic()" title="Musik an/aus">
                <span id="musicIcon">♪</span>
            </button>
        </div>
    </div>
    <script>
        // ============================================================
        // KONFETTI
        // ============================================================
        const colors = ['#f472b6', '#a78bfa', '#fbbf24', '#6ee7b7', '#38bdf8'];
        function makeConfetti() {
            for (let i = 0; i < 60; i++) {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = Math.random() * 100 + '%';
                c.style.background = colors[Math.floor(Math.random() * colors.length)];
                c.style.animationDelay = Math.random() * 3 + 's';
                c.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(c);
            }
        }
        makeConfetti();

        // ============================================================
        // SOUNDS
        // ============================================================
        function playWinSound() {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const now = audioCtx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, now + i * 0.2);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + i * 0.2);
                osc.stop(now + i * 0.2 + 0.5);
            });
        }

        function playBlowSound() {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }

        // ============================================================
        // KERZEN
        // ============================================================
        const candleCount = ${Math.min(Math.max(age, 3), 10)};
        const candlesContainer = document.getElementById('candles');
        const cakeWish = document.getElementById('cakeWish');
        let blownCount = 0;

        for (let i = 0; i < candleCount; i++) {
            const candle = document.createElement('div');
            candle.className = 'candle';
            candle.innerHTML = '<div class="flame"></div>';
            candle.addEventListener('click', () => blowCandle(candle));
            candlesContainer.appendChild(candle);
        }

        function blowCandle(candle) {
            if (candle.classList.contains('blown')) return;
            candle.classList.add('blown');
            blownCount++;
            playBlowSound();

            if (blownCount === candleCount) {
                setTimeout(() => {
                    cakeWish.textContent = 'Wunsch erfüllt!';
                    cakeWish.classList.add('show');
                    makeConfetti();
                    playWinSound();
                }, 300);
            }
        }

        // Mikrofon
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    const data = new Uint8Array(analyser.frequencyBinCount);

                    function checkBlow() {
                        analyser.getByteFrequencyData(data);
                        let sum = 0;
                        for (let i = 0; i < data.length; i++) sum += data[i];
                        const avg = sum / data.length;

                        if (avg > 60) {
                            const unblown = document.querySelectorAll('.candle:not(.blown)');
                            if (unblown.length > 0) {
                                blowCandle(unblown[Math.floor(Math.random() * unblown.length)]);
                            }
                        }
                        requestAnimationFrame(checkBlow);
                    }
                    checkBlow();
                })
                .catch(() => {});
        }

        // ============================================================
        // GESCHENK
        // ============================================================
        function openGift() {
            const btn = document.querySelector('.gift-btn');
            const reveal = document.getElementById('giftReveal');
            btn.style.transform = 'scale(0)';
            btn.style.opacity = '0';
            reveal.style.transform = 'scale(1)';
            reveal.style.opacity = '1';
            makeConfetti();
            playWinSound();
        }

        // ============================================================
        // MUSIK (Happy Birthday)
        // ============================================================
        let musicPlaying = false;
        let musicCtx = null;
        let musicTimeout = null;

        function toggleMusic() {
            if (musicPlaying) stopMusic();
            else startMusic();
        }

        function startMusic() {
            musicCtx = musicCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (musicCtx.state === 'suspended') musicCtx.resume();
            musicPlaying = true;
            document.getElementById('musicIcon').textContent = '♪';
            playHappyBirthday();
        }

        function stopMusic() {
            musicPlaying = false;
            document.getElementById('musicIcon').textContent = '×';
            if (musicTimeout) clearTimeout(musicTimeout);
        }

        const NOTES = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
            'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
            'E5': 659.25, 'F5': 698.46, 'G5': 783.99
        };

        const MELODY = [
            ['G4', 0.5], ['G4', 0.25], ['A4', 0.75], ['G4', 0.75], ['C5', 0.75], ['B4', 1.25],
            ['G4', 0.5], ['G4', 0.25], ['A4', 0.75], ['G4', 0.75], ['D5', 0.75], ['C5', 1.25],
            ['G4', 0.5], ['G4', 0.25], ['G5', 0.75], ['E5', 0.75], ['C5', 0.75], ['B4', 0.75], ['A4', 1.25],
            ['F5', 0.5], ['F5', 0.25], ['E5', 0.75], ['C5', 0.75], ['D5', 0.75], ['C5', 1.5]
        ];

        function playNote(freq, duration, startTime) {
            if (!musicCtx || !musicPlaying) return;
            const osc = musicCtx.createOscillator();
            const gain = musicCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.connect(gain);
            gain.connect(musicCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        }

        function playHappyBirthday() {
            if (!musicPlaying) return;
            const now = musicCtx.currentTime;
            let time = now;
            MELODY.forEach(([note, dur]) => {
                playNote(NOTES[note], dur * 0.5, time);
                time += dur * 0.5;
            });
            const totalDuration = MELODY.reduce((sum, [, d]) => sum + d * 0.5, 0);
            musicTimeout = setTimeout(() => {
                if (musicPlaying) playHappyBirthday();
            }, (totalDuration + 1.5) * 1000);
        }

        // Musik startet beim ersten Klick
        document.addEventListener('click', function initMusic() {
            if (!musicPlaying && !musicCtx) startMusic();
            document.removeEventListener('click', initMusic);
        }, { once: true });
    <\/script>
</body>
</html>`;
}

// ============================================================
// TEMPLATES
// ============================================================

function getTemplateStyles(template) {
    const common = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            overflow-x: hidden;
            position: relative;
        }
        .container {
            position: relative;
            z-index: 2;
            max-width: 640px;
            width: 100%;
        }
        .card {
            padding: 48px 40px;
            border-radius: 24px;
            text-align: center;
            position: relative;
            animation: popIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popIn {
            0% { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .age-badge {
            display: inline-block;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 800;
            margin-bottom: 20px;
            letter-spacing: 0.5px;
        }
        h1 {
            font-size: 2.2rem;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 24px;
        }
        .name {
            display: inline-block;
            font-size: 2.6rem;
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 3s linear infinite;
        }
        @keyframes shine {
            to { background-position: 200% center; }
        }
        .message {
            margin-bottom: 20px;
            text-align: left;
            font-size: 1.05rem;
            line-height: 1.7;
        }
        .message p { margin-bottom: 8px; }
        .from {
            font-style: italic;
            font-size: 0.95rem;
            margin-bottom: 24px;
            opacity: 0.75;
        }
        .wishes-section {
            margin: 32px 0;
            padding: 24px;
            border-radius: 16px;
        }
        .wishes-section h2 {
            font-size: 1.1rem;
            margin-bottom: 16px;
            font-weight: 700;
        }
        .wishes {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .wishes li {
            font-size: 1rem;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 10px;
            animation: slideIn 0.5s ease both;
        }
        .wish-icon {
            margin-right: 6px;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to   { opacity: 1; transform: translateX(0); }
        }

        /* KUCHEN */
        .cake-section {
            margin: 32px 0;
            text-align: center;
        }
        .cake-title {
            font-size: 1.15rem;
            margin-bottom: 6px;
            font-weight: 700;
        }
        .cake-hint {
            font-size: 0.78rem;
            opacity: 0.6;
            margin-bottom: 20px;
        }
        .cake {
            position: relative;
            width: 220px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .candles {
            display: flex;
            gap: 10px;
            margin-bottom: 4px;
            z-index: 2;
        }
        .candle {
            width: 10px;
            height: 42px;
            background: linear-gradient(180deg, #fbbf24, #f59e0b);
            border-radius: 3px;
            position: relative;
            cursor: pointer;
            transition: opacity 0.4s, transform 0.4s;
        }
        .candle:hover {
            transform: translateY(-2px);
        }
        .candle .flame {
            position: absolute;
            top: -16px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 18px;
            background: radial-gradient(circle at 50% 70%, #fef08a, #f97316);
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            animation: flicker 0.15s ease-in-out infinite alternate;
            box-shadow: 0 0 14px rgba(251, 191, 36, 0.8);
        }
        @keyframes flicker {
            0%   { transform: translateX(-50%) scale(1) rotate(-3deg); }
            100% { transform: translateX(-50%) scale(1.1) rotate(3deg); }
        }
        .candle.blown .flame { display: none; }
        .candle.blown { opacity: 0.5; }
        .cake-top, .cake-middle, .cake-bottom {
            width: 100%;
            border-radius: 10px;
        }
        .cake-top {
            height: 32px;
            background: linear-gradient(180deg, #fda4af, #fb7185);
            border-radius: 14px 14px 0 0;
        }
        .cake-middle {
            height: 44px;
            background: linear-gradient(180deg, #fcd34d, #fbbf24);
        }
        .cake-bottom {
            height: 44px;
            background: linear-gradient(180deg, #fb7185, #e11d48);
            border-radius: 0 0 10px 10px;
        }
        .cake-wish {
            margin-top: 20px;
            font-size: 1.15rem;
            font-weight: 800;
            color: #db2777;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cake-wish.show {
            opacity: 1;
            transform: scale(1);
        }

        /* GESCHENK */
        .gift-section {
            margin-top: 32px;
            position: relative;
        }
        .gift-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            font-family: inherit;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px 24px;
            border-radius: 20px;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-8px); }
        }
        .gift-emoji { font-size: 3rem; }
        .gift-text {
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .gift-reveal {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%) scale(0.5);
            opacity: 0;
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            width: 100%;
            padding: 24px;
            border-radius: 16px;
        }
        .gift-message {
            font-size: 1.15rem;
            font-weight: 800;
            line-height: 1.5;
        }

        /* MUSIK */
        .music-toggle {
            position: fixed;
            top: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.9);
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 100;
            transition: transform 0.2s;
        }
        .music-toggle:hover {
            transform: scale(1.1);
        }

        /* KONFETTI */
        .confetti {
            position: fixed;
            top: -20px;
            width: 10px;
            height: 10px;
            border-radius: 2px;
            pointer-events: none;
            z-index: 1;
            animation: fall linear infinite;
        }
        @keyframes fall {
            to { transform: translateY(110vh) rotate(720deg); }
        }

        @media (max-width: 500px) {
            .card { padding: 32px 24px; }
            h1 { font-size: 1.6rem; }
            .name { font-size: 2rem; }
            .cake { width: 180px; }
        }
    `;

    if (template === 'confetti') {
        return common + `
            body {
                background: linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #e0e7ff 100%);
            }
            .card {
                background: #ffffff;
                box-shadow: 0 30px 80px rgba(244, 114, 182, 0.25);
                border: 2px solid #fbcfe8;
            }
            .age-badge {
                background: linear-gradient(135deg, #f472b6, #a78bfa);
                color: #fff;
            }
            h1 { color: #2d1b3d; }
            .name {
                background-image: linear-gradient(90deg, #f472b6, #a78bfa, #38bdf8, #f472b6);
                background-size: 200% auto;
            }
            .message { color: #4a3a5a; }
            .wishes-section {
                background: linear-gradient(135deg, #fdf2f8, #f5f3ff);
                border: 1px solid #fbcfe8;
            }
            .wishes-section h2 { color: #db2777; }
            .wishes li {
                background: #fff;
                color: #4a3a5a;
                border: 1px solid #fbcfe8;
            }
            .gift-btn {
                background: linear-gradient(135deg, #f472b6, #a78bfa);
                color: #fff;
                box-shadow: 0 10px 30px rgba(244, 114, 182, 0.4);
            }
            .gift-reveal {
                background: linear-gradient(135deg, #fbbf24, #f472b6);
                color: #fff;
                box-shadow: 0 20px 60px rgba(251, 191, 36, 0.5);
            }
            .from { color: #7a6a8a; }
        `;
    }

    if (template === 'elegant') {
        return common + `
            body {
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            }
            .card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(212, 175, 55, 0.3);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
            }
            .age-badge {
                background: linear-gradient(135deg, #d4af37, #f7e98e);
                color: #1e1b4b;
            }
            h1 { color: #f1f5f9; }
            .name {
                background-image: linear-gradient(90deg, #d4af37, #f7e98e, #d4af37);
                background-size: 200% auto;
            }
            .message { color: #cbd5e1; }
            .wishes-section {
                background: rgba(212, 175, 55, 0.05);
                border: 1px solid rgba(212, 175, 55, 0.2);
            }
            .wishes-section h2 { color: #d4af37; }
            .wishes li {
                background: rgba(212, 175, 55, 0.08);
                color: #e2e8f0;
                border: 1px solid rgba(212, 175, 55, 0.15);
            }
            .gift-btn {
                background: linear-gradient(135deg, #d4af37, #f7e98e);
                color: #1e1b4b;
                box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
            }
            .gift-reveal {
                background: linear-gradient(135deg, #d4af37, #fbbf24);
                color: #1e1b4b;
                box-shadow: 0 20px 60px rgba(212, 175, 55, 0.6);
            }
            .from { color: #94a3b8; }
            .cake-title, .cake-hint, .cake-wish { color: #f1f5f9; }
            .cake-wish.show { color: #d4af37; }
            .confetti {
                background: #d4af37 !important;
                opacity: 0.5;
            }
            .music-toggle {
                background: rgba(212, 175, 55, 0.9);
                color: #1e1b4b;
            }
        `;
    }

    // Retro (Fallback)
    return common + `
        body {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%);
        }
        .card {
            background: #fffbf5;
            box-shadow: 0 30px 80px rgba(251, 146, 60, 0.3);
            border: 3px dashed #fb923c;
        }
        .age-badge {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            color: #fff;
        }
        h1 {
            color: #7c2d12;
            font-family: 'Courier New', monospace;
        }
        .name {
            background-image: linear-gradient(90deg, #fb923c, #ef4444, #f59e0b, #fb923c);
            background-size: 200% auto;
            font-family: 'Courier New', monospace;
        }
        .message { color: #78350f; }
        .wishes-section {
            background: #fef3c7;
            border: 2px dashed #f59e0b;
        }
        .wishes-section h2 { color: #b45309; }
        .wishes li {
            background: #fffbeb;
            color: #78350f;
            border: 1px solid #fcd34d;
        }
        .gift-btn {
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: #fff;
            box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
        }
        .gift-reveal {
            background: linear-gradient(135deg, #ef4444, #f59e0b);
            color: #fff;
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.5);
        }
        .from { color: #92400e; }
        .cake-title, .cake-hint { color: #78350f; }
        .cake-wish.show { color: #b45309; }
    `;
}

function getTemplateDecorations(template) {
    if (template === 'elegant') {
        return `<div style="position:fixed;inset:0;background:radial-gradient(circle at 20% 30%,rgba(212,175,55,0.15),transparent 50%),radial-gradient(circle at 80% 70%,rgba(212,175,55,0.1),transparent 50%);pointer-events:none;z-index:0;"></div>`;
    }
    if (template === 'retro') {
        return `<div style="position:fixed;inset:0;background-image:radial-gradient(circle,rgba(251,146,60,0.1) 1.5px,transparent 1.5px);background-size:30px 30px;pointer-events:none;z-index:0;"></div>`;
    }
    return '';
}

// ============================================================
// INIT
// ============================================================

renderCalendar();
console.log('Cake ready!');