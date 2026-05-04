document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("proaja-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQasSMsDEytgSX9dgxLRx1KIOYtsGDNx4jBD_v25_57jbR9n00LHnr9qFMXCiv6oN1OYwR-EEaQ_cbl/pub?output=csv";

  root.innerHTML = `<div id="pc-grid"></div><div id="pc-error"></div>`;

  function norm(v) {
    return (v || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function parseCSV(text) {
    return text.trim().split("\n").map(l => l.split(","));
  }

  function findCol(headers, name) {
    const n = norm(name);
    return headers.findIndex(h => norm(h).includes(n));
  }

  function parseDateFR(v) {
    if (!v) return null;
    const p = v.split("/");
    return p[2] + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0");
  }

  function formatDateFR(d) {
    return new Date(d).toLocaleDateString("fr-FR");
  }

  function statusInfo(v) {
    const s = norm(v);

    if (s.includes("acceptee") || s.includes("valide")) {
      return { kind: "accepted", label: "Validé" };
    }

    if (s.includes("attente")) {
      return { kind: "pending", label: "En attente" };
    }

    return null;
  }

  function getSpace(v) {
    const s = norm(v);
    if (s.includes("auditorium")) return "auditorium";
    if (s.includes("orchestre")) return "orchestre";
    return "autre";
  }

  fetch(CSV_URL)
    .then(r => r.text())
    .then(text => {
      const rows = parseCSV(text);
      const headers = rows[0];
      const data = rows.slice(1);

      const COL_DEMANDEUR = findCol(headers, "demandeur");
      const COL_PROJET = findCol(headers, "projet");
      const COL_DATE = findCol(headers, "date");
      const COL_HEURE = findCol(headers, "heure");
      const COL_VALIDATION = findCol(headers, "validation");
      const COL_CONCERNE = findCol(headers, "concerne");

      if ([COL_DEMANDEUR, COL_DATE, COL_VALIDATION].some(i => i === -1)) {
        document.getElementById("pc-error").textContent = "Colonnes non trouvées";
        return;
      }

      const events = data
        .map(r => {
          const status = statusInfo(r[COL_VALIDATION]);
          if (!status) return null;

          return {
            demandeur: r[COL_DEMANDEUR],
            projet: r[COL_PROJET],
            date: parseDateFR(r[COL_DATE]),
            heure: r[COL_HEURE],
            status: status.label,
            space: getSpace(r[COL_CONCERNE])
          };
        })
        .filter(Boolean);

      render(events);
    });

  function render(events) {
    const el = document.getElementById("pc-grid");

    let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">`;

    const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
    days.forEach(d => html += `<div style="font-weight:bold">${d}</div>`);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7;

    for (let i = 0; i < 42; i++) {
      const d = new Date(year, month, 1 - startDay + i);
      const iso = d.toISOString().slice(0,10);

      const dayEvents = events.filter(e => e.date === iso);

      html += `<div style="border:1px solid #ddd;min-height:80px;padding:4px">`;
      html += `<strong>${d.getDate()}</strong>`;

      dayEvents.forEach(ev => {
        let color = "#7c3aed";

        if (ev.status === "En attente") color = "#f59e0b";
        else if (ev.space === "auditorium") color = "#16a34a";
        else if (ev.space === "orchestre") color = "#2563eb";

        html += `<div style="background:${color};color:#fff;padding:3px;margin-top:3px;border-radius:4px;font-size:12px">
          ${ev.heure} ${ev.projet || ev.demandeur}
        </div>`;
      });

      html += `</div>`;
    }

    html += `</div>`;
    el.innerHTML = html;
  }
});
