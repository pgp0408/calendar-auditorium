document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("auditorium-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvqtHB3cJldM-RfnS6poGMa_wwbpjFDZp6RDEgGTAaHlsqMuuuPc6GgQGPIsC1EbwlnDTdgZtXeZnP/pub?output=csv";

  root.innerHTML = `
    <div style="max-width:1100px;margin:auto;font-family:Arial,sans-serif">
      <h2>Calendrier des réservations</h2>
      <div id="cal-error" style="color:#b91c1c;font-weight:bold;margin-bottom:12px;"></div>
      <div id="cal"></div>
    </div>
  `;

  function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  function parseCSV(text) {
    return text.trim().split(/\r?\n/).map(parseCSVLine);
  }

  function normalize(v) {
    return (v || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function parseDateFR(v) {
    if (!v) return null;
    const parts = v.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  fetch(CSV_URL)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(text => {
      const rows = parseCSV(text).slice(1);

      const events = rows.map(r => {
        const status = normalize(r[7]);

        if (!status.includes("accept") && !status.includes("attente")) return null;

        return {
          date: parseDateFR(r[2]),
          demandeur: r[1] || "",
          heure: r[3] || "",
          statut: r[7] || ""
        };
      }).filter(e => e && e.date);

      render(events);
    })
    .catch(err => {
      document.getElementById("cal-error").textContent = "Erreur : " + err.message;
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
    days.forEach(d => {
      html += `<div style="font-weight:bold;padding:6px 4px;background:#f3f4f6;border-radius:6px">${d}</div>`;
    });

    for (let i = 0; i < 42; i++) {
      const d = new Date(year, month, 1 - startDay + i);
      const iso = d.toISOString().slice(0, 10);

      const dayEvents = events.filter(e => e.date === iso);

      html += `<div style="border:1px solid #ddd;min-height:90px;padding:6px;border-radius:8px;background:${d.getMonth() === month ? "#fff" : "#f9fafb"}">`;
      html += `<div style="font-weight:bold;margin-bottom:6px">${d.getDate()}</div>`;

      dayEvents.forEach(ev => {
        const color = normalize(ev.statut).includes("accept") ? "#16a34a" : "#f59e0b";
        const textColor = normalize(ev.statut).includes("accept") ? "#fff" : "#111827";

        html += `
          <div style="background:${color};color:${textColor};padding:4px 6px;margin-top:4px;border-radius:6px;font-size:12px;line-height:1.3">
            ${ev.heure} ${ev.demandeur}
          </div>
        `;
      });

      html += `</div>`;
    }

    html += `</div>`;
    cal.innerHTML = html;
  }
});
