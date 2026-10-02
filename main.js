// --- DATA ARCHITECTURE ---
const STORE_CONFIG = {
    whatsappNumber: "6285783211983",
    currency: "Rp"
};

const EDIT_PACKAGES = [
    { id: 'pkg-1', name: '1 FOTO', price: 3000, badge: '' },
    { id: 'pkg-2', name: '2 FOTO', price: 5000, badge: '' },
    { id: 'pkg-3', name: '3 FOTO', price: 7000, badge: '' },
    { id: 'pkg-4', name: '4 FOTO', price: 8500, badge: '' },
    { id: 'pkg-5', name: '5 FOTO', price: 10000, badge: 'HEMAT' },
];

const AI_PRODUCTS = [
    { 
        id: "ai-prompt-maker", 
        name: "Protokol Mesin Neural AI", 
        category: "MASTER PROMPT", 
        price: 45000, 
        image: "1000971207.jpg",
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

// --- ROUTING / VIEW LOGIC ---
function navigate(viewId, productId = null, productType = null) {
    window.scrollTo({ top: 0, behavior: 'instant' });

    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });

    setTimeout(() => {
        if (viewId === 'detail' && productId && productType) {
            renderDetail(productId, productType);
            document.getElementById('view-detail').classList.add('active');
        } else {
            document.getElementById(`view-${viewId}`).classList.add('active');
        }
        setTimeout(initReveal, 50);
    }, 50);
}

// Reveal Animation Logic
function initReveal() {
    const reveals = document.querySelectorAll('.view-section.active .reveal');
    const windowHeight = window.innerHeight;
    
    reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 20) {
            el.classList.add('active');
        }
    });
}
window.addEventListener('scroll', initReveal);

