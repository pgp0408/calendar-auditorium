document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("semainejps-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnEUKc0wpQrmGOXO4b_k8oOVoHhrCSzX_VbXqA1zSYWUOMWQbiy6_tzwPCALDsSY7swWLLweOOjpRM/pub?gid=1329408426&single=true&output=csv";

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
    { key: "auditorium", short: "Aud.", label: "Auditorium", capacity: "200 places" },
    { key: "chant", short: "Chant", label: "Salle de chant", capacity: "40 places" },
    { key: "orchestre", short: "Orch.", label: "Salle d’orchestre", capacity: "40 places" },
    { key: "theatre", short: "Théâtre", label: "Salle de théâtre", capacity: "40 places" },
    { key: "danse", short: "Danse", label: "Studio de danse", capacity: "40 places" }
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

  const TIME_SLOTS = buildTimeSlots("08:30", "21:00", 30);

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
        max-width:1450px;
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
        max-width:940px;
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
      #semainejps-calendar .jps-dot.permanent{background:var(--jps-purple)}

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
        margin-bottom:24px;
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

      #semainejps-calendar .jps-alert.empty{background:#fff1f2;border-color:#fecaca}
      #semainejps-calendar .jps-alert.low{background:#fff7ed;border-color:#fed7aa}
      #semainejps-calendar .jps-alert.ok{background:#eff6ff;border-color:#bfdbfe}

      #semainejps-calendar .jps-section{margin-bottom:30px}

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

      #semainejps-calendar .jps-titlebar p{
        margin:5px 0 0;
        color:var(--jps-muted);
        font-size:14px;
        line-height:1.45;
      }

      #semainejps-calendar .jps-count{
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
        white-space:nowrap;
      }

      #semainejps-calendar .jps-day-buttons{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
        gap:12px;
      }

      #semainejps-calendar .jps-day-btn{
        appearance:none;
        border:1px solid #e7eaee;
        background:#fff;
        border-radius:20px;
        padding:18px;
        cursor:pointer;
        text-align:left;
        transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;
      }

      #semainejps-calendar .jps-day-btn:hover{
        transform:translateY(-2px);
        box-shadow:0 14px 32px rgba(15,23,42,.10);
        border-color:#cbd5e1;
      }

      #semainejps-calendar .jps-day-btn-top{
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:flex-start;
        margin-bottom:10px;
      }

      #semainejps-calendar .jps-day-btn-name{
        font-size:19px;
        font-weight:900;
        text-transform:uppercase;
        letter-spacing:-.02em;
      }

      #semainejps-calendar .jps-day-btn-date{
        margin-top:2px;
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
      }

      #semainejps-calendar .jps-day-btn-count{
        border-radius:999px;
        padding:5px 9px;
        background:#e2e8f0;
        color:#334155;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #semainejps-calendar .jps-day-btn-meta{
        color:#475569;
        font-size:13px;
        line-height:1.45;
      }

      #semainejps-calendar .jps-day-btn-warning{
        margin-top:10px;
        border-radius:12px;
        padding:9px;
        font-size:13px;
        font-weight:800;
        line-height:1.3;
      }

      #semainejps-calendar .jps-day-btn-warning.empty{
        background:#fff1f2;
        color:#991b1b;
        border:1px solid #fecaca;
      }

      #semainejps-calendar .jps-day-btn-warning.low{
        background:#fff7ed;
        color:#9a3412;
        border:1px solid #fed7aa;
      }

      #semainejps-calendar .jps-day-btn-warning.ok{
        background:#eff6ff;
        color:#1e40af;
        border:1px solid #bfdbfe;
      }

      #semainejps-calendar .jps-day-btn-warning.conflict{
        background:#fef2f2;
        color:#991b1b;
        border:1px solid #fecaca;
      }

      #semainejps-calendar .jps-frise{
        display:grid;
        gap:12px;
      }

      #semainejps-calendar .jps-frise.school{
        grid-template-columns:repeat(4,minmax(0,1fr));
      }

      #semainejps-calendar .jps-frise.public{
        grid-template-columns:repeat(3,minmax(0,1fr));
      }

      #semainejps-calendar .jps-frise-day{
        border:1px solid #e7eaee;
        border-radius:20px;
        background:#fff;
        overflow:hidden;
        cursor:pointer;
        transition:transform .15s ease, box-shadow .15s ease;
      }

      #semainejps-calendar .jps-frise-day:hover{
        transform:translateY(-2px);
        box-shadow:0 12px 28px rgba(15,23,42,.09);
      }

      #semainejps-calendar .jps-frise-head{
        padding:14px;
        border-bottom:1px solid var(--jps-border);
        background:#f8fafc;
      }

      #semainejps-calendar .jps-frise-name{
        font-size:16px;
        font-weight:900;
        text-transform:uppercase;
      }

      #semainejps-calendar .jps-frise-date{
        margin-top:2px;
        font-size:13px;
        font-weight:800;
        color:var(--jps-muted);
      }

      #semainejps-calendar .jps-frise-body{
        padding:12px;
        display:flex;
        flex-direction:column;
        gap:9px;
      }

      #semainejps-calendar .jps-frise-slot{
        border:1px solid #edf0f3;
        border-radius:15px;
        background:#fbfcfd;
        padding:10px;
      }

      #semainejps-calendar .jps-frise-slothead{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
        margin-bottom:8px;
      }

      #semainejps-calendar .jps-frise-slotname{
        font-size:12px;
        font-weight:900;
        text-transform:uppercase;
        color:#334155;
        letter-spacing:.03em;
      }

      #semainejps-calendar .jps-frise-score{
        border-radius:999px;
        padding:3px 8px;
        font-size:11px;
        font-weight:900;
        white-space:nowrap;
      }

      #semainejps-calendar .jps-frise-score.empty{background:#fee2e2;color:#991b1b}
      #semainejps-calendar .jps-frise-score.low{background:#ffedd5;color:#9a3412}
      #semainejps-calendar .jps-frise-score.ok{background:#dcfce7;color:#166534}
      #semainejps-calendar .jps-frise-score.full{background:#dbeafe;color:#1e40af}

      #semainejps-calendar .jps-roomchips{
        display:flex;
        flex-wrap:wrap;
        gap:5px;
      }

      #semainejps-calendar .jps-roomchip{
        display:inline-flex;
        border-radius:999px;
        padding:4px 7px;
        font-size:11px;
        font-weight:800;
        background:#e2e8f0;
        color:#334155;
      }

      #semainejps-calendar .jps-roomchip.empty{
        background:#f8fafc;
        color:#94a3b8;
        border:1px dashed #cbd5e1;
      }

      #semainejps-calendar .jps-roomchip.accepted{background:#dcfce7;color:#166534}
      #semainejps-calendar .jps-roomchip.pending{background:#fef3c7;color:#92400e}
      #semainejps-calendar .jps-roomchip.move{background:#dbeafe;color:#1e40af}
      #semainejps-calendar .jps-roomchip.refused{background:#fee2e2;color:#991b1b}
      #semainejps-calendar .jps-roomchip.permanent{background:#ede9fe;color:#5b21b6}

      #semainejps-calendar .jps-details{
        margin-top:26px;
        border:1px solid var(--jps-border);
        border-radius:22px;
        background:#fff;
        padding:18px;
      }

      #semainejps-calendar .jps-detailshead{
        display:flex;
        justify-content:space-between;
        align-items:baseline;
        gap:12px;
        margin-bottom:14px;
      }

      #semainejps-calendar .jps-detailshead h3{
        margin:0;
        font-size:24px;
        font-weight:900;
        letter-spacing:-.02em;
      }

      #semainejps-calendar .jps-list{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
        gap:12px;
      }

      #semainejps-calendar .jps-item{
        border:1px solid #e7eaee;
        border-left:7px solid var(--status-color);
        border-radius:18px;
        padding:14px;
        background:#fbfbfc;
        cursor:pointer;
      }

      #semainejps-calendar .jps-item.accepted{--status-color:var(--jps-green)}
      #semainejps-calendar .jps-item.pending{--status-color:var(--jps-orange)}
      #semainejps-calendar .jps-item.move{--status-color:var(--jps-blue)}
      #semainejps-calendar .jps-item.refused{--status-color:var(--jps-red)}

      #semainejps-calendar .jps-item:hover{
        background:#fff;
        box-shadow:0 10px 24px rgba(15,23,42,.08);
      }

      #semainejps-calendar .jps-itemtitle{
        font-weight:900;
        font-size:16px;
        margin-bottom:8px;
      }

      #semainejps-calendar .jps-itemmeta{
        font-size:14px;
        line-height:1.5;
        color:#4b5563;
      }

      #semainejps-calendar .jps-badges{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        margin-top:10px;
      }

      #semainejps-calendar .jps-badge{
        display:inline-flex;
        align-items:center;
        border-radius:999px;
        padding:5px 9px;
        font-size:12px;
        font-weight:900;
        background:var(--status-color);
        color:#fff;
      }

      #semainejps-calendar .jps-badge.pending,
      #semainejps-calendar .jps-badge.move{
        color:#111827;
      }

      #semainejps-calendar .jps-roomtag{
        background:#334155!important;
        color:#fff!important;
      }

      #semainejps-calendar .jps-permanenttag{
        background:#7c3aed!important;
        color:#fff!important;
      }

      #semainejps-calendar .jps-error{
        margin-top:16px;
        color:#b91c1c;
        font-weight:800;
        white-space:pre-wrap;
      }

      #semainejps-calendar .jps-modal,
      #semainejps-calendar .jps-day-modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:9999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #semainejps-calendar .jps-modal.open,
      #semainejps-calendar .jps-day-modal.open{
        display:flex;
      }

      #semainejps-calendar .jps-modalbox,
      #semainejps-calendar .jps-day-modalbox{
        width:min(900px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #semainejps-calendar .jps-day-modalbox{
        width:min(1280px,100%);
      }

      #semainejps-calendar .jps-close,
      #semainejps-calendar .jps-day-close{
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #semainejps-calendar .jps-modaltitle,
      #semainejps-calendar .jps-day-modaltitle{
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.15;
        font-weight:900;
      }

      #semainejps-calendar .jps-day-modal-sub{
        margin:-8px 0 20px;
        color:var(--jps-muted);
        font-size:14px;
        font-weight:800;
      }

      #semainejps-calendar .jps-timetable-wrap{
        overflow:auto;
        border:1px solid var(--jps-border);
        border-radius:20px;
        background:#fff;
      }

      #semainejps-calendar .jps-timetable{
        min-width:980px;
        display:grid;
        grid-template-columns:95px repeat(5, minmax(160px, 1fr));
      }

      #semainejps-calendar .jps-th,
      #semainejps-calendar .jps-hour,
      #semainejps-calendar .jps-cell{
        border-bottom:1px solid #edf0f3;
        border-right:1px solid #edf0f3;
      }

      #semainejps-calendar .jps-th{
        position:sticky;
        top:0;
        z-index:3;
        background:#f8fafc;
        padding:12px;
        font-size:13px;
        font-weight:900;
        color:#334155;
        text-align:center;
      }

      #semainejps-calendar .jps-hour{
        position:sticky;
        left:0;
        z-index:2;
        background:#f8fafc;
        padding:10px 8px;
        font-size:12px;
        font-weight:900;
        color:#334155;
        text-align:center;
        min-height:74px;
      }

      #semainejps-calendar .jps-cell{
        min-height:74px;
        padding:7px;
        background:#fff;
      }

      #semainejps-calendar .jps-cell.schooltime{
        background:#fcfffd;
      }

      #semainejps-calendar .jps-cell.empty{
        background:#fbfcfd;
      }

      #semainejps-calendar .jps-slot-empty{
        color:#94a3b8;
        font-size:11px;
        font-style:italic;
        text-align:center;
        padding-top:18px;
      }

      #semainejps-calendar .jps-slot-card{
        border-radius:12px;
        padding:8px;
        margin-bottom:6px;
        background:var(--status-color);
        color:#fff;
        cursor:pointer;
        box-shadow:0 6px 14px rgba(15,23,42,.10);
      }

      #semainejps-calendar .jps-slot-card:last-child{
        margin-bottom:0;
      }

      #semainejps-calendar .jps-slot-card.accepted{--status-color:var(--jps-green)}
      #semainejps-calendar .jps-slot-card.pending{--status-color:var(--jps-orange);color:#111827}
      #semainejps-calendar .jps-slot-card.move{--status-color:var(--jps-blue);color:#0f172a}
      #semainejps-calendar .jps-slot-card.refused{--status-color:var(--jps-red)}
      #semainejps-calendar .jps-slot-card.permanent{
        background:#7c3aed;
        color:#fff;
      }

      #semainejps-calendar .jps-slot-time{
        display:block;
        font-size:11px;
        font-weight:900;
        margin-bottom:3px;
      }

      #semainejps-calendar .jps-slot-title{
        display:block;
        font-size:12px;
        font-weight:900;
        line-height:1.2;
      }

      #semainejps-calendar .jps-slot-meta{
        display:block;
        margin-top:4px;
        font-size:11px;
        opacity:.9;
        line-height:1.25;
      }

      #semainejps-calendar .jps-row{
        display:grid;
        grid-template-columns:170px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #semainejps-calendar .jps-row:last-child{border-bottom:0}
      #semainejps-calendar .jps-label{font-weight:900}

      @media(max-width:1150px){
        #semainejps-calendar .jps-frise.school,
        #semainejps-calendar .jps-frise.public{
          grid-template-columns:1fr;
        }
      }

      @media(max-width:760px){
        #semainejps-calendar .jps-header,
        #semainejps-calendar .jps-content{padding:18px}

        #semainejps-calendar .jps-header-grid{grid-template-columns:1fr}
        #semainejps-calendar .jps-filters{justify-content:flex-start}
        #semainejps-calendar .jps-filter{width:100%;text-align:left}
        #semainejps-calendar .jps-stats{grid-template-columns:1fr 1fr}
        #semainejps-calendar .jps-alerts{grid-template-columns:1fr}

        #semainejps-calendar .jps-titlebar,
        #semainejps-calendar .jps-detailshead{
          flex-direction:column;
          align-items:flex-start;
        }

        #semainejps-calendar .jps-row{
          grid-template-columns:1fr;
          gap:4px;
        }

        #semainejps-calendar .jps-list{
          grid-template-columns:1fr;
        }

        #semainejps-calendar .jps-modal,
        #semainejps-calendar .jps-day-modal{
          padding:10px;
        }

        #semainejps-calendar .jps-modalbox,
        #semainejps-calendar .jps-day-modalbox{
          padding:20px;
          border-radius:20px;
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
              En V10, chaque journée s’ouvre sur un planning heure par heure et salle par salle pour préparer les futurs créneaux de réservation des établissements.
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
          <span class="jps-pill"><span class="jps-dot permanent"></span>Fil rouge / créneaux réservables</span>
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
            <div>
              <h3>Explorer une journée</h3>
              <p>Cliquez sur un jour pour ouvrir le planning détaillé par heure et par salle.</p>
            </div>
            <div id="jps-count" class="jps-count"></div>
          </div>
          <div id="jps-day-buttons" class="jps-day-buttons"></div>
          <div id="jps-error" class="jps-error"></div>
        </section>

        <section class="jps-section">
          <div class="jps-titlebar">
            <div>
              <h3>Frise temps scolaire réel</h3>
              <p>Lundi, mardi, jeudi et vendredi : uniquement 08h30–12h00 et 13h00–17h00. Cliquez sur un jour pour ouvrir le planning complet.</p>
            </div>
            <div id="jps-school-count" class="jps-count"></div>
          </div>
          <div id="jps-school-frise" class="jps-frise school"></div>
        </section>

        <section class="jps-section">
          <div class="jps-titlebar">
            <div>
              <h3>Frise mercredi / samedi / dimanche</h3>
              <p>Lecture synthétique des journées tout public. Cliquez sur un jour pour ouvrir le planning complet.</p>
            </div>
            <div id="jps-public-count" class="jps-count"></div>
          </div>
          <div id="jps-public-frise" class="jps-frise public"></div>
        </section>

        <section class="jps-details">
          <div class="jps-detailshead">
            <h3>Propositions détaillées</h3>
            <div id="jps-list-count" class="jps-count"></div>
          </div>
          <div id="jps-list" class="jps-list"></div>
        </section>
      </div>
    </div>

    <div id="jps-day-modal" class="jps-day-modal">
      <div class="jps-day-modalbox">
        <button type="button" id="jps-day-close" class="jps-day-close">&times;</button>
        <h3 id="jps-day-modal-title" class="jps-day-modaltitle"></h3>
        <div id="jps-day-modal-sub" class="jps-day-modal-sub"></div>
        <div id="jps-day-detail"></div>
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

  function $(id){ return document.getElementById(id); }

  function norm(v){
    return (v || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }

  function esc(s){
    return String(s || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function parseCSVLine(line){
    const res = [];
    let cur = "";
    let quoted = false;

    for(let i = 0; i < line.length; i++){
      const ch = line[i];
      const next = line[i + 1];

      if(ch === '"'){
        if(quoted && next === '"'){
          cur += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if(ch === "," && !quoted){
        res.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }

    res.push(cur);
    return res;
  }

  function parseCSV(text){
    return text.replace(/\r/g,"").trim().split("\n").map(parseCSVLine);
  }

  function findCol(headers, possibilities){
    const hs = headers.map(norm);

    for(const p of possibilities){
      const n = norm(p);
      const exact = hs.findIndex(h => h === n);
      if(exact !== -1) return exact;
    }

    for(const p of possibilities){
      const n = norm(p);
      const partial = hs.findIndex(h => h.includes(n));
      if(partial !== -1) return partial;
    }

    return -1;
  }

  function parseDateFR(v){
    if(!v) return null;
    const txt = v.toString().trim();

    if(/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

    const parts = txt.split(/[\/.-]/);
    if(parts.length !== 3) return null;

    let d = parts[0];
    let m = parts[1];
    let y = parts[2];

    if(y.length === 2) y = "20" + y;

    return y + "-" + String(m).padStart(2,"0") + "-" + String(d).padStart(2,"0");
  }

  function safeDate(iso){
    if(!iso) return new Date(NaN);
    const p = iso.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function formatDateFR(iso){
    const d = safeDate(iso);
    if(isNaN(d.getTime())) return "Date invalide";
    return d.toLocaleDateString("fr-FR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
  }

  function formatTime(v){
    if(!v) return "Non précisée";
    return v.toString().trim().slice(0,5);
  }

  function statusInfo(v){
    const s = norm(v);
    if(s.includes("deplacer")) return { kind:"move", label:"À déplacer" };
    if(s.includes("refuse")) return { kind:"refused", label:"Refusé" };
    if(s.includes("accepte")) return { kind:"accepted", label:"Accepté" };
    return { kind:"pending", label:"En attente" };
  }

  function isAllDay(v){
    const s = norm(v);
    return s.includes("journee entiere") || s.includes("toute la journee");
  }

  function roomInfo(v){
    const s = norm(v);

    if(s.includes("auditorium")) return { key:"auditorium", short:"Aud.", label:"Auditorium", capacity:"200 places" };
    if(s.includes("orchestre")) return { key:"orchestre", short:"Orch.", label:"Salle d’orchestre", capacity:"40 places" };
    if(s.includes("chant")) return { key:"chant", short:"Chant", label:"Salle de chant", capacity:"40 places" };
    if(s.includes("danse")) return { key:"danse", short:"Danse", label:"Studio de danse", capacity:"40 places" };
    if(s.includes("theatre") || s.includes("théâtre")) return { key:"theatre", short:"Théâtre", label:"Salle de théâtre", capacity:"40 places" };
    if(s.includes("exterieur") || s.includes("extérieur")) return { key:"exterieur", short:"Ext.", label:"Extérieur", capacity:"" };

    return { key:"autre", short:"Autre", label:v || "Autre / à définir", capacity:"" };
  }

  function buildTimeSlots(start, end, step){
    const slots = [];
    let t = timeToMinutes(start);
    const max = timeToMinutes(end);

    while(t < max){
      slots.push(t);
      t += step;
    }

    return slots;
  }

  function minutesToTime(total){
    const h = Math.floor(total / 60);
    const m = total % 60;
    return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0");
  }

  function timeToMinutes(time){
    if(!time || time === "Journée entière") return null;

    const parts = time.split(":");
    if(parts.length < 2) return null;

    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);

    if(isNaN(h) || isNaN(m)) return null;

    return h * 60 + m;
  }

  function durationToMinutes(duration){
    const d = norm(duration);

    if(d.includes("45")) return 45;
    if(d.includes("30")) return 30;
    if(d.includes("1h30") || d.includes("1 h 30")) return 90;
    if(d.includes("2h") || d.includes("2 h")) return 120;
    if(d.includes("1h") || d.includes("1 h")) return 60;
    if(d.includes("demi")) return 180;
    if(d.includes("journee")) return null;

    return 60;
  }

  function eventStartMinutes(ev){
    if(ev.allDay) return timeToMinutes("08:30");
    return timeToMinutes(ev.time);
  }

  function eventEndMinutes(ev){
    if(ev.allDay) return timeToMinutes("21:00");

    const start = eventStartMinutes(ev);
    if(start === null) return null;

    return start + durationToMinutes(ev.duration);
  }

  function eventOccupiesSlot(ev, slotStart){
    if(ev.allDay) return true;

    const start = eventStartMinutes(ev);
    const end = eventEndMinutes(ev);

    if(start === null || end === null) return false;

    return slotStart >= start && slotStart < end;
  }

  function isSchoolDay(dateIso){
    return ["2026-06-15","2026-06-16","2026-06-18","2026-06-19"].includes(dateIso);
  }

  function momentFromEvent(ev){
    if(ev.allDay) return "journee";

    const minutes = timeToMinutes(ev.time);
    if(minutes === null) return "apresmidi";

    if(minutes < 12 * 60) return "matin";
    if(minutes < 17 * 60) return "apresmidi";
    return "soir";
  }

  function isPermanentExpo(ev){
    const title = norm(ev.title);
    const room = norm(ev.roomLabel);
    return ev.allDay && (title.includes("cuivre") || room.includes("chant"));
  }

  function isRealProgramming(ev){
    return !isPermanentExpo(ev) && ev.statusKind !== "refused";
  }

  function isSchoolTime(ev){
    if(!isSchoolDay(ev.dateIso)) return false;

    if(ev.allDay){
      return !isPermanentExpo(ev);
    }

    const minutes = timeToMinutes(ev.time);
    if(minutes === null) return false;

    const morningStart = 8 * 60 + 30;
    const morningEnd = 12 * 60;
    const afternoonStart = 13 * 60;
    const afternoonEnd = 17 * 60;

    return (
      (minutes >= morningStart && minutes < morningEnd) ||
      (minutes >= afternoonStart && minutes < afternoonEnd)
    );
  }

  function isOutOfSchoolTime(ev){
    return !isSchoolTime(ev);
  }

  function schoolSlotKey(ev){
    if(!isSchoolDay(ev.dateIso)) return null;
    if(ev.allDay && !isPermanentExpo(ev)) return "journee";

    const minutes = timeToMinutes(ev.time);
    if(minutes === null) return null;

    if(minutes >= 8 * 60 + 30 && minutes < 12 * 60) return "matin";
    if(minutes >= 13 * 60 && minutes < 17 * 60) return "apresmidi";

    return null;
  }

  function selectedStatuses(){
    return Array.from(root.querySelectorAll(".jps-status-filter"))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function visibleEvents(){
    const selected = selectedStatuses();

    return allEvents
      .filter(e => selected.includes(e.statusKind))
      .sort((a,b) => {
        if(a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        const aStart = eventStartMinutes(a) || 0;
        const bStart = eventStartMinutes(b) || 0;
        return aStart - bStart;
      });
  }

  function getDayConflicts(events){
    const map = {};

    events.filter(isRealProgramming).forEach(ev => {
      if(ev.allDay) return;
      const key = ev.dateIso + "|" + ev.time + "|" + ev.roomKey;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.values(map).filter(n => n > 1).length;
  }

  function getEmptySchoolSlotsForDay(dayIso, events){
    if(!isSchoolDay(dayIso)) return [];

    const dayEvents = events.filter(e => e.dateIso === dayIso && isRealProgramming(e));
    const hasMorning = dayEvents.some(e => schoolSlotKey(e) === "matin" || schoolSlotKey(e) === "journee");
    const hasAfternoon = dayEvents.some(e => schoolSlotKey(e) === "apresmidi" || schoolSlotKey(e) === "journee");

    const empty = [];
    if(!hasMorning) empty.push("matin");
    if(!hasAfternoon) empty.push("après-midi");
    return empty;
  }

  function openModal(ev){
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
    $("jps-m-bookable").textContent = ev.allDay ? "Oui — créneaux de 30 ou 45 minutes possibles pour les établissements." : "Non renseigné";
    $("jps-m-flex").textContent = ev.flexibility || "—";
    $("jps-m-alt").textContent = ev.alternatives || "—";
    $("jps-m-tech").textContent = ev.tech || "—";
    $("jps-m-desc").textContent = ev.description || "—";
    $("jps-m-status").textContent = ev.statusLabel || "—";
    $("jps-modal").classList.add("open");
  }

  function closeModal(){
    $("jps-modal").classList.remove("open");
  }

  function closeDayModal(){
    $("jps-day-modal").classList.remove("open");
  }

  function renderStats(data){
    $("jps-total").textContent = data.length;
    $("jps-accepted").textContent = data.filter(e => e.statusKind === "accepted").length;
    $("jps-pending").textContent = data.filter(e => e.statusKind === "pending").length;
    $("jps-move").textContent = data.filter(e => e.statusKind === "move").length;
    $("jps-refused").textContent = data.filter(e => e.statusKind === "refused").length;
    $("jps-count").textContent = data.length > 1 ? data.length + " propositions" : data.length + " proposition";
  }

  function renderAlerts(data){
    const realData = data.filter(isRealProgramming);
    const schoolTimeEvents = realData.filter(isSchoolTime);
    const outOfSchoolEvents = realData.filter(isOutOfSchoolTime);

    const emptySchoolSlots = [];

    DAYS.filter(d => d.group === "school").forEach(day => {
      const empty = getEmptySchoolSlotsForDay(day.iso, data);
      empty.forEach(slot => {
        emptySchoolSlots.push(day.name + " " + slot);
      });
    });

    const conflicts = getDayConflicts(realData);
    const permanentCount = data.filter(isPermanentExpo).length;

    $("jps-alerts").innerHTML =
      '<div class="jps-alert ' + (emptySchoolSlots.length ? "empty" : "ok") + '">' +
        '<strong>Créneaux scolaires non comblés</strong>' +
        (emptySchoolSlots.length ? esc(emptySchoolSlots.join(", ")) : "Tous les créneaux scolaires ont au moins une proposition hors fil rouge.") +
      '</div>' +
      '<div class="jps-alert ' + (schoolTimeEvents.length < 4 ? "low" : "ok") + '">' +
        '<strong>Temps scolaire réel</strong>' +
        schoolTimeEvents.length + ' proposition(s) entre 08h30–12h00 / 13h00–17h00, hors expo permanente.' +
        '<br>Hors temps scolaire / tout public : ' + outOfSchoolEvents.length +
      '</div>' +
      '<div class="jps-alert ' + (conflicts ? "low" : "ok") + '">' +
        '<strong>Litiges / chevauchements</strong>' +
        (conflicts ? conflicts + ' chevauchement(s) dans une même salle.' : "Aucun litige majeur détecté dans une même salle.") +
        '<br>Fil rouge / expo permanente : ' + permanentCount +
      '</div>';
  }

  function slotSummary(dayIso, momentKey, data, mode){
    let events;

    if(mode === "school"){
      events = data.filter(e => {
        if(e.dateIso !== dayIso) return false;
        if(!isSchoolTime(e)) return false;
        const key = schoolSlotKey(e);
        return key === momentKey || key === "journee";
      });
    } else {
      events = data.filter(e => e.dateIso === dayIso && momentFromEvent(e) === momentKey);
    }

    const realEvents = events.filter(isRealProgramming);
    const permanentEvents = events.filter(isPermanentExpo);

    let scoreClass = "empty";
    let scoreText = "Vide";

    if(realEvents.length === 1){
      scoreClass = "low";
      scoreText = "1 action";
    } else if(realEvents.length === 2){
      scoreClass = "ok";
      scoreText = "2 actions";
    } else if(realEvents.length >= 3){
      scoreClass = "full";
      scoreText = realEvents.length + " actions";
    } else if(permanentEvents.length){
      scoreClass = "low";
      scoreText = "Fil rouge";
    }

    return { events, realEvents, permanentEvents, scoreClass, scoreText };
  }

  function renderFrise(containerId, group, data){
    const container = $(containerId);
    container.innerHTML = "";

    const moments = group === "school" ? SCHOOL_MOMENTS : PUBLIC_MOMENTS;
    const mode = group === "school" ? "school" : "public";

    DAYS.filter(day => day.group === group).forEach(day => {
      const dayBox = document.createElement("section");
      dayBox.className = "jps-frise-day";

      dayBox.innerHTML =
        '<div class="jps-frise-head">' +
          '<div class="jps-frise-name">' + esc(day.name) + '</div>' +
          '<div class="jps-frise-date">' + esc(day.short) + '</div>' +
        '</div>' +
        '<div class="jps-frise-body"></div>';

      const body = dayBox.querySelector(".jps-frise-body");

      moments.forEach(moment => {
        const summary = slotSummary(day.iso, moment.key, data, mode);

        const slot = document.createElement("div");
        slot.className = "jps-frise-slot";

        slot.innerHTML =
          '<div class="jps-frise-slothead">' +
            '<span class="jps-frise-slotname">' + esc(moment.label) + '</span>' +
            '<span class="jps-frise-score ' + summary.scoreClass + '">' + esc(summary.scoreText) + '</span>' +
          '</div>' +
          (moment.period ? '<div class="jps-count" style="margin-bottom:7px">' + esc(moment.period) + '</div>' : '') +
          '<div class="jps-roomchips"></div>';

        const chips = slot.querySelector(".jps-roomchips");

        if(!summary.events.length){
          chips.innerHTML = '<span class="jps-roomchip empty">Aucune salle mobilisée</span>';
        } else {
          const byRoom = {};
          summary.events.forEach(ev => {
            if(!byRoom[ev.roomKey]) byRoom[ev.roomKey] = [];
            byRoom[ev.roomKey].push(ev);
          });

          Object.keys(byRoom).forEach(roomKey => {
            const evs = byRoom[roomKey];
            const main = evs[0];
            const chip = document.createElement("span");
            chip.className = "jps-roomchip " + (isPermanentExpo(main) ? "permanent" : main.statusKind);
            chip.textContent = main.roomShort + " · " + evs.length;
            chips.appendChild(chip);
          });
        }

        body.appendChild(slot);
      });

      dayBox.addEventListener("click", function () {
        openDayModal(day.iso);
      });

      container.appendChild(dayBox);
    });
  }

  function renderDayButtons(data){
    const container = $("jps-day-buttons");
    container.innerHTML = "";

    DAYS.forEach(day => {
      const dayEvents = data.filter(e => e.dateIso === day.iso);
      const realEvents = dayEvents.filter(isRealProgramming);
      const permanent = dayEvents.filter(isPermanentExpo);
      const rooms = Array.from(new Set(dayEvents.map(e => e.roomShort).filter(Boolean)));
      const conflicts = getDayConflicts(dayEvents);
      const emptySchoolSlots = getEmptySchoolSlotsForDay(day.iso, data);
      const schoolEvents = dayEvents.filter(e => isRealProgramming(e) && isSchoolTime(e));

      let warningClass = "ok";
      let warningText = "Programmation à suivre";

      if(conflicts){
        warningClass = "conflict";
        warningText = conflicts + " litige(s) salle / horaire";
      } else if(isSchoolDay(day.iso) && emptySchoolSlots.length){
        warningClass = "empty";
        warningText = "Créneau(x) scolaire(s) à combler : " + emptySchoolSlots.join(", ");
      } else if(isSchoolDay(day.iso)){
        warningClass = "ok";
        warningText = schoolEvents.length + " proposition(s) sur temps scolaire";
      } else if(!realEvents.length){
        warningClass = "empty";
        warningText = "À combler hors expo permanente";
      } else {
        warningClass = "ok";
        warningText = realEvents.length + " proposition(s) hors fil rouge";
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jps-day-btn";

      btn.innerHTML =
        '<div class="jps-day-btn-top">' +
          '<div><div class="jps-day-btn-name">' + esc(day.name) + '</div><div class="jps-day-btn-date">' + esc(day.short) + '</div></div>' +
          '<span class="jps-day-btn-count">' + dayEvents.length + '</span>' +
        '</div>' +
        '<div class="jps-day-btn-meta">' +
          '<strong>Salles :</strong> ' + esc(rooms.length ? rooms.join(", ") : "aucune") + '<br>' +
          '<strong>Fil rouge :</strong> ' + permanent.length + ' · <strong>Hors fil rouge :</strong> ' + realEvents.length +
        '</div>' +
        '<div class="jps-day-btn-warning ' + warningClass + '">' + esc(warningText) + '</div>';

      btn.onclick = function () {
        openDayModal(day.iso);
      };

      container.appendChild(btn);
    });
  }

  function renderEventCard(ev){
    const div = document.createElement("div");
    div.className = "jps-slot-card " + (isPermanentExpo(ev) ? "permanent" : ev.statusKind);

    const end = ev.allDay ? "" : eventEndMinutes(ev);
    const timeLabel = ev.allDay
      ? "Créneau disponible"
      : ev.time + (end ? "–" + minutesToTime(end) : "");

    div.innerHTML =
      '<span class="jps-slot-time">' + esc(timeLabel) + '</span>' +
      '<span class="jps-slot-title">' + esc(ev.title) + '</span>' +
      '<span class="jps-slot-meta">' + esc(ev.statusLabel) + (isPermanentExpo(ev) ? " · Fil rouge" : "") + '</span>';

    div.onclick = function (e) {
      e.stopPropagation();
      openModal(ev);
    };

    return div;
  }

  function openDayModal(dayIso){
    const data = visibleEvents();
    const day = DAYS.find(d => d.iso === dayIso);
    const dayEvents = data.filter(e => e.dateIso === dayIso);

    $("jps-day-modal-title").textContent = day.name + " " + day.short;
    $("jps-day-modal-sub").textContent =
      "Planning par créneaux de 30 minutes et par salle. Les expositions / journées entières sont répétées sur chaque créneau afin de préparer les réservations des établissements.";

    const detail = $("jps-day-detail");
    detail.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "jps-timetable-wrap";

    const table = document.createElement("div");
    table.className = "jps-timetable";

    table.innerHTML =
      '<div class="jps-th">Horaire</div>' +
      ROOMS.map(room => '<div class="jps-th">' + esc(room.label) + '<br><span class="jps-count">' + esc(room.capacity) + '</span></div>').join("");

    TIME_SLOTS.forEach(slot => {
      const hour = document.createElement("div");
      hour.className = "jps-hour";
      hour.textContent = minutesToTime(slot).replace(":", "h");
      table.appendChild(hour);

      ROOMS.forEach(room => {
        const cell = document.createElement("div");
        const isSchoolSlot = isSchoolDay(dayIso) && (
          (slot >= 8 * 60 + 30 && slot < 12 * 60) ||
          (slot >= 13 * 60 && slot < 17 * 60)
        );

        cell.className = "jps-cell " + (isSchoolSlot ? "schooltime" : "");

        const events = dayEvents.filter(ev => {
          return ev.roomKey === room.key && eventOccupiesSlot(ev, slot);
        });

        if(!events.length){
          cell.classList.add("empty");
          cell.innerHTML = '<div class="jps-slot-empty">Libre</div>';
        } else {
          events.forEach(ev => {
            cell.appendChild(renderEventCard(ev));
          });
        }

        table.appendChild(cell);
      });
    });

    wrap.appendChild(table);
    detail.appendChild(wrap);

    $("jps-day-modal").classList.add("open");
  }

  function getListEvents(data){
    const seenPermanent = {};
    const result = [];

    data.forEach(ev => {
      if(isPermanentExpo(ev)){
        const key = norm(ev.title) + "|" + norm(ev.roomLabel);
        if(seenPermanent[key]) return;
        seenPermanent[key] = true;
      }
      result.push(ev);
    });

    return result;
  }

  function renderList(data){
    const list = $("jps-list");
    const listEvents = getListEvents(data);

    list.innerHTML = "";

    $("jps-list-count").textContent =
      listEvents.length > 1 ? listEvents.length + " éléments" : listEvents.length + " élément";

    if(!listEvents.length){
      list.innerHTML = '<div class="jps-empty">Aucune proposition à afficher.</div>';
      return;
    }

    listEvents.forEach(ev => {
      const item = document.createElement("div");
      item.className = "jps-item " + ev.statusKind;

      const permanentNote = isPermanentExpo(ev)
        ? '<div><strong>Affichage :</strong> proposition permanente affichée une seule fois dans cette liste.</div>'
        : '';

      item.innerHTML =
        '<div class="jps-itemtitle">' + esc(ev.title) + '</div>' +
        '<div class="jps-itemmeta">' +
          '<div><strong>Date :</strong> ' + esc(isPermanentExpo(ev) ? "Toute la semaine" : formatDateFR(ev.dateIso)) + '</div>' +
          '<div><strong>Horaire :</strong> ' + esc(ev.allDay ? "Journée entière / créneaux réservables" : ev.time) + '</div>' +
          '<div><strong>Lieu :</strong> ' + esc(ev.roomLabel) + '</div>' +
          '<div><strong>Public :</strong> ' + esc(ev.publicTarget || "—") + '</div>' +
          permanentNote +
        '</div>' +
        '<div class="jps-badges">' +
          '<span class="jps-badge ' + ev.statusKind + '">' + esc(ev.statusLabel) + '</span>' +
          '<span class="jps-badge jps-roomtag">' + esc(ev.roomLabel) + '</span>' +
          (isPermanentExpo(ev) ? '<span class="jps-badge jps-permanenttag">Fil rouge</span>' : '') +
        '</div>';

      item.onclick = () => openModal(ev);
      list.appendChild(item);
    });
  }

  function refresh(){
    const data = visibleEvents();

    renderStats(data);
    renderAlerts(data);
    renderDayButtons(data);
    renderFrise("jps-school-frise", "school", data);
    renderFrise("jps-public-frise", "public", data);
    renderList(data);

    const schoolCount = data.filter(e => isRealProgramming(e) && isSchoolTime(e)).length;
    const publicCount = data.filter(e => isRealProgramming(e) && isOutOfSchoolTime(e)).length;

    $("jps-school-count").textContent = schoolCount + " proposition(s) temps scolaire";
    $("jps-public-count").textContent = publicCount + " proposition(s) mercredi/week-end/hors temps scolaire";
  }

  $("jps-close").onclick = closeModal;
  $("jps-modal").onclick = e => { if(e.target === $("jps-modal")) closeModal(); };

  $("jps-day-close").onclick = closeDayModal;
  $("jps-day-modal").onclick = e => { if(e.target === $("jps-day-modal")) closeDayModal(); };

  root.querySelectorAll(".jps-status-filter").forEach(cb => {
    cb.addEventListener("change", refresh);
  });

  fetch(CSV_URL)
    .then(r => {
      if(!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(text => {
      const rows = parseCSV(text);
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);

      const C_NAME = findCol(headers, ["Nom et prénom","Nom"]);
      const C_DISC = findCol(headers, ["Discipline / département","Discipline"]);
      const C_TITLE = findCol(headers, ["Intitulé du projet","Intitule du projet","Projet"]);
      const C_TYPE = findCol(headers, ["Type de proposition","Type"]);
      const C_PUBLIC = findCol(headers, ["Public visé","Public"]);
      const C_DATE = findCol(headers, ["Date souhaitée","Date"]);
      const C_TIME = findCol(headers, ["Horaire de début","Horaire","Heure"]);
      const C_DUR = findCol(headers, ["Durée estimée","Durée"]);
      const C_FLEX = findCol(headers, ["Flexibilité du créneau","Flexibilité"]);
      const C_ALT = findCol(headers, ["Si oui, précisez","alternatives"]);
      const C_ROOM = findCol(headers, ["Lieu souhaité","Lieu"]);
      const C_CAP = findCol(headers, ["Nombre estimé","spectateurs","participants"]);
      const C_TECH = findCol(headers, ["Besoins techniques"]);
      const C_DESC = findCol(headers, ["Description courte","programmation","communication"]);
      const C_STATUS = findCol(headers, ["STATUT","Statut"]);

      if([C_TITLE,C_DATE,C_ROOM,C_STATUS].some(i => i === -1)){
        throw new Error("Colonnes introuvables : vérifie Intitulé du projet, Date souhaitée, Lieu souhaité et STATUT.");
      }

      allEvents = dataRows.map(row => {
        const dateIso = parseDateFR(row[C_DATE]);
        if(!dateIso || dateIso < "2026-06-15" || dateIso > "2026-06-21") return null;

        const status = statusInfo(row[C_STATUS]);
        const room = roomInfo(row[C_ROOM]);
        const duration = C_DUR !== -1 ? row[C_DUR] : "";
        const allDay = isAllDay(duration);

        if(!["auditorium","chant","orchestre","theatre","danse"].includes(room.key)){
          return null;
        }

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
          roomShort: room.short,
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

      if(!allEvents.length){
        $("jps-error").textContent = "Aucune proposition trouvée entre le 15 et le 21 juin 2026.";
      }
    })
    .catch(err => {
      $("jps-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
