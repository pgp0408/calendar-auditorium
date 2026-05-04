document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("auditorium-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvqtHB3cJldM-RfnS6poGMa_wwbpjFDZp6RDEgGTAaHlsqMuuuPc6GgQGPIsC1EbwlnDTdgZtXeZnP/pub?output=csv";

  root.innerHTML = `
    <style>
      #auditorium-calendar{font-family:Arial,sans-serif;color:#1f2937}
      #auditorium-calendar *{box-sizing:border-box}
      #auditorium-calendar .ac-card{max-width:1320px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:22px;box-shadow:0 14px 40px rgba(15,23,42,.08);overflow:hidden}
      #auditorium-calendar .ac-head{padding:26px;border-bottom:1px solid #eef0f3;background:#fbfcfd}
      #auditorium-calendar .ac-top{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;align-items:flex-start}
      #auditorium-calendar h2{margin:0;font-size:30px;line-height:1.1}
      #auditorium-calendar .ac-sub{margin:8px 0 0;color:#6b7280;font-size:15px}
      #auditorium-calendar .ac-controls,.ac-checks{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:flex-end}
      #auditorium-calendar button{border:1px solid #d1d5db;background:#fff;border-radius:999px;padding:10px 14px;cursor:pointer;font-weight:700}
      #auditorium-calendar button:hover{background:#f9fafb}
      #auditorium-calendar .ac-check{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:9px 12px;font-size:14px}
      #auditorium-calendar .ac-check input{width:16px;height:16px}
      #auditorium-calendar .ac-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;font-size:14px}
      #auditorium-calendar .ac-dot{width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:6px}
      #auditorium-calendar .auditorium{background:#16a34a}
      #auditorium-calendar .orchestre{background:#2563eb}
      #auditorium-calendar .autre{background:#7c3aed}
      #auditorium-calendar .pending{background:#f59e0b;color:#111827}
      #auditorium-calendar .ac-body{padding:24px}
      #auditorium-calendar .ac-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(300px,.95fr);gap:22px}
      #auditorium-calendar .ac-panel{border:1px solid #e7eaee;border-radius:18px;padding:18px;background:#fff}
      #auditorium-calendar .ac-month{font-size:24px;font-weight:800;margin:0 0 14px}
      #auditorium-calendar .ac-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
      #auditorium-calendar .ac-weekday{background:#f3f5f7;border-radius:10px;padding:10px 6px;text-align:center;font-weight:700;font-size:13px}
      #auditorium-calendar .ac-day{min-height:122px;border:1px solid #e7eaee;border-radius:14px;padding:8px;background:#fff}
      #auditorium-calendar .ac-other{background:#f9fafb;opacity:.55}
      #auditorium-calendar .ac-today{border-color:#93c5fd;box-shadow:inset 0 0 0 1px #bfdbfe}
      #auditorium-calendar .ac-num{font-weight:800;font-size:14px;margin-bottom:6px}
      #auditorium-calendar .ac-event{display:block;width:100%;border:0;border-radius:10px;padding:7px 8px;margin-bottom:6px;color:#fff;font-size:12px;text-align:left;line-height:1.3;cursor:pointer}
      #auditorium-calendar .ac-event.auditorium{background:#16a34a}
      #auditorium-calendar .ac-event.orchestre{background:#2563eb}
      #auditorium-calendar .ac-event.autre{background:#7c3aed}
      #auditorium-calendar .ac-event.pending{background:#f59e0b;color:#111827}
      #auditorium-calendar .ac-time{font-weight:800;display:block}
      #auditorium-calendar .ac-list{display:flex;flex-direction:column;gap:12px;max-height:760px;overflow:auto}
      #auditorium-calendar .ac-item{border:1px solid #e7eaee;border-left:6px solid #9ca3af;border-radius:16px;padding:14px;background:#fafafa;cursor:pointer}
      #auditorium-calendar .ac-item.auditorium{border-left-color:#16a34a}
      #auditorium-calendar .ac-item.orchestre{border-left-color:#2563eb}
      #auditorium-calendar .ac-item.autre{border-left-color:#7c3aed}
      #auditorium-calendar .ac-item.pending{border-left-color:#f59e0b}
      #auditorium-calendar .ac-item-title{font-weight:800;margin-bottom:6px}
      #auditorium-calendar .ac-item-details{font-size:14px;line-height:1.5;color:#4b5563}
      #auditorium-calendar .ac-badge{display:inline-block;margin-top:10px;margin-right:6px;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:800;color:#fff}
      #auditorium-calendar .ac-badge.auditorium{background:#16a34a}
      #auditorium-calendar .ac-badge.orchestre{background:#2563eb}
      #auditorium-calendar .ac-badge.autre{background:#7c3aed}
      #auditorium-calendar .ac-badge.pending{background:#f59e0b;color:#111827}
      #auditorium-calendar .ac-error{margin-top:14px;color:#b91c1c;font-weight:700;white-space:pre-wrap}
      #auditorium-calendar .ac-empty{color:#6b7280;font-style:italic}
      #auditorium-calendar .ac-modal{display:none;position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:9999;padding:20px;align-items:center;justify-content:center}
      #auditorium-calendar .ac-modal.open{display:flex}
      #auditorium-calendar .ac-modal-box{background:#fff;width:100%;max-width:620px;border-radius:22px;padding:24px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.18)}
      #auditorium-calendar .ac-close{position:absolute;top:12px;right:14px;border:0;background:transparent;font-size:28px;cursor:pointer}
      #auditorium-calendar .ac-row{margin-bottom:12px;line-height:1.5}
      #auditorium-calendar .ac-label{font-weight:800}
      @media(max-width:1100px){#auditorium-calendar .ac-layout{grid-template-columns:1fr}#auditorium-calendar .ac-list{max-height:none}}
      @media(max-width:760px){#auditorium-calendar .ac-head{padding:22px 18px}#auditorium-calendar .ac-body{padding:16px}#auditorium-calendar h2{font-size:24px}#auditorium-calendar .ac-grid{gap:6px}#auditorium-calendar .ac-day{min-height:96px;padding:6px}#auditorium-calendar .ac-event{font-size:11px;padding:6px}}
      @media(max-width:520px){#auditorium-calendar .ac-card{border-radius:16px}#auditorium-calendar .ac-checks{width:100%}#auditorium-calendar .ac-check{width:100%}#auditorium-calendar .ac-event-label{display:none}}
    </style>

    <div class="ac-card">
      <div class="ac-head">
        <div class="ac-top">
          <div>
            <h2>Calendrier des réservations</h2>
            <p class="ac-sub">Réservations acceptées et demandes en attente, classées par espace.</p>
          </div>

          <div>
            <div class="ac-controls">
              <button type="button" id="ac-prev">←</button>
              <button type="button" id="ac-today">Aujourd'hui</button>
              <button type="button" id="ac-next">→</button>
            </div>

            <div class="ac-checks" style="margin-top:10px">
              <label class="ac-check"><input type="checkbox" class="ac-space-filter" value="auditorium" checked> Auditorium</label>
              <label class="ac-check"><input type="checkbox" class="ac-space-filter" value="orchestre" checked> Salle d'orchestre</label>
              <label class="ac-check"><input type="checkbox" class="ac-space-filter" value="autre" checked> Autre</label>
            </div>
          </div>
        </div>

        <div class="ac-legend">
          <div><span class="ac-dot auditorium"></span>Auditorium accepté</div>
          <div><span class="ac-dot orchestre"></span>Salle d'orchestre acceptée</div>
          <div><span class="ac-dot autre"></span>Autre accepté</div>
          <div><span class="ac-dot pending"></span>En attente</div>
        </div>
      </div>

      <div class="ac-body">
        <div class="ac-layout">
          <div class="ac-panel">
            <div id="ac-month" class="ac-month"></div>
            <div id="ac-grid" class="ac-grid"></div>
            <div id="ac-error" class="ac-error"></div>
          </div>

          <div class="ac-panel">
            <h3 style="margin-top:0">Liste des réservations</h3>
            <div id="ac-list" class="ac-list"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="ac-modal" class="ac-modal">
      <div class="ac-modal-box">
        <button type="button" id="ac-close" class="ac-close">&times;</button>
        <h3 id="ac-m-title">Réservation</h3>
        <div class="ac-row"><span class="ac-label">Demandeur :</span> <span id="ac-m-dem"></span></div>
        <div class="ac-row"><span class="ac-label">Espace :</span> <span id="ac-m-space"></span></div>
        <div class="ac-row"><span class="ac-label">Date :</span> <span id="ac-m-date"></span></div>
        <div class="ac-row"><span class="ac-label">Heure :</span> <span id="ac-m-time"></span></div>
        <div class="ac-row"><span class="ac-label">Durée :</span> <span id="ac-m-dur"></span></div>
        <div class="ac-row"><span class="ac-label">Détails :</span> <span id="ac-m-det"></span></div>
        <div class="ac-row"><span class="ac-label">Statut :</span> <span id="ac-m-status"></span></div>
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
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  function parseCSVLine(line) {
    const res = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (ch === '"') {
        if (q && next === '"') { cur += '"'; i++; }
        else q = !q;
      } else if (ch === "," && !q) {
        res.push(cur); cur = "";
      } else cur += ch;
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
      const index = normalizedHeaders.findIndex(h => h.includes(np));
      if (index !== -1) return index;
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
    const p = dateIso.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function formatDateFR(dateIso) {
    if (!dateIso) return "Date non précisée";
    const d = safeDate(dateIso);
    if (isNaN(d.getTime())) return "Date invalide : " + dateIso;

    return d.toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
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
    const data = visibleEvents().sort((a,b) => safeDate(a.dateIso) - safeDate(b.dateIso));
    el.innerHTML = "";

    if (!data.length) {
      el.innerHTML = '<div class="ac-empty">Aucune réservation à afficher.</div>';
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
        '<span class="ac-badge ' + cls + '">' + esc(ev.statusLabel) + '</span>' +
        '<span class="ac-badge ' + ev.space + '">' + esc(ev.spaceLabel) + '</span>';

      item.onclick = () => openModal(ev);
      el.appendChild(item);
    });
  }

  function renderCalendar() {
    const grid = $("ac-grid");
    const months = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
    const weekdays = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    const vis = visibleEvents();
    const today = new Date();

    $("ac-month").textContent = months[month] + " " + year;
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

      const iso = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
      const isToday = day.toDateString() === today.toDateString();

      const cell = document.createElement("div");
      cell.className = "ac-day" + (day.getMonth() !== month ? " ac-other" : "") + (isToday ? " ac-today" : "");

      const num = document.createElement("div");
      num.className = "ac-num";
      num.textContent = day.getDate();
      cell.appendChild(num);

      vis.filter(ev => ev.dateIso === iso).forEach(ev => {
        const cls = eventClass(ev);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ac-event " + cls;
        b.innerHTML = '<span class="ac-time">' + esc(ev.heure) + '</span><span class="ac-event-label">' + esc(ev.demandeur) + '</span>';
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

  $("ac-prev").onclick = () => { currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); refresh(); };
  $("ac-next").onclick = () => { currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1); refresh(); };
  $("ac-today").onclick = () => { currentDate = new Date(); refresh(); };
  $("ac-close").onclick = closeModal;
  $("ac-modal").onclick = e => { if (e.target === $("ac-modal")) closeModal(); };

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
