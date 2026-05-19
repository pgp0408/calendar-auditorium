document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("semainejps-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnEUKc0wpQrmGOXO4b_k8oOVoHhrCSzX_VbXqA1zSYWUOMWQbiy6_tzwPCALDsSY7swWLLweOOjpRM/pub?gid=1329408426&single=true&output=csv";

  const START_DATE = "2026-06-15";
  const END_DATE = "2026-06-21";

  const ROOMS = {
    auditorium: { label: "Auditorium", capacity: 200 },
    orchestre: { label: "Salle d’orchestre", capacity: 40 },
    chant: { label: "Salle de chant", capacity: 40 },
    danse: { label: "Studio danse", capacity: 40 },
    theatre: { label: "Studio théâtre", capacity: 40 },
    exterieur: { label: "Extérieur", capacity: 0 },
    autre: { label: "Autre / à définir", capacity: 0 }
  };

  root.innerHTML = `
    <style>
      #semainejps-calendar{
        --jps-text:#111827;
        --jps-muted:#6b7280;
        --jps-border:#e5e7eb;
        --jps-soft:#f8fafc;
        --jps-green:#16a34a;
        --jps-orange:#f59e0b;
        --jps-blue:#60a5fa;
        --jps-red:#dc2626;
        --jps-gray:#64748b;
        font-family:Arial,sans-serif;
        color:var(--jps-text);
        width:100%;
      }
      #semainejps-calendar *{box-sizing:border-box}
      #semainejps-calendar .jps-card{max-width:1450px;margin:0 auto;background:#fff;border:1px solid var(--jps-border);border-radius:24px;box-shadow:0 18px 50px rgba(15,23,42,.08);overflow:hidden}
      #semainejps-calendar .jps-header{padding:32px;background:radial-gradient(circle at top right,rgba(96,165,250,.18),transparent 30%),radial-gradient(circle at top left,rgba(22,163,74,.13),transparent 28%),#fff;border-bottom:1px solid var(--jps-border)}
      #semainejps-calendar .jps-headgrid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:start}
      #semainejps-calendar h2{margin:0;font-size:clamp(28px,4vw,46px);line-height:1.05;letter-spacing:-.04em}
      #semainejps-calendar .jps-sub{margin:10px 0 0;color:var(--jps-muted);font-size:16px;line-height:1.5;max-width:850px}
      #semainejps-calendar .jps-actions{display:flex;flex-direction:column;gap:10px;align-items:flex-end}
      #semainejps-calendar .jps-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      #semainejps-calendar .jps-filter{border:1px solid #d1d5db;background:#fff;border-radius:999px;padding:10px 14px;font-size:14px;font-weight:800;cursor:pointer}
      #semainejps-calendar .jps-filter input{margin-right:6px;transform:translateY(1px)}
      #semainejps-calendar .jps-legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
      #semainejps-calendar .jps-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--jps-border);background:rgba(255,255,255,.9);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:800;color:#374151}
      #semainejps-calendar .jps-dot{width:11px;height:11px;border-radius:50%;display:inline-block}
      #semainejps-calendar .accepted{--status-color:var(--jps-green)}
      #semainejps-calendar .pending{--status-color:var(--jps-orange)}
      #semainejps-calendar .move{--status-color:var(--jps-blue)}
      #semainejps-calendar .refused{--status-color:var(--jps-red)}
      #semainejps-calendar .jps-dot.accepted{background:var(--jps-green)}
      #semainejps-calendar .jps-dot.pending{background:var(--jps-orange)}
      #semainejps-calendar .jps-dot.move{background:var(--jps-blue)}
      #semainejps-calendar .jps-dot.refused{background:var(--jps-red)}
      #semainejps-calendar .jps-content{padding:24px}
      #semainejps-calendar .jps-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:22px}
      #semainejps-calendar .jps-stat{border:1px solid var(--jps-border);border-radius:18px;background:#fff;padding:16px}
      #semainejps-calendar .jps-statnum{font-size:28px;font-weight:900;line-height:1}
      #semainejps-calendar .jps-statlabel{margin-top:6px;color:var(--jps-muted);font-size:13px;font-weight:800}
      #semainejps-calendar .jps-layout{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:22px;align-items:start}
      #semainejps-calendar .jps-weekpanel,#semainejps-calendar .jps-side{border:1px solid var(--jps-border);border-radius:22px;background:#fff;padding:18px;min-width:0}
      #semainejps-calendar .jps-side{position:sticky;top:16px;max-height:calc(100vh - 32px);overflow:hidden;display:flex;flex-direction:column}
      #semainejps-calendar .jps-panelhead,#semainejps-calendar .jps-sidehead{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:16px}
      #semainejps-calendar .jps-paneltitle,#semainejps-calendar .jps-side h3{margin:0;font-size:22px;font-weight:900;letter-spacing:-.02em}
      #semainejps-calendar .jps-count{color:var(--jps-muted);font-size:13px;font-weight:800;white-space:nowrap}
      #semainejps-calendar .jps-alerts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px}
      #semainejps-calendar .jps-alert{border:1px solid var(--jps-border);border-radius:16px;padding:12px;background:#f9fafb;font-size:13px;line-height:1.35}
      #semainejps-calendar .jps-alert strong{display:block;margin-bottom:4px}
      #semainejps-calendar .jps-alert.empty{border-color:#fecaca;background:#fff1f2}
      #semainejps-calendar .jps-alert.low{border-color:#fed7aa;background:#fff7ed}
      #semainejps-calendar .jps-alert.full{border-color:#bfdbfe;background:#eff6ff}
      #semainejps-calendar .jps-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px}
      #semainejps-calendar .jps-day{border:1px solid #e7eaee;border-radius:20px;background:#fbfcfd;overflow:hidden;min-height:530px;display:flex;flex-direction:column}
      #semainejps-calendar .jps-dayhead{padding:14px;background:#fff;border-bottom:1px solid var(--jps-border)}
      #semainejps-calendar .jps-dayname{font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:.03em}
      #semainejps-calendar .jps-daydate{margin-top:3px;color:var(--jps-muted);font-size:13px;font-weight:800}
      #semainejps-calendar .jps-slot{padding:10px;border-bottom:1px solid #edf0f3}
      #semainejps-calendar .jps-slot:last-child{border-bottom:0}
      #semainejps-calendar .jps-slottitle{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px;font-size:12px;font-weight:900;color:#475569;text-transform:uppercase;letter-spacing:.03em}
      #semainejps-calendar .jps-slotcount{background:#f1f5f9;border-radius:999px;padding:2px 7px;font-size:11px;color:#475569}
      #semainejps-calendar .jps-events{display:flex;flex-direction:column;gap:8px}
      #semainejps-calendar .jps-empty{border:1px dashed #d1d5db;border-radius:12px;padding:9px;color:var(--jps-muted);font-size:12px;font-style:italic;background:#fff}
      #semainejps-calendar .jps-event{border:0;width:100%;text-align:left;cursor:pointer;border-radius:15px;padding:11px;background:var(--status-color);color:#fff;box-shadow:0 8px 18px rgba(15,23,42,.12)}
      #semainejps-calendar .jps-event.move{color:#0f172a}
      #semainejps-calendar .jps-event.pending{color:#111827}
      #semainejps-calendar .jps-event:hover{transform:translateY(-1px)}
      #semainejps-calendar .jps-eventtime{display:block;font-weight:900;font-size:12px;margin-bottom:4px}
      #semainejps-calendar .jps-eventtitle{display:block;font-weight:900;font-size:13px;line-height:1.25}
      #semainejps-calendar .jps-eventmeta{display:block;margin-top:6px;font-size:12px;line-height:1.3;opacity:.9}
      #semainejps-calendar .jps-list{overflow-y:auto;padding-right:4px;display:flex;flex-direction:column;gap:12px}
      #semainejps-calendar .jps-item{border:1px solid #e7eaee;border-left:7px solid var(--status-color);border-radius:18px;padding:14px;background:#fbfbfc;cursor:pointer}
      #semainejps-calendar .jps-item:hover{background:#fff;box-shadow:0 10px 24px rgba(15,23,42,.08)}
      #semainejps-calendar .jps-itemtitle{font-weight:900;margin-bottom:7px}
      #semainejps-calendar .jps-itemmeta{font-size:14px;line-height:1.5;color:#4b5563}
      #semainejps-calendar .jps-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
      #semainejps-calendar .jps-badge{display:inline-flex;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:900;background:var(--status-color);color:#fff}
      #semainejps-calendar .jps-badge.move,.jps-badge.pending{color:#111827}
      #semainejps-calendar .jps-roomtag{background:#334155!important;color:#fff!important}
      #semainejps-calendar .jps-error{margin-top:14px;color:#b91c1c;font-weight:800;white-space:pre-wrap}
      #semainejps-calendar .jps-modal{display:none;position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;padding:20px;align-items:center;justify-content:center}
      #semainejps-calendar .jps-modal.open{display:flex}
      #semainejps-calendar .jps-modalbox{width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}
      #semainejps-calendar .jps-close{position:absolute;top:12px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer}
      #semainejps-calendar .jps-modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900}
      #semainejps-calendar .jps-row{display:grid;grid-template-columns:160px minmax(0,1fr);gap:14px;padding:11px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}
      #semainejps-calendar .jps-row:last-child{border-bottom:0}
      #semainejps-calendar .jps-label{font-weight:900}
      @media(max-width:1180px){
        #semainejps-calendar .jps-layout{grid-template-columns:1fr}
        #semainejps-calendar .jps-side{position:static;max-height:none}
        #semainejps-calendar .jps-list{overflow:visible}
        #semainejps-calendar .jps-week{grid-template-columns:repeat(2,minmax(0,1fr))}
        #semainejps-calendar .jps-day{min-height:360px}
        #semainejps-calendar .jps-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:760px){
        #semainejps-calendar .jps-header,#semainejps-calendar .jps-content{padding:18px}
        #semainejps-calendar .jps-headgrid{grid-template-columns:1fr}
        #semainejps-calendar .jps-actions{align-items:stretch}
        #semainejps-calendar .jps-filters{justify-content:flex-start}
        #semainejps-calendar .jps-filter{width:100%;text-align:left}
        #semainejps-calendar .jps-week{grid-template-columns:1fr}
        #semainejps-calendar .jps-alerts{grid-template-columns:1fr}
        #semainejps-calendar .jps-stats{grid-template-columns:1fr 1fr}
        #semainejps-calendar .jps-row{grid-template-columns:1fr;gap:4px}
      }
    </style>

    <div class="jps-card">
      <div class="jps-header">
        <div class="jps-headgrid">
          <div>
            <h2>Semaine JPS 2026</h2>
            <p class="jps-sub">Tableau de pilotage des propositions pour la semaine inaugurale du 15 au 21 juin 2026 : trous, surcharges, arbitrages et statuts.</p>
          </div>
          <div class="jps-actions">
            <div class="jps-filters">
              <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="accepted" checked> Accepté</label>
              <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="pending" checked> En attente</label>
              <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="move" checked> À déplacer</label>
              <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="refused" checked> Refusé</label>
            </div>
          </div>
        </div>

        <div class="jps-legend">
          <span class="jps-pill"><span class="jps-dot accepted"></span>Accepté</span>
          <span class="jps-pill"><span class="jps-dot pending"></span>En attente</span>
          <span class="jps-pill"><span class="jps-dot move"></span>À déplacer</span>
          <span class="jps-pill"><span class="jps-dot refused"></span>Refusé</span>
        </div>
      </div>

      <div class="jps-content">
        <div class="jps-stats">
          <div class="jps-stat"><div id="jps-total" class="jps-statnum">0</div><div class="jps-statlabel">propositions affichées</div></div>
          <div class="jps-stat"><div id="jps-accepted" class="jps-statnum">0</div><div class="jps-statlabel">acceptées</div></div>
          <div class="jps-stat"><div id="jps-pending" class="jps-statnum">0</div><div class="jps-statlabel">en attente</div></div>
          <div class="jps-stat"><div id="jps-move" class="jps-statnum">0</div><div class="jps-statlabel">à déplacer</div></div>
          <div class="jps-stat"><div id="jps-refused" class="jps-statnum">0</div><div class="jps-statlabel">refusées</div></div>
        </div>

        <div class="jps-layout">
          <section class="jps-weekpanel">
            <div class="jps-panelhead">
              <h3 class="jps-paneltitle">Vue semaine — 15 au 21 juin</h3>
              <div id="jps-count" class="jps-count"></div>
            </div>
            <div id="jps-alerts" class="jps-alerts"></div>
            <div id="jps-week" class="jps-week"></div>
            <div id="jps-error" class="jps-error"></div>
          </section>

          <aside class="jps-side">
            <div class="jps-sidehead">
              <h3>Propositions</h3>
              <span id="jps-list-count" class="jps-count"></span>
            </div>
            <div id="jps-list" class="jps-list"></div>
          </aside>
        </div>
      </div>
    </div>

    <div id="jps-modal" class="jps-modal">
      <div class="jps-modalbox">
        <button type="button" id="jps-close" class="jps-close">&times;</button>
        <h3 id="jps-m-title" class="jps-modaltitle"></h3>
        <div class="jps-row"><span class="jps-label">Référent</span><span id="jps-m-name"></span></div>
        <div class="jps-row"><span class="jps-label">Discipline</span><span id="jps-m-discipline"></span></div>
        <div class="jps-row"><span class="jps-label">Type</span><span id="jps-m-type"></span></div>
        <div class="jps-row"><span class="jps-label">Public</span><span id="jps-m-public"></span></div>
        <div class="jps-row"><span class="jps-label">Date</span><span id="jps-m-date"></span></div>
        <div class="jps-row"><span class="jps-label">Horaire</span><span id="jps-m-time"></span></div>
        <div class="jps-row"><span class="jps-label">Durée</span><span id="jps-m-duration"></span></div>
        <div class="jps-row"><span class="jps-label">Lieu</span><span id="jps-m-room"></span></div>
        <div class="jps-row"><span class="jps-label">Jauge estimée</span><span id="jps-m-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Flexibilité</span><span id="jps-m-flex"></span></div>
        <div class="jps-row"><span class="jps-label">Alternatives</span><span id="jps-m-alt"></span></div>
        <div class="jps-row"><span class="jps-label">Technique</span><span id="jps-m-tech"></span></div>
        <div class="jps-row"><span class="jps-label">Description</span><span id="jps-m-desc"></span></div>
        <div class="jps-row"><span class="jps-label">Statut</span><span id="jps-m-status"></span></div>
      </div>
    </div>
  `;

  let allEvents = [];

  function $(id){ return document.getElementById(id); }
  function norm(v){ return (v||"").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
  function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

  function parseCSVLine(line){
    const res=[]; let cur=""; let q=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i], next=line[i+1];
      if(ch === '"'){
        if(q && next === '"'){ cur += '"'; i++; }
        else q = !q;
      } else if(ch === "," && !q){ res.push(cur); cur=""; }
      else cur += ch;
    }
    res.push(cur);
    return res;
  }

  function parseCSV(text){ return text.replace(/\r/g,"").trim().split("\n").map(parseCSVLine); }

  function findCol(headers, possibilities){
    const hs=headers.map(norm);
    for(const p of possibilities){
      const n=norm(p);
      const exact=hs.findIndex(h=>h===n);
      if(exact!==-1) return exact;
    }
    for(const p of possibilities){
      const n=norm(p);
      const partial=hs.findIndex(h=>h.includes(n));
      if(partial!==-1) return partial;
    }
    return -1;
  }

  function parseDateFR(v){
    if(!v) return null;
    const txt=v.toString().trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;
    const p=txt.split(/[\/.-]/);
    if(p.length!==3) return null;
    let d=p[0], m=p[1], y=p[2];
    if(y.length===2) y="20"+y;
    return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");
  }

  function safeDate(iso){
    if(!iso) return new Date(NaN);
    const p=iso.split("-");
    return new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
  }

  function formatDateFR(iso){
    const d=safeDate(iso);
    if(isNaN(d.getTime())) return "Date invalide";
    return d.toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  }

  function formatShortDate(iso){
    const d=safeDate(iso);
    if(isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
  }

  function formatTime(v){
    if(!v) return "Non précisée";
    return v.toString().trim().slice(0,5);
  }

  function statusInfo(v){
    const s=norm(v);
    if(s.includes("deplacer")) return {kind:"move", label:"À déplacer"};
    if(s.includes("refuse")) return {kind:"refused", label:"Refusé"};
    if(s.includes("accepte")) return {kind:"accepted", label:"Accepté"};
    return {kind:"pending", label:"En attente"};
  }

  function roomInfo(v){
    const s=norm(v);
    if(s.includes("auditorium")) return {key:"auditorium", label:ROOMS.auditorium.label, capacity:ROOMS.auditorium.capacity};
    if(s.includes("orchestre")) return {key:"orchestre", label:ROOMS.orchestre.label, capacity:ROOMS.orchestre.capacity};
    if(s.includes("chant")) return {key:"chant", label:ROOMS.chant.label, capacity:ROOMS.chant.capacity};
    if(s.includes("danse")) return {key:"danse", label:ROOMS.danse.label, capacity:ROOMS.danse.capacity};
    if(s.includes("theatre") || s.includes("théâtre")) return {key:"theatre", label:ROOMS.theatre.label, capacity:ROOMS.theatre.capacity};
    if(s.includes("exterieur") || s.includes("extérieur")) return {key:"exterieur", label:ROOMS.exterieur.label, capacity:ROOMS.exterieur.capacity};
    return {key:"autre", label:v || ROOMS.autre.label, capacity:ROOMS.autre.capacity};
  }

  function slotInfo(ev){
    const d=safeDate(ev.dateIso);
    const day=d.getDay();
    const hour=parseInt((ev.time || "00:00").slice(0,2),10);

    if(day===1 || day===2 || day===4 || day===5){
      if(hour < 12) return "Scolaires matin";
      if(hour < 17) return "Scolaires après-midi";
    }
    if(day===3 || day===6 || day===0) return "Tout public";
    if(hour >= 17) return "Tout public soir";
    return "Autre";
  }

  function selectedStatuses(){
    return Array.from(root.querySelectorAll(".jps-status-filter")).filter(cb=>cb.checked).map(cb=>cb.value);
  }

  function visibleEvents(){
    const selected=selectedStatuses();
    return allEvents.filter(e=>selected.includes(e.statusKind)).sort((a,b)=>{
      if(a.dateIso!==b.dateIso) return a.dateIso.localeCompare(b.dateIso);
      return String(a.time).localeCompare(String(b.time));
    });
  }

  function openModal(ev){
    $("jps-m-title").textContent=ev.title;
    $("jps-m-name").textContent=ev.name || "—";
    $("jps-m-discipline").textContent=ev.discipline || "—";
    $("jps-m-type").textContent=ev.type || "—";
    $("jps-m-public").textContent=ev.publicTarget || "—";
    $("jps-m-date").textContent=formatDateFR(ev.dateIso);
    $("jps-m-time").textContent=ev.time || "—";
    $("jps-m-duration").textContent=ev.duration || "—";
    $("jps-m-room").textContent=ev.roomLabel || "—";
    $("jps-m-capacity").textContent=ev.estimatedCapacity || "—";
    $("jps-m-flex").textContent=ev.flexibility || "—";
    $("jps-m-alt").textContent=ev.alternatives || "—";
    $("jps-m-tech").textContent=ev.tech || "—";
    $("jps-m-desc").textContent=ev.description || "—";
    $("jps-m-status").textContent=ev.statusLabel || "—";
    $("jps-modal").classList.add("open");
  }

  function closeModal(){ $("jps-modal").classList.remove("open"); }

  function renderStats(data){
    $("jps-total").textContent=data.length;
    $("jps-accepted").textContent=data.filter(e=>e.statusKind==="accepted").length;
    $("jps-pending").textContent=data.filter(e=>e.statusKind==="pending").length;
    $("jps-move").textContent=data.filter(e=>e.statusKind==="move").length;
    $("jps-refused").textContent=data.filter(e=>e.statusKind==="refused").length;
    $("jps-count").textContent=data.length > 1 ? data.length+" propositions" : data.length+" proposition";
    $("jps-list-count").textContent=data.length > 1 ? data.length+" éléments" : data.length+" élément";
  }

  function renderAlerts(data){
    const alerts=$("jps-alerts");
    const schoolDays=["2026-06-15","2026-06-16","2026-06-18","2026-06-19"];
    const publicDays=["2026-06-17","2026-06-20","2026-06-21"];
    const schoolCount=data.filter(e=>schoolDays.includes(e.dateIso) && norm(e.publicTarget).includes("scolaire")).length;
    const publicCount=data.filter(e=>publicDays.includes(e.dateIso) || norm(e.publicTarget).includes("tout public")).length;

    const emptyDays=[];
    for(let i=0;i<7;i++){
      const iso="2026-06-"+String(15+i).padStart(2,"0");
      if(!data.some(e=>e.dateIso===iso)) emptyDays.push(formatShortDate(iso));
    }

    const overloaded=data.reduce((acc,e)=>{
      const key=e.dateIso+"|"+e.time;
      acc[key]=(acc[key]||0)+1;
      return acc;
    },{});
    const conflicts=Object.values(overloaded).filter(n=>n>=3).length;

    alerts.innerHTML =
      '<div class="jps-alert '+(emptyDays.length?'empty':'full')+'"><strong>Jours vides</strong>'+(emptyDays.length?emptyDays.join(", "):"Aucun jour totalement vide.")+'</div>'+
      '<div class="jps-alert '+(schoolCount<4?'low':'full')+'"><strong>Offre scolaires</strong>'+schoolCount+' proposition(s) identifiée(s).</div>'+
      '<div class="jps-alert '+(conflicts?'low':'full')+'"><strong>Chevauchements</strong>'+(conflicts?conflicts+" créneau(x) potentiellement surchargé(s).":"Pas de surcharge majeure détectée.")+'</div>';
  }

  function renderWeek(){
    const week=$("jps-week");
    const data=visibleEvents();
    renderStats(data);
    renderAlerts(data);
    week.innerHTML="";

    const days=[
      ["2026-06-15","Lundi"],["2026-06-16","Mardi"],["2026-06-17","Mercredi"],
      ["2026-06-18","Jeudi"],["2026-06-19","Vendredi"],["2026-06-20","Samedi"],["2026-06-21","Dimanche"]
    ];

    days.forEach(([iso,label])=>{
      const dayData=data.filter(e=>e.dateIso===iso);
      const groups=["Scolaires matin","Scolaires après-midi","Tout public soir","Tout public","Autre"];

      const col=document.createElement("section");
      col.className="jps-day";
      col.innerHTML='<div class="jps-dayhead"><div class="jps-dayname">'+label+'</div><div class="jps-daydate">'+formatShortDate(iso)+'</div></div>';

      groups.forEach(group=>{
        const evs=dayData.filter(e=>slotInfo(e)===group);
        if(!evs.length && (group==="Autre" || group==="Tout public soir")) return;

        const slot=document.createElement("div");
        slot.className="jps-slot";
        slot.innerHTML='<div class="jps-slottitle"><span>'+group+'</span><span class="jps-slotcount">'+evs.length+'</span></div><div class="jps-events"></div>';
        const wrap=slot.querySelector(".jps-events");

        if(!evs.length){
          wrap.innerHTML='<div class="jps-empty">Créneau à combler</div>';
        } else {
          evs.forEach(ev=>{
            const btn=document.createElement("button");
            btn.type="button";
            btn.className="jps-event "+ev.statusKind;
            btn.innerHTML='<span class="jps-eventtime">'+esc(ev.time)+'</span><span class="jps-eventtitle">'+esc(ev.title)+'</span><span class="jps-eventmeta">'+esc(ev.roomLabel)+" · "+esc(ev.publicTarget)+'</span>';
            btn.onclick=()=>openModal(ev);
            wrap.appendChild(btn);
          });
        }
        col.appendChild(slot);
      });
      week.appendChild(col);
    });
  }

  function renderList(){
    const list=$("jps-list");
    const data=visibleEvents();
    list.innerHTML="";
    if(!data.length){ list.innerHTML='<div class="jps-empty">Aucune proposition à afficher.</div>'; return; }

    data.forEach(ev=>{
      const item=document.createElement("div");
      item.className="jps-item "+ev.statusKind;
      item.innerHTML =
        '<div class="jps-itemtitle">'+esc(ev.title)+'</div>'+
        '<div class="jps-itemmeta">'+
          '<div><strong>Date :</strong> '+esc(formatDateFR(ev.dateIso))+'</div>'+
          '<div><strong>Heure :</strong> '+esc(ev.time)+'</div>'+
          '<div><strong>Lieu :</strong> '+esc(ev.roomLabel)+'</div>'+
          '<div><strong>Public :</strong> '+esc(ev.publicTarget || "—")+'</div>'+
        '</div>'+
        '<div class="jps-badges"><span class="jps-badge '+ev.statusKind+'">'+esc(ev.statusLabel)+'</span><span class="jps-badge jps-roomtag">'+esc(ev.roomLabel)+'</span></div>';
      item.onclick=()=>openModal(ev);
      list.appendChild(item);
    });
  }

  function refresh(){ renderWeek(); renderList(); }

  $("jps-close").onclick=closeModal;
  $("jps-modal").onclick=e=>{ if(e.target===$("jps-modal")) closeModal(); };
  root.querySelectorAll(".jps-status-filter").forEach(cb=>cb.addEventListener("change",refresh));

  fetch(CSV_URL)
    .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
    .then(text=>{
      const rows=parseCSV(text);
      const headers=rows[0] || [];
      const dataRows=rows.slice(1);

      const C_NAME=findCol(headers,["Nom et prénom","Nom"]);
      const C_DISC=findCol(headers,["Discipline / département","Discipline"]);
      const C_TITLE=findCol(headers,["Intitulé du projet","Intitule du projet","Projet"]);
      const C_TYPE=findCol(headers,["Type de proposition","Type"]);
      const C_PUBLIC=findCol(headers,["Public visé","Public"]);
      const C_DATE=findCol(headers,["Date souhaitée","Date"]);
      const C_TIME=findCol(headers,["Horaire de début","Horaire","Heure"]);
      const C_DUR=findCol(headers,["Durée estimée","Durée"]);
      const C_FLEX=findCol(headers,["Flexibilité du créneau","Flexibilité"]);
      const C_ALT=findCol(headers,["Si oui, précisez","alternatives"]);
      const C_ROOM=findCol(headers,["Lieu souhaité","Lieu"]);
      const C_CAP=findCol(headers,["Nombre estimé","spectateurs","participants"]);
      const C_TECH=findCol(headers,["Besoins techniques"]);
      const C_DESC=findCol(headers,["Description courte","programmation","communication"]);
      const C_STATUS=findCol(headers,["STATUT","Statut"]);

      if([C_TITLE,C_DATE,C_TIME,C_ROOM,C_STATUS].some(i=>i===-1)){
        throw new Error("Colonnes introuvables : vérifie Intitulé du projet, Date souhaitée, Horaire de début, Lieu souhaité et STATUT.");
      }

      allEvents=dataRows.map(row=>{
        const dateIso=parseDateFR(row[C_DATE]);
        if(!dateIso || dateIso < START_DATE || dateIso > END_DATE) return null;
        const status=statusInfo(row[C_STATUS]);
        const room=roomInfo(row[C_ROOM]);

        return {
          name:C_NAME!==-1 ? row[C_NAME] : "",
          discipline:C_DISC!==-1 ? row[C_DISC] : "",
          title:row[C_TITLE] || "Projet sans titre",
          type:C_TYPE!==-1 ? row[C_TYPE] : "",
          publicTarget:C_PUBLIC!==-1 ? row[C_PUBLIC] : "",
          dateIso,
          time:formatTime(row[C_TIME]),
          duration:C_DUR!==-1 ? row[C_DUR] : "",
          flexibility:C_FLEX!==-1 ? row[C_FLEX] : "",
          alternatives:C_ALT!==-1 ? row[C_ALT] : "",
          roomLabel:room.label,
          roomCapacity:room.capacity,
          estimatedCapacity:C_CAP!==-1 ? row[C_CAP] : "",
          tech:C_TECH!==-1 ? row[C_TECH] : "",
          description:C_DESC!==-1 ? row[C_DESC] : "",
          statusKind:status.kind,
          statusLabel:status.label
        };
      }).filter(Boolean);

      refresh();

      if(!allEvents.length){
        $("jps-error").textContent="Aucune proposition trouvée entre le 15 et le 21 juin 2026.";
      }
    })
    .catch(err=>{
      $("jps-error").textContent="Erreur lors du chargement : "+err.message;
    });
});
