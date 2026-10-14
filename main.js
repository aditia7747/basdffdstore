const STORE_CONFIG = {
    whatsappNumber: "6285783211983",
    currency: "Rp"
};

const EDIT_PACKAGES = [
    { id: 'pkg-1', name: '1 FOTO', price: 3000, badge: '' },
    { id: 'pkg-2', name: '2 FOTO', price: 5000, badge: '' },
    { id: 'pkg-3', name: '3 FOTO', price: 7000, badge: '' },
    { id: 'pkg-4', name: '4 FOTO', price: 10500, badge: '' },
    { id: 'pkg-5', name: '5 FOTO', price: 13000, badge: 'HEMAT' },
];

const AI_PRODUCTS = [
    { 
        id: "ai-prompt-maker", 
        name: "Protokol Mesin Prompt AI", 
        category: "MASTER PROMPT", 
        price: 55000, 
        image: "https://ganga--link--ghhzdp9sv8hk.code.run/i/ebt4uv85.jpg",
        iconSvg: "ph-terminal-window", 
        badge: "HOT", 
        description: "Tools otomatis generate prompt dari foto referensi tanpa limit kuota. Bebas pakai kapan saja.", 
        features: [
            "IDN v1 (Prompt bahasa Indonesia detail)", 
            "ZH v1.5 (Hasil prompt berbahasa Mandarin)", 
            "PRO v1.7 (Support kolase, 90° view, make up)"
        ], 
        active: true 
    }
];

// --- UTILS ---
const formatPrice = (num) => STORE_CONFIG.currency + " " + num.toLocaleString('id-ID');
const getFallbackImage = (text) => `https://placehold.co/600x800/171717/FF6A00?text=${encodeURIComponent(text)}&font=montserrat`;

// --- SMOOTH NAVIGATION ROUTER (NO JANK / NO SNAP) ---
let activeViewId = 'home';
let isNavigating = false;

