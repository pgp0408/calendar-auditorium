document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jps-ecoles");
  if (!root) {
    root = document.createElement("div");
    root.id = "jps-ecoles";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";
  const DEMANDES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSft8sOo5NyYM601oxbWL8yxUpNus4fpw-u4-WJN8Al-tzajIA/viewform";
  const ENTRY_DETAIL = "entry.644632031";
  const ENTRY_IDS = "entry.820169616";
  const STORAGE_KEY = "jps_ecoles_v13_panier";

  const DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15/06" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16/06" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17/06" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18/06" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19/06" }
  ];

  const AUTO_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
  const AUTO_SLOTS = [["09:00", "10:00"], ["10:00", "11:00"], ["11:00", "12:00"], ["14:00", "15:00"], ["15:00", "16:00"], ["16:00", "17:00"]];

  const ROOM_DEFAULTS = {
    auditorium: { label: "Auditorium", short: "Aud.", capacity: 200, pole: "Auditorium / présentations" },
    orchestre: { label: "Salle d’orchestre", short: "Orch.", capacity: 40, pole: "Orchestre / instruments" },
    chant: { label: "Salle de chant", short: "Chant", capacity: 40, pole: "Voix / chant / chœur" },
    choeur: { label: "Salle de chœur", short: "Chœur", capacity: 40, pole: "Voix / chant / chœur" },
    theatre: { label: "Salle de théâtre", short: "Théâtre", capacity: 40, pole: "Théâtre" },
    danse1: { label: "Studio de danse 1", short: "Danse 1", capacity: 40, pole: "Danse" },
    danse2: { label: "Studio de danse 2", short: "Danse 2", capacity: 40, pole: "Danse" },
    danse3: { label: "Studio de danse 3", short: "Danse 3", capacity: 40, pole: "Danse" },
    other: { label: "Autre espace / salle précisée", short: "Autre", capacity: 40, pole: "Autre salle / petit groupe" },
    any: { label: "À arbitrer", short: "À arbitrer", capacity: 40, pole: "À arbitrer" }
  };

  let allSlots = [];
  let activeDay = "all";
  let cart = loadCart();
  let currentSlot = null;

  root.innerHTML = `
    <style>
      #jps-ecoles{font-family:Arial,sans-serif;color:#111827;width:100%}#jps-ecoles *{box-sizing:border-box}
      #jps-ecoles .wrap{max-width:1200px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
      #jps-ecoles .head{padding:32px;background:radial-gradient(circle at top right,rgba(37,99,235,.15),transparent 32%),radial-gradient(circle at top left,rgba(22,163,74,.13),transparent 30%),#fff;border-bottom:1px solid #e5e7eb}#jps-ecoles h2{margin:0;font-size:clamp(28px,4vw,44px);line-height:1.05;letter-spacing:-.04em}#jps-ecoles .sub{margin:12px 0 0;color:#64748b;font-size:16px;line-height:1.55;max-width:920px}#jps-ecoles .notice{margin-top:18px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:700}
      #jps-ecoles .content{padding:24px}#jps-ecoles .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:24px}#jps-ecoles .stat{border:1px solid #e5e7eb;border-radius:18px;padding:16px;background:#fff}#jps-ecoles .num{font-size:30px;font-weight:900;line-height:1}#jps-ecoles .lab{margin-top:6px;color:#64748b;font-size:13px;font-weight:800;line-height:1.35}
      #jps-ecoles .filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}#jps-ecoles .filter{border:1px solid #d1d5db;background:#fff;border-radius:999px;padding:10px 14px;font-size:14px;font-weight:900;cursor:pointer}#jps-ecoles .filter.active{background:#111827;color:#fff;border-color:#111827}
      #jps-ecoles .day{margin-bottom:28px;border:1px solid #e7eaee;border-radius:22px;overflow:hidden;background:#fff}#jps-ecoles .dayhead{display:flex;justify-content:space-between;gap:12px;padding:18px;background:#f8fafc;border-bottom:1px solid #e5e7eb}#jps-ecoles .daytitle{font-size:22px;font-weight:900;text-transform:uppercase}#jps-ecoles .daymeta{margin-top:4px;color:#64748b;font-size:14px;font-weight:800}#jps-ecoles .badge{border-radius:999px;background:#e2e8f0;color:#334155;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}#jps-ecoles .daybody{padding:16px}
      #jps-ecoles .sectiontitle{margin:0 0 12px;font-size:18px;font-weight:900}#jps-ecoles .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-bottom:18px}
      #jps-ecoles .timegroup{margin-bottom:20px;border:1px solid #e7eaee;border-radius:22px;overflow:hidden;background:#fff}
      #jps-ecoles .timegroup-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 16px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
      #jps-ecoles .timegroup-title{font-size:21px;font-weight:900;letter-spacing:-.02em}
      #jps-ecoles .timegroup-sub{font-size:13px;font-weight:800;color:#64748b;margin-top:3px}
      #jps-ecoles .timegroup-count{border-radius:999px;background:#e2e8f0;color:#334155;padding:6px 10px;font-size:12px;font-weight:900;white-space:nowrap}
      #jps-ecoles .timegroup-body{padding:14px}
      #jps-ecoles .choice-hint{margin:0 0 16px;color:#64748b;font-weight:800;line-height:1.45}
      #jps-ecoles .card{border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;background:#fff}#jps-ecoles .top{padding:15px;background:#fbfcfd;border-bottom:1px solid #edf0f3}#jps-ecoles .title{font-size:18px;line-height:1.25;font-weight:900}#jps-ecoles .meta{margin-top:7px;font-size:13px;font-weight:800;line-height:1.4;color:#475569}#jps-ecoles .body{padding:14px}
      #jps-ecoles .slotgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}#jps-ecoles .slot{border:1px solid #dbe3ec;background:#f0fdf4;border-radius:14px;padding:10px;color:#111827;display:block;font-weight:900;line-height:1.25;cursor:pointer;text-align:left;width:100%}#jps-ecoles .slot.low{background:#fff7ed;border-color:#fed7aa}#jps-ecoles .slot.full{background:#f1f5f9;color:#64748b;pointer-events:none;opacity:.75}#jps-ecoles .slot span{display:block;margin-top:4px;font-size:11px;font-weight:900;color:#64748b}
      #jps-ecoles .capgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}#jps-ecoles .cap{border:1px solid #e5e7eb;border-radius:14px;padding:10px;background:#fff}#jps-ecoles .cap strong{display:block;font-size:18px;line-height:1}#jps-ecoles .cap span{display:block;margin-top:5px;font-size:11px;color:#64748b;font-weight:900;text-transform:uppercase}
      #jps-ecoles .status{border-radius:14px;padding:10px;font-size:13px;font-weight:900;line-height:1.35;margin-bottom:10px;background:#dcfce7;color:#166534}#jps-ecoles .status.low{background:#fff7ed;color:#9a3412}#jps-ecoles .status.full{background:#fee2e2;color:#991b1b}
      #jps-ecoles button{font-family:inherit}#jps-ecoles .btn,#jps-ecoles .btn2{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;padding:12px 14px;font-size:14px;font-weight:900;text-align:center;cursor:pointer}#jps-ecoles .btn{border:0;background:#111827;color:#fff}#jps-ecoles .btn.disabled{background:#cbd5e1;color:#475569;pointer-events:none}#jps-ecoles .btn2{border:1px solid #d1d5db;background:#fff;color:#111827}
      #jps-ecoles .empty{border:1px dashed #cbd5e1;border-radius:18px;padding:18px;background:#fbfcfd;color:#64748b;font-weight:800;line-height:1.45}#jps-ecoles .error{color:#b91c1c;font-weight:900;white-space:pre-wrap}
      #jps-ecoles .cartbar{position:sticky;bottom:14px;z-index:50;margin:22px auto 0;max-width:1200px;border:1px solid #c7d2fe;background:#eef2ff;border-radius:22px;padding:14px;box-shadow:0 18px 50px rgba(15,23,42,.12)}#jps-ecoles .cartinner{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}#jps-ecoles .carttitle{font-weight:900;font-size:16px}#jps-ecoles .cartmeta{margin-top:3px;color:#4338ca;font-size:13px;font-weight:800}
      #jps-ecoles .modal{display:none;position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:999999;padding:20px;align-items:center;justify-content:center}#jps-ecoles .modal.open{display:flex}#jps-ecoles .box{width:min(900px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}#jps-ecoles .close{position:absolute;top:12px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer}#jps-ecoles .modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900}
      #jps-ecoles .row{display:grid;grid-template-columns:180px minmax(0,1fr);gap:14px;padding:11px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}#jps-ecoles .row:last-child{border-bottom:0}#jps-ecoles .label{font-weight:900}
      #jps-ecoles .formgrid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-top:18px}#jps-ecoles .field label{display:block;font-size:12px;color:#475569;font-weight:900;margin-bottom:5px;text-transform:uppercase}#jps-ecoles .field input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:12px;font-size:15px;font-weight:800}#jps-ecoles .help{margin-top:8px;color:#64748b;font-size:13px;font-weight:800;line-height:1.4}#jps-ecoles .actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
      #jps-ecoles .cartlist{display:flex;flex-direction:column;gap:10px;margin-top:14px}#jps-ecoles .cartitem{border:1px solid #e5e7eb;border-radius:18px;padding:14px;background:#fff}#jps-ecoles .cartitemtitle{font-weight:900;line-height:1.3}#jps-ecoles .cartitemmeta{margin-top:6px;font-size:13px;color:#475569;font-weight:800;line-height:1.45}#jps-ecoles .danger{border:1px solid #fecaca;background:#fff1f2;color:#991b1b;border-radius:12px;padding:9px 11px;font-size:13px;font-weight:900;cursor:pointer}
      @media(max-width:760px){#jps-ecoles .head,#jps-ecoles .content{padding:18px}#jps-ecoles .stats{grid-template-columns:1fr 1fr}#jps-ecoles .dayhead{flex-direction:column}#jps-ecoles .grid{grid-template-columns:1fr}#jps-ecoles .capgrid{grid-template-columns:1fr 1fr}#jps-ecoles .row{grid-template-columns:1fr;gap:4px}#jps-ecoles .formgrid{grid-template-columns:1fr}#jps-ecoles .modal{padding:10px}#jps-ecoles .box{padding:20px;border-radius:20px}}
    </style>
    <div class="wrap"><div class="head"><h2>Semaine inaugurale du Conservatoire Henri Tomasi</h2><p class="sub">Accueil des établissements scolaires — composez un parcours par horaires pour une ou plusieurs classes.</p><div class="notice">Les places demandées sont immédiatement placées en attente et retirées des disponibilités. Une demande reste soumise à validation finale du Conservatoire.</div></div><div class="content"><div class="stats"><div class="stat"><div id="jps-total" class="num">0</div><div class="lab">créneaux proposés</div></div><div class="stat"><div id="jps-avail" class="num">0</div><div class="lab">créneaux disponibles</div></div><div class="stat"><div id="jps-conf" class="num">0</div><div class="lab">places confirmées</div></div><div class="stat"><div id="jps-pend" class="num">0</div><div class="lab">places en attente</div></div></div><div id="jps-filters" class="filters"></div><div id="jps-days"></div><div id="jps-error" class="error"></div></div></div>
    <div id="jps-cartbar" class="cartbar" style="display:none"><div class="cartinner"><div><div class="carttitle">Panier de demande</div><div id="jps-cartmeta" class="cartmeta"></div></div><div class="actions" style="margin-top:0"><button id="jps-open-cart" class="btn2" type="button">Voir le panier</button><button id="jps-send" class="btn" type="button">Envoyer la demande</button></div></div></div>
    <div id="jps-booking" class="modal"><div class="box"><button type="button" class="close" data-close="jps-booking">&times;</button><h3 class="modaltitle">Ajouter un créneau</h3><div class="row"><span class="label">Créneau</span><span id="jps-b-slot"></span></div><div class="row"><span class="label">Places</span><span id="jps-b-places"></span></div><div class="formgrid"><div class="field"><label>Classe / groupe</label><input id="jps-b-group" type="text" placeholder="Ex. CE2 A"></div><div class="field"><label>Élèves</label><input id="jps-b-students" type="number" min="0" step="1" placeholder="24"></div><div class="field"><label>Accompagnateurs</label><input id="jps-b-adults" type="number" min="0" step="1" placeholder="2"></div></div><div id="jps-b-help" class="help"></div><div class="actions"><button type="button" id="jps-b-add" class="btn">Ajouter au panier</button><button type="button" data-close="jps-booking" class="btn2">Annuler</button></div></div></div>
    <div id="jps-cart" class="modal"><div class="box"><button type="button" class="close" data-close="jps-cart">&times;</button><h3 class="modaltitle">Panier de demande</h3><div id="jps-cart-summary" class="help"></div><div id="jps-cart-list" class="cartlist"></div><div class="actions"><button type="button" id="jps-submit" class="btn">Envoyer la demande globale</button><button type="button" id="jps-clear" class="btn2">Vider le panier</button></div></div></div>
  `;

  function $(id) { return document.getElementById(id); }
  function norm(v) { return (v || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80); }
  function parseNumber(v) { const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function compact(t) { return String(t || "").replace(":", ""); }
  function showTime(t) { return String(t || "").replace(":", "h"); }
  function formatDate(iso) { const d = DAYS.find(x => x.iso === iso); return d ? d.label : iso; }

  function parseCSV(text) {
    const s = String(text || "").replace(/\r/g, "");
    const rows = [];
    let row = [], cur = "", q = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i], next = s[i + 1];
      if (ch === '"') { if (q && next === '"') { cur += '"'; i++; } else q = !q; }
      else if (ch === ',' && !q) { row.push(cur); cur = ""; }
      else if (ch === '\n' && !q) { row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += ch;
    }
    row.push(cur); rows.push(row);
    return rows.filter(r => r.some(c => String(c || "").trim() !== ""));
  }

  function findCol(headers, names) {
    const hs = headers.map(norm);
    for (const n of names) { const k = norm(n); const i = hs.findIndex(h => h === k); if (i !== -1) return i; }
    for (const n of names) { const k = norm(n); const i = hs.findIndex(h => h.includes(k)); if (i !== -1) return i; }
    return -1;
  }

  function parseDateFR(v) { const t = String(v || "").trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t; const p = t.split(/[\/.-]/); if (p.length !== 3) return null; let y = p[2]; if (y.length === 2) y = "20" + y; return y + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0"); }
  function fmtTime(v) { const t = String(v || "").trim(); if (/^\d{1,2}:\d{2}/.test(t)) { const p = t.split(":"); return p[0].padStart(2, "0") + ":" + p[1]; } if (/^\d{1,2}h\d{2}$/.test(t.toLowerCase())) { const p = t.toLowerCase().split("h"); return p[0].padStart(2, "0") + ":" + p[1]; } return t.slice(0, 5); }
  function minutes(t) { const p = String(t || "").split(":"); if (p.length < 2) return null; return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function timeFromMin(m) { return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
  function durationToMinutes(v) { const d = norm(v); if (d.includes("45")) return 45; if (d.includes("30")) return 30; if (d.includes("1h30") || d.includes("1 h 30")) return 90; if (d.includes("2h") || d.includes("2 h")) return 120; if (d.includes("1h") || d.includes("1 h") || d.includes("60")) return 60; return 60; }
  function blockedDuration(format, fallback) { const f = norm(format); if (f.includes("bloque 30")) return 30; if (f.includes("bloque 1h") || f.includes("bloque 1 h")) return 60; return durationToMinutes(fallback); }
  function statusInfo(v) { const s = norm(v); if (s.includes("deplacer")) return "move"; if (s.includes("refuse")) return "refused"; if (s.includes("accepte")) return "accepted"; return "pending"; }
  function accepted(v) { return statusInfo(v) === "accepted"; }

  function roomInfo(v, precision) {
    const s = norm(v), p = String(precision || "").trim();
    if (s.includes("auditorium")) return { key: "auditorium", ...ROOM_DEFAULTS.auditorium };
    if (s.includes("orchestre")) return { key: "orchestre", ...ROOM_DEFAULTS.orchestre };
    if (s.includes("chant") && !s.includes("choeur") && !s.includes("chœur")) return { key: "chant", ...ROOM_DEFAULTS.chant };
    if (s.includes("choeur") || s.includes("chœur")) return { key: "choeur", ...ROOM_DEFAULTS.choeur };
    if (s.includes("theatre") || s.includes("théâtre")) return { key: "theatre", ...ROOM_DEFAULTS.theatre };
    if (s.includes("danse 1") || s.includes("studio de danse 1")) return { key: "danse1", ...ROOM_DEFAULTS.danse1 };
    if (s.includes("danse 2") || s.includes("studio de danse 2")) return { key: "danse2", ...ROOM_DEFAULTS.danse2 };
    if (s.includes("danse 3") || s.includes("studio de danse 3")) return { key: "danse3", ...ROOM_DEFAULTS.danse3 };
    if (s.includes("danse")) return { key: "danse1", ...ROOM_DEFAULTS.danse1 };
    if (s.includes("autre") || p) return { key: "other", short: p || "Autre", label: p || ROOM_DEFAULTS.other.label, capacity: ROOM_DEFAULTS.other.capacity, pole: ROOM_DEFAULTS.other.pole };
    if (s.includes("arbitrer") || s.includes("peu importe") || s.includes("a definir") || s.includes("à définir")) return { key: "any", ...ROOM_DEFAULTS.any };
    return { key: "other", short: v || "Autre", label: v || ROOM_DEFAULTS.other.label, capacity: ROOM_DEFAULTS.other.capacity, pole: ROOM_DEFAULTS.other.pole };
  }

  function slotId(date, start, end, room, title) { return [date, compact(start), compact(end), room, slug(title)].join("|"); }
  function slotPrefix(s) { return [s.dateIso, compact(s.start), compact(s.end), s.roomKey].join("|") + "|"; }

  function buildSlots(rows) {
    const h = rows[0] || [], data = rows.slice(1), out = [];
    const C_NAME = findCol(h, ["Nom et prénom", "Nom"]), C_DISC = findCol(h, ["Discipline / département", "Discipline"]), C_TITLE = findCol(h, ["Intitulé du projet", "Intitule du projet", "Projet"]), C_TYPE = findCol(h, ["Type de proposition", "Type"]), C_PUBLIC = findCol(h, ["Public visé", "Public"]), C_DATE = findCol(h, ["Date souhaitée", "Date"]), C_TIME = findCol(h, ["Horaire de début", "Horaire", "Heure"]), C_DUR = findCol(h, ["Durée estimée", "Durée"]), C_ROOM = findCol(h, ["Lieu souhaité", "Lieu"]), C_CAP = findCol(h, ["Nombre estimé", "spectateurs", "participants"]), C_TECH = findCol(h, ["Besoins techniques"]), C_DESC = findCol(h, ["Description courte", "programmation", "communication"]), C_STATUS = findCol(h, ["STATUT", "Statut"]), C_AUTO = findCol(h, ["Programmation automatique sur plusieurs créneaux ?", "Programmation automatique"]), C_ROOM_FINAL = findCol(h, ["SALLE RETENUE CRD", "Salle retenue CRD", "Salle retenue"]), C_ROOM_PRECISION = findCol(h, ["PRÉCISION SALLE / LIEU CRD", "PRECISION SALLE / LIEU CRD", "Précision salle", "Precision salle", "Précision lieu", "Precision lieu"]), C_CAPACITY_CRD = findCol(h, ["CAPACITÉ CRD", "CAPACITE CRD", "Capacité CRD", "Capacite CRD"]), C_FORMAT_CRD = findCol(h, ["FORMAT CRD", "Format CRD"]), C_POLE_CRD = findCol(h, ["PÔLE CRD", "POLE CRD", "Pôle CRD", "Pole CRD"]);
    if (C_TITLE === -1 || C_STATUS === -1) throw new Error("Colonnes propositions introuvables : Intitulé du projet ou STATUT.");
    data.forEach((r, i) => {
      if (!accepted(r[C_STATUS])) return;
      const title = r[C_TITLE] || "Proposition sans titre";
      const finalRoom = C_ROOM_FINAL !== -1 ? r[C_ROOM_FINAL] : "";
      const precision = C_ROOM_PRECISION !== -1 ? r[C_ROOM_PRECISION] : "";
      const fallback = C_ROOM !== -1 ? r[C_ROOM] : "";
      const room = finalRoom && !norm(finalRoom).includes("arbitrer") ? roomInfo(finalRoom, precision) : roomInfo(fallback, "");
      const capCRD = C_CAPACITY_CRD !== -1 ? parseNumber(r[C_CAPACITY_CRD]) : 0;
      const capacity = capCRD || room.capacity || 40;
      const format = C_FORMAT_CRD !== -1 ? r[C_FORMAT_CRD] : "";
      const pole = (C_POLE_CRD !== -1 && r[C_POLE_CRD]) ? r[C_POLE_CRD] : room.pole;
      const duration = C_DUR !== -1 ? r[C_DUR] : "";
      const autoLabel = C_AUTO !== -1 ? r[C_AUTO] : "";
      const autoMode = norm(autoLabel);
      const common = { sourceUid: "src" + i + "_" + slug(title + room.key), title, name: C_NAME !== -1 ? r[C_NAME] : "", discipline: C_DISC !== -1 ? r[C_DISC] : "", type: C_TYPE !== -1 ? r[C_TYPE] : "", publicTarget: C_PUBLIC !== -1 ? r[C_PUBLIC] : "", description: C_DESC !== -1 ? r[C_DESC] : "", tech: C_TECH !== -1 ? r[C_TECH] : "", duration, crdFormat: format, pole, roomKey: room.key, roomLabel: room.label, roomShort: room.short, capacity, estimatedCapacity: C_CAP !== -1 ? r[C_CAP] : "", autoLabel: autoLabel || "Non" };
      if (autoMode.includes("oui")) {
        const days = AUTO_DAYS.slice();
        if (autoMode.includes("mercredi")) days.splice(2, 0, "2026-06-17");
        days.forEach(d => AUTO_SLOTS.forEach(pair => out.push({ ...common, id: slotId(d, pair[0], pair[1], room.key, title), dateIso: d, start: pair[0], end: pair[1], autoGenerated: true })));
      } else {
        const d = C_DATE !== -1 ? parseDateFR(r[C_DATE]) : null;
        if (!d || !DAYS.some(x => x.iso === d)) return;
        const st = C_TIME !== -1 ? fmtTime(r[C_TIME]) : "";
        if (!st) return;
        const end = timeFromMin(minutes(st) + blockedDuration(format, duration));
        out.push({ ...common, id: slotId(d, st, end, room.key, title), dateIso: d, start: st, end, autoGenerated: false });
      }
    });
    return out.sort((a, b) => a.dateIso !== b.dateIso ? a.dateIso.localeCompare(b.dateIso) : a.start !== b.start ? a.start.localeCompare(b.start) : a.roomLabel.localeCompare(b.roomLabel));
  }

  function buildReservations(rows) {
    const map = {};
    if (!rows.length) return map;
    const h = rows[0] || [], data = rows.slice(1);
    const C_IDS = findCol(h, ["IDs créneaux", "IDs creneaux", "IDS créneaux", "IDS creneaux"]);
    const C_VALID = findCol(h, ["VALIDATION CRD", "Validation CRD"]);
    data.forEach(row => {
      const validation = C_VALID !== -1 ? norm(row[C_VALID]) : "";
      if (validation === "non") return;
      const ids = C_IDS !== -1 && row[C_IDS] ? row[C_IDS] : (row.find(c => /2026-06-\d{2}\|\d{4}\|\d{4}\|/.test(String(c || ""))) || "");
      String(ids).split(";").map(x => x.trim()).filter(Boolean).forEach(line => {
        const p = line.split("|").map(x => x.trim());
        if (p.length < 8) return;
        const id = p.slice(0, 5).join("|");
        const total = parseNumber(p[6]) + parseNumber(p[7]);
        if (!id || !total) return;
        if (!map[id]) map[id] = { confirmed: 0, pending: 0, refused: 0 };
        if (validation === "oui") map[id].confirmed += total;
        else map[id].pending += total;
      });
    });
    window.JPS_ECOLES_DEBUG = { headers: h, rowsCount: rows.length, reservations: map };
    return map;
  }

  function applyReservations(slots, res) {
    return slots.map(s => {
      let r = res[s.id];
      if (!r) {
        r = { confirmed: 0, pending: 0, refused: 0 };
        const pref = slotPrefix(s);
        Object.keys(res).forEach(id => {
          if (id.indexOf(pref) === 0) { r.confirmed += res[id].confirmed || 0; r.pending += res[id].pending || 0; r.refused += res[id].refused || 0; }
        });
      }
      const remaining = Math.max(0, s.capacity - r.confirmed - r.pending);
      return { ...s, confirmed: r.confirmed, pending: r.pending, remaining, full: remaining <= 0 };
    });
  }

  function loadCart() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e) { return []; } }
  function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
  function cartPeople() { return cart.reduce((n, x) => n + x.students + x.adults, 0); }
  function cartFor(id) { return cart.filter(x => x.slotId === id).reduce((n, x) => n + x.students + x.adults, 0); }

  function renderFilters() {
    $("jps-filters").innerHTML = '<button class="filter active" data-day="all" type="button">Tous les jours</button>' + DAYS.map(d => '<button class="filter" data-day="' + d.iso + '" type="button">' + d.short + '</button>').join("");
    root.querySelectorAll(".filter").forEach(b => b.addEventListener("click", function () { activeDay = b.dataset.day; root.querySelectorAll(".filter").forEach(x => x.classList.remove("active")); b.classList.add("active"); render(); }));
  }

  function status(s) { if (s.full) return { cls: "full", txt: "Complet / réservé" }; if (s.remaining <= 8) return { cls: "low", txt: "Presque complet" }; return { cls: "available", txt: "Disponible" }; }
  function renderSlotButton(s) { const st = status(s), inCart = cartFor(s.id), rem = Math.max(0, s.remaining - inCart); return '<button type="button" class="slot ' + st.cls + '" data-add-slot-id="' + esc(s.id) + '">' + esc(showTime(s.start)) + '–' + esc(showTime(s.end)) + '<span>' + rem + ' restante(s) · ' + s.confirmed + ' confirmé(s) · ' + s.pending + ' en attente' + (inCart ? ' · ' + inCart + ' panier' : '') + '</span></button>'; }

  function groupRecurring(daySlots) {
    const g = {};
    daySlots.filter(s => s.autoGenerated).forEach(s => { const k = s.dateIso + "|" + s.sourceUid; if (!g[k]) g[k] = { ...s, items: [] }; g[k].items.push(s); });
    return Object.values(g);
  }

  function renderRecurring(g) {
    const items = g.items.slice().sort((a,b) => a.start.localeCompare(b.start));
    const confirmed = items.reduce((n,s) => n + s.confirmed, 0), pending = items.reduce((n,s) => n + s.pending, 0), remaining = items.reduce((n,s) => n + s.remaining, 0);
    return '<article class="card"><div class="top"><div class="title">' + esc(g.title) + '</div><div class="meta">' + esc(g.roomLabel) + ' · jauge ' + g.capacity + ' personnes par créneau<br>' + confirmed + ' confirmé(s) · ' + pending + ' en attente · ' + remaining + ' place(s) restante(s)</div></div><div class="body"><div class="slotgrid">' + items.map(renderSlotButton).join("") + '</div></div></article>';
  }

  function renderSingle(s) {
    const st = status(s), inCart = cartFor(s.id), rem = Math.max(0, s.remaining - inCart), disabled = s.full || rem <= 0;
    return '<article class="card"><div class="top"><div class="meta">' + esc(showTime(s.start)) + '–' + esc(showTime(s.end)) + '</div><div class="title">' + esc(s.title) + '</div><div class="meta">' + esc(s.roomLabel) + ' · ' + esc(s.pole || '') + '</div></div><div class="body"><div class="capgrid"><div class="cap"><strong>' + s.capacity + '</strong><span>jauge</span></div><div class="cap"><strong>' + s.confirmed + '</strong><span>confirmés</span></div><div class="cap"><strong>' + s.pending + '</strong><span>en attente</span></div><div class="cap"><strong>' + rem + '</strong><span>restants</span></div></div><div class="status ' + st.cls + '">' + st.txt + '<br>' + rem + ' place(s) encore disponible(s)</div>' + (disabled ? '<button class="btn disabled" type="button">Complet / réservé</button>' : '<button class="btn" type="button" data-add-slot-id="' + esc(s.id) + '">Ajouter au panier</button>') + '</div></article>';
  }

  function render() {
    const visible = activeDay === "all" ? allSlots : allSlots.filter(s => s.dateIso === activeDay);
    $("jps-total").textContent = visible.length;
    $("jps-avail").textContent = visible.filter(s => !s.full).length;
    $("jps-conf").textContent = visible.reduce((n,s) => n + s.confirmed, 0);
    $("jps-pend").textContent = visible.reduce((n,s) => n + s.pending, 0);

    const days = activeDay === "all" ? DAYS : DAYS.filter(d => d.iso === activeDay);
    $("jps-days").innerHTML = days.map(d => {
      const daySlots = visible.filter(s => s.dateIso === d.iso);
      const timeKeys = Array.from(new Set(daySlots.map(s => s.start + "|" + s.end))).sort();
      const timeBlocks = timeKeys.map(key => {
        const parts = key.split("|");
        const start = parts[0];
        const end = parts[1];
        const items = daySlots.filter(s => s.start === start && s.end === end).sort((a,b) => {
          if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
          if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
          return a.roomLabel.localeCompare(b.roomLabel);
        });
        const availableCount = items.filter(s => !s.full && cartFor(s.id) < s.remaining).length;
        return '<section class="timegroup"><div class="timegroup-head"><div><div class="timegroup-title">' + esc(showTime(start)) + '–' + esc(showTime(end)) + '</div><div class="timegroup-sub">Choisissez une proposition pour une classe, ou composez plusieurs parcours en parallèle.</div></div><div class="timegroup-count">' + availableCount + ' choix disponible(s)</div></div><div class="timegroup-body"><div class="grid">' + items.map(renderSingle).join("") + '</div></div></section>';
      }).join("");
      return '<section class="day"><div class="dayhead"><div><div class="daytitle">' + esc(d.label) + '</div><div class="daymeta">Lecture par horaires : à chaque créneau, choisissez parmi les propositions disponibles.</div></div><div class="badge">' + daySlots.length + ' créneau(x)</div></div><div class="daybody"><p class="choice-hint">Exemple : de 9h à 9h30 une classe peut aller à l’Auditorium, pendant qu’une autre choisit un atelier en salle. Ajoutez chaque choix au panier classe par classe.</p>' + (timeBlocks || '<div class="empty">Aucun créneau disponible pour cette journée.</div>') + '</div></section>';
    }).join("");
    bindAddButtons();
    renderCart();
  }

  function bindAddButtons() {
    // Les cartes sont recréées à chaque changement de jour et à chaque modification du panier.
    // La liaison des boutons est donc assurée une seule fois par délégation globale plus bas.
  }

  function openSlotById(slotId) {
    const s = allSlots.find(x => x.id === slotId);
    if (!s) {
      alert("Créneau introuvable. Rechargez la page puis réessayez.");
      return;
    }
    if (s.full || cartFor(s.id) >= s.remaining) {
      alert("Ce créneau est complet ou réservé.");
      return;
    }
    openBooking(s);
  }

  function openBooking(s) {
    currentSlot = s;
    $("jps-b-slot").textContent = formatDate(s.dateIso) + " — " + showTime(s.start) + "-" + showTime(s.end) + " — " + s.title + " — " + s.roomLabel;
    $("jps-b-places").textContent = Math.max(0, s.remaining - cartFor(s.id)) + " place(s) encore disponible(s), " + s.pending + " en attente, " + s.confirmed + " confirmé(s).";
    $("jps-b-group").value = ""; $("jps-b-students").value = ""; $("jps-b-adults").value = "";
    $("jps-b-help").textContent = "";
    openModal("jps-booking");
  }

  function addToCart() {
    if (!currentSlot) return;
    const group = $("jps-b-group").value.trim();
    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);
    const total = students + adults;
    if (!group) return alert("Indiquez la classe ou le groupe.");
    if (students <= 0) return alert("Indiquez le nombre d’élèves.");
    if (total + cartFor(currentSlot.id) > currentSlot.remaining) return alert("Ce créneau n’a pas assez de places disponibles pour cette classe.");
    cart.push({ uid: Date.now() + "_" + Math.random(), slotId: currentSlot.id, dateIso: currentSlot.dateIso, start: currentSlot.start, end: currentSlot.end, roomKey: currentSlot.roomKey, roomLabel: currentSlot.roomLabel, title: currentSlot.title, group, students, adults });
    saveCart(); closeModal("jps-booking"); render();
  }

  function renderCart() {
    $("jps-cartbar").style.display = cart.length ? "block" : "none";
    $("jps-cartmeta").textContent = cart.length + " créneau(x) · " + cartPeople() + " personne(s)";
    $("jps-cart-summary").textContent = cart.length ? cart.length + " créneau(x), " + cartPeople() + " personne(s) au total." : "Panier vide.";
    $("jps-cart-list").innerHTML = cart.length ? cart.map(x => '<div class="cartitem"><div class="cartitemtitle">' + esc(formatDate(x.dateIso)) + ' — ' + esc(showTime(x.start)) + '-' + esc(showTime(x.end)) + ' — ' + esc(x.title) + '</div><div class="cartitemmeta">' + esc(x.roomLabel) + '<br>Classe / groupe : ' + esc(x.group) + ' · Élèves : ' + x.students + ' · Accompagnateurs : ' + x.adults + ' · Total : ' + (x.students + x.adults) + '</div><div class="actions"><button class="danger" type="button" data-remove="' + esc(x.uid) + '">Retirer</button></div></div>').join("") : '<div class="empty">Aucun créneau sélectionné.</div>';
    root.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", function () { cart = cart.filter(x => String(x.uid) !== String(b.dataset.remove)); saveCart(); render(); }));
  }

  function submitCart() {
    if (!cart.length) return alert("Votre panier est vide.");
    const detail = cart.map((x,i) => (i+1) + ") " + formatDate(x.dateIso) + " — " + showTime(x.start) + "-" + showTime(x.end) + " — " + x.title + "\nSalle : " + x.roomLabel + "\nClasse / groupe : " + x.group + "\nÉlèves : " + x.students + "\nAccompagnateurs : " + x.adults + "\nTotal : " + (x.students + x.adults)).join("\n\n");
    const ids = cart.map(x => [x.dateIso, compact(x.start), compact(x.end), x.roomKey, slug(x.title), x.group, x.students, x.adults].join("|")).join(";\n");
    window.open(FORM_URL + "?usp=pp_url&" + ENTRY_DETAIL + "=" + encodeURIComponent(detail) + "&" + ENTRY_IDS + "=" + encodeURIComponent(ids), "_blank");
  }

  function openModal(id) { $(id).classList.add("open"); }
  function closeModal(id) { $(id).classList.remove("open"); }
  document.addEventListener("click", function(e) {
    const addBtn = e.target.closest("[data-add-slot-id]");
    if (addBtn && root.contains(addBtn)) {
      e.preventDefault();
      e.stopPropagation();
      openSlotById(addBtn.getAttribute("data-add-slot-id"));
      return;
    }

    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn && root.contains(closeBtn)) {
      e.preventDefault();
      closeModal(closeBtn.getAttribute("data-close"));
    }
  }, true);
  ["jps-booking", "jps-cart"].forEach(id => $(id).addEventListener("click", e => { if (e.target === $(id)) closeModal(id); }));
  $("jps-b-add").addEventListener("click", addToCart);
  $("jps-open-cart").addEventListener("click", () => { renderCart(); openModal("jps-cart"); });
  $("jps-send").addEventListener("click", submitCart);
  $("jps-submit").addEventListener("click", submitCart);
  $("jps-clear").addEventListener("click", () => { if (confirm("Vider le panier ?")) { cart = []; saveCart(); render(); } });

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(r => { if (!r.ok) throw new Error("Propositions HTTP " + r.status); return r.text(); }),
    fetch(DEMANDES_CSV).then(r => { if (!r.ok) throw new Error("Demandes HTTP " + r.status); return r.text(); })
  ]).then(([pText, dText]) => {
    const pRows = parseCSV(pText);
    const dRows = parseCSV(dText);
    const reservations = buildReservations(dRows);
    allSlots = applyReservations(buildSlots(pRows), reservations);
    window.JPS_ECOLES_DEBUG = { ...(window.JPS_ECOLES_DEBUG || {}), slotsCount: allSlots.length, slots: allSlots };
    renderFilters(); render();
  }).catch(err => { $("jps-error").textContent = "Erreur lors du chargement : " + err.message; });
});
