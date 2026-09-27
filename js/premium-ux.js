/* premium-ux.js — Safe Future Premium UX Enhancements */
(function() {
    'use strict';

    // ─── Smooth scroll for anchor links ───
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href').slice(1);
                if (!targetId) return;
                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ─── Scroll-triggered reveal animations ───
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('sf-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.sf-reveal, [data-sf-reveal]').forEach(el => {
            observer.observe(el);
        });
    }

    // ─── Number counter animation ───
    window.sfAnimateCounter = function(el, target, duration = 1500) {
        if (!el) return;
        const start = parseInt(el.textContent) || 0;
        const range = target - start;
        const increment = range / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current).toLocaleString('id-ID');
        }, 16);
    };

    // ─── Tooltip system ───
    window.sfShowTooltip = function(el, text) {
        let tip = document.getElementById('sfTooltip');
        if (!tip) {
            tip = document.createElement('div');
            tip.id = 'sfTooltip';
            tip.style.cssText = 'position:fixed;z-index:99999;background:#08111F;color:#E9C766;padding:6px 12px;border-radius:8px;font-size:12px;pointer-events:none;transition:opacity .2s;max-width:250px;box-shadow:0 4px 20px rgba(0,0,0,.3)';
            document.body.appendChild(tip);
        }
        const rect = el.getBoundingClientRect();
        tip.textContent = text;
        tip.style.opacity = '1';
        tip.style.left = (rect.left + rect.width/2 - tip.offsetWidth/2) + 'px';
        tip.style.top = (rect.top - tip.offsetHeight - 8) + 'px';
    };
    window.sfHideTooltip = function() {
        const tip = document.getElementById('sfTooltip');
        if (tip) tip.style.opacity = '0';
    };

    // ─── Copy to clipboard ───
    window.sfCopyToClipboard = function(text, feedbackEl) {
        navigator.clipboard.writeText(text).then(() => {
            if (feedbackEl) {
                const orig = feedbackEl.innerHTML;
                feedbackEl.innerHTML = '<i class="fas fa-check mr-1"></i>Disalin!';
                feedbackEl.classList.add('text-green-500');
                setTimeout(() => {
                    feedbackEl.innerHTML = orig;
                    feedbackEl.classList.remove('text-green-500');
                }, 2000);
            }
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.focus(); ta.select();
            document.execCommand('copy');
            ta.remove();
        });
    };

    // ─── Toast notification system ───
    window.sfToast = function(message, type = 'info', duration = 3500) {
        let container = document.getElementById('sfToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sfToastContainer';
            container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99998;display:flex;flex-direction:column;gap:8px;pointer-events:none';
            document.body.appendChild(container);
        }
        const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.style.cssText = `background:#08111F;color:#fff;padding:12px 20px;border-radius:12px;display:flex;align-items:center;gap:10px;border-left:4px solid ${colors[type]||colors.info};box-shadow:0 8px 30px rgba(0,0,0,.4);pointer-events:auto;max-width:340px;font-size:14px;transition:opacity .3s,transform .3s;opacity:0;transform:translateX(20px)`;
        toast.innerHTML = `<i class="fas ${icons[type]||icons.info}" style="color:${colors[type]||colors.info}"></i><span>${message}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; });
        setTimeout(() => {
            toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // ─── Loading state for buttons ───
    window.sfButtonLoading = function(btn, loading, loadingText = 'Memproses...') {
        if (!btn) return;
        if (loading) {
            btn._origHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
        } else {
            btn.disabled = false;
            btn.innerHTML = btn._origHTML || btn.innerHTML;
        }
    };

    // ─── Init ───
    function init() {
        initSmoothScroll();
        initScrollReveal();

        // Animate stat counters on viewport entry
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-sf-counter'));
                    if (!isNaN(target)) {
                        sfAnimateCounter(entry.target, target);
                        counterObserver.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('[data-sf-counter]').forEach(el => counterObserver.observe(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
