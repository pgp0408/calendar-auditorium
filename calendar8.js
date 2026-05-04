document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("auditorium-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvqtHB3cJldM-RfnS6poGMa_wwbpjFDZp6RDEgGTAaHlsqMuuuPc6GgQGPIsC1EbwlnDTdgZtXeZnP/pub?output=csv";

  root.innerHTML = `
    <style>
      #auditorium-calendar {
        --ac-text: #111827;
        --ac-muted: #6b7280;
        --ac-border: #e5e7eb;
        --ac-soft: #f8fafc;
        --ac-card: #ffffff;
        --ac-shadow: 0 18px 50px rgba(15,23,42,.08);
        --ac-radius: 22px;
        --ac-green: #16a34a;
        --ac-blue: #2563eb;
        --ac-purple: #7c3aed;
        --ac-orange: #f59e0b;
        font-family: Arial, sans-serif;
        color: var(--ac-text);
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }

      #auditorium-calendar * {
        box-sizing: border-box;
      }

      #auditorium-calendar .ac-card {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        background: var(--ac-card);
        border: 1px solid var(--ac-border);
        border-radius: var(--ac-radius);
        box-shadow: var(--ac-shadow);
        overflow: hidden;
      }

      #auditorium-calendar .ac-header {
        padding: 28px;
        background:
          radial-gradient(circle at top right, rgba(37,99,235,.12), transparent 30%),
          radial-gradient(circle at top left, rgba(22,163,74,.10), transparent 28%),
          #ffffff;
        border-bottom: 1px solid var(--ac-border);
      }

      #auditorium-calendar .ac-header-main {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 22px;
        align-items: start;
      }

      #auditorium-calendar h2 {
        margin: 0;
        font-size: clamp(24px, 3vw, 34px);
        line-height: 1.08;
        letter-spacing: -.03em;
      }

      #auditorium-calendar .ac-subtitle {
        margin: 9px 0 0;
        color: var(--ac-muted);
        font-size: 15px;
        line-height: 1.5;
        max-width: 720px;
      }

      #auditorium-calendar .ac-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-end;
      }

      #auditorium-calendar .ac-nav,
      #auditorium-calendar .ac-filterbar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      #auditorium-calendar .ac-btn,
      #auditorium-calendar .ac-filter {
        appearance: none;
        border: 1px solid #d1d5db;
        background: #ffffff;
        color: #111827;
        border-radius: 999px;
        padding: 10px 14px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 800;
        line-height: 1;
        transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
      }

      #auditorium-calendar .ac-btn:hover,
      #auditorium-calendar .ac-filter:hover {
        background: #f9fafb;
        transform: translateY(-1px);
        box-shadow: 0 8px 20px rgba(15,23,42,.08);
      }

      #auditorium-calendar .ac-filter input {
        margin-right: 6px;
        transform: translateY(1px);
      }

      #auditorium-calendar .ac-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }

      #auditorium-calendar .ac-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(229,231,235,.95);
        background: rgba(255,255,255,.86);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 700;
        color: #374151;
      }

      #auditorium-calendar .ac-dot {
        width: 11px;
        height: 11px;
        border-radius: 999px;
        display: inline-block;
      }

      #auditorium-calendar .ac-dot.auditorium { background: var(--ac-green); }
      #auditorium-calendar .ac-dot.orchestre { background: var(--ac-blue); }
      #auditorium-calendar .ac-dot.autre { background: var(--ac-purple); }
      #auditorium-calendar .ac-dot.pending { background: var(--ac-orange); }

      #auditorium-calendar .ac-content {
        padding: 24px;
      }

      #auditorium-calendar .ac-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 22px;
        align-items: start;
      }

      #auditorium-calendar .ac-calendar-panel,
      #auditorium-calendar .ac-list-panel {
        min-width: 0;
        border: 1px solid var(--ac-border);
        background: #ffffff;
        border-radius: 20px;
        padding: 18px;
      }

      #auditorium-calendar .ac-list-panel {
        position: sticky;
        top: 16px;
        max-height: calc(100vh - 32px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      #auditorium-calendar .ac-month-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      #auditorium-calendar .ac-month {
        margin: 0;
        font-size: clamp(20px, 2.3vw, 26px);
        font-weight: 900;
        letter-spacing: -.02em;
      }

      #auditorium-calendar .ac-count {
        color: var(--ac-muted);
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
      }

      #auditorium-calendar .ac-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
      }

      #auditorium-calendar .ac-weekday {
        background: #f3f4f6;
        border: 1px solid #edf0f3;
        border-radius: 12px;
        padding: 10px 4px;
        text-align: center;
        font-size: 13px;
        font-weight: 900;
        color: #374151;
      }

      #auditorium-calendar .ac-day {
        min-width: 0;
        min-height: 128px;
        border: 1px solid #e7eaee;
        border-radius: 16px;
        padding: 8px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      #auditorium-calendar .ac-day.other-month {
        background: #f9fafb;
        opacity: .55;
      }

      #auditorium-calendar .ac-day.today {
        border-color: #93c5fd;
        box-shadow: inset 0 0 0 1px #bfdbfe;
      }

      #auditorium-calendar .ac-day-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }

      #auditorium-calendar .ac-num {
        font-size: 14px;
        font-weight: 900;
      }

      #auditorium-calendar .ac-day-badge {
        font-size: 11px;
        font-weight: 900;
        color: #475569;
        background: #f1f5f9;
        border-radius: 999px;
        padding: 2px 6px;
      }

      #auditorium-calendar .ac-events {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      #auditorium-calendar .ac-event {
        width: 100%;
        border: 0;
        border-radius: 12px;
        padding: 7px 8px;
        text-align: left;
        cursor: pointer;
        color: #ffffff;
        font-size: 12px;
        line-height: 1.25;
        transition: transform .15s ease, box-shadow .15s ease;
      }

      #auditorium-calendar .ac-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(15,23,42,.16);
      }

      #auditorium-calendar .ac-event.auditorium { background: var(--ac-green); }
      #auditorium-calendar .ac-event.orchestre { background: var(--ac-blue); }
      #auditorium-calendar .ac-event.autre { background: var(--ac-purple); }
      #auditorium-calendar .ac-event.pending {
        background: var(--ac-orange);
        color: #111827;
      }

      #auditorium-calendar .ac-event-time {
        display: block;
        font-weight: 900;
        margin-bottom: 2px;
      }

      #auditorium-calendar .ac-event-title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #auditorium-calendar .ac-list-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      #auditorium-calendar .ac-list-head h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 900;
      }

      #auditorium-calendar .ac-list {
        overflow-y: auto;
        padding-right: 4px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #auditorium-calendar .ac-item {
        border: 1px solid #e7eaee;
        border-left: 7px solid #9ca3af;
        border-radius: 18px;
        padding: 14px;
        background: #fbfbfc;
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
      }

      #auditorium-calendar .ac-item:hover {
        background: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(15,23,42,.08);
      }

      #auditorium-calendar .ac-item.auditorium { border-left-color: var(--ac-green); }
      #auditorium-calendar .ac-item.orchestre { border-left-color: var(--ac-blue); }
      #auditorium-calendar .ac-item.autre { border-left-color: var(--ac-purple); }
      #auditorium-calendar .ac-item.pending { border-left-color: var(--ac-orange); }

      #auditorium-calendar .ac-item-title {
        font-weight: 900;
        margin-bottom: 7px;
      }

      #auditorium-calendar .ac-item-details {
        font-size: 14px;
        line-height: 1.48;
        color: #4b5563;
      }

      #auditorium-calendar .ac-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      #auditorium-calendar .ac-badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 5px 9px;
        font-size: 12px;
        font-weight: 900;
        color: #ffffff;
      }

      #auditorium-calendar .ac-badge.auditorium { background: var(--ac-green); }
      #auditorium-calendar .ac-badge.orchestre { background: var(--ac-blue); }
      #auditorium-calendar .ac-badge.autre { background: var(--ac-purple); }
      #auditorium-calendar .ac-badge.pending {
        background: var(--ac-orange);
        color: #111827;
      }

      #auditorium-calendar .ac-empty {
        color: var(--ac-muted);
        font-style: italic;
        padding: 12px;
        border: 1px dashed #d1d5db;
        border-radius: 14px;
        background: #f9fafb;
      }

      #auditorium-calendar .ac-error {
        margin-top: 14px;
        color: #b91c1c;
        font-weight: 800;
        white-space: pre-wrap;
      }

      #auditorium-calendar .ac-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,.52);
        z-index: 9999;
        padding: 20px;
        align-items: center;
        justify-content: center;
      }

      #auditorium-calendar .ac-modal.open {
        display: flex;
      }

      #auditorium-calendar .ac-modal-box {
        width: min(620px, 100%);
        background: #ffffff;
        border-radius: 24px;
        padding: 26px;
        position: relative;
        box-shadow: 0 28px 70px rgba(0,0,0,.22);
      }

      #auditorium-calendar .ac-close {
        position: absolute;
        top: 12px;
        right: 14px;
        border: 0;
        background: transparent;
        font-size: 30px;
        cursor: pointer;
      }

      #auditorium-calendar .ac-modal-title {
        margin: 0 36px 18px 0;
        font-size: 26px;
        line-height: 1.15;
        font-weight: 900;
      }

      #auditorium-calendar .ac-row {
        display: grid;
        grid-template-columns: 120px minmax(0, 1fr);
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px dashed #e5e7eb;
        line-height: 1.45;
      }

      #auditorium-calendar .ac-row:last-child {
        border-bottom: 0;
      }

      #auditorium-calendar .ac-label {
        font-weight: 900;
        color: #111827;
      }

      @media (max-width: 1180px) {
        #auditorium-calendar .ac-layout {
          grid-template-columns: 1fr;
        }

        #auditorium-calendar .ac-list-panel {
          position: static;
          max-height: none;
        }

        #auditorium-calendar .ac-list {
          max-height: none;
          overflow: visible;
        }
      }

      @media (max-width: 760px) {
        #auditorium-calendar .ac-header,
        #auditorium-calendar .ac-content {
          padding: 18px;
        }

        #auditorium-calendar .ac-header-main {
          grid-template-columns: 1fr;
        }

        #auditorium-calendar .ac-actions {
          align-items: stretch;
        }

        #auditorium-calendar .ac-nav,
        #auditorium-calendar .ac-filterbar {
          justify-content: flex-start;
        }

        #auditorium-calendar .ac-filter {
          width: 100%;
          text-align: left;
        }

        #auditorium-calendar .ac-grid {
          gap: 6px;
        }

        #auditorium-calendar .ac-weekday {
          font-size: 11px;
          padding: 8px 2px;
        }

        #auditorium-calendar .ac-day {
          min-height: 92px;
          padding: 6px;
          border-radius: 12px;
        }

        #auditorium-calendar .ac-event {
          padding: 6px;
          font-size: 11px;
          border-radius: 9px;
        }

        #auditorium-calendar .ac-event-title {
          display: none;
        }

        #auditorium-calendar .ac-row {
          grid-template-columns: 1fr;
          gap: 4px;
        }
      }

      @media (max-width: 480px) {
        #auditorium-calendar .ac-card {
          border-radius: 16px;
        }

        #auditorium-calendar .ac-calendar-panel,
        #auditorium-calendar .ac-list-panel {
          padding: 12px;
          border-radius: 16px;
        }

        #auditorium-calendar .ac-day {
          min-height: 78px;
        }

        #auditorium-calendar .ac-btn {
          padding: 9px 12px;
          font-size: 13px;
        }
      }
    </style>

    <div class="ac-card">
      <div class="ac-header">
        <div class="ac-header-main">
          <div>
            <h2>Calendrier des réservations</h2>
            <p class="ac-subtitle">Réservations acceptées et demandes en attente, classées par espace.</p>
          </div>

          <div class="ac-actions">
            <div class="ac-nav">
              <button type="button" class="ac-btn" id="ac-prev">←</button>
              <button type="button" class="ac-btn" id="ac-today">Aujourd'hui</button>
              <button type="button" class="ac-btn" id="ac-next">→</button>
            </div>

            <div class="ac-filterbar">
              <label class="ac-filter"><input type="checkbox" class="ac-space-filter" value="auditorium" checked> Auditorium</label>
              <label class="ac-filter"><input type="checkbox" class="ac-space-filter" value="orchestre" checked> Salle d'orchestre</label>
              <label class="ac-filter"><input type="checkbox" class="ac-space-filter" value="autre" checked> Autre</label>
            </div>
          </div>
        </div>

        <div class="ac-legend">
          <span class="ac-pill"><span class="ac-dot auditorium"></span>Auditorium accepté</span>
          <span class="ac-pill"><span class="ac-dot orchestre"></span>Salle d'orchestre acceptée</span>
          <span class="ac-pill"><span class="ac-dot autre"></span>Autre accepté</span>
          <span class="ac-pill"><span class="ac-dot pending"></span>En attente</span>
        </div>
      </div>

      <div class="ac-content">
        <div class="ac-layout">
          <section class="ac-calendar-panel">
            <div class="ac-month-row">
              <h3 id="ac-month" class="ac-month"></h3>
              <div id="ac-count" class="ac-count"></div>
            </div>
            <div id="ac-grid" class="ac-grid"></div>
            <div id="ac-error" class="ac-error"></div>
          </section>

          <aside class="ac-list-panel">
            <div class="ac-list-head">
              <h3>Réservations</h3>
              <span id="ac-list-count" class="ac-count"></span>
            </div>
            <div id="ac-list" class="ac-list"></div>
          </aside>
        </div>
      </div>
    </div>

    <div id="ac-modal" class="ac-modal">
      <div class="ac-modal-box">
        <button type="button" id="ac-close" class="ac-close">&times;</button>
        <h3 id="ac-m-title" class="ac-modal-title">Réservation</h3>
        <div class="ac-row"><span class="ac-label">Demandeur</span><span id="ac-m-dem"></span></div>
        <div class="ac-row"><span class="ac-label">Espace</span><span id="ac-m-space"></span></div>
        <div class="ac-row"><span class="ac-label">Date</span><span id="ac-m-date"></span></div>
        <div class="ac-row"><span class="ac-label">Heure</span><span id="ac-m-time"></span></div>
        <div class="ac-row"><span class="ac-label">Durée</span><span id="ac-m-dur"></span></div>
        <div class="ac-row"><span class="ac-label">Détails</span><span id="ac-m-det"></span></div>
        <div class="ac-row"><span class="ac-label">Statut</span><span id="ac-m-status"></span></div>
      </div>
    </div>
  `;

  let allEvents = [];
  let currentDate = new Date();

  function $(id) {
    return document.getElementById(id);
  }

  function norm(v) {
    return (v || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function parseCSVLine(line) {
    const res = [];
    let cur = "";
    let q = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];

      if (ch === '"') {
        if (q && next === '"') {
          cur += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (ch === "," && !q) {
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
    const normalizedHeaders = headers.map(norm);

    for (const p of possibilities) {
      const np = norm(p);
      const exactIndex = normalizedHeaders.findIndex(h => h === np);
      if (exactIndex !== -1) return exactIndex;
    }

    for (const p of possibilities) {
      const np = norm(p);
      const partialIndex = normalizedHeaders.findIndex(h => h.includes(np));
      if (partialIndex !== -1) return partialIndex;
    }

    return -1;
  }

  function parseDateFR(v) {
    if (!v) return null;

    const txt = v.toString().trim();

    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(txt)) return txt;

    const p = txt.split(/[\\/.-]/);
    if (p.length !== 3) return null;

    let d = p[0];
    let m = p[1];
    let y = p[2];

    if (y.length === 2) y = "20" + y;

    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function safeDate(dateIso) {
    if (!dateIso || !/^\\d{4}-\\d{2}-\\d{2}$/.test(dateIso)) return new Date(NaN);
    const p = dateIso.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function formatDateFR(dateIso) {
    const d = safeDate(dateIso);

    if (isNaN(d.getTime())) return "Date invalide";

    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function formatTime(v) {
    if (!v) return "Non précisée";
    return v.toString().trim().slice(0, 5);
  }

  function statusInfo(v) {
    const s = norm(v);

    if (s === "reservation acceptee" || s.includes("acceptee") || s.includes("accepte")) {
      return { kind: "accepted", label: "Réservation acceptée" };
    }

    if (s === "en attente" || s.includes("attente")) {
      return { kind: "pending", label: "En attente" };
    }

    return null;
  }

  function getSpaces(v) {
    const s = norm(v);
    const spaces = [];

    if (s.includes("auditorium")) spaces.push("auditorium");
    if (s.includes("orchestre")) spaces.push("orchestre");
    if (s.includes("autre")) spaces.push("autre");

    return spaces;
  }

  function spaceLabel(space) {
    if (space === "auditorium") return "Auditorium";
    if (space === "orchestre") return "Salle d'orchestre";
    return "Autre";
  }

  function eventClass(ev) {
    if (ev.statusKind === "pending") return "pending";
    return ev.space;
  }

  function selectedSpaces() {
    return Array.from(root.querySelectorAll(".ac-space-filter"))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function visibleEvents() {
    const selected = selectedSpaces();
    return allEvents.filter(e => selected.includes(e.space));
  }

  function openModal(ev) {
    $("ac-m-title").textContent = ev.demandeur || "Réservation";
    $("ac-m-dem").textContent = ev.demandeur || "";
    $("ac-m-space").textContent = ev.spaceLabel || "";
    $("ac-m-date").textContent = formatDateFR(ev.dateIso);
    $("ac-m-time").textContent = ev.heure || "Non précisée";
    $("ac-m-dur").textContent = ev.duree || "Non précisée";
    $("ac-m-det").textContent = ev.details || "—";
    $("ac-m-status").textContent = ev.statusLabel || "";
    $("ac-modal").classList.add("open");
  }

  function closeModal() {
    $("ac-modal").classList.remove("open");
  }

  function renderList() {
    const el = $("ac-list");
    const countEl = $("ac-list-count");
    const data = visibleEvents().sort((a, b) => safeDate(a.dateIso) - safeDate(b.dateIso));

    el.innerHTML = "";
    countEl.textContent = data.length > 1 ? data.length + " éléments" : data.length + " élément";

    if (!data.length) {
      el.innerHTML = '<div class="ac-empty">Aucune réservation à afficher avec ces filtres.</div>';
      return;
    }

    data.forEach(ev => {
      const cls = eventClass(ev);
      const item = document.createElement("div");
      item.className = "ac-item " + cls;

      item.innerHTML =
        '<div class="ac-item-title">' + esc(ev.demandeur) + '</div>' +
        '<div class="ac-item-details">' +
          '<div><strong>Espace :</strong> ' + esc(ev.spaceLabel) + '</div>' +
          '<div><strong>Date :</strong> ' + esc(formatDateFR(ev.dateIso)) + '</div>' +
          '<div><strong>Heure :</strong> ' + esc(ev.heure) + '</div>' +
          '<div><strong>Durée :</strong> ' + esc(ev.duree || "Non précisée") + '</div>' +
          '<div><strong>Détails :</strong> ' + esc(ev.details || "—") + '</div>' +
        '</div>' +
        '<div class="ac-badges">' +
          '<span class="ac-badge ' + cls + '">' + esc(ev.statusLabel) + '</span>' +
          '<span class="ac-badge ' + ev.space + '">' + esc(ev.spaceLabel) + '</span>' +
        '</div>';

      item.onclick = () => openModal(ev);
      el.appendChild(item);
    });
  }

  function renderCalendar() {
    const grid = $("ac-grid");
    const countEl = $("ac-count");
    const months = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
    const weekdays = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    const vis = visibleEvents();
    const today = new Date();

    const monthEvents = vis.filter(ev => {
      const d = safeDate(ev.dateIso);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    $("ac-month").textContent = months[month] + " " + year;
    countEl.textContent = monthEvents.length > 1 ? monthEvents.length + " réservations" : monthEvents.length + " réservation";

    grid.innerHTML = "";

    weekdays.forEach(w => {
      const d = document.createElement("div");
      d.className = "ac-weekday";
      d.textContent = w;
      grid.appendChild(d);
    });

    for (let i = 0; i < 42; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      const iso =
        day.getFullYear() + "-" +
        String(day.getMonth() + 1).padStart(2, "0") + "-" +
        String(day.getDate()).padStart(2, "0");

      const isToday = day.toDateString() === today.toDateString();

      const cell = document.createElement("div");
      cell.className = "ac-day" + (day.getMonth() !== month ? " other-month" : "") + (isToday ? " today" : "");

      const dayEvents = vis.filter(ev => ev.dateIso === iso);

      const head = document.createElement("div");
      head.className = "ac-day-head";

      const num = document.createElement("div");
      num.className = "ac-num";
      num.textContent = day.getDate();

      head.appendChild(num);

      if (dayEvents.length) {
        const badge = document.createElement("span");
        badge.className = "ac-day-badge";
        badge.textContent = dayEvents.length;
        head.appendChild(badge);
      }

      cell.appendChild(head);

      const eventsWrap = document.createElement("div");
      eventsWrap.className = "ac-events";

      dayEvents.forEach(ev => {
        const cls = eventClass(ev);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ac-event " + cls;
        b.innerHTML =
          '<span class="ac-event-time">' + esc(ev.heure) + '</span>' +
          '<span class="ac-event-title">' + esc(ev.demandeur) + '</span>';
        b.onclick = () => openModal(ev);
        eventsWrap.appendChild(b);
      });

      cell.appendChild(eventsWrap);
      grid.appendChild(cell);
    }
  }

  function refresh() {
    renderCalendar();
    renderList();
  }

  $("ac-prev").onclick = () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    refresh();
  };

  $("ac-next").onclick = () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    refresh();
  };

  $("ac-today").onclick = () => {
    currentDate = new Date();
    refresh();
  };

  $("ac-close").onclick = closeModal;
  $("ac-modal").onclick = e => {
    if (e.target === $("ac-modal")) closeModal();
  };

  root.querySelectorAll(".ac-space-filter").forEach(cb => {
    cb.addEventListener("change", refresh);
  });

  fetch(CSV_URL)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(text => {
      const rows = parseCSV(text);
      const headers = rows[0];
      const dataRows = rows.slice(1);

      const COL_DEMANDEUR = findCol(headers, ["Demandeur"]);
      const COL_DATE = findCol(headers, ["Date"]);
      const COL_HEURE = findCol(headers, ["Heure"]);
      const COL_DUREE = findCol(headers, ["Durée", "Duree"]);
      const COL_INFO = findCol(headers, ["Informations", "détails", "details"]);
      const COL_VALIDATION = findCol(headers, ["Validation"]);
      const COL_CONCERNE = findCol(headers, ["Votre demande concerne", "demande concerne", "concerne"]);

      if ([COL_DEMANDEUR, COL_DATE, COL_HEURE, COL_VALIDATION, COL_CONCERNE].some(i => i === -1)) {
        throw new Error("Colonnes introuvables. Vérifie : Demandeur, Date, Heure, Validation, Votre demande concerne.");
      }

      allEvents = [];

      dataRows.forEach(row => {
        const status = statusInfo(row[COL_VALIDATION]);
        if (!status) return;

        const dateIso = parseDateFR(row[COL_DATE]);
        if (!dateIso) return;

        const spaces = getSpaces(row[COL_CONCERNE]);
        if (!spaces.length) return;

        spaces.forEach(space => {
          allEvents.push({
            demandeur: (row[COL_DEMANDEUR] || "Réservation").toString().trim(),
            details: COL_INFO !== -1 ? (row[COL_INFO] || "").toString().trim() : "",
            heure: formatTime(row[COL_HEURE]),
            duree: COL_DUREE !== -1 ? (row[COL_DUREE] || "").toString().trim() : "",
            statusKind: status.kind,
            statusLabel: status.label,
            space: space,
            spaceLabel: spaceLabel(space),
            dateIso: dateIso
          });
        });
      });

      refresh();

      if (!allEvents.length) {
        $("ac-error").textContent = "Aucune réservation acceptée ou en attente trouvée.";
      }
    })
    .catch(err => {
      $("ac-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
