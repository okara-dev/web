// ============ KONFIGURATION ============
const API_URL = '/api';
let currentUser = null;
let shopConfig = { bundle: null };

// ============ NAVIGATION ============
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(`${pageId}Page`);
    if (activePage) activePage.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });

    if (pageId === 'shop') loadShop();
    if (pageId === 'transformation') loadBundle();
    if (pageId === 'library' && currentUser) loadLibrary();
}

function navigateToShop() { showPage('shop'); }
function navigateToTransformation() { showPage('transformation'); }

// ============ AUTH ============
function getToken() {
    return localStorage.getItem('token');
}

function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiFetch(url, options = {}) {
    const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...authHeaders(),
            ...(options.headers || {})
        }
    });

    if (res.status === 401 || res.status === 403) {
        if (currentUser) {
            logout(false);
            showModalError('Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
            openAuthModal();
        }
    }

    return res;
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const btn = document.getElementById('loginBtn');

    hideModalError();
    if (!email || !password) {
        showModalError('Bitte E-Mail und Passwort eingeben.');
        return;
    }

    setButtonLoading(btn, 'Einloggen...');

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken || '');
            localStorage.setItem('userEmail', data.user.email);
            currentUser = { id: data.user.id, email: data.user.email };
            updateUIForLoggedInUser();
            closeAuthModal();
            showNotification('Login erfolgreich!', 'success');

            const activePage = document.querySelector('.page.active');
            if (activePage) {
                const pageId = activePage.id.replace('Page', '');
                if (pageId === 'shop') loadShop();
                if (pageId === 'transformation') loadBundle();
                if (pageId === 'library') loadLibrary();
            }
        } else {
            showModalError(data.error || 'Login fehlgeschlagen.');
        }
    } catch (err) {
        showModalError('Netzwerkfehler. Bitte später erneut versuchen.');
    } finally {
        resetButton(btn, '<i class="fas fa-sign-in-alt"></i> Einloggen');
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const btn = document.getElementById('registerBtn');

    hideModalError();
    if (!email || !password) {
        showModalError('Bitte E-Mail und Passwort eingeben.');
        return;
    }

    const check = evaluatePassword(password);
    if (!check.valid) {
        showModalError('Passwort erfüllt nicht alle Anforderungen.');
        return;
    }

    setButtonLoading(btn, 'Konto wird erstellt...');

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            if (data.requiresEmailConfirmation) {
                showModalError('Bitte bestätige deine E-Mail-Adresse. Prüfe dein Postfach.', 'success');
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken || '');
            localStorage.setItem('userEmail', data.user.email);
            currentUser = { id: data.user.id, email: data.user.email };
            updateUIForLoggedInUser();
            closeAuthModal();
            showNotification('Registrierung erfolgreich!', 'success');
        } else {
            showModalError(data.error || 'Registrierung fehlgeschlagen.');
        }
    } catch (err) {
        showModalError('Netzwerkfehler. Bitte später erneut versuchen.');
    } finally {
        resetButton(btn, '<i class="fas fa-user-check"></i> Konto erstellen');
    }
}

function showForgotPassword() {
    const loginEmail = document.getElementById('loginEmail')?.value?.trim();
    if (loginEmail) {
        document.getElementById('forgotEmail').value = loginEmail;
    }
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'block';
    document.getElementById('resetForm').style.display = 'none';
    hideModalError();
}

