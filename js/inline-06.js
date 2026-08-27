
(function(){
  'use strict';

  const state = {
    query:'',
    segment:'all',
    score:'all',
    sort:'newest'
  };

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];
    });
  }

  function ensureToolbar(){
    const panel = document.getElementById('adminPanel');
    const table = document.getElementById('leadsTable');
    if(!panel || !table) return;
    if(document.getElementById('sfAdminToolbar')) return;

    const wrap = table.closest('.overflow-x-auto') || table.closest('.bg-white');
    if(!wrap) return;

    const toolbar = document.createElement('div');
    toolbar.id='sfAdminToolbar';
    toolbar.className='sf-admin-toolbar';
    toolbar.innerHTML = `
      <div class="relative">
        <i class="fas fa-search" style="position:absolute;left:13px;top:13px;color:#9AA2AF;font-size:12px"></i>
        <input id="sfLeadSearch" aria-label="Cari lead" placeholder="Cari nama, WhatsApp, kota..." style="width:100%;padding-left:34px">
      </div>
      <select id="sfLeadSegment" aria-label="Filter segmen">
        <option value="all">Semua segmen</option>
        <option value="FHC">FHC</option>
        <option value="WPR">W&PR / Affluent</option>
        <option value="CONTACT">Pesan Website</option>
      </select>
      <select id="sfLeadScore" aria-label="Filter skor">
        <option value="all">Semua skor</option>
        <option value="high">80+ · Strong</option>
        <option value="mid">60–79 · Healthy</option>
        <option value="low">0–59 · Perlu perhatian</option>
      </select>
      <select id="sfLeadSort" aria-label="Urutkan lead">
        <option value="newest">Terbaru</option>
        <option value="oldest">Terlama</option>
        <option value="score">Skor tertinggi</option>
        <option value="gap">Protection Gap terbesar</option>
      </select>
      <div id="sfAdminResultCount" class="sf-admin-result-count">0 lead</div>
    `;
    wrap.parentNode.insertBefore(toolbar, wrap);

    ['sfLeadSearch','sfLeadSegment','sfLeadScore','sfLeadSort'].forEach(id=>{
      document.getElementById(id).addEventListener('input', function(){
        state.query = document.getElementById('sfLeadSearch').value.trim().toLowerCase();
        state.segment = document.getElementById('sfLeadSegment').value;
        state.score = document.getElementById('sfLeadScore').value;
        state.sort = document.getElementById('sfLeadSort').value;
        renderFiltered();
      });
    });
  }

  function scoreOf(l){
    const n = Number(l.overall_score ?? l.overallScore ?? l.wpr_score ?? l.wprScore);
    return Number.isFinite(n) ? n : null;
  }
  function gapOf(l){
    const n = Number(l.protection_gap ?? l.protectionGap ?? 0);
    return Number.isFinite(n) ? n : 0;
  }
  function dateOf(l){
    const d = new Date(l.created_at || l.timestamp || 0).getTime();
    return Number.isFinite(d) ? d : 0;
  }
  function segmentOf(l){
    if(l.segment==='CONTACT'||l.assessment_type==='CONTACT'||l.source==='Kirim Pesan - Website') return 'CONTACT';
    return (l.segment === 'Affluent' || l.segment === 'WPR' || l.wpr_score != null || l.wprScore != null) ? 'WPR' : 'FHC';
  }

  function filteredRows(){
    const rows = Array.isArray(window.__cloudResponses) ? window.__cloudResponses : [];
    let out = rows.filter(l=>{
      const seg=segmentOf(l);
      if(state.segment!=='all' && seg!==state.segment) return false;

      const score=scoreOf(l);
      if(state.score==='high' && !(score>=80)) return false;
      if(state.score==='mid' && !(score>=60 && score<80)) return false;
      if(state.score==='low' && !(score<60)) return false;

      if(state.query){
        const raw=[
          l.nama,l.wa,l.kota,l.pekerjaan,l.status,l.segment,l.notes,
          l.raw && l.raw.nama,l.raw && l.raw.kota,l.raw && l.raw.email,l.raw && l.raw.message
        ].join(' ').toLowerCase();
        if(!raw.includes(state.query)) return false;
      }
      return true;
    });

    out.sort((a,b)=>{
      if(state.sort==='oldest') return dateOf(a)-dateOf(b);
      if(state.sort==='score') return (scoreOf(b)??-1)-(scoreOf(a)??-1);
      if(state.sort==='gap') return gapOf(b)-gapOf(a);
      return dateOf(b)-dateOf(a);
    });
    return out;
  }

  function riskClass(score){
    if(score==null) return '';
    if(score<60) return 'sf-admin-risk-high';
    if(score<80) return 'sf-admin-risk-mid';
    return 'sf-admin-risk-ok';
  }

  function renderFiltered(){
    const table=document.getElementById('leadsTable');
    if(!table) return;
    ensureToolbar();
    const rows=filteredRows();
    const count=document.getElementById('sfAdminResultCount');
    if(count) count.textContent = rows.length + ' lead' + (rows.length===1?'':'s');

    if(!rows.length){
      table.innerHTML=`<tr><td colspan="7"><div class="sf-admin-empty"><i class="fas fa-inbox"></i><div>Tidak ada lead yang cocok dengan filter.</div><small>Coba ubah kata kunci atau filter segmen.</small></div></td></tr>`;
      return;
    }

    table.innerHTML=rows.map((l)=>{
      const seg=segmentOf(l);
      const score=scoreOf(l);
      const need=l.total_need!=null?Number(l.total_need):null;
      const gap=gapOf(l);
      const tgl=l.created_at?new Date(l.created_at).toLocaleString('id-ID'):(l.timestamp||'—');
      const originalIndex=(window.__cloudResponses||[]).indexOf(l);
      const badge=seg==='CONTACT'
        ? '<span class="sf-admin-chip"><i class="fas fa-envelope" style="color:#16a34a"></i>Pesan</span>'
        : (seg==='WPR'
        ? '<span class="sf-admin-chip"><i class="fas fa-gem" style="color:#C7A24A"></i>W&PR</span>'
        : '<span class="sf-admin-chip"><i class="fas fa-stethoscope"></i>FHC</span>');
      return `<tr class="border-b border-slate-100">
        <td class="p-4">${badge}</td>
        <td class="p-4 font-semibold text-navy">${esc(l.nama||'—')}</td>
        <td class="p-4 text-slate-600">${esc(tgl)}</td>
        <td class="p-4 text-slate-600">${esc(l.usia??l.raw?.usiaSekarang??'—')}</td>
        <td class="p-4 text-slate-600">${need==null?'—':'Rp '+need.toLocaleString('id-ID')}</td>
        <td class="p-4 ${gap>0?'text-red-600 font-semibold':'text-green-600 font-semibold'}">${gap?'Rp '+gap.toLocaleString('id-ID'):'Rp 0'}</td>
        <td class="p-4 whitespace-nowrap">
          ${score!=null?`<span class="${riskClass(score)}" style="margin-right:10px">${score}/100</span>`:''}
          <button onclick="viewCloudDetail(${originalIndex})" class="bg-navy text-white px-3 py-2 rounded-md text-xs hover:bg-navy-light transition"><i class="fas fa-eye mr-1"></i>Detail</button>
          <button onclick="deleteCloudLead(${originalIndex})" class="bg-white text-red-600 border border-red-200 px-3 py-2 rounded-md text-xs hover:bg-red-50 transition"><i class="fas fa-trash mr-1"></i></button>
        </td>
      </tr>`;
    }).join('');
  }

  // Override the existing renderer while preserving its data source and stats.
  window.renderCloudTable = function(data){
    window.__cloudResponses = Array.isArray(data) ? data : [];
    if(typeof renderAdminStats==='function') renderAdminStats(window.__cloudResponses);
    ensureToolbar();
    renderFiltered();
  };

  // Add a small summary ribbon above the table.
  function addAdminRibbon(){
    const panel=document.getElementById('adminPanel');
    if(!panel || document.getElementById('sfAdminRibbon')) return;
    const ribbon=document.createElement('div');
    ribbon.id='sfAdminRibbon';
    ribbon.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px;';
    ribbon.innerHTML=`
      <span class="sf-admin-chip"><strong>Lead Intelligence</strong> · pantau kualitas & prioritas lead</span>
      <span class="sf-admin-chip">Diagnosis → Strategy → Recommendation</span>
      <span class="sf-admin-chip">Data cloud: Supabase</span>
    `;
    const status=document.getElementById('adminDataStatus');
    if(status) status.parentNode.insertBefore(ribbon,status);
    else panel.prepend(ribbon);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    ensureToolbar();
    addAdminRibbon();
    if(!document.getElementById('adminPanel')?.classList.contains('hidden')) renderAdminStats(window.__cloudResponses||[]);
  });

  const oldLoad = window.loadResponsesFromSupabase;
  if(typeof oldLoad==='function'){
    window.loadResponsesFromSupabase = async function(){
      const result=await oldLoad.apply(this,arguments);
      ensureToolbar();
      addAdminRibbon();
      if(Array.isArray(window.__cloudResponses)) renderFiltered();
      return result;
    };
  }

  // Safer "delete all": require a deliberate typed confirmation.
  const oldClear = window.clearLeads;
  if(typeof oldClear==='function'){
    window.clearLeads = function(){
      const confirmation=prompt('Untuk menghapus SEMUA lead, ketik: HAPUS SEMUA LEAD');
      if(confirmation!=='HAPUS SEMUA LEAD') return;
      return oldClear.apply(this,arguments);
    };
  }
})();
