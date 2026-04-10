document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("auditorium-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvqtHB3cJldM-RfnS6poGMa_wwbpjFDZp6RDEgGTAaHlsqMuuuPc6GgQGPIsC1EbwlnDTdgZtXeZnP/pub?output=csv";

  root.innerHTML = `
    <div style="max-width:1100px;margin:auto;font-family:Arial">
      <h2>Calendrier des réservations</h2>
      <div id="cal"></div>
    </div>
  `;

  function parseCSV(text) {
    return text.trim().split("\n").map(l => l.split(","));
  }

  function normalize(v) {
    return (v || "").toLowerCase();
  }

  function parseDateFR(v) {
    const [d, m, y] = v.split("/");
    return `${y}-${m}-${d}`;
  }

  fetch(CSV_URL)
    .then(r => r.text())
    .then(text => {
      const rows = parseCSV(text).slice(1);

      const events = rows.map(r => {
        const status = normalize(r[7]);

        if (!status.includes("accept") && !status.includes("attente")) return null;

        return {
          date: parseDateFR(r[2]),
          demandeur: r[1],
          heure: r[3],
          statut: r[7]
        };
      }).filter(Boolean);

      render(events);
    });

  function render(events) {
    const cal = document.getElementById("cal");

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7;

    let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">`;

    const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
    days.forEach(d => html += `<div style="font-weight:bold">${d}</div>`);

    for (let i = 0; i < 42; i++) {
      const d = new Date(year, month, 1 - startDay + i);
      const iso = d.toISOString().slice(0,10);

      const dayEvents = events.filter(e => e.date === iso);

      html += `<div style="border:1px solid #ddd;min-height:80px;padding:4px">`;
      html += `<div><strong>${d.getDate()}</strong></div>`;

      dayEvents.forEach(ev => {
        const color = ev.statut.toLowerCase().includes("accept") ? "#16a34a" : "#f59e0b";

        html += `<div style="background:${color};color:#fff;padding:3px;margin-top:3px;border-radius:4px;font-size:12px">
          ${ev.heure} ${ev.demandeur}
        </div>`;
      });

      html += `</div>`;
    }

    html += `</div>`;

    cal.innerHTML = html;
  }
});