function navigate(viewId, productId = null, productType = null) {
    if (isNavigating) return;

    const currentSection = document.querySelector('.view-section.view-visible');
    const targetSectionId = viewId === 'detail' ? 'view-detail' : `view-${viewId}`;
    const targetSection = document.getElementById(targetSectionId);

    if (!targetSection) return;
    if (currentSection === targetSection && viewId !== 'detail') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    isNavigating = true;
    activeViewId = viewId;
    updateActiveNav(viewId);

    // Pulse 3D background gently on navigation
    if (window.pulse3DScene) window.pulse3DScene();

    // Smooth exit animation for current view
    if (currentSection) {
        currentSection.classList.remove('view-active');
        currentSection.classList.add('view-exiting');
    }

    setTimeout(() => {
        if (currentSection) {
            currentSection.classList.remove('view-visible', 'view-exiting');
        }

        if (viewId === 'detail' && productId && productType) {
            renderDetail(productId, productType);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        targetSection.classList.add('view-visible');

        // Trigger reflow for butter-smooth entrance
        void targetSection.offsetWidth;
        targetSection.classList.add('view-active');

        triggerRevealInActiveView();
        bindSmooth3DCards();

        setTimeout(() => {
            isNavigating = false;
        }, 280);
    }, 190);
}

function updateActiveNav(viewId) {
    const highlighted = viewId === 'detail' ? '' : viewId;
    document.querySelectorAll('.nav-pill').forEach(btn => {
        if (btn.dataset.nav === highlighted) {
            btn.classList.add('active-nav');
        } else {
            btn.classList.remove('active-nav');
        }
    });
}

// --- STAGGERED REVEAL ANIMATION ---
function triggerRevealInActiveView() {
    const items = document.querySelectorAll('.view-section.view-visible .reveal-item');
    items.forEach((el, idx) => {
        el.classList.remove('is-revealed');
        setTimeout(() => {
            el.classList.add('is-revealed');
        }, 40 + idx * 65);
    });
}

// --- 60FPS INTERPOLATED (LERP) 3D CARD PHYSICS ---
function bindSmooth3DCards() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Keep touch devices native & fast

    const cards = document.querySelectorAll('.smooth-3d-card');
    cards.forEach(card => {
        if (card.dataset.bound3d) return;
        card.dataset.bound3d = 'true';

        let targetRX = 0, targetRY = 0, targetTY = 0;
        let currentRX = 0, currentRY = 0, currentTY = 0;
        let rafId = null;
        let isHovered = false;
        const maxTilt = parseFloat(card.dataset.maxTilt || '5');

        function updatePhysics() {
            currentRX += (targetRX - currentRX) * 0.14;
            currentRY += (targetRY - currentRY) * 0.14;
            currentTY += (targetTY - currentTY) * 0.14;

            card.style.setProperty('--rx', `${currentRX.toFixed(2)}deg`);
            card.style.setProperty('--ry', `${currentRY.toFixed(2)}deg`);
            card.style.setProperty('--ty', `${currentTY.toFixed(2)}px`);

            const stillMoving = 
                Math.abs(targetRX - currentRX) > 0.02 || 
                Math.abs(targetRY - currentRY) > 0.02 || 
                Math.abs(targetTY - currentTY) > 0.05;

            if (isHovered || stillMoving) {
                rafId = requestAnimationFrame(updatePhysics);
            } else {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--ty', '0px');
                rafId = null;
            }
        }

        card.addEventListener('mouseenter', () => {
            isHovered = true;
            targetTY = -5;
            card.style.setProperty('--g-opacity', '1');
            if (!rafId) rafId = requestAnimationFrame(updatePhysics);
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const pctX = (x / rect.width) - 0.5;
            const pctY = (y / rect.height) - 0.5;

            targetRX = -pctY * maxTilt * 2;
            targetRY = pctX * maxTilt * 2;

            card.style.setProperty('--gx', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--gy', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            targetRX = 0;
            targetRY = 0;
            targetTY = 0;
            card.style.setProperty('--g-opacity', '0');
            if (!rafId) rafId = requestAnimationFrame(updatePhysics);
        });
    });
}

// --- SMOOTH 3D THREE.JS AMBIENT SCENE ---
function initSmoothThreeJS() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const group = new THREE.Group();
    scene.add(group);

    // Sleek 3D Wireframe Octahedron Core
    const icoGeo = new THREE.IcosahedronGeometry(6.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0xFF6A00,
        wireframe: true,
        transparent: true,
        opacity: 0.11
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    group.add(icoMesh);

    // Subtle Outer Ring
    const ringGeo = new THREE.TorusGeometry(10.5, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xFFD600,
        transparent: true,
        opacity: 0.12
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    group.add(ringMesh);

    // Soft Floating Dust Particles
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 45;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xFF6A00,
        transparent: true,
        opacity: 0.35
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let spinBoost = 0;

    window.pulse3DScene = () => { spinBoost = 0.025; };

    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);

        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;
        spinBoost *= 0.94;

        const baseSpeed = 0.0018 + spinBoost;
        icoMesh.rotation.y += baseSpeed;
        icoMesh.rotation.x += baseSpeed * 0.5;
        ringMesh.rotation.z -= baseSpeed * 0.7;
        particles.rotation.y += 0.0005;

        group.rotation.y = mouseX * 0.25;
        group.rotation.x = mouseY * 0.25;

        renderer.render(scene, camera);
    }
    animate();
}

