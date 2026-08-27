""/* Safe Future — Final Platform Compatibility & UX Layer
 * 2026-08-27
 * Purpose:
 *  - Normalize FHC/WPR history from both flat RPC and nested PostgREST shapes.
 *  - Prefer owner-scoped direct reads, fallback to secure RPC.
 *  - Render persistent assessment history in both Phase 3 and Phase 4 workspaces.
 *  - Make Reports & Documents actionable even when storage_path is not present:
 *    view the source result and generate/download a PDF locally.
 *  - Avoid duplicate WPR submissions.
 */
(function () {
  'use strict';

  const c = () => window.supabaseClient;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
  const fmtDate = (v) => v ? new Date(v).toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'}) : '—';
  const money = (v) => v == null || v === '' ? '—' : 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  const state = {
    fhc: [],
    wpr: [],
    reports: [],
    loadedAt: null,
    lastUserId: null
  };

  async function currentUser() {
    try {
      return (await c()?.auth?.getUser())?.data?.user || null;
    } catch { return null; }
  }

  function normalizeFhc(rows) {
    return (Array.isArray(rows) ? rows : []).map((r) => {
      const nested = Array.isArray(r?.fhc_scores)
        ? (r.fhc_scores[0] || {})
        : (r?.fhc_scores || {});
      return {
        ...r,
        overall_score: r?.overall_score ?? nested?.overall_score ?? null,
        cashflow_score: r?.cashflow_score ?? nested?.cashflow_score ?? null,
        debt_score: r?.debt_score ?? nested?.debt_score ?? null,
        emergency_score: r?.emergency_score ?? nested?.emergency_score ?? null,
        protection_score: r?.protection_score ?? nested?.protection_score ?? null,
        retirement_score: r?.retirement_score ?? nested?.retirement_score ?? null,
        asset_score: r?.asset_score ?? nested?.asset_score ?? null,
        goals_score: r?.goals_score ?? nested?.goals_score ?? null,
        priority_1: r?.priority_1 ?? nested?.priority_1 ?? null,
        priority_2: r?.priority_2 ?? nested?.priority_2 ?? null,
        priority_3: r?.priority_3 ?? nested?.priority_3 ?? null
      };
    }).filter((r) => r?.id);
  }

  function normalizeWpr(rows) {
    return (Array.isArray(rows) ? rows : []).map((r) => {
      const nested = Array.isArray(r?.wpr_results)
        ? (r.wpr_results[0] || {})
        : (r?.wpr_results || {});
      return {
        ...r,
        wpr_results: nested && Object.keys(nested).length ? [nested] : (Array.isArray(r?.wpr_results) ? r.wpr_results : []),
        overall_score: r?.overall_score ?? nested?.overall_score ?? null
      };
    }).filter((r) => r?.id);
  }

  async function directOwnerReads(client, u) {
    const [fhcQ, wprQ, reportQ] = await Promise.all([
      client.from('fhc_submissions')
        .select('id,status,version,submitted_at,created_at,fhc_scores(overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at)')
        .eq('user_id', u.id)
        .order('created_at', {ascending:false})
        .limit(20),
      client.from('wpr_submissions')
        .select('id,fhc_id,status,version,submitted_at,completed_at,created_at,wpr_results(id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json)')
        .eq('user_id', u.id)
        .order('created_at', {ascending:false})
        .limit(20),
      client.from('reports')
        .select('id,report_type,source_id,version,status,storage_path,generated_at,created_at')
        .eq('user_id', u.id)
        .order('created_at', {ascending:false})
        .limit(30)
    ]);

    return {
      fhc: fhcQ.error ? [] : normalizeFhc(fhcQ.data),
      wpr: wprQ.error ? [] : normalizeWpr(wprQ.data),
      reports: reportQ.error ? [] : (reportQ.data || [])
    };
  }

  async function loadData() {
    const client = c();
    const u = await currentUser();
    if (!client || !u) return false;

    let data = await directOwnerReads(client, u);

    // Secure RPC fallback; also helps when a project's RLS blocks direct nested reads.
    if (!data.fhc.length || !data.wpr.length || !data.reports.length) {
      try {
        const rpc = await client.rpc('get_my_assessment_history');
        if (!rpc.error && rpc.data) {
          const fhcRpc = normalizeFhc(rpc.data.fhc);
          const wprRpc = normalizeWpr(rpc.data.wpr);
          if (!data.fhc.length && fhcRpc.length) data.fhc = fhcRpc;
          if (!data.wpr.length && wprRpc.length) data.wpr = wprRpc;
          if (!data.reports.length && Array.isArray(rpc.data.reports) && rpc.data.reports.length) {
            data.reports = rpc.data.reports;
          }
        }
      } catch (e) {
        console.warn('Final history RPC fallback:', e);
      }
    }

    state.fhc = normalizeFhc(data.fhc);
    state.wpr = normalizeWpr(data.wpr);
    state.reports = Array.isArray(data.reports) ? data.reports : [];
    state.loadedAt = new Date();
    state.lastUserId = u.id;

    renderAll();
    return true;
  }

  function uniqueBy(rows, keyFn) {
    const seen = new Set();
    return rows.filter((r) => {
      const k = keyFn(r);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function assessmentRow(type, r, i) {
    const score = Number.isFinite(Number(r?.overall_score)) ? Math.round(Number(r.overall_score)) : null;
    const when = type === 'FHC'
      ? (r?.submitted_at || r?.created_at)
      : (r?.completed_at || r?.submitted_at || r?.created_at);
    return '<div class="sf-final-history-row">' +
      '<div><b>' + type + ' ' + (i === 0 ? 'Terbaru' : 'Riwayat') + '</b>' +
      '<small>' + fmtDate(when) + ' · ' + esc(r?.status || 'completed') + '</small></div>' +
      '<div class="sf-final-history-actions">' +
      '<strong>' + (score == null ? '—' : score + ' / 100') + '</strong>' +
      '<button type="button" data-final-view="' + type + '" data-final-id="' + esc(r.id) + '">Lihat hasil</button>' +
      '</div></div>';
  }

  function renderHistory() {
    const fhc = uniqueBy(state.fhc, r => String(r.id));
    const wpr = uniqueBy(state.wpr, r => String(r.id));

    ['sfP3FhcHistory','sf4FhcHistory'].forEach((id) => {
      const el = $(id);
      if (el) {
        el.innerHTML = fhc.length
          ? fhc.map((r,i) => assessmentRow('FHC',r,i)).join('')
          : '<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>';
      }
    });

    ['sfP3WprHistory','sf4WprHistory'].forEach((id) => {
      const el = $(id);
      if (el) {
        el.innerHTML = wpr.length
          ? wpr.map((r,i) => assessmentRow('WPR',r,i)).join('')
          : '<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>';
      }
    });
  }

  function sourceForReport(report) {
    if (!report) return null;
    if (String(report.report_type).toUpperCase() === 'FHC') {
      return state.fhc.find(x => String(x.id) === String(report.source_id)) || state.fhc[0] || null;
    }
    if (String(report.report_type).toUpperCase() === 'WPR') {
      return state.wpr.find(x => String(x.id) === String(report.source_id)) || state.wpr[0] || null;
    }
    return null;
  }

  function buildSyntheticReports() {
    const existing = [...state.reports];
    const has = new Set(existing.map(r => String(r.report_type).toUpperCase() + '|' + String(r.source_id)));
    state.fhc.forEach((x) => {
      const k = 'FHC|' + x.id;
      if (!has.has(k)) {
        existing.push({
          id: 'assessment-fhc-' + x.id,
          report_type: 'FHC',
          source_id: x.id,
          status: 'ready',
          generated_at: x.created_at || x.submitted_at
        });
      }
    });
    state.wpr.forEach((x) => {
      const k = 'WPR|' + x.id;
      if (!has.has(k)) {
        existing.push({
          id: 'assessment-wpr-' + x.id,
          report_type: 'WPR',
          source_id: x.id,
          status: 'ready',
          generated_at: x.completed_at || x.submitted_at || x.created_at
        });
      }
    });
    return existing.sort((a,b) => new Date(b.generated_at || b.created_at || 0) - new Date(a.generated_at || a.created_at || 0));
  }

  function reportSummary(type, src) {
    if (type === 'FHC') {
      const s = src?.fhc_scores?.[0] || src || {};
      return {
        title: 'Financial Health Check™',
        score: s.overall_score,
        date: src?.submitted_at || src?.created_at,
        rows: [
          ['Cash Flow', s.cashflow_score], ['Debt', s.debt_score],
          ['Emergency Fund', s.emergency_score], ['Protection', s.protection_score],
          ['Retirement', s.retirement_score], ['Assets', s.asset_score],
          ['Goals', s.goals_score]
        ],
        priorities: [s.priority_1,s.priority_2,s.priority_3].filter(Boolean)
      };
    }

    const r = src?.wpr_results?.[0] || src || {};
    const a = r.analysis_json || {};
    return {
      title: 'Wealth & Protection Review™',
      score: r.overall_score,
      date: src?.completed_at || src?.submitted_at || src?.created_at,
      rows: [
        ['Net Worth', money(r.net_worth)], ['Protection Need', money(r.protection_need)],
        ['Protection Gap', money(r.protection_gap)], ['Critical Illness Gap', money(r.critical_illness_gap)],
        ['Retirement Gap', money(r.retirement_gap)], ['Liquidity Score', r.liquidity_score],
        ['Protection Score', r.protection_score], ['Retirement Score', r.retirement_score],
        ['Wealth Score', r.wealth_score]
      ],
      priorities: [r.priority_1,r.priority_2,r.priority_3].filter(Boolean),
      observation: typeof a.observation === 'string' ? a.observation : ''
    };
  }

  function modal(title, html, footer) {
    $('sf-final-report-modal')?.remove();
    const m = document.createElement('div');
    m.id = 'sf-final-report-modal';
    m.innerHTML = '<div class="sf-final-backdrop"><div class="sf-final-dialog" role="dialog" aria-modal="true">' +
      '<header><div><span>SAFE FUTURE · PERSONAL REPORT</span><h2>' + esc(title) + '</h2></div>' +
      '<button type="button" aria-label="Tutup" data-final-close>×</button></header>' +
      '<main>' + html + '</main><footer>' + footer +
      '<button type="button" data-final-close>Tutup</button></footer></div></div>';
    document.body.appendChild(m);
    m.querySelectorAll('[data-final-close]').forEach(b => b.addEventListener('click', () => m.remove()));
  }

  function viewAssessment(type,id) {
    const src = (type === 'FHC' ? state.fhc : state.wpr).find(x => String(x.id) === String(id));
    if (!src) return;
    const d = reportSummary(type,src);
    const rows = d.rows.map(x => '<div><span>' + esc(x[0]) + '</span><strong>' +
      esc(x[1] == null ? '—' : String(x[1])) +
      (typeof x[1] === 'number' && /score/i.test(x[0]) ? ' / 100' : '') +
      '</strong></div>').join('');
    const priorities = d.priorities.length
      ? '<section><h3>Prioritas</h3><ol>' + d.priorities.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></section>'
      : '';
    const observation = d.observation
      ? '<section><h3>Key Observation</h3><p>' + esc(d.observation.replace(/<[^>]*>/g,'')) + '</p></section>'
      : '';
    const body = '<div class="sf-final-score"><span>Financial Score</span><strong>' +
      esc(d.score == null ? '—' : String(Math.round(Number(d.score)))) +
      '</strong><small>/ 100</small></div>' +
      '<p class="sf-final-date">' + fmtDate(d.date) + '</p>' +
      '<section><h3>Ringkasan Data</h3><div class="sf-final-grid">' + rows + '</div></section>' +
      priorities + observation +
      '<p class="sf-final-disclaimer">Hasil merupakan estimasi berbasis data yang Anda masukkan dan bukan nasihat keuangan personal, hukum, pajak, atau rekomendasi produk.</p>';
    modal(d.title, body,
      '<button type="button" data-final-download="' + type + '" data-final-id="' + esc(id) + '">Download PDF</button>');
  }

  function loadJsPdf() {
    return new Promise((resolve, reject) => {
      if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF unavailable'));
      s.onerror = () => reject(new Error('jsPDF load failed'));
      document.head.appendChild(s);
    });
  }

  async function downloadAssessment(type,id) {
    const src = (type === 'FHC' ? state.fhc : state.wpr).find(x => String(x.id) === String(id));
    if (!src) return;
    const d = reportSummary(type,src);
    try {
      const JsPDF = await loadJsPdf();
      const pdf = new JsPDF({unit:'mm',format:'a4'});
      pdf.setTextColor(11,17,32);
      pdf.setFont('helvetica','bold'); pdf.setFontSize(19);
      pdf.text('Safe Future',20,22);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(12);
      pdf.text(d.title,20,31);
      pdf.setFontSize(9); pdf.text('Tanggal: '+fmtDate(d.date),20,38);
      pdf.setFont('helvetica','bold'); pdf.setFontSize(29);
      pdf.text(String(d.score == null ? '—' : Math.round(Number(d.score)))+' / 100',20,53);
      let y=67; pdf.setFontSize(10);
      d.rows.forEach(([k,v]) => {
        if (y > 270) { pdf.addPage(); y=22; }
        pdf.setFont('helvetica','normal'); pdf.text(String(k),20,y);
        pdf.setFont('helvetica','bold'); pdf.text(String(v == null ? '—' : v)+(typeof v==='number'&&/score/i.test(k)?' / 100':''),150,y);
        y += 7;
      });
      if (d.priorities.length) {
        if (y > 260) { pdf.addPage(); y=22; }
        y += 4; pdf.setFont('helvetica','bold'); pdf.text('Prioritas',20,y); y+=7;
        pdf.setFont('helvetica','normal');
        d.priorities.forEach(x => {
          const lines=pdf.splitTextToSize('• '+String(x),165);
          pdf.text(lines,22,y); y += lines.length*5;
        });
      }
      if (d.observation) {
        if (y > 250) { pdf.addPage(); y=22; }
        y += 4; pdf.setFont('helvetica','bold'); pdf.text('Key Observation',20,y); y+=7;
        pdf.setFont('helvetica','normal');
        const lines=pdf.splitTextToSize(String(d.observation.replace(/<[^>]*>/g,'')),165);
        pdf.text(lines,20,y); y += lines.length*5;
      }
      pdf.setFontSize(7);
      pdf.text('Safe Future — estimasi berbasis data pengguna. Bukan nasihat keuangan personal.',20,287);
      pdf.save('Safe-Future-'+type+'-'+new Date().toISOString().slice(0,10)+'.pdf');
    } catch (e) {
      console.warn('Final PDF generation:', e);
      alert('PDF generator tidak tersedia. Silakan gunakan Cetak → Simpan sebagai PDF.');
      window.print();
    }
  }

  function renderReports() {
    const rows = buildSyntheticReports();
    const html = rows.length ? rows.map((r) => {
      const type = String(r.report_type || 'Report').toUpperCase();
      const src = sourceForReport(r);
      const id = esc(r.id);
      return '<div class="sf-final-report-row"><div><b>' + esc(type) + '</b><small>' +
        fmtDate(r.generated_at || r.created_at) + ' · Tersedia</small></div>' +
        '<div class="sf-final-report-actions">' +
        '<button type="button" data-final-report-view="' + id + '">Lihat</button>' +
        '<button type="button" data-final-report-download="' + id + '" ' + (!src ? 'disabled' : '') + '>Download PDF</button>' +
        '</div></div>';
    }).join('') : '<div class="sf4-empty">Belum ada laporan atau hasil assessment tersimpan.</div>';

    ['sf4Reports','sfDashReports'].forEach(id => {
      const el = $(id);
      if (el) el.innerHTML = html;
    });
  }

  function renderAll() {
    renderHistory();
    renderReports();
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-final-view]');
    if (b) viewAssessment(b.dataset.finalView,b.dataset.finalId);

    const d = e.target.closest('[data-final-download]');
    if (d && d.dataset.finalId && d.dataset.finalType) downloadAssessment(d.dataset.finalType,d.dataset.finalId);

    const rv = e.target.closest('[data-final-report-view]');
    if (rv) {
      const row = buildSyntheticReports().find(r => String(r.id) === String(rv.dataset.finalReportView));
      const src = sourceForReport(row);
      if (row && src) viewAssessment(String(row.report_type).toUpperCase(),src.id);
    }

    const rd = e.target.closest('[data-final-report-download]');
    if (rd) {
      const row = buildSyntheticReports().find(r => String(r.id) === String(rd.dataset.finalReportDownload));
      const src = sourceForReport(row);
      if (row && src) downloadAssessment(String(row.report_type).toUpperCase(),src.id);
    }
  });

  // Buttons inside our modal use separate attributes so there is no ambiguity.
  document.addEventListener('click', (e) => {
    const b=e.target.closest('[data-final-download]');
    if (!b || !b.dataset.finalType) return;
    downloadAssessment(b.dataset.finalType,b.dataset.finalId);
  });

  window.sfFinalPlatformRefresh = loadData;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadData, 700);
    try {
      const client=c();
      client?.auth?.onAuthStateChange((_event,session) => {
        if (session?.user) {
          setTimeout(loadData, 400);
          setTimeout(loadData, 1800);
        }
      });
    } catch {}
  });

  const obs = new MutationObserver(() => {
    if ($('sfUserDashboard') && $('sfDashContent')) {
      clearTimeout(window.__sfFinalRefreshTimer);
      window.__sfFinalRefreshTimer = setTimeout(() => {
        if (state.lastUserId) renderAll();
      }, 500);
    }
  });
  obs.observe(document.body, {childList:true,subtree:true});
})();""