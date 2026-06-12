// V39 ECOLES : base V34 fonctionnelle, modification unique = jauge auditorium 180.
document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jps-ecoles");
  if (!root) {
    root = document.createElement("div");
    root.id = "jps-ecoles";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";

  const DEMANDES_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";

  const FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSft8sOo5NyYM601oxbWL8yxUpNus4fpw-u4-WJN8Al-tzajIA/viewform";

  const ENTRY_DETAIL = "entry.644632031";
  const ENTRY_IDS = "entry.820169616";
  const STORAGE_KEY = "jps_ecoles_v39_panier";
  const LAST_GROUP_KEY = "jps_ecoles_v39_last_group";

  const DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15/06" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16/06" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17/06" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18/06" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19/06" }
  ];

  const AUTO_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
  const AUTO_SLOTS = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
    ["16:00", "17:00"]
  ];

  const ROOM_DEFAULTS = {
    auditorium: { label: "Auditorium", short: "Aud.", capacity: 180, pole: "Auditorium / présentations" },
    orchestre: { label: "Salle d’orchestre", short: "Orch.", capacity: 35, pole: "Orchestre / instruments" },
    chant: { label: "Salle de chant", short: "Chant", capacity: 35, pole: "Voix / chant / chœur" },
    choeur: { label: "Salle de chœur", short: "Chœur", capacity: 35, pole: "Voix / chant / chœur" },
    theatre: { label: "Salle de théâtre", short: "Théâtre", capacity: 35, pole: "Théâtre" },
    danse1: { label: "Studio de danse 1", short: "Danse 1", capacity: 35, pole: "Danse" },
    danse2: { label: "Studio de danse 2", short: "Danse 2", capacity: 35, pole: "Danse" },
    danse3: { label: "Studio de danse 3", short: "Danse 3", capacity: 35, pole: "Danse" },
    other: { label: "Autre espace / salle précisée", short: "Autre", capacity: 35, pole: "Autre salle / petit groupe" },
    any: { label: "À arbitrer", short: "À arbitrer", capacity: 35, pole: "À arbitrer" }
  };

  let allSlots = [];
  let activeDay = "2026-06-15";
  let cart = loadCart();
  let currentSlot = null;
  let autoWantedDuration = 60;
  let autoWantedPeriod = "all";
  let autoRoute = [];
  let levelFilter = "all";
  let poleFilter = "all";
  let periodFilter = "all";

  root.innerHTML = `
    <style>
      #jps-ecoles{
        --text:#111827;
        --muted:#64748b;
        --border:#e5e7eb;
        --soft:#f8fafc;
        --blue:#2563eb;
        --green:#16a34a;
        --orange:#f97316;
        --red:#dc2626;
        font-family:Arial,sans-serif;
        color:var(--text);
        width:100%;
      }

      #jps-ecoles *{box-sizing:border-box}

      #jps-ecoles .wrap{
        max-width:1080px;
        margin:0 auto;
        background:#fff;
        border:1px solid var(--border);
        border-radius:26px;
        overflow:hidden;
        box-shadow:0 18px 50px rgba(15,23,42,.08);
      }

      #jps-ecoles .head{
        padding:30px;
        background:
          radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),
          radial-gradient(circle at top left,rgba(22,163,74,.11),transparent 30%),
          #fff;
        border-bottom:1px solid var(--border);
      }

      #jps-ecoles h2{
        margin:0;
        font-size:clamp(28px,4vw,42px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #jps-ecoles .sub{
        margin:12px 0 0;
        color:var(--muted);
        font-size:16px;
        line-height:1.55;
        max-width:900px;
      }

      #jps-ecoles .notice{
        margin-top:18px;
        border:1px solid #bfdbfe;
        background:#eff6ff;
        color:#1e3a8a;
        border-radius:18px;
        padding:14px;
        font-size:14px;
        line-height:1.45;
        font-weight:800;
      }

      #jps-ecoles .intro{
        margin-top:18px;
        border:1px solid #e5e7eb;
        background:#fff;
        border-radius:20px;
        padding:16px;
        color:#334155;
        font-size:14px;
        line-height:1.6;
        font-weight:750;
      }

      #jps-ecoles .intro strong{
        color:#111827;
        font-weight:900;
      }

      #jps-ecoles .intro .corsu{
        margin-top:10px;
        color:#111827;
        font-weight:900;
      }

      #jps-ecoles .contactbox{
        margin-top:16px;
        border:1px solid #bbf7d0;
        background:#f0fdf4;
        color:#14532d;
        border-radius:18px;
        padding:14px;
        font-size:14px;
        line-height:1.45;
        font-weight:800;
      }

      #jps-ecoles .contactbox strong{
        display:block;
        margin-bottom:5px;
        color:#166534;
        font-size:15px;
      }

      #jps-ecoles .contact-actions{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:10px;
      }

      #jps-ecoles .contact-actions a{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        text-decoration:none;
        border-radius:999px;
        padding:9px 12px;
        font-size:13px;
        font-weight:900;
      }

      #jps-ecoles .contact-actions .mail{
        background:#166534;
        color:#fff;
      }

      #jps-ecoles .contact-actions .phone{
        border:1px solid #86efac;
        background:#fff;
        color:#166534;
      }

      #jps-ecoles .content{padding:22px}

      #jps-ecoles .steps{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:10px;
        margin-bottom:18px;
      }

      #jps-ecoles .step{
        border:1px solid var(--border);
        border-radius:18px;
        padding:13px;
        background:#fff;
      }

      #jps-ecoles .step strong{
        display:block;
        font-size:14px;
        margin-bottom:4px;
      }

      #jps-ecoles .step span{
        color:var(--muted);
        font-size:12px;
        font-weight:800;
        line-height:1.35;
      }

      #jps-ecoles .stats{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:10px;
        margin-bottom:18px;
      }

      #jps-ecoles .stat{
        border:1px solid var(--border);
        border-radius:16px;
        padding:13px;
        background:#fff;
      }

      #jps-ecoles .num{
        font-size:26px;
        font-weight:900;
        line-height:1;
      }

      #jps-ecoles .lab{
        margin-top:5px;
        color:var(--muted);
        font-size:12px;
        font-weight:800;
        line-height:1.3;
      }

      #jps-ecoles .filters{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(135px,1fr));
        gap:8px;
        margin-bottom:20px;
      }

      #jps-ecoles .filter{
        border:1px solid #d1d5db;
        background:#fff;
        border-radius:16px;
        padding:12px 14px;
        font-size:14px;
        font-weight:900;
        cursor:pointer;
        text-align:center;
      }

      #jps-ecoles .filter.active{
        background:#111827;
        color:#fff;
        border-color:#111827;
        box-shadow:0 10px 22px rgba(15,23,42,.14);
      }

      #jps-ecoles .day{
        border:1px solid #e7eaee;
        border-radius:24px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .dayhead{
        display:flex;
        justify-content:space-between;
        gap:12px;
        padding:20px;
        background:#f8fafc;
        border-bottom:1px solid var(--border);
      }

      #jps-ecoles .daytitle{
        font-size:24px;
        font-weight:900;
        text-transform:uppercase;
        letter-spacing:-.03em;
      }

      #jps-ecoles .daymeta{
        margin-top:4px;
        color:var(--muted);
        font-size:14px;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .badge{
        align-self:flex-start;
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:7px 10px;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #jps-ecoles .daybody{padding:16px}

      #jps-ecoles .choice-hint{
        margin:0 0 16px;
        color:#475569;
        font-weight:800;
        line-height:1.45;
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:16px;
        padding:13px;
      }

      #jps-ecoles .timegroup{
        margin-bottom:18px;
        border:1px solid #e7eaee;
        border-radius:22px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .timegroup.window{
        border-color:#bfdbfe;
        box-shadow:0 10px 26px rgba(37,99,235,.05);
      }

      #jps-ecoles .window-note{
        display:inline-flex;
        align-items:center;
        border-radius:999px;
        background:#dbeafe;
        color:#1e40af;
        padding:4px 8px;
        font-size:11px;
        font-weight:900;
        margin-top:6px;
      }

      #jps-ecoles .start-columns{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
        gap:12px;
      }

      #jps-ecoles .start-column{
        border:1px solid #e5e7eb;
        border-radius:18px;
        background:#fbfcfd;
        padding:10px;
      }

      #jps-ecoles .start-column-title{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
        margin-bottom:10px;
        padding:4px 2px;
        color:#334155;
        font-size:13px;
        font-weight:900;
      }

      #jps-ecoles .start-column-title span{
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:4px 7px;
        font-size:11px;
        font-weight:900;
      }

      #jps-ecoles .start-column .grid{
        grid-template-columns:1fr;
      }

      #jps-ecoles .timegroup-head{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        padding:16px 18px;
        background:#f8fafc;
        border-bottom:1px solid var(--border);
      }

      #jps-ecoles .timegroup-title{
        font-size:23px;
        font-weight:900;
        letter-spacing:-.03em;
      }

      #jps-ecoles .timegroup-sub{
        font-size:13px;
        font-weight:800;
        color:var(--muted);
        margin-top:3px;
      }

      #jps-ecoles .timegroup-count{
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:6px 10px;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #jps-ecoles .timegroup-body{padding:14px}

      #jps-ecoles .grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
        gap:12px;
      }

      #jps-ecoles .card{
        border:1px solid var(--border);
        border-radius:20px;
        overflow:hidden;
        background:#fff;
        transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;
      }

      #jps-ecoles .card:not(.is-full):hover{
        transform:translateY(-2px);
        box-shadow:0 14px 30px rgba(15,23,42,.08);
        border-color:#cbd5e1;
      }

      #jps-ecoles .card.is-full{
        background:#f8fafc;
        opacity:.74;
      }

      #jps-ecoles .top{
        padding:14px;
        background:#fbfcfd;
        border-bottom:1px solid #edf0f3;
      }

      #jps-ecoles .choice-label{
        display:inline-flex;
        align-items:center;
        gap:6px;
        border-radius:999px;
        background:#eef2ff;
        color:#3730a3;
        padding:5px 9px;
        font-size:11px;
        font-weight:900;
      }

      #jps-ecoles .title{
        margin-top:8px;
        font-size:18px;
        line-height:1.25;
        font-weight:900;
      }

      #jps-ecoles .simple-meta{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        margin-top:8px;
      }

      #jps-ecoles .simple-pill{
        border-radius:999px;
        background:#f1f5f9;
        color:#334155;
        padding:5px 8px;
        font-size:11px;
        font-weight:900;
      }

      #jps-ecoles .desc-preview{
        margin:10px 0 0;
        color:#475569;
        font-size:13px;
        line-height:1.45;
        font-weight:700;
      }

      #jps-ecoles .body{padding:14px}

      #jps-ecoles .simple-remaining{
        display:flex;
        align-items:baseline;
        gap:6px;
        margin:4px 0 8px;
      }

      #jps-ecoles .simple-remaining strong{
        font-size:34px;
        line-height:1;
        font-weight:900;
        color:#166534;
      }

      #jps-ecoles .simple-remaining span{
        font-size:13px;
        color:#475569;
        font-weight:900;
      }

      #jps-ecoles .simple-remaining.low strong{color:#9a3412}
      #jps-ecoles .simple-remaining.zero strong{color:#991b1b}

      #jps-ecoles .meta{
        color:#475569;
        font-size:13px;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .card-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:12px;
      }

      #jps-ecoles button{font-family:inherit}

      #jps-ecoles .btn,
      #jps-ecoles .btn2{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border-radius:14px;
        padding:12px 14px;
        font-size:14px;
        font-weight:900;
        text-align:center;
        cursor:pointer;
      }

      #jps-ecoles .btn{
        border:0;
        background:#111827;
        color:#fff;
      }

      #jps-ecoles .btn.disabled{
        background:#cbd5e1;
        color:#475569;
        pointer-events:none;
      }

      #jps-ecoles .btn2{
        border:1px solid #d1d5db;
        background:#fff;
        color:#111827;
      }

      #jps-ecoles .empty{
        border:1px dashed #cbd5e1;
        border-radius:18px;
        padding:18px;
        background:#fbfcfd;
        color:#64748b;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .error{
        color:#b91c1c;
        font-weight:900;
        white-space:pre-wrap;
      }

      #jps-ecoles .cartbar{
        position:sticky;
        bottom:14px;
        z-index:50;
        margin:22px auto 0;
        max-width:1080px;
        border:1px solid #c7d2fe;
        background:#eef2ff;
        border-radius:22px;
        padding:14px;
        box-shadow:0 18px 50px rgba(15,23,42,.12);
      }

      #jps-ecoles .cartinner{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
      }

      #jps-ecoles .carttitle{
        font-weight:900;
        font-size:16px;
      }

      #jps-ecoles .cartmeta{
        margin-top:3px;
        color:#4338ca;
        font-size:13px;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .cartpreview{
        margin-top:8px;
        display:grid;
        gap:6px;
        color:#312e81;
        font-size:12px;
        font-weight:850;
        line-height:1.35;
      }

      #jps-ecoles .cartpreview-date{
        margin-top:2px;
        color:#1e1b4b;
        font-weight:900;
      }

      #jps-ecoles .cartpreview-line{
        padding-left:10px;
        border-left:3px solid #c7d2fe;
      }

      #jps-ecoles .cartpreview-more{
        color:#64748b;
        font-weight:800;
      }

      #jps-ecoles .modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:999999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #jps-ecoles .modal.open{display:flex}

      #jps-ecoles .box{
        width:min(900px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #jps-ecoles .close{
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #jps-ecoles .modaltitle{
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.15;
        font-weight:900;
      }

      #jps-ecoles .row{
        display:grid;
        grid-template-columns:180px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #jps-ecoles .row:last-child{border-bottom:0}
      #jps-ecoles .label{font-weight:900}

      #jps-ecoles .formgrid{
        display:grid;
        grid-template-columns:2fr 1fr 1fr;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .field label{
        display:block;
        font-size:12px;
        color:#475569;
        font-weight:900;
        margin-bottom:5px;
        text-transform:uppercase;
      }

      #jps-ecoles .field input{
        width:100%;
        border:1px solid #cbd5e1;
        border-radius:14px;
        padding:12px;
        font-size:15px;
        font-weight:800;
      }

      #jps-ecoles .help{
        margin-top:8px;
        color:#64748b;
        font-size:13px;
        font-weight:800;
        line-height:1.4;
      }

      #jps-ecoles .warning{
        margin-top:12px;
        border:1px solid #fed7aa;
        background:#fff7ed;
        color:#9a3412;
        border-radius:14px;
        padding:10px;
        font-size:13px;
        font-weight:900;
        line-height:1.35;
      }

      #jps-ecoles .reusebox{
        margin-top:14px;
        border:1px solid #c7d2fe;
        background:#eef2ff;
        color:#312e81;
        border-radius:16px;
        padding:12px;
        font-size:13px;
        font-weight:900;
        line-height:1.4;
      }

      #jps-ecoles .reusebox label{
        display:flex;
        gap:8px;
        align-items:flex-start;
        cursor:pointer;
      }

      #jps-ecoles .reusebox input{
        margin-top:2px;
      }

      #jps-ecoles .reusebox small{
        display:block;
        margin-top:6px;
        color:#475569;
        font-weight:800;
      }

      #jps-ecoles .actions{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .cartlist{
        display:flex;
        flex-direction:column;
        gap:12px;
        margin-top:14px;
      }

      #jps-ecoles .groupbox{
        border:1px solid #e5e7eb;
        border-radius:18px;
        background:#fff;
        overflow:hidden;
      }

      #jps-ecoles .grouphead{
        padding:13px 14px;
        background:#f8fafc;
        border-bottom:1px solid #e5e7eb;
        font-weight:900;
      }

      #jps-ecoles .cartitem{
        padding:13px 14px;
        border-bottom:1px dashed #e5e7eb;
      }

      #jps-ecoles .cartitem:last-child{border-bottom:0}

      #jps-ecoles .cartitemtitle{
        font-weight:900;
        line-height:1.3;
      }

      #jps-ecoles .cartitemmeta{
        margin-top:6px;
        font-size:13px;
        color:#475569;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .danger{
        border:1px solid #fecaca;
        background:#fff1f2;
        color:#991b1b;
        border-radius:12px;
        padding:9px 11px;
        font-size:13px;
        font-weight:900;
        cursor:pointer;
        margin-top:8px;
      }

      #jps-ecoles .conflict{
        margin-top:10px;
        border:1px solid #fed7aa;
        background:#fff7ed;
        color:#9a3412;
        border-radius:12px;
        padding:9px;
        font-size:12px;
        font-weight:900;
      }


      #jps-ecoles .tools{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
        gap:10px;
        margin:-4px 0 18px;
      }

      #jps-ecoles .toolbox{
        border:1px solid #e5e7eb;
        background:#fff;
        border-radius:18px;
        padding:12px;
      }

      #jps-ecoles .toolbox label{
        display:block;
        font-size:12px;
        color:#475569;
        font-weight:900;
        text-transform:uppercase;
        margin-bottom:6px;
      }

      #jps-ecoles .toolbox select{
        width:100%;
        border:1px solid #cbd5e1;
        border-radius:13px;
        padding:10px;
        font-size:14px;
        font-weight:800;
        background:#fff;
      }

      #jps-ecoles .quick-buttons{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
      }

      #jps-ecoles .quick-buttons button{
        border:1px solid #cbd5e1;
        background:#f8fafc;
        color:#111827;
        border-radius:999px;
        padding:9px 11px;
        font-size:12px;
        font-weight:900;
        cursor:pointer;
      }

      #jps-ecoles .quick-buttons button:hover{
        background:#111827;
        color:#fff;
        border-color:#111827;
      }

      #jps-ecoles .idea-actions{
        margin-top:10px;
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }

      #jps-ecoles .idea-actions button{
        border:0;
        background:#1e40af;
        color:#fff;
        border-radius:12px;
        padding:9px 11px;
        font-size:12px;
        font-weight:900;
        cursor:pointer;
      }

      #jps-ecoles .idea-note{
        color:#475569;
        font-size:12px;
        font-weight:800;
        margin-top:6px;
      }

      #jps-ecoles .suggestions{
        margin:0 0 18px;
        display:grid;
        gap:10px;
      }

      #jps-ecoles .suggestion{
        border:1px solid #bfdbfe;
        background:#eff6ff;
        color:#1e3a8a;
        border-radius:18px;
        padding:13px;
        font-size:13px;
        line-height:1.45;
        font-weight:800;
      }

      #jps-ecoles .suggestion strong{
        display:block;
        font-size:14px;
        margin-bottom:4px;
      }

      #jps-ecoles .suggestion span{
        display:block;
        color:#334155;
        margin-top:3px;
      }

      #jps-ecoles .auto-route{
        display:grid;
        gap:10px;
        margin-top:14px;
      }

      #jps-ecoles .auto-route-line{
        border:1px solid #bfdbfe;
        background:#eff6ff;
        color:#1e3a8a;
        border-radius:16px;
        padding:12px;
        font-weight:800;
        line-height:1.4;
      }

      #jps-ecoles .auto-route-line strong{
        display:block;
        margin-bottom:4px;
        font-size:14px;
      }

      #jps-ecoles .auto-route-empty{
        border:1px dashed #cbd5e1;
        background:#f8fafc;
        color:#64748b;
        border-radius:16px;
        padding:12px;
        font-weight:800;
        line-height:1.4;
      }

      #jps-ecoles .nextbox{
        margin-top:14px;
        border:1px solid #bbf7d0;
        background:#f0fdf4;
        border-radius:16px;
        padding:12px;
      }

      #jps-ecoles .nextbox-title{
        color:#166534;
        font-size:14px;
        font-weight:900;
        margin-bottom:6px;
      }

      #jps-ecoles .nextbox-help{
        color:#475569;
        font-size:12px;
        font-weight:800;
        line-height:1.35;
        margin-bottom:10px;
      }

      #jps-ecoles .nextlist{
        display:grid;
        gap:8px;
      }

      #jps-ecoles .nextitem{
        border:1px solid #bbf7d0;
        background:#fff;
        border-radius:14px;
        padding:10px;
      }

      #jps-ecoles .nextitem strong{
        display:block;
        color:#111827;
        font-size:13px;
        margin-bottom:3px;
      }

      #jps-ecoles .nextitem span{
        display:block;
        color:#475569;
        font-size:12px;
        font-weight:800;
        line-height:1.35;
      }

      #jps-ecoles .nextitem .next-actions{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        margin-top:8px;
      }

      #jps-ecoles .nextitem button{
        padding:8px 10px;
        font-size:12px;
        border-color:#86efac;
        background:#ecfdf5;
        color:#166534;
      }

      #jps-ecoles .nextitem button.next-info{
        border-color:#bfdbfe;
        background:#eff6ff;
        color:#1e40af;
      }

      #jps-ecoles .groupselect{
        margin-top:14px;
        border:1px solid #e5e7eb;
        background:#f8fafc;
        border-radius:16px;
        padding:12px;
      }

      #jps-ecoles .groupselect label{
        display:block;
        font-size:12px;
        color:#475569;
        font-weight:900;
        margin-bottom:6px;
        text-transform:uppercase;
      }

      #jps-ecoles .groupselect select{
        width:100%;
        border:1px solid #cbd5e1;
        border-radius:13px;
        padding:10px;
        font-size:14px;
        font-weight:800;
        background:#fff;
      }

      #jps-ecoles .confirm-summary{
        display:grid;
        gap:12px;
        margin-top:14px;
      }

      #jps-ecoles .confirm-total{
        border:1px solid #c7d2fe;
        background:#eef2ff;
        color:#312e81;
        border-radius:16px;
        padding:13px;
        font-weight:900;
        line-height:1.4;
      }

      #jps-ecoles .mini-timeline{
        display:grid;
        gap:8px;
      }

      #jps-ecoles .mini-line{
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:10px;
        background:#fff;
      }

      #jps-ecoles .mini-line strong{
        display:block;
        margin-bottom:4px;
      }

      @media(max-width:760px){
        #jps-ecoles .head,#jps-ecoles .content{padding:18px}
        #jps-ecoles .steps,#jps-ecoles .stats{grid-template-columns:1fr}
        #jps-ecoles .dayhead,.timegroup-head{flex-direction:column;align-items:flex-start}
        #jps-ecoles .grid{grid-template-columns:1fr}
        #jps-ecoles .row{grid-template-columns:1fr;gap:4px}
        #jps-ecoles .formgrid{grid-template-columns:1fr}
        #jps-ecoles .modal{padding:10px}
        #jps-ecoles .box{padding:20px;border-radius:20px}
      }
    </style>

    <div class="wrap">
      <div class="head">
        <h2>Semaine Portes ouvertes du Conservatoire Henri Tomasi (15-21 juin)</h2>
        <p class="sub">
          Le nouveau Conservatoire Henri Tomasi vous ouvre ses portes pour une semaine de découvertes, de rencontres et de pratiques artistiques autour de la musique, de la danse et du théâtre.
        </p>
        <div class="intro">
          Inauguré en février, le nouveau bâtiment du Conservatoire a progressivement accueilli l’ensemble des cours depuis le mois de mars. Aujourd’hui pleinement fonctionnel, cet équipement de près de <strong>3 000 m²</strong> permet de réunir les disciplines, les élèves, les enseignants et les publics dans un cadre pensé pour la pratique, la transmission et la rencontre.
          <br><br>
          Afin de préparer au mieux la future rentrée scolaire de septembre, cette semaine Portes ouvertes propose aux établissements scolaires, enseignants, associations et organismes intéressés de découvrir les différentes disciplines du Conservatoire à travers des <strong>modules courts</strong>, des <strong>présentations</strong>, des <strong>ateliers</strong> et des <strong>parcours composables</strong>.
          <br><br>
          Choisissez les modules qui correspondent à votre groupe, créneau par créneau, puis envoyez une demande globale. Les places demandées sont placées en attente dès l’envoi et retirées des disponibilités, sous réserve de validation finale par le Conservatoire.
          <br>
          Pour l’accompagnement de mineurs ou de jeunes majeurs, nous demandons a minima <strong>1 accompagnateur pour 10 enfants / jeunes</strong>.
          <div class="corsu">À truvà ci da u 15 à u 21 di Ghjugnu à u Cunservatoriu novu pà una stonda di spartera in giru à a musica, u baddu è u teatru ! V'aspittemi numarosi :)</div>
        </div>
        <div class="contactbox">
          <strong>Vous souhaitez un accompagnement personnalisé ?</strong>
          Nous pouvons vous aider à construire un parcours adapté à votre groupe, à vos horaires ou à vos contraintes de déplacement.
          <div class="contact-actions">
            <a class="mail" href="mailto:communication@crd.corsica">Écrire à communication@crd.corsica</a>
            <a class="phone" href="tel:+33667579265">Appeler le 06.67.57.92.65</a>
          </div>
        </div>
        <div class="notice">
          Mode d’emploi : choisissez un jour, consultez les idées de parcours ou les créneaux disponibles, puis ajoutez chaque classe à son panier. Une confirmation définitive sera ensuite adressée par le Conservatoire.
        </div>
      </div>

      <div class="content">
        <div class="steps">
          <div class="step"><strong>1. Choisissez un jour</strong><span>Les activités sont classées par horaires.</span></div>
          <div class="step"><strong>2. Ajoutez un parcours</strong><span>Indiquez la classe, les élèves et au moins 1 accompagnateur pour 10 jeunes.</span></div>
          <div class="step"><strong>3. Envoyez une seule demande</strong><span>Le Conservatoire confirme ensuite les créneaux.</span></div>
        </div>

        <div class="stats">
          <div class="stat"><div id="jps-total" class="num">0</div><div class="lab">créneaux proposés</div></div>
          <div class="stat"><div id="jps-avail" class="num">0</div><div class="lab">créneaux disponibles</div></div>
          <div class="stat"><div id="jps-conf" class="num">0</div><div class="lab">places confirmées</div></div>
          <div class="stat"><div id="jps-pend" class="num">0</div><div class="lab">places en attente</div></div>
        </div>

        <div id="jps-filters" class="filters"></div>
        <div class="tools">
          <div class="toolbox">
            <label for="jps-level-filter">Filtrer par niveau</label>
            <select id="jps-level-filter">
              <option value="all">Tous les niveaux</option>
              <option value="maternelle">Maternelle</option>
              <option value="elementaire">Élémentaire</option>
              <option value="college">Collège</option>
              <option value="lycee">Lycée</option>
            </select>
          </div>
          <div class="toolbox">
            <label for="jps-period-filter">Filtrer par demi-journée</label>
            <select id="jps-period-filter">
              <option value="all">Toute la journée</option>
              <option value="morning">Matin</option>
              <option value="afternoon">Après-midi</option>
              <option value="other">Soirée / autres horaires</option>
            </select>
          </div>
          <div class="toolbox">
            <label>Idées de parcours automatiques</label>
            <div class="quick-buttons">
              <button type="button" data-suggest-duration="60" data-suggest-period="all">Créer une idée 1h</button>
              <button type="button" data-suggest-duration="90" data-suggest-period="all">Créer une idée 1h30</button>
              <button type="button" data-suggest-duration="120" data-suggest-period="all">Créer une idée 2h</button>
              <button type="button" data-suggest-duration="60" data-suggest-period="morning">Idée matin 1h</button>
              <button type="button" data-suggest-duration="90" data-suggest-period="morning">Idée matin 1h30</button>
              <button type="button" data-suggest-duration="60" data-suggest-period="afternoon">Idée après-midi 1h</button>
              <button type="button" data-suggest-duration="90" data-suggest-period="afternoon">Idée après-midi 1h30</button>
            </div>
          </div>
        </div>
        <div id="jps-suggestions" class="suggestions"></div>
        <div id="jps-days"></div>
        <div id="jps-error" class="error"></div>
      </div>
    </div>

    <div id="jps-cartbar" class="cartbar" style="display:none">
      <div class="cartinner">
        <div>
          <div class="carttitle">Panier de demande</div>
          <div id="jps-cartmeta" class="cartmeta"></div>
        </div>
        <div class="actions" style="margin-top:0">
          <button id="jps-open-cart" class="btn2" type="button">Voir le panier</button>
          <button id="jps-send" class="btn" type="button">Envoyer la demande</button>
        </div>
      </div>
    </div>

    <div id="jps-booking" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-booking">&times;</button>
        <h3 class="modaltitle">Ajouter au parcours</h3>
        <div class="row"><span class="label">Créneau</span><span id="jps-b-slot"></span></div>
        <div class="row"><span class="label">Places</span><span id="jps-b-places"></span></div>
        <div id="jps-existing-group-box" class="groupselect" style="display:none">
          <label for="jps-b-existing">Réutiliser une classe déjà créée</label>
          <select id="jps-b-existing">
            <option value="">Créer ou saisir un autre groupe</option>
          </select>
        </div>
        <div class="formgrid">
          <div class="field"><label>Classe / groupe</label><input id="jps-b-group" type="text" placeholder="Ex. CE2 A"></div>
          <div class="field"><label>Élèves</label><input id="jps-b-students" type="number" min="0" step="1" placeholder="24"></div>
          <div class="field"><label>Accompagnateurs</label><input id="jps-b-adults" type="number" min="0" step="1" placeholder="2"></div>
        </div>
        <div id="jps-reuse-box" class="reusebox" style="display:none">
          <label>
            <input id="jps-b-reuse" type="checkbox">
            <span>
              Reprendre la même classe, le même nombre d’élèves et les mêmes accompagnateurs que la sélection précédente
              <small id="jps-b-reuse-summary"></small>
            </span>
          </label>
        </div>
        <div id="jps-b-help" class="help"></div>
        <div id="jps-b-warning" class="warning" style="display:none"></div>
        <div id="jps-next-box" class="nextbox" style="display:none"></div>
        <div class="actions">
          <button type="button" id="jps-b-add" class="btn">Ajouter au panier</button>
          <button type="button" data-close="jps-booking" class="btn2">Annuler</button>
        </div>
      </div>
    </div>

    <div id="jps-info" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-info">&times;</button>
        <h3 id="jps-i-title" class="modaltitle"></h3>
        <div class="row"><span class="label">Horaire</span><span id="jps-i-time"></span></div>
        <div class="row"><span class="label">Lieu</span><span id="jps-i-room"></span></div>
        <div class="row"><span class="label">Pôle</span><span id="jps-i-pole"></span></div>
        <div class="row"><span class="label">Public</span><span id="jps-i-public"></span></div>
        <div class="row"><span class="label">Type</span><span id="jps-i-type"></span></div>
        <div class="row"><span class="label">Description</span><span id="jps-i-desc"></span></div>
        <div class="row"><span class="label">Disponibilité</span><span id="jps-i-capacity"></span></div>
        <div class="actions">
          <button type="button" id="jps-i-add" class="btn">Ajouter ce créneau au panier</button>
          <button type="button" data-close="jps-info" class="btn2">Fermer</button>
        </div>
      </div>
    </div>

    <div id="jps-cart" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-cart">&times;</button>
        <h3 class="modaltitle">Panier de demande</h3>
        <div id="jps-cart-summary" class="help"></div>
        <div id="jps-cart-list" class="cartlist"></div>
        <div class="actions">
          <button type="button" id="jps-submit" class="btn">Envoyer la demande globale</button>
          <button type="button" id="jps-clear" class="btn2">Vider le panier</button>
        </div>
      </div>
    </div>

    <div id="jps-auto" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-auto">&times;</button>
        <h3 id="jps-auto-title" class="modaltitle">Composer automatiquement un parcours</h3>
        <div class="row"><span class="label">Durée souhaitée</span><span id="jps-auto-duration"></span></div>
        <div class="row"><span class="label">Jour</span><span id="jps-auto-day"></span></div>

        <div id="jps-auto-existing-box" class="groupselect" style="display:none">
          <label for="jps-auto-existing">Réutiliser une classe déjà créée</label>
          <select id="jps-auto-existing">
            <option value="">Créer ou saisir un autre groupe</option>
          </select>
        </div>

        <div class="formgrid">
          <div class="field"><label>Classe / groupe</label><input id="jps-auto-group" type="text" placeholder="Ex. CE2 A"></div>
          <div class="field"><label>Élèves</label><input id="jps-auto-students" type="number" min="0" step="1" placeholder="24"></div>
          <div class="field"><label>Accompagnateurs</label><input id="jps-auto-adults" type="number" min="0" step="1" placeholder="2"></div>
        </div>

        <div id="jps-auto-help" class="help"></div>
        <div id="jps-auto-result" class="auto-route"></div>

        <div class="actions">
          <button type="button" id="jps-auto-search" class="btn2">Proposer un parcours</button>
          <button type="button" id="jps-auto-add" class="btn disabled">Ajouter ce parcours au panier</button>
          <button type="button" data-close="jps-auto" class="btn2">Fermer</button>
        </div>
      </div>
    </div>

    <div id="jps-confirm" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-confirm">&times;</button>
        <h3 class="modaltitle">Vérifier la demande avant envoi</h3>
        <div class="confirm-total" id="jps-confirm-total"></div>
        <div id="jps-confirm-content" class="confirm-summary"></div>
        <div class="actions">
          <button type="button" id="jps-confirm-send" class="btn">Confirmer et ouvrir le formulaire</button>
          <button type="button" data-close="jps-confirm" class="btn2">Retour au panier</button>
        </div>
      </div>
    </div>
  `;

  function $(id) {
    return document.getElementById(id);
  }

  function norm(v) {
    return (v || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slug(s) {
    return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  }

  function parseNumber(v) {
    const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function requiredAdults(students) {
    const n = parseNumber(students);
    return n > 0 ? Math.ceil(n / 10) : 0;
  }

  function compact(t) {
    return String(t || "").replace(":", "");
  }

  function showTime(t) {
    return String(t || "").replace(":", "h");
  }

  function formatDate(iso) {
    const d = DAYS.find(x => x.iso === iso);
    return d ? d.label : iso;
  }

  function parseCSV(text) {
    const s = String(text || "").replace(/\r/g, "");
    const rows = [];
    let row = [];
    let cur = "";
    let quoted = false;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const next = s[i + 1];

      if (ch === '"') {
        if (quoted && next === '"') {
          cur += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === "," && !quoted) {
        row.push(cur);
        cur = "";
      } else if (ch === "\n" && !quoted) {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }

    row.push(cur);
    rows.push(row);
    return rows.filter(r => r.some(c => String(c || "").trim() !== ""));
  }

  function findCol(headers, names) {
    const hs = headers.map(norm);

    for (const n of names) {
      const k = norm(n);
      const i = hs.findIndex(h => h === k);
      if (i !== -1) return i;
    }

    for (const n of names) {
      const k = norm(n);
      const i = hs.findIndex(h => h.includes(k));
      if (i !== -1) return i;
    }

    return -1;
  }

  function parseDateFR(v) {
    const t = String(v || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const p = t.split(/[\/.-]/);
    if (p.length !== 3) return null;
    let y = p[2];
    if (y.length === 2) y = "20" + y;
    return y + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0");
  }

  function fmtTime(v) {
    const t = String(v || "").trim();

    if (/^\d{1,2}:\d{2}/.test(t)) {
      const p = t.split(":");
      return p[0].padStart(2, "0") + ":" + p[1];
    }

    if (/^\d{1,2}h\d{2}$/.test(t.toLowerCase())) {
      const p = t.toLowerCase().split("h");
      return p[0].padStart(2, "0") + ":" + p[1];
    }

    return t.slice(0, 5);
  }

  function minutes(t) {
    const p = String(t || "").split(":");
    if (p.length < 2) return null;
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function timeFromMin(m) {
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  function durationToMinutes(v) {
    const d = norm(v);
    if (d.includes("45")) return 45;
    if (d.includes("30")) return 30;
    if (d.includes("1h30") || d.includes("1 h 30")) return 90;
    if (d.includes("2h") || d.includes("2 h")) return 120;
    if (d.includes("1h") || d.includes("1 h") || d.includes("60")) return 60;
    return 60;
  }

  function blockedDuration(format, fallback) {
    const f = norm(format);
    if (f.includes("bloque 30")) return 30;
    if (f.includes("bloque 1h") || f.includes("bloque 1 h")) return 60;
    return durationToMinutes(fallback);
  }

  function statusInfo(v) {
    const s = norm(v);
    if (s.includes("deplacer")) return "move";
    if (s.includes("refuse")) return "refused";
    if (s.includes("accepte")) return "accepted";
    return "pending";
  }

  function roomKeyForOther(label) {
    const clean = slug(label || "autre");
    return "other__" + (clean || "autre");
  }

  function isOtherRoomKey(key) {
    return key === "other" || String(key || "").indexOf("other__") === 0;
  }

  function legacyOtherSlotId(slot) {
    return [slot.dateIso, compact(slot.start), compact(slot.end), "other", slug(slot.title)].join("|");
  }

  function roomInfo(v, precision) {
    const s = norm(v);
    const p = String(precision || "").trim();

    if (s.includes("auditorium")) return { key: "auditorium", ...ROOM_DEFAULTS.auditorium };
    if (s.includes("orchestre")) return { key: "orchestre", ...ROOM_DEFAULTS.orchestre };
    if (s.includes("chant") && !s.includes("choeur") && !s.includes("chœur")) return { key: "chant", ...ROOM_DEFAULTS.chant };
    if (s.includes("choeur") || s.includes("chœur")) return { key: "choeur", ...ROOM_DEFAULTS.choeur };
    if (s.includes("theatre") || s.includes("théâtre")) return { key: "theatre", ...ROOM_DEFAULTS.theatre };
    if (s.includes("danse 1") || s.includes("studio de danse 1")) return { key: "danse1", ...ROOM_DEFAULTS.danse1 };
    if (s.includes("danse 2") || s.includes("studio de danse 2")) return { key: "danse2", ...ROOM_DEFAULTS.danse2 };
    if (s.includes("danse 3") || s.includes("studio de danse 3")) return { key: "danse3", ...ROOM_DEFAULTS.danse3 };
    if (s.includes("danse")) return { key: "danse1", ...ROOM_DEFAULTS.danse1 };
    if (s.includes("arbitrer") || s.includes("peu importe") || s.includes("a definir") || s.includes("à définir")) return { key: "any", ...ROOM_DEFAULTS.any };

    if (s.includes("autre") || p) {
      const label = p || v || ROOM_DEFAULTS.other.label;
      return {
        key: roomKeyForOther(label),
        short: label || "Autre",
        label: label || ROOM_DEFAULTS.other.label,
        capacity: ROOM_DEFAULTS.other.capacity,
        pole: ROOM_DEFAULTS.other.pole
      };
    }

    const label = v || "Autre";
    return { key: roomKeyForOther(label), short: label, label, capacity: ROOM_DEFAULTS.other.capacity, pole: ROOM_DEFAULTS.other.pole };
  }

  function slotId(date, start, end, room, title) {
    return [date, compact(start), compact(end), room, slug(title)].join("|");
  }

  function slotPrefix(s) {
    return [s.dateIso, compact(s.start), compact(s.end), s.roomKey].join("|") + "|";
  }

  function programKey(slot) {
    // Sert à éviter les parcours automatiques absurdes du type :
    // Cuivres 09h-10h + Cuivres 10h-11h + Cuivres 11h-12h.
    // On utilise volontairement le titre plutôt que l’ID, car une même proposition peut avoir plusieurs créneaux.
    return slug(slot && slot.title ? slot.title : "");
  }

  function removeAutoSlotsWithRoomConflicts(slots) {
    // Les propositions automatiques/récurrentes, comme l’exposition de cuivres,
    // servent à remplir les créneaux disponibles.
    // Si une proposition ponctuelle acceptée occupe la même salle au même moment,
    // on masque automatiquement le créneau automatique pour éviter un litige.
    return slots.filter(slot => {
      if (!slot.autoGenerated) return true;

      const slotStart = minutes(slot.start);
      const slotEnd = minutes(slot.end);
      if (slotStart === null || slotEnd === null) return true;

      const hasRoomConflict = slots.some(other => {
        if (other === slot) return false;
        if (other.autoGenerated) return false;
        if (other.dateIso !== slot.dateIso) return false;
        if (other.roomKey !== slot.roomKey) return false;

        const otherStart = minutes(other.start);
        const otherEnd = minutes(other.end);
        if (otherStart === null || otherEnd === null) return false;

        return slotStart < otherEnd && otherStart < slotEnd;
      });

      return !hasRoomConflict;
    });
  }

  function buildSlots(rows) {
    const headers = rows[0] || [];
    const data = rows.slice(1);
    const out = [];

    const C_NAME = findCol(headers, ["Nom et prénom", "Nom"]);
    const C_DISC = findCol(headers, ["Discipline / département", "Discipline"]);
    const C_TITLE = findCol(headers, ["Intitulé du projet", "Intitule du projet", "Projet"]);
    const C_TYPE = findCol(headers, ["Type de proposition", "Type"]);
    const C_PUBLIC = findCol(headers, ["Public visé", "Public"]);
    const C_DATE = findCol(headers, ["Date souhaitée", "Date"]);
    const C_TIME = findCol(headers, ["Horaire de début", "Horaire", "Heure"]);
    const C_DUR = findCol(headers, ["Durée estimée", "Durée"]);
    const C_ROOM = findCol(headers, ["Lieu souhaité", "Lieu"]);
    const C_CAP = findCol(headers, ["Nombre estimé", "spectateurs", "participants"]);
    const C_TECH = findCol(headers, ["Besoins techniques"]);
    const C_DESC = findCol(headers, ["Description courte", "programmation", "communication"]);
    const C_STATUS = findCol(headers, ["STATUT", "Statut"]);
    const C_AUTO = findCol(headers, ["Programmation automatique sur plusieurs créneaux ?", "Programmation automatique"]);
    const C_ROOM_FINAL = findCol(headers, ["SALLE RETENUE CRD", "Salle retenue CRD", "Salle retenue"]);
    const C_ROOM_PRECISION = findCol(headers, ["PRÉCISION SALLE / LIEU CRD", "PRECISION SALLE / LIEU CRD", "Précision salle", "Precision salle", "Précision lieu", "Precision lieu"]);
    const C_CAPACITY_CRD = findCol(headers, ["CAPACITÉ CRD", "CAPACITE CRD", "Capacité CRD", "Capacite CRD"]);
    const C_FORMAT_CRD = findCol(headers, ["FORMAT CRD", "Format CRD"]);
    const C_POLE_CRD = findCol(headers, ["PÔLE CRD", "POLE CRD", "Pôle CRD", "Pole CRD"]);

    if (C_TITLE === -1 || C_STATUS === -1) {
      throw new Error("Colonnes propositions introuvables : Intitulé du projet ou STATUT.");
    }

    data.forEach((row, index) => {
      if (statusInfo(row[C_STATUS]) !== "accepted") return;

      const title = row[C_TITLE] || "Proposition sans titre";
      const finalRoom = C_ROOM_FINAL !== -1 ? row[C_ROOM_FINAL] : "";
      const precision = C_ROOM_PRECISION !== -1 ? row[C_ROOM_PRECISION] : "";
      const fallback = C_ROOM !== -1 ? row[C_ROOM] : "";
      const room = finalRoom && !norm(finalRoom).includes("arbitrer") ? roomInfo(finalRoom, precision) : roomInfo(fallback, "");
      const capCRD = C_CAPACITY_CRD !== -1 ? parseNumber(row[C_CAPACITY_CRD]) : 0;

      let capacity = capCRD || room.capacity || 30;

      if (room.key === "auditorium") capacity = Math.min(capacity, 180);
      else if (["orchestre", "chant", "choeur", "theatre", "danse1", "danse2", "danse3", "any"].includes(room.key) || isOtherRoomKey(room.key)) capacity = Math.min(capacity, 35);

      const format = C_FORMAT_CRD !== -1 ? row[C_FORMAT_CRD] : "";
      const pole = (C_POLE_CRD !== -1 && row[C_POLE_CRD]) ? row[C_POLE_CRD] : room.pole;
      const duration = C_DUR !== -1 ? row[C_DUR] : "";
      const autoLabel = C_AUTO !== -1 ? row[C_AUTO] : "";
      const autoMode = norm(autoLabel);

      const common = {
        sourceUid: "src" + index + "_" + slug(title + room.key),
        title,
        name: C_NAME !== -1 ? row[C_NAME] : "",
        discipline: C_DISC !== -1 ? row[C_DISC] : "",
        type: C_TYPE !== -1 ? row[C_TYPE] : "",
        publicTarget: C_PUBLIC !== -1 ? row[C_PUBLIC] : "",
        description: C_DESC !== -1 ? row[C_DESC] : "",
        tech: C_TECH !== -1 ? row[C_TECH] : "",
        duration,
        crdFormat: format,
        pole,
        roomKey: room.key,
        roomLabel: room.label,
        roomShort: room.short,
        capacity,
        estimatedCapacity: C_CAP !== -1 ? row[C_CAP] : "",
        autoLabel: autoLabel || "Non"
      };

      if (autoMode.includes("oui")) {
        const days = AUTO_DAYS.slice();
        if (autoMode.includes("mercredi")) days.splice(2, 0, "2026-06-17");

        days.forEach(dateIso => {
          AUTO_SLOTS.forEach(pair => {
            out.push({
              ...common,
              id: slotId(dateIso, pair[0], pair[1], room.key, title),
              dateIso,
              start: pair[0],
              end: pair[1],
              autoGenerated: true
            });
          });
        });
      } else {
        const dateIso = C_DATE !== -1 ? parseDateFR(row[C_DATE]) : null;
        if (!dateIso || !DAYS.some(day => day.iso === dateIso)) return;

        const start = C_TIME !== -1 ? fmtTime(row[C_TIME]) : "";
        if (!start) return;

        const end = timeFromMin(minutes(start) + blockedDuration(format, duration));

        out.push({
          ...common,
          id: slotId(dateIso, start, end, room.key, title),
          dateIso,
          start,
          end,
          autoGenerated: false
        });
      }
    });

    const cleaned = removeAutoSlotsWithRoomConflicts(out);

    return cleaned.sort((a, b) => {
      if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
      if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
      return a.roomLabel.localeCompare(b.roomLabel);
    });
  }

  function buildReservations(rows) {
    const map = {};
    if (!rows.length) return map;

    const headers = rows[0] || [];
    const data = rows.slice(1);
    const C_IDS = findCol(headers, ["IDs créneaux", "IDs creneaux", "IDS créneaux", "IDS creneaux"]);
    const C_VALID = findCol(headers, ["VALIDATION CRD", "Validation CRD"]);

    data.forEach(row => {
      const validation = C_VALID !== -1 ? norm(row[C_VALID]) : "";
      if (validation === "non") return;

      const ids = C_IDS !== -1 && row[C_IDS]
        ? row[C_IDS]
        : (row.find(cell => /2026-06-\d{2}\|\d{4}\|\d{4}\|/.test(String(cell || ""))) || "");

      String(ids)
        .split(";")
        .map(x => x.trim())
        .filter(Boolean)
        .forEach(line => {
          const parts = line.split("|").map(x => x.trim());
          if (parts.length < 8) return;

          const id = parts.slice(0, 5).join("|");
          const total = parseNumber(parts[6]) + parseNumber(parts[7]);

          if (!id || !total) return;
          if (!map[id]) map[id] = { confirmed: 0, pending: 0, refused: 0 };

          if (validation === "oui") map[id].confirmed += total;
          else map[id].pending += total;
        });
    });

    window.JPS_ECOLES_DEBUG = { headers, rowsCount: rows.length, reservations: map };
    return map;
  }

  function applyReservations(slots, reservations) {
    return slots.map(slot => {
      let reservation = reservations[slot.id];

      if (!reservation && isOtherRoomKey(slot.roomKey)) {
        // Compatibilite avec les anciennes demandes V33 qui stockaient toutes les salles
        // "Autre" sous la cle unique "other". On accepte seulement une correspondance
        // exacte avec le titre du creneau, jamais un prefixe date/heure/other trop large.
        reservation = reservations[legacyOtherSlotId(slot)];
      }

      if (!reservation) {
        reservation = { confirmed: 0, pending: 0, refused: 0 };

        // Ancienne tolerance conservee pour les salles nommees classiques.
        // Elle est volontairement desactivee pour les salles "Autre", car sinon
        // deux lieux differents mais classes "Autre" au meme horaire se cumulent.
        if (!isOtherRoomKey(slot.roomKey)) {
          const prefix = slotPrefix(slot);

          Object.keys(reservations).forEach(id => {
            if (id.indexOf(prefix) === 0) {
              reservation.confirmed += reservations[id].confirmed || 0;
              reservation.pending += reservations[id].pending || 0;
              reservation.refused += reservations[id].refused || 0;
            }
          });
        }
      }

      const remaining = Math.max(0, slot.capacity - reservation.confirmed - reservation.pending);

      return {
        ...slot,
        confirmed: reservation.confirmed,
        pending: reservation.pending,
        remaining,
        full: remaining <= 0
      };
    });
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function loadLastGroup() {
    try {
      return JSON.parse(localStorage.getItem(LAST_GROUP_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveLastGroup(data) {
    localStorage.setItem(LAST_GROUP_KEY, JSON.stringify(data || {}));
  }

  function hasReusableGroup(data) {
    return !!(data && data.group && parseNumber(data.students) > 0);
  }

  function fillBookingFields(data) {
    $("jps-b-group").value = data.group || "";
    $("jps-b-students").value = data.students || "";
    $("jps-b-adults").value = data.adults || "";
  }

  function clearBookingFields() {
    $("jps-b-group").value = "";
    $("jps-b-students").value = "";
    $("jps-b-adults").value = "";
  }

  function setupReusePreviousBox(last) {
    const box = $("jps-reuse-box");
    const checkbox = $("jps-b-reuse");
    const summary = $("jps-b-reuse-summary");

    checkbox.checked = false;

    if (!hasReusableGroup(last)) {
      box.style.display = "none";
      summary.textContent = "";
      return;
    }

    box.style.display = "block";
    summary.textContent =
      "Dernière sélection : " +
      last.group +
      " — " +
      last.students +
      " élève(s), " +
      (last.adults || 0) +
      " accompagnateur(s).";
  }

  function toggleReusePrevious() {
    const last = loadLastGroup();

    if ($("jps-b-reuse").checked && hasReusableGroup(last)) {
      fillBookingFields(last);
    } else {
      clearBookingFields();
    }

    updateBookingHelp();
  }

  function cartPeople() {
    return cart.reduce((sum, item) => sum + item.students + item.adults, 0);
  }

  function cartFor(slotId) {
    return cart
      .filter(item => item.slotId === slotId)
      .reduce((sum, item) => sum + item.students + item.adults, 0);
  }

  function groupKey(value) {
    return norm(value || "Groupe non précisé");
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  function conflictForGroup(group, slot) {
    const g = groupKey(group);
    const start = minutes(slot.start);
    const end = minutes(slot.end);

    return cart.find(item => {
      if (groupKey(item.group) !== g) return false;
      if (item.dateIso !== slot.dateIso) return false;
      return rangesOverlap(start, end, minutes(item.start), minutes(item.end));
    });
  }

  function byGroup(items) {
    const groups = {};
    items.forEach(item => {
      const key = item.group || "Groupe non précisé";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }

  function uniqueGroupsForSelect() {
    const groups = {};
    cart.forEach(item => {
      if (item.group) groups[item.group] = { group: item.group, students: item.students, adults: item.adults };
    });

    const last = loadLastGroup();
    if (hasReusableGroup(last)) groups[last.group] = last;

    return Object.values(groups).sort((a, b) => String(a.group).localeCompare(String(b.group)));
  }

  function setupExistingGroupSelect() {
    const box = $("jps-existing-group-box");
    const select = $("jps-b-existing");
    const groups = uniqueGroupsForSelect();

    select.innerHTML = '<option value="">Créer ou saisir un autre groupe</option>' +
      groups.map(g =>
        '<option value="' + esc(g.group) + '">' +
          esc(g.group) + ' — ' + esc(g.students) + ' élève(s), ' + esc(g.adults || 0) + ' accompagnateur(s)' +
        '</option>'
      ).join("");

    box.style.display = groups.length ? "block" : "none";
  }

  function setupAutoExistingGroupSelect() {
    const box = $("jps-auto-existing-box");
    const select = $("jps-auto-existing");
    const groups = uniqueGroupsForSelect();

    select.innerHTML = '<option value="">Créer ou saisir un autre groupe</option>' +
      groups.map(g =>
        '<option value="' + esc(g.group) + '">' +
          esc(g.group) + ' — ' + esc(g.students) + ' élève(s), ' + esc(g.adults || 0) + ' accompagnateur(s)' +
        '</option>'
      ).join("");

    box.style.display = groups.length ? "block" : "none";
  }

  function fillAutoFields(data) {
    $("jps-auto-group").value = data.group || "";
    $("jps-auto-students").value = data.students || "";
    $("jps-auto-adults").value = data.adults || "";
  }

  function autoGroupData() {
    return {
      group: $("jps-auto-group").value.trim(),
      students: parseNumber($("jps-auto-students").value),
      adults: parseNumber($("jps-auto-adults").value)
    };
  }

  function slotDurationMinutes(slot) {
    const start = minutes(slot.start);
    const end = minutes(slot.end);

    if (start === null || end === null) return 30;
    return Math.max(30, end - start);
  }

  function slotAvailableForAuto(slot) {
    return Math.max(0, slot.remaining - cartFor(slot.id));
  }

  function canUseSlotForAuto(slot, group, totalPeople) {
    if (!slot || slot.full) return false;
    if (slotAvailableForAuto(slot) < totalPeople) return false;
    if (conflictForGroup(group, slot)) return false;
    return true;
  }

  function scoreAutoRoute(route) {
    if (!route.length) return -999999;

    const uniquePoles = {};
    const uniqueRooms = {};
    let hasAuditorium = false;
    let gaps = 0;

    route.forEach((slot, index) => {
      uniquePoles[norm(slot.pole || slot.roomLabel || "")] = true;
      uniqueRooms[slot.roomKey] = true;
      if (slot.roomKey === "auditorium") hasAuditorium = true;

      if (index > 0) {
        const prevEnd = minutes(route[index - 1].end);
        const start = minutes(slot.start);
        if (prevEnd !== null && start !== null) gaps += Math.max(0, start - prevEnd);
      }
    });

    return (
      (hasAuditorium ? 45 : 0) +
      Object.keys(uniquePoles).length * 16 +
      Object.keys(uniqueRooms).length * 8 -
      gaps
    );
  }

  function findAutoRoute(minutesWanted, group, totalPeople) {
    const candidates = allSlots
      .filter(slot => slot.dateIso === activeDay && slotMatchesLevel(slot))
      .filter(slot => autoWantedPeriod === "all" || halfDayForSlot(slot) === autoWantedPeriod)
      .filter(slot => canUseSlotForAuto(slot, group, totalPeople))
      .slice()
      .sort((a, b) => {
        const startDiff = minutes(a.start) - minutes(b.start);
        if (startDiff) return startDiff;

        if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
        if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;

        return b.remaining - a.remaining;
      });

    let bestExact = null;
    let bestFallback = null;

    function consider(route, totalDuration) {
      if (!route.length) return;

      if (totalDuration === minutesWanted) {
        if (!bestExact || scoreAutoRoute(route) > scoreAutoRoute(bestExact)) bestExact = route.slice();
      } else if (totalDuration > minutesWanted && totalDuration <= minutesWanted + 30) {
        if (!bestFallback || scoreAutoRoute(route) > scoreAutoRoute(bestFallback)) bestFallback = route.slice();
      }
    }

    function dfs(path, startIndex, totalDuration) {
      consider(path, totalDuration);

      if (totalDuration >= minutesWanted + 30 || path.length >= 5) return;

      const prev = path.length ? path[path.length - 1] : null;
      const prevEnd = prev ? minutes(prev.end) : null;

      for (let i = startIndex; i < candidates.length; i++) {
        const slot = candidates[i];
        const start = minutes(slot.start);
        const end = minutes(slot.end);

        if (start === null || end === null) continue;

        if (prev) {
          if (start < prevEnd) continue;
          if (start - prevEnd > 30) continue;
        }

        const overlapsPath = path.some(existing =>
          rangesOverlap(minutes(existing.start), minutes(existing.end), start, end)
        );

        if (overlapsPath) continue;

        const repeatsSameProgram = path.some(existing => programKey(existing) === programKey(slot));
        if (repeatsSameProgram) continue;

        path.push(slot);
        dfs(path, i + 1, totalDuration + slotDurationMinutes(slot));
        path.pop();
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      const slot = candidates[i];
      dfs([slot], i + 1, slotDurationMinutes(slot));
    }

    return bestExact || bestFallback || [];
  }

  function renderAutoRoute(route, message) {
    const result = $("jps-auto-result");
    const add = $("jps-auto-add");

    autoRoute = route || [];

    if (!autoRoute.length) {
      result.innerHTML = '<div class="auto-route-empty">' + esc(message || "Aucun parcours automatique trouvé pour ces critères. Vous pouvez composer le parcours manuellement.") + '</div>';
      add.className = "btn disabled";
      $("jps-auto-search").textContent = "Proposer un parcours";
      return;
    }

    const totalDuration = autoRoute.reduce((sum, slot) => sum + slotDurationMinutes(slot), 0);

    $("jps-auto-search").textContent = "Proposer un autre parcours équivalent";

    result.innerHTML =
      '<div class="confirm-total">Parcours proposé : ' + Math.round(totalDuration / 30) + ' créneau(x) de 30 minutes environ. Vérifiez la proposition avant de l’ajouter au panier.</div>' +
      autoRoute.map(slot =>
        '<div class="auto-route-line">' +
          '<strong>' + esc(showTime(slot.start)) + '–' + esc(showTime(slot.end)) + ' · ' + esc(slot.roomLabel) + '</strong>' +
          esc(slot.title) + '<br>' +
          '<span>' + esc(slot.pole || "") + ' · ' + slotAvailableForAuto(slot) + ' place(s) disponible(s)</span>' +
        '</div>'
      ).join("");

    add.className = "btn";
  }

  function searchAutoRoute() {
    const data = autoGroupData();
    const total = data.students + data.adults;

    if (!data.group) {
      renderAutoRoute([], "Indiquez d’abord la classe ou le groupe.");
      return;
    }

    if (data.students <= 0) {
      renderAutoRoute([], "Indiquez le nombre d’élèves.");
      return;
    }

    const minAdults = requiredAdults(data.students);
    if (data.adults < minAdults) {
      renderAutoRoute([], "Merci de prévoir au minimum 1 accompagnateur pour 10 enfants / jeunes, soit " + minAdults + " accompagnateur(s) pour ce groupe.");
      return;
    }

    const route = findAutoRoute(autoWantedDuration, data.group, total);

    if (!route.length) {
      renderAutoRoute([], "Aucun parcours automatique compatible avec cette jauge et les places restantes. Vous pouvez composer un parcours manuellement.");
      return;
    }

    renderAutoRoute(route, "");
  }

  function openAutoBuilder(duration, period) {
    autoWantedDuration = duration;
    autoWantedPeriod = period || "all";
    autoRoute = [];

    $("jps-auto-title").textContent = "Composer automatiquement un parcours";
    $("jps-auto-duration").textContent =
      (duration === 60 ? "1h" : duration === 90 ? "1h30" : duration === 120 ? "2h" : duration + " min") +
      " — " + periodLabel(autoWantedPeriod);
    $("jps-auto-day").textContent = formatDate(activeDay);

    setupAutoExistingGroupSelect();

    const last = loadLastGroup();
    if (hasReusableGroup(last)) fillAutoFields(last);
    else fillAutoFields({ group: "", students: "", adults: "" });

    $("jps-auto-search").textContent = "Proposer un parcours";
    renderAutoRoute([], "Renseignez la classe, puis cliquez sur “Proposer un parcours”.");
    openModal("jps-auto");
  }

  function addAutoRouteToCart() {
    const data = autoGroupData();
    const total = data.students + data.adults;

    if (!autoRoute.length) {
      alert("Aucun parcours proposé à ajouter.");
      return;
    }

    if (!data.group || data.students <= 0) {
      alert("Indiquez la classe et le nombre d’élèves.");
      return;
    }

    const minAdults = requiredAdults(data.students);
    if (data.adults < minAdults) {
      alert("Merci de prévoir au minimum 1 accompagnateur pour 10 enfants / jeunes. Pour ce groupe, il faut au moins " + minAdults + " accompagnateur(s).");
      return;
    }

    const invalid = autoRoute.find(slot =>
      !canUseSlotForAuto(slot, data.group, total)
    );

    if (invalid) {
      alert("Le parcours n’est plus disponible pour cette classe. Relancez la proposition automatique.");
      searchAutoRoute();
      return;
    }

    autoRoute.forEach(slot => {
      cart.push({
        uid: Date.now() + "_" + Math.random(),
        slotId: slot.id,
        dateIso: slot.dateIso,
        start: slot.start,
        end: slot.end,
        roomKey: slot.roomKey,
        roomLabel: slot.roomLabel,
        title: slot.title,
        publicTarget: slot.publicTarget || "",
        group: data.group,
        students: data.students,
        adults: data.adults
      });
    });

    saveLastGroup(data);
    saveCart();
    closeModal("jps-auto");
    render();
    openModal("jps-cart");
  }


  function selectedLevel() {
    const el = $("jps-level-filter");
    return el ? el.value : "all";
  }

  function selectedPole() {
    const el = $("jps-pole-filter");
    return el ? el.value : "all";
  }

  function selectedPeriod() {
    const el = $("jps-period-filter");
    return el ? el.value : "all";
  }

  function slotMatchesPeriod(slot) {
    const p = selectedPeriod();
    if (p === "all") return true;
    return halfDayForSlot(slot) === p;
  }

  function slotMatchesLevel(slot) {
    const level = selectedLevel();
    if (level === "all") return true;

    const p = norm(slot.publicTarget || "");
    if (!p || p.includes("tout public scolaire") || p.includes("tout public")) return true;

    if (level === "elementaire") return p.includes("elementaire") || p.includes("primaire") || p.includes("ecole");
    if (level === "college") return p.includes("college");
    if (level === "lycee") return p.includes("lycee");
    if (level === "maternelle") return p.includes("maternelle");

    return true;
  }

  function slotMatchesPole(slot) {
    const pole = selectedPole();
    if (pole === "all") return true;

    const hay = norm((slot.pole || "") + " " + (slot.roomLabel || "") + " " + (slot.roomKey || ""));

    if (pole === "voix") return hay.includes("voix") || hay.includes("chant") || hay.includes("choeur") || hay.includes("chœur");
    if (pole === "theatre") return hay.includes("theatre") || hay.includes("théâtre");
    if (pole === "autre") return hay.includes("autre") || isOtherRoomKey(slot.roomKey);
    return hay.includes(pole);
  }

  function halfDayForMinutes(total) {
    if (total === null) return "other";
    if (total < 12 * 60) return "morning";
    if (total < 17 * 60) return "afternoon";
    return "other";
  }

  function halfDayForSlot(slot) {
    return halfDayForMinutes(minutes(slot.start));
  }

  function periodLabel(period) {
    if (period === "morning") return "matin";
    if (period === "afternoon") return "après-midi";
    return "journée";
  }

  function visibleSlotsForActiveDay() {
    return allSlots.filter(slot => slot.dateIso === activeDay && slotMatchesLevel(slot) && slotMatchesPeriod(slot));
  }

  function representativeSlotForTime(slots, start, end, usedProgramKeys) {
    const used = usedProgramKeys || {};
    const candidates = slots
      .filter(slot => slot.start === start && slot.end === end && !slot.full && cartFor(slot.id) < slot.remaining)
      .filter(slot => !used[programKey(slot)])
      .slice()
      .sort((a, b) => {
        if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
        if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
        if ((a.pole || "") !== (b.pole || "")) return String(a.pole || "").localeCompare(String(b.pole || ""));
        return b.remaining - a.remaining;
      });

    return candidates[0] || null;
  }

  function buildSuggestion(slots, minutesWanted) {
    const count = Math.max(1, Math.round(minutesWanted / 30));
    const keys = Array.from(new Set(slots.map(slot => slot.start + "|" + slot.end))).sort();

    for (let i = 0; i <= keys.length - count; i++) {
      const windowKeys = keys.slice(i, i + count);
      let ok = true;
      const chosen = [];
      const used = {};

      for (let j = 0; j < windowKeys.length; j++) {
        const parts = windowKeys[j].split("|");
        if (j > 0) {
          const prev = windowKeys[j - 1].split("|");
          if (prev[1] !== parts[0]) ok = false;
        }

        const slot = representativeSlotForTime(slots, parts[0], parts[1], used);
        if (!slot) {
          ok = false;
          break;
        }

        used[programKey(slot)] = true;
        chosen.push(slot);
      }

      if (ok && chosen.length === count) return chosen;
    }

    return [];
  }

  function renderSuggestions(slots) {
    const box = $("jps-suggestions");
    if (!box) return;

    let configs = [
      { min: 60, period: "morning", label: "Idée matin — 1h", button: "Préparer cette idée" },
      { min: 90, period: "morning", label: "Idée matin — 1h30", button: "Préparer cette idée" },
      { min: 120, period: "morning", label: "Idée matin — 2h", button: "Préparer cette idée" },
      { min: 60, period: "afternoon", label: "Idée après-midi — 1h", button: "Préparer cette idée" },
      { min: 90, period: "afternoon", label: "Idée après-midi — 1h30", button: "Préparer cette idée" },
      { min: 120, period: "afternoon", label: "Idée après-midi — 2h", button: "Préparer cette idée" }
    ];

    const selectedHalfDay = selectedPeriod();
    if (selectedHalfDay !== "all") {
      configs = configs.filter(config => config.period === selectedHalfDay);
    }

    const suggestions = configs
      .map(config => {
        const filtered = slots.filter(slot => halfDayForSlot(slot) === config.period);
        return { ...config, slots: buildSuggestion(filtered, config.min) };
      })
      .filter(config => config.slots.length);

    if (!suggestions.length) {
      box.innerHTML = "";
      return;
    }

    box.innerHTML =
      '<div class="choice-hint"><strong>Idées de parcours pour cette journée</strong><br>Ces exemples évitent de répéter la même activité plusieurs fois. Cliquez sur “Préparer cette idée” pour renseigner une classe : l’outil vérifiera ensuite les jauges avant d’ajouter au panier.</div>' +
      suggestions.slice(0, 6).map(s =>
        '<div class="suggestion">' +
          '<strong>' + esc(s.label) + '</strong>' +
          s.slots.map(slot =>
            '<span>' + esc(showTime(slot.start)) + '–' + esc(showTime(slot.end)) + ' · ' + esc(slot.roomLabel) + ' · ' + esc(slot.title) + '</span>'
          ).join("") +
          '<div class="idea-note">Suggestion indicative : vous pouvez la modifier ou composer manuellement.</div>' +
          '<div class="idea-actions"><button type="button" data-suggest-duration="' + esc(String(s.min)) + '" data-suggest-period="' + esc(s.period) + '">' + esc(s.button) + '</button></div>' +
        '</div>'
      ).join("");
  }

  function renderFilters() {
    $("jps-filters").innerHTML = DAYS.map(day =>
      '<button class="filter' + (day.iso === activeDay ? " active" : "") + '" data-day="' + day.iso + '" type="button">' + day.short + '</button>'
    ).join("");

    root.querySelectorAll(".filter").forEach(button => {
      button.addEventListener("click", function () {
        activeDay = button.dataset.day;
        render();
      });
    });
  }

  function status(slot) {
    if (slot.full) return { cls: "full", txt: "Complet" };
    if (slot.remaining <= 8) return { cls: "low", txt: "Presque complet" };
    return { cls: "available", txt: "Disponible" };
  }

  function shortDesc(slot) {
    const text = String(slot.description || "").trim();
    if (!text) return "";
    return text.length > 135 ? text.slice(0, 132).trim() + "…" : text;
  }

  function renderChoice(slot) {
    const inCart = cartFor(slot.id);
    const remainingAfterCart = Math.max(0, slot.remaining - inCart);
    const disabled = slot.full || remainingAfterCart <= 0;
    const preview = shortDesc(slot);
    const remainingClass = remainingAfterCart <= 0 ? "zero" : remainingAfterCart <= 8 ? "low" : "";

    return (
      '<article class="card ' + (disabled ? "is-full" : "") + '">' +
        '<div class="top">' +
          '<div class="choice-label">' + esc(showTime(slot.start)) + "–" + esc(showTime(slot.end)) + '</div>' +
          '<div class="title">' + esc(slot.title) + '</div>' +
          '<div class="simple-meta">' +
            '<span class="simple-pill">' + esc(slot.roomLabel) + '</span>' +
            (slot.pole ? '<span class="simple-pill">' + esc(slot.pole) + '</span>' : '') +
          '</div>' +
          (preview ? '<div class="desc-preview">' + esc(preview) + '</div>' : '') +
        '</div>' +
        '<div class="body">' +
          '<div class="simple-remaining ' + remainingClass + '">' +
            '<strong>' + remainingAfterCart + '</strong><span>places disponibles</span>' +
          '</div>' +
          '<div class="meta">' + slot.confirmed + ' confirmée(s) · ' + slot.pending + ' en attente · jauge ' + slot.capacity + '</div>' +
          '<div class="card-actions">' +
            '<button class="btn2" type="button" data-info-slot-id="' + esc(slot.id) + '">Détail</button>' +
            (disabled
              ? '<button class="btn disabled" type="button">Complet</button>'
              : '<button class="btn" type="button" data-add-slot-id="' + esc(slot.id) + '">Ajouter au parcours</button>') +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function slotStartMinutes(slot) {
    return minutes(slot.start);
  }

  function slotEndMinutes(slot) {
    return minutes(slot.end);
  }

  function floorToHalfHour(totalMinutes) {
    return Math.floor(totalMinutes / 30) * 30;
  }

  function buildStartWindowGroups(slotsForDay) {
    const groupsByAnchor = {};

    slotsForDay
      .filter(slot => slotStartMinutes(slot) !== null && slotEndMinutes(slot) !== null)
      .forEach(slot => {
        const anchor = floorToHalfHour(slotStartMinutes(slot));

        if (!groupsByAnchor[anchor]) {
          groupsByAnchor[anchor] = {
            startMin: anchor,
            endMin: anchor + 30,
            items: []
          };
        }

        groupsByAnchor[anchor].items.push(slot);
      });

    return Object.values(groupsByAnchor)
      .sort((a, b) => a.startMin - b.startMin)
      .map(group => {
        const uniqueStarts = Array.from(new Set(group.items.map(slot => slot.start)));
        return {
          ...group,
          mixedStarts: uniqueStarts.length > 1
        };
      });
  }

  function groupItemsByExactStart(items) {
    const groups = {};

    items.forEach(slot => {
      if (!groups[slot.start]) groups[slot.start] = [];
      groups[slot.start].push(slot);
    });

    return Object.keys(groups).sort().map(start => ({
      start,
      items: groups[start].slice().sort((a, b) => {
        if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
        if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
        return a.roomLabel.localeCompare(b.roomLabel);
      })
    }));
  }

  function renderStartWindowGroup(group) {
    const items = group.items.slice().sort((a, b) => {
      const startDiff = slotStartMinutes(a) - slotStartMinutes(b);
      if (startDiff) return startDiff;

      if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
      if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;

      return a.roomLabel.localeCompare(b.roomLabel);
    });

    const availableCount = items.filter(slot => !slot.full && cartFor(slot.id) < slot.remaining).length;
    const label = showTime(timeFromMin(group.startMin)) + "–" + showTime(timeFromMin(group.endMin));
    const startGroups = groupItemsByExactStart(items);

    const content = startGroups.length > 1
      ? '<div class="start-columns">' + startGroups.map(startGroup =>
          '<div class="start-column">' +
            '<div class="start-column-title">Début ' + esc(showTime(startGroup.start)) + '<span>' + startGroup.items.length + ' choix</span></div>' +
            '<div class="grid">' + startGroup.items.map(renderChoice).join("") + '</div>' +
          '</div>'
        ).join("") + '</div>'
      : '<div class="grid">' + items.map(renderChoice).join("") + '</div>';

    return (
      '<section class="timegroup window">' +
        '<div class="timegroup-head">' +
          '<div>' +
            '<div class="timegroup-title">Départs entre ' + esc(label) + '</div>' +
            '<div class="timegroup-sub">Les propositions sont séparées par heure de début pour comparer facilement les choix proches.</div>' +
            (group.mixedStarts ? '<div class="window-note">Horaires proches regroupés, mais séparés par début exact</div>' : '') +
          '</div>' +
          '<div class="timegroup-count">' + availableCount + ' choix disponible(s)</div>' +
        '</div>' +
        '<div class="timegroup-body">' +
          content +
        '</div>' +
      '</section>'
    );
  }

  function render() {
    renderFilters();

    const visible = visibleSlotsForActiveDay();
    renderSuggestions(visible);
    $("jps-total").textContent = visible.length;
    $("jps-avail").textContent = visible.filter(slot => !slot.full && cartFor(slot.id) < slot.remaining).length;
    $("jps-conf").textContent = visible.reduce((sum, slot) => sum + slot.confirmed, 0);
    $("jps-pend").textContent = visible.reduce((sum, slot) => sum + slot.pending, 0);

    const day = DAYS.find(d => d.iso === activeDay);
    const startWindowGroups = buildStartWindowGroups(visible);

    $("jps-days").innerHTML =
      '<section class="day">' +
        '<div class="dayhead">' +
          '<div>' +
            '<div class="daytitle">' + esc(day ? day.label : activeDay) + '</div>' +
            '<div class="daymeta">Choisissez une demi-heure de départ, puis ajoutez une activité au parcours d’une classe. Vous pouvez aussi filtrer par demi-journée.</div>' +
          '</div>' +
          '<div class="badge">' + visible.length + ' créneau(x)</div>' +
        '</div>' +
        '<div class="daybody">' +
          '<p class="choice-hint">Mode d’emploi : les propositions sont regroupées par demi-heure de départ, puis séparées par début exact. Vous pouvez ainsi comparer les choix proches sans mélanger toute la matinée.</p>' +
          (startWindowGroups.length ? startWindowGroups.map(renderStartWindowGroup).join("") : '<div class="empty">Aucun créneau disponible pour cette journée.</div>') +
        '</div>' +
      '</section>';

    renderCart();
  }

  function renderTimeGroup(key) {
    const parts = key.split("|");
    const start = parts[0];
    const end = parts[1];

    const items = visibleSlotsForActiveDay()
      .filter(slot => slot.start === start && slot.end === end)
      .sort((a, b) => {
        if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
        if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
        return a.roomLabel.localeCompare(b.roomLabel);
      });

    const availableCount = items.filter(slot => !slot.full && cartFor(slot.id) < slot.remaining).length;

    return (
      '<section class="timegroup">' +
        '<div class="timegroup-head">' +
          '<div>' +
            '<div class="timegroup-title">' + esc(showTime(start)) + "–" + esc(showTime(end)) + '</div>' +
            '<div class="timegroup-sub">Choix possibles sur ce créneau</div>' +
          '</div>' +
          '<div class="timegroup-count">' + availableCount + ' choix disponible(s)</div>' +
        '</div>' +
        '<div class="timegroup-body">' +
          '<div class="grid">' + items.map(renderChoice).join("") + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function openSlotById(slotId) {
    const slot = allSlots.find(item => item.id === slotId);

    if (!slot) {
      alert("Créneau introuvable. Rechargez la page puis réessayez.");
      return;
    }

    if (slot.full || cartFor(slot.id) >= slot.remaining) {
      alert("Ce créneau est complet ou réservé.");
      return;
    }

    openBooking(slot);
  }

  function openInfoById(slotId) {
    const slot = allSlots.find(item => item.id === slotId);

    if (!slot) {
      alert("Créneau introuvable. Rechargez la page puis réessayez.");
      return;
    }

    currentSlot = slot;

    $("jps-i-title").textContent = slot.title;
    $("jps-i-time").textContent = formatDate(slot.dateIso) + " — " + showTime(slot.start) + "-" + showTime(slot.end);
    $("jps-i-room").textContent = slot.roomLabel;
    $("jps-i-pole").textContent = slot.pole || "—";
    $("jps-i-public").textContent = slot.publicTarget || "—";
    $("jps-i-type").textContent = slot.type || "—";
    $("jps-i-desc").textContent = slot.description || "—";
    $("jps-i-capacity").textContent =
      slot.capacity + " places · " +
      slot.confirmed + " confirmée(s) · " +
      slot.pending + " en attente · " +
      Math.max(0, slot.remaining - cartFor(slot.id)) + " restante(s)";

    const button = $("jps-i-add");
    if (slot.full || cartFor(slot.id) >= slot.remaining) {
      button.className = "btn disabled";
      button.textContent = "Complet";
    } else {
      button.className = "btn";
      button.textContent = "Ajouter ce créneau au panier";
    }

    openModal("jps-info");
  }

  function nextSlotsAfter(slot) {
    const currentEnd = minutes(slot.end);
    const period = halfDayForSlot(slot);

    if (currentEnd === null) return [];

    return visibleSlotsForActiveDay()
      .filter(candidate => candidate.id !== slot.id)
      .filter(candidate => candidate.dateIso === slot.dateIso)
      .filter(candidate => halfDayForSlot(candidate) === period)
      .filter(candidate => minutes(candidate.start) !== null && minutes(candidate.start) >= currentEnd)
      .filter(candidate => !candidate.full && cartFor(candidate.id) < candidate.remaining)
      .sort((a, b) => {
        const diff = minutes(a.start) - minutes(b.start);
        if (diff) return diff;

        if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
        if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;

        return a.roomLabel.localeCompare(b.roomLabel);
      })
      .slice(0, 5);
  }

  function renderNextSuggestions(slot) {
    const box = $("jps-next-box");
    const next = nextSlotsAfter(slot);

    if (!box) return;

    if (!next.length) {
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    box.style.display = "block";
    box.innerHTML =
      '<div class="nextbox-title">Et ensuite ? Suggestions de suite sur la même demi-journée</div>' +
      '<div class="nextbox-help">Cliquez sur “Ajouter ce créneau et préparer cette suite” pour enregistrer le choix en cours avec les informations saisies, puis préparer le créneau suivant.</div>' +
      '<div class="nextlist">' +
        next.map(candidate =>
          '<div class="nextitem">' +
            '<strong>' + esc(showTime(candidate.start)) + '–' + esc(showTime(candidate.end)) + ' · ' + esc(candidate.roomLabel) + '</strong>' +
            '<span>' + esc(candidate.title) + '</span>' +
            '<span>' + Math.max(0, candidate.remaining - cartFor(candidate.id)) + ' place(s) disponible(s)</span>' +
            '<div class="next-actions">' +
              '<button type="button" class="btn2 next-info" data-next-info-slot-id="' + esc(candidate.id) + '">Détail / infos</button>' +
              '<button type="button" class="btn2" data-next-slot-id="' + esc(candidate.id) + '">Ajouter ce créneau et préparer cette suite</button>' +
            '</div>' +
          '</div>'
        ).join("") +
      '</div>';
  }

  function openBooking(slot) {
    currentSlot = slot;
    const last = loadLastGroup();

    $("jps-b-slot").textContent =
      formatDate(slot.dateIso) + " — " +
      showTime(slot.start) + "-" + showTime(slot.end) + " — " +
      slot.title + " — " +
      slot.roomLabel;

    $("jps-b-places").textContent =
      Math.max(0, slot.remaining - cartFor(slot.id)) + " place(s) encore disponible(s), " +
      slot.pending + " en attente, " +
      slot.confirmed + " confirmé(s).";

    clearBookingFields();
    setupExistingGroupSelect();
    setupReusePreviousBox(last);
    updateBookingHelp();
    renderNextSuggestions(slot);
    openModal("jps-booking");
    setTimeout(() => $("jps-b-group").focus(), 50);
  }

  function updateBookingHelp() {
    if (!currentSlot) return;

    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);
    const total = students + adults;
    const already = cartFor(currentSlot.id);
    const available = Math.max(0, currentSlot.remaining - already);
    const minAdults = requiredAdults(students);

    $("jps-b-help").textContent =
      "Total pour cette classe : " + total +
      " personne(s). Places encore disponibles sur ce créneau : " + available +
      ". Accompagnement demandé : au moins " + minAdults + " accompagnateur(s).";

    const messages = [];
    if (total > available) messages.push("Cette classe dépasse les places disponibles sur ce créneau.");
    if (students > 0 && adults < minAdults) messages.push("Merci de prévoir au minimum 1 accompagnateur pour 10 enfants / jeunes, soit " + minAdults + " accompagnateur(s) pour ce groupe.");

    const warning = $("jps-b-warning");
    if (messages.length) {
      warning.style.display = "block";
      warning.textContent = messages.join(" ");
    } else {
      warning.style.display = "none";
      warning.textContent = "";
    }
  }

  function addCurrentSelectionToCart(options) {
    if (!currentSlot) return null;

    const opts = options || {};
    const group = $("jps-b-group").value.trim();
    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);
    const total = students + adults;
    const available = Math.max(0, currentSlot.remaining - cartFor(currentSlot.id));

    if (!group) {
      alert("Indiquez la classe ou le groupe.");
      return null;
    }

    if (students <= 0) {
      alert("Indiquez le nombre d’élèves.");
      return null;
    }

    const minAdults = requiredAdults(students);
    if (adults < minAdults) {
      alert("Merci de prévoir au minimum 1 accompagnateur pour 10 enfants / jeunes. Pour ce groupe, il faut au moins " + minAdults + " accompagnateur(s).");
      return null;
    }

    if (total > available) {
      alert("Ce créneau n’a pas assez de places disponibles pour cette classe.");
      return null;
    }

    const conflict = conflictForGroup(group, currentSlot);
    if (conflict) {
      alert("Cette classe a déjà un créneau au même moment : " + conflict.title + ". Utilisez un autre nom de groupe si vous souhaitez diviser la classe.");
      return null;
    }

    const data = { group, students, adults };

    cart.push({
      uid: Date.now() + "_" + Math.random(),
      slotId: currentSlot.id,
      dateIso: currentSlot.dateIso,
      start: currentSlot.start,
      end: currentSlot.end,
      roomKey: currentSlot.roomKey,
      roomLabel: currentSlot.roomLabel,
      title: currentSlot.title,
      publicTarget: currentSlot.publicTarget || "",
      group,
      students,
      adults
    });

    saveLastGroup(data);
    saveCart();

    if (!opts.keepModalOpen) {
      closeModal("jps-booking");
      render();
    }

    return data;
  }

  function addToCart() {
    addCurrentSelectionToCart();
  }

  function cartItemPeople(item) {
    return parseNumber(item.students) + parseNumber(item.adults);
  }

  function cartItemLine(item) {
    return esc(showTime(item.start)) + "-" + esc(showTime(item.end)) +
      " · " + esc(item.title) +
      " · " + esc(item.group || "Groupe") +
      " · " + cartItemPeople(item) + " personne(s)";
  }

  function groupCartByDate(items) {
    const byDate = {};
    items.forEach(item => {
      const key = item.dateIso || "date";
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(item);
    });
    Object.keys(byDate).forEach(key => {
      byDate[key].sort((a, b) => {
        if (a.start !== b.start) return String(a.start).localeCompare(String(b.start));
        return String(a.group || "").localeCompare(String(b.group || ""));
      });
    });
    return byDate;
  }

  function uniqueCartPeopleEstimate() {
    // Estimation plus juste que la somme brute des créneaux :
    // on additionne chaque groupe une seule fois, avec son effectif maximum.
    const groups = {};
    cart.forEach(item => {
      const key = groupKey(item.group || "Groupe");
      const people = cartItemPeople(item);
      groups[key] = Math.max(groups[key] || 0, people);
    });
    return Object.values(groups).reduce((sum, value) => sum + value, 0);
  }

  function renderCartPreview() {
    if (!cart.length) return "";

    const byDate = groupCartByDate(cart);
    const dates = Object.keys(byDate).sort();
    const lines = [];

    dates.forEach(dateKey => {
      lines.push('<div class="cartpreview-date">' + esc(formatDate(dateKey)) + '</div>');
      byDate[dateKey].slice(0, 5).forEach(item => {
        lines.push('<div class="cartpreview-line">' + cartItemLine(item) + '</div>');
      });
      if (byDate[dateKey].length > 5) {
        lines.push('<div class="cartpreview-more">+' + (byDate[dateKey].length - 5) + ' autre(s) créneau(x) ce jour-là</div>');
      }
    });

    const maxLines = 9;
    const visible = lines.slice(0, maxLines).join("");
    const hidden = lines.length > maxLines ? '<div class="cartpreview-more">Ouvrez le panier pour voir tout le détail.</div>' : "";

    return '<div class="cartpreview">' + visible + hidden + '</div>';
  }

  function renderCart() {
    $("jps-cartbar").style.display = cart.length ? "block" : "none";

    if (cart.length) {
      $("jps-cartmeta").innerHTML =
        cart.length + " créneau(x) sélectionné(s) · " +
        uniqueCartPeopleEstimate() + " personne(s) estimée(s) sur le ou les groupes" +
        renderCartPreview();
    } else {
      $("jps-cartmeta").textContent = "";
    }

    $("jps-cart-summary").textContent =
      cart.length
        ? cart.length + " créneau(x) sélectionné(s). Le détail ci-dessous est regroupé par classe, jour et horaire."
        : "Panier vide.";

    if (!cart.length) {
      $("jps-cart-list").innerHTML = '<div class="empty">Aucun créneau sélectionné.</div>';
      return;
    }

    const groups = byGroup(cart);

    $("jps-cart-list").innerHTML = Object.keys(groups).sort().map(group => {
      const items = groups[group].slice().sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        return a.start.localeCompare(b.start);
      });

      const total = items.reduce((sum, item) => sum + item.students + item.adults, 0);
      const warning = cartGroupHasConflict(items)
        ? '<div class="conflict">Attention : cette classe a plusieurs activités au même moment.</div>'
        : "";

      return (
        '<div class="groupbox">' +
          '<div class="grouphead">' + esc(group) + " · " + total + " personne(s)" + '</div>' +
          warning +
          items.map(item =>
            '<div class="cartitem">' +
              '<div class="cartitemtitle">' +
                esc(formatDate(item.dateIso)) + " — " +
                esc(showTime(item.start)) + "-" + esc(showTime(item.end)) + " — " +
                esc(item.title) +
              '</div>' +
              '<div class="cartitemmeta">' +
                '<strong>' + esc(formatDate(item.dateIso)) + ' · ' + esc(showTime(item.start)) + '-' + esc(showTime(item.end)) + '</strong><br>' +
                esc(item.roomLabel) + (item.publicTarget ? ' · Public : ' + esc(item.publicTarget) : '') + '<br>' +
                'Élèves : ' + item.students +
                ' · Accompagnateurs : ' + item.adults +
                ' · Total : ' + (item.students + item.adults) +
              '</div>' +
              '<button class="danger" type="button" data-remove="' + esc(item.uid) + '">Retirer</button>' +
            '</div>'
          ).join("") +
        '</div>'
      );
    }).join("");
  }

  function cartGroupHasConflict(items) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].dateIso !== items[j].dateIso) continue;
        if (rangesOverlap(minutes(items[i].start), minutes(items[i].end), minutes(items[j].start), minutes(items[j].end))) return true;
      }
    }
    return false;
  }

  function buildFormPayload() {
    const detail = cart.map((item, index) =>
      (index + 1) + ") " +
      formatDate(item.dateIso) + " — " +
      showTime(item.start) + "-" + showTime(item.end) + " — " +
      item.title + "\n" +
      "Salle : " + item.roomLabel + "\n" +
      (item.publicTarget ? "Public conseillé : " + item.publicTarget + "\n" : "") +
      "Classe / groupe : " + item.group + "\n" +
      "Élèves : " + item.students + "\n" +
      "Accompagnateurs : " + item.adults + "\n" +
      "Total : " + (item.students + item.adults)
    ).join("\n\n");

    const ids = cart.map(item =>
      [
        item.dateIso,
        compact(item.start),
        compact(item.end),
        item.roomKey,
        slug(item.title),
        item.group,
        item.students,
        item.adults
      ].join("|")
    ).join(";\n");

    return { detail, ids };
  }

  function buildFormUrl() {
    const payload = buildFormPayload();
    return FORM_URL +
      "?usp=pp_url" +
      "&" + ENTRY_DETAIL + "=" + encodeURIComponent(payload.detail) +
      "&" + ENTRY_IDS + "=" + encodeURIComponent(payload.ids);
  }

  function renderFinalSummary() {
    const groups = byGroup(cart);
    const groupNames = Object.keys(groups).sort();
    const people = cartPeople();

    $("jps-confirm-total").textContent =
      groupNames.length + " classe(s) / groupe(s) · " +
      cart.length + " créneau(x) · " +
      people + " personne(s) au total.";

    $("jps-confirm-content").innerHTML = groupNames.map(group => {
      const items = groups[group].slice().sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        return a.start.localeCompare(b.start);
      });

      const total = items.reduce((sum, item) => sum + item.students + item.adults, 0);

      return (
        '<div class="groupbox">' +
          '<div class="grouphead">' + esc(group) + " · " + total + " personne(s)" + '</div>' +
          '<div class="mini-timeline">' +
            items.map(item =>
              '<div class="mini-line">' +
                '<strong>' + esc(formatDate(item.dateIso)) + " · " + esc(showTime(item.start)) + "-" + esc(showTime(item.end)) + '</strong>' +
                esc(item.title) + '<br>' +
                '<span class="meta">' + esc(item.roomLabel) + ' · ' + item.students + ' élève(s) · ' + item.adults + ' accompagnateur(s)</span>' +
              '</div>'
            ).join("") +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function submitCart() {
    if (!cart.length) {
      alert("Votre panier est vide.");
      return;
    }

    renderFinalSummary();
    openModal("jps-confirm");
  }

  function submitCartFinal() {
    window.open(buildFormUrl(), "_blank");
  }

  function openModal(id) {
    $(id).classList.add("open");
  }

  function closeModal(id) {
    $(id).classList.remove("open");
  }

  document.addEventListener("click", function (event) {
    const suggestButton = event.target.closest("[data-suggest-duration]");
    if (suggestButton && root.contains(suggestButton)) {
      event.preventDefault();
      openAutoBuilder(
        parseInt(suggestButton.getAttribute("data-suggest-duration"), 10),
        suggestButton.getAttribute("data-suggest-period") || "all"
      );
      return;
    }

    const addButton = event.target.closest("[data-add-slot-id]");
    if (addButton && root.contains(addButton)) {
      event.preventDefault();
      openSlotById(addButton.getAttribute("data-add-slot-id"));
      return;
    }

    const infoButton = event.target.closest("[data-info-slot-id]");
    if (infoButton && root.contains(infoButton)) {
      event.preventDefault();
      openInfoById(infoButton.getAttribute("data-info-slot-id"));
      return;
    }

    const nextInfoButton = event.target.closest("[data-next-info-slot-id]");
    if (nextInfoButton && root.contains(nextInfoButton)) {
      event.preventDefault();
      openInfoById(nextInfoButton.getAttribute("data-next-info-slot-id"));
      return;
    }

    const nextButton = event.target.closest("[data-next-slot-id]");
    if (nextButton && root.contains(nextButton)) {
      event.preventDefault();
      const next = allSlots.find(slot => slot.id === nextButton.getAttribute("data-next-slot-id"));
      if (next) {
        const data = addCurrentSelectionToCart({ keepModalOpen: true });
        if (!data) return;

        closeModal("jps-booking");
        render();
        openBooking(next);
        fillBookingFields(data);
        updateBookingHelp();
      }
      return;
    }

    const removeButton = event.target.closest("[data-remove]");
    if (removeButton && root.contains(removeButton)) {
      event.preventDefault();
      cart = cart.filter(item => String(item.uid) !== String(removeButton.getAttribute("data-remove")));
      saveCart();
      render();
      return;
    }

    const closeButton = event.target.closest("[data-close]");
    if (closeButton && root.contains(closeButton)) {
      event.preventDefault();
      closeModal(closeButton.getAttribute("data-close"));
    }
  });

  ["jps-booking", "jps-cart", "jps-info", "jps-confirm", "jps-auto"].forEach(id => {
    $(id).addEventListener("click", event => {
      if (event.target === $(id)) closeModal(id);
    });
  });

  ["jps-b-students", "jps-b-adults"].forEach(id => {
    $(id).addEventListener("input", updateBookingHelp);
  });

  $("jps-b-existing").addEventListener("change", function () {
    const value = $("jps-b-existing").value;
    if (!value) {
      clearBookingFields();
      updateBookingHelp();
      return;
    }

    const match = uniqueGroupsForSelect().find(g => g.group === value);
    if (match) fillBookingFields(match);
    $("jps-b-reuse").checked = false;
    updateBookingHelp();
  });

  $("jps-b-reuse").addEventListener("change", toggleReusePrevious);

  ["jps-level-filter", "jps-period-filter"].forEach(id => {
    $(id).addEventListener("change", render);
  });

  $("jps-auto-existing").addEventListener("change", function () {
    const value = $("jps-auto-existing").value;
    if (!value) {
      fillAutoFields({ group: "", students: "", adults: "" });
      renderAutoRoute([], "Renseignez la classe, puis cliquez sur “Proposer un parcours”.");
      return;
    }

    const match = uniqueGroupsForSelect().find(g => g.group === value);
    if (match) fillAutoFields(match);
    renderAutoRoute([], "Cliquez sur “Proposer un parcours” pour cette classe.");
  });

  ["jps-auto-group", "jps-auto-students", "jps-auto-adults"].forEach(id => {
    $(id).addEventListener("input", function () {
      renderAutoRoute([], "Cliquez sur “Proposer un parcours” pour mettre à jour la suggestion.");
    });
  });

  $("jps-auto-search").addEventListener("click", searchAutoRoute);
  $("jps-auto-add").addEventListener("click", addAutoRouteToCart);

  $("jps-b-add").addEventListener("click", addToCart);

  $("jps-i-add").addEventListener("click", function () {
    if (!currentSlot || currentSlot.full || cartFor(currentSlot.id) >= currentSlot.remaining) return;
    closeModal("jps-info");
    openBooking(currentSlot);
  });

  $("jps-open-cart").addEventListener("click", () => {
    renderCart();
    openModal("jps-cart");
  });

  $("jps-send").addEventListener("click", submitCart);
  $("jps-submit").addEventListener("click", submitCart);
  $("jps-confirm-send").addEventListener("click", submitCartFinal);

  $("jps-clear").addEventListener("click", () => {
    if (confirm("Vider le panier ?")) {
      cart = [];
      saveCart();
      render();
    }
  });

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(response => {
      if (!response.ok) throw new Error("Propositions HTTP " + response.status);
      return response.text();
    }),
    fetch(DEMANDES_CSV).then(response => {
      if (!response.ok) throw new Error("Demandes HTTP " + response.status);
      return response.text();
    })
  ])
    .then(([propositionsText, demandesText]) => {
      const propositionsRows = parseCSV(propositionsText);
      const demandesRows = parseCSV(demandesText);
      const reservations = buildReservations(demandesRows);

      allSlots = applyReservations(buildSlots(propositionsRows), reservations);

      if (!allSlots.some(slot => slot.dateIso === activeDay) && allSlots.length) {
        activeDay = allSlots[0].dateIso;
      }

      window.JPS_ECOLES_DEBUG = {
        ...(window.JPS_ECOLES_DEBUG || {}),
        slotsCount: allSlots.length,
        slots: allSlots
      };

      render();
    })
    .catch(error => {
      $("jps-error").textContent = "Erreur lors du chargement : " + error.message;
    });
});
