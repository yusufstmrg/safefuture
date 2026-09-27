/* client-portal.js — Safe Future Client Portal Module */
(function() {
    'use strict';

    // Client portal state
    const sfPortal = {
        isLoggedIn: false,
        clientData: null,
        currentView: 'overview'
    };

    window.sfClientPortal = sfPortal;

    /**
     * Initialize client portal
     */
    window.sfInitClientPortal = function() {
        const portalEl = document.getElementById('sfClientPortal');
        if (!portalEl) return;
        renderPortalView();
    };

    function renderPortalView() {
        const el = document.getElementById('sfClientPortal');
        if (!el) return;
        if (!sfPortal.isLoggedIn) {
            el.innerHTML = `
                <div class="sf-portal-login text-center py-12">
                    <div class="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-user-shield text-gold-shiny text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-navy mb-2">Client Portal</h3>
                    <p class="text-slate-500 mb-8">Akses laporan dan rencana keuangan Anda</p>
                    <button onclick="sfPortalLogin()" class="bg-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-navy-light transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>Masuk ke Portal
                    </button>
                </div>`;
        }
    }

    window.sfPortalLogin = function() {
        // Redirect to account login section
        const accountSection = document.getElementById('sfAccountOverlay') || document.getElementById('sfLoginModal');
        if (accountSection) {
            accountSection.classList.remove('hidden');
        } else {
            // Fallback: show WhatsApp contact
            const wa = 'https://wa.me/6285887836384?text=Halo%20Safe%20Future%2C%20saya%20ingin%20mengakses%20Client%20Portal%20saya.';
            window.open(wa, '_blank', 'noopener');
        }
    };

    window.sfPortalSetClient = function(clientData) {
        sfPortal.isLoggedIn = true;
        sfPortal.clientData = clientData;
        renderPortalDashboard(clientData);
    };

    function renderPortalDashboard(data) {
        const el = document.getElementById('sfClientPortal');
        if (!el) return;
        const name = (data && data.nama) ? data.nama : 'Klien';
        el.innerHTML = `
            <div class="sf-portal-dashboard">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-gold-shiny text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-navy text-lg">${name}</h3>
                        <p class="text-slate-500 text-sm">Client Safe Future</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-cream rounded-xl p-5 border border-gold/20">
                        <p class="text-xs text-slate-500 mb-1">Financial Health Score</p>
                        <p class="text-3xl font-bold text-navy">${(data && data.overallScore) || '—'}<span class="text-lg">/100</span></p>
                    </div>
                    <div class="bg-cream rounded-xl p-5 border border-gold/20">
                        <p class="text-xs text-slate-500 mb-1">Protection Gap</p>
                        <p class="text-xl font-bold text-red-500">${(data && data.protectionGap) ? 'Rp ' + Number(data.protectionGap).toLocaleString('id-ID') : '—'}</p>
                    </div>
                    <div class="bg-cream rounded-xl p-5 border border-gold/20">
                        <p class="text-xs text-slate-500 mb-1">Advisor</p>
                        <p class="text-sm font-semibold text-navy">Safe Future Team</p>
                        <a href="https://wa.me/6285887836384" target="_blank" class="text-xs text-gold-dark hover:underline mt-1 inline-block">Hubungi via WhatsApp</a>
                    </div>
                </div>
            </div>`;
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.sfInitClientPortal);
    } else {
        window.sfInitClientPortal();
    }
})();
