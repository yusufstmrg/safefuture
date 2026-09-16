
const SF_EMBEDDED_ASSETS = {};
const SF_EMBEDDED_PDFS = {};\nconst SF_ASSET_ALIASES = {"flexi.webp":"flexi.webp","mdla.webp":"mdla.webp","mdsa.webp":"mdsa.webp","mdwa.webp":"mdwa.webp","mifip.webp":"mifip.webp","miprecious.webp":"miprecious.webp","miucc.webp":"miucc.webp","miuhc.webp":"miuhc.webp","proactive-plus.webp":"proactive-plus.webp","flexi.pdf":"flexi.pdf","mdla.pdf":"mdla.pdf","mdsa.pdf":"mdsa.pdf","mdwa.pdf":"mdwa.pdf","mifip.pdf":"mifip.pdf","miprecious.pdf":"miprecious.pdf","miucc.pdf":"miucc.pdf","miuhc.pdf":"miuhc.pdf","mpps.pdf":"mpps.pdf","proactive-plus.pdf":"proactive-plus.pdf"};
function sfAssetKey(path){ const p=String(path||''); return p.split('/').pop().replace(/\.png$/i,'.webp'); }
const SF_PDF_ALIASES = {"pap-brosur.pdf":"proactive-plus.pdf","pap.pdf":"proactive-plus.pdf","proactive.pdf":"proactive-plus.pdf","miuhc-brosur.pdf":"miuhc.pdf","miucc-brosur.pdf":"miucc.pdf","mccp-brosur.pdf":"mccp.pdf","mdla-brosur.pdf":"mdla.pdf","mdsa-brosur.pdf":"mdsa.pdf","mdwa-brosur.pdf":"mdwa.pdf","mifip-brosur.pdf":"mifip.pdf","miprecious-brosur.pdf":"miprecious.pdf","mission-brosur.pdf":"mission-syariah.pdf","mission-syariah-brosur.pdf":"mission-syariah.pdf","mpps-brosur.pdf":"mpps.pdf","mpds-brosur.pdf":"manulife-perlindungan-diri-syariah.pdf","miuhcs-brosur.pdf":"miuhcs.pdf","flexi-brosur.pdf":"flexi.pdf"};
function sfAssetUrl(path){
    const p=String(path||'').trim();
    if(!p) return '';
    if(/^data:|^blob:|^https?:/i.test(p)) return p;
    const rawName=p.split('?')[0].split('#')[0].split('/').pop();
    const name=SF_PDF_ALIASES[rawName] || rawName;
    // Prefer the embedded asset. This makes previews work even on hosts that only serve index.html.
    if(SF_EMBEDDED_ASSETS[name]) return SF_EMBEDDED_ASSETS[name];
    if(/\.pdf$/i.test(name) && SF_EMBEDDED_PDFS[name]) return SF_EMBEDDED_PDFS[name];
    // Fall back to the packaged relative file for assets not embedded.
    return p;
}
function sfAssetMime(path){ const key=String(path||'').split('?')[0].toLowerCase(); if(key.endsWith('.pdf')) return 'application/pdf'; if(key.endsWith('.jpg')||key.endsWith('.jpeg')) return 'image/jpeg'; if(key.endsWith('.png')) return 'image/png'; if(key.endsWith('.webp')) return 'image/webp'; return 'application/octet-stream'; }
function sfDataUrlToBlob(url){ const parts=url.split(','); const mime=(parts[0].match(/data:([^;]+)/)||[])[1]||'application/octet-stream'; const bin=atob(parts[1]||''); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i); return new Blob([bytes],{type:mime}); }
function sfOpenAsset(path, filename){
    const url=sfAssetUrl(path);
    if(!url) return false;
    try{
        const absolute=sfResolveAsset(url);
        const mime=sfAssetMime(path);
        let modal=document.getElementById('sfAssetPreviewModal');
        if(!modal){
            modal=document.createElement('div'); modal.id='sfAssetPreviewModal';
            modal.style.cssText='position:fixed;inset:0;background:rgba(8,17,31,.96);z-index:100000;display:flex;align-items:center;justify-content:center;padding:14px';
            document.body.appendChild(modal);
        }
        const title=String(filename||'Safe Future — Materi Produk').replace(/[<>&"\']/g,'');
        const isPdf=mime==='application/pdf';
        modal.innerHTML='<div style="position:relative;width:min(1180px,98vw);height:min(94vh,980px);display:flex;flex-direction:column;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.45)">'+
          '<div style="height:54px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;background:#08111F;color:#fff;flex-shrink:0">'+
          '<strong style="font:600 13px Inter,Arial,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+title+'</strong>'+
          '<div style="display:flex;gap:8px;align-items:center">'+
          (isPdf?'<a href="'+absolute+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border-radius:8px;background:#E9C766;color:#08111F;text-decoration:none;font:700 11px Inter,Arial,sans-serif">Buka PDF</a>':'')+
          '<button type="button" onclick="this.closest(\'#sfAssetPreviewModal\').remove();document.body.classList.remove(\'overflow-hidden\')" style="width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:21px;cursor:pointer">×</button></div></div>'+
          (isPdf?'<iframe src="'+absolute+'#toolbar=1&navpanes=0" title="Preview PDF" style="width:100%;height:calc(100% - 54px);flex:1;border:0;background:#fff"></iframe>':'<div style="flex:1;display:flex;align-items:center;justify-content:center;background:#111827;overflow:auto;padding:12px"><img src="'+absolute+'" alt="'+title+'" style="max-width:100%;max-height:100%;object-fit:contain"></div>')+
          '</div>';
        document.body.classList.add('overflow-hidden');
        return true;
    }catch(e){
        console.warn('Asset preview failed:',e);
        try{ window.open(sfResolveAsset(url),'_blank','noopener'); return true; }catch(_){ return false; }
    }
}
function sfDownloadAsset(path, filename){ const url=sfAssetUrl(path); if(!url) return false; try{ const blob=url.startsWith('data:')?sfDataUrlToBlob(url):null; const objectUrl=blob?URL.createObjectURL(blob):url; const a=document.createElement('a'); a.href=objectUrl; a.download=filename||String(path).split('/').pop()||'Safe-Future-Material'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove(); if(blob) setTimeout(()=>URL.revokeObjectURL(objectUrl),60000); return true; }catch(e){ console.warn('Asset download failed',e); return false; } }