async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail')?.value?.trim();
    const btn = document.getElementById('forgotBtn');

    hideModalError();
    if (!email) {
        showModalError('Bitte E-Mail-Adresse eingeben.');
        return;
    }

    setButtonLoading(btn, 'Wird gesendet...');

    try {
        const res = await fetch(`${API_URL}/password-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (res.ok) {
            showModalError('Wir haben dir eine E-Mail geschickt. Prüfe dein Postfach (auch Spam).', 'success');
        } else {
            showModalError(data.error || 'Fehlgeschlagen.');
        }
    } catch (err) {
        showModalError('Netzwerkfehler.');
    } finally {
        resetButton(btn, '<i class="fas fa-paper-plane"></i> Link zusenden');
    }
}

async function handleResetPassword() {
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('newPasswordConfirm')?.value;
    const btn = document.getElementById('resetBtn');

    hideModalError();
    if (!newPass || !confirmPass) {
        showModalError('Bitte beide Felder ausfüllen.');
        return;
    }
    if (newPass !== confirmPass) {
        showModalError('Die Passwörter stimmen nicht überein.');
        return;
    }
    const check = evaluatePassword(newPass);
    if (!check.valid) {
        showModalError('Passwort erfüllt nicht alle Anforderungen.');
        return;
    }

    setButtonLoading(btn, 'Wird gespeichert...');

    try {
        const res = await fetch(`${API_URL}/password-update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders()
            },
            body: JSON.stringify({ password: newPass })
        });
        const data = await res.json();

        if (res.ok) {
            showNotification('Passwort aktualisiert!', 'success');
            closeAuthModal();
        } else {
            showModalError(data.error || 'Fehlgeschlagen.');
        }
    } catch (err) {
        showModalError('Netzwerkfehler.');
    } finally {
        resetButton(btn, '<i class="fas fa-check"></i> Passwort speichern');
    }
}

async function logout(callApi = true) {
    if (callApi && getToken()) {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: authHeaders()
            });
        } catch (_) { /* ignorieren */ }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    currentUser = null;
    updateUIForLoggedOut();
    showPage('home');
    showNotification('Erfolgreich ausgeloggt', 'info');
}

function updateUIForLoggedInUser() {
    const authBtn = document.getElementById('authBtn');
    const userEmailSpan = document.getElementById('userEmail');
    const libraryLink = document.getElementById('libraryLink');
    const userNameSpan = document.getElementById('userName');

    if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    if (userEmailSpan) userEmailSpan.style.display = 'inline-flex';
    if (userNameSpan) userNameSpan.textContent = currentUser?.email?.split('@')[0] || 'User';
    if (libraryLink) libraryLink.style.display = 'inline-flex';
}

function updateUIForLoggedOut() {
    const authBtn = document.getElementById('authBtn');
    const userEmailSpan = document.getElementById('userEmail');
    const libraryLink = document.getElementById('libraryLink');

    if (authBtn) authBtn.innerHTML = '<i class="fas fa-user"></i> Login';
    if (userEmailSpan) userEmailSpan.style.display = 'none';
    if (libraryLink) libraryLink.style.display = 'none';
}

function checkAuth() {
    const token = getToken();
    if (token) {
        currentUser = { email: localStorage.getItem('userEmail') || '' };
        updateUIForLoggedInUser();
    }
}

// ============ SHOP CONFIG ============
async function loadShopConfig() {
    try {
        const res = await fetch(`${API_URL}/shop-config`);
        if (res.ok) shopConfig = await res.json();
    } catch (e) {
        console.error('Shop config error:', e);
    }
}

// ============ COVER HELPER ============
function coverUrl(slug) {
    return `/covers/${slug}.png`;
}

// ============ SHOP ============
async function loadShop() {
    const freeContainer = document.getElementById('freeEbooksContainer');
    const paidContainer = document.getElementById('paidEbooksContainer');
    if (!freeContainer || !paidContainer) return;

    const loadingHTML = '<div class="loading"><div class="spinner"></div>Lade eBooks...</div>';
    freeContainer.innerHTML = loadingHTML;
    paidContainer.innerHTML = loadingHTML;

    try {
        const res = await fetch(`${API_URL}/shop-ebooks`);
        const ebooks = await res.json();

        let ownedSlugs = new Set();
        if (currentUser) {
            try {
                const ownedRes = await apiFetch('/my-shop-ebooks');
                if (ownedRes.ok) {
                    const owned = await ownedRes.json();
                    ownedSlugs = new Set(owned.filter(e => e.is_purchased).map(e => e.slug));
                }
            } catch (_) {}
        }

        const freeEbooks = ebooks.filter(e => e.is_free);
        const paidEbooks = ebooks.filter(e => !e.is_free);

        freeContainer.innerHTML = freeEbooks.length
            ? freeEbooks.map(e => renderShopCard(e, ownedSlugs)).join('')
            : '<div class="empty-state"><p>Keine kostenlosen eBooks verfügbar.</p></div>';

        paidContainer.innerHTML = paidEbooks.length
            ? paidEbooks.map(e => renderShopCard(e, ownedSlugs)).join('')
            : '<div class="empty-state"><p>Keine Premium-eBooks verfügbar.</p></div>';
    } catch (error) {
        console.error('Shop error:', error);
        freeContainer.innerHTML = '<div class="empty-state"><h3>Fehler beim Laden</h3></div>';
        paidContainer.innerHTML = '';
    }
}