// --- RENDERING ENGINE (SPACIOUS & BREATHABLE) ---
function renderEditPackages() {
    const container = document.getElementById('edit-package-container');
    container.innerHTML = '';

    EDIT_PACKAGES.forEach((pkg, index) => {
        const badgeHTML = pkg.badge 
            ? `<div class=" bg-kvn-orange text-black border-2 border-black px-3 py-1 rounded-full text-[10px] font-black shadow-tactile uppercase font-mono tracking-wider flex items-center gap-1"><i class="ph-fill ph-sparkle"></i> ${pkg.badge}</div>` 
            : `<span class="font-mono text-[11px] font-bold text-gray-500 bg-black/50 border border-white/10 px-3 py-1 rounded-full uppercase">0${index + 1}</span>`;
        
        const isTop = index === EDIT_PACKAGES.length - 1;
        const borderClass = isTop ? 'border-kvn-orange border-2' : 'border-white/10 border hover:border-white/25';
        const shadowClass = isTop ? 'shadow-orange-3d' : 'shadow-soft-3d';
        const bgClass = isTop ? 'bg-gradient-to-br from-kvn-surface via-kvn-card to-[#22150B]' : 'bg-kvn-card/90 backdrop-blur-md';

        const card = `
            <div class="reveal-item h-full">
                <div class="smooth-3d-card ${bgClass} ${borderClass} ${shadowClass} rounded-3xl p-7 md:p-8 flex flex-col justify-between h-full group" data-max-tilt="4.5">
                    <div>
                        <div class="flex items-center justify-between gap-3 mb-7">
                            <div class="w-14 h-14 bg-black border-2 ${isTop ? 'border-kvn-orange text-kvn-orange' : 'border-white/15 text-kvn-light'} rounded-2xl flex items-center justify-center shadow-tactile group-hover:scale-105 transition-transform duration-300">
                                <i class="ph-bold ph-image text-2xl"></i>
                            </div>
                            ${badgeHTML}
                        </div>
                        <h3 class="font-heading font-black text-3xl md:text-4xl text-white uppercase tracking-tight mb-2">${pkg.name}</h3>
                    </div>

                    <div class="pt-7 mt-7 border-t border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                        <div>
                            <span class="block font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Harga Paket</span>
                            <span class="font-mono font-black text-2xl md:text-3xl ${isTop ? 'text-kvn-orange' : 'text-[#FFD600]'}">${formatPrice(pkg.price)}</span>
                        </div>
                        <button onclick="navigate('detail', '${pkg.id}', 'edit')" class="btn-smooth ${isTop ? 'bg-kvn-orange text-black' : 'bg-white text-black hover:bg-kvn-orange'} border-2 border-black rounded-2xl px-6 py-3.5 font-black text-xs uppercase shadow-tactile flex items-center justify-center gap-2 tracking-wider">
                            <span>PILIH</span>
                            <i class="ph-bold ph-arrow-right text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function renderAITools() {
    const container = document.getElementById('ai-product-container');
    const emptyState = document.getElementById('ai-empty-state');
    container.innerHTML = '';
    
    const activeProducts = AI_PRODUCTS.filter(p => p.active);

    if (activeProducts.length === 0) {
        emptyState.classList.remove('hidden');
        container.classList.add('hidden');
        return;
    }

    activeProducts.forEach((prod) => {
        const imgSrc = prod.image ? prod.image : getFallbackImage('NO IMAGE');
        const badgeHTML = prod.badge 
            ? `<div class="absolute top-4 right-4 bg-white text-black border-2 border-black px-3.5 py-1 rounded-full text-[11px] font-black shadow-tactile z-20 uppercase font-mono tracking-wider flex items-center gap-1.5"><i class="ph-fill ph-fire text-kvn-orange"></i> ${prod.badge}</div>` 
            : '';

        const card = `
            <div class="reveal-item">
                <div class="smooth-3d-card bg-kvn-surface/95 backdrop-blur-md border border-white/15 hover:border-kvn-orange/60 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-soft-3d group" data-max-tilt="3.5">
                    <div class="w-full md:w-5/12 h-72 md:h-auto min-h-[280px] bg-black relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                        ${badgeHTML}
                        <img src="${imgSrc}" alt="${prod.name}" class="w-full h-full object-cover filter brightness-95 contrast-110 group-hover:scale-105 transition-transform duration-700 ease-out" onerror="this.src='${getFallbackImage(prod.name)}'">
                    </div>
                    <div class="w-full md:w-7/12 p-7 sm:p-9 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-12 h-12 bg-kvn-card border-2 border-kvn-orange/50 rounded-2xl shadow-tactile flex items-center justify-center">
                                    <i class="ph-bold ${prod.iconSvg} text-2xl text-kvn-orange"></i>
                                </div>
                                <span class="font-mono text-xs font-bold text-kvn-orange uppercase tracking-widest bg-kvn-orange/10 border border-kvn-orange/30 px-3 py-1 rounded-full">${prod.category}</span>
                            </div>
                            <h3 class="font-heading font-black text-2xl sm:text-3xl text-white mb-3 leading-tight uppercase">${prod.name}</h3>
                            <p class="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed font-mono">${prod.description}</p>
                        </div>

                        <div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span class="block font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Harga Produk</span>
                                <span class="font-mono font-black text-2xl sm:text-3xl text-[#FFD600]">${formatPrice(prod.price)}</span>
                            </div>
                            <button onclick="navigate('detail', '${prod.id}', 'ai')" class="btn-smooth px-7 py-3.5 bg-white hover:bg-kvn-orange text-black rounded-2xl font-black text-xs uppercase border-2 border-black shadow-tactile flex items-center justify-center gap-2 tracking-wider">
                                <span>VIEW</span>
                                <i class="ph-bold ph-arrow-up-right text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}

function renderDetail(id, type) {
    const container = document.getElementById('detail-container');
    let product = null;
    let imageSection = '';
    
    if (type === 'edit') {
        product = EDIT_PACKAGES.find(p => p.id === id);
        imageSection = `
            <div class="w-full h-64 md:h-full min-h-[320px] border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-br from-kvn-surface via-black to-[#1F1209] flex items-center justify-center p-8 relative overflow-hidden">
                <div class="w-32 h-32 bg-kvn-card border-2 border-kvn-orange/60 rounded-3xl shadow-orange-3d flex items-center justify-center animate-float z-10">
                    <i class="ph-fill ph-camera text-[64px] text-kvn-orange"></i>
                </div>
            </div>
        `;
    } else if (type === 'ai') {
        product = AI_PRODUCTS.find(p => p.id === id);
        const imgSrc = product.image ? product.image : getFallbackImage('NO IMAGE');
        imageSection = `
            <div class="w-full h-80 md:h-full min-h-[400px] border-b md:border-b-0 md:border-r border-white/10 bg-black flex items-center justify-center relative overflow-hidden">
                <img src="${imgSrc}" alt="${product.name}" class="w-full h-full object-cover relative z-10" onerror="this.src='${getFallbackImage(product.name)}'">
            </div>
        `;
    }

    if (!product) return;

    let featuresHTML = '';
    if (type === 'edit') {
        featuresHTML = `
            <div class="mt-7 bg-black/50 border border-white/10 p-6 rounded-2xl">
                <h4 class="font-mono font-bold text-xs text-kvn-orange mb-4 uppercase tracking-wider flex items-center gap-2">
                    <i class="ph-bold ph-info text-lg"></i> Cara Kerja
                </h4>
                <ol class="space-y-3.5 font-mono text-xs sm:text-sm font-bold text-gray-300 list-decimal list-inside leading-relaxed">
                    <li>Kirim <span class="text-white">foto referensi</span> yang mau dijadiin prompt.</li>
                    <li>Kirim <span class="text-white">wajah anda</span> yang benar ga burem atau kendala lainnya.</li>
                    <li>Proses pengerjaan.</li>
                </ol>
            </div>
        `;
    } else if (product.features && product.features.length > 0) {
        featuresHTML = `
            <div class="mt-7 bg-black/50 border border-white/10 p-6 rounded-2xl">
                <h4 class="font-mono font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">Metode Generate Prompt</h4>
                <ul class="space-y-3.5 font-mono text-xs sm:text-sm font-bold text-white">
                    ${product.features.map(f => `
                        <li class="flex items-start gap-3">
                            <i class="ph-bold ph-check-circle text-kvn-orange text-lg mt-0.5 flex-shrink-0"></i>
                            <span class="leading-relaxed">${f}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    let catLabel = type === 'edit' ? 'JASA EDIT FOTO' : product.category;
    let descText = product.desc || product.description || `Paket edit premium untuk ${product.name}.`;

    container.innerHTML = `
        <div class="mb-6 reveal-item">
            <button onclick="navigate('${type}')" class="btn-smooth font-mono text-xs font-bold text-gray-200 hover:text-black hover:bg-kvn-orange inline-flex items-center gap-2 bg-kvn-surface px-4 py-2.5 rounded-xl border-2 border-black shadow-tactile uppercase">
                <i class="ph-bold ph-arrow-left text-sm"></i> KEMBALI
            </button>
        </div>
        <div class="reveal-item">
            <div class="smooth-3d-card bg-kvn-card/95 backdrop-blur-md border border-white/15 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-soft-3d" data-max-tilt="2.5">
                <div class="w-full md:w-5/12 relative">
                    ${imageSection}
                </div>
                <div class="w-full md:w-7/12 p-7 sm:p-10 lg:p-12 flex flex-col justify-between">
                    <div>
                        <div class="inline-flex items-center gap-2 bg-black/60 text-gray-200 px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] font-bold font-mono mb-5 uppercase tracking-wider">
                            <i class="ph-bold ph-tag text-kvn-orange"></i> ${catLabel}
                        </div>
                        <h2 class="font-heading font-black text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight uppercase text-white">${product.name}</h2>
                        <p class="text-gray-300 font-medium text-xs sm:text-sm leading-relaxed font-mono">${descText}</p>
                        ${featuresHTML}
                    </div>

                    <div class="mt-9 pt-7 border-t border-white/10">
                        <div class="flex flex-col mb-6">
                            <span class="font-mono font-bold text-[11px] text-gray-400 mb-1 uppercase tracking-wider">Total Pembayaran</span>
                            <div class="flex items-end gap-3">
                                <span class="font-heading font-black text-3xl sm:text-4xl text-[#FFD600] text-3d-dark">${formatPrice(product.price)}</span>
                            </div>
                        </div>
                        <button onclick="orderWhatsApp('${product.name}', ${product.price}, '${type}')" class="w-full btn-smooth bg-[#25D366] hover:bg-[#22c35e] text-black border-2 border-black rounded-2xl py-4 px-6 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 uppercase tracking-wide shadow-tactile-lg">
                            <i class="ph-bold ph-whatsapp-logo text-2xl"></i> ORDER VIA WHATSAPP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ORDER ACTION ---
function orderWhatsApp(productName, price, type) {
    const num = STORE_CONFIG.whatsappNumber;
    let msg = '';
    
    if (type === 'edit') {
        msg = `Halo KevnAI Store, aku mau order:\n\nProduk: Edit Foto\nPaket: ${productName}\nHarga: Rp${price.toLocaleString('id-ID')}\n\nBoleh info proses selanjutnya?`;
    } else {
        msg = `Halo KevnAI Store, aku mau order:\n\nProduk: ${productName}\nHarga: Rp${price.toLocaleString('id-ID')}\n\nBoleh info proses selanjutnya?`;
    }
    
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

function contactWA() {
    const msg = encodeURIComponent("Halo KevnAI Store, aku mau tanya-tanya dulu tentang layanannya.");
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${msg}`, '_blank');
}

// --- APP INITIALIZATION ---
function initApp() {
    const appRoot = document.getElementById('app-root');
    
    const appHTML = `
        <!-- Smooth 3D WebGL Background -->
        <canvas id="webgl-canvas"></canvas>

        <!-- Marquee -->
        <div class="marquee-wrapper w-full bg-kvn-orange text-black border-b-2 border-black py-2 overflow-hidden flex whitespace-nowrap z-50 relative shadow-[0_2px_0_#000]">
            <div class="marquee-content font-mono text-[11px] font-black tracking-widest uppercase">
                <span class="mx-5"><i class="ph-bold ph-lightning"></i> DIGITAL</span> <span class="mx-4">•</span> JASA EDIT FOTO <span class="mx-4">•</span> AI PROMPTS <span class="mx-4">•</span> DIRECT ORDER VIA WHATSAPP
                <span class="mx-5"><i class="ph-bold ph-lightning"></i> DIGITAL </span> <span class="mx-4">•</span> JASA EDIT FOTO <span class="mx-4">•</span> AI PROMPTS <span class="mx-4">•</span> DIRECT ORDER VIA WHATSAPP
            </div>
        </div>

        <!-- Sticky Navigation (Spacious & Responsive) -->
        <nav class="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 mb-6">
            <div class="max-w-7xl mx-auto bg-kvn-surface/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-soft-3d flex flex-wrap justify-between items-center gap-3 p-3 sm:px-5">
                <button onclick="navigate('home')" class="flex items-center gap-3 group text-left focus:outline-none">
                    <div class="w-11 h-11 bg-kvn-orange border-2 border-black rounded-xl shadow-tactile flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                        <i class="ph-fill ph-storefront text-2xl text-black"></i>
                    </div>
                    <div>
                        <h1 class="font-heading font-black text-xl sm:text-2xl leading-none text-white tracking-tight uppercase">KEVNAI <span class="text-kvn-orange">STORE</span></h1>
                        <p class="font-mono text-[9px] font-bold text-kvn-gray tracking-[0.22em] uppercase mt-1">Digital</p>
                    </div>
                </button>

                <!-- Navigation Pills (Visible on both Mobile & Desktop cleanly) -->
                <div class="order-3 md:order-2 w-full md:w-auto flex items-center justify-center gap-1.5 font-mono font-bold text-xs uppercase tracking-wider bg-black/60 p-1.5 rounded-xl border border-white/10">
                    <button data-nav="home" onclick="navigate('home')" class="nav-pill active-nav flex-1 md:flex-initial px-4 py-2 rounded-lg text-white hover:text-kvn-orange">HOME</button>
                    <button data-nav="edit" onclick="navigate('edit')" class="nav-pill flex-1 md:flex-initial px-4 py-2 rounded-lg text-white hover:text-kvn-orange">EDIT FOTO</button>
                    <button data-nav="ai" onclick="navigate('ai')" class="nav-pill flex-1 md:flex-initial px-4 py-2 rounded-lg text-white hover:text-kvn-orange">AI TOOLS</button>
                </div>

                <div class="order-2 md:order-3 flex items-center gap-2">
                    <button onclick="contactWA()" class="flex btn-smooth items-center gap-2 bg-[#25D366] text-black border-2 border-black px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs shadow-tactile uppercase tracking-wide">
                        <i class="ph-bold ph-whatsapp-logo text-lg"></i> CHAT
                    </button>
                </div>
            </div>
        </nav>

        <!-- Main Content Container (Expanded & Breathable) -->
        <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
            <!-- HOME VIEW -->
            <section id="view-home" class="view-section view-visible view-active">
                <div class="flex flex-col items-center text-center justify-center py-12 sm:py-16 lg:py-20 reveal-item">
                    <div class="max-w-3xl space-y-6 z-10 flex flex-col items-center">
                        <div class="animate-float inline-flex items-center gap-2.5 bg-kvn-surface border border-kvn-orange/40 text-kvn-orange px-4 py-1.5 rounded-full font-mono font-bold text-[10px] uppercase shadow-soft-3d">
                            <span class="w-2 h-2 bg-kvn-orange rounded-full animate-pulse"></span>
                        </div>
                        <h2 class="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.04] tracking-tight text-white uppercase">
                            KevnAI<span class="text-kvn-orange text-3d inline-block ml-2">Store.</span><br>
                            Order <span class="text-white text-3d-light">Simple.</span>
                        </h2>
                        <p class="text-gray-300 font-medium text-sm sm:text-base leading-relaxed border-l-4 border-kvn-orange pl-4 bg-kvn-card/80 backdrop-blur-md py-3.5 pr-6 rounded-r-2xl max-w-xl mx-auto text-left shadow-soft-3d">
                            Butuh edit foto? Butuh tools AI? Pilih produknya, lihat detailnya, lalu langsung order via WhatsApp. Tanpa ribet cart & checkout.
                        </p>
                    </div>
                </div>

                <!-- Spacious 2-Column Category Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-4">
                    <div class="reveal-item">
                        <button onclick="navigate('edit')" class="smooth-3d-card w-full h-full text-left bg-kvn-card/90 backdrop-blur-md border border-white/15 hover:border-kvn-orange rounded-3xl p-8 sm:p-10 shadow-soft-3d group relative overflow-hidden focus:outline-none" data-max-tilt="4">
                            <div class="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                                <i class="ph-fill ph-camera text-[150px] text-white group-hover:scale-110 transition-transform duration-500"></i>
                            </div>
                            <div class="flex justify-between items-start mb-10 relative z-10">
                                <div class="w-14 h-14 bg-black border-2 border-kvn-orange rounded-2xl shadow-[4px_4px_0_#FF6A00] flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
                                    <i class="ph-bold ph-faders text-3xl text-kvn-orange"></i>
                                </div>
                                <span class="font-mono font-bold text-xs bg-black/60 border border-white/15 group-hover:border-kvn-orange group-hover:text-kvn-orange px-4 py-2 rounded-xl text-gray-200 uppercase transition-colors">Lihat Paket &rarr;</span>
                            </div>
                            <div class="relative z-10">
                                <h3 class="font-heading font-black text-3xl sm:text-4xl mb-3 text-white uppercase tracking-wide">JASA EDIT FOTO</h3>
                                <p class="text-gray-400 font-medium text-xs sm:text-sm max-w-[85%] leading-relaxed">Pilih jumlah paket foto sesuai kebutuhanmu dengan proses cepat dan hasil rapi.</p>
                            </div>
                        </button>
                    </div>

                    <div class="reveal-item">
                        <button onclick="navigate('ai')" class="smooth-3d-card w-full h-full text-left bg-kvn-orange border-2 border-black rounded-3xl p-8 sm:p-10 shadow-orange-3d group relative overflow-hidden focus:outline-none" data-max-tilt="4">
                            <div class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                                <i class="ph-fill ph-robot text-[150px] text-black group-hover:scale-110 transition-transform duration-500"></i>
                            </div>
                            <div class="flex justify-between items-start mb-10 relative z-10">
                                <div class="w-14 h-14 bg-white border-2 border-black rounded-2xl shadow-tactile flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
                                    <i class="ph-bold ph-magic-wand text-3xl text-black"></i>
                                </div>
                                <span class="font-mono font-black text-xs bg-black text-white px-4 py-2 rounded-xl uppercase shadow-tactile">Lihat Tools &rarr;</span>
                            </div>
                            <div class="relative z-10 text-black">
                                <h3 class="font-heading font-black text-3xl sm:text-4xl mb-3 uppercase tracking-wide">AI TOOLS</h3>
                                <p class="text-black/80 font-bold text-xs sm:text-sm max-w-[85%] leading-relaxed">Produk digital untuk AI, prompt, dan workflow kreativitas tanpa batas kuota.</p>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            <!-- EDIT FOTO VIEW (Spacious 3-Column Layout) -->
            <section id="view-edit" class="view-section pt-4">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-10 reveal-item">
                    <div>
                        <button onclick="navigate('home')" class="btn-smooth font-mono text-xs font-bold text-gray-200 hover:text-black hover:bg-kvn-orange mb-4 inline-flex items-center gap-2 bg-kvn-surface px-4 py-2 rounded-xl border-2 border-black shadow-tactile uppercase">
                            <i class="ph-bold ph-arrow-left"></i> KEMBALI
                        </button>
                        <h2 class="font-heading font-black text-4xl sm:text-5xl uppercase tracking-tight text-white text-3d-light">EDIT FOTO</h2>
                    </div>
                    <p class="text-gray-300 font-medium text-xs sm:text-sm border-l-4 border-kvn-orange pl-4 max-w-sm leading-relaxed">
                        Pilih jumlah foto yang mau diedit. Semakin banyak, harga satuan makin murah.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" id="edit-package-container"></div>
            </section>

            <!-- AI TOOLS VIEW -->
            <section id="view-ai" class="view-section pt-4">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-10 reveal-item">
                    <div>
                        <button onclick="navigate('home')" class="btn-smooth font-mono text-xs font-bold text-gray-200 hover:text-black hover:bg-kvn-orange mb-4 inline-flex items-center gap-2 bg-kvn-surface px-4 py-2 rounded-xl border-2 border-black shadow-tactile uppercase">
                            <i class="ph-bold ph-arrow-left"></i> KEMBALI
                        </button>
                        <h2 class="font-heading font-black text-4xl sm:text-5xl uppercase tracking-tight text-white text-3d">AI TOOLS</h2>
                    </div>
                    <p class="text-gray-300 font-medium text-xs sm:text-sm border-l-4 border-kvn-orange pl-4 max-w-sm leading-relaxed">
                        Produk digital untuk AI, prompt dan workflow kreativitas tingkat tinggi.
                    </p>
                </div>
                <div id="ai-empty-state" class="hidden w-full bg-kvn-surface border-2 border-dashed border-white/10 rounded-3xl p-12 text-center">
                    <div class="w-16 h-16 mx-auto bg-black border border-white/10 rounded-2xl shadow-inner flex items-center justify-center mb-4">
                        <i class="ph-fill ph-package text-3xl text-gray-500"></i>
                    </div>
                    <h3 class="font-heading font-black text-xl mb-2 text-white uppercase tracking-wide">BELUM ADA PRODUK</h3>
                    <p class="font-mono text-gray-400 text-xs">Produk digital sedang disiapkan di workshop.</p>
                </div>
                <div class="grid grid-cols-1 gap-8" id="ai-product-container"></div>
            </section>

            <!-- PRODUCT DETAIL VIEW -->
            <section id="view-detail" class="view-section pt-4">
                <div id="detail-container"></div>
            </section>
        </main>

        <!-- Clean Spacious Footer -->
        <footer class="bg-black/90 backdrop-blur-md border-t-2 border-kvn-orange pt-14 pb-10 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div class="max-w-sm text-center md:text-left flex flex-col items-center md:items-start">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-11 h-11 bg-kvn-orange border-2 border-black rounded-xl flex items-center justify-center shadow-tactile">
                            <i class="ph-fill ph-storefront text-2xl text-black"></i>
                        </div>
                        <h2 class="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">KEVNAI STORE</h2>
                    </div>
                    <p class="font-mono text-gray-400 text-xs sm:text-sm leading-relaxed">
                        Premium Jasa edit foto & AI Tools.
                    </p>
                </div>

                <div class="smooth-3d-card bg-kvn-card border-2 border-kvn-orange rounded-2xl p-6 shadow-orange-3d w-full md:w-auto md:min-w-[360px]" data-max-tilt="3">
                    <div class="inline-flex items-center gap-1.5 bg-kvn-orange text-black px-3 py-1 rounded-full text-[10px] font-black font-mono mb-3 uppercase shadow-tactile">
                        <i class="ph-bold ph-shield-check"></i> KEAMANAN TRANSAKSI
                    </div>
                    <p class="font-heading font-black text-white uppercase text-xs mb-1 tracking-wider">OFFICIAL WHATSAPP</p>
                    <p class="font-mono font-black text-2xl sm:text-3xl text-[#FFD600] mb-3 text-3d-dark" id="footer-wa-number">+6285783211983</p>
                    <p class="text-[11px] text-gray-300 font-mono font-bold leading-relaxed bg-black/60 p-3 rounded-xl border border-white/10">
                        ⚠️ Ini satu-satunya WhatsApp resmi KevnAI Store.
                    </p>
                </div>
            </div>

            <div class="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <p class="font-mono text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                    &copy; <span id="current-year"></span> KEVNAI STORE. ALL RIGHTS RESERVED.
                </p>
                <p class="font-mono text-kvn-orange text-[10px] uppercase font-bold tracking-widest">
                    NO CART. NO RIBET. DIRECT WHATSAPP.
                </p>
            </div>
        </footer>
    `;

    appRoot.innerHTML = appHTML;

    document.getElementById('current-year').textContent = new Date().getFullYear();
    renderEditPackages();
    renderAITools();
    initSmoothThreeJS();
    
    triggerRevealInActiveView();
    bindSmooth3DCards();
}

document.addEventListener('DOMContentLoaded', initApp);