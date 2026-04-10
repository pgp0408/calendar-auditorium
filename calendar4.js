document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("auditorium-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvqtHB3cJldM-RfnS6poGMa_wwbpjFDZp6RDEgGTAaHlsqMuuuPc6GgQGPIsC1EbwlnDTdgZtXeZnP/pub?output=csv";

  root.innerHTML = `
    <style>
      #auditorium-calendar {
        font-family: Arial, sans-serif;
        color: #1f2937;
      }

      #auditorium-calendar * {
        box-sizing: border-box;
      }

      #auditorium-calendar .ac-shell {
        max-width: 1320px;
        margin: 0 auto;
        padding: 0 12px;
      }

      #auditorium-calendar .ac-card {
        background: linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%);
        border: 1px solid #e5e7eb;
        border-radius: 22px;
        box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
        overflow: hidden;
      }

      #auditorium-calendar .ac-header {
        padding: 28px 28px 18px;
        border-bottom: 1px solid #eef0f3;
        background:
          radial-gradient(circle at top right, rgba(59,130,246,0.10), transparent 26%),
          radial-gradient(circle at top left, rgba(16,185,129,0.08), transparent 24%);
      }

      #auditorium-calendar .ac-header-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
        flex-wrap: wrap;
      }

      #auditorium-calendar .ac-title-wrap h2 {
        margin: 0;
        font-size: 30px;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      #auditorium-calendar .ac-subtitle {
        margin: 8px 0 0;
        color: #6b7280;
        font-size: 15px;
      }

      #auditorium-calendar .ac-toolbar {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-end;
      }

      #auditorium-calendar .ac-controls,
      #auditorium-calendar .ac-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      #auditorium-calendar .ac-btn {
        border: 1px solid #d6dbe1;
        background: #fff;
        color: #111827;
        border-radius: 999px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 700;
        font-size: 14px;
        transition: all .2s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      }

      #auditorium-calendar .ac-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.08);
      }

      #auditorium-calendar .ac-btn.active {
        background: #111827;
        color: #fff;
        border-color: #111827;
      }

      #auditorium-calendar .ac-legend {
        display: flex;
        gap: 18px;
        flex-wrap: wrap;
        margin-top: 16px;
        color: #4b5563;
        font-size: 14px;
      }

      #auditorium-calendar .ac-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,0.85);
        border: 1px solid #eceff3;
        border-radius: 999px;
        padding: 8px 12px;
      }

      #auditorium-calendar .ac-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }

      #auditorium-calendar .ac-dot-ok {
        background: #16a34a;
      }

      #auditorium-calendar .ac-dot-wait {
        background: #f59e0b;
      }

      #auditorium-calendar .ac-body {
        padding: 24px 24px 28px;
      }

      #auditorium-calendar .ac-layout {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(300px, 0.95fr);
        gap: 22px;
        align-items: start;
      }

      #auditorium-calendar .ac-panel {
        border: 1px solid #e7eaee;
        background: #fff;
        border-radius: 18px;
        padding: 18px;
      }

      #auditorium-calendar .ac-panel-title {
        margin: 0 0 14px;
        font-size: 20px;
      }

      #auditorium-calendar .ac-month-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }

      #auditorium-calendar .ac-month {
        font-size: 24px;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
      }

      #auditorium-calendar .ac-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
      }

      #auditorium-calendar .ac-weekday {
        background: #f3f5f7;
        border: 1px solid #eceff3;
        border-radius: 10px;
        padding: 10px 6px;
        text-align: center;
        font-weight: 700;
        font-size: 13px;
        color: #374151;
      }

      #auditorium-calendar .ac-day {
        min-height: 122px;
        border: 1px solid #e7eaee;
        border-radius: 14px;
        padding: 8px;
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      #auditorium-calendar .ac-day.other-month {
        background: #f9fafb;
        opacity: 0.55;
      }

      #auditorium-calendar .ac-day.today {
        border-color: #93c5fd;
        box-shadow: inset 0 0 0 1px #bfdbfe;
      }

      #auditorium-calendar .ac-num {
        font-weight: 800;
        font-size: 14px;
        color: #111827;
      }

      #auditorium-calendar .ac-events {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      #auditorium-calendar .ac-event {
        display: block;
        width: 100%;
        text-align: left;
        border: none;
        border-radius: 10px;
        padding: 7px 8px;
        font-size: 12px;
        line-height: 1.3;
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease;
      }

      #auditorium-calendar .ac-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(0,0,0,0.10);
      }

      #auditorium-calendar .ac-event-ok {
        background: #16a34a;
        color: #fff;
      }

      #auditorium-calendar .ac-event-wait {
        background: #f59e0b;
        color: #111827;
      }

      #auditorium-calendar .ac-event-time {
        font-weight: 800;
        display: block;
        margin-bottom: 2px;
      }

      #auditorium-calendar .ac-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 760px;
        overflow: auto;
        padding-right: 4px;
      }

      #auditorium-calendar .ac-item {
        border: 1px solid #e7eaee;
        border-left: 6px solid #9ca3af;
        border-radius: 16px;
        padding: 14px;
        background: #fafafa;
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease;
      }

      #auditorium-calendar .ac-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.06);
      }

      #auditorium-calendar .ac-item-ok {
        border-left-color: #16a34a;
      }

      #auditorium-calendar .ac-item-wait {
        border-left-color: #f59e0b;
      }

      #auditorium-calendar .ac-item-title {
        font-weight: 800;
        font-size: 15px;
        margin-bottom: 6px;
      }

      #auditorium-calendar .ac-item-details {
        color: #4b5563;
        font-size: 14px;
        line-height: 1.5;
      }

      #auditorium-calendar .ac-item-badge {
        display: inline-block;
        margin-top: 10px;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
      }

      #auditorium-calendar .ac-item-badge.ok {
        background: #dcfce7;
        color: #166534;
      }

      #auditorium-calendar .ac-item-badge.wait {
        background: #fef3c7;
        color: #92400e;
      }

      #auditorium-calendar .ac-empty {
        color: #6b7280;
        font-style: italic;
      }

      #auditorium-calendar .ac-error {
        margin-top: 14px;
        color: #b91c1c;
        font-weight: 700;
        white-space: pre-wrap;
      }

      #auditorium-calendar .ac-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        z-index: 9999;
        padding: 20px;
        align-items: center;
        justify-content: center;
      }

      #auditorium-calendar .ac-modal.open {
        display: flex;
      }

      #auditorium-calendar .ac-modal-box {
        background: #fff;
        width: 100%;
        max-width: 620px;
        border-radius: 22px;
        padding: 24px;
        position: relative;
        box-shadow: 0 24px 60px rgba(0,0,0,0.18);
      }

      #auditorium-calendar .ac-close {
        position: absolute;
        top: 12px;
        right: 14px;
        border: none;
        background: transparent;
        font-size: 28px;
        cursor: pointer;
      }

      #auditorium-calendar .ac-modal h3 {
        margin: 0 0 16px;
        font-size: 26px;
        line-height: 1.15;
      }

      #auditorium-calendar .ac-row {
        margin-bottom: 12px;
        line-height: 1.5;
      }

      #auditorium-calendar .ac-label {
        font-weight: 800;
      }

      @media (max-width: 1100px) {
        #auditorium-calendar .ac-layout {
          grid-template-columns: 1fr;
        }

        #auditorium-calendar .ac-list {
          max-height: none;
        }
      }

      @media (max-width: 760px) {
        #auditorium-calendar .ac-header {
          padding: 22px 18px 16px;
        }

        #auditorium-calendar .ac-body {
          padding: 16px;
        }

        #auditorium-calendar .ac-panel {
          padding: 14px;
        }

        #auditorium-calendar .ac-title-wrap h2 {
          font-size: 24px;
        }

        #auditorium-calendar .ac-subtitle {
          font-size: 14px;
        }

        #auditorium-calendar .ac-toolbar {
          width: 100%;
          align-items: stretch;
        }

        #auditorium-calendar .ac-controls,
        #auditorium-calendar .ac-filters {
          justify-content: flex-start;
        }

        #auditorium-calendar .ac-grid {
          gap: 6px;
        }

        #auditorium-calendar .ac-weekday {
          font-size: 12px;
          padding: 8px 4px;
        }

        #auditorium-calendar .ac-day {
          min-height: 96px;
          padding: 6px;
          border-radius: 12px;
        }

        #auditorium-calendar .ac-event {
          font-size: 11px;
          padding: 6px;
          border-radius: 8px;
        }

        #auditorium-calendar .ac-event-time {
          font-size: 11px;
        }
      }

      @media (max-width: 520px) {
        #auditorium-calendar .ac-shell {
          padding: 0;
        }

        #auditorium-calendar .ac-card {
          border-radius: 16px;
        }

        #auditorium-calendar .ac-header-top {
          align-items: stretch;
        }

        #auditorium-calendar .ac-btn {
          padding: 9px 12px;
          font-size: 13px;
        }

        #auditorium-calendar .ac-legend {
          gap: 10px;
        }

        #auditorium-calendar .ac-legend-item {
          width: 100%;
          justify-content: flex-start;
        }

        #auditorium-calendar .ac-day {
          min-height: 82px;
        }

        #auditorium-calendar .ac-event-label {
          display: none;
        }

        #auditorium-calendar .ac-modal-box {
          padding: 20px 18px;
        }

        #auditorium-calendar .ac-modal h3 {
          font-size: 22px;
          padding-right: 20px;
        }
      }
    </style>

    <div class="ac-shell">
      <div class="ac-card">
        <div class="ac-header">
          <div class="ac-header-top">
            <div class="ac-title-wrap">
              <h2>Calendrier des réservations</h2>
              <p class="ac-subtitle">Demandes acceptées et en attente, synchronisées automatiquement depuis le formulaire.</p>
            </div>

            <div class="ac-toolbar">
              <div class="ac-controls">
                <button type="button" class="ac-btn" id="ac-prev">←</button>
                <button type="button" class="ac-btn" id="ac-today">Aujourd'hui</button>
                <button type="button" class="ac-btn" id="ac-next">→</button>
              </div>

              <div class="ac-filters">
                <button type="button" class="ac-btn active ac-filter" data-filter="all">Toutes</button>
                <button type="button" class="ac-btn ac-filter" data-filter="accepted">Acceptées</button>
                <button type="button" class="ac-btn ac-filter" data-filter="pending">En attente</button>
              </div>
            </div>
          </div>

          <div class="ac-legend">
            <div class="ac-legend-item"><span class="ac-dot ac-dot-ok"></span>Réservation acceptée</div>
            <div class="ac-legend-item"><span class="ac-dot ac-dot-wait"></span>En attente</div>
          </div>
        </div>

        <div class="ac-body">
          <div class="ac-layout">
            <div class="ac-panel">
              <div class="ac-month-bar">
                <div id="ac-month" class="ac-month"></div>
              </div>
              <div id="ac-grid" class="ac-grid"></div>
              <div id="ac-error" class="ac-error"></div>
            </div>

            <div class="ac-panel">
              <h3 class="ac-panel-title">Liste des réservations</h3>
              <div id="ac-list" class="ac-list"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="ac-modal" class="ac-modal">
      <div class="ac-modal-box">
        <button type="button" id="ac-close" class="ac-close">&times;</button>
        <h3 id="ac-m-title">Réservation</h3>
        <div class="ac-row"><span class="ac-label">Demandeur :</span> <span id="ac-m-dem"></span></div>
        <div class="ac-row"><span class="ac-label">Date :</span> <span id="ac-m-date"></span></div>
        <div class="ac-row"><span class="ac-label">Heure :</span> <span id="ac-m-time"></span></div>
        <div class="ac-row"><span class="ac-label">Durée :</span> <span id="ac-m-dur"></span></div>
        <div class="ac-row"><span class="ac-label">Détails :</span> <span id="ac-m-det"></span></div>
        <div class="ac-row"><span class="ac-label">Statut :</span> <span id="ac-m-status"></span></div>
      </div>
    </div>
  `;

  const COL_DEMANDEUR = 1;
  const COL_DATE = 2;
  const COL_HEURE = 3;
  const COL_DUREE = 4;
  const COL_INFO = 5;
  const COL_VALIDATION = 7;

  let allEvents = [];
  let currentFilter = "all";
  let currentDate = new Date();

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

  function parseDateFR(v) {
    if (!v) return null;
    const p = v.toString().trim().split(/[\/.-]/);
    if (p.length !== 3) return null;
    let d = p[0];
    let m = p[1];
    let y = p[2];
    if (y.length === 2) y = "20" + y;
    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function formatDateFR(dateValue) {
    return new Date(dateValue).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function formatTime(v) {
    return v ? v.toString().slice(0, 5) : "Non précisée";
  }

  function statusCfg(v) {
    const s = norm(v);

    if (
      s === "reservation acceptee" ||
      s === "acceptee" ||
      s === "acceptée" ||
      s === "confirmee" ||
      s === "confirmée"
    ) {
      return { label: "Réservation acceptée", cls: "ok" };
    }

    if (
      s === "en attente" ||
      s === "attente" ||
      s === "a confirmer" ||
      s === "à confirmer"
    ) {
      return { label: "En attente", cls: "wait" };
    }

    return null;
  }

  function visibleEvents() {
    if (currentFilter === "accepted") {
      return allEvents.filter(function (e) { return e.cls === "ok"; });
    }
    if (currentFilter === "pending") {
      return allEvents.filter(function (e) { return e.cls === "wait"; });
    }
    return allEvents.slice();
  }

  function openModal(ev) {
    $("ac-m-title").textContent = ev.demandeur || "Réservation";
    $("ac-m-dem").textContent = ev.demandeur || "";
    $("ac-m-date").textContent = formatDateFR(ev.start);
    $("ac-m-time").textContent = ev.heure || "Non précisée";
    $("ac-m-dur").textContent = ev.duree || "Non précisée";
    $("ac-m-det").textContent = ev.details || "—";
    $("ac-m-status").textContent = ev.statut || "";
    $("ac-modal").classList.add("open");
  }

  function closeModal() {
    $("ac-modal").classList.remove("open");
  }

  function renderList() {
    const el = $("ac-list");
    const data = visibleEvents().sort(function (a, b) {
      return new Date(a.start) - new Date(b.start);
    });

    el.innerHTML = "";

    if (!data.length) {
      el.innerHTML = '<div class="ac-empty">Aucune réservation à afficher.</div>';
      return;
    }

    data.forEach(function (ev) {
      const item = document.createElement("div");
      item.className = "ac-item " + (ev.cls === "ok" ? "ac-item-ok" : "ac-item-wait");
      item.innerHTML =
        '<div class="ac-item-title">' + esc(ev.demandeur) + '</div>' +
        '<div class="ac-item-details">' +
          '<div><strong>Date :</strong> ' + esc(formatDateFR(ev.start)) + '</div>' +
          '<div><strong>Heure :</strong> ' + esc(ev.heure) + '</div>' +
          '<div><strong>Durée :</strong> ' + esc(ev.duree || "Non précisée") + '</div>' +
          '<div><strong>Détails :</strong> ' + esc(ev.details || "—") + '</div>' +
        '</div>' +
        '<span class="ac-item-badge ' + (ev.cls === "ok" ? "ok" : "wait") + '">' + esc(ev.statut) + '</span>';

      item.onclick = function () {
        openModal(ev);
      };

      el.appendChild(item);
    });
  }

  function renderCalendar() {
    const grid = $("ac-grid");
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    const vis = visibleEvents();
    const today = new Date();

    $("ac-month").textContent = months[month] + " " + year;
    grid.innerHTML = "";

    weekdays.forEach(function (w) {
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

      const isToday =
        day.getFullYear() === today.getFullYear() &&
        day.getMonth() === today.getMonth() &&
        day.getDate() === today.getDate();

      const cell = document.createElement("div");
      cell.className = "ac-day" + (day.getMonth() !== month ? " other-month" : "") + (isToday ? " today" : "");

      const num = document.createElement("div");
      num.className = "ac-num";
      num.textContent = day.getDate();
      cell.appendChild(num);

      const eventsWrap = document.createElement("div");
      eventsWrap.className = "ac-events";

      vis.filter(function (ev) {
        return ev.dateIso === iso;
      }).forEach(function (ev) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ac-event " + (ev.cls === "ok" ? "ac-event-ok" : "ac-event-wait");
        b.innerHTML =
          '<span class="ac-event-time">' + esc(ev.heure) + '</span>' +
          '<span class="ac-event-label">' + esc(ev.demandeur) + '</span>';
        b.onclick = function () {
          openModal(ev);
        };
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

  $("ac-prev").onclick = function () {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
  };

  $("ac-next").onclick = function () {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
  };

  $("ac-today").onclick = function () {
    currentDate = new Date();
    renderCalendar();
  };

  $("ac-close").onclick = closeModal;

  $("ac-modal").onclick = function (e) {
    if (e.target === $("ac-modal")) closeModal();
  };

  Array.prototype.forEach.call(root.querySelectorAll(".ac-filter"), function (btn) {
    btn.onclick = function () {
      Array.prototype.forEach.call(root.querySelectorAll(".ac-filter"), function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      refresh();
    };
  });

  fetch(CSV_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (text) {
      const rows = parseCSV(text).slice(1);

      allEvents = rows.map(function (row) {
        const cfg = statusCfg(row[COL_VALIDATION]);
        const dateIso = parseDateFR(row[COL_DATE]);

        if (!cfg || !dateIso) return null;

        return {
          demandeur: (row[COL_DEMANDEUR] || "Réservation").toString().trim(),
          details: (row[COL_INFO] || "").toString().trim(),
          heure: formatTime(row[COL_HEURE]),
          duree: (row[COL_DUREE] || "").toString().trim(),
          statut: cfg.label,
          cls: cfg.cls,
          dateIso: dateIso,
          start: dateIso + "T" + ((row[COL_HEURE] || "00:00:00").toString().trim())
        };
      }).filter(Boolean);

      refresh();

      if (!allEvents.length) {
        $("ac-error").textContent = "Aucune réservation acceptée ou en attente trouvée.";
      }
    })
    .catch(function (err) {
      $("ac-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
