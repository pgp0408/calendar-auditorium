(function () {
  function initJpoPublic() {
  let root = document.getElementById("jpo-public") || document.getElementById("jpopublic") || document.getElementById("semainejpo-public");
  if (!root) {
    root = document.createElement("div");
    root.id = "jpo-public";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";
  const PUBLIC_RESERVATIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQW1bMZzHG6eX8uFh3OSKx_RLEDeK1TySVyxfG1fRTMhDc5H5Ys67qtOT0GvuBUZhxFfOjswgf2Q1bC/pub?gid=1847062844&single=true&output=csv";
  const PUBLIC_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc4XBThiuiqWqE7Fideaj72HKhEb8FMijtyjc7fKG2wp0hxDA/viewform";
  const PUBLIC_FORM_ENTRIES = {
    nom: "entry.1813426863",
    email: "entry.854510523",
    telephone: "entry.1691524753",
    places: "entry.1263135869",
    commentaire: "entry.563073617",
    evenement: "entry.938863498",
    date: "entry.1297700851",
    horaire: "entry.585810414",
    lieu: "entry.660534915",
    idCreneau: "entry.732719103",
    statut: "entry.1778702146"
  };

  const DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19" },
    { iso: "2026-06-20", label: "Samedi 20 juin", short: "Sam. 20" },
    { iso: "2026-06-21", label: "Dimanche 21 juin", short: "Dim. 21" }
  ];

  const SCHOOL_BLOCK_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
  const AUTO_DAYS = ["2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19"];
  const AUTO_SLOTS = [["08:00", "09:00"], ["09:00", "10:00"], ["10:00", "11:00"], ["11:00", "12:00"], ["14:00", "15:00"], ["15:00", "16:00"], ["16:00", "17:00"]];
  const LARGE_ROOM_KEYS = ["auditorium", "orchestre", "chant", "choeur", "theatre", "danse1", "danse2", "danse3"];

  const ROOM_DEFAULTS = {
    auditorium: { label: "Auditorium", capacity: 165 },
    orchestre: { label: "Salle d’orchestre", capacity: 35 },
    chant: { label: "Salle de chant", capacity: 35 },
    choeur: { label: "Salle de chœur", capacity: 35 },
    theatre: { label: "Salle de théâtre", capacity: 35 },
    danse1: { label: "Studio de danse 1", capacity: 35 },
    danse2: { label: "Studio de danse 2", capacity: 35 },
    danse3: { label: "Studio de danse 3", capacity: 35 },
    eveil: { label: "Salle d’éveil", capacity: 20 },
    other: { label: "Autre espace / salle précisée", capacity: 35 },
    any: { label: "Lieu à préciser", capacity: 35 }
  };

  let allSlots = [];
  let publicReservationsMap = {};
  let publicCart = [];
  let publicCartPlaces = 1;
  let activeDay = "all";
  let activePole = "all";
  let activeFocus = "all";
  let searchTerm = "";

  root.innerHTML = `
    <style>
      #jpo-public{--text:#111827;--muted:#64748b;--border:#e5e7eb;--soft:#f8fafc;--blue:#2563eb;--green:#166534;--gold:#92400e;font-family:Arial,sans-serif;color:var(--text);width:100%}
      #jpo-public *{box-sizing:border-box}
      #jpo-public .wrap{max-width:1120px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
      #jpo-public .head{padding:30px;background:radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),radial-gradient(circle at top left,rgba(22,163,74,.10),transparent 30%),#fff;border-bottom:1px solid var(--border)}
      #jpo-public h2{margin:0;font-size:clamp(30px,4vw,44px);line-height:1.04;letter-spacing:-.045em}
      #jpo-public .sub{margin:12px 0 0;color:var(--muted);font-size:16px;line-height:1.6;max-width:940px;font-weight:750}
      #jpo-public .intro{margin-top:18px;border:1px solid #dbeafe;background:linear-gradient(180deg,#eff6ff 0,#fff 100%);color:#1e3a8a;border-radius:22px;padding:18px;font-size:14px;line-height:1.55;font-weight:800}
      #jpo-public .intro strong{color:#111827;font-weight:900}
      #jpo-public .intro-title{font-size:17px;line-height:1.25;font-weight:950;color:#111827;margin-bottom:8px}
      #jpo-public .intro-text{margin:0 0 14px;color:#334155;font-weight:800}
      #jpo-public .intro-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
      #jpo-public .intro-item{border:1px solid #dbeafe;background:#fff;border-radius:16px;padding:12px;color:#1e3a8a}
      #jpo-public .intro-item b{display:block;color:#111827;font-size:13px;margin-bottom:4px}
      #jpo-public .intro-item span{display:block;color:#475569;font-size:13px;line-height:1.4;font-weight:850}
      #jpo-public .freebox{margin-top:14px;border:1px solid #bbf7d0;background:#f0fdf4;color:#14532d;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:850}
      #jpo-public .freebox strong{color:#166534;font-weight:950}
      #jpo-public .contactline{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap}
      #jpo-public .contactline a{display:inline-flex;align-items:center;text-decoration:none;border-radius:999px;padding:8px 10px;font-size:13px;font-weight:950}
      #jpo-public .contactline .mail{background:#166534;color:#fff}
      #jpo-public .contactline .phone{border:1px solid #86efac;background:#fff;color:#166534}
      #jpo-public .content{padding:22px}
      #jpo-public .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:16px}
      #jpo-public .stat{border:1px solid var(--border);border-radius:18px;padding:14px;background:#fff}
      #jpo-public .num{font-size:28px;font-weight:900;line-height:1}.lab{margin-top:5px;color:var(--muted);font-size:12px;font-weight:900;line-height:1.3}
      #jpo-public .toolbar{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:10px;margin-bottom:18px;align-items:end}
      #jpo-public .tool label{display:block;font-size:12px;color:#475569;font-weight:900;margin-bottom:5px;text-transform:uppercase}
      #jpo-public select,#jpo-public input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:11px;font-size:14px;font-weight:800;background:#fff}
      #jpo-public .focus{margin:0 0 22px;border:1px solid #fde68a;background:#fffbeb;border-radius:24px;overflow:hidden}
      #jpo-public .focus-head{padding:17px 18px;border-bottom:1px solid #fde68a;display:flex;justify-content:space-between;gap:10px;align-items:center;background:#fff7ed}
      #jpo-public .focus-title{font-size:22px;font-weight:900;letter-spacing:-.035em;color:#78350f;text-transform:uppercase}
      #jpo-public .focus-sub{margin-top:4px;color:#92400e;font-size:13px;font-weight:800;line-height:1.4}
      #jpo-public .focus-body{padding:14px}
      #jpo-public .days{display:grid;gap:22px}
      #jpo-public .day{border:1px solid var(--border);border-radius:24px;overflow:hidden;background:#fff}
      #jpo-public .dayhead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:18px;background:#f8fafc;border-bottom:1px solid var(--border)}
      #jpo-public .daytitle{font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-.035em}
      #jpo-public .daymeta{margin-top:4px;color:#64748b;font-size:13px;font-weight:850;line-height:1.4}
      #jpo-public .badge{border-radius:999px;background:#e2e8f0;color:#334155;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}
      #jpo-public .daybody{padding:14px}
      #jpo-public .timegroup{margin-bottom:14px;border:1px solid #e7eaee;border-radius:20px;overflow:hidden;background:#fff}
      #jpo-public .timehead{padding:13px 15px;background:#fbfcfd;border-bottom:1px solid #edf0f3;display:flex;justify-content:space-between;gap:10px;align-items:center}
      #jpo-public .time{font-size:19px;font-weight:900;letter-spacing:-.02em}
      #jpo-public .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;padding:12px}
      #jpo-public .card{border:1px solid var(--border);border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,.04)}
      #jpo-public .card.strong{border-color:#fbbf24;background:linear-gradient(180deg,#fffbeb 0,#fff 80%)}
      #jpo-public .top{padding:14px;background:#fbfcfd;border-bottom:1px solid #edf0f3}
      #jpo-public .tagline{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px}
      #jpo-public .chip{border-radius:999px;background:#f1f5f9;color:#334155;padding:5px 8px;font-size:11px;font-weight:900}
      #jpo-public .chip.gold{background:#fef3c7;color:#92400e}.chip.green{background:#dcfce7;color:#166534}.chip.blue{background:#dbeafe;color:#1e40af}
      #jpo-public .title{font-size:18px;line-height:1.22;font-weight:900;letter-spacing:-.02em}
      #jpo-public .desc{margin-top:9px;color:#475569;font-size:13px;line-height:1.45;font-weight:750}
      #jpo-public .body{padding:14px;color:#334155;font-size:13px;line-height:1.5;font-weight:800}
      #jpo-public .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      #jpo-public .cartbar{display:none;position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(1080px,calc(100vw - 28px));margin:0;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:20px;padding:14px;color:#14532d;z-index:99990;box-shadow:0 18px 50px rgba(15,23,42,.18)}
      #jpo-public .cartbar.open{display:block}
      #jpo-public .cartrow{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
      #jpo-public .carttitle{font-weight:950;color:#111827}.cartmeta{margin-top:4px;font-size:13px;font-weight:850;color:#166534}
      #jpo-public .cartitem{border:1px solid #e5e7eb;background:#fff;border-radius:14px;padding:10px;margin:8px 0;display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      #jpo-public .cartitem b{display:block;color:#111827}.cartitem span{display:block;color:#64748b;font-size:13px;font-weight:800;margin-top:3px}
      #jpo-public button{font-family:inherit}
      #jpo-public .btn{border:0;background:#111827;color:#fff;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer}
      #jpo-public .btn2{border:1px solid #cbd5e1;background:#fff;color:#111827;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
      #jpo-public .empty{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:18px;padding:18px;font-weight:850;line-height:1.45}
      #jpo-public .modal{display:none;position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.55);padding:20px;align-items:center;justify-content:center}
      #jpo-public .modal.open{display:flex}.box{width:min(860px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}
      #jpo-public .close{position:absolute;top:10px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer;color:#111827}
      #jpo-public .modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-.03em}
      #jpo-public .row{display:grid;grid-template-columns:170px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}.row:last-child{border-bottom:0}
      #jpo-public .label{font-weight:900;color:#111827}
      #jpo-public .error{color:#b91c1c;font-weight:900;white-space:pre-wrap}
      @media(max-width:840px){#jpo-public .toolbar,#jpo-public .stats{grid-template-columns:1fr}#jpo-public .row{grid-template-columns:1fr;gap:4px}#jpo-public .head,#jpo-public .content{padding:18px}}

      /* Panier flottant public: fixe au viewport, hors flux WordPress */
      #jpo-public-cartbar{
        display:none;
        position:fixed!important;
        left:50%!important;
        right:auto!important;
        bottom:14px!important;
        transform:translateX(-50%)!important;
        width:min(1080px,calc(100vw - 28px))!important;
        max-width:calc(100vw - 28px)!important;
        margin:0!important;
        border:1px solid #bbf7d0!important;
        background:#f0fdf4!important;
        border-radius:20px!important;
        padding:14px!important;
        color:#14532d!important;
        z-index:2147483000!important;
        box-shadow:0 18px 50px rgba(15,23,42,.22)!important;
        font-family:Arial,sans-serif!important;
        box-sizing:border-box!important;
      }
      #jpo-public-cartbar.open{display:block!important}
      #jpo-public-cartbar *{box-sizing:border-box!important}
      #jpo-public-cartbar .cartrow{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
      #jpo-public-cartbar .carttitle{font-weight:950;color:#111827}
      #jpo-public-cartbar .cartmeta{margin-top:4px;font-size:13px;font-weight:850;color:#166534}
      #jpo-public-cartbar .actions{display:flex;gap:8px;flex-wrap:wrap}
      #jpo-public-cartbar .btn{border:0;background:#111827;color:#fff;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;font-family:inherit}
      #jpo-public-cartbar .btn2{border:1px solid #cbd5e1;background:#fff;color:#111827;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;font-family:inherit}
      @media(max-width:840px){
        #jpo-public-cartbar{bottom:10px!important;width:calc(100vw - 20px)!important;max-width:calc(100vw - 20px)!important;padding:12px!important;border-radius:18px!important}
        #jpo-public-cartbar .cartrow{align-items:flex-start}
        #jpo-public-cartbar .actions{width:100%}
        #jpo-public-cartbar .actions .btn,#jpo-public-cartbar .actions .btn2{flex:1;justify-content:center}
      }

    </style>
    <div class="wrap">
      <header class="head">
        <h2>Journées Portes Ouvertes du Conservatoire Henri Tomasi</h2>
        <p class="sub">Du 15 au 21 juin 2026, le Conservatoire Henri Tomasi vous invite à découvrir son nouveau bâtiment, ses disciplines et la richesse de ses pratiques artistiques.</p>
        <div class="intro">
          <div class="intro-title">Une semaine pour découvrir, rencontrer et préparer son parcours au Conservatoire.</div>
          <p class="intro-text">Cette page s’adresse aux familles, futurs élèves, parents, curieux et amateurs de musique, de danse ou de théâtre. Elle rassemble les propositions accessibles au grand public : concerts, auditions, ateliers ouverts, démonstrations, rencontres avec les enseignants et temps de découverte. L’objectif est simple : vous aider à choisir le bon moment pour venir, assister à des formats courts et vivants, poser vos questions et mieux comprendre les enseignements proposés au Conservatoire.</p>
          <div class="intro-grid">
            <div class="intro-item"><b>Lundi, mardi, jeudi et vendredi</b><span>Accueil du public à partir de 17h, avec de nombreuses propositions jusqu’à 20h.</span></div>
            <div class="intro-item"><b>Mercredi 17 juin — journée familles</b><span>Une journée spécialement pensée pour les enfants, adolescents et parents : découvertes, rencontres, essais, mini-présentations et informations pratiques.</span></div>
            <div class="intro-item"><b>Samedi 20 juin</b><span>Des rendez-vous accessibles jusqu’à 16h pour prolonger la découverte du Conservatoire, de ses espaces et de ses disciplines.</span></div>
            <div class="intro-item"><b>Dimanche 21 juin</b><span>De 16h à 20h, la semaine se clôture dans un esprit festif autour de la Fête de la musique.</span></div>
          </div>
        </div>
        <div class="freebox"><strong>Entrée libre et gratuite</strong>, dans la limite des places disponibles. Certains rendez-vous peuvent désormais faire l’objet d’une réservation gratuite depuis cette page. Pour toute question ou pour être orienté vers les propositions les plus adaptées, contactez-nous :
          <div class="contactline"><a class="mail" href="mailto:communication@crd.corsica">communication@crd.corsica</a><a class="phone" href="tel:+33667579265">06.67.57.92.65</a></div>
        </div>
      </header>
      <main class="content">
        <div id="jpo-public-error" class="error"></div>
        <div class="stats" id="jpo-public-stats"></div>
        <div class="toolbar">
          <div class="tool"><label>Recherche</label><input id="jpo-public-search" type="search" placeholder="Chercher une discipline, un titre, un lieu..."></div>
          <div class="tool"><label>Jour</label><select id="jpo-public-day"></select></div>
          <div class="tool"><label>Discipline / pôle</label><select id="jpo-public-pole"></select></div>
          <div class="tool"><label>Affichage</label><select id="jpo-public-focus"><option value="all">Tous les rendez-vous</option><option value="tempsforts">Temps forts uniquement</option><option value="auditorium">Auditorium uniquement</option></select></div>
        </div>
        <section class="cartbar" id="jpo-public-cartbar">
          <div class="cartrow">
            <div><div class="carttitle">Panier de réservation</div><div id="jpo-public-cartmeta" class="cartmeta"></div></div>
            <div class="actions"><button type="button" class="btn2" id="jpo-public-open-cart">Voir le panier</button><button type="button" class="btn" id="jpo-public-submit-cart">Finaliser</button></div>
          </div>
        </section>
        <section class="focus" id="jpo-public-focus-section"></section>
        <div class="days" id="jpo-public-output"></div>
      </main>
    </div>
    <div class="modal" id="jpo-public-modal"><div class="box"><button type="button" class="close" data-close-modal>&times;</button><h3 class="modaltitle" id="jpo-public-modal-title"></h3><div id="jpo-public-modal-body"></div></div></div>
    <div class="modal" id="jpo-public-cart-modal"><div class="box"><button type="button" class="close" data-close-cart>&times;</button><h3 class="modaltitle">Panier de réservation</h3><div id="jpo-public-cart-body"></div></div></div>
  `;

  const $ = id => document.getElementById(id);


  // Le panier est sorti du conteneur WordPress et fixé au viewport.
  // Cela évite les effets de parents overflow/transform qui peuvent empêcher position:fixed de suivre l'écran.
  const publicCartBar = document.getElementById("jpo-public-cartbar");
  if (publicCartBar && publicCartBar.parentNode !== document.body) {
    document.body.appendChild(publicCartBar);
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function norm(v) {
    return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function slug(v) {
    return norm(v).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  }

  function compactTime(v) {
    const m = minutes(v);
    if (m === null) return String(v || "").replace(/[^0-9]/g, "").padStart(4, "0").slice(0, 4);
    return String(Math.floor(m / 60)).padStart(2, "0") + String(m % 60).padStart(2, "0");
  }

  function get(row, names) {
    for (const n of names) if (row[n] !== undefined && row[n] !== null && String(row[n]).trim() !== "") return String(row[n]).trim();
    return "";
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (ch === '"') {
        if (q && next === '"') { cell += '"'; i++; }
        else q = !q;
      } else if (ch === "," && !q) { row.push(cell); cell = ""; }
      else if ((ch === "\n" || ch === "\r") && !q) {
        if (ch === "\r" && next === "\n") i++;
        row.push(cell); cell = "";
        if (row.some(v => String(v).trim() !== "")) rows.push(row);
        row = [];
      } else cell += ch;
    }
    row.push(cell);
    if (row.some(v => String(v).trim() !== "")) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map(h => String(h || "").trim());
    return rows.map((r, i) => {
      const o = { __line: i + 2 };
      headers.forEach((h, j) => o[h] = r[j] || "");
      return o;
    });
  }

  function parseDate(v) {
    const s = String(v || "").trim();
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    const low = norm(s);
    const found = DAYS.find(d => low.includes(norm(d.label)) || low.includes(norm(d.short)) || low.includes(d.iso));
    return found ? found.iso : "";
  }

  function minutes(v) {
    const s = String(v || "").trim().replace("h", ":");
    const m = s.match(/(\d{1,2})(?::(\d{2}))?/);
    if (!m) return null;
    return Math.max(0, Math.min(1439, parseInt(m[1], 10) * 60 + parseInt(m[2] || "0", 10)));
  }

  function timeFromMin(m) {
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  function showTime(v) {
    const m = minutes(v);
    return m === null ? "Horaire à préciser" : timeFromMin(m).replace(":", "h");
  }

  function durationMinutes(v, format) {
    const txt = norm((v || "") + " " + (format || ""));
    let m = txt.match(/(\d+)\s*h(?:eure)?/);
    if (m) return parseInt(m[1], 10) * 60;
    m = txt.match(/(\d+)\s*min/);
    if (m) return parseInt(m[1], 10);
    m = txt.match(/bloque\s*(\d+)h/);
    if (m) return parseInt(m[1], 10) * 60;
    return 60;
  }

  function roomKey(v, precision) {
    const s = norm((v || "") + " " + (precision || ""));
    if (s.includes("auditorium")) return "auditorium";
    if (s.includes("orchestre")) return "orchestre";
    if (s.includes("chant")) return "chant";
    if (s.includes("choeur") || s.includes("chœur")) return "choeur";
    if (s.includes("theatre") || s.includes("théâtre")) return "theatre";
    if (s.includes("danse 1")) return "danse1";
    if (s.includes("danse 2")) return "danse2";
    if (s.includes("danse 3")) return "danse3";
    if (s.includes("eveil") || s.includes("éveil")) return "eveil";
    if (s.includes("arbitrer")) return "any";
    return "other";
  }

  function numberFrom(v) {
    const m = String(v || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function isAccepted(row) {
    const st = norm(get(row, ["STATUT", "Statut"]));
    return !st || st.includes("accept");
  }

  function makeSlot(row, forcedDate, forcedStart, forcedEnd, autoLabel, indexSuffix) {
    const dateIso = forcedDate || parseDate(get(row, ["Date souhaitée", "Date"]));
    const start = forcedStart || get(row, ["Horaire de début", "Heure de début", "Début"]);
    const startMin = minutes(start);
    const dur = durationMinutes(get(row, ["Durée estimée", "Durée"]), get(row, ["FORMAT CRD"]));
    const end = forcedEnd || (startMin !== null ? timeFromMin(startMin + dur) : "");
    const retainedRoom = get(row, ["SALLE RETENUE CRD", "Lieu souhaité", "Salle"]);
    const precision = get(row, ["PRÉCISION SALLE / LIEU CRD", "Précision salle"]);
    const key = roomKey(retainedRoom, precision);
    const explicitCapacity = numberFrom(get(row, ["CAPACITÉ CRD"]));
    const explicitEstimated = numberFrom(get(row, ["Nombre estimé de participants / spectateurs"]));
    const realCapacity = explicitCapacity || explicitEstimated || 0;
    const capacity = explicitCapacity || (ROOM_DEFAULTS[key] ? ROOM_DEFAULTS[key].capacity : 35);
    const estimated = explicitEstimated || capacity;
    const title = get(row, ["Intitulé du projet", "Titre"]) || "Proposition à préciser";
    const type = get(row, ["Type de proposition", "Type"]);
    const discipline = get(row, ["Discipline / département", "Discipline"]);
    const pole = get(row, ["PÔLE CRD", "Pôle CRD"]) || discipline || "Autre";
    return {
      id: "public-" + row.__line + "-" + (indexSuffix || "0"),
      line: row.__line,
      name: get(row, ["Nom et prénom", "Nom"]),
      discipline,
      title,
      type,
      description: get(row, ["Description courte / éléments de communication", "Description"]),
      publicTarget: get(row, ["Public visé", "Public"]),
      dateIso,
      start,
      end,
      roomKey: key,
      roomLabel: precision || retainedRoom || (ROOM_DEFAULTS[key] ? ROOM_DEFAULTS[key].label : "Lieu à préciser"),
      capacity,
      estimated,
      realCapacity,
      tech: get(row, ["Besoins techniques"]),
      crdFormat: get(row, ["FORMAT CRD"]),
      pole,
      autoLabel: autoLabel || "",
      search: norm([title, type, discipline, pole, retainedRoom, precision, get(row, ["Nom et prénom"]), get(row, ["Public visé"]), get(row, ["Description courte / éléments de communication"])].join(" "))
    };
  }

  function slotTechnicalId(slot) {
    return [slot.dateIso, compactTime(slot.start), compactTime(slot.end), slot.roomKey, slug(slot.title)].join("|");
  }

  function publicReservationStatus(v) {
    const s = norm(v || "");
    if (s.includes("annul") || s.includes("refus") || s === "non") return "cancelled";
    if (s.includes("confirm") || s === "oui") return "confirmed";
    return "pending";
  }

  function buildPublicReservations(rows) {
    const map = {};
    rows.forEach(row => {
      const rawId = get(row, ["ID créneau", "ID creneau", "Id créneau", "Id creneau"]);
      const status = publicReservationStatus(get(row, ["STATUT CRD", "Statut CRD", "Statut"]));
      if (!rawId || status === "cancelled") return;
      const places = numberFrom(get(row, ["Nombre de places souhaitées", "Nombre de places", "Places", "Places souhaitées"]));
      if (!places) return;
      const ids = String(rawId).split(/[;\n]+/).map(x => x.trim()).filter(Boolean);
      if (!ids.length) return;
      const detail = {
        name: get(row, ["Nom et prénom", "Nom", "Nom prenom"]),
        email: get(row, ["Adresse email", "Email", "Adresse e-mail"]),
        phone: get(row, ["Téléphone", "Telephone"]),
        places,
        status
      };
      ids.forEach(id => {
        if (!map[id]) map[id] = { confirmed: 0, pending: 0, total: 0, details: [] };
        if (status === "confirmed") map[id].confirmed += places;
        else map[id].pending += places;
        map[id].total += places;
        map[id].details.push(detail);
      });
    });
    return map;
  }

  function withPublicReservationDefaults(slot) {
    let technicalId = "";
    try { technicalId = slotTechnicalId(slot); }
    catch (err) { technicalId = "public-" + (slot && slot.id ? slot.id : Math.random().toString(36).slice(2)); }
    const capacity = Number(slot && slot.capacity ? slot.capacity : 0);
    return Object.assign({}, slot, {
      reservationId: technicalId,
      publicConfirmed: Number(slot && slot.publicConfirmed ? slot.publicConfirmed : 0),
      publicPending: Number(slot && slot.publicPending ? slot.publicPending : 0),
      publicReserved: Number(slot && slot.publicReserved ? slot.publicReserved : 0),
      publicRemaining: Number(slot && slot.publicRemaining !== undefined ? slot.publicRemaining : capacity),
      publicReservationDetails: slot && slot.publicReservationDetails ? slot.publicReservationDetails : [],
      publicFull: Boolean(slot && slot.publicFull)
    });
  }

  function applyPublicReservations(slots, reservations) {
    return slots.map(slot => {
      try {
        const technicalId = slotTechnicalId(slot);
        const r = reservations[technicalId] || { confirmed: 0, pending: 0, total: 0, details: [] };
        const occupied = Number(r.total || 0);
        const remaining = Math.max(0, Number(slot.capacity || 0) - occupied);
        return Object.assign({}, slot, {
          reservationId: technicalId,
          publicConfirmed: Number(r.confirmed || 0),
          publicPending: Number(r.pending || 0),
          publicReserved: occupied,
          publicRemaining: remaining,
          publicReservationDetails: r.details || [],
          publicFull: remaining <= 0
        });
      } catch (err) {
        return withPublicReservationDefaults(slot);
      }
    });
  }

  function slotReservationId(slot) {
    try { return slot.reservationId || slotTechnicalId(slot); }
    catch (err) { return slot && slot.id ? slot.id : ""; }
  }

  function publicFormUrl(items) {
    const params = [];
    function add(key, value) {
      if (!key) return;
      params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value || ""));
    }
    const slots = (Array.isArray(items) ? items : [items]).filter(Boolean);
    add(PUBLIC_FORM_ENTRIES.places, String(publicCartPlaces || 1));
    add(PUBLIC_FORM_ENTRIES.evenement, slots.map(s => s.title || "").join(" ; "));
    add(PUBLIC_FORM_ENTRIES.date, slots.map(s => formatDate(s.dateIso)).join(" ; "));
    add(PUBLIC_FORM_ENTRIES.horaire, slots.map(s => showTime(s.start) + (s.end ? "-" + showTime(s.end) : "")).join(" ; "));
    add(PUBLIC_FORM_ENTRIES.lieu, slots.map(s => s.roomLabel || "").join(" ; "));
    add(PUBLIC_FORM_ENTRIES.idCreneau, slots.map(slotReservationId).filter(Boolean).join(";"));
    add(PUBLIC_FORM_ENTRIES.statut, "À confirmer");
    return PUBLIC_FORM_URL + "?usp=pp_url&" + params.join("&");
  }

  function isInCart(slot) {
    const id = slotReservationId(slot);
    return Boolean(id && publicCart.find(item => item.id === id));
  }

  function remainingForDisplay(slot) {
    const remaining = Number(slot.publicRemaining ?? slot.capacity ?? 0);
    return Math.max(0, remaining - (isInCart(slot) ? publicCartPlaces : 0));
  }

  function reservationLabel(slot) {
    if (slot.publicFull) return "Complet";
    const remaining = remainingForDisplay(slot);
    return remaining + " place" + (remaining > 1 ? "s" : "") + " restante" + (remaining > 1 ? "s" : "") + (isInCart(slot) ? " après votre panier" : "");
  }

  function shouldAuto(row) {
    const txt = norm(get(row, ["Programmation automatique sur plusieurs créneaux ?"]));
    return txt.includes("oui") || txt.includes("repeter") || txt.includes("répéter") || txt.includes("automatique");
  }

  function buildSlots(rows) {
    const slots = [];
    rows.filter(isAccepted).forEach(row => {
      if (shouldAuto(row)) {
        AUTO_DAYS.forEach(day => AUTO_SLOTS.forEach((pair, i) => {
          slots.push(makeSlot(row, day, pair[0], pair[1], "Créneau récurrent", day.replace(/-/g, "") + "-" + i));
        }));
      } else {
        slots.push(makeSlot(row, null, null, null, "", "base"));
      }
    });
    const seen = new Set();
    return slots.filter(s => {
      if (!s.dateIso) return false;
      const key = norm([s.title, s.dateIso, s.start, s.end, s.roomLabel, s.name].join("|"));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort(compareSlots);
  }

  function overlapsWindow(slot, a, b) {
    const s = minutes(slot.start), e = minutes(slot.end);
    if (s === null || e === null) return false;
    return s < b && a < e;
  }

  function isPublicVisible(slot) {
    if (!SCHOOL_BLOCK_DAYS.includes(slot.dateIso)) return true;
    return !(overlapsWindow(slot, 8 * 60, 12 * 60) || overlapsWindow(slot, 14 * 60, 17 * 60));
  }

  function isHighlight(slot) {
    if (slot.roomKey === "auditorium") return true;
    return LARGE_ROOM_KEYS.includes(slot.roomKey) && Number(slot.realCapacity || 0) >= 35;
  }

  function highlightProgramKey(slot) {
    return norm([slot.title, slot.roomKey, slot.roomLabel, slot.type, slot.discipline].join("|"));
  }

  function uniqueHighlights(slots) {
    const seen = new Set();
    return slots.filter(isHighlight).filter(slot => {
      const key = highlightProgramKey(slot);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function compareSlots(a, b) {
    return (a.dateIso || "").localeCompare(b.dateIso || "") || (minutes(a.start) ?? 9999) - (minutes(b.start) ?? 9999) || a.title.localeCompare(b.title);
  }

  function formatDate(iso) {
    const d = DAYS.find(x => x.iso === iso);
    return d ? d.label : (iso || "Date à préciser");
  }

  function baseFiltered() {
    return allSlots.filter(isPublicVisible).filter(slot => {
      if (activeDay !== "all" && slot.dateIso !== activeDay) return false;
      if (activePole !== "all" && norm(slot.pole) !== activePole) return false;
      if (activeFocus === "tempsforts" && !isHighlight(slot)) return false;
      if (activeFocus === "auditorium" && slot.roomKey !== "auditorium") return false;
      if (searchTerm && !slot.search.includes(norm(searchTerm))) return false;
      return true;
    });
  }

  function renderControls() {
    $("jpo-public-day").innerHTML = '<option value="all">Toute la semaine</option>' + DAYS.map(d => '<option value="' + esc(d.iso) + '">' + esc(d.label) + '</option>').join("");
    const poles = Array.from(new Set(allSlots.filter(isPublicVisible).map(s => s.pole).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    $("jpo-public-pole").innerHTML = '<option value="all">Tous les pôles</option>' + poles.map(p => '<option value="' + esc(norm(p)) + '">' + esc(p) + '</option>').join("");
  }

  function renderStats(slots) {
    const highlights = uniqueHighlights(slots).length;
    const aud = slots.filter(s => s.roomKey === "auditorium").length;
    const publicTaken = slots.reduce((sum, s) => sum + Number(s.publicReserved || 0), 0);
    $("jpo-public-stats").innerHTML = [
      [slots.length, "rendez-vous affichés"],
      [highlights, "temps forts"],
      [aud, "à l’auditorium"],
      [publicTaken, "places réservées public"]
    ].map(s => '<div class="stat"><div class="num">' + s[0] + '</div><div class="lab">' + esc(s[1]) + '</div></div>').join("");
  }

  function renderFocus(slots) {
    const highlights = uniqueHighlights(slots).slice(0, 6);
    if (!highlights.length) { $("jpo-public-focus-section").innerHTML = ""; return; }
    $("jpo-public-focus-section").innerHTML = '<div class="focus-head"><div><div class="focus-title">Temps forts de la semaine</div><div class="focus-sub">Une sélection de grands rendez-vous, affichée une seule fois par programmation pour éviter les doublons lorsqu’un même format est proposé à plusieurs horaires.</div></div><div class="badge">' + highlights.length + ' sélection</div></div><div class="focus-body"><div class="cards">' + highlights.map(renderCard).join("") + '</div></div>';
  }

  function renderCard(slot) {
    const strong = isHighlight(slot) ? " strong" : "";
    const reserveAction = slot.publicFull
      ? '<span class="btn2" aria-label="Complet">Complet</span>'
      : (isInCart(slot) ? '<span class="btn2">Déjà au panier</span>' : '<button type="button" class="btn2" data-add-cart="' + esc(slot.id) + '">Ajouter au panier</button>');
    return '<article class="card' + strong + '"><div class="top"><div class="tagline">' +
      (isHighlight(slot) ? '<span class="chip gold">Temps fort</span>' : '') +
      '<span class="chip blue">' + esc(formatDate(slot.dateIso)) + '</span><span class="chip">' + esc(showTime(slot.start)) + '</span><span class="chip green">Entrée libre</span></div>' +
      '<div class="title">' + esc(slot.title) + '</div>' +
      (slot.description ? '<div class="desc">' + esc(slot.description) + '</div>' : '') +
      '</div><div class="body">' +
      '<strong>' + esc(slot.roomLabel) + '</strong><br>' + esc(slot.type || slot.discipline || "Proposition") + '<br>' +
      '<div style="margin-top:8px;color:#166534;font-weight:900">' + esc(reservationLabel(slot)) + '</div>' +
      '<div class="actions"><button type="button" class="btn" data-slot-id="' + esc(slot.id) + '">Voir le détail</button>' + reserveAction + '</div>' +
      '</div></article>';
  }

  function renderDays(slots) {
    if (!slots.length) { $("jpo-public-output").innerHTML = '<div class="empty">Aucun rendez-vous à afficher avec ces filtres.</div>'; return; }
    const days = (activeDay === "all" ? DAYS : DAYS.filter(d => d.iso === activeDay));
    $("jpo-public-output").innerHTML = days.map(day => {
      const daySlots = slots.filter(s => s.dateIso === day.iso);
      if (!daySlots.length) return "";
      const byTime = {};
      daySlots.forEach(s => { const t = showTime(s.start); (byTime[t] ||= []).push(s); });
      return '<section class="day"><div class="dayhead"><div><div class="daytitle">' + esc(day.label) + '</div><div class="daymeta">Rendez-vous accessibles au public, avec réservation gratuite lorsque le bouton est proposé.</div></div><div class="badge">' + daySlots.length + ' rendez-vous</div></div><div class="daybody">' +
        Object.keys(byTime).sort((a, b) => (minutes(a) ?? 9999) - (minutes(b) ?? 9999)).map(t => '<div class="timegroup"><div class="timehead"><div class="time">' + esc(t) + '</div><div class="badge">' + byTime[t].length + '</div></div><div class="cards">' + byTime[t].map(renderCard).join("") + '</div></div>').join("") +
        '</div></section>';
    }).join("") || '<div class="empty">Aucun rendez-vous à afficher avec ces filtres.</div>';
  }

  function render() {
    const slots = baseFiltered();
    renderStats(slots);
    renderFocus(slots);
    renderDays(slots);
  }

  function rowHtml(label, value) {
    return '<div class="row"><span class="label">' + esc(label) + '</span><span>' + esc(value || "—") + '</span></div>';
  }

  function openSlot(id) {
    const s = allSlots.find(x => x.id === id);
    if (!s) return;
    $("jpo-public-modal-title").textContent = s.title;
    $("jpo-public-modal-body").innerHTML =
      rowHtml("Date / horaire", formatDate(s.dateIso) + " — " + showTime(s.start) + (s.end ? " à " + showTime(s.end) : "")) +
      rowHtml("Lieu", s.roomLabel) +
      rowHtml("Accès", s.publicFull ? "Complet" : "Entrée libre et gratuite, réservation conseillée dans la limite des places disponibles.") +
      rowHtml("Réservations public", "Réservées : " + (s.publicReserved || 0) + " · Restantes : " + (s.publicRemaining ?? s.capacity)) +
      rowHtml("ID créneau", s.reservationId || slotTechnicalId(s)) +
      rowHtml("Type", s.type) +
      rowHtml("Discipline / pôle", s.pole || s.discipline) +
      rowHtml("Public", s.publicTarget) +
      rowHtml("Description", s.description) +
      rowHtml("Intervenant(s)", s.name) +
      rowHtml("Besoins techniques", s.tech) +
      (s.publicFull ? rowHtml("Réservation", "Créneau complet") : '<div class="actions" style="margin-top:16px"><button type="button" class="btn" data-add-cart="' + esc(s.id) + '">' + (isInCart(s) ? 'Déjà dans le panier' : 'Ajouter ce créneau au panier') + '</button></div>');
    $("jpo-public-modal").classList.add("open");
  }

  function cartSlots() {
    const byId = {};
    allSlots.forEach(slot => { byId[slotReservationId(slot)] = slot; });
    return publicCart.map(item => byId[item.id]).filter(Boolean);
  }

  function maxPlacesForCart() {
    const slots = cartSlots();
    if (!slots.length) return 6;
    let max = 6;
    slots.forEach(slot => { max = Math.min(max, Number(slot.publicRemaining ?? slot.capacity ?? 0) || 1); });
    return Math.max(1, max);
  }

  function normalizeCartPlaces() {
    publicCartPlaces = Math.max(1, Math.min(6, parseInt(publicCartPlaces || "1", 10) || 1));
    if (publicCart.length) publicCartPlaces = Math.min(publicCartPlaces, maxPlacesForCart());
  }

  function addToCart(slotId) {
    const slot = allSlots.find(s => s.id === slotId || slotReservationId(s) === slotId);
    if (!slot || slot.publicFull || isInCart(slot)) return;
    publicCart.push({ id: slotReservationId(slot) });
    normalizeCartPlaces();
    renderCartBar();
    render();
  }

  function removeFromCart(id) {
    publicCart = publicCart.filter(item => item.id !== id);
    normalizeCartPlaces();
    renderCartBar();
    renderCartModal();
    render();
  }

  function clearCart() {
    publicCart = [];
    renderCartBar();
    renderCartModal();
    render();
  }

  function submitCart() {
    const slots = cartSlots();
    if (!slots.length) return;
    normalizeCartPlaces();
    const invalid = slots.find(slot => Number(slot.publicRemaining ?? slot.capacity ?? 0) < publicCartPlaces);
    if (invalid) { alert("Le nombre de places demandé dépasse les places restantes pour un rendez-vous du panier."); openCartModal(); return; }
    window.open(publicFormUrl(slots), "_blank", "noopener");
  }

  function renderCartBar() {
    const bar = $("jpo-public-cartbar");
    const meta = $("jpo-public-cartmeta");
    if (!bar) return;
    bar.classList.toggle("open", publicCart.length > 0);
    if (meta) meta.textContent = publicCart.length ? publicCart.length + " rendez-vous sélectionné(s) · " + publicCartPlaces + " place(s) par rendez-vous" : "";
  }

  function renderCartModal() {
    const body = $("jpo-public-cart-body");
    if (!body) return;
    const slots = cartSlots();
    if (!slots.length) { body.innerHTML = '<div class="empty">Votre panier est vide.</div>'; return; }
    normalizeCartPlaces();
    const max = maxPlacesForCart();
    const options = Array.from({length:max}, (_,i)=>i+1).map(n => '<option value="' + n + '">' + n + ' place' + (n>1?'s':'') + '</option>').join("");
    body.innerHTML = '<div class="cartitem" style="display:block"><b>Nombre de places souhaitées pour chaque rendez-vous</b><select id="jpo-public-cart-places" style="margin-top:8px;max-width:180px">' + options + '</select><span>Ce nombre sera appliqué à tous les rendez-vous du panier.</span></div>' +
      slots.map(slot => '<div class="cartitem"><div><b>' + esc(slot.title) + '</b><span>' + esc(formatDate(slot.dateIso)) + ' · ' + esc(showTime(slot.start)) + (slot.end ? '-' + esc(showTime(slot.end)) : '') + ' · ' + esc(slot.roomLabel) + '<br>' + esc(reservationLabel(slot)) + '</span></div><button type="button" class="btn2" data-remove-cart="' + esc(slotReservationId(slot)) + '">Retirer</button></div>').join("") +
      '<div class="actions" style="margin-top:14px"><button type="button" class="btn" id="jpo-public-cart-submit-inside">Finaliser la réservation</button><button type="button" class="btn2" id="jpo-public-cart-clear">Vider le panier</button></div>';
    const select = $("jpo-public-cart-places");
    if (select) { select.value = String(publicCartPlaces); select.addEventListener("change", function(){ publicCartPlaces = parseInt(select.value || "1",10) || 1; normalizeCartPlaces(); renderCartBar(); renderCartModal(); render(); }); }
    const submit = $("jpo-public-cart-submit-inside");
    if (submit) submit.addEventListener("click", submitCart);
    const clear = $("jpo-public-cart-clear");
    if (clear) clear.addEventListener("click", clearCart);
  }

  function openCartModal() {
    renderCartModal();
    const modal = $("jpo-public-cart-modal");
    if (modal) modal.classList.add("open");
  }

  function bind() {
    ["jpo-public-search", "jpo-public-day", "jpo-public-pole", "jpo-public-focus"].forEach(id => {
      $(id).addEventListener(id === "jpo-public-search" ? "input" : "change", function () {
        searchTerm = $("jpo-public-search").value;
        activeDay = $("jpo-public-day").value;
        activePole = $("jpo-public-pole").value;
        activeFocus = $("jpo-public-focus").value;
        render();
      });
    });
    const openCart = $("jpo-public-open-cart");
    if (openCart) openCart.addEventListener("click", openCartModal);
    const submitCartBtn = $("jpo-public-submit-cart");
    if (submitCartBtn) submitCartBtn.addEventListener("click", submitCart);
    document.addEventListener("click", function (e) {
      const add = e.target.closest("[data-add-cart]");
      if (add && root.contains(add)) { addToCart(add.getAttribute("data-add-cart")); const modal = $("jpo-public-modal"); if (modal) modal.classList.remove("open"); return; }
      const rem = e.target.closest("[data-remove-cart]");
      if (rem && root.contains(rem)) { removeFromCart(rem.getAttribute("data-remove-cart")); return; }
      const d = e.target.closest("[data-slot-id]");
      if (d && root.contains(d)) openSlot(d.getAttribute("data-slot-id"));
      if (e.target.closest("[data-close-modal]") && $("jpo-public-modal")) $("jpo-public-modal").classList.remove("open");
      if (e.target.closest("[data-close-cart]") && $("jpo-public-cart-modal")) $("jpo-public-cart-modal").classList.remove("open");
    });
    $("jpo-public-modal").addEventListener("click", e => { if (e.target === $("jpo-public-modal")) $("jpo-public-modal").classList.remove("open"); });
    $("jpo-public-cart-modal").addEventListener("click", e => { if (e.target === $("jpo-public-cart-modal")) $("jpo-public-cart-modal").classList.remove("open"); });
    renderCartBar();
  }

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(r => { if (!r.ok) throw new Error("CSV propositions HTTP " + r.status); return r.text(); }),
    fetch(PUBLIC_RESERVATIONS_CSV).then(r => { if (!r.ok) throw new Error("CSV réservations public HTTP " + r.status); return r.text(); }).catch(() => "")
  ])
    .then(([propText, publicText]) => {
      const propositionSlots = buildSlots(parseCSV(propText));
      try {
        publicReservationsMap = buildPublicReservations(parseCSV(publicText || ""));
        allSlots = applyPublicReservations(propositionSlots, publicReservationsMap);
      } catch (err) {
        console.error("Erreur réservations public JPO", err);
        allSlots = propositionSlots.map(withPublicReservationDefaults);
        $("jpo-public-error").textContent = "Information : les réservations public n’ont pas pu être lues correctement. Le programme reste affiché et les boutons de réservation restent disponibles.";
      }
      renderControls();
      bind();
      render();
    })
    .catch(err => { $("jpo-public-error").textContent = "Erreur lors du chargement : " + err.message; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJpoPublic);
  } else {
    initJpoPublic();
  }
})();
