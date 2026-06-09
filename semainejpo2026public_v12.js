(function(){
  function initJpoPublic(){
    if (window.__JPO_PUBLIC_INITIALIZED__) return;
    var existingRoot = document.getElementById("jpo-public") || document.getElementById("jpopublic") || document.getElementById("semainejpo-public");
    if (!existingRoot) { return false; }
    window.__JPO_PUBLIC_INITIALIZED__ = true;
  let root = existingRoot;

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
      #jpo-public{--text:#111827;--muted:#64748b;--border:#e5e7eb;--soft:#f8fafc;--blue:#2563eb;--green:#166534;--gold:#92400e;font-family:Arial,sans-serif;color:var(--text);width:100%}
      #jpo-public *{box-sizing:border-box}
      #jpo-public .wrap{max-width:1120px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
      #jpo-public .head{padding:30px;background:radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),radial-gradient(circle at top left,rgba(22,163,74,.10),transparent 30%),#fff;border-bottom:1px solid var(--border)}
      #jpo-public h2{margin:0;font-size:clamp(30px,4vw,44px);line-height:1.04;letter-spacing:-.045em}
      #jpo-public .sub{margin:12px 0 0;color:var(--muted);font-size:16px;line-height:1.6;max-width:940px;font-weight:750}
      #jpo-public .intro{margin-top:18px;border:1px solid #dbeafe;background:#eff6ff;color:#1e3a8a;border-radius:20px;padding:16px;font-size:14px;line-height:1.55;font-weight:800}
      #jpo-public .intro strong{color:#111827;font-weight:900}
      #jpo-public .freebox{margin-top:14px;border:1px solid #bbf7d0;background:#f0fdf4;color:#14532d;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:850}
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
      #jpo-public button{font-family:inherit}
      #jpo-public .btn{border:0;background:#111827;color:#fff;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer}
      #jpo-public .btn2{border:1px solid #cbd5e1;background:#fff;color:#111827;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer}
      #jpo-public .empty{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:18px;padding:18px;font-weight:850;line-height:1.45}
      #jpo-public .modal{display:none;position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.55);padding:20px;align-items:center;justify-content:center}
      #jpo-public .modal.open{display:flex}.box{width:min(860px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}
      #jpo-public .close{position:absolute;top:10px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer;color:#111827}
      #jpo-public .modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-.03em}
      #jpo-public .row{display:grid;grid-template-columns:170px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}.row:last-child{border-bottom:0}
      #jpo-public .label{font-weight:900;color:#111827}
      #jpo-public .error{color:#b91c1c;font-weight:900;white-space:pre-wrap}
      @media(max-width:840px){#jpo-public .toolbar,#jpo-public .stats{grid-template-columns:1fr}#jpo-public .row{grid-template-columns:1fr;gap:4px}#jpo-public .head,#jpo-public .content{padding:18px}}
    </style>
    <div class="wrap">
      <header class="head">
        <h2>Journées Portes Ouvertes du Conservatoire Henri Tomasi</h2>
        <p class="sub">Du 15 au 21 juin 2026, le Conservatoire Henri Tomasi ouvre ses portes aux familles, futurs élèves, curieux et amateurs de musique, de danse ou de théâtre.</p>
        <div class="intro"><strong>Bienvenue au Conservatoire.</strong><br>Cette page rassemble les rendez-vous accessibles au grand public : concerts, auditions, ateliers ouverts, démonstrations, rencontres avec les enseignants et temps de découverte. L’accueil du public est prévu le lundi, mardi, jeudi et vendredi <strong>à partir de 17h</strong> et jusqu’à 20h, le mercredi toute la journée, le samedi jusqu’à 16h, puis le dimanche de 16h à 20h autour de la Fête de la musique. Pour toute question ou pour être orienté vers les propositions les plus adaptées, contactez-nous : <strong>communication@crd.corsica</strong> · <strong>06.67.57.92.65</strong>.</div>
        <div class="freebox">Accès libre et gratuit, dans la limite des places disponibles. Aucune réservation n’est possible depuis cette page.</div>
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
        <section class="focus" id="jpo-public-focus-section"></section>
        <div class="days" id="jpo-public-output"></div>
      </main>
    </div>
    <div class="modal" id="jpo-public-modal"><div class="box"><button type="button" class="close" data-close-modal>&times;</button><h3 class="modaltitle" id="jpo-public-modal-title"></h3><div id="jpo-public-modal-body"></div></div></div>
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

  function isPublicVisible(slot) {
    if (!SCHOOL_BLOCK_DAYS.includes(slot.dateIso)) return true;
    return !(overlapsWindow(slot, 8 * 60, 12 * 60) || overlapsWindow(slot, 14 * 60, 17 * 60));
  }

  function isHighlight(slot) {
    if (slot.roomKey === "auditorium") return true;
    return LARGE_ROOM_KEYS.includes(slot.roomKey) && Number(slot.realCapacity || 0) >= 35;
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
    const highlights = slots.filter(isHighlight).length;
    const aud = slots.filter(s => s.roomKey === "auditorium").length;
    $("jpo-public-stats").innerHTML = [
      [slots.length, "rendez-vous affichés"],
      [highlights, "temps forts"],
      [aud, "à l’auditorium"]
    ].map(s => '<div class="stat"><div class="num">' + s[0] + '</div><div class="lab">' + esc(s[1]) + '</div></div>').join("");
  }

  function uniqueFocusHighlights(slots) {
    const seen = new Set();
    return slots.filter(isHighlight).filter(slot => {
      const key = norm([slot.title, slot.roomKey, slot.roomLabel, slot.type, slot.discipline].join("|"));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function renderFocus(slots) {
    const highlights = uniqueFocusHighlights(slots).slice(0, 6);
    if (!highlights.length) { $("jpo-public-focus-section").innerHTML = ""; return; }
    $("jpo-public-focus-section").innerHTML = '<div class="focus-head"><div><div class="focus-title">Temps forts de la semaine</div><div class="focus-sub">Une sélection de grands rendez-vous, affichée une seule fois par programmation lorsque le même format est proposé à plusieurs horaires.</div></div><div class="badge">' + highlights.length + ' sélection</div></div><div class="focus-body"><div class="cards">' + highlights.map(renderCard).join("") + '</div></div>';
  }

  function renderCard(slot) {
    const strong = isHighlight(slot) ? " strong" : "";
    return '<article class="card' + strong + '"><div class="top"><div class="tagline">' +
      (isHighlight(slot) ? '<span class="chip gold">Temps fort</span>' : '') +
      '<span class="chip blue">' + esc(formatDate(slot.dateIso)) + '</span><span class="chip">' + esc(showTime(slot.start)) + '</span><span class="chip green">Entrée libre</span></div>' +
      '<div class="title">' + esc(slot.title) + '</div>' +
      (slot.description ? '<div class="desc">' + esc(slot.description) + '</div>' : '') +
      '</div><div class="body">' +
      '<strong>' + esc(slot.roomLabel) + '</strong><br>' + esc(slot.type || slot.discipline || "Proposition") + '<br>' +
      '<div class="actions"><button type="button" class="btn" data-slot-id="' + esc(slot.id) + '">Voir le détail</button><span class="btn2" aria-label="Information">Sans réservation</span></div>' +
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
      return '<section class="day"><div class="dayhead"><div><div class="daytitle">' + esc(day.label) + '</div><div class="daymeta">Rendez-vous accessibles au public, sans réservation en ligne.</div></div><div class="badge">' + daySlots.length + ' rendez-vous</div></div><div class="daybody">' +
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
      rowHtml("Accès", "Entrée libre et gratuite, sans réservation, dans la limite des places disponibles.") +
      rowHtml("Type", s.type) +
      rowHtml("Discipline / pôle", s.pole || s.discipline) +
      rowHtml("Public", s.publicTarget) +
      rowHtml("Description", s.description) +
      rowHtml("Intervenant(s)", s.name) +
      rowHtml("Besoins techniques", s.tech);
    $("jpo-public-modal").classList.add("open");
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
    document.addEventListener("click", function (e) {
      const d = e.target.closest("[data-slot-id]");
      if (d && root.contains(d)) openSlot(d.getAttribute("data-slot-id"));
      if (e.target.closest("[data-close-modal]")) $("jpo-public-modal").classList.remove("open");
    });
    $("jpo-public-modal").addEventListener("click", e => { if (e.target === $("jpo-public-modal")) $("jpo-public-modal").classList.remove("open"); });
  }

  fetch(PROPOSITIONS_CSV)
    .then(r => { if (!r.ok) throw new Error("CSV propositions HTTP " + r.status); return r.text(); })
    .then(text => {
      allSlots = buildSlots(parseCSV(text));
      renderControls();
      bind();
      render();
    })
    .catch(err => { $("jpo-public-error").textContent = "Erreur lors du chargement : " + err.message; });

  }

  function startJpoPublic(){
    if (initJpoPublic() === false) {
      var tries = 0;
      var timer = setInterval(function(){
        tries += 1;
        if (initJpoPublic() !== false || tries > 40) clearInterval(timer);
      }, 100);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startJpoPublic);
  } else {
    startJpoPublic();
  }
})();
