document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("semainejps-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnEUKc0wpQrmGOXO4b_k8oOVoHhrCSzX_VbXqA1zSYWUOMWQbiy6_tzwPCALDsSY7swWLLweOOjpRM/pub?gid=1329408426&single=true&output=csv";

  const DAYS = [
    { iso: "2026-06-15", name: "Lundi", short: "15/06" },
    { iso: "2026-06-16", name: "Mardi", short: "16/06" },
    { iso: "2026-06-17", name: "Mercredi", short: "17/06" },
    { iso: "2026-06-18", name: "Jeudi", short: "18/06" },
    { iso: "2026-06-19", name: "Vendredi", short: "19/06" },
    { iso: "2026-06-20", name: "Samedi", short: "20/06" },
    { iso: "2026-06-21", name: "Dimanche", short: "21/06" }
  ];

  const ROOMS = [
    { key: "auditorium", label: "Auditorium", capacity: "200 places" },
    { key: "orchestre", label: "Salle d’orchestre", capacity: "40 places" },
    { key: "chant", label: "Salle de chant", capacity: "40 places" },
    { key: "danse", label: "Studio danse", capacity: "40 places" },
    { key: "theatre", label: "Studio théâtre", capacity: "40 places" },
    { key: "exterieur", label: "Extérieur", capacity: "" },
    { key: "autre", label: "Autre / à définir", capacity: "" }
  ];

  const MOMENTS = [
    { key: "journee", label: "Journée entière" },
    { key: "matin", label: "Matin" },
    { key: "apresmidi", label: "Après-midi" },
    { key: "soir", label: "Soirée" }
  ];

  root.innerHTML = `
    <style>
      #semainejps-calendar{
        --jps-text:#111827;
        --jps-muted:#64748b;
        --jps-border:#e5e7eb;
        --jps-soft:#f8fafc;
        --jps-green:#16a34a;
        --jps-orange:#f59e0b;
        --jps-blue:#60a5fa;
        --jps-red:#dc2626;
        --jps-purple:#7c3aed;
        --jps-dark:#334155;
        font-family:Arial,sans-serif;
        color:var(--jps-text);
        width:100%;
      }

      #semainejps-calendar *{box-sizing:border-box}

      #semainejps-calendar .jps-card{
        max-width:1500px;
        margin:0 auto;
        background:#fff;
        border:1px solid var(--jps-border);
        border-radius:24px;
        box-shadow:0 18px 50px rgba(15,23,42,.08);
        overflow:hidden;
      }

      #semainejps-calendar .jps-header{
        padding:32px;
        background:
          radial-gradient(circle at top right,rgba(96,165,250,.18),transparent 30%),
          radial-gradient(circle at top left,rgba(22,163,74,.13),transparent 28%),
          #fff;
        border-bottom:1px solid var(--jps-border);
      }

      #semainejps-calendar .jps-header-grid{
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        gap:24px;
        align-items:start;
      }

      #semainejps-calendar h2{
        margin:0;
        font-size:clamp(28px,4vw,46px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #semainejps-calendar .jps-sub{
        margin:10px 0 0;
        color:var(--jps-muted);
        font-size:16px;
        line-height:1.5;
        max-width:900px;
      }

      #semainejps-calendar .jps-filters{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      #semainejps-calendar .jps-filter{
        border:1px solid #d1d5db;
        background:#fff;
        border-radius:999px;
        padding:10px 14px;
        font-size:14px;
        font-weight:800;
        cursor:pointer;
        white-space:nowrap;
      }

      #semainejps-calendar .jps-filter input{
        margin-right:6px;
        transform:translateY(1px);
      }

      #semainejps-calendar .jps-legend{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:20px;
      }

      #semainejps-calendar .jps-pill{
        display:inline-flex;
        align-items:center;
        gap:8px;
        border:1px solid var(--jps-border);
        background:#fff;
        border-radius:999px;
        padding:8px 12px;
        font-size:13px;
        font-weight:800;
        color:#374151;
      }

      #semainejps-calendar .jps-dot{
        width:11px;
        height:11px;
        border-radius:50%;
        display:inline-block;
      }

      #semainejps-calendar .jps-dot.accepted{background:var(--jps-green)}
      #semainejps-calendar .jps-dot.pending{background:var(--jps-orange)}
      #semainejps-calendar .jps-dot.move{background:var(--jps-blue)}
      #semainejps-calendar .jps-dot.refused{background:var(--jps-red)}
      #semainejps-calendar .jps-dot.allday{background:var(--jps-purple)}

      #semainejps-calendar .jps-content{padding:24px}

      #semainejps-calendar .jps-stats{
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:12px;
        margin-bottom:22px;
      }

      #semainejps-calendar .jps-stat{
        border:1px solid var(--jps-border);
        border-radius:18px;
        padding:16px;
        background:#fff;
      }

      #semainejps-calendar .jps-statnum{
        font-size:28px;
        font-weight:900;
        line-height:1;
      }

      #semainejps-calendar .jps-statlabel{
        margin-top:6px;
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
      }

      #semainejps-calendar .jps-alerts{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:10px;
        margin-bottom:20px;
      }

      #semainejps-calendar .jps-alert{
        border:1px solid var(--jps-border);
        border-radius:16px;
        padding:13px;
        background:#f9fafb;
        font-size:13px;
        line-height:1.35;
      }

      #semainejps-calendar .jps-alert strong{
        display:block;
        margin-bottom:4px;
      }

      #semainejps-calendar .jps-alert.empty{
        background:#fff1f2;
        border-color:#fecaca;
      }

      #semainejps-calendar .jps-alert.low{
        background:#fff7ed;
        border-color:#fed7aa;
      }

      #semainejps-calendar .jps-alert.ok{
        background:#eff6ff;
        border-color:#bfdbfe;
      }

      #semainejps-calendar .jps-titlebar{
        display:flex;
        justify-content:space-between;
        align-items:baseline;
        gap:12px;
        margin:0 0 16px;
      }

      #semainejps-calendar .jps-titlebar h3{
        margin:0;
        font-size:24px;
        font-weight:900;
        letter-spacing:-.02em;
      }

      #semainejps-calendar .jps-count{
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
        white-space:nowrap;
      }

      #semainejps-calendar .jps-week{
        display:grid;
        grid-template-columns:repeat(7,minmax(0,1fr));
        gap:14px;
      }

      #semainejps-calendar .jps-day{
        min-width:0;
        border:1px solid #e7eaee;
        border-radius:22px;
        overflow:hidden;
        background:#fbfcfd;
      }

      #semainejps-calendar .jps-dayhead{
        padding:15px;
        background:#fff;
        border-bottom:1px solid var(--jps-border);
      }

      #semainejps-calendar .jps-dayname{
        font-weight:900;
        font-size:15px;
        text-transform:uppercase;
        letter-spacing:.03em;
      }

      #semainejps-calendar .jps-daydate{
        margin-top:3px;
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
      }

      #semainejps-calendar .jps-daybody{
        padding:12px;
        display:flex;
        flex-direction:column;
        gap:12px;
      }

      #semainejps-calendar .jps-moment{
        border:1px solid #e8edf3;
        border-radius:18px;
        background:#fff;
        overflow:hidden;
      }

      #semainejps-calendar .jps-momenthead{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
        padding:10px 12px;
        background:#f8fafc;
        border-bottom:1px solid #edf0f3;
      }

      #semainejps-calendar .jps-momenttitle{
        font-size:12px;
        font-weight:900;
        color:#334155;
        text-transform:uppercase;
        letter-spacing:.03em;
      }

      #semainejps-calendar .jps-momentcount{
        background:#e2e8f0;
        color:#334155;
        border-radius:999px;
        padding:2px 7px;
        font-size:11px;
        font-weight:900;
      }

      #semainejps-calendar .jps-roomlist{
        padding:10px;
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      #semainejps-calendar .jps-room{
        border:1px solid #edf0f3;
        border-radius:14px;
        background:#fff;
        overflow:hidden;
      }

      #semainejps-calendar .jps-roomhead{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
        padding:8px 10px;
        background:#f8fafc;
        border-bottom:1px solid #edf0f3;
      }

      #semainejps-calendar .jps-roomname{
        font-size:12px;
        font-weight:900;
        color:#334155;
      }

      #semainejps-calendar .jps-capacity{
        font-size:11px;
        font-weight:800;
        color:#64748b;
      }

      #semainejps-calendar .jps-roomevents{
        padding:8px;
        display:flex;
        flex-direction:column;
        gap:7px;
      }

      #semainejps-calendar .jps-empty{
        border:1px dashed #d1d5db;
        border-radius:12px;
        padding:9px;
        color:var(--jps-muted);
        font-size:12px;
        font-style:italic;
        background:#fff;
      }

      #semainejps-calendar .jps-event{
        border:0;
        width:100%;
        text-align:left;
        cursor:pointer;
        border-radius:14px;
        padding:10px;
        background:var(--status-color);
        color:#fff;
        box-shadow:0 8px 18px rgba(15,23,42,.11);
      }

      #semainejps-calendar .jps-event:hover{
        transform:translateY(-1px);
      }

      #semainejps-calendar .jps-event.accepted{--status-color:var(--jps-green)}
      #semainejps-calendar .jps-event.pending{--status-color:var(--jps-orange);color:#111827}
      #semainejps-calendar .jps-event.move{--status-color:var(--jps-blue);color:#0f172a}
      #semainejps-calendar .jps-event.refused{--status-color:var(--jps-red)}
      #semainejps-calendar .jps-event.allday{
        box-shadow:0 0 0 2px rgba(124,58,237,.18),0 8px 18px rgba(15,23,42,.11);
      }

      #semainejps-calendar .jps-eventtop{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
        margin-bottom:5px;
      }

      #semainejps-calendar .jps-time{
        font-size:12px;
        font-weight:900;
      }

      #semainejps-calendar .jps-alldaytag{
        font-size:10px;
        font-weight:900;
        border-radius:999px;
        padding:3px 6px;
        background:rgba(255,255,255,.35);
        white-space:nowrap;
      }

      #semainejps-calendar .jps-event.pending .jps-alldaytag,
      #semainejps-calendar .jps-event.move .jps-alldaytag{
        background:rgba(255,255,255,.55);
      }

      #semainejps-calendar .jps-eventtitle{
        display:block;
        font-size:13px;
        font-weight:900;
        line-height:1.24;
      }

      #semainejps-calendar .jps-eventmeta{
        display:block;
        margin-top:6px;
        font-size:12px;
        line-height:1.32;
        opacity:.92;
      }

      #semainejps-calendar .jps-error{
        margin-top:16px;
        color:#b91c1c;
        font-weight:800;
        white-space:pre-wrap;
      }

      #semainejps-calendar .jps-modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:9999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #semainejps-calendar .jps-modal.open{
        display:flex;
      }

      #semainejps-calendar .jps-modalbox{
        width:min(780px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #semainejps-calendar .jps-close{
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #semainejps-calendar .jps-modaltitle{
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.15;
        font-weight:900;
      }

      #semainejps-calendar .jps-row{
        display:grid;
        grid-template-columns:170px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #semainejps-calendar .jps-row:last-child{
        border-bottom:0;
      }

      #semainejps-calendar .jps-label{
        font-weight:900;
      }

      @media(max-width:1300px){
        #semainejps-calendar .jps-week{
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
      }

      @media(max-width:760px){
        #semainejps-calendar .jps-header,
        #semainejps-calendar .jps-content{
          padding:18px;
        }

        #semainejps-calendar .jps-header-grid{
          grid-template-columns:1fr;
        }

        #semainejps-calendar .jps-filters{
          justify-content:flex-start;
        }

        #semainejps-calendar .jps-filter{
          width:100%;
          text-align:left;
        }

        #semainejps-calendar .jps-stats{
          grid-template-columns:1fr 1fr;
        }

        #semainejps-calendar .jps-alerts{
          grid-template-columns:1fr;
        }

        #semainejps-calendar .jps-week{
          grid-template-columns:1fr;
        }

        #semainejps-calendar .jps-row{
          grid-template-columns:1fr;
          gap:4px;
        }
      }
    </style>

    <div class="jps-card">
      <div class="jps-header">
        <div class="jps-header-grid">
          <div>
            <h2>Semaine JPS 2026</h2>
            <p class="jps-sub">
              Tableau de pilotage des propositions pour la semaine inaugurale du 15 au 21 juin 2026.
              Les actions sont organisées par jour, moment de la journée et lieu afin de mieux visualiser les parallèles, les trous et les surcharges.
            </p>
          </div>

          <div class="jps-filters">
            <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="accepted" checked> Accepté</label>
            <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="pending" checked> En attente</label>
            <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="move" checked> À déplacer</label>
            <label class="jps-filter"><input type="checkbox" class="jps-status-filter" value="refused" checked> Refusé</label>
          </div>
        </div>

        <div class="jps-legend">
          <span class="jps-pill"><span class="jps-dot accepted"></span>Accepté</span>
          <span class="jps-pill"><span class="jps-dot pending"></span>En attente</span>
          <span class="jps-pill"><span class="jps-dot move"></span>À déplacer</span>
          <span class="jps-pill"><span class="jps-dot refused"></span>Refusé</span>
          <span class="jps-pill"><span class="jps-dot allday"></span>Journée entière</span>
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

        <div id="jps-alerts" class="jps-alerts"></div>

        <div class="jps-titlebar">
          <h3>Vue semaine par lieux</h3>
          <div id="jps-count" class="jps-count"></div>
        </div>

        <div id="jps-week" class="jps-week"></div>
        <div id="jps-error" class="jps-error"></div>
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
        <div class="jps-row"><span class="jps-label">Capacité salle</span><span id="jps-m-room-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Jauge estimée</span><span id="jps-m-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Créneaux courts possibles</span><span id="jps-m-bookable"></span></div>
        <div class="jps-row"><span class="jps-label">Flexibilité</span><span id="jps-m-flex"></span></div>
        <div class="jps-row"><span class="jps-label">Alternatives</span><span id="jps-m-alt"></span></div>
        <div class="jps-row"><span class="jps-label">Technique</span><span id="jps-m-tech"></span></div>
        <div class="jps-row"><span class="jps-label">Description</span><span id="jps-m-desc"></span></div>
        <div class="jps-row"><span class="jps-label">Statut</span><span id="jps-m-status"></span></div>
      </div>
    </div>
  `;

  let allEvents = [];

  function $(id) {
    return document.getElementById(id);
  }

  function norm(v) {
    return (v || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseCSVLine(line) {
    const res = [];
    let cur = "";
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];

      if (ch === '"') {
        if (quoted && next === '"') {
          cur += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === "," && !quoted) {
        res.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }

    res.push(cur);
    return res;
  }

  function parseCSV(text) {
    return text.replace(/\r/g, "").trim().split("\n").map(parseCSVLine);
  }

  function findCol(headers, possibilities) {
    const hs = headers.map(norm);

    for (const p of possibilities) {
      const n = norm(p);
      const exact = hs.findIndex(h => h === n);
      if (exact !== -1) return exact;
    }

    for (const p of possibilities) {
      const n = norm(p);
      const partial = hs.findIndex(h => h.includes(n));
      if (partial !== -1) return partial;
    }

    return -1;
  }

  function parseDateFR(v) {
    if (!v) return null;

    const txt = v.toString().trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

    const parts = txt.split(/[\/.-]/);
    if (parts.length !== 3) return null;

    let d = parts[0];
    let m = parts[1];
    let y = parts[2];

    if (y.length === 2) y = "20" + y;

    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function safeDate(iso) {
    if (!iso) return new Date(NaN);
    const p = iso.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function formatDateFR(iso) {
    const d = safeDate(iso);
    if (isNaN(d.getTime())) return "Date invalide";
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function formatTime(v) {
    if (!v) return "Non précisée";
    return v.toString().trim().slice(0, 5);
  }

  function statusInfo(v) {
    const s = norm(v);

    if (s.includes("deplacer")) return { kind: "move", label: "À déplacer" };
    if (s.includes("refuse")) return { kind: "refused", label: "Refusé" };
    if (s.includes("accepte")) return { kind: "accepted", label: "Accepté" };

    return { kind: "pending", label: "En attente" };
  }

  function isAllDay(v) {
    const s = norm(v);
    return s.includes("journee entiere") || s.includes("toute la journee");
  }

  function roomInfo(v) {
    const s = norm(v);

    if (s.includes("auditorium")) return { key: "auditorium", label: "Auditorium", capacity: "200 places" };
    if (s.includes("orchestre")) return { key: "orchestre", label: "Salle d’orchestre", capacity: "40 places" };
    if (s.includes("chant")) return { key: "chant", label: "Salle de chant", capacity: "40 places" };
    if (s.includes("danse")) return { key: "danse", label: "Studio danse", capacity: "40 places" };
    if (s.includes("theatre") || s.includes("théâtre")) return { key: "theatre", label: "Studio théâtre", capacity: "40 places" };
    if (s.includes("exterieur") || s.includes("extérieur")) return { key: "exterieur", label: "Extérieur", capacity: "" };

    return { key: "autre", label: v || "Autre / à définir", capacity: "" };
  }

  function momentFromEvent(ev) {
    if (ev.allDay) return "journee";

    const h = parseInt((ev.time || "00:00").slice(0, 2), 10);

    if (isNaN(h)) return "apresmidi";
    if (h < 12) return "matin";
    if (h < 17) return "apresmidi";
    return "soir";
  }

  function selectedStatuses() {
    return Array.from(root.querySelectorAll(".jps-status-filter"))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function visibleEvents() {
    const selected = selectedStatuses();

    return allEvents
      .filter(e => selected.includes(e.statusKind))
      .sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        return String(a.time).localeCompare(String(b.time));
      });
  }

  function openModal(ev) {
    $("jps-m-title").textContent = ev.title;
    $("jps-m-name").textContent = ev.name || "—";
    $("jps-m-discipline").textContent = ev.discipline || "—";
    $("jps-m-type").textContent = ev.type || "—";
    $("jps-m-public").textContent = ev.publicTarget || "—";
    $("jps-m-date").textContent = formatDateFR(ev.dateIso);
    $("jps-m-time").textContent = ev.allDay ? "Journée entière" : (ev.time || "—");
    $("jps-m-duration").textContent = ev.duration || "—";
    $("jps-m-room").textContent = ev.roomLabel || "—";
    $("jps-m-room-capacity").textContent = ev.roomCapacity || "À définir";
    $("jps-m-capacity").textContent = ev.estimatedCapacity || "—";
    $("jps-m-bookable").textContent = ev.allDay ? "Oui — pourra être découpé plus tard en créneaux de 30 ou 45 minutes pour les établissements." : "Non renseigné";
    $("jps-m-flex").textContent = ev.flexibility || "—";
    $("jps-m-alt").textContent = ev.alternatives || "—";
    $("jps-m-tech").textContent = ev.tech || "—";
    $("jps-m-desc").textContent = ev.description || "—";
    $("jps-m-status").textContent = ev.statusLabel || "—";
    $("jps-modal").classList.add("open");
  }

  function closeModal() {
    $("jps-modal").classList.remove("open");
  }

  function renderStats(data) {
    $("jps-total").textContent = data.length;
    $("jps-accepted").textContent = data.filter(e => e.statusKind === "accepted").length;
    $("jps-pending").textContent = data.filter(e => e.statusKind === "pending").length;
    $("jps-move").textContent = data.filter(e => e.statusKind === "move").length;
    $("jps-refused").textContent = data.filter(e => e.statusKind === "refused").length;
    $("jps-count").textContent = data.length > 1 ? data.length + " propositions" : data.length + " proposition";
  }

  function renderAlerts(data) {
    const emptyDays = DAYS
      .filter(day => !data.some(e => e.dateIso === day.iso))
      .map(day => day.name + " " + day.short);

    const schoolDays = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
    const schoolCount = data.filter(e => schoolDays.includes(e.dateIso) && norm(e.publicTarget).includes("scolaire")).length;

    const overload = {};
    data.forEach(e => {
      if (e.allDay) return;
      const key = e.dateIso + "|" + e.time + "|" + e.roomKey;
      overload[key] = (overload[key] || 0) + 1;
    });

    const conflicts = Object.values(overload).filter(n => n > 1).length;
    const allDayCount = data.filter(e => e.allDay).length;

    $("jps-alerts").innerHTML =
      '<div class="jps-alert ' + (emptyDays.length ? "empty" : "ok") + '"><strong>Jours sans proposition</strong>' +
      (emptyDays.length ? esc(emptyDays.join(", ")) : "Aucun jour totalement vide.") +
      '</div>' +
      '<div class="jps-alert ' + (schoolCount < 4 ? "low" : "ok") + '"><strong>Offre scolaires</strong>' +
      schoolCount + ' proposition(s) identifiée(s) sur les jours scolaires.</div>' +
      '<div class="jps-alert ' + (conflicts ? "low" : "ok") + '"><strong>Parallèles / conflits</strong>' +
      (conflicts ? conflicts + ' chevauchement(s) dans une même salle.' : "Les événements parallèles sont lisibles par lieu.") +
      '<br>Journée entière : ' + allDayCount + '</div>';
  }

  function renderEvent(ev) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jps-event " + ev.statusKind + (ev.allDay ? " allday" : "");

    btn.innerHTML =
      '<span class="jps-eventtop">' +
        '<span class="jps-time">' + esc(ev.allDay ? "Journée entière" : ev.time) + '</span>' +
        (ev.allDay ? '<span class="jps-alldaytag">créneaux courts possibles</span>' : '') +
      '</span>' +
      '<span class="jps-eventtitle">' + esc(ev.title) + '</span>' +
      '<span class="jps-eventmeta">' + esc(ev.publicTarget || "Public à préciser") + '</span>';

    btn.onclick = () => openModal(ev);
    return btn;
  }

  function renderWeek() {
    const data = visibleEvents();

    renderStats(data);
    renderAlerts(data);

    const week = $("jps-week");
    week.innerHTML = "";

    DAYS.forEach(day => {
      const dayEvents = data.filter(e => e.dateIso === day.iso);

      const dayBox = document.createElement("section");
      dayBox.className = "jps-day";

      dayBox.innerHTML =
        '<div class="jps-dayhead">' +
          '<div class="jps-dayname">' + esc(day.name) + '</div>' +
          '<div class="jps-daydate">' + esc(day.short) + '</div>' +
        '</div>' +
        '<div class="jps-daybody"></div>';

      const body = dayBox.querySelector(".jps-daybody");

      MOMENTS.forEach(moment => {
        const momentEvents = dayEvents.filter(e => momentFromEvent(e) === moment.key);

        const momentBox = document.createElement("div");
        momentBox.className = "jps-moment";

        momentBox.innerHTML =
          '<div class="jps-momenthead">' +
            '<span class="jps-momenttitle">' + esc(moment.label) + '</span>' +
            '<span class="jps-momentcount">' + momentEvents.length + '</span>' +
          '</div>' +
          '<div class="jps-roomlist"></div>';

        const roomList = momentBox.querySelector(".jps-roomlist");

        if (!momentEvents.length) {
          roomList.innerHTML = '<div class="jps-empty">Créneau à combler</div>';
        } else {
          ROOMS.forEach(room => {
            const roomEvents = momentEvents.filter(e => e.roomKey === room.key);
            if (!roomEvents.length) return;

            const roomBox = document.createElement("div");
            roomBox.className = "jps-room";

            roomBox.innerHTML =
              '<div class="jps-roomhead">' +
                '<span class="jps-roomname">' + esc(room.label) + '</span>' +
                '<span class="jps-capacity">' + esc(room.capacity || "capacité à préciser") + '</span>' +
              '</div>' +
              '<div class="jps-roomevents"></div>';

            const eventWrap = roomBox.querySelector(".jps-roomevents");
            roomEvents.forEach(ev => eventWrap.appendChild(renderEvent(ev)));
            roomList.appendChild(roomBox);
          });
        }

        body.appendChild(momentBox);
      });

      week.appendChild(dayBox);
    });
  }

  function refresh() {
    renderWeek();
  }

  $("jps-close").onclick = closeModal;
  $("jps-modal").onclick = function (e) {
    if (e.target === $("jps-modal")) closeModal();
  };

  root.querySelectorAll(".jps-status-filter").forEach(cb => {
    cb.addEventListener("change", refresh);
  });

  fetch(CSV_URL)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(text => {
      const rows = parseCSV(text);
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);

      const C_NAME = findCol(headers, ["Nom et prénom", "Nom"]);
      const C_DISC = findCol(headers, ["Discipline / département", "Discipline"]);
      const C_TITLE = findCol(headers, ["Intitulé du projet", "Intitule du projet", "Projet"]);
      const C_TYPE = findCol(headers, ["Type de proposition", "Type"]);
      const C_PUBLIC = findCol(headers, ["Public visé", "Public"]);
      const C_DATE = findCol(headers, ["Date souhaitée", "Date"]);
      const C_TIME = findCol(headers, ["Horaire de début", "Horaire", "Heure"]);
      const C_DUR = findCol(headers, ["Durée estimée", "Durée"]);
      const C_FLEX = findCol(headers, ["Flexibilité du créneau", "Flexibilité"]);
      const C_ALT = findCol(headers, ["Si oui, précisez", "alternatives"]);
      const C_ROOM = findCol(headers, ["Lieu souhaité", "Lieu"]);
      const C_CAP = findCol(headers, ["Nombre estimé", "spectateurs", "participants"]);
      const C_TECH = findCol(headers, ["Besoins techniques"]);
      const C_DESC = findCol(headers, ["Description courte", "programmation", "communication"]);
      const C_STATUS = findCol(headers, ["STATUT", "Statut"]);

      if ([C_TITLE, C_DATE, C_ROOM, C_STATUS].some(i => i === -1)) {
        throw new Error("Colonnes introuvables : vérifie Intitulé du projet, Date souhaitée, Lieu souhaité et STATUT.");
      }

      allEvents = dataRows.map(row => {
        const dateIso = parseDateFR(row[C_DATE]);
        if (!dateIso || dateIso < "2026-06-15" || dateIso > "2026-06-21") return null;

        const status = statusInfo(row[C_STATUS]);
        const room = roomInfo(row[C_ROOM]);
        const duration = C_DUR !== -1 ? row[C_DUR] : "";
        const allDay = isAllDay(duration);

        return {
          name: C_NAME !== -1 ? row[C_NAME] : "",
          discipline: C_DISC !== -1 ? row[C_DISC] : "",
          title: row[C_TITLE] || "Projet sans titre",
          type: C_TYPE !== -1 ? row[C_TYPE] : "",
          publicTarget: C_PUBLIC !== -1 ? row[C_PUBLIC] : "",
          dateIso: dateIso,
          time: allDay ? "Journée entière" : (C_TIME !== -1 ? formatTime(row[C_TIME]) : "Non précisée"),
          duration: duration,
          allDay: allDay,
          flexibility: C_FLEX !== -1 ? row[C_FLEX] : "",
          alternatives: C_ALT !== -1 ? row[C_ALT] : "",
          roomKey: room.key,
          roomLabel: room.label,
          roomCapacity: room.capacity,
          estimatedCapacity: C_CAP !== -1 ? row[C_CAP] : "",
          tech: C_TECH !== -1 ? row[C_TECH] : "",
          description: C_DESC !== -1 ? row[C_DESC] : "",
          statusKind: status.kind,
          statusLabel: status.label
        };
      }).filter(Boolean);

      refresh();

      if (!allEvents.length) {
        $("jps-error").textContent = "Aucune proposition trouvée entre le 15 et le 21 juin 2026.";
      }
    })
    .catch(err => {
      $("jps-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
