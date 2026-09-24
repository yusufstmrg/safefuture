/* monte-carlo-simulator.js — Safe Future Monte Carlo Financial Simulator */
(function() {
    'use strict';

    /**
     * Run Monte Carlo simulation for retirement/investment projections.
     * @param {number} principal - Initial investment (Rp)
     * @param {number} monthly - Monthly contribution (Rp)
     * @param {number} years - Investment horizon (years)
     * @param {number} meanReturn - Expected annual return (e.g. 0.10 = 10%)
     * @param {number} stdDev - Annual return volatility (e.g. 0.12 = 12%)
     * @param {number} iterations - Number of simulations (default 1000)
     * @returns {object} Simulation results
     */
    window.sfMonteCarlo = function(principal, monthly, years, meanReturn, stdDev, iterations = 1000) {
        const results = [];
        const months = years * 12;
        const monthlyMean = meanReturn / 12;
        const monthlyStd = stdDev / Math.sqrt(12);

        for (let i = 0; i < iterations; i++) {
            let portfolio = principal;
            for (let m = 0; m < months; m++) {
                // Box-Muller transform for normal distribution
                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                const monthReturn = monthlyMean + monthlyStd * z;
                portfolio = portfolio * (1 + monthReturn) + monthly;
            }
            results.push(portfolio);
        }

        results.sort((a, b) => a - b);
        const p10 = results[Math.floor(iterations * 0.10)];
        const p25 = results[Math.floor(iterations * 0.25)];
        const p50 = results[Math.floor(iterations * 0.50)];
        const p75 = results[Math.floor(iterations * 0.75)];
        const p90 = results[Math.floor(iterations * 0.90)];
        const mean = results.reduce((a, b) => a + b, 0) / iterations;
        const probPositive = results.filter(r => r > principal + monthly * months).length / iterations;

        return { p10, p25, p50, p75, p90, mean, probPositive, results };
    };

    /**
     * Render Monte Carlo chart into a canvas element.
     */
    window.sfRenderMonteCarloChart = function(canvasId, simResult, years) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;
        const ctx = canvas.getContext('2d');
        const labels = Array.from({length: years + 1}, (_, i) => `Tahun ${i}`);
        
        if (canvas._sfChart) { canvas._sfChart.destroy(); }
        canvas._sfChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Optimistis (P90)', data: Array(years+1).fill(simResult.p90), borderColor: '#22c55e', fill: false, tension: 0.4 },
                    { label: 'Median (P50)', data: Array(years+1).fill(simResult.p50), borderColor: '#E9C766', fill: false, tension: 0.4, borderWidth: 2 },
                    { label: 'Konservatif (P10)', data: Array(years+1).fill(simResult.p10), borderColor: '#ef4444', fill: false, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Proyeksi Portofolio — Simulasi Monte Carlo' }
                },
                scales: {
                    y: {
                        ticks: { callback: v => 'Rp ' + Number(v).toLocaleString('id-ID') }
                    }
                }
            }
        });
    };

    // Auto-init any monte carlo widget on page
    document.addEventListener('DOMContentLoaded', function() {
        const widget = document.getElementById('sfMonteCarloWidget');
        if (!widget) return;
        // Widget will be triggered by user interaction, not auto-run
    });
})();
