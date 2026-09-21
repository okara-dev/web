// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    name: 'Onur Kara',
    email: 'karaonur310@gmail.com',
    github: 'okara-dev',
    gumroad: 'https://karaonur.gumroad.com',
    cvUrl: 'src/assets/lebenslauf_OnurKara.pdf'
};

// ============================================================
// DARK/LIGHT MODE
// ============================================================

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
});

// ============================================================
// MOBILE MENU
// ============================================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu?.classList.remove('active'));
});

// ============================================================
// ACTIVE NAVIGATION ON SCROLL
// ============================================================

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================================
// TYPING EFFECT
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const roles = [
        'Software Developer',
        'CLI Tool Builder',
        'Bot Developer',
        'React Native Learner'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTextSpan = document.getElementById('typed-text');

    if (!typedTextSpan) return;

    function typeEffect() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
            return;
        }

        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typeEffect, 500);
            return;
        }

        setTimeout(typeEffect, isDeleting ? 100 : 150);
    }

    typeEffect();
});

// ============================================================
// PROJECTS
// ============================================================

const projects = {
    website: [
        {
            name: '🌐 ICS-Shop',
            stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'Supabase'],
            link: '',
            linkLabel: 'GitHub'
        },
        {
            name: '🌐 TrueYou',
            stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'PostgreSQL'],
            link: '',
            linkLabel: 'GitHub'
        },
        {
            name: '🌐 Kurio',
            stack: ['HTML', 'CSS', 'JavaScript'],
            link: 'https://okara-dev.github.io/web/micro/kurio',
            linkLabel: 'GitHub'
        },
        {
            name: '🌐 QRY',
            stack: ['HTML', 'CSS', 'JavaScript'],
            link: 'https://okara-dev.github.io/web/micro/qry',
            linkLabel: 'GitHub'
        },
        {
            name: '🌐 Pulse',
            stack: ['HTML', 'CSS', 'JavaScript', 'Docker', 'Nginx'],
            link: 'ttps://okara-dev.github.io/web/micro/pulse',
            linkLabel: 'GitHub'
        }
    ],
    cli: [
        {
            name: '🛠️ Code Analyzer CLI',
            stack: ['Node.js', 'ES Modules'],
            link: 'https://karaonur.gumroad.com/l/xtmtc',
            linkLabel: 'Gumroad'
        },
        {
            name: '🛠️ Dependency Analyzer CLI',
            stack: ['Node.js', 'npm API'],
            link: 'https://karaonur.gumroad.com',
            linkLabel: 'Gumroad'
        },
        {
            name: '🛠️ JSON Formatter CLI',
            stack: ['Node.js', 'ES Modules'],
            link: 'https://karaonur.gumroad.com',
            linkLabel: 'Gumroad'
        },
        {
            name: '🛠️ Folder Structure CLI',
            stack: ['Node.js', 'readline'],
            link: 'https://karaonur.gumroad.com',
            linkLabel: 'Gumroad'
        },
        {
            name: '🛠️ Vulnerability Scanner CLI',
            stack: ['Node.js', 'npm audit'],
            link: 'https://karaonur.gumroad.com',
            linkLabel: 'Gumroad'
        },
        {
            name: '🛠️ Doc Analyzer CLI',
            stack: ['Node.js', 'Groq API'],
            link: 'https://karaonur.gumroad.com',
            linkLabel: 'Gumroad'
        }
    ],
    other: [
        {
            name: '🧰 A-Z Shell Toolbox',
            stack: ['PowerShell', 'Windows'],
            link: 'https://github.com/okara-dev/programme',
            linkLabel: 'GitHub'
        },
        {
            name: '🐱 Desktop Cat',
            stack: ['Python', 'PyQt5'],
            link: 'https://github.com/okara-dev/programme',
            linkLabel: 'GitHub'
        },
        {
            name: '🤖 Daily Compass Bot',
            stack: ['Python', 'RSS', 'SMTP'],
            link: 'https://github.com/okara-dev/programme',
            linkLabel: 'GitHub'
        }
    ]
};

function renderProjectTable(tbodyId, list) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="empty-row">Coming soon…</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(p => `
        <tr>
            <td><span class="project-name">${p.name}</span></td>
            <td>
                <div class="project-stack">
                    ${p.stack.map(s => `<span class="stack-item">${s}</span>`).join('')}
                </div>
            </td>
            <td>
                ${p.link
                    ? `<a href="${p.link}" target="_blank" rel="noopener" class="project-link">
                           <i class="fas fa-external-link-alt"></i> ${p.linkLabel || 'View'}
                       </a>`
                    : `<span class="project-link disabled">Coming soon</span>`
                }
            </td>
        </tr>
    `).join('');
}

// Render all tables
renderProjectTable('projects-websites', projects.website);
renderProjectTable('projects-cli', projects.cli);
renderProjectTable('projects-other', projects.other);

// ============================================================
// SKILLS
// ============================================================

const skills = [
    { name: 'Python', icon: 'fab fa-python', level: 'Advanced' },
    { name: 'JavaScript', icon: 'fab fa-js', level: 'Advanced' },
    { name: 'Node.js', icon: 'fab fa-node-js', level: 'Advanced' },
    { name: 'HTML/CSS', icon: 'fab fa-html5', level: 'Advanced' },
    { name: 'React Native', icon: 'fab fa-react', level: 'Intermediate' },
    { name: 'Git', icon: 'fab fa-git-alt', level: 'Intermediate' },
    { name: 'Docker', icon: 'fab fa-docker', level: 'Intermediate' },
    { name: 'REST APIs', icon: 'fas fa-plug', level: 'Advanced' },
    { name: 'Shell Commands', icon: 'fas fa-terminal', level: 'Very familiar' }
];

const skillsGrid = document.getElementById('skills-grid');
if (skillsGrid) {
    skillsGrid.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <i class="${skill.icon}"></i>
            <h4>${skill.name}</h4>
            <div class="skill-level">${skill.level}</div>
        </div>
    `).join('');
}

// ============================================================
// SMOOTH SCROLL
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================================
// PROFILE DATA
// ============================================================

function applyProfileData() {
    const gumroadCard = document.querySelector('.link-card[href*="gumroad"]');
    if (gumroadCard) {
        gumroadCard.href = CONFIG.gumroad;
        const p = gumroadCard.querySelector('p');
        if (p) {
            const name = CONFIG.gumroad.replace(/\/$/, '').split('/').pop();
            p.textContent = `gumroad.com/${name}`;
        }
    }

    const socialLinks = document.querySelector('.social-links');
    if (socialLinks) {
        const gu = socialLinks.querySelector('a[aria-label="Gumroad"]');
        if (gu) gu.href = CONFIG.gumroad;
    }

    const cvBtn = document.querySelector('.btn-secondary[download]');
    if (cvBtn) cvBtn.href = CONFIG.cvUrl;
}

document.addEventListener('DOMContentLoaded', () => {
    applyProfileData();
});

console.log('Portfolio ready!');