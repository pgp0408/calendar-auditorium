document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("semainejps-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";

  const DAYS = [
    { iso: "2026-06-15", name: "Lundi", short: "15/06", group: "school" },
    { iso: "2026-06-16", name: "Mardi", short: "16/06", group: "school" },
    { iso: "2026-06-17", name: "Mercredi", short: "17/06", group: "public" },
    { iso: "2026-06-18", name: "Jeudi", short: "18/06", group: "school" },
    { iso: "2026-06-19", name: "Vendredi", short: "19/06", group: "school" },
    { iso: "2026-06-20", name: "Samedi", short: "20/06", group: "public" },
    { iso: "2026-06-21", name: "Dimanche", short: "21/06", group: "public" }
  ];

  const ROOMS = [
    { key: "auditorium", short: "Aud.", label: "Auditorium", capacity: "200 places", fixed: true },
    { key: "orchestre", short: "Orch.", label: "Salle d’orchestre", capacity: "40 places", fixed: true },
    { key: "chant", short: "Chant", label: "Salle de chant", capacity: "40 places", fixed: true },
    { key: "choeur", short: "Chœur", label: "Salle de chœur", capacity: "40 places", fixed: true },
    { key: "theatre", short: "Théâtre", label: "Salle de théâtre", capacity: "40 places", fixed: true },
    { key: "danse1", short: "Danse 1", label: "Studio de danse 1", capacity: "40 places", fixed: true },
    { key: "danse2", short: "Danse 2", label: "Studio de danse 2", capacity: "40 places", fixed: true },
    { key: "danse3", short: "Danse 3", label: "Studio de danse 3", capacity: "40 places", fixed: true },
    { key: "other", short: "Autre", label: "Autre espace / salle précisée", capacity: "selon fiche", fixed: true },
    { key: "any", short: "À arbitrer", label: "À arbitrer", capacity: "à affecter", fixed: false }
  ];

  const OTHER_SPACE_HINTS = [
    "salle numérotée",
    "numéro de salle",
    "patio",
    "hall",
    "extérieur",
    "espace d’accueil",
    "couloir",
    "foyer",
    "parvis",
    "autre localisation dans le Conservatoire"
  ];

  const SCHOOL_MOMENTS = [
    { key: "matin", label: "Matin", period: "08h30–12h00" },
    { key: "apresmidi", label: "Après-midi", period: "13h00–17h00" }
  ];

  const PUBLIC_MOMENTS = [
    { key: "matin", label: "Matin" },
    { key: "apresmidi", label: "Après-midi" },
    { key: "soir", label: "Soirée" }
  ];

  const AUTO_DAYS_BASE = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
  const AUTO_SLOTS = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
    ["16:00", "17:00"]
  ];

  const TIME_SLOTS = buildTimeSlots("08:30", "21:00", 30);

  root.innerHTML = `
    <style>
      #semainejps-calendar{
        --jps-text:#111827; --jps-muted:#64748b; --jps-border:#e5e7eb;
        --jps-green:#16a34a; --jps-orange:#f59e0b; --jps-blue:#60a5fa;
        --jps-red:#dc2626; --jps-purple:#7c3aed;
        font-family:Arial,sans-serif; color:var(--jps-text); width:100%;
      }
      #semainejps-calendar *{box-sizing:border-box}
      #semainejps-calendar .jps-card{max-width:1450px;margin:0 auto;background:#fff;border:1px solid var(--jps-border);border-radius:24px;box-shadow:0 18px 50px rgba(15,23,42,.08);overflow:hidden}
      #semainejps-calendar .jps-header{padding:32px;background:radial-gradient(circle at top right,rgba(96,165,250,.18),transparent 30%),radial-gradient(circle at top left,rgba(22,163,74,.13),transparent 28%),#fff;border-bottom:1px solid var(--jps-border)}
      #semainejps-calendar .jps-header-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:start}
      #semainejps-calendar h2{margin:0;font-size:clamp(28px,4vw,46px);line-height:1.05;letter-spacing:-.04em}
      #semainejps-calendar .jps-sub{margin:10px 0 0;color:var(--jps-muted);font-size:16px;line-height:1.5;max-width:940px}
      #semainejps-calendar .jps-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      #semainejps-calendar .jps-filter{border:1px solid #d1d5db;background:#fff;border-radius:999px;padding:10px 14px;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap}
      #semainejps-calendar .jps-filter input{margin-right:6px;transform:translateY(1px)}
      #semainejps-calendar .jps-legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
      #semainejps-calendar .jps-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--jps-border);background:#fff;border-radius:999px;padding:8px 12px;font-size:13px;font-weight:800;color:#374151}
      #semainejps-calendar .jps-dot{width:11px;height:11px;border-radius:50%;display:inline-block}
      #semainejps-calendar .jps-dot.accepted{background:var(--jps-green)}
      #semainejps-calendar .jps-dot.pending{background:var(--jps-orange)}
      #semainejps-calendar .jps-dot.move{background:var(--jps-blue)}
      #semainejps-calendar .jps-dot.refused{background:var(--jps-red)}
      #semainejps-calendar .jps-dot.auto{background:var(--jps-purple)}
      #semainejps-calendar .jps-content{padding:24px}
      #semainejps-calendar .jps-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:22px}
      #semainejps-calendar .jps-stat{border:1px solid var(--jps-border);border-radius:18px;padding:16px;background:#fff}
      #semainejps-calendar .jps-statnum{font-size:28px;font-weight:900;line-height:1}
      #semainejps-calendar .jps-statlabel{margin-top:6px;color:var(--jps-muted);font-size:13px;font-weight:800}
      #semainejps-calendar .jps-alerts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:24px}
      #semainejps-calendar .jps-alert{border:1px solid var(--jps-border);border-radius:16px;padding:13px;background:#f9fafb;font-size:13px;line-height:1.35;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
      #semainejps-calendar .jps-alert:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,23,42,.09)}
      #semainejps-calendar .jps-alert strong{display:block;margin-bottom:4px}
      #semainejps-calendar .jps-alert.empty{background:#fff1f2;border-color:#fecaca}
      #semainejps-calendar .jps-alert.low{background:#fff7ed;border-color:#fed7aa}
      #semainejps-calendar .jps-alert.ok{background:#eff6ff;border-color:#bfdbfe}
      #semainejps-calendar .jps-section{margin-bottom:30px}
      #semainejps-calendar .jps-titlebar{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 16px}
      #semainejps-calendar .jps-titlebar h3{margin:0;font-size:24px;font-weight:900;letter-spacing:-.02em}
      #semainejps-calendar .jps-titlebar p{margin:5px 0 0;color:var(--jps-muted);font-size:14px;line-height:1.45}
      #semainejps-calendar .jps-count{color:var(--jps-muted);font-size:13px;font-weight:800;white-space:nowrap}
      #semainejps-calendar .jps-day-buttons{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
      #semainejps-calendar .jps-day-btn{appearance:none;border:1px solid #e7eaee;background:#fff;border-radius:20px;padding:18px;cursor:pointer;text-align:left;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
      #semainejps-calendar .jps-day-btn:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(15,23,42,.10);border-color:#cbd5e1}
      #semainejps-calendar .jps-day-btn-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}
      #semainejps-calendar .jps-day-btn-name{font-size:19px;font-weight:900;text-transform:uppercase;letter-spacing:-.02em}
      #semainejps-calendar .jps-day-btn-date{margin-top:2px;color:var(--jps-muted);font-size:13px;font-weight:800}
      #semainejps-calendar .jps-day-btn-count{border-radius:999px;padding:5px 9px;background:#e2e8f0;color:#334155;font-size:12px;font-weight:900;white-space:nowrap}
      #semainejps-calendar .jps-day-btn-meta{color:#475569;font-size:13px;line-height:1.45}
      #semainejps-calendar .jps-day-btn-warning{margin-top:10px;border-radius:12px;padding:9px;font-size:13px;font-weight:800;line-height:1.3}
      #semainejps-calendar .jps-day-btn-warning.empty{background:#fff1f2;color:#991b1b;border:1px solid #fecaca}
      #semainejps-calendar .jps-day-btn-warning.ok{background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe}
      #semainejps-calendar .jps-day-btn-warning.conflict{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
      #semainejps-calendar .jps-frise{display:grid;gap:12px}
      #semainejps-calendar .jps-frise.school{grid-template-columns:repeat(4,minmax(0,1fr))}
      #semainejps-calendar .jps-frise.public{grid-template-columns:repeat(3,minmax(0,1fr))}
      #semainejps-calendar .jps-frise-day{border:1px solid #e7eaee;border-radius:20px;background:#fff;overflow:hidden;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
      #semainejps-calendar .jps-frise-day:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,23,42,.09)}
      #semainejps-calendar .jps-frise-head{padding:14px;border-bottom:1px solid var(--jps-border);background:#f8fafc}
      #semainejps-calendar .jps-frise-name{font-size:16px;font-weight:900;text-transform:uppercase}
      #semainejps-calendar .jps-frise-date{margin-top:2px;font-size:13px;font-weight:800;color:var(--jps-muted)}
      #semainejps-calendar .jps-frise-body{padding:12px;display:flex;flex-direction:column;gap:9px}
      #semainejps-calendar .jps-frise-slot{border:1px solid #edf0f3;border-radius:15px;background:#fbfcfd;padding:10px}
      #semainejps-calendar .jps-frise-slothead{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
      #semainejps-calendar .jps-frise-slotname{font-size:12px;font-weight:900;text-transform:uppercase;color:#334155;letter-spacing:.03em}
      #semainejps-calendar .jps-frise-score{border-radius:999px;padding:3px 8px;font-size:11px;font-weight:900;white-space:nowrap}
      #semainejps-calendar .jps-frise-score.empty{background:#fee2e2;color:#991b1b}
      #semainejps-calendar .jps-frise-score.low{background:#ffedd5;color:#9a3412}
      #semainejps-calendar .jps-frise-score.ok{background:#dcfce7;color:#166534}
      #semainejps-calendar .jps-frise-score.full{background:#dbeafe;color:#1e40af}
      #semainejps-calendar .jps-roomchips{display:flex;flex-wrap:wrap;gap:5px}
      #semainejps-calendar .jps-roomchip{display:inline-flex;border-radius:999px;padding:4px 7px;font-size:11px;font-weight:800;background:#e2e8f0;color:#334155}
      #semainejps-calendar .jps-roomchip.empty{background:#f8fafc;color:#94a3b8;border:1px dashed #cbd5e1}
      #semainejps-calendar .jps-roomchip.accepted{background:#dcfce7;color:#166534}
      #semainejps-calendar .jps-roomchip.pending{background:#fef3c7;color:#92400e}
      #semainejps-calendar .jps-roomchip.move{background:#dbeafe;color:#1e40af}
      #semainejps-calendar .jps-roomchip.refused{background:#fee2e2;color:#991b1b}
      #semainejps-calendar .jps-roomchip.auto{background:#ede9fe;color:#5b21b6}
      #semainejps-calendar .jps-action-btn{border:0;background:#111827;color:#fff;border-radius:16px;padding:15px 18px;font-weight:900;cursor:pointer;box-shadow:0 12px 28px rgba(15,23,42,.12)}
      #semainejps-calendar .jps-error{margin-top:16px;color:#b91c1c;font-weight:800;white-space:pre-wrap}
      #semainejps-calendar .jps-modal,#semainejps-calendar .jps-day-modal,#semainejps-calendar .jps-list-modal,#semainejps-calendar .jps-alert-modal{display:none;position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;padding:20px;align-items:center;justify-content:center}
      #semainejps-calendar .jps-modal.open,#semainejps-calendar .jps-day-modal.open,#semainejps-calendar .jps-list-modal.open,#semainejps-calendar .jps-alert-modal.open{display:flex}
      #semainejps-calendar .jps-modalbox,#semainejps-calendar .jps-day-modalbox,#semainejps-calendar .jps-list-modalbox,#semainejps-calendar .jps-alert-modalbox{width:min(900px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}
      #semainejps-calendar .jps-day-modalbox{width:min(1320px,100%)}
      #semainejps-calendar .jps-list-modalbox,#semainejps-calendar .jps-alert-modalbox{width:min(1100px,100%)}
      #semainejps-calendar .jps-close,#semainejps-calendar .jps-day-close,#semainejps-calendar .jps-list-close,#semainejps-calendar .jps-alert-close{position:absolute;top:12px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer}
      #semainejps-calendar .jps-modaltitle,#semainejps-calendar .jps-day-modaltitle,#semainejps-calendar .jps-list-modaltitle,#semainejps-calendar .jps-alert-modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900}
      #semainejps-calendar .jps-day-modal-sub{margin:-8px 0 20px;color:var(--jps-muted);font-size:14px;font-weight:800}
      #semainejps-calendar .jps-timetable-wrap{overflow:auto;border:1px solid var(--jps-border);border-radius:20px;background:#fff}
      #semainejps-calendar .jps-timetable{min-width:900px;display:grid}
      #semainejps-calendar .jps-th,#semainejps-calendar .jps-hour,#semainejps-calendar .jps-cell{border-bottom:1px solid #edf0f3;border-right:1px solid #edf0f3}
      #semainejps-calendar .jps-th{position:sticky;top:0;z-index:3;background:#f8fafc;padding:12px;font-size:13px;font-weight:900;color:#334155;text-align:center}
      #semainejps-calendar .jps-hour{position:sticky;left:0;z-index:2;background:#f8fafc;padding:10px 8px;font-size:12px;font-weight:900;color:#334155;text-align:center;min-height:74px}
      #semainejps-calendar .jps-cell{min-height:74px;padding:7px;background:#fff}
      #semainejps-calendar .jps-cell.schooltime{background:#fcfffd}
      #semainejps-calendar .jps-cell.empty{background:#fbfcfd}
      #semainejps-calendar .jps-slot-empty{color:#94a3b8;font-size:11px;font-style:italic;text-align:center;padding-top:18px}
      #semainejps-calendar .jps-slot-card{border-radius:12px;padding:8px;margin-bottom:6px;background:var(--status-color);color:#fff;cursor:pointer;box-shadow:0 6px 14px rgba(15,23,42,.10)}
      #semainejps-calendar .jps-slot-card.accepted{--status-color:var(--jps-green)}
      #semainejps-calendar .jps-slot-card.pending{--status-color:var(--jps-orange);color:#111827}
      #semainejps-calendar .jps-slot-card.move{--status-color:var(--jps-blue);color:#0f172a}
      #semainejps-calendar .jps-slot-card.refused{--status-color:var(--jps-red)}
      #semainejps-calendar .jps-slot-card.auto{background:#7c3aed;color:#fff}
      #semainejps-calendar .jps-slot-time{display:block;font-size:11px;font-weight:900;margin-bottom:3px}
      #semainejps-calendar .jps-slot-title{display:block;font-size:12px;font-weight:900;line-height:1.2}
      #semainejps-calendar .jps-slot-meta{display:block;margin-top:4px;font-size:11px;opacity:.9;line-height:1.25}
      #semainejps-calendar .jps-row{display:grid;grid-template-columns:170px minmax(0,1fr);gap:14px;padding:11px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}
      #semainejps-calendar .jps-row:last-child{border-bottom:0}
      #semainejps-calendar .jps-label{font-weight:900}
      #semainejps-calendar .jps-list-date{margin:18px 0 10px;font-size:18px;font-weight:900}
      #semainejps-calendar .jps-list-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
      #semainejps-calendar .jps-list-item{border:1px solid #e7eaee;border-left:7px solid var(--status-color);border-radius:18px;padding:14px;background:#fbfbfc;cursor:pointer}
      #semainejps-calendar .jps-list-item.accepted{--status-color:var(--jps-green)}
      #semainejps-calendar .jps-list-item.pending{--status-color:var(--jps-orange)}
      #semainejps-calendar .jps-list-item.move{--status-color:var(--jps-blue)}
      #semainejps-calendar .jps-list-item.refused{--status-color:var(--jps-red)}
      #semainejps-calendar .jps-list-item-title{font-weight:900;font-size:16px;margin-bottom:8px}
      #semainejps-calendar .jps-list-item-meta{font-size:14px;line-height:1.5;color:#4b5563}
      #semainejps-calendar .jps-alert-list{display:grid;gap:10px}
      #semainejps-calendar .jps-alert-line{border:1px solid #e5e7eb;border-radius:14px;padding:12px;background:#f8fafc}
      @media(max-width:1150px){#semainejps-calendar .jps-frise.school,#semainejps-calendar .jps-frise.public{grid-template-columns:1fr}#semainejps-calendar .jps-alerts{grid-template-columns:1fr 1fr}}
      @media(max-width:760px){#semainejps-calendar .jps-header,#semainejps-calendar .jps-content{padding:18px}#semainejps-calendar .jps-header-grid{grid-template-columns:1fr}#semainejps-calendar .jps-filters{justify-content:flex-start}#semainejps-calendar .jps-filter{width:100%;text-align:left}#semainejps-calendar .jps-stats{grid-template-columns:1fr 1fr}#semainejps-calendar .jps-alerts{grid-template-columns:1fr}#semainejps-calendar .jps-titlebar{flex-direction:column;align-items:flex-start}#semainejps-calendar .jps-row{grid-template-columns:1fr;gap:4px}#semainejps-calendar .jps-modal,#semainejps-calendar .jps-day-modal,#semainejps-calendar .jps-list-modal,#semainejps-calendar .jps-alert-modal{padding:10px}#semainejps-calendar .jps-modalbox,#semainejps-calendar .jps-day-modalbox,#semainejps-calendar .jps-list-modalbox,#semainejps-calendar .jps-alert-modalbox{padding:20px;border-radius:20px}}
    </style>

    <div class="jps-card">
      <div class="jps-header">
        <div class="jps-header-grid">
          <div>
            <h2>Semaine JPS 2026</h2>
            <p class="jps-sub">V17 — version interne avec colonnes fixes par salles stratégiques et colonne “Autre espace / salle précisée”.</p>
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
          <span class="jps-pill"><span class="jps-dot auto"></span>Programmation automatique</span>
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

        <section class="jps-section">
          <div class="jps-titlebar">
            <div><h3>Explorer une journée</h3><p>Cliquez sur un jour pour ouvrir le planning détaillé par heure et par salle.</p></div>
            <div id="jps-count" class="jps-count"></div>
          </div>
          <div id="jps-day-buttons" class="jps-day-buttons"></div>
          <div id="jps-error" class="jps-error"></div>
        </section>

        <section class="jps-section">
          <div class="jps-titlebar">
            <div><h3>Frise temps scolaire réel</h3><p>Lundi, mardi, jeudi et vendredi : uniquement 08h30–12h00 et 13h00–17h00. Cliquez sur un jour pour ouvrir le planning complet.</p></div>
            <div id="jps-school-count" class="jps-count"></div>
          </div>
          <div id="jps-school-frise" class="jps-frise school"></div>
        </section>

        <section class="jps-section">
          <div class="jps-titlebar">
            <div><h3>Frise mercredi / samedi / dimanche</h3><p>Lecture synthétique des journées tout public.</p></div>
            <div id="jps-public-count" class="jps-count"></div>
          </div>
          <div id="jps-public-frise" class="jps-frise public"></div>
        </section>

        <section class="jps-section"><button type="button" id="jps-open-list" class="jps-action-btn">Voir les propositions détaillées</button></section>
      </div>
    </div>

    <div id="jps-day-modal" class="jps-day-modal"><div class="jps-day-modalbox"><button type="button" id="jps-day-close" class="jps-day-close">&times;</button><h3 id="jps-day-modal-title" class="jps-day-modaltitle"></h3><div id="jps-day-modal-sub" class="jps-day-modal-sub"></div><div id="jps-day-detail"></div></div></div>
    <div id="jps-list-modal" class="jps-list-modal"><div class="jps-list-modalbox"><button type="button" id="jps-list-close" class="jps-list-close">&times;</button><h3 class="jps-list-modaltitle">Propositions détaillées</h3><div id="jps-list-content"></div></div></div>
    <div id="jps-alert-modal" class="jps-alert-modal"><div class="jps-alert-modalbox"><button type="button" id="jps-alert-close" class="jps-alert-close">&times;</button><h3 id="jps-alert-title" class="jps-alert-modaltitle"></h3><div id="jps-alert-content"></div></div></div>

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
        <div class="jps-row"><span class="jps-label">Format CRD</span><span id="jps-m-crd-format"></span></div>
        <div class="jps-row"><span class="jps-label">Pôle CRD</span><span id="jps-m-crd-pole"></span></div>
        <div class="jps-row"><span class="jps-label">Lieu</span><span id="jps-m-room"></span></div>
        <div class="jps-row"><span class="jps-label">Capacité salle</span><span id="jps-m-room-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Jauge estimée</span><span id="jps-m-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Programmation auto</span><span id="jps-m-auto"></span></div>
        <div class="jps-row"><span class="jps-label">Flexibilité</span><span id="jps-m-flex"></span></div>
        <div class="jps-row"><span class="jps-label">Alternatives</span><span id="jps-m-alt"></span></div>
        <div class="jps-row"><span class="jps-label">Technique</span><span id="jps-m-tech"></span></div>
        <div class="jps-row"><span class="jps-label">Description</span><span id="jps-m-desc"></span></div>
        <div class="jps-row"><span class="jps-label">Statut</span><span id="jps-m-status"></span></div>
      </div>
    </div>
  `;

  let allEvents = [];
  let lastAlertData = {};

  function $(id){ return document.getElementById(id); }
  function norm(v){ return (v || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
  function esc(s){ return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function parseCSVLine(line){ const res=[]; let cur=""; let quoted=false; for(let i=0;i<line.length;i++){ const ch=line[i], next=line[i+1]; if(ch==='"'){ if(quoted && next==='"'){ cur+='"'; i++; } else quoted=!quoted; } else if(ch==="," && !quoted){ res.push(cur); cur=""; } else cur+=ch; } res.push(cur); return res; }
  function parseCSV(text){ const clean=text.replace(/\r/g,"").trim(); return clean ? clean.split("\n").map(parseCSVLine) : []; }
  function findCol(headers, possibilities){ const hs=headers.map(norm); for(const p of possibilities){ const n=norm(p); const exact=hs.findIndex(h=>h===n); if(exact!==-1) return exact; } for(const p of possibilities){ const n=norm(p); const partial=hs.findIndex(h=>h.includes(n)); if(partial!==-1) return partial; } return -1; }
  function parseDateFR(v){ if(!v) return null; const txt=v.toString().trim(); if(/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt; const parts=txt.split(/[\/.-]/); if(parts.length!==3) return null; let d=parts[0], m=parts[1], y=parts[2]; if(y.length===2) y="20"+y; return y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0"); }
  function safeDate(iso){ if(!iso) return new Date(NaN); const p=iso.split("-"); return new Date(Number(p[0]), Number(p[1])-1, Number(p[2])); }
  function formatDateFR(iso){ const d=safeDate(iso); if(isNaN(d.getTime())) return "Date invalide"; return d.toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" }); }
  function formatTime(v){ if(!v) return "Non précisée"; const txt=v.toString().trim(); if(/^\d{1,2}:\d{2}$/.test(txt)){ const p=txt.split(":"); return String(p[0]).padStart(2,"0")+":"+p[1]; } if(/^\d{1,2}:\d{2}:\d{2}$/.test(txt)){ const p=txt.split(":"); return String(p[0]).padStart(2,"0")+":"+p[1]; } if(/^\d{1,2}h\d{2}$/.test(txt.toLowerCase())){ const p=txt.toLowerCase().split("h"); return String(p[0]).padStart(2,"0")+":"+p[1]; } return txt.slice(0,5); }
  function statusInfo(v){ const s=norm(v); if(s.includes("deplacer")) return {kind:"move",label:"À déplacer"}; if(s.includes("refuse")) return {kind:"refused",label:"Refusé"}; if(s.includes("accepte")) return {kind:"accepted",label:"Accepté"}; return {kind:"pending",label:"En attente"}; }
  function isAllDay(v){ const s=norm(v); return s.includes("journee entiere") || s.includes("toute la journee"); }
  function roomInfo(v, precision){
    const s=norm(v);
    const p=(precision||"").toString().trim();
    if(s.includes("auditorium")) return {key:"auditorium",short:"Aud.",label:"Auditorium",capacity:"200 places",capacityNum:200};
    if(s.includes("orchestre")) return {key:"orchestre",short:"Orch.",label:"Salle d’orchestre",capacity:"40 places",capacityNum:40};
    if(s.includes("chant") && !s.includes("choeur") && !s.includes("chœur")) return {key:"chant",short:"Chant",label:"Salle de chant",capacity:"40 places",capacityNum:40};
    if(s.includes("choeur") || s.includes("chœur")) return {key:"choeur",short:"Chœur",label:"Salle de chœur",capacity:"40 places",capacityNum:40};
    if(s.includes("theatre") || s.includes("théâtre")) return {key:"theatre",short:"Théâtre",label:"Salle de théâtre",capacity:"40 places",capacityNum:40};
    if(s.includes("danse 1") || s.includes("studio de danse 1")) return {key:"danse1",short:"Danse 1",label:"Studio de danse 1",capacity:"40 places",capacityNum:40};
    if(s.includes("danse 2") || s.includes("studio de danse 2")) return {key:"danse2",short:"Danse 2",label:"Studio de danse 2",capacity:"40 places",capacityNum:40};
    if(s.includes("danse 3") || s.includes("studio de danse 3")) return {key:"danse3",short:"Danse 3",label:"Studio de danse 3",capacity:"40 places",capacityNum:40};
    if(s.includes("danse")) return {key:"danse1",short:"Danse 1",label:"Studio de danse 1",capacity:"40 places",capacityNum:40};
    if(s.includes("autre") || p){
      return {
        key:"other",
        short:p ? p : "Autre",
        label:p ? p : "Autre espace / salle précisée",
        capacity:"selon fiche",
        capacityNum:40
      };
    }
    if(s.includes("peu importe") || s.includes("indifferent") || s.includes("indifférent") || s.includes("a definir") || s.includes("à définir") || s.includes("arbitrer")) return {key:"any",short:"À arbitrer",label:"À arbitrer",capacity:"à affecter",capacityNum:40};
    return {key:"other",short:v || "Autre",label:v || "Autre espace / salle précisée",capacity:"selon fiche",capacityNum:40};
  }
  function buildTimeSlots(start,end,step){ const slots=[]; let t=timeToMinutes(start); const max=timeToMinutes(end); while(t<max){ slots.push(t); t+=step; } return slots; }
  function minutesToTime(total){ const h=Math.floor(total/60); const m=total%60; return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0"); }
  function timeToMinutes(time){ if(!time || time==="Journée entière") return null; const parts=time.split(":"); if(parts.length<2) return null; const h=parseInt(parts[0],10), m=parseInt(parts[1],10); if(isNaN(h)||isNaN(m)) return null; return h*60+m; }
  function durationToMinutes(duration){ const d=norm(duration); if(d.includes("45")) return 45; if(d.includes("30")) return 30; if(d.includes("1h30") || d.includes("1 h 30")) return 90; if(d.includes("2h") || d.includes("2 h")) return 120; if(d.includes("1h") || d.includes("1 h") || d.includes("60")) return 60; if(d.includes("demi")) return 180; if(d.includes("journee")) return null; return 60; }
  function blockedDurationFromFormat(format, fallbackDuration){ const f=norm(format); if(f.includes("bloque 30")) return 30; if(f.includes("bloque 1h") || f.includes("bloque 1 h")) return 60; return durationToMinutes(fallbackDuration); }
  function eventStartMinutes(ev){ if(ev.allDay) return timeToMinutes("08:30"); return timeToMinutes(ev.time); }
  function eventEndMinutes(ev){ if(ev.autoEnd) return timeToMinutes(ev.autoEnd); if(ev.allDay) return timeToMinutes("21:00"); const start=eventStartMinutes(ev); if(start===null) return null; return start+blockedDurationFromFormat(ev.crdFormat, ev.duration); }
  function eventOccupiesSlot(ev,slotStart){ if(ev.allDay) return true; const start=eventStartMinutes(ev), end=eventEndMinutes(ev); if(start===null||end===null) return false; return slotStart>=start && slotStart<end; }
  function isSchoolDay(dateIso){ return ["2026-06-15","2026-06-16","2026-06-18","2026-06-19"].includes(dateIso); }
  function momentFromEvent(ev){ if(ev.allDay) return "journee"; const minutes=timeToMinutes(ev.time); if(minutes===null) return "apresmidi"; if(minutes<12*60) return "matin"; if(minutes<17*60) return "apresmidi"; return "soir"; }
  function isAutoEvent(ev){ return !!ev.autoGenerated; }
  function isRealProgramming(ev){ return ev.statusKind !== "refused"; }
  function isSchoolTime(ev){ if(!isSchoolDay(ev.dateIso)) return false; if(ev.allDay) return true; const minutes=timeToMinutes(ev.time); if(minutes===null) return false; return (minutes>=510 && minutes<720) || (minutes>=780 && minutes<1020); }
  function isOutOfSchoolTime(ev){ return !isSchoolTime(ev); }
  function schoolSlotKey(ev){ if(!isSchoolDay(ev.dateIso)) return null; if(ev.allDay) return "journee"; const minutes=timeToMinutes(ev.time); if(minutes===null) return null; if(minutes>=510 && minutes<720) return "matin"; if(minutes>=780 && minutes<1020) return "apresmidi"; return null; }
  function selectedStatuses(){ return Array.from(root.querySelectorAll(".jps-status-filter")).filter(cb=>cb.checked).map(cb=>cb.value); }
  function visibleEvents(){ const selected=selectedStatuses(); return allEvents.filter(e=>selected.includes(e.statusKind)).sort((a,b)=>{ if(a.dateIso!==b.dateIso) return a.dateIso.localeCompare(b.dateIso); return (eventStartMinutes(a)||0)-(eventStartMinutes(b)||0); }); }
  function getDayConflicts(events){ const map={}; events.filter(isRealProgramming).forEach(ev=>{ if(ev.allDay) return; const key=ev.dateIso+"|"+ev.time+"|"+ev.roomKey; map[key]=(map[key]||0)+1; }); return Object.values(map).filter(n=>n>1).length; }
  function getConflictEvents(events){ const map={}; events.filter(isRealProgramming).forEach(ev=>{ if(ev.allDay) return; const key=ev.dateIso+"|"+ev.time+"|"+ev.roomKey; if(!map[key]) map[key]=[]; map[key].push(ev); }); return Object.values(map).filter(group=>group.length>1).flat(); }
  function getEmptySchoolSlotsForDay(dayIso,events){ if(!isSchoolDay(dayIso)) return []; const dayEvents=events.filter(e=>e.dateIso===dayIso && isRealProgramming(e)); const hasMorning=dayEvents.some(e=>schoolSlotKey(e)==="matin" || schoolSlotKey(e)==="journee"); const hasAfternoon=dayEvents.some(e=>schoolSlotKey(e)==="apresmidi" || schoolSlotKey(e)==="journee"); const empty=[]; if(!hasMorning) empty.push("matin"); if(!hasAfternoon) empty.push("après-midi"); return empty; }

  function openModal(ev){
    $("jps-m-title").textContent=ev.title;
    $("jps-m-name").textContent=ev.name||"—";
    $("jps-m-discipline").textContent=ev.discipline||"—";
    $("jps-m-type").textContent=ev.type||"—";
    $("jps-m-public").textContent=ev.publicTarget||"—";
    $("jps-m-date").textContent=formatDateFR(ev.dateIso);
    $("jps-m-time").textContent=ev.allDay ? "Journée entière" : (ev.time + (ev.autoEnd ? "–" + ev.autoEnd : ""));
    $("jps-m-duration").textContent=ev.duration||"—";
    $("jps-m-crd-format").textContent=ev.crdFormat||"—";
    $("jps-m-crd-pole").textContent=ev.crdPole||"—";
    $("jps-m-room").textContent=ev.roomLabel||"—";
    $("jps-m-room-capacity").textContent=ev.roomCapacity||"À définir";
    $("jps-m-capacity").textContent=ev.estimatedCapacity||"—";
    $("jps-m-auto").textContent=ev.autoLabel||"Non";
    $("jps-m-flex").textContent=ev.flexibility||"—";
    $("jps-m-alt").textContent=ev.alternatives||"—";
    $("jps-m-tech").textContent=ev.tech||"—";
    $("jps-m-desc").textContent=ev.description||"—";
    $("jps-m-status").textContent=ev.statusLabel||"—";
    $("jps-modal").classList.add("open");
  }

  function renderStats(data){ $("jps-total").textContent=data.length; $("jps-accepted").textContent=data.filter(e=>e.statusKind==="accepted").length; $("jps-pending").textContent=data.filter(e=>e.statusKind==="pending").length; $("jps-move").textContent=data.filter(e=>e.statusKind==="move").length; $("jps-refused").textContent=data.filter(e=>e.statusKind==="refused").length; $("jps-count").textContent=data.length>1 ? data.length+" propositions" : data.length+" proposition"; }

  function renderEventListHTML(events){
    if(!events.length) return '<div class="jps-alert-line">Aucune proposition à afficher.</div>';

    const grouped = [];
    const autoMap = {};

    events.forEach(ev => {
      if(ev.autoGenerated){
        const key = (ev.sourceUid || norm(ev.title) + '|' + norm(ev.roomLabel)) + '|' + ev.dateIso + '|' + ev.statusKind;
        if(!autoMap[key]){
          autoMap[key] = {
            representative: ev,
            slots: []
          };
          grouped.push(autoMap[key]);
        }
        autoMap[key].slots.push(ev);
      } else {
        grouped.push({ representative: ev, slots: [ev] });
      }
    });

    return '<div class="jps-list-grid">' + grouped.map(group => {
      const ev = group.representative;
      const isAuto = ev.autoGenerated;
      const sortedSlots = group.slots.slice().sort((a,b) => String(a.time).localeCompare(String(b.time)));
      const timeLabel = isAuto
        ? sortedSlots.map(s => s.time + (s.autoEnd ? '–' + s.autoEnd : '')).join(', ')
        : (ev.allDay ? 'Journée entière' : ev.time + (ev.autoEnd ? '–' + ev.autoEnd : ''));
      const modeLine = isAuto
        ? '<div><strong>Mode :</strong> Programmation automatique — ' + sortedSlots.length + ' créneau(x) généré(s)</div>'
        : '';

      return '<div class="jps-list-item '+ev.statusKind+'" data-event-id="'+ev.uid+'">' +
        '<div class="jps-list-item-title">'+esc(ev.title)+'</div>' +
        '<div class="jps-list-item-meta">' +
          '<div><strong>Date :</strong> '+esc(formatDateFR(ev.dateIso))+'</div>' +
          '<div><strong>Horaire :</strong> '+esc(timeLabel)+'</div>' +
          '<div><strong>Lieu :</strong> '+esc(ev.roomLabel)+'</div>' +
          '<div><strong>Statut :</strong> '+esc(ev.statusLabel)+'</div>' +
          modeLine +
        '</div>' +
      '</div>';
    }).join("") + '</div>';
  }
  function renderEmptySlotsContent(slots){ if(!slots.length) return '<div class="jps-alert-line">Tous les créneaux scolaires sont couverts.</div>'; return '<div class="jps-alert-list">' + slots.map(s => '<div class="jps-alert-line"><strong>'+esc(s.day.name+" "+s.day.short)+'</strong><br>Créneau à combler : '+esc(s.slot)+'</div>').join("") + '</div>'; }
  function openAlertModal(title, html){ $("jps-alert-title").textContent=title; $("jps-alert-content").innerHTML=html; $("jps-alert-modal").classList.add("open"); $("jps-alert-content").querySelectorAll("[data-event-id]").forEach(el=>{ el.onclick=()=>{ const ev=allEvents.find(e=>e.uid===el.getAttribute("data-event-id")); if(ev) openModal(ev); }; }); }

  function renderAlerts(data){
    const realData=data.filter(isRealProgramming);
    const schoolTimeEvents=realData.filter(isSchoolTime);
    const outOfSchoolEvents=realData.filter(isOutOfSchoolTime);
    const autoEvents=data.filter(isAutoEvent);
    const emptySchoolSlots=[];
    DAYS.filter(d=>d.group==="school").forEach(day=>{ getEmptySchoolSlotsForDay(day.iso,data).forEach(slot=>emptySchoolSlots.push({day,slot})); });
    const conflicts=getConflictEvents(realData);
    lastAlertData={emptySchoolSlots,schoolTimeEvents,outOfSchoolEvents,conflicts,autoEvents};
    $("jps-alerts").innerHTML =
      '<div id="jps-alert-empty" class="jps-alert '+(emptySchoolSlots.length ? "empty" : "ok")+'"><strong>Créneaux scolaires non comblés</strong>'+(emptySchoolSlots.length ? emptySchoolSlots.length+' créneau(x) à traiter.' : 'Tous les créneaux scolaires ont au moins une proposition.')+'</div>'+ 
      '<div id="jps-alert-school" class="jps-alert '+(schoolTimeEvents.length<4 ? "low" : "ok")+'"><strong>Temps scolaire réel</strong>'+schoolTimeEvents.length+' proposition(s) entre 08h30–12h00 / 13h00–17h00.</div>'+ 
      '<div id="jps-alert-public" class="jps-alert ok"><strong>Hors temps scolaire / tout public</strong>'+outOfSchoolEvents.length+' proposition(s) identifiée(s).</div>'+ 
      '<div id="jps-alert-conflicts" class="jps-alert '+(conflicts.length ? "low" : "ok")+'"><strong>Litiges / chevauchements</strong>'+(conflicts.length ? conflicts.length+' proposition(s) concernée(s).' : 'Aucun litige majeur détecté.')+'<br>Créneaux automatiques : '+autoEvents.length+'</div>';
    $("jps-alert-empty").onclick=()=>openAlertModal("Créneaux scolaires non comblés", renderEmptySlotsContent(emptySchoolSlots));
    $("jps-alert-school").onclick=()=>openAlertModal("Temps scolaire réel", renderEventListHTML(schoolTimeEvents));
    $("jps-alert-public").onclick=()=>openAlertModal("Hors temps scolaire / tout public", renderEventListHTML(outOfSchoolEvents));
    $("jps-alert-conflicts").onclick=()=>openAlertModal("Litiges / chevauchements", conflicts.length ? renderEventListHTML(conflicts) : '<div class="jps-alert-line">Aucun litige salle / horaire détecté.</div>');
  }

  function slotSummary(dayIso,momentKey,data,mode){ let events; if(mode==="school"){ events=data.filter(e=>e.dateIso===dayIso && isSchoolTime(e) && (schoolSlotKey(e)===momentKey || schoolSlotKey(e)==="journee")); } else { events=data.filter(e=>e.dateIso===dayIso && momentFromEvent(e)===momentKey); } const realEvents=events.filter(isRealProgramming); let scoreClass="empty", scoreText="Vide"; if(realEvents.length===1){scoreClass="low";scoreText="1 action";} else if(realEvents.length===2){scoreClass="ok";scoreText="2 actions";} else if(realEvents.length>=3){scoreClass="full";scoreText=realEvents.length+" actions";} return {events,realEvents,scoreClass,scoreText}; }
  function renderFrise(containerId,group,data){ const container=$(containerId); container.innerHTML=""; const moments=group==="school" ? SCHOOL_MOMENTS : PUBLIC_MOMENTS; const mode=group==="school" ? "school" : "public"; DAYS.filter(day=>day.group===group).forEach(day=>{ const dayBox=document.createElement("section"); dayBox.className="jps-frise-day"; dayBox.innerHTML='<div class="jps-frise-head"><div class="jps-frise-name">'+esc(day.name)+'</div><div class="jps-frise-date">'+esc(day.short)+'</div></div><div class="jps-frise-body"></div>'; const body=dayBox.querySelector(".jps-frise-body"); moments.forEach(moment=>{ const summary=slotSummary(day.iso,moment.key,data,mode); const slot=document.createElement("div"); slot.className="jps-frise-slot"; slot.innerHTML='<div class="jps-frise-slothead"><span class="jps-frise-slotname">'+esc(moment.label)+'</span><span class="jps-frise-score '+summary.scoreClass+'">'+esc(summary.scoreText)+'</span></div>'+(moment.period ? '<div class="jps-count" style="margin-bottom:7px">'+esc(moment.period)+'</div>' : '')+'<div class="jps-roomchips"></div>'; const chips=slot.querySelector(".jps-roomchips"); if(!summary.events.length){ chips.innerHTML='<span class="jps-roomchip empty">Aucune salle mobilisée</span>'; } else { const byRoom={}; summary.events.forEach(ev=>{ if(!byRoom[ev.roomKey]) byRoom[ev.roomKey]=[]; byRoom[ev.roomKey].push(ev); }); Object.keys(byRoom).forEach(roomKey=>{ const evs=byRoom[roomKey], main=evs[0]; const chip=document.createElement("span"); chip.className="jps-roomchip "+(isAutoEvent(main) ? "auto" : main.statusKind); chip.textContent=main.roomShort+" · "+evs.length; chips.appendChild(chip); }); } body.appendChild(slot); }); dayBox.onclick=()=>openDayModal(day.iso); container.appendChild(dayBox); }); }
  function renderDayButtons(data){ const container=$("jps-day-buttons"); container.innerHTML=""; DAYS.forEach(day=>{ const dayEvents=data.filter(e=>e.dateIso===day.iso); const realEvents=dayEvents.filter(isRealProgramming); const autoEvents=dayEvents.filter(isAutoEvent); const rooms=Array.from(new Set(dayEvents.map(e=>e.roomShort).filter(Boolean))); const conflicts=getDayConflicts(dayEvents); const emptySchoolSlots=getEmptySchoolSlotsForDay(day.iso,data); const schoolEvents=dayEvents.filter(e=>isRealProgramming(e)&&isSchoolTime(e)); let warningClass="ok", warningText="Programmation à suivre"; if(conflicts){ warningClass="conflict"; warningText=conflicts+" litige(s) salle / horaire"; } else if(isSchoolDay(day.iso)&&emptySchoolSlots.length){ warningClass="empty"; warningText="Créneau(x) scolaire(s) à combler : "+emptySchoolSlots.join(", "); } else if(isSchoolDay(day.iso)){ warningText=schoolEvents.length+" proposition(s) sur temps scolaire"; } else if(!realEvents.length){ warningClass="empty"; warningText="À combler"; } else { warningText=realEvents.length+" proposition(s)"; } const btn=document.createElement("button"); btn.type="button"; btn.className="jps-day-btn"; btn.innerHTML='<div class="jps-day-btn-top"><div><div class="jps-day-btn-name">'+esc(day.name)+'</div><div class="jps-day-btn-date">'+esc(day.short)+'</div></div><span class="jps-day-btn-count">'+dayEvents.length+'</span></div><div class="jps-day-btn-meta"><strong>Salles :</strong> '+esc(rooms.length ? rooms.join(", ") : "aucune")+'<br><strong>Automatique :</strong> '+autoEvents.length+' · <strong>Total :</strong> '+realEvents.length+'</div><div class="jps-day-btn-warning '+warningClass+'">'+esc(warningText)+'</div>'; btn.onclick=()=>openDayModal(day.iso); container.appendChild(btn); }); }
  function renderEventCard(ev){ const div=document.createElement("div"); div.className="jps-slot-card "+(isAutoEvent(ev)?"auto":ev.statusKind); const end=ev.allDay ? "" : eventEndMinutes(ev); const timeLabel=ev.allDay ? "Journée entière" : ev.time+(ev.autoEnd ? "–"+ev.autoEnd : (end ? "–"+minutesToTime(end) : "")); div.innerHTML='<span class="jps-slot-time">'+esc(timeLabel)+'</span><span class="jps-slot-title">'+esc(ev.title)+'</span><span class="jps-slot-meta">'+esc(ev.statusLabel)+(isAutoEvent(ev)?" · Auto":"")+'</span>'; div.onclick=e=>{ e.stopPropagation(); openModal(ev); }; return div; }
  function openDayModal(dayIso){
    const data=visibleEvents();
    const day=DAYS.find(d=>d.iso===dayIso);
    const dayEvents=data.filter(e=>e.dateIso===dayIso);

    // V17 : colonnes fixes pour les salles stratégiques.
    // La colonne "Autre espace / salle précisée" regroupe les lieux comme : salle numérotée, patio, hall, extérieur,
    // espace d’accueil, couloir, foyer, parvis, etc. Le détail exact reste visible dans la carte événement.
    let dayRooms=ROOMS.filter(room=>room.fixed || dayEvents.some(ev=>ev.roomKey===room.key));

    $("jps-day-modal-title").textContent=day.name+" "+day.short;
    $("jps-day-modal-sub").textContent="Planning par créneaux de 30 minutes. Colonnes fixes : Auditorium, salles d’orchestre/chant/chœur/théâtre, studios de danse 1-2-3, et autre espace précisé dans la fiche événement.";

    const detail=$("jps-day-detail");
    detail.innerHTML="";

    const wrap=document.createElement("div");
    wrap.className="jps-timetable-wrap";

    const table=document.createElement("div");
    table.className="jps-timetable";
    table.style.gridTemplateColumns="95px repeat("+dayRooms.length+", minmax(150px, 1fr))";
    table.style.minWidth=(95 + dayRooms.length * 150) + "px";

    table.innerHTML='<div class="jps-th">Horaire</div>'+dayRooms.map(room=>'<div class="jps-th">'+esc(room.label)+'<br><span class="jps-count">'+esc(room.capacity)+'</span></div>').join("");

    TIME_SLOTS.forEach(slot=>{
      const hour=document.createElement("div");
      hour.className="jps-hour";
      hour.textContent=minutesToTime(slot).replace(":","h");
      table.appendChild(hour);

      dayRooms.forEach(room=>{
        const cell=document.createElement("div");
        const isSchoolSlot=isSchoolDay(dayIso)&&((slot>=510&&slot<720)||(slot>=780&&slot<1020));
        cell.className="jps-cell "+(isSchoolSlot?"schooltime":"");
        const events=dayEvents.filter(ev=>ev.roomKey===room.key && eventOccupiesSlot(ev,slot));

        if(!events.length){
          cell.classList.add("empty");
          cell.innerHTML='<div class="jps-slot-empty">Libre</div>';
        } else {
          events.forEach(ev=>cell.appendChild(renderEventCard(ev)));
        }

        table.appendChild(cell);
      });
    });

    wrap.appendChild(table);
    detail.appendChild(wrap);
    $("jps-day-modal").classList.add("open");
  }
  function getListEvents(data){ const seenAuto={}; const result=[]; data.forEach(ev=>{ if(ev.autoGenerated){ const key=ev.sourceUid || (norm(ev.title)+"|"+norm(ev.roomLabel)); if(seenAuto[key]) return; seenAuto[key]=true; } result.push(ev); }); return result; }
  function openListModal(){ const data=getListEvents(visibleEvents()); const byDate={}; data.forEach(ev=>{ const key=ev.autoGenerated ? "auto" : ev.dateIso; if(!byDate[key]) byDate[key]=[]; byDate[key].push(ev); }); const keys=Object.keys(byDate).sort((a,b)=>{ if(a==="auto") return -1; if(b==="auto") return 1; return a.localeCompare(b); }); $("jps-list-content").innerHTML=keys.map(key=>{ const title=key==="auto" ? "Programmations automatiques" : formatDateFR(key); return '<div class="jps-list-date">'+esc(title)+'</div>'+renderEventListHTML(byDate[key]); }).join(""); $("jps-list-modal").classList.add("open"); $("jps-list-content").querySelectorAll("[data-event-id]").forEach(el=>{ el.onclick=()=>{ const ev=allEvents.find(e=>e.uid===el.getAttribute("data-event-id")); if(ev) openModal(ev); }; }); }
  function refresh(){ const data=visibleEvents(); renderStats(data); renderAlerts(data); renderDayButtons(data); renderFrise("jps-school-frise","school",data); renderFrise("jps-public-frise","public",data); const schoolCount=data.filter(e=>isRealProgramming(e)&&isSchoolTime(e)).length; const publicCount=data.filter(e=>isRealProgramming(e)&&isOutOfSchoolTime(e)).length; $("jps-school-count").textContent=schoolCount+" proposition(s) temps scolaire"; $("jps-public-count").textContent=publicCount+" proposition(s) mercredi/week-end/hors temps scolaire"; }
  function close(id){ $(id).classList.remove("open"); }

  $("jps-close").onclick=()=>close("jps-modal"); $("jps-modal").onclick=e=>{ if(e.target===$("jps-modal")) close("jps-modal"); };
  $("jps-day-close").onclick=()=>close("jps-day-modal"); $("jps-day-modal").onclick=e=>{ if(e.target===$("jps-day-modal")) close("jps-day-modal"); };
  $("jps-list-close").onclick=()=>close("jps-list-modal"); $("jps-list-modal").onclick=e=>{ if(e.target===$("jps-list-modal")) close("jps-list-modal"); };
  $("jps-alert-close").onclick=()=>close("jps-alert-modal"); $("jps-alert-modal").onclick=e=>{ if(e.target===$("jps-alert-modal")) close("jps-alert-modal"); };
  $("jps-open-list").onclick=openListModal;
  root.querySelectorAll(".jps-status-filter").forEach(cb=>cb.addEventListener("change", refresh));

  fetch(CSV_URL).then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); }).then(text=>{
    const rows=parseCSV(text); const headers=rows[0]||[]; const dataRows=rows.slice(1);
    const C_NAME=findCol(headers,["Nom et prénom","Nom"]); const C_DISC=findCol(headers,["Discipline / département","Discipline"]); const C_TITLE=findCol(headers,["Intitulé du projet","Intitule du projet","Projet"]); const C_TYPE=findCol(headers,["Type de proposition","Type"]); const C_PUBLIC=findCol(headers,["Public visé","Public"]); const C_DATE=findCol(headers,["Date souhaitée","Date"]); const C_TIME=findCol(headers,["Horaire de début","Horaire","Heure"]); const C_DUR=findCol(headers,["Durée estimée","Durée"]); const C_FLEX=findCol(headers,["Flexibilité du créneau","Flexibilité"]); const C_ALT=findCol(headers,["Si oui, précisez","alternatives"]); const C_ROOM=findCol(headers,["Lieu souhaité","Lieu"]); const C_CAP=findCol(headers,["Nombre estimé","spectateurs","participants"]); const C_TECH=findCol(headers,["Besoins techniques"]); const C_DESC=findCol(headers,["Description courte","programmation","communication"]); const C_STATUS=findCol(headers,["STATUT","Statut"]); const C_AUTO=findCol(headers,["Programmation automatique sur plusieurs créneaux ?","Programmation automatique sur plusieurs creneaux ?","Programmation automatique"]); const C_ROOM_FINAL=findCol(headers,["SALLE RETENUE CRD","Salle retenue CRD","Salle retenue"]); const C_ROOM_PRECISION=findCol(headers,["PRÉCISION SALLE / LIEU CRD","PRECISION SALLE / LIEU CRD","Précision salle","Precision salle","Précision lieu","Precision lieu"]); const C_CAPACITY_CRD=findCol(headers,["CAPACITÉ CRD","CAPACITE CRD","Capacité CRD","Capacite CRD"]); const C_FORMAT_CRD=findCol(headers,["FORMAT CRD","Format CRD"]); const C_POLE_CRD=findCol(headers,["PÔLE CRD","POLE CRD","Pôle CRD","Pole CRD"]);
    if([C_TITLE,C_ROOM,C_STATUS].some(i=>i===-1)){ throw new Error("Colonnes introuvables : vérifie Intitulé du projet, Lieu souhaité et STATUT."); }
    const events=[];
    dataRows.forEach((row,idx)=>{
      const title=row[C_TITLE]||"Projet sans titre"; const status=statusInfo(row[C_STATUS]); const fallbackRoom=roomInfo(row[C_ROOM]); const rawFinalRoom=C_ROOM_FINAL!==-1 ? row[C_ROOM_FINAL] : ""; const rawPrecision=C_ROOM_PRECISION!==-1 ? row[C_ROOM_PRECISION] : ""; const finalRoomFilled=rawFinalRoom && !norm(rawFinalRoom).includes("arbitrer"); const room=finalRoomFilled ? roomInfo(rawFinalRoom, rawPrecision) : fallbackRoom; const duration=C_DUR!==-1 ? row[C_DUR] : ""; const crdFormat=C_FORMAT_CRD!==-1 ? row[C_FORMAT_CRD] : ""; const crdPole=C_POLE_CRD!==-1 ? row[C_POLE_CRD] : ""; const crdCapacityNum=C_CAPACITY_CRD!==-1 ? parseInt(String(row[C_CAPACITY_CRD]||"").replace(/[^\d]/g,""),10) : 0; const autoLabel=C_AUTO!==-1 ? row[C_AUTO] : ""; const autoMode=norm(autoLabel); const baseUid="ev"+idx+"_"+norm(title).replace(/[^a-z0-9]+/g,"-");
      const effectiveCapacity = !isNaN(crdCapacityNum) && crdCapacityNum ? (crdCapacityNum+" places") : room.capacity;
      const common={ name:C_NAME!==-1?row[C_NAME]:"", discipline:C_DISC!==-1?row[C_DISC]:"", title, type:C_TYPE!==-1?row[C_TYPE]:"", publicTarget:C_PUBLIC!==-1?row[C_PUBLIC]:"", duration, crdFormat, crdPole, crdRoomFinal:rawFinalRoom||"", crdRoomPrecision:rawPrecision||"", flexibility:C_FLEX!==-1?row[C_FLEX]:"", alternatives:C_ALT!==-1?row[C_ALT]:"", roomKey:room.key, roomShort:room.short, roomLabel:room.label, roomCapacity:effectiveCapacity, estimatedCapacity:C_CAPACITY_CRD!==-1 && row[C_CAPACITY_CRD] ? row[C_CAPACITY_CRD] : (C_CAP!==-1?row[C_CAP]:""), tech:C_TECH!==-1?row[C_TECH]:"", description:C_DESC!==-1?row[C_DESC]:"", statusKind:status.kind, statusLabel:status.label, autoLabel:autoLabel || "Non" };
      if(autoMode.includes("oui")){
        const autoDays=AUTO_DAYS_BASE.slice(); if(autoMode.includes("mercredi")) autoDays.splice(2,0,"2026-06-17");
        autoDays.forEach(autoDateIso=>{ AUTO_SLOTS.forEach(pair=>{ const start=pair[0], end=pair[1]; events.push({...common, uid:baseUid+"_"+autoDateIso+"_"+start.replace(":",""), sourceUid:baseUid, dateIso:autoDateIso, time:start, duration:"1 heure", allDay:false, autoGenerated:true, autoEnd:end}); }); }); return;
      }
      const dateIso=C_DATE!==-1 ? parseDateFR(row[C_DATE]) : null; if(!dateIso || dateIso<"2026-06-15" || dateIso>"2026-06-21") return; const allDay=isAllDay(duration);
      events.push({...common, uid:baseUid+"_"+dateIso, sourceUid:baseUid, dateIso, time:allDay ? "Journée entière" : (C_TIME!==-1 ? formatTime(row[C_TIME]) : "Non précisée"), allDay, autoGenerated:false});
    });
    allEvents=events; refresh(); if(!allEvents.length) $("jps-error").textContent="Aucune proposition trouvée entre le 15 et le 21 juin 2026.";
  }).catch(err=>{ $("jps-error").textContent="Erreur lors du chargement : "+err.message; });
});
