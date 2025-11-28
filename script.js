// --- DOM Element Selection ---
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const pages = document.querySelectorAll('.app-page');
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
const reportTriggers = document.querySelectorAll('.report-trigger');
const reportModal = document.getElementById('report-modal');
const closeReportModalBtn = document.querySelector('.close-modal-btn');
const homeItemGrid = document.getElementById('home-item-grid');
const browseItemGrid = document.getElementById('browse-item-grid');
const detailOverlay = document.getElementById('detail-overlay');
const closeDetailBtn = document.querySelector('.close-detail-btn');
const searchInput = document.querySelector('.search-bar');
const filterChips = document.querySelectorAll('.filter-chip');
const sortSelect = document.querySelector('.sort-select');
const desktopNav = document.querySelector('.desktop-nav');
const handleImgError = (img, id) => {
    if (!img.dataset.retry) {
        img.dataset.retry = '1';
        img.src = `https://picsum.photos/seed/${id}/600/400`;
        return;
    }
    img.src = 'https://placehold.co/600x400?text=Image+Unavailable';
};


// --- 1. THEME TOGGLE FUNCTIONALITY ---
const toggleTheme = () => {
    const isDarkMode = body.classList.toggle('dark-mode');
    themeToggle.textContent = isDarkMode ? '🌙' : '☀️';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
};

const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    }
};

themeToggle.addEventListener('click', toggleTheme);
initializeTheme();

const placeThemeToggle = () => {
    if (window.innerWidth >= 768 && desktopNav) {
        desktopNav.appendChild(themeToggle);
        themeToggle.classList.remove('fixed');
    } else {
        document.body.appendChild(themeToggle);
        themeToggle.classList.add('fixed');
    }
};
placeThemeToggle();
window.addEventListener('resize', placeThemeToggle);


// --- 2. PAGE NAVIGATION SIMULATION ---
const switchPage = (pageId) => {
    // 1. Hide all pages
    pages.forEach(page => page.classList.add('hidden'));

    // 2. Show the target page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // 3. Update active nav links (Desktop & Mobile)
    navLinks.forEach(link => link.classList.remove('active'));
    mobileNavItems.forEach(link => link.classList.remove('active'));

    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => {
        link.classList.add('active');
    });
};

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const pageId = e.currentTarget.dataset.page;
        switchPage(pageId);
    });
});

mobileNavItems.forEach(link => {
    link.addEventListener('click', (e) => {
        const pageId = e.currentTarget.dataset.page;
        switchPage(pageId);
    });
});

// --- 3. MODAL AND OVERLAY LOGIC ---

// Function to open Report Modal
const openReportModal = () => {
    reportModal.classList.remove('hidden');
    // For smooth animation effect: remove display:none first, then remove opacity/transform class
    setTimeout(() => reportModal.style.opacity = '1', 10); 
};

// Function to close Report Modal
const closeReportModal = () => {
    // For smooth animation effect: set opacity/transform first, then add display:none
    reportModal.style.opacity = '0';
    setTimeout(() => reportModal.classList.add('hidden'), 300);
};

// Open Modal Triggers
reportTriggers.forEach(btn => {
    btn.addEventListener('click', openReportModal);
});

// Close Modal Buttons
closeReportModalBtn.addEventListener('click', closeReportModal);
reportModal.addEventListener('click', (e) => {
    if (e.target === reportModal) {
        closeReportModal(); // Close if clicking outside the content
    }
});

// Open Item Detail Overlay (simulated)
const openDetailOverlay = (item) => {
    const titleEl = detailOverlay.querySelector('.glass-panel h3');
    const metaEl = detailOverlay.querySelector('.detail-meta');
    const imgEl = detailOverlay.querySelector('.detail-image');
    const descEl = detailOverlay.querySelector('.detail-desc');
    if (item) {
        titleEl.textContent = item.title;
        metaEl.textContent = `${item.type === 'lost' ? 'Lost' : 'Found'} at ${item.location} - ${item.date}`;
        imgEl.src = item.image;
        imgEl.alt = item.title;
        descEl.textContent = descEl.textContent || '';
    }
    detailOverlay.classList.remove('hidden');
    setTimeout(() => detailOverlay.style.opacity = '1', 10);
};

// Close Item Detail Overlay
const closeDetailOverlay = () => {
    detailOverlay.style.opacity = '0';
    setTimeout(() => detailOverlay.classList.add('hidden'), 300);
};
closeDetailBtn.addEventListener('click', closeDetailOverlay);


// --- 4. DYNAMIC ITEM RENDERING ---
const createItemCardHTML = (item) => {
    const isLost = item.type === 'lost';
    const badgeClass = isLost ? 'lost' : 'found';
    const badgeText = isLost ? 'LOST' : 'FOUND';

    // The data-id is crucial for identifying which card was clicked
    return `
        <div class="item-card" data-id="${item.id}">
            <div class="item-card-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="handleImgError(this, '${item.id}')">
                
                <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="item-card-content">
                <h3>${item.title}</h3>
                <p>
                    <svg class="icon"><use xlink:href="#map-pin"/></svg>
                    ${item.location} - ${item.date}
                </p>
            </div>
        </div>
    `;
};

let currentCategory = 'All';
let currentSearch = '';
let currentSort = 'recent';

const getDateWeight = (str) => {
    if (!str) return Number.MAX_SAFE_INTEGER;
    const m = str.match(/(\d+)\s+(hour|hours|day|days)\s+ago/i);
    if (!m) return Number.MAX_SAFE_INTEGER;
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    if (unit.startsWith('hour')) return n;
    if (unit.startsWith('day')) return n * 24;
    return Number.MAX_SAFE_INTEGER;
};

const sortItems = (items) => {
    if (currentSort === 'az') {
        return [...items].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (currentSort === 'type') {
        return [...items].sort((a, b) => (a.type === b.type ? a.title.localeCompare(b.title) : a.type === 'lost' ? -1 : 1));
    }
    return [...items].sort((a, b) => getDateWeight(a.date) - getDateWeight(b.date));
};

const applyFilters = () => {
    let items = mockItems;
    if (currentCategory && currentCategory !== 'All') {
        items = items.filter(i => i.category === currentCategory);
    }
    if (currentSearch) {
        const q = currentSearch.toLowerCase();
        items = items.filter(i => (i.title + ' ' + i.location + ' ' + i.category).toLowerCase().includes(q));
    }
    return sortItems(items);
};

const bindCardClicks = (items) => {
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => {
            const itemId = card.dataset.id;
            const item = items.find(i => i.id === itemId);
            openDetailOverlay(item);
        });
    });
};

const renderHome = () => {
    const sorted = sortItems(mockItems);
    homeItemGrid.innerHTML = sorted.slice(0, 3).map(createItemCardHTML).join('');
};

const renderBrowse = () => {
    const items = applyFilters();
    browseItemGrid.innerHTML = items.map(createItemCardHTML).join('');
    bindCardClicks(items);
};

const renderItems = () => {
    renderHome();
    renderBrowse();
};

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        renderBrowse();
    });
}

if (filterChips.length) {
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.textContent.trim();
            renderBrowse();
        });
    });
}

if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderHome();
        renderBrowse();
    });
}

document.addEventListener('DOMContentLoaded', renderItems);
