document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("jps-ecoles");
  if (!root) return;

  const PROPOSITIONS_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnEUKc0wpQrmGOXO4b_k8oOVoHhrCSzX_VbXqA1zSYWUOMWQbiy6_tzwPCALDsSY7swWLLweOOjpRM/pub?gid=1329408426&single=true&output=csv";

  const DEMANDES_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMoXOros4yAdFKFqbiYuWe1xCchfaLCwsMV28jb5DQIXb9c2dz-koYfe4_ppfZzqqZMZE9im-MjE1y/pub?gid=814488865&single=true&output=csv";

  const FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLScTRGLmtpA0t_5Hj2lS1lcup6dTPA_MhtlT7Y9-g6HQQ3UPyQ/viewform";

  const ENTRY_CRENEAU = "entry.312445972";
  const ENTRY_ID = "entry.1881826951";

  const SCHOOL_DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15/06" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16/06" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17/06" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18/06" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19/06" }
  ];

  const AUTO_BASE_DAYS = [
    "2026-06-15",
    "2026-06-16",
    "2026-06-18",
    "2026-06-19"
  ];

  const AUTO_SLOTS = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
    ["16:00", "17:00"]
  ];

  const ROOM_CAPACITY = {
    auditorium: 200,
    chant: 40,
    orchestre: 40,
    theatre: 40,
    danse: 40,
    any: 40
  };

  root.innerHTML = `
    <style>
      #jps-ecoles{
        --jps-text:#111827;
        --jps-muted:#64748b;
        --jps-border:#e5e7eb;
        --jps-soft:#f8fafc;
        --jps-green:#16a34a;
        --jps-orange:#f59e0b;
        --jps-red:#dc2626;
        --jps-blue:#2563eb;
        --jps-purple:#7c3aed;
        font-family:Arial,sans-serif;
        color:var(--jps-text);
        width:100%;
      }

      #jps-ecoles *{
        box-sizing:border-box;
      }

      #jps-ecoles .jps-public-card{
        max-width:1200px;
        margin:0 auto;
        background:#fff;
        border:1px solid var(--jps-border);
        border-radius:24px;
        overflow:hidden;
        box-shadow:0 18px 50px rgba(15,23,42,.08);
      }

      #jps-ecoles .jps-public-header{
        padding:32px;
        background:
          radial-gradient(circle at top right,rgba(37,99,235,.15),transparent 32%),
          radial-gradient(circle at top left,rgba(22,163,74,.13),transparent 30%),
          #fff;
        border-bottom:1px solid var(--jps-border);
      }

      #jps-ecoles h2{
        margin:0;
        font-size:clamp(28px,4vw,44px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #jps-ecoles .jps-sub{
        margin:12px 0 0;
        color:var(--jps-muted);
        font-size:16px;
        line-height:1.55;
        max-width:920px;
      }

      #jps-ecoles .jps-notice{
        margin-top:18px;
        border:1px solid #bfdbfe;
        background:#eff6ff;
        color:#1e3a8a;
        border-radius:18px;
        padding:14px;
        font-size:14px;
        line-height:1.45;
        font-weight:700;
      }

      #jps-ecoles .jps-content{
        padding:24px;
      }

      #jps-ecoles .jps-stats{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:12px;
        margin-bottom:24px;
      }

      #jps-ecoles .jps-stat{
        border:1px solid var(--jps-border);
        border-radius:18px;
        padding:16px;
        background:#fff;
      }

      #jps-ecoles .jps-statnum{
        font-size:30px;
        font-weight:900;
        line-height:1;
      }

      #jps-ecoles .jps-statlabel{
        margin-top:6px;
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
        line-height:1.35;
      }

      #jps-ecoles .jps-filterbar{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-bottom:24px;
      }

      #jps-ecoles .jps-filterbtn{
        border:1px solid #d1d5db;
        background:#fff;
        color:#111827;
        border-radius:999px;
        padding:10px 14px;
        font-size:14px;
        font-weight:900;
        cursor:pointer;
      }

      #jps-ecoles .jps-filterbtn.active{
        background:#111827;
        color:#fff;
        border-color:#111827;
      }

      #jps-ecoles .jps-day{
        margin-bottom:28px;
        border:1px solid #e7eaee;
        border-radius:22px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .jps-dayhead{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
        padding:18px;
        background:#f8fafc;
        border-bottom:1px solid var(--jps-border);
      }

      #jps-ecoles .jps-daytitle{
        font-size:22px;
        font-weight:900;
        letter-spacing:-.03em;
        text-transform:uppercase;
      }

      #jps-ecoles .jps-daymeta{
        margin-top:4px;
        color:var(--jps-muted);
        font-size:14px;
        font-weight:800;
      }

      #jps-ecoles .jps-daybadge{
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:7px 10px;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #jps-ecoles .jps-daycontent{
        padding:16px;
      }

      #jps-ecoles .jps-blocktitle{
        margin:0 0 12px;
        font-size:18px;
        font-weight:900;
        letter-spacing:-.02em;
      }

      #jps-ecoles .jps-recurring-list,
      #jps-ecoles .jps-single-list{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
        gap:14px;
        margin-bottom:18px;
      }

      #jps-ecoles .jps-recurring{
        border:1px solid #e5e7eb;
        border-radius:22px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .jps-recurring-top{
        padding:15px;
        background:#fbfcfd;
        border-bottom:1px solid #edf0f3;
        cursor:pointer;
      }

      #jps-ecoles .jps-recurring-title{
        font-size:18px;
        line-height:1.25;
        font-weight:900;
      }

      #jps-ecoles .jps-recurring-meta{
        margin-top:7px;
        font-size:13px;
        font-weight:800;
        line-height:1.4;
        color:#475569;
      }

      #jps-ecoles .jps-recurring-body{
        padding:14px;
      }

      #jps-ecoles .jps-slot-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(132px,1fr));
        gap:8px;
      }

      #jps-ecoles .jps-slotbtn{
        border:1px solid #dbe3ec;
        background:#fff;
        border-radius:14px;
        padding:10px;
        text-decoration:none;
        color:#111827;
        display:block;
        font-weight:900;
        line-height:1.25;
        transition:transform .15s ease, box-shadow .15s ease;
      }

      #jps-ecoles .jps-slotbtn:hover{
        transform:translateY(-1px);
        box-shadow:0 8px 18px rgba(15,23,42,.08);
      }

      #jps-ecoles .jps-slotbtn.full{
        background:#f1f5f9;
        color:#64748b;
        pointer-events:none;
        opacity:.75;
      }

      #jps-ecoles .jps-slotbtn.low{
        background:#fff7ed;
        border-color:#fed7aa;
      }

      #jps-ecoles .jps-slotbtn.available{
        background:#f0fdf4;
        border-color:#bbf7d0;
      }

      #jps-ecoles .jps-slotbtn span{
        display:block;
        margin-top:4px;
        font-size:11px;
        font-weight:900;
        color:#64748b;
      }

      #jps-ecoles .jps-single{
        border:1px solid #e5e7eb;
        border-radius:20px;
        background:#fff;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }

      #jps-ecoles .jps-single.full{
        opacity:.68;
      }

      #jps-ecoles .jps-single-top{
        padding:14px;
        border-bottom:1px solid #edf0f3;
        background:#fbfcfd;
        cursor:pointer;
      }

      #jps-ecoles .jps-single-time{
        font-size:14px;
        font-weight:900;
        color:#334155;
      }

      #jps-ecoles .jps-single-title{
        margin-top:8px;
        font-size:17px;
        font-weight:900;
        line-height:1.25;
      }

      #jps-ecoles .jps-single-room{
        margin-top:7px;
        color:#475569;
        font-size:13px;
        font-weight:800;
      }

      #jps-ecoles .jps-single-body{
        padding:14px;
        display:flex;
        flex-direction:column;
        gap:10px;
        flex:1;
      }

      #jps-ecoles .jps-capacity{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
      }

      #jps-ecoles .jps-cap{
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:10px;
        background:#fff;
      }

      #jps-ecoles .jps-cap strong{
        display:block;
        font-size:18px;
        line-height:1;
      }

      #jps-ecoles .jps-cap span{
        display:block;
        margin-top:5px;
        font-size:11px;
        color:#64748b;
        font-weight:900;
        text-transform:uppercase;
      }

      #jps-ecoles .jps-status{
        border-radius:14px;
        padding:10px;
        font-size:13px;
        font-weight:900;
        line-height:1.35;
      }

      #jps-ecoles .jps-status.available{
        background:#dcfce7;
        color:#166534;
      }

      #jps-ecoles .jps-status.low{
        background:#fff7ed;
        color:#9a3412;
      }

      #jps-ecoles .jps-status.full{
        background:#fee2e2;
        color:#991b1b;
      }

      #jps-ecoles .jps-request{
        margin-top:auto;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        text-decoration:none;
        border-radius:14px;
        padding:12px 14px;
        font-size:14px;
        font-weight:900;
        background:#111827;
        color:#fff;
        text-align:center;
      }

      #jps-ecoles .jps-request.disabled{
        background:#cbd5e1;
        color:#475569;
        pointer-events:none;
      }

      #jps-ecoles .jps-detailbtn{
        border:0;
        background:#f1f5f9;
        color:#334155;
        border-radius:14px;
        padding:11px 13px;
        font-size:13px;
        font-weight:900;
        cursor:pointer;
      }

      #jps-ecoles .jps-empty{
        border:1px dashed #cbd5e1;
        border-radius:18px;
        padding:18px;
        background:#fbfcfd;
        color:#64748b;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .jps-error{
        color:#b91c1c;
        font-weight:900;
        white-space:pre-wrap;
      }

      #jps-ecoles .jps-modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:9999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #jps-ecoles .jps-modal.open{
        display:flex;
      }

      #jps-ecoles .jps-modalbox{
        width:min(900px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #jps-ecoles .jps-close{
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #jps-ecoles .jps-modaltitle{
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.15;
        font-weight:900;
      }

      #jps-ecoles .jps-row{
        display:grid;
        grid-template-columns:180px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #jps-ecoles .jps-row:last-child{
        border-bottom:0;
      }

      #jps-ecoles .jps-label{
        font-weight:900;
      }

      #jps-ecoles .jps-modal-actions{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .jps-modal-actions .jps-request{
        margin-top:0;
      }

      @media(max-width:760px){
        #jps-ecoles .jps-public-header,
        #jps-ecoles .jps-content{
          padding:18px;
        }

        #jps-ecoles .jps-stats{
          grid-template-columns:1fr 1fr;
        }

        #jps-ecoles .jps-dayhead{
          flex-direction:column;
        }

        #jps-ecoles .jps-recurring-list,
        #jps-ecoles .jps-single-list{
          grid-template-columns:1fr;
        }

        #jps-ecoles .jps-capacity{
          grid-template-columns:1fr;
        }

        #jps-ecoles .jps-row{
          grid-template-columns:1fr;
          gap:4px;
        }

        #jps-ecoles .jps-modal{
          padding:10px;
        }

        #jps-ecoles .jps-modalbox{
          padding:20px;
          border-radius:20px;
        }
      }
    </style>

    <div class="jps-public-card">
      <div class="jps-public-header">
        <h2>Semaine inaugurale du Conservatoire Henri Tomasi</h2>
        <p class="jps-sub">
          Accueil des établissements scolaires — demandes de créneaux du lundi 15 au vendredi 19 juin 2026.
        </p>
        <div class="jps-notice">
          Les créneaux ci-dessous sont proposés dans la limite des places disponibles.
          La demande ne vaut pas confirmation définitive : une validation sera adressée par le Conservatoire.
        </div>
      </div>

      <div class="jps-content">
        <div class="jps-stats">
          <div class="jps-stat">
            <div id="jps-total-slots" class="jps-statnum">0</div>
            <div class="jps-statlabel">créneaux proposés</div>
          </div>
          <div class="jps-stat">
            <div id="jps-available-slots" class="jps-statnum">0</div>
            <div class="jps-statlabel">créneaux disponibles</div>
          </div>
          <div class="jps-stat">
            <div id="jps-confirmed-count" class="jps-statnum">0</div>
            <div class="jps-statlabel">élèves confirmés</div>
          </div>
          <div class="jps-stat">
            <div id="jps-pending-count" class="jps-statnum">0</div>
            <div class="jps-statlabel">élèves en attente</div>
          </div>
        </div>

        <div id="jps-filterbar" class="jps-filterbar"></div>
        <div id="jps-days"></div>
        <div id="jps-error" class="jps-error"></div>
      </div>
    </div>

    <div id="jps-modal" class="jps-modal">
      <div class="jps-modalbox">
        <button type="button" id="jps-close" class="jps-close">&times;</button>
        <h3 id="jps-m-title" class="jps-modaltitle"></h3>
        <div class="jps-row"><span class="jps-label">Date</span><span id="jps-m-date"></span></div>
        <div class="jps-row"><span class="jps-label">Horaire</span><span id="jps-m-time"></span></div>
        <div class="jps-row"><span class="jps-label">Lieu</span><span id="jps-m-room"></span></div>
        <div class="jps-row"><span class="jps-label">Jauge</span><span id="jps-m-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Places restantes</span><span id="jps-m-remaining"></span></div>
        <div class="jps-row"><span class="jps-label">Type</span><span id="jps-m-type"></span></div>
        <div class="jps-row"><span class="jps-label">Discipline</span><span id="jps-m-discipline"></span></div>
        <div class="jps-row"><span class="jps-label">Public visé</span><span id="jps-m-public"></span></div>
        <div class="jps-row"><span class="jps-label">Description</span><span id="jps-m-desc"></span></div>
        <div class="jps-row"><span class="jps-label">Besoins / informations</span><span id="jps-m-tech"></span></div>
        <div class="jps-row"><span class="jps-label">Mode</span><span id="jps-m-mode"></span></div>
        <div class="jps-modal-actions">
          <a id="jps-m-request" class="jps-request" target="_blank" rel="noopener">Demander ce créneau</a>
        </div>
      </div>
    </div>
  `;

  let allSlots = [];
  let activeDay = "all";

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

  function slug(s) {
    return norm(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
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
    const clean = text.replace(/\r/g, "").trim();
    if (!clean) return [];
    return clean.split("\n").map(parseCSVLine);
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

  function formatTime(v) {
    if (!v) return "Non précisée";
    const txt = v.toString().trim();

    if (/^\d{1,2}:\d{2}$/.test(txt)) {
      const p = txt.split(":");
      return String(p[0]).padStart(2, "0") + ":" + p[1];
    }

    if (/^\d{1,2}:\d{2}:\d{2}$/.test(txt)) {
      const p = txt.split(":");
      return String(p[0]).padStart(2, "0") + ":" + p[1];
    }

    if (/^\d{1,2}h\d{2}$/.test(txt.toLowerCase())) {
      const p = txt.toLowerCase().split("h");
      return String(p[0]).padStart(2, "0") + ":" + p[1];
    }

    return txt.slice(0, 5);
  }

  function timeToMinutes(time) {
    if (!time || time === "Journée entière") return null;
    const parts = time.split(":");
    if (parts.length < 2) return null;

    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);

    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function minutesToTime(total) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function durationToMinutes(duration) {
    const d = norm(duration);

    if (d.includes("45")) return 45;
    if (d.includes("30")) return 30;
    if (d.includes("1h30") || d.includes("1 h 30")) return 90;
    if (d.includes("2h") || d.includes("2 h")) return 120;
    if (d.includes("1h") || d.includes("1 h")) return 60;
    if (d.includes("demi")) return 180;

    return 60;
  }

  function formatDateLong(iso) {
    const day = SCHOOL_DAYS.find(d => d.iso === iso);
    return day ? day.label : iso;
  }

  function roomInfo(v) {
    const s = norm(v);

    if (s.includes("auditorium")) return { key: "auditorium", label: "Auditorium" };
    if (s.includes("orchestre")) return { key: "orchestre", label: "Salle d’orchestre" };
    if (s.includes("chant")) return { key: "chant", label: "Salle de chant" };
    if (s.includes("danse")) return { key: "danse", label: "Studio de danse" };
    if (s.includes("theatre") || s.includes("théâtre")) return { key: "theatre", label: "Salle de théâtre" };
    if (s.includes("peu importe") || s.includes("indifferent") || s.includes("indifférent") || s.includes("a definir") || s.includes("à définir")) {
      return { key: "any", label: "Lieu à préciser" };
    }

    return { key: "any", label: v || "Lieu à préciser" };
  }

  function isAccepted(v) {
    const s = norm(v);
    return s.includes("accepte") || s.includes("oui") || s.includes("valide") || s.includes("confirme");
  }

  function isSchoolDate(dateIso) {
    return SCHOOL_DAYS.some(d => d.iso === dateIso);
  }

  function isSchoolTime(start) {
    const m = timeToMinutes(start);
    if (m === null) return false;
    return (m >= 8 * 60 + 30 && m < 12 * 60) || (m >= 13 * 60 && m < 17 * 60);
  }

  function parseNumber(v) {
    const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function makeSlotId(dateIso, start, end, roomKey, title) {
    return [
      dateIso,
      start.replace(":", ""),
      end.replace(":", ""),
      roomKey,
      slug(title)
    ].join("|");
  }

  function makeSlotLabel(slot) {
    return [
      formatDateLong(slot.dateIso),
      slot.start + "-" + slot.end,
      slot.roomLabel,
      slot.title
    ].join(" — ");
  }

  function makeFormUrl(slot) {
    const label = makeSlotLabel(slot);
    return (
      FORM_URL +
      "?usp=pp_url&" +
      ENTRY_CRENEAU +
      "=" +
      encodeURIComponent(label) +
      "&" +
      ENTRY_ID +
      "=" +
      encodeURIComponent(slot.id)
    );
  }

  function buildSlotsFromPropositions(rows) {
    if (!rows.length) return [];

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
    const C_ROOM = findCol(headers, ["Lieu souhaité", "Lieu"]);
    const C_CAP = findCol(headers, ["Nombre estimé", "spectateurs", "participants"]);
    const C_TECH = findCol(headers, ["Besoins techniques"]);
    const C_DESC = findCol(headers, ["Description courte", "programmation", "communication"]);
    const C_STATUS = findCol(headers, ["STATUT", "Statut"]);
    const C_AUTO = findCol(headers, [
      "Programmation automatique sur plusieurs créneaux ?",
      "Programmation automatique sur plusieurs creneaux ?",
      "Programmation automatique"
    ]);

    if ([C_TITLE, C_ROOM, C_STATUS].some(i => i === -1)) {
      throw new Error("Colonnes introuvables dans le Sheet propositions : vérifie Intitulé du projet, Lieu souhaité et STATUT.");
    }

    const slots = [];

    dataRows.forEach((row, idx) => {
      const title = row[C_TITLE] || "Proposition sans titre";
      const status = row[C_STATUS] || "";

      if (!isAccepted(status)) return;

      const room = roomInfo(row[C_ROOM]);
      const duration = C_DUR !== -1 ? row[C_DUR] : "";
      const capacityFromSheet = C_CAP !== -1 ? parseNumber(row[C_CAP]) : 0;
      const capacity = capacityFromSheet || ROOM_CAPACITY[room.key] || 40;
      const autoLabel = C_AUTO !== -1 ? row[C_AUTO] : "";
      const autoMode = norm(autoLabel);
      const sourceUid = "src" + idx + "_" + slug(title + "-" + room.key);

      const common = {
        sourceUid,
        name: C_NAME !== -1 ? row[C_NAME] : "",
        discipline: C_DISC !== -1 ? row[C_DISC] : "",
        title,
        type: C_TYPE !== -1 ? row[C_TYPE] : "",
        publicTarget: C_PUBLIC !== -1 ? row[C_PUBLIC] : "",
        duration,
        roomKey: room.key,
        roomLabel: room.label,
        capacity,
        tech: C_TECH !== -1 ? row[C_TECH] : "",
        description: C_DESC !== -1 ? row[C_DESC] : "",
        autoLabel: autoLabel || "Non"
      };

      if (autoMode.includes("oui")) {
        const days = AUTO_BASE_DAYS.slice();

        if (autoMode.includes("mercredi")) {
          days.splice(2, 0, "2026-06-17");
        }

        days.forEach(dateIso => {
          AUTO_SLOTS.forEach(pair => {
            const start = pair[0];
            const end = pair[1];

            slots.push({
              ...common,
              id: makeSlotId(dateIso, start, end, room.key, title),
              dateIso,
              start,
              end,
              permanent: true,
              autoGenerated: true
            });
          });
        });

        return;
      }

      const dateIso = C_DATE !== -1 ? parseDateFR(row[C_DATE]) : null;
      if (!dateIso || !isSchoolDate(dateIso)) return;

      const start = C_TIME !== -1 ? formatTime(row[C_TIME]) : "";
      if (!start || start === "Non précisée") return;
      if (!isSchoolTime(start)) return;

      const startMin = timeToMinutes(start);
      const end = minutesToTime(startMin + durationToMinutes(duration));

      slots.push({
        ...common,
        id: makeSlotId(dateIso, start, end, room.key, title),
        dateIso,
        start,
        end,
        permanent: false,
        autoGenerated: false
      });
    });

    const seen = {};
    return slots
      .filter(slot => {
        if (seen[slot.id]) return false;
        seen[slot.id] = true;
        return true;
      })
      .sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        if (a.start !== b.start) return a.start.localeCompare(b.start);
        return a.roomLabel.localeCompare(b.roomLabel);
      });
  }

  function buildReservationMap(rows) {
    const map = {};

    if (!rows.length) return map;

    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    const C_ID = findCol(headers, ["ID créneau", "ID creneau"]);
    const C_ELEVES = findCol(headers, ["Nombre d’élèves", "Nombre d'eleves", "Nombre eleves", "élèves", "eleves"]);
    const C_VALID = findCol(headers, ["VALIDATION CRD", "Validation CRD"]);

    if (C_ID === -1 || C_ELEVES === -1 || C_VALID === -1) {
      return map;
    }

    dataRows.forEach(row => {
      const id = (row[C_ID] || "").trim();
      if (!id) return;

      const students = parseNumber(row[C_ELEVES]);
      const validation = norm(row[C_VALID]);

      if (!map[id]) {
        map[id] = {
          confirmed: 0,
          pending: 0,
          refused: 0
        };
      }

      if (validation === "oui") {
        map[id].confirmed += students;
      } else if (validation === "en attente" || validation === "") {
        map[id].pending += students;
      } else if (validation === "non") {
        map[id].refused += students;
      }
    });

    return map;
  }

  function mergeReservations(slots, reservations) {
    return slots.map(slot => {
      const r = reservations[slot.id] || { confirmed: 0, pending: 0, refused: 0 };
      const remaining = Math.max(0, slot.capacity - r.confirmed);

      return {
        ...slot,
        confirmed: r.confirmed,
        pending: r.pending,
        remaining,
        full: remaining <= 0
      };
    });
  }

  function renderFilters() {
    const bar = $("jps-filterbar");

    bar.innerHTML =
      '<button type="button" class="jps-filterbtn active" data-day="all">Tous les jours</button>' +
      SCHOOL_DAYS.map(day =>
        '<button type="button" class="jps-filterbtn" data-day="' + esc(day.iso) + '">' + esc(day.short) + '</button>'
      ).join("");

    bar.querySelectorAll(".jps-filterbtn").forEach(btn => {
      btn.addEventListener("click", function () {
        activeDay = btn.getAttribute("data-day");

        bar.querySelectorAll(".jps-filterbtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        render();
      });
    });
  }

  function renderStats(slots) {
    const total = slots.length;
    const available = slots.filter(s => !s.full).length;
    const confirmed = slots.reduce((sum, s) => sum + s.confirmed, 0);
    const pending = slots.reduce((sum, s) => sum + s.pending, 0);

    $("jps-total-slots").textContent = total;
    $("jps-available-slots").textContent = available;
    $("jps-confirmed-count").textContent = confirmed;
    $("jps-pending-count").textContent = pending;
  }

  function slotStatus(slot) {
    if (slot.full) {
      return {
        cls: "full",
        text: "Complet"
      };
    }

    if (slot.remaining <= 8) {
      return {
        cls: "low",
        text: "Presque complet"
      };
    }

    return {
      cls: "available",
      text: "Disponible"
    };
  }

  function groupedRecurringSlots(slots) {
    const groups = {};

    slots.filter(s => s.autoGenerated).forEach(slot => {
      const key = slot.dateIso + "|" + slot.sourceUid;

      if (!groups[key]) {
        groups[key] = {
          sourceUid: slot.sourceUid,
          dateIso: slot.dateIso,
          title: slot.title,
          roomLabel: slot.roomLabel,
          roomKey: slot.roomKey,
          capacity: slot.capacity,
          type: slot.type,
          discipline: slot.discipline,
          publicTarget: slot.publicTarget,
          description: slot.description,
          tech: slot.tech,
          duration: slot.duration,
          slots: []
        };
      }

      groups[key].slots.push(slot);
    });

    return Object.values(groups).sort((a, b) => {
      if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
      return a.title.localeCompare(b.title);
    });
  }

  function renderRecurringGroup(group) {
    const slots = group.slots.slice().sort((a, b) => a.start.localeCompare(b.start));
    const available = slots.filter(s => !s.full).length;

    return `
      <article class="jps-recurring">
        <div class="jps-recurring-top" data-source-uid="${esc(group.sourceUid)}" data-date="${esc(group.dateIso)}">
          <div class="jps-recurring-title">${esc(group.title)}</div>
          <div class="jps-recurring-meta">
            ${esc(group.roomLabel)} · ${esc(String(group.capacity))} élèves par créneau<br>
            ${available} créneau(x) disponible(s) sur ${slots.length}
          </div>
        </div>
        <div class="jps-recurring-body">
          <div class="jps-slot-grid">
            ${slots.map(slot => renderSlotButton(slot)).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderSlotButton(slot) {
    const status = slotStatus(slot);
    const url = makeFormUrl(slot);

    if (slot.full) {
      return `
        <a class="jps-slotbtn full" href="#">
          ${esc(slot.start)}–${esc(slot.end)}
          <span>Complet</span>
        </a>
      `;
    }

    return `
      <a class="jps-slotbtn ${status.cls}" target="_blank" rel="noopener" href="${esc(url)}">
        ${esc(slot.start)}–${esc(slot.end)}
        <span>${esc(String(slot.remaining))} place(s) restante(s)</span>
      </a>
    `;
  }

  function renderSingleSlot(slot) {
    const status = slotStatus(slot);
    const formUrl = makeFormUrl(slot);

    return `
      <article class="jps-single ${slot.full ? "full" : ""}">
        <div class="jps-single-top" data-slot-id="${esc(slot.id)}">
          <div class="jps-single-time">${esc(slot.start)}–${esc(slot.end)}</div>
          <div class="jps-single-title">${esc(slot.title)}</div>
          <div class="jps-single-room">${esc(slot.roomLabel)} · ${esc(String(slot.capacity))} places</div>
        </div>

        <div class="jps-single-body">
          <div class="jps-capacity">
            <div class="jps-cap">
              <strong>${esc(String(slot.capacity))}</strong>
              <span>jauge</span>
            </div>
            <div class="jps-cap">
              <strong>${esc(String(slot.confirmed))}</strong>
              <span>confirmés</span>
            </div>
            <div class="jps-cap">
              <strong>${esc(String(slot.remaining))}</strong>
              <span>restants</span>
            </div>
          </div>

          <div class="jps-status ${status.cls}">
            ${esc(status.text)}
            ${slot.pending ? "<br>" + esc(String(slot.pending)) + " élève(s) en attente de validation" : ""}
          </div>

          <button type="button" class="jps-detailbtn" data-slot-id="${esc(slot.id)}">Voir le détail</button>

          ${
            slot.full
              ? '<a class="jps-request disabled" href="#">Créneau complet</a>'
              : '<a class="jps-request" target="_blank" rel="noopener" href="' + esc(formUrl) + '">Demander ce créneau</a>'
          }
        </div>
      </article>
    `;
  }

  function openModalForSlot(slot) {
    const status = slotStatus(slot);
    const url = makeFormUrl(slot);

    $("jps-m-title").textContent = slot.title;
    $("jps-m-date").textContent = formatDateLong(slot.dateIso);
    $("jps-m-time").textContent = slot.start + "–" + slot.end;
    $("jps-m-room").textContent = slot.roomLabel;
    $("jps-m-capacity").textContent = slot.capacity + " places";
    $("jps-m-remaining").textContent = slot.remaining + " place(s) restante(s) — " + status.text;
    $("jps-m-type").textContent = slot.type || "—";
    $("jps-m-discipline").textContent = slot.discipline || "—";
    $("jps-m-public").textContent = slot.publicTarget || "—";
    $("jps-m-desc").textContent = slot.description || "—";
    $("jps-m-tech").textContent = slot.tech || "—";
    $("jps-m-mode").textContent = slot.autoGenerated
      ? "Proposition récurrente — créneau d’1h"
      : "Proposition ponctuelle";

    const btn = $("jps-m-request");
    btn.href = url;
    btn.textContent = slot.full ? "Créneau complet" : "Demander ce créneau";
    btn.classList.toggle("disabled", slot.full);

    $("jps-modal").classList.add("open");
  }

  function bindDetailClicks() {
    root.querySelectorAll("[data-slot-id]").forEach(el => {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        const slot = allSlots.find(s => s.id === el.getAttribute("data-slot-id"));
        if (slot) openModalForSlot(slot);
      });
    });

    root.querySelectorAll("[data-source-uid]").forEach(el => {
      el.addEventListener("click", function () {
        const sourceUid = el.getAttribute("data-source-uid");
        const dateIso = el.getAttribute("data-date");

        const slot = allSlots.find(s => s.sourceUid === sourceUid && s.dateIso === dateIso);
        if (slot) openModalForSlot(slot);
      });
    });
  }

  function render() {
    const visible = activeDay === "all"
      ? allSlots
      : allSlots.filter(slot => slot.dateIso === activeDay);

    renderStats(visible);

    const daysWrap = $("jps-days");
    daysWrap.innerHTML = "";

    const daysToRender = activeDay === "all"
      ? SCHOOL_DAYS
      : SCHOOL_DAYS.filter(day => day.iso === activeDay);

    daysToRender.forEach(day => {
      const daySlots = visible.filter(slot => slot.dateIso === day.iso);
      const recurring = groupedRecurringSlots(daySlots);
      const singles = daySlots.filter(slot => !slot.autoGenerated);

      const section = document.createElement("section");
      section.className = "jps-day";

      section.innerHTML = `
        <div class="jps-dayhead">
          <div>
            <div class="jps-daytitle">${esc(day.label)}</div>
            <div class="jps-daymeta">Choisissez une activité, puis le créneau souhaité.</div>
          </div>
          <div class="jps-daybadge">${daySlots.length} créneau(x)</div>
        </div>
        <div class="jps-daycontent">
          ${
            recurring.length
              ? '<h3 class="jps-blocktitle">Propositions récurrentes</h3><div class="jps-recurring-list">' + recurring.map(renderRecurringGroup).join("") + '</div>'
              : ""
          }
          ${
            singles.length
              ? '<h3 class="jps-blocktitle">Propositions ponctuelles</h3><div class="jps-single-list">' + singles.map(renderSingleSlot).join("") + '</div>'
              : ""
          }
          ${
            !daySlots.length
              ? '<div class="jps-empty">Aucun créneau disponible pour cette journée.</div>'
              : ""
          }
        </div>
      `;

      daysWrap.appendChild(section);
    });

    bindDetailClicks();
  }

  $("jps-close").onclick = function () {
    $("jps-modal").classList.remove("open");
  };

  $("jps-modal").onclick = function (e) {
    if (e.target === $("jps-modal")) {
      $("jps-modal").classList.remove("open");
    }
  };

  function renderFilters() {
    const bar = $("jps-filterbar");

    bar.innerHTML =
      '<button type="button" class="jps-filterbtn active" data-day="all">Tous les jours</button>' +
      SCHOOL_DAYS.map(day =>
        '<button type="button" class="jps-filterbtn" data-day="' + esc(day.iso) + '">' + esc(day.short) + '</button>'
      ).join("");

    bar.querySelectorAll(".jps-filterbtn").forEach(btn => {
      btn.addEventListener("click", function () {
        activeDay = btn.getAttribute("data-day");

        bar.querySelectorAll(".jps-filterbtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        render();
      });
    });
  }

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(r => {
      if (!r.ok) throw new Error("Erreur propositions HTTP " + r.status);
      return r.text();
    }),
    fetch(DEMANDES_CSV).then(r => {
      if (!r.ok) throw new Error("Erreur demandes HTTP " + r.status);
      return r.text();
    })
  ])
    .then(([propositionsText, demandesText]) => {
      const propositionsRows = parseCSV(propositionsText);
      const demandesRows = parseCSV(demandesText);

      const slots = buildSlotsFromPropositions(propositionsRows);
      const reservations = buildReservationMap(demandesRows);

      allSlots = mergeReservations(slots, reservations);

      renderFilters();
      render();

      if (!allSlots.length) {
        $("jps-error").textContent =
          "Aucun créneau public trouvé. Vérifie que les propositions sont bien en STATUT = Accepté et situées sur les créneaux scolaires.";
      }
    })
    .catch(err => {
      $("jps-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