function renderShopCard(ebook, ownedSlugs) {
    const isComingSoon = ebook.coming_soon === true;
    const isOwned = ownedSlugs.has(ebook.slug);
    const price = parseFloat(ebook.price) || 0;

    let button = '';
    if (isComingSoon) {
        button = `<button class="btn btn-disabled btn-small" disabled><i class="fas fa-clock"></i> Bald verfügbar</button>`;
    } else if (ebook.is_free) {
        button = `<button class="btn btn-secondary btn-small" onclick="downloadFreeEbook('${ebook.slug}')"><i class="fas fa-download"></i> Kostenlos herunterladen</button>`;
    } else if (isOwned) {
        button = `<button class="btn btn-secondary btn-small" onclick="downloadShopEbook('${ebook.slug}')"><i class="fas fa-download"></i> Herunterladen</button>`;
    } else {
        button = `<button class="btn btn-primary btn-small" onclick="purchaseShopEbook(${ebook.id}, '${ebook.slug}')"><i class="fas fa-shopping-cart"></i> Jetzt kaufen (${price.toFixed(2)} €)</button>`;
    }

    return `
        <div class="shop-card ${isComingSoon ? 'coming-soon' : ''}">
            <div class="ebook-cover">
                <img src="${coverUrl(ebook.slug)}" alt="${escapeHtml(ebook.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="ebook-cover-fallback" style="display:none;"><i class="fas fa-book"></i><span>${escapeHtml((ebook.title || '?').charAt(0).toUpperCase())}</span></div>
            </div>
            <h3>${escapeHtml(ebook.title)}</h3>
            <p>${escapeHtml(ebook.description || '')}</p>
            <div class="price">${ebook.is_free ? 'Kostenlos' : price.toFixed(2) + ' €'}</div>
            ${button}
        </div>
    `;
}

// ============ DOWNLOADS ============
async function triggerDownload(url, filename, headers = {}) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Download fehlgeschlagen');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(objectUrl);
    a.remove();
}

