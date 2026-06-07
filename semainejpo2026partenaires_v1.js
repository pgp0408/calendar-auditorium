document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jpo-partenaires") || document.getElementById("jpopartenaires") || document.getElementById("semainejpo-partenaires");
  if (!root) {
    root = document.createElement("div");
    root.id = "jpo-partenaires";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";

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
  let activeDay = "all";
  let activePole = "all";
  let activeFocus = "all";
  let searchTerm = "";

  root.innerHTML = `
    <style>
      #jpo-partenaires{--text:#111827;--muted:#64748b;--border:#e5e7eb;--soft:#f8fafc;--blue:#2563eb;--green:#166534;--gold:#92400e;font-family:Arial,sans-serif;color:var(--text);width:100%}
      #jpo-partenaires *{box-sizing:border-box}
      #jpo-partenaires .wrap{max-width:1120px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
      #jpo-partenaires .head{padding:30px;background:radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),radial-gradient(circle at top left,rgba(22,163,74,.10),transparent 30%),#fff;border-bottom:1px solid var(--border)}
      #jpo-partenaires h2{margin:0;font-size:clamp(30px,4vw,44px);line-height:1.04;letter-spacing:-.045em}
      #jpo-partenaires .sub{margin:12px 0 0;color:var(--muted);font-size:16px;line-height:1.6;max-width:940px;font-weight:750}
      #jpo-partenaires .intro{margin-top:18px;border:1px solid #dbeafe;background:#eff6ff;color:#1e3a8a;border-radius:20px;padding:16px;font-size:14px;line-height:1.55;font-weight:800}
      #jpo-partenaires .intro strong{color:#111827;font-weight:900}
      #jpo-partenaires .freebox{margin-top:14px;border:1px solid #bbf7d0;background:#f0fdf4;color:#14532d;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:850}
      #jpo-partenaires .content{padding:22px}
      #jpo-partenaires .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:16px}
      #jpo-partenaires .stat{border:1px solid var(--border);border-radius:18px;padding:14px;background:#fff}
      #jpo-partenaires .num{font-size:28px;font-weight:900;line-height:1}.lab{margin-top:5px;color:var(--muted);font-size:12px;font-weight:900;line-height:1.3}
      #jpo-partenaires .toolbar{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:10px;margin-bottom:18px;align-items:end}
      #jpo-partenaires .tool label{display:block;font-size:12px;color:#475569;font-weight:900;margin-bottom:5px;text-transform:uppercase}
      #jpo-partenaires select,#jpo-partenaires input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:11px;font-size:14px;font-weight:800;background:#fff}
      #jpo-partenaires .focus{margin:0 0 22px;border:1px solid #fde68a;background:#fffbeb;border-radius:24px;overflow:hidden}
      #jpo-partenaires .focus-head{padding:17px 18px;border-bottom:1px solid #fde68a;display:flex;justify-content:space-between;gap:10px;align-items:center;background:#fff7ed}
      #jpo-partenaires .focus-title{font-size:22px;font-weight:900;letter-spacing:-.035em;color:#78350f;text-transform:uppercase}
      #jpo-partenaires .focus-sub{margin-top:4px;color:#92400e;font-size:13px;font-weight:800;line-height:1.4}
      #jpo-partenaires .focus-body{padding:14px}
      #jpo-partenaires .days{display:grid;gap:22px}
      #jpo-partenaires .day{border:1px solid var(--border);border-radius:24px;overflow:hidden;background:#fff}
      #jpo-partenaires .dayhead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:18px;background:#f8fafc;border-bottom:1px solid var(--border)}
      #jpo-partenaires .daytitle{font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-.035em}
      #jpo-partenaires .daymeta{margin-top:4px;color:#64748b;font-size:13px;font-weight:850;line-height:1.4}
      #jpo-partenaires .badge{border-radius:999px;background:#e2e8f0;color:#334155;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}
      #jpo-partenaires .daybody{padding:14px}
      #jpo-partenaires .timegroup{margin-bottom:14px;border:1px solid #e7eaee;border-radius:20px;overflow:hidden;background:#fff}
      #jpo-partenaires .timehead{padding:13px 15px;background:#fbfcfd;border-bottom:1px solid #edf0f3;display:flex;justify-content:space-between;gap:10px;align-items:center}
      #jpo-partenaires .time{font-size:19px;font-weight:900;letter-spacing:-.02em}
      #jpo-partenaires .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;padding:12px}
      #jpo-partenaires .card{border:1px solid var(--border);border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,.04)}
      #jpo-partenaires .card.strong{border-color:#fbbf24;background:linear-gradient(180deg,#fffbeb 0,#fff 80%)}
      #jpo-partenaires .top{padding:14px;background:#fbfcfd;border-bottom:1px solid #edf0f3}
      #jpo-partenaires .tagline{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px}
      #jpo-partenaires .chip{border-radius:999px;background:#f1f5f9;color:#334155;padding:5px 8px;font-size:11px;font-weight:900}
      #jpo-partenaires .chip.gold{background:#fef3c7;color:#92400e}.chip.green{background:#dcfce7;color:#166534}.chip.blue{background:#dbeafe;color:#1e40af}
      #jpo-partenaires .title{font-size:18px;line-height:1.22;font-weight:900;letter-spacing:-.02em}
      #jpo-partenaires .desc{margin-top:9px;color:#475569;font-size:13px;line-height:1.45;font-weight:750}
      #jpo-partenaires .body{padding:14px;color:#334155;font-size:13px;line-height:1.5;font-weight:800}
      #jpo-partenaires .actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      #jpo-partenaires button{font-family:inherit}
      #jpo-partenaires .btn{border:0;background:#111827;color:#fff;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer}
      #jpo-partenaires .btn2{border:1px solid #cbd5e1;background:#fff;color:#111827;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer}
      #jpo-partenaires .empty{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:18px;padding:18px;font-weight:850;line-height:1.45}
      #jpo-partenaires .modal{display:none;position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.55);padding:20px;align-items:center;justify-content:center}
      #jpo-partenaires .modal.open{display:flex}.box{width:min(860px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}
      #jpo-partenaires .close{position:absolute;top:10px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer;color:#111827}
      #jpo-partenaires .modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-.03em}
      #jpo-partenaires .row{display:grid;grid-template-columns:170px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}.row:last-child{border-bottom:0}
      #jpo-partenaires .label{font-weight:900;color:#111827}
      #jpo-partenaires .error{color:#b91c1c;font-weight:900;white-space:pre-wrap}
      @media(max-width:840px){#jpo-partenaires .toolbar,#jpo-partenaires .stats{grid-template-columns:1fr}#jpo-partenaires .row{grid-template-columns:1fr;gap:4px}#jpo-partenaires .head,#jpo-partenaires .content{padding:18px}}
    </style>
    <div class="wrap">
      <header class="head">
        <h2>JPO 2026 — repères partenaires et institutionnels</h2>
        <p class="sub">Une lecture sélective de la Semaine Portes Ouvertes pour identifier les meilleurs moments de présence institutionnelle, de visite partenaire ou de venue d’élus.</p>
        <div class="intro"><strong>Repères partenaires.</strong><br>Cette page met en avant les rendez-vous les plus pertinents pour une venue institutionnelle : propositions à l’auditorium, grands formats, temps de forte visibilité et moments susceptibles de rassembler le plus de public au sein du Conservatoire.</div>
        <div class="freebox">Outil d’aide au repérage : cette page ne permet pas de réserver. Elle sert à choisir les créneaux les plus intéressants pour organiser une venue, une rencontre ou une présence officielle.</div>
      </header>
      <main class="content">
        <div id="jpo-partenaires-error" class="error"></div>
        <div class="stats" id="jpo-partenaires-stats"></div>
        <div class="toolbar">
          <div class="tool"><label>Recherche</label><input id="jpo-partenaires-search" type="search" placeholder="Chercher un événement, un lieu, une discipline..."></div>
          <div class="tool"><label>Jour</label><select id="jpo-partenaires-day"></select></div>
          <div class="tool"><label>Type / pôle</label><select id="jpo-partenaires-pole"></select></div>
          <div class="tool"><label>Affichage</label><select id="jpo-partenaires-focus"><option value="all">Tous les temps recommandés</option><option value="tempsforts">Présence recommandée</option><option value="auditorium">Auditorium uniquement</option></select></div>
        </div>
        <section class="focus" id="jpo-partenaires-focus-section"></section>
        <div class="days" id="jpo-partenaires-output"></div>
      </main>
    </div>
    <div class="modal" id="jpo-partenaires-modal"><div class="box"><button type="button" class="close" data-close-modal>&times;</button><h3 class="modaltitle" id="jpo-partenaires-modal-title"></h3><div id="jpo-partenaires-modal-body"></div></div></div>
  `;

  const $ = id => document.getElementById(id);

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function norm(v) {
    return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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

  function isPartnerVisible(slot) {
    return slot.roomKey === "auditorium" || Number(slot.realCapacity || slot.estimated || 0) >= 35;
  }

  function isHighlight(slot) {
    return slot.roomKey === "auditorium" || Number(slot.realCapacity || slot.estimated || 0) >= 35;
  }

  function compareSlots(a, b) {
    return (a.dateIso || "").localeCompare(b.dateIso || "") || (minutes(a.start) ?? 9999) - (minutes(b.start) ?? 9999) || a.title.localeCompare(b.title);
  }

  function formatDate(iso) {
    const d = DAYS.find(x => x.iso === iso);
    return d ? d.label : (iso || "Date à préciser");
  }

  function baseFiltered() {
    return allSlots.filter(isPartnerVisible).filter(slot => {
      if (activeDay !== "all" && slot.dateIso !== activeDay) return false;
      if (activePole !== "all" && norm(slot.pole) !== activePole) return false;
      if (activeFocus === "tempsforts" && !isHighlight(slot)) return false;
      if (activeFocus === "auditorium" && slot.roomKey !== "auditorium") return false;
      if (searchTerm && !slot.search.includes(norm(searchTerm))) return false;
      return true;
    });
  }

  function renderControls() {
    $("jpo-partenaires-day").innerHTML = '<option value="all">Toute la semaine</option>' + DAYS.map(d => '<option value="' + esc(d.iso) + '">' + esc(d.label) + '</option>').join("");
    const poles = Array.from(new Set(allSlots.filter(isPartnerVisible).map(s => s.pole).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    $("jpo-partenaires-pole").innerHTML = '<option value="all">Tous les pôles</option>' + poles.map(p => '<option value="' + esc(norm(p)) + '">' + esc(p) + '</option>').join("");
  }

  function renderStats(slots) {
    const highlights = slots.filter(isHighlight).length;
    const aud = slots.filter(s => s.roomKey === "auditorium").length;
    $("jpo-partenaires-stats").innerHTML = [
      [slots.length, "temps recommandés"],
      [highlights, "présences recommandées"],
      [aud, "à l’auditorium"]
    ].map(s => '<div class="stat"><div class="num">' + s[0] + '</div><div class="lab">' + esc(s[1]) + '</div></div>').join("");
  }

  function renderFocus(slots) {
    const highlights = slots.filter(isHighlight).slice(0, 6);
    if (!highlights.length) { $("jpo-partenaires-focus-section").innerHTML = ""; return; }
    $("jpo-partenaires-focus-section").innerHTML = '<div class="focus-head"><div><div class="focus-title">Présences recommandées</div><div class="focus-sub">Sélection automatique : auditorium, grands formats ou propositions avec capacité réelle d’au moins 35 personnes.</div></div><div class="badge">' + highlights.length + ' sélection</div></div><div class="focus-body"><div class="cards">' + highlights.map(renderCard).join("") + '</div></div>';
  }

  function partnerReason(slot) {
    if (slot.roomKey === "auditorium") return "Auditorium / forte visibilité";
    if (Number(slot.realCapacity || slot.estimated || 0) >= 35) return "Grand format / public nombreux";
    return "Temps recommandé";
  }

  function renderCard(slot) {
    const strong = isHighlight(slot) ? " strong" : "";
    return '<article class="card' + strong + '"><div class="top"><div class="tagline">' +
      (isHighlight(slot) ? '<span class="chip gold">Présence recommandée</span>' : '') +
      '<span class="chip blue">' + esc(formatDate(slot.dateIso)) + '</span><span class="chip">' + esc(showTime(slot.start)) + '</span><span class="chip green">Repère partenaire</span></div>' +
      '<div class="title">' + esc(slot.title) + '</div>' +
      (slot.description ? '<div class="desc">' + esc(slot.description) + '</div>' : '') +
      '</div><div class="body">' +
      '<strong>' + esc(slot.roomLabel) + '</strong><br>' + esc(partnerReason(slot)) + '<br>' + esc(slot.type || slot.discipline || "Proposition") + '<br>' +
      '<div class="actions"><button type="button" class="btn" data-slot-id="' + esc(slot.id) + '">Voir le détail</button><span class="btn2" aria-label="Information">Sans réservation</span></div>' +
      '</div></article>';
  }

  function renderDays(slots) {
    if (!slots.length) { $("jpo-partenaires-output").innerHTML = '<div class="empty">Aucun rendez-vous à afficher avec ces filtres.</div>'; return; }
    const days = (activeDay === "all" ? DAYS : DAYS.filter(d => d.iso === activeDay));
    $("jpo-partenaires-output").innerHTML = days.map(day => {
      const daySlots = slots.filter(s => s.dateIso === day.iso);
      if (!daySlots.length) return "";
      const byTime = {};
      daySlots.forEach(s => { const t = showTime(s.start); (byTime[t] ||= []).push(s); });
      return '<section class="day"><div class="dayhead"><div><div class="daytitle">' + esc(day.label) + '</div><div class="daymeta">Créneaux repérés comme pertinents pour une venue partenaire ou institutionnelle.</div></div><div class="badge">' + daySlots.length + ' rendez-vous</div></div><div class="daybody">' +
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
    $("jpo-partenaires-modal-title").textContent = s.title;
    $("jpo-partenaires-modal-body").innerHTML =
      rowHtml("Date / horaire", formatDate(s.dateIso) + " — " + showTime(s.start) + (s.end ? " à " + showTime(s.end) : "")) +
      rowHtml("Lieu", s.roomLabel) +
      rowHtml("Accès", "Repère partenaire et gratuite, sans réservation, dans la limite des places disponibles.") +
      rowHtml("Type", s.type) +
      rowHtml("Type / pôle", s.pole || s.discipline) +
      rowHtml("Public", s.publicTarget) +
      rowHtml("Description", s.description) +
      rowHtml("Intervenant(s)", s.name) +
      rowHtml("Besoins techniques", s.tech);
    $("jpo-partenaires-modal").classList.add("open");
  }

  function bind() {
    ["jpo-partenaires-search", "jpo-partenaires-day", "jpo-partenaires-pole", "jpo-partenaires-focus"].forEach(id => {
      $(id).addEventListener(id === "jpo-partenaires-search" ? "input" : "change", function () {
        searchTerm = $("jpo-partenaires-search").value;
        activeDay = $("jpo-partenaires-day").value;
        activePole = $("jpo-partenaires-pole").value;
        activeFocus = $("jpo-partenaires-focus").value;
        render();
      });
    });
    document.addEventListener("click", function (e) {
      const d = e.target.closest("[data-slot-id]");
      if (d && root.contains(d)) openSlot(d.getAttribute("data-slot-id"));
      if (e.target.closest("[data-close-modal]")) $("jpo-partenaires-modal").classList.remove("open");
    });
    $("jpo-partenaires-modal").addEventListener("click", e => { if (e.target === $("jpo-partenaires-modal")) $("jpo-partenaires-modal").classList.remove("open"); });
  }

  fetch(PROPOSITIONS_CSV)
    .then(r => { if (!r.ok) throw new Error("CSV propositions HTTP " + r.status); return r.text(); })
    .then(text => {
      allSlots = buildSlots(parseCSV(text));
      renderControls();
      bind();
      render();
    })
    .catch(err => { $("jpo-partenaires-error").textContent = "Erreur lors du chargement : " + err.message; });
});
