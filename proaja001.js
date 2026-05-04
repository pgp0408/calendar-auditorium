document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("proaja-calendar");
  if (!root) return;

  // Remplace cette URL par l’URL CSV publiée du nouveau Google Sheet
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQasSMsDEytgSX9dgxLRx1KIOYtsGDNx4jBD_v25_57jbR9n00LHnr9qFMXCiv6oN1OYwR-EEaQ_cbl/pub?output=csv";

  root.innerHTML = `
    <style>
      #proaja-calendar {
        --ac-text: #111827;
        --ac-muted: #6b7280;
        --ac-border: #e5e7eb;
        --ac-shadow: 0 18px 50px rgba(15,23,42,.08);
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

      #proaja-calendar * { box-sizing: border-box; }

      #proaja-calendar .pc-card {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid var(--ac-border);
        border-radius: 22px;
        box-shadow: var(--ac-shadow);
        overflow: hidden;
      }

      #proaja-calendar .pc-header {
        padding: 28px;
        background:
          radial-gradient(circle at top right, rgba(37,99,235,.12), transparent 30%),
          radial-gradient(circle at top left, rgba(124,58,237,.10), transparent 28%),
          #fff;
        border-bottom: 1px solid var(--ac-border);
      }

      #proaja-calendar .pc-header-main {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 22px;
        align-items: start;
      }

      #proaja-calendar h2 {
        margin: 0;
        font-size: clamp(24px, 3vw, 34px);
        line-height: 1.08;
        letter-spacing: -.03em;
      }

      #proaja-calendar .pc-subtitle {
        margin: 9px 0 0;
        color: var(--ac-muted);
        font-size: 15px;
        line-height: 1.5;
        max-width: 720px;
      }

      #proaja-calendar .pc-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-end;
      }

      #proaja-calendar .pc-nav,
      #proaja-calendar .pc-filterbar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      #proaja-calendar .pc-btn,
      #proaja-calendar .pc-filter {
        border: 1px solid #d1d5db;
        background: #fff;
        color: #111827;
        border-radius: 999px;
        padding: 10px 14px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 800;
        line-height: 1;
      }

      #proaja-calendar .pc-filter input {
        margin-right: 6px;
        transform: translateY(1px);
      }

      #proaja-calendar .pc-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }

      #proaja-calendar .pc-pill {
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

      #proaja-calendar .pc-dot {
        width: 11px;
        height: 11px;
        border-radius: 999px;
        display: inline-block;
      }

      #proaja-calendar .pc-dot.auditorium { background: var(--ac-green); }
      #proaja-calendar .pc-dot.orchestre { background: var(--ac-blue); }
      #proaja-calendar .pc-dot.autre { background: var(--ac-purple); }
      #proaja-calendar .pc-dot.pending { background: var(--ac-orange); }

      #proaja-calendar .pc-content { padding: 24px; }

      #proaja-calendar .pc-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 22px;
        align-items: start;
      }

      #proaja-calendar .pc-calendar-panel,
      #proaja-calendar .pc-list-panel {
        min-width: 0;
        border: 1px solid var(--ac-border);
        background: #fff;
        border-radius: 20px;
        padding: 18px;
      }

      #proaja-calendar .pc-list-panel {
        position: sticky;
        top: 16px;
        max-height: calc(100vh - 32px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      #proaja-calendar .pc-month-row,
      #proaja-calendar .pc-list-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      #proaja-calendar .pc-month,
      #proaja-calendar .pc-list-head h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 900;
        letter-spacing: -.02em;
      }

      #proaja-calendar .pc-count {
        color: var(--ac-muted);
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
      }

      #proaja-calendar .pc-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
      }

      #proaja-calendar .pc-weekday {
        background: #f3f4f6;
        border: 1px solid #edf0f3;
        border-radius: 12px;
        padding: 10px 4px;
        text-align: center;
        font-size: 13px;
        font-weight: 900;
        color: #374151;
      }

      #proaja-calendar .pc-day {
        min-width: 0;
        min-height: 128px;
        border: 1px solid #e7eaee;
        border-radius: 16px;
        padding: 8px;
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      #proaja-calendar .pc-day.other-month {
        background: #f9fafb;
        opacity: .55;
      }

      #proaja-calendar .pc-day.today {
        border-color: #93c5fd;
        box-shadow: inset 0 0 0 1px #bfdbfe;
      }

      #proaja-calendar .pc-day-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }

      #proaja-calendar .pc-num {
        font-size: 14px;
        font-weight: 900;
      }

      #proaja-calendar .pc-day-badge {
        font-size: 11px;
        font-weight: 900;
        color: #475569;
        background: #f1f5f9;
        border-radius: 999px;
        padding: 2px 6px;
      }

      #proaja-calendar .pc-event {
        width: 100%;
        border: 0;
        border-radius: 12px;
        padding: 7px 8px;
        text-align: left;
        cursor: pointer;
        color: #fff;
        font-size: 12px;
        line-height: 1.25;
      }

      #proaja-calendar .pc-event.auditorium { background: var(--ac-green); }
      #proaja-calendar .pc-event.orchestre { background: var(--ac-blue); }
      #proaja-calendar .pc-event.autre { background: var(--ac-purple); }
      #proaja-calendar .pc-event.pending {
        background: var(--ac-orange);
        color: #111827;
      }

      #proaja-calendar .pc-event-time {
        display: block;
        font-weight: 900;
        margin-bottom: 2px;
      }

      #proaja-calendar .pc-list {
        overflow-y: auto;
        padding-right: 4px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #proaja-calendar .pc-item {
        border: 1px solid #e7eaee;
        border-left: 7px solid #9ca3af;
        border-radius: 18px;
        padding: 14px;
        background: #fbfbfc;
        cursor: pointer;
      }

      #proaja-calendar .pc-item.auditorium { border-left-color: var(--ac-green); }
      #proaja-calendar .pc-item.orchestre { border-left-color: var(--ac-blue); }
      #proaja-calendar .pc-item.autre { border-left-color: var(--ac-purple); }
      #proaja-calendar .pc-item.pending { border-left-color: var(--ac-orange); }

      #proaja-calendar .pc-item-title {
        font-weight: 900;
        margin-bottom: 7px;
      }

      #proaja-calendar .pc-item-details {
        font-size: 14px;
        line-height: 1.48;
        color: #4b5563;
      }

      #proaja-calendar .pc-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      #proaja-calendar .pc-badge {
        border-radius: 999px;
        padding: 5px 9px;
        font-size: 12px;
        font-weight: 900;
        color: #fff;
      }

      #proaja-calendar .pc-badge.auditorium { background: var(--ac-green); }
      #proaja-calendar .pc-badge.orchestre { background: var(--ac-blue); }
      #proaja-calendar .pc-badge.autre { background: var(--ac-purple); }
      #proaja-calendar .pc-badge.pending {
        background: var(--ac-orange);
        color: #111827;
      }

      #proaja-calendar .pc-empty {
        color: var(--ac-muted);
        font-style: italic;
        padding: 12px;
        border: 1px dashed #d1d5db;
        border-radius: 14px;
        background: #f9fafb;
      }

      #proaja-calendar .pc-error {
        margin-top: 14px;
        color: #b91c1c;
        font-weight: 800;
        white-space: pre-wrap;
      }

      #proaja-calendar .pc-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,.52);
        z-index: 9999;
        padding: 20px;
        align-items: center;
        justify-content: center;
      }

      #proaja-calendar .pc-modal.open { display: flex; }

      #proaja-calendar .pc-modal-box {
        width: min(640px, 100%);
        background: #fff;
        border-radius: 24px;
        padding: 26px;
        position: relative;
        box-shadow: 0 28px 70px rgba(0,0,0,.22);
      }

      #proaja-calendar .pc-close {
        position: absolute;
        top: 12px;
        right: 14px;
        border: 0;
        background: transparent;
        font-size: 30px;
        cursor: pointer;
      }

      #proaja-calendar .pc-modal-title {
        margin: 0 36px 18px 0;
        font-size: 26px;
        line-height: 1.15;
        font-weight: 900;
      }

      #proaja-calendar .pc-row {
        display: grid;
        grid-template-columns: 140px minmax(0, 1fr);
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px dashed #e5e7eb;
        line-height: 1.45;
      }

      #proaja-calendar .pc-row:last-child { border-bottom: 0; }
      #proaja-calendar .pc-label { font-weight: 900; }

      @media (max-width: 1180px) {
        #proaja-calendar .pc-layout { grid-template-columns: 1fr; }
        #proaja-calendar .pc-list-panel {
          position: static;
          max-height: none;
        }
        #proaja-calendar .pc-list {
          max-height: none;
          overflow: visible;
        }
      }

      @media (max-width: 760px) {
        #proaja-calendar .pc-header,
        #proaja-calendar .pc-content { padding: 18px; }

        #proaja-calendar .pc-header-main { grid-template-columns: 1fr; }
        #proaja-calendar .pc-actions { align-items: stretch; }
        #proaja-calendar .pc-nav,
        #proaja-calendar .pc-filterbar { justify-content: flex-start; }

        #proaja-calendar .pc-filter {
          width: 100%;
          text-align: left;
        }

        #proaja-calendar .pc-grid { gap: 6px; }
        #proaja-calendar .pc-weekday {
          font-size: 11px;
          padding: 8px 2px;
        }

        #proaja-calendar .pc-day {
          min-height: 92px;
          padding: 6px;
          border-radius: 12px;
        }

        #proaja-calendar .pc-event {
          padding: 6px;
          font-size: 11px;
        }

        #proaja-calendar .pc-event-title { display: none; }

        #proaja-calendar .pc-row {
          grid-template-columns: 1fr;
          gap: 4px;
        }
      }
    </style>

    <div class="pc-card">
      <div class="pc-header">
        <div class="pc-header-main">
          <div>
            <h2>Calendrier des projets CRD Aiacciu</h2>
            <p class="pc-subtitle">Projets acceptés et demandes en attente, classés par espace.</p>
          </div>

          <div class="pc-actions">
            <div class="pc-nav">
              <button type="button" class="pc-btn" id="pc-prev">←</button>
              <button type="button" class="pc-btn" id="pc-today">Aujourd'hui</button>
              <button type="button" class="pc-btn" id="pc-next">→</button>
            </div>

            <div class="pc-filterbar">
              <label class="pc-filter"><input type="checkbox" class="pc-space-filter" value="auditorium" checked> Auditorium</label>
              <label class="pc-filter"><input type="checkbox" class="pc-space-filter" value="orchestre" checked> Salle d'orchestre</label>
              <label class="pc-filter"><input type="checkbox" class="pc-space-filter" value="autre" checked> Autre</label>
            </div>
          </div>
        </div>

        <div class="pc-legend">
          <span class="pc-pill"><span class="pc-dot auditorium"></span>Auditorium accepté</span>
          <span class="pc-pill"><span class="pc-dot orchestre"></span>Salle d'orchestre acceptée</span>
          <span class="pc-pill"><span class="pc-dot autre"></span>Autre accepté</span>
          <span class="pc-pill"><span class="pc-dot pending"></span>En attente</span>
        </div>
      </div>

      <div class="pc-content">
        <div class="pc-layout">
          <section class="pc-calendar-panel">
            <div class="pc-month-row">
              <h3 id="pc-month" class="pc-month"></h3>
              <div id="pc-count" class="pc-count"></div>
            </div>
            <div id="pc-grid" class="pc-grid"></div>
            <div id="pc-error" class="pc-error"></div>
          </section>

          <aside class="pc-list-panel">
            <div class="pc-list-head">
              <h3>Projets</h3>
              <span id="pc-list-count" class="pc-count"></span>
            </div>
            <div id="pc-list" class="pc-list"></div>
          </aside>
        </div>
      </div>
    </div>

    <div id="pc-modal" class="pc-modal">
      <div class="pc-modal-box">
        <button type="button" id="pc-close" class="pc-close">&times;</button>
        <h3 id="pc-m-title" class="pc-modal-title">Projet</h3>
        <div class="pc-row"><span class="pc-label">Demandeur</span><span id="pc-m-dem"></span></div>
        <div class="pc-row"><span class="pc-label">Projet</span><span id="pc-m-project"></span></div>
        <div class="pc-row"><span class="pc-label">Espace</span><span id="pc-m-space"></span></div>
        <div class="pc-row"><span class="pc-label">Date</span><span id="pc-m-date"></span></div>
        <div class="pc-row"><span class="pc-label">Heure</span><span id="pc-m-time"></span></div>
        <div class="pc-row"><span class="pc-label">Durée</span><span id="pc-m-dur"></span></div>
        <div class="pc-row"><span class="pc-label">Détails</span><span id="pc-m-det"></span></div>
        <div class="pc-row"><span class="pc-label">Besoins</span><span id="pc-m-needs"></span></div>
        <div class="pc-row"><span class="pc-label">Effectifs</span><span id="pc-m-people"></span></div>
        <div class="pc-row"><span class="pc-label">Statut</span><span id="pc-m-status"></span></div>
      </div>
    </div>
  `;

  let allEvents = [];
  let currentDate = new Date();

  function $(id) { return document.getElementById(id); }

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

    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

    const p = txt.split(/[\/.-]/);
    if (p.length !== 3) return null;

    let d = p[0], m = p[1], y = p[2];
    if (y.length === 2) y = "20" + y;

    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function safeDate(dateIso) {
    if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return new Date(NaN);
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

    if (s.includes("projet valide") || s.includes("reservation acceptee") || s.includes("acceptee") || s.includes("accepte") || s.includes("valide")) {
      return { kind: "accepted", label: "Projet validé" };
    }

    if (s.includes("attente")) {
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
    return Array.from(root.querySelectorAll(".pc-space-filter"))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function visibleEvents() {
    const selected = selectedSpaces();
    return allEvents.filter(e => selected.includes(e.space));
  }

  function openModal(ev) {
    $("pc-m-title").textContent = ev.project || "Projet";
    $("pc-m-dem").textContent = ev.demandeur || "";
    $("pc-m-project").textContent = ev.project || "";
    $("pc-m-space").textContent = ev.spaceLabel || "";
    $("pc-m-date").textContent = formatDateFR(ev.dateIso);
    $("pc-m-time").textContent = ev.heure || "Non précisée";
    $("pc-m-dur").textContent = ev.duree || "Non précisée";
    $("pc-m-det").textContent = ev.details || "—";
    $("pc-m-needs").textContent = ev.needs || "—";
    $("pc-m-people").textContent = ev.people || "—";
    $("pc-m-status").textContent = ev.statusLabel || "";
    $("pc-modal").classList.add("open");
  }

  function closeModal() {
    $("pc-modal").classList.remove("open");
  }

  function renderList() {
    const el = $("pc-list");
    const countEl = $("pc-list-count");
    const data = visibleEvents().sort((a, b) => safeDate(a.dateIso) - safeDate(b.dateIso));

    el.innerHTML = "";
    countEl.textContent = data.length > 1 ? data.length + " éléments" : data.length + " élément";

    if (!data.length) {
      el.innerHTML = '<div class="pc-empty">Aucun projet à afficher avec ces filtres.</div>';
      return;
    }

    data.forEach(ev => {
      const cls = eventClass(ev);
      const item = document.createElement("div");
      item.className = "pc-item " + cls;

      item.innerHTML =
        '<div class="pc-item-title">' + esc(ev.project || ev.demandeur) + '</div>' +
        '<div class="pc-item-details">' +
          '<div><strong>Demandeur :</strong> ' + esc(ev.demandeur) + '</div>' +
          '<div><strong>Espace :</strong> ' + esc(ev.spaceLabel) + '</div>' +
          '<div><strong>Date :</strong> ' + esc(formatDateFR(ev.dateIso)) + '</div>' +
          '<div><strong>Heure :</strong> ' + esc(ev.heure) + '</div>' +
          '<div><strong>Durée :</strong> ' + esc(ev.duree || "Non précisée") + '</div>' +
        '</div>' +
        '<div class="pc-badges">' +
          '<span class="pc-badge ' + cls + '">' + esc(ev.statusLabel) + '</span>' +
          '<span class="pc-badge ' + ev.space + '">' + esc(ev.spaceLabel) + '</span>' +
        '</div>';

      item.onclick = () => openModal(ev);
      el.appendChild(item);
    });
  }

  function renderCalendar() {
    const grid = $("pc-grid");
    const countEl = $("pc-count");
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

    $("pc-month").textContent = months[month] + " " + year;
    countEl.textContent = monthEvents.length > 1 ? monthEvents.length + " projets" : monthEvents.length + " projet";

    grid.innerHTML = "";

    weekdays.forEach(w => {
      const d = document.createElement("div");
      d.className = "pc-weekday";
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
      cell.className = "pc-day" + (day.getMonth() !== month ? " other-month" : "") + (isToday ? " today" : "");

      const dayEvents = vis.filter(ev => ev.dateIso === iso);

      const head = document.createElement("div");
      head.className = "pc-day-head";

      const num = document.createElement("div");
      num.className = "pc-num";
      num.textContent = day.getDate();

      head.appendChild(num);

      if (dayEvents.length) {
        const badge = document.createElement("span");
        badge.className = "pc-day-badge";
        badge.textContent = dayEvents.length;
        head.appendChild(badge);
      }

      cell.appendChild(head);

      dayEvents.forEach(ev => {
        const cls = eventClass(ev);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pc-event " + cls;
        b.innerHTML =
          '<span class="pc-event-time">' + esc(ev.heure) + '</span>' +
          '<span class="pc-event-title">' + esc(ev.project || ev.demandeur) + '</span>';
        b.onclick = () => openModal(ev);
        cell.appendChild(b);
      });

      grid.appendChild(cell);
    }
  }

  function refresh() {
    renderCalendar();
    renderList();
  }

  $("pc-prev").onclick = () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    refresh();
  };

  $("pc-next").onclick = () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    refresh();
  };

  $("pc-today").onclick = () => {
    currentDate = new Date();
    refresh();
  };

  $("pc-close").onclick = closeModal;

  $("pc-modal").onclick = e => {
    if (e.target === $("pc-modal")) closeModal();
  };

  root.querySelectorAll(".pc-space-filter").forEach(cb => {
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
      const COL_PROJET = findCol(headers, ["Nom du projet", "Projet"]);
      const COL_CONCERNE = findCol(headers, ["Votre demande concerne", "demande concerne", "concerne"]);
      const COL_DATE = findCol(headers, ["Date souhaitée (1er jour du projet)", "Date souhaitée", "Date"]);
      const COL_HEURE = findCol(headers, ["Heure de début", "Heure"]);
      const COL_DUREE = findCol(headers, ["Durée", "Duree"]);
      const COL_INFO = findCol(headers, ["Informations", "détails", "details"]);
      const COL_BESOINS = findCol(headers, ["Besoins spécifiques", "Besoins"]);
      const COL_EFFECTIFS = findCol(headers, ["Effectifs prévus", "Effectifs"]);
      const COL_VALIDATION = findCol(headers, ["Validation"]);

      if ([COL_DEMANDEUR, COL_PROJET, COL_CONCERNE, COL_DATE, COL_HEURE, COL_VALIDATION].some(i => i === -1)) {
        throw new Error("Colonnes introuvables. Vérifie : Demandeur, Nom du projet, Votre demande concerne, Date souhaitée, Heure de début, Validation.");
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
            demandeur: (row[COL_DEMANDEUR] || "").toString().trim(),
            project: (row[COL_PROJET] || "Projet").toString().trim(),
            details: COL_INFO !== -1 ? (row[COL_INFO] || "").toString().trim() : "",
            needs: COL_BESOINS !== -1 ? (row[COL_BESOINS] || "").toString().trim() : "",
            people: COL_EFFECTIFS !== -1 ? (row[COL_EFFECTIFS] || "").toString().trim() : "",
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
        $("pc-error").textContent = "Aucun projet accepté ou en attente trouvé.";
      }
    })
    .catch(err => {
      $("pc-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