async function downloadFreeEbook(slug) {
    try {
        await triggerDownload(`${API_URL}/shop-ebooks/download/free/${slug}`, `${slug}.pdf`);
        showNotification('Download gestartet!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function downloadShopEbook(slug) {
    if (!currentUser) {
        showNotification('Bitte einloggen', 'error');
        openAuthModal();
        return;
    }
    try {
        await triggerDownload(
            `${API_URL}/shop-ebooks/download/${slug}`,
            `${slug}.pdf`,
            authHeaders()
        );
        showNotification('Download gestartet!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function downloadBundleEbook(slug) {
    if (!currentUser) {
        showNotification('Bitte einloggen', 'error');
        openAuthModal();
        return;
    }
    try {
        await triggerDownload(
            `${API_URL}/bundles/download/${slug}`,
            `${slug}.pdf`,
            authHeaders()
        );
        showNotification('Download gestartet!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ============ PURCHASE (Einzel-eBook) ============
async function purchaseShopEbook(ebookId, slug) {
    if (!currentUser) {
        showNotification('Bitte zuerst einloggen', 'error');
        openAuthModal();
        return;
    }
    showNotification('Checkout für einzelne eBooks wird gerade eingerichtet.', 'info');
}

// ============ BUNDLE (Transformation) – SIMPLE LAYOUT ============
async function loadBundle() {
    const container = document.getElementById('bundleContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="spinner"></div>Lade Bundle...</div>';

    try {
        const res = await fetch(`${API_URL}/bundles`);
        const bundles = await res.json();

        if (!Array.isArray(bundles) || bundles.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Kein Bundle verfügbar</h3></div>';
            return;
        }

        const bundle = bundles[0];

        let hasBundle = false;
        if (currentUser) {
            try {
                const ownedRes = await apiFetch('/my-bundle');
                if (ownedRes.ok) {
                    const ownedData = await ownedRes.json();
                    hasBundle = ownedData.hasBundle === true;
                }
            } catch (_) {}
        }

        const price = parseFloat(bundle.price) || 0;
        const checkoutUrl = shopConfig.bundle?.checkoutUrl;

        let cta;
        if (hasBundle) {
            cta = `<span class="status purchased"><i class="fas fa-check"></i> Bereits gekauft – In deiner Bibliothek</span>
                   <button class="btn btn-secondary btn-large" onclick="showPage('library')"><i class="fas fa-book-open"></i> Zur Bibliothek</button>`;
        } else if (!checkoutUrl) {
            cta = `<button class="btn btn-disabled btn-large" disabled><i class="fas fa-clock"></i> Checkout wird eingerichtet</button>`;
        } else {
            cta = `<button class="btn btn-primary btn-large" onclick="purchaseBundle()"><i class="fas fa-shopping-cart"></i> Jetzt kaufen (${price.toFixed(2)} €)</button>`;
        }

        container.innerHTML = `
            <div class="bundle-card">
                <div class="bundle-cover-wrapper">
                    <img src="/covers/transformation-bundle.png" alt="${escapeHtml(bundle.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="bundle-cover-fallback" style="display:none;"><i class="fas fa-cube"></i></div>
                </div>
                <div class="bundle-header">
                    <h2>${escapeHtml(bundle.name)}</h2>
                    <p>${escapeHtml(bundle.description || '')}</p>
                    <div class="bundle-price">${price.toFixed(2)} €</div>
                </div>
                <div class="bundle-ebooks">
                    <h3><i class="fas fa-book"></i> Enthaltene eBooks (${bundle.ebooks.length})</h3>
                    <div class="bundle-ebooks-grid">
                        ${bundle.ebooks.map(ebook => `
                            <div class="bundle-ebook-item">
                                <i class="fas fa-book"></i>
                                <div>
                                    <h4>${escapeHtml(ebook.title)}</h4>
                                    <p>${escapeHtml(ebook.description || '')}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bundle-cta">${cta}</div>
            </div>
        `;
    } catch (error) {
        console.error('Bundle error:', error);
        container.innerHTML = '<div class="empty-state"><h3>Fehler beim Laden</h3></div>';
    }
}

async function purchaseBundle() {
    if (!currentUser) {
        showNotification('Bitte zuerst einloggen', 'error');
        openAuthModal();
        return;
    }

    const checkoutUrl = shopConfig.bundle?.checkoutUrl;
    if (!checkoutUrl) {
        showNotification('Checkout wird gerade eingerichtet.', 'error');
        return;
    }

    if (window.LemonSqueezy && window.LemonSqueezy.Url) {
        window.LemonSqueezy.Url.Open(checkoutUrl);
    } else {
        window.open(checkoutUrl, '_blank');
    }

    pollForBundlePurchase();
}

async function pollForBundlePurchase() {
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000));
        if (!currentUser) return;
        try {
            const res = await apiFetch('/my-bundle');
            if (res.ok) {
                const data = await res.json();
                if (data.hasBundle) {
                    showNotification('Bundle erfolgreich freigeschaltet!', 'success');
                    loadBundle();
                    return;
                }
            }
        } catch (_) {}
    }
}

// ============ LIBRARY ============
async function loadLibrary() {
    if (!currentUser) {
        showNotification('Bitte einloggen', 'error');
        return;
    }
    loadBundleLibrary();
    loadShopLibrary();
}

async function loadBundleLibrary() {
    const section = document.getElementById('bundleLibrarySection');
    const container = document.getElementById('bundleEbooksContainer');
    if (!container) return;

    try {
        const res = await apiFetch('/library/bundle');
        if (!res.ok) throw new Error('Fehler');
        const data = await res.json();

        if (!data.hasBundle) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        container.innerHTML = data.ebooks.map(ebook => renderLibraryItem(ebook, 'bundle')).join('');
    } catch (error) {
        console.error('Bundle library error:', error);
        if (section) section.style.display = 'none';
    }
}

async function loadShopLibrary() {
    const container = document.getElementById('purchasedEbooksContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="spinner"></div>Lade eBooks...</div>';

    try {
        const res = await apiFetch('/library/ebooks');
        if (!res.ok) throw new Error('Fehler');
        const data = await res.json();
        const ebooks = data.ebooks || [];

        if (ebooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-book"></i></div>
                    <h3>Noch keine eBooks</h3>
                    <p>Entdecke unsere eBooks im Shop</p>
                    <button class="btn btn-primary" onclick="navigateToShop()"><i class="fas fa-shopping-cart"></i> Zum Shop</button>
                </div>
            `;
            return;
        }

        container.innerHTML = ebooks.map(ebook => renderLibraryItem(ebook, 'ebook')).join('');
    } catch (error) {
        console.error('Library error:', error);
        container.innerHTML = '<div class="empty-state"><h3>Fehler beim Laden</h3></div>';
    }
}

function renderLibraryItem(ebook, type) {
    const downloadFn = type === 'bundle' ? 'downloadBundleEbook' : 'downloadShopEbook';
    return `
        <div class="library-item">
            <div class="ebook-cover">
                <img src="${coverUrl(ebook.slug)}" alt="${escapeHtml(ebook.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="ebook-cover-fallback" style="display:none;"><i class="fas fa-${type === 'bundle' ? 'cube' : 'book'}"></i><span>${escapeHtml((ebook.title || '?').charAt(0).toUpperCase())}</span></div>
            </div>
            <h4>${escapeHtml(ebook.title)}</h4>
            <p>${escapeHtml(ebook.description || '')}</p>
            <button class="btn btn-secondary btn-small" onclick="${downloadFn}('${ebook.slug}')">
                <i class="fas fa-download"></i> Herunterladen
            </button>
        </div>
    `;
}

// ============ MODAL ============
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    hideModalError();
    toggleAuthForms('login');
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    hideModalError();
}

function toggleAuthForms(form) {
    const forms = {
        login: document.getElementById('loginForm'),
        register: document.getElementById('registerForm'),
        forgot: document.getElementById('forgotForm'),
        reset: document.getElementById('resetForm')
    };
    Object.entries(forms).forEach(([key, el]) => {
        if (el) el.style.display = key === form ? 'block' : 'none';
    });
    hideModalError();
}

function showModalError(msg, type = 'error') {
    const el = document.getElementById('modalError');
    if (!el) return;
    el.textContent = msg;
    el.className = 'modal-error ' + type;
    el.style.display = 'block';
}

function hideModalError() {
    const el = document.getElementById('modalError');
    if (el) el.style.display = 'none';
}

// ============ NOTIFICATION ============
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    if (type === 'error') {
        notification.style.background = '#ff6b6b';
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${escapeHtml(message)}`;
    } else if (type === 'info') {
        notification.style.background = '#3498db';
        notification.innerHTML = `<i class="fas fa-info-circle"></i> ${escapeHtml(message)}`;
    } else {
        notification.style.background = '#4ecdc4';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(message)}`;
    }
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3500);
}

// ============ UTILS ============
function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============ PASSWORT-HELFER ============
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
}

function evaluatePassword(pw) {
    return {
        length: pw.length >= 8,
        upper: /[A-Z]/.test(pw),
        lower: /[a-z]/.test(pw),
        number: /[0-9]/.test(pw),
        get valid() { return this.length && this.upper && this.lower && this.number; }
    };
}

function updatePasswordStrength(prefix = 'register') {
    const inputId = prefix === 'new' ? 'newPassword' : 'registerPassword';
    const strengthId = prefix === 'new' ? 'passwordStrengthNew' : 'passwordStrength';
    const labelId = prefix === 'new' ? 'strengthLabelNew' : 'strengthLabel';

    const input = document.getElementById(inputId);
    const strengthBox = document.getElementById(strengthId);
    const label = document.getElementById(labelId);
    const requirementsBox = document.getElementById('passwordRequirements');

    if (!input || !strengthBox) return;

    const pw = input.value;
    if (pw.length === 0) {
        strengthBox.style.display = 'none';
        if (prefix === 'register' && requirementsBox) requirementsBox.style.display = 'none';
        return;
    }

    strengthBox.style.display = 'block';
    if (prefix === 'register' && requirementsBox) requirementsBox.style.display = 'block';

    const check = evaluatePassword(pw);
    const score = [check.length, check.upper, check.lower, check.number].filter(Boolean).length;

    const bars = strengthBox.querySelectorAll('.bar');
    bars.forEach((bar, i) => {
        bar.className = 'bar';
        if (i < score) {
            if (score <= 1) bar.classList.add('weak');
            else if (score === 2) bar.classList.add('fair');
            else if (score === 3) bar.classList.add('good');
            else bar.classList.add('strong');
        }
    });

    const labels = ['', 'Schwach', 'Okay', 'Gut', 'Sehr stark'];
    const labelClass = ['', 'weak', 'fair', 'good', 'strong'][score] || '';
    label.textContent = labels[score] || 'Passwortstärke';
    label.className = 'strength-label ' + labelClass;

    if (prefix === 'register' && requirementsBox) {
        requirementsBox.querySelectorAll('.req').forEach(el => {
            const key = el.dataset.req;
            if (check[key]) {
                el.classList.add('met');
                el.querySelector('i').className = 'fas fa-check-circle';
            } else {
                el.classList.remove('met');
                el.querySelector('i').className = 'fas fa-circle';
            }
        });
    }
}

function setButtonLoading(btn, text) {
    if (!btn) return;
    btn.dataset.original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
}

function resetButton(btn, html) {
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = html;
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) showPage(page);
        });
    });

    document.getElementById('authBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentUser ? logout() : openAuthModal();
    });

    document.querySelector('.close')?.addEventListener('click', closeAuthModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('authModal')) closeAuthModal();
    });

    document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('registerPassword')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleRegister();
    });

    // Footer-Jahr
    const yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    checkAuth();
    loadShopConfig();

    if (document.getElementById('shopPage').classList.contains('active')) loadShop();
    if (document.getElementById('transformationPage').classList.contains('active')) loadBundle();
    if (document.getElementById('libraryPage').classList.contains('active')) loadLibrary();
});

// ============ GLOBALE FUNKTIONEN ============
window.showPage = showPage;
window.navigateToShop = navigateToShop;
window.navigateToTransformation = navigateToTransformation;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleForgotPassword = handleForgotPassword;
window.handleResetPassword = handleResetPassword;
window.showForgotPassword = showForgotPassword;
window.togglePassword = togglePassword;
window.updatePasswordStrength = updatePasswordStrength;
window.closeAuthModal = closeAuthModal;
window.toggleAuthForms = toggleAuthForms;
window.openAuthModal = openAuthModal;
window.downloadFreeEbook = downloadFreeEbook;
window.downloadShopEbook = downloadShopEbook;
window.downloadBundleEbook = downloadBundleEbook;
window.purchaseShopEbook = purchaseShopEbook;
window.purchaseBundle = purchaseBundle;
window.loadShop = loadShop;
window.loadBundle = loadBundle;
window.loadLibrary = loadLibrary;