// --- RENDERING ENGINE ---
function renderEditPackages() {
    const container = document.getElementById('edit-package-container');
    container.innerHTML = '';

    EDIT_PACKAGES.forEach((pkg, index) => {
        const badgeHTML = pkg.badge ? `<div class="absolute -top-2 -right-2 bg-kvn-orange text-black border-2 border-black px-2 py-0.5 rounded text-[9px] font-black shadow-[2px_2px_0_#000] rotate-6 z-20 uppercase font-mono">${pkg.badge}</div>` : '';
        
        const isTop = index === EDIT_PACKAGES.length - 1;
        const borderClass = isTop ? 'border-kvn-orange border-2' : 'border-white/10 border';
        const shadowClass = isTop ? 'shadow-3d-orange' : 'shadow-3d-dark';
        const bgClass = isTop ? 'bg-kvn-surface' : 'bg-kvn-card';

        const card = `
            <div class="${bgClass} ${borderClass} rounded-2xl p-5 ${shadowClass} card-3d-hover flex flex-col relative h-full group reveal delay-[${(index % 5) * 50}ms]">
                ${badgeHTML}
                <div class="w-10 h-10 bg-black border border-white/20 rounded-lg flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition-transform">
                    <i class="ph-bold ph-image text-xl text-kvn-light"></i>
                </div>
                <h3 class="font-heading font-black text-2xl mb-1 text-white uppercase">${pkg.name}</h3>
                <div class="mt-auto pt-5">
                    <div class="mb-4">
                        <span class="font-mono font-black text-xl ${isTop ? 'text-kvn-orange' : 'text-[#FFD600]'}">${formatPrice(pkg.price)}</span>
                    </div>
                    <button onclick="navigate('detail', '${pkg.id}', 'edit')" class="w-full btn-tactile bg-white text-black border-2 border-black rounded-lg py-2.5 font-black text-xs uppercase shadow-[3px_3px_0_#000]">
                        PILIH
                    </button>
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

    activeProducts.forEach((prod, index) => {
        const imgSrc = prod.image ? prod.image : getFallbackImage('NO IMAGE');
        const badgeHTML = prod.badge ? `<div class="absolute top-3 right-3 bg-white text-black border-2 border-black px-2 py-0.5 rounded text-[9px] font-black shadow-[2px_2px_0_#000] z-20 uppercase font-mono">${prod.badge}</div>` : '';

        const card = `
            <div class="bg-kvn-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col card-3d-hover shadow-3d-dark group relative reveal delay-[${(index % 4) * 50}ms]">
                ${badgeHTML}
                <div class="h-64 bg-black border-b border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0"></div>
                    <img src="${imgSrc}" alt="${prod.name}" class="w-full h-full object-cover filter brightness-90 contrast-125 relative z-10 group-hover:scale-105 transition-transform duration-700" onerror="this.src='${getFallbackImage(prod.name)}'">
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between relative z-10">
                    <div class="absolute -top-6 left-5 w-12 h-12 bg-kvn-card border border-white/10 rounded-xl shadow-[3px_3px_0_#000] flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
                        <i class="ph-bold ${prod.iconSvg} text-2xl text-kvn-orange"></i>
                    </div>
                    <div class="mt-6">
                        <span class="font-mono text-[9px] font-bold text-kvn-orange uppercase tracking-wider block mb-1.5">${prod.category}</span>
                        <h3 class="font-heading font-black text-xl text-white mb-2 leading-tight uppercase">${prod.name}</h3>
                        <p class="text-[11px] text-gray-400 mb-4 line-clamp-2 leading-relaxed font-mono">${prod.description}</p>
                    </div>
                    <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <span class="font-mono font-black text-lg text-[#FFD600]">${formatPrice(prod.price)}</span>
                        <button onclick="navigate('detail', '${prod.id}', 'ai')" class="btn-tactile px-4 py-2 bg-white text-black rounded-lg font-black text-[10px] uppercase border-2 border-black shadow-[3px_3px_0_#000]">
                            VIEW
                        </button>
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
            <div class="w-full h-48 md:h-full min-h-[250px] border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-br from-kvn-surface to-black flex items-center justify-center p-6 relative overflow-hidden">
                <div class="w-24 h-24 bg-kvn-card border-2 border-white/10 rounded-2xl shadow-[6px_6px_0_#000] flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
                    <i class="ph-fill ph-camera text-[50px] text-kvn-orange"></i>
                </div>
            </div>
        `;
    } else if (type === 'ai') {
        product = AI_PRODUCTS.find(p => p.id === id);
        const imgSrc = product.image ? product.image : getFallbackImage('NO IMAGE');
        imageSection = `
            <div class="w-full h-64 md:h-full min-h-[350px] border-b md:border-b-0 md:border-r border-white/10 bg-black flex items-center justify-center relative overflow-hidden">
                <img src="${imgSrc}" alt="${product.name}" class="w-full h-full object-cover relative z-10" onerror="this.src='${getFallbackImage(product.name)}'">
            </div>
        `;
    }

    if (!product) return;

    let featuresHTML = '';
    if (type === 'edit') {
        featuresHTML = `
            <div class="mt-6 bg-black/40 border border-white/5 p-5 rounded-xl shadow-inner">
                <h4 class="font-mono font-bold text-[10px] text-kvn-orange mb-3 uppercase tracking-wider flex items-center gap-2"><i class="ph-bold ph-info text-base"></i> Cara Kerja</h4>
                <ol class="space-y-3 font-mono text-xs font-bold text-gray-300 list-decimal list-inside">
                    <li>Kirim <span class="text-white">foto referensi</span> yang mau dijadiin prompt.</li>
                    <li>Kirim <span class="text-white">wajah anda</span> yang benar ga burem atau kendala lainnya.</li>
                    <li>Proses pengerjaan.</li>
                </ol>
            </div>
        `;
    } else if (product.features && product.features.length > 0) {
        featuresHTML = `
            <div class="mt-6 bg-black/40 border border-white/5 p-4 rounded-xl shadow-inner">
                <h4 class="font-mono font-bold text-[10px] text-gray-500 mb-3 uppercase tracking-wider">Metode Generate Prompt</h4>
                <ul class="space-y-3 font-mono text-xs font-bold text-white">
                    ${product.features.map(f => `
                        <li class="flex items-start gap-2">
                            <i class="ph-bold ph-check text-kvn-orange mt-0.5"></i> <span class="leading-relaxed">${f}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    let catLabel = type === 'edit' ? 'JASA EDIT FOTO' : product.category;
    let descText = product.desc || product.description || `Paket edit premium untuk ${product.name}.`;

    container.innerHTML = `
        <div class="mb-4 reveal">
            <button onclick="navigate('${type}')" class="font-mono text-[10px] font-bold text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 bg-kvn-surface px-2.5 py-1 rounded border border-white/10 uppercase shadow-inner"><i class="ph-bold ph-arrow-left"></i> KEMBALI</button>
        </div>
        <div class="bg-kvn-card border-2 border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-3d-dark reveal">
            <div class="w-full md:w-5/12 relative">
                ${imageSection}
            </div>
            <div class="w-full md:w-7/12 p-6 md:p-8 flex flex-col">
                <div class="inline-flex items-center gap-1.5 bg-black/50 text-gray-300 px-2.5 py-1 rounded border border-white/5 text-[9px] font-bold font-mono mb-4 w-max uppercase tracking-wider shadow-inner">
                    <i class="ph-bold ph-tag text-kvn-orange"></i> ${catLabel}
                </div>
                <h2 class="font-heading font-black text-3xl md:text-4xl mb-3 leading-tight uppercase text-white">${product.name}</h2>
                <p class="text-gray-400 font-medium text-xs md:text-sm leading-relaxed font-mono">${descText}</p>
                ${featuresHTML}
                <div class="mt-8 pt-6 border-t border-white/5">
                    <div class="flex flex-col mb-6">
                        <span class="font-mono font-bold text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Total Pembayaran</span>
                        <div class="flex items-end gap-3">
                            <span class="font-heading font-black text-3xl text-[#FFD600] text-3d-dark">${formatPrice(product.price)}</span>
                        </div>
                    </div>
                    <button onclick="orderWhatsApp('${product.name}', ${product.price}, '${type}')" class="w-full btn-tactile bg-[#25D366] text-black border-2 border-black rounded-xl py-4 font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wide shadow-[4px_4px_0_#000]">
                        <i class="ph-bold ph-whatsapp-logo text-xl"></i> ORDER VIA WHATSAPP
                    </button>
                </div>
            </div>
        </div>
    `;
    setTimeout(initReveal, 50);
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
        <!-- Marquee -->
        <div class="w-full bg-kvn-orange text-black border-b-2 border-black py-1.5 overflow-hidden flex whitespace-nowrap z-50 relative shadow-[0_2px_0_#000]">
            <div class="marquee-content font-mono text-[10px] font-black tracking-widest uppercase">
                <span class="mx-4"><i class="ph-bold ph-lightning"></i> PREMIUM DIGITAL</span> <span class="mx-4">•</span> JASA EDIT FOTO<span class="mx-4">•</span> AI PROMPTS <span class="mx-4">•</span> DIRECT ORDER VIA WHATSAPP <span class="mx-4">
                <span class="mx-4"><i class="ph-bold ph-lightning"></i> PREMIUM DIGITAL BOUTIQUE</span> <span class="mx-4">•</span> JASA EDIT FOTO<span class="mx-4">•</span> AI PROMPTS <span class="mx-4">•</span> DIRECT ORDER VIA WHATSAPP <span class="mx-4">
            </div>
        </div>

        <!-- Sticky Navigation -->
        <nav class="sticky top-3 z-40 px-3 mb-4">
            <div class="max-w-6xl mx-auto bg-kvn-surface/95 backdrop-blur-md border border-white/10 rounded-xl shadow-3d-dark flex justify-between items-center p-2.5 md:px-4">
                <button onclick="navigate('home')" class="flex items-center gap-2.5 group text-left hover:opacity-90 transition-opacity focus:outline-none">
                    <div class="w-10 h-10 bg-kvn-orange border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0_#000] flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <i class="ph-fill ph-storefront text-2xl text-black"></i>
                    </div>
                    <div>
                        <h1 class="font-heading font-black text-xl leading-none text-white tracking-tight uppercase">KEVNAI <span class="text-kvn-orange">STORE</span></h1>
                        <p class="font-mono text-[8px] font-bold text-kvn-gray tracking-[0.2em] uppercase mt-0.5">Digital</p>
                    </div>
                </button>
                <div class="hidden md:flex items-center gap-1 font-mono font-bold text-[11px] uppercase tracking-wider bg-black/50 p-1 rounded-lg border border-white/5">
                    <button onclick="navigate('home')" class="px-3 py-1.5 rounded-md text-white hover:bg-white/10 hover:text-kvn-orange transition-colors">HOME</button>
                    <button onclick="navigate('edit')" class="px-3 py-1.5 rounded-md text-white hover:bg-white/10 hover:text-kvn-orange transition-colors">EDIT FOTO</button>
                    <button onclick="navigate('ai')" class="px-3 py-1.5 rounded-md text-white hover:bg-white/10 hover:text-kvn-orange transition-colors">AI TOOLS</button>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="contactWA()" class="flex btn-tactile items-center gap-1.5 bg-[#25D366] text-black border-2 border-black px-4 py-2 rounded-lg font-bold text-xs shadow-3d-btn uppercase tracking-wide">
                        <i class="ph-bold ph-whatsapp-logo text-base"></i> CHAT
                    </button>
                </div>
            </div>
        </nav>

        <main class="flex-grow max-w-6xl mx-auto w-full px-4 pb-20">
            <!-- HOME VIEW -->
            <section id="view-home" class="view-section active">
                <div class="flex flex-col items-center text-center justify-center py-12 lg:py-16 reveal">
                    <div class="max-w-3xl space-y-5 z-10 flex flex-col items-center">
                        <div class="inline-flex items-center gap-2 bg-kvn-surface border border-kvn-orange/30 text-kvn-orange px-3 py-1.5 rounded-full font-mono font-bold text-[9px] uppercase shadow-inner">
                            <span class="w-1.5 h-1.5 bg-kvn-orange rounded-full animate-pulse"></span> STORE AKTIF
                        </div>
                        <h2 class="font-heading font-black text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white uppercase">
                            KevnAI<span class="text-kvn-orange text-3d inline-block">Premium.</span><br>
                            Order <span class="text-white text-3d-light">Simple.</span>
                        </h2>
                        <p class="text-gray-400 font-medium text-sm md:text-base leading-relaxed border-l-2 border-kvn-orange pl-3 bg-kvn-card/50 py-2 pr-4 rounded-r-lg max-w-lg mx-auto text-left">
                            Butuh edit foto? Butuh tools AI? Pilih produknya, lihat detailnya, lalu langsung order via WhatsApp. Tanpa ribet cart & checkout.
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 reveal">
                    <button onclick="navigate('edit')" class="text-left bg-kvn-card border-2 border-black rounded-2xl p-6 shadow-3d-dark card-3d-hover group relative overflow-hidden focus:outline-none">
                        <div class="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                            <i class="ph-fill ph-camera text-[100px] text-white group-hover:scale-110 transition-transform duration-500"></i>
                        </div>
                        <div class="flex justify-between items-start mb-8 relative z-10">
                            <div class="w-12 h-12 bg-black border-2 border-kvn-orange rounded-xl shadow-[3px_3px_0_#FF6A00] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                                <i class="ph-bold ph-faders text-2xl text-kvn-orange"></i>
                            </div>
                            <span class="font-mono font-bold text-[10px] bg-black/50 border border-white/10 px-3 py-1.5 rounded-md text-gray-300 uppercase">Lihat Paket &rarr;</span>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-heading font-black text-2xl mb-2 text-white uppercase tracking-wide">JASA EDIT FOTO</h3>
                            <p class="text-gray-400 font-medium text-xs max-w-[80%] leading-relaxed"</p>
                        </div>
                    </button>
                    <button onclick="navigate('ai')" class="text-left bg-kvn-orange border-2 border-black rounded-2xl p-6 shadow-3d-orange card-3d-hover group relative overflow-hidden focus:outline-none">
                        <div class="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                            <i class="ph-fill ph-robot text-[100px] text-black group-hover:scale-110 transition-transform duration-500"></i>
                        </div>
                        <div class="flex justify-between items-start mb-8 relative z-10">
                            <div class="w-12 h-12 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#000] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                                <i class="ph-bold ph-magic-wand text-2xl text-black"></i>
                            </div>
                            <span class="font-mono font-bold text-[10px] bg-black/20 border border-black/20 px-3 py-1.5 rounded-md text-black uppercase">Lihat Tools &rarr;</span>
                        </div>
                        <div class="relative z-10 text-black">
                            <h3 class="font-heading font-black text-2xl mb-2 uppercase tracking-wide">AI TOOLS</h3>
                            <p class="text-black/80 font-bold text-xs max-w-[80%] leading-relaxed"></p>
                        </div>
                    </button>
                </div>
            </section>

            <!-- EDIT FOTO VIEW -->
            <section id="view-edit" class="view-section pt-2">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <button onclick="navigate('home')" class="font-mono text-[10px] font-bold text-gray-400 hover:text-white transition-colors mb-3 inline-flex items-center gap-1.5 bg-kvn-surface px-2.5 py-1 rounded border border-white/10 uppercase"><i class="ph-bold ph-arrow-left"></i> KEMBALI</button>
                        <h2 class="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white text-3d-light">EDIT FOTO</h2>
                    </div>
                    <p class="text-gray-400 font-medium text-xs border-l-2 border-kvn-orange pl-3 max-w-xs">
                        Pilih jumlah foto yang mau diedit. Semakin banyak, harga satuan makin murah.
                    </p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4" id="edit-package-container"></div>
            </section>

            <!-- AI TOOLS VIEW -->
            <section id="view-ai" class="view-section pt-2">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <button onclick="navigate('home')" class="font-mono text-[10px] font-bold text-gray-400 hover:text-white transition-colors mb-3 inline-flex items-center gap-1.5 bg-kvn-surface px-2.5 py-1 rounded border border-white/10 uppercase"><i class="ph-bold ph-arrow-left"></i> KEMBALI</button>
                        <h2 class="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-white text-3d">AI TOOLS</h2>
                    </div>
                    <p class="text-gray-400 font-medium text-xs border-l-2 border-kvn-orange pl-3 max-w-xs">
                        Produk digital untuk AI, prompt dan workflow kreativitas tingkat tinggi.
                    </p>
                </div>
                <div id="ai-empty-state" class="hidden w-full bg-kvn-surface border-2 border-dashed border-white/10 rounded-2xl p-10 text-center">
                    <div class="w-16 h-16 mx-auto bg-black border border-white/10 rounded-xl shadow-inner flex items-center justify-center mb-4">
                        <i class="ph-fill ph-package text-3xl text-gray-500"></i>
                    </div>
                    <h3 class="font-heading font-black text-xl mb-2 text-white uppercase tracking-wide">BELUM ADA PRODUK</h3>
                    <p class="font-mono text-gray-400 text-xs">Produk digital sedang disiapkan di workshop.</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" id="ai-product-container"></div>
            </section>

            <!-- PRODUCT DETAIL VIEW -->
            <section id="view-detail" class="view-section pt-2">
                 <div id="detail-container"></div>
            </section>
        </main>

        <footer class="bg-black border-t-2 border-kvn-orange pt-12 pb-6 px-4 mt-auto">
            <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div class="max-w-sm text-center md:text-left flex flex-col items-center md:items-start">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-10 h-10 bg-kvn-orange border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0_#000]">
                            <i class="ph-fill ph-storefront text-xl text-black"></i>
                        </div>
                        <h2 class="font-heading font-black text-2xl text-white tracking-tight uppercase">KEVNAI STORE</h2>
                    </div>
                    <p class="font-mono text-gray-500 text-xs leading-relaxed">
                        Premium Jasa edit foto & AI Tools.
                    </p>
                </div>
                <div class="bg-kvn-card border-2 border-kvn-orange rounded-xl p-5 shadow-3d-orange transform hover:-translate-y-1 transition-transform w-full md:w-auto md:min-w-[350px]">
                    <div class="inline-flex items-center gap-1.5 bg-kvn-orange text-black px-2.5 py-1 rounded text-[9px] font-black font-mono mb-3 uppercase shadow-[2px_2px_0_#000]">
                        <i class="ph-bold ph-shield-check"></i> KEAMANAN TRANSAKSI
                    </div>
                    <p class="font-heading font-black text-white uppercase text-xs mb-0.5 tracking-wider">OFFICIAL WHATSAPP</p>
                    <p class="font-mono font-black text-2xl text-[#FFD600] mb-2 text-3d-dark" id="footer-wa-number">+62 857-8321-1983</p>
                    <p class="text-[10px] text-gray-400 font-mono font-bold leading-tight bg-black/50 p-2 rounded border border-white/10">
                        ⚠️ Ini satu-satunya WhatsApp resmi KevnAI Store.
                    </p>
                </div>
            </div>
            <div class="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <p class="font-mono text-gray-600 text-[9px] uppercase font-bold tracking-widest">
                    &copy; <span id="current-year"></span> KEVNAI STORE. ALL RIGHTS RESERVED.
                </p>
                <p class="font-mono text-kvn-orange/80 text-[9px] uppercase font-bold tracking-widest">
                    NO CART. NO RIBET. DIRECT WHATSAPP.
                </p>
            </div>
        </footer>
    `;

    appRoot.innerHTML = appHTML;

    // Set year & Render Dynamic Content
    document.getElementById('current-year').textContent = new Date().getFullYear();
    renderEditPackages();
    renderAITools();
    
    // Start at home
    setTimeout(() => navigate('home'), 50);
}

// Run Initialization
document.addEventListener('DOMContentLoaded', initApp);
