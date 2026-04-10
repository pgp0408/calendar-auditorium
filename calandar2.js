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

      #auditorium-calendar .ac-wrap {
        max-width: 1300px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,.06);
        padding: 20px;
      }

      #auditorium-calendar .ac-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      #auditorium-calendar h2 {
        margin: 0;
        font-size: 28px;
      }

      #auditorium-calendar .ac-controls,
      #auditorium-calendar .ac-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      #auditorium-calendar button {
        border: 1px solid #d1d5db;
        background: #fff;
        border-radius: 999px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 700;
      }

      #auditorium-calendar button.ac-active {
        background: #111827;
        color: #fff;
        border-color: #111827;
      }

      #auditorium-calendar .ac-legend {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin: 8px 0 18px;
        font-size: 14px;
      }

      #auditorium-calendar .ac-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 6px;
        vertical-align: middle;
      }

      #auditorium-calendar .ac-dot-ok {
        background: #16a34a;
      }

      #auditorium-calendar .ac-dot-wait {
        background: #f59e0b;
      }

      #auditorium-calendar .ac-layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      #auditorium-calendar .ac-panel {
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 16px;
        background: #fff;
      }

      #auditorium-calendar .ac-month {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 14px;
      }

      #auditorium-calendar .ac-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
      }

      #auditorium-calendar .ac-weekday {
        background: #f3f4f6;
        border-radius: 10px;
        padding: 10px 6px;
        text-align: center;
        font-weight: 700;
        font-size: 14px;
      }

      #auditorium-calendar .ac-day {
        min-height: 115px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 8px;
        background: #fff;
      }

      #auditorium-calendar .ac-other {
        background: #f9fafb;
        opacity: .55;
      }

      #auditorium-calendar .ac-num {
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 6px;
      }

      #auditorium-calendar .ac-event {
        display: block;
        width: 100%;
        text-align: left;
        border: none;
        border-radius: 9px;
        padding: 6px 8px;
        margin: 0 0 6px;
        font-size: 12px;
        line-height: 1.3;
        cursor: pointer;
      }

      #auditorium-calendar .ac-event-ok {
        background: #16a34a;
        color: #fff;
      }

      #auditorium-calendar .ac-event-wait {
        background: #f59e0b;
        color: #111827;
      }

      #auditorium-calendar .ac-side-title {
        margin: 0 0 12px;
        font-size: 20px;
      }

      #auditorium-calendar .ac-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 760px;
        overflow: auto;
      }

      #auditorium-calendar .ac-item {
        border: 1px solid #e5e7eb;
        border-left: 6px solid #9ca3af;
        border-radius: 12px;
        padding: 12px;
        background: #fafafa;
        cursor: pointer;
      }

      #auditorium-calendar .ac-item-ok {
        border-left-color: #16a34a;
      }

      #auditorium-calendar .ac-item-wait {
        border-left-color: #f59e0b;
      }

      #auditorium-calendar .ac-item-title {
        font-weight: 700;
        margin-bottom: 6px;
      }

      #auditorium-calendar .ac-item-meta {
        font-size: 14px;
        line-height: 1.45;
        color: #4b5563;
      }

      #auditorium-calendar .ac-badge {
        display: inline-block;
        margin-top: 8px;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
      }

      #auditorium-calendar .ac-badge-ok {
        background: #dcfce7;
        color: #166534;
      }

      #auditorium-calendar .ac-badge-wait {
        background: #fef3c7;
        color: #92400e;
      }

      #auditorium-calendar .ac-empty {
        color: #6b7280;
        font-style: italic;
      }

      #auditorium-calendar .ac-error {
        margin-top: 12px;
        color: #b91c1c;
        font-weight: 700;
        white-space: pre-wrap;
      }

      #auditorium-calendar .ac-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.45);
        z-index: 9999;
        padding: 20px;
        align-items: center;
        justify-content: center;
      }

      #auditorium-calendar .ac-modal-open {
        display: flex;
      }

      #auditorium-calendar .ac-modal-box {
        background: #fff;
        width: 100%;
        max-width: 560px;
        border-radius: 18px;
        padding: 24px;
        position: relative;
        box-shadow: 0 20px 50px rgba(0,0,0,.2);
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

      #auditorium-calendar .ac-row {
        margin-bottom: 10px;
        line-height: 1.5;
      }

      #auditorium-calendar .ac-label {
        font-weight: 700;
      }

      @media (max-width: 980px) {
        #auditorium-calendar .ac-layout {
          grid-template-columns: 1fr;
        }

        #auditorium-calendar .ac-list {
          max-height: none;
        }
      }
    </style>

    <div class="ac-wrap">
      <div class="ac-top">
        <h2>Calendrier des réservations</h2>

        <div class="ac-controls">
          <button type="button" id="ac-prev">←</button>
          <button type="button" id="ac-today">Aujourd'hui</button>
          <button type="button" id="ac-next">→</button>
        </div>

        <div class="ac-filters">
          <button type="button" class="ac-filter ac-active" data-filter="all">Toutes</button>
          <button type="button" class="ac-filter" data-filter="accepted">Acceptées</button>
          <button type="button" class="ac-filter" data-filter="pending">En attente</button>
        </div>
      </div>

      <div class="ac-legend">
        <div><span class="ac-dot ac-dot-ok"></span>Réservation acceptée</div>
        <div><span class="ac-dot ac-dot-wait"></span>En attente</div>
      </div>

      <div class="ac-layout">
        <div class="ac-panel">
          <div id="ac-month" class="ac-month"></div>
          <div id="ac-grid" class="ac-grid"></div>
          <div id="ac-error" class="ac-error"></div>
        </div>

        <div class="ac-panel">
          <div class="ac-side-title">Liste des réservations</div>
          <div id="ac-list" class="ac-list"></div>
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
    $("ac-modal").classList.add("ac-modal-open");
  }

  function closeModal() {
    $("ac-modal").classList.remove("ac-modal-open");
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
        '<div class="ac-item-meta">' +
          '<div><strong>Date :</strong> ' + esc(formatDateFR(ev.start)) + '</div>' +
          '<div><strong>Heure :</strong> ' + esc(ev.heure) + '</div>' +
          '<div><strong>Durée :</strong> ' + esc(ev.duree || "Non précisée") + '</div>' +
          '<div><strong>Détails :</strong> ' + esc(ev.details || "—") + '</div>' +
        '</div>' +
        '<span class="ac-badge ' + (ev.cls === "ok" ? "ac-badge-ok" : "ac-badge-wait") + '">' + esc(ev.statut) + '</span>';

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

      const cell = document.createElement("div");
      cell.className = "ac-day" + (day.getMonth() !== month ? " ac-other" : "");

      const num = document.createElement("div");
      num.className = "ac-num";
      num.textContent = day.getDate();
      cell.appendChild(num);

      vis.filter(function (ev) {
        return ev.dateIso === iso;
      }).forEach(function (ev) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ac-event " + (ev.cls === "ok" ? "ac-event-ok" : "ac-event-wait");
        b.innerHTML = "<strong>" + esc(ev.heure) + "</strong> " + esc(ev.demandeur);
        b.onclick = function () {
          openModal(ev);
        };
        cell.appendChild(b);
      });

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
        b.classList.remove("ac-active");
      });
      btn.classList.add("ac-active");
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
