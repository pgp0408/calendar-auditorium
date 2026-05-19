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
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18/06" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19/06" }
  ];

  const ROOM_CAPACITY = {
    auditorium: 200,
    chant: 40,
    orchestre: 40,
    theatre: 40,
    danse: 40,
    any: 40
  };

  const ROOM_LABEL = {
    auditorium: "Auditorium",
    chant: "Salle de chant",
    orchestre: "Salle d’orchestre",
    theatre: "Salle de théâtre",
    danse: "Studio de danse",
    any: "Lieu à préciser"
  };

  const EXPO_CRENEAUX = [
    ["09:00", "09:45"],
    ["10:00", "10:45"],
    ["11:00", "11:45"],
    ["14:00", "14:45"],
    ["15:00", "15:45"],
    ["16:00", "16:45"]
  ];

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

      #jps-ecoles .jps-slots{
        padding:16px;
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
        gap:14px;
      }

      #jps-ecoles .jps-slot{
        border:1px solid #e5e7eb;
        border-radius:20px;
        background:#fff;
        overflow:hidden;
        display:flex;
        flex-direction:column;
        min-height:100%;
      }

      #jps-ecoles .jps-slot.full{
        opacity:.68;
      }

      #jps-ecoles .jps-slot-top{
        padding:14px;
        border-bottom:1px solid #edf0f3;
        background:#fbfcfd;
      }

      #jps-ecoles .jps-slot-time{
        font-size:14px;
        font-weight:900;
        color:#334155;
      }

      #jps-ecoles .jps-slot-title{
        margin-top:8px;
        font-size:17px;
        font-weight:900;
        line-height:1.25;
      }

      #jps-ecoles .jps-slot-room{
        margin-top:7px;
        color:#475569;
        font-size:13px;
        font-weight:800;
      }

      #jps-ecoles .jps-slot-body{
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

        #jps-ecoles .jps-slots{
          grid-template-columns:1fr;
        }

        #jps-ecoles .jps-capacity{
          grid-template-columns:1fr;
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

    return { key: "any", label: "Lieu à préciser" };
  }

  function isAccepted(v) {
    const s = norm(v);
    return s.includes("accepte") || s.includes("oui") || s.includes("valide") || s.includes("confirme");
  }

  function isAllDay(v) {
    const s = norm(v);
    return s.includes("journee entiere") || s.includes("toute la journee");
  }

  function isPermanentExpo(title, duration, roomKey) {
    const t = norm(title);
    return isAllDay(duration) && (t.includes("cuivre") || roomKey === "chant");
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

    const C_TITLE = findCol(headers, ["Intitulé du projet", "Intitule du projet", "Projet"]);
    const C_DATE = findCol(headers, ["Date souhaitée", "Date"]);
    const C_TIME = findCol(headers, ["Horaire de début", "Horaire", "Heure"]);
    const C_DUR = findCol(headers, ["Durée estimée", "Durée"]);
    const C_ROOM = findCol(headers, ["Lieu souhaité", "Lieu"]);
    const C_CAP = findCol(headers, ["Nombre estimé", "spectateurs", "participants"]);
    const C_STATUS = findCol(headers, ["STATUT", "Statut"]);

    if ([C_TITLE, C_DATE, C_ROOM, C_STATUS].some(i => i === -1)) {
      throw new Error("Colonnes introuvables dans le Sheet propositions : vérifie Intitulé du projet, Date souhaitée, Lieu souhaité et STATUT.");
    }

    const slots = [];

    dataRows.forEach(row => {
      const title = row[C_TITLE] || "Proposition sans titre";
      const dateIso = parseDateFR(row[C_DATE]);
      if (!dateIso || !isSchoolDate(dateIso)) return;

      const status = row[C_STATUS] || "";
      if (!isAccepted(status)) return;

      const room = roomInfo(row[C_ROOM]);
      const duration = C_DUR !== -1 ? row[C_DUR] : "";
      const capacityFromSheet = C_CAP !== -1 ? parseNumber(row[C_CAP]) : 0;
      const capacity = capacityFromSheet || ROOM_CAPACITY[room.key] || 40;

      const permanentExpo = isPermanentExpo(title, duration, room.key);

      if (permanentExpo) {
        EXPO_CRENEAUX.forEach(pair => {
          const start = pair[0];
          const end = pair[1];

          slots.push({
            id: makeSlotId(dateIso, start, end, room.key, title),
            dateIso,
            start,
            end,
            title,
            roomKey: room.key,
            roomLabel: room.label,
            capacity,
            permanent: true
          });
        });

        return;
      }

      const start = C_TIME !== -1 ? formatTime(row[C_TIME]) : "";
      if (!start || start === "Non précisée") return;
      if (!isSchoolTime(start)) return;

      const startMin = timeToMinutes(start);
      const end = minutesToTime(startMin + durationToMinutes(duration));

      slots.push({
        id: makeSlotId(dateIso, start, end, room.key, title),
        dateIso,
        start,
        end,
        title,
        roomKey: room.key,
        roomLabel: room.label,
        capacity,
        permanent: false
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

  function renderSlot(slot) {
    const status = slotStatus(slot);
    const formUrl = makeFormUrl(slot);

    return `
      <article class="jps-slot ${slot.full ? "full" : ""}">
        <div class="jps-slot-top">
          <div class="jps-slot-time">${esc(slot.start)}–${esc(slot.end)}</div>
          <div class="jps-slot-title">${esc(slot.title)}</div>
          <div class="jps-slot-room">${esc(slot.roomLabel)} · ${esc(String(slot.capacity))} places</div>
        </div>

        <div class="jps-slot-body">
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

          ${
            slot.full
              ? '<a class="jps-request disabled" href="#">Créneau complet</a>'
              : '<a class="jps-request" target="_blank" rel="noopener" href="' + esc(formUrl) + '">Demander ce créneau</a>'
          }
        </div>
      </article>
    `;
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

      const section = document.createElement("section");
      section.className = "jps-day";

      section.innerHTML = `
        <div class="jps-dayhead">
          <div>
            <div class="jps-daytitle">${esc(day.label)}</div>
            <div class="jps-daymeta">Créneaux scolaires proposés aux établissements</div>
          </div>
          <div class="jps-daybadge">${daySlots.length} créneau(x)</div>
        </div>
        <div class="jps-slots">
          ${
            daySlots.length
              ? daySlots.map(renderSlot).join("")
              : '<div class="jps-empty">Aucun créneau disponible pour cette journée.</div>'
          }
        </div>
      `;

      daysWrap.appendChild(section);
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
