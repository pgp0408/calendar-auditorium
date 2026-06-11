(function () {
  // V39 PATCH STATS ONLY - a charger APRES le JS public fonctionnel actuel.
  // Objectif : ne toucher qu'aux 3 encarts statistiques, sans modifier le panier ni les cartes.
  const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";
  const DEMANDES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";
  const SCHOOL_BLOCK_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];

  let cachedMetrics = null;
  let rendering = false;
  let observerStarted = false;

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function norm(v) {
    return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    text = String(text || "");
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (ch === '"') {
        if (q && next === '"') { cell += '"'; i++; }
        else q = !q;
      } else if (ch === "," && !q) {
        row.push(cell); cell = "";
      } else if ((ch === "\n" || ch === "\r") && !q) {
        if (ch === "\r" && next === "\n") i++;
        row.push(cell); cell = "";
        if (row.some(v => String(v).trim() !== "")) rows.push(row);
        row = [];
      } else cell += ch;
    }
    row.push(cell);
    if (row.some(v => String(v).trim() !== "")) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map(h => String(h || "").trim());
    return rows.map((r, i) => {
      const o = { __line: i + 2 };
      headers.forEach((h, j) => o[h] = r[j] || "");
      return o;
    });
  }

  function get(row, names) {
    if (!row || !names) return "";
    const keys = Object.keys(row);
    for (const n of names) {
      if (row[n] !== undefined && row[n] !== null && String(row[n]).trim() !== "") return String(row[n]).trim();
    }
    const wanted = names.map(norm).filter(Boolean);
    for (const key of keys) {
      const nk = norm(key);
      if (wanted.includes(nk) && String(row[key] || "").trim() !== "") return String(row[key]).trim();
    }
    for (const key of keys) {
      const nk = norm(key);
      if (wanted.some(w => nk.includes(w) || w.includes(nk)) && String(row[key] || "").trim() !== "") return String(row[key]).trim();
    }
    return "";
  }

  function numberFrom(v) {
    const m = String(v || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function minutes(v) {
    const raw = String(v || "").trim().toLowerCase().replace(/\s+/g, "").replace("h", ":");
    let m = raw.match(/^(\d{1,2}):(\d{2})/);
    if (m) return Math.max(0, Math.min(1439, parseInt(m[1], 10) * 60 + parseInt(m[2], 10)));
    m = raw.match(/^(\d{1,2})(\d{2})$/);
    if (m) return Math.max(0, Math.min(1439, parseInt(m[1], 10) * 60 + parseInt(m[2], 10)));
    m = raw.match(/^(\d{1,2})$/);
    if (m) return Math.max(0, Math.min(1439, parseInt(m[1], 10) * 60));
    return null;
  }

  function showTime(v) {
    const m = minutes(v);
    if (m === null) return "Horaire";
    return String(Math.floor(m / 60)).padStart(2, "0") + "h" + String(m % 60).padStart(2, "0");
  }

  function formatDate(iso) {
    const labels = {
      "2026-06-15": "Lundi 15 juin",
      "2026-06-16": "Mardi 16 juin",
      "2026-06-17": "Mercredi 17 juin",
      "2026-06-18": "Jeudi 18 juin",
      "2026-06-19": "Vendredi 19 juin",
      "2026-06-20": "Samedi 20 juin",
      "2026-06-21": "Dimanche 21 juin"
    };
    return labels[iso] || iso || "Date";
  }

  function overlapsWindow(slot, a, b) {
    const s = minutes(slot && slot.start), e = minutes(slot && slot.end);
    if (s === null || e === null) return false;
    return s < b && a < e;
  }

  function isPublicVisible(slot) {
    if (!slot || !SCHOOL_BLOCK_DAYS.includes(slot.dateIso)) return true;
    return !(overlapsWindow(slot, 8 * 60, 12 * 60) || overlapsWindow(slot, 14 * 60, 17 * 60));
  }

  function isConfirmed(row) {
    const s = norm(get(row, ["VALIDATION CRD", "Validation CRD", "STATUT CRD", "Statut CRD", "Statut"]));
    if (s.includes("annul") || s.includes("refus") || s === "non") return false;
    return s === "oui" || s.includes("confirm") || s.includes("valid");
  }

  function splitReservationIds(raw) {
    return String(raw || "").split(/[;\n]+/).map(x => x.trim()).filter(Boolean);
  }

  function countPeopleFromRow(row) {
    const rawIds = get(row, ["IDs créneaux", "IDs creneaux", "ID créneau", "ID creneau"]);
    let maxFromIds = 0;
    splitReservationIds(rawIds).forEach(id => {
      const parts = String(id || "").split("|").map(x => x.trim());
      const students = numberFrom(parts[6] || "");
      const adults = numberFrom(parts[7] || "");
      if (students || adults) maxFromIds = Math.max(maxFromIds, students + adults);
    });
    if (maxFromIds) return maxFromIds;
    const students = numberFrom(get(row, ["Nombre d’élèves", "Nombre d'eleves", "Nombre d'élèves", "Élèves", "Eleves", "Participants", "Nombre de participants"]));
    const adults = numberFrom(get(row, ["Accompagnateurs", "Adultes", "Nombre d’accompagnateurs", "Nombre d'accompagnateurs"]));
    return students + adults;
  }

  function peakMoments(slots, limit) {
    const map = {};
    (slots || []).forEach(slot => {
      const total = Number(slot.totalReserved || 0);
      if (!total) return;
      const key = [slot.dateIso, showTime(slot.start)].join("|");
      if (!map[key]) map[key] = { key, dateIso: slot.dateIso, start: slot.start, total: 0, count: 0 };
      map[key].total += total;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limit || 3);
  }

  function computeFromDebug(demandRows) {
    const debug = window.JPO_PUBLIC_DEBUG || {};
    const slots = Array.isArray(debug.slots) ? debug.slots : [];
    const publicSlots = slots.filter(isPublicVisible);
    const allReservedSlots = slots.filter(s => Number(s.totalReserved || 0) > 0);
    const placesReservedFromSlots = slots.reduce((sum, s) => sum + Number(s.totalReserved || 0), 0);
    const publicProposals = publicSlots.length;
    const totalSlots = slots.length || 282;

    const confirmedRows = (demandRows || []).filter(isConfirmed);
    const uniqueGroups = new Set();
    let uniquePeople = 0;
    confirmedRows.forEach((row, i) => {
      const school = get(row, ["Établissement", "Etablissement", "Nom de l’établissement", "Nom de l'etablissement", "Structure", "École", "Ecole"]);
      const group = get(row, ["Classe / groupe", "Classe", "Groupe", "Niveau", "Nom du groupe"]);
      const fallback = get(row, ["Email", "Adresse email", "Téléphone", "Telephone"]) || ("ligne-" + i);
      uniqueGroups.add(norm([school, group, fallback].filter(Boolean).join("|")) || ("ligne-" + i));
      uniquePeople += countPeopleFromRow(row);
    });

    const peaks = peakMoments(slots, 3);
    return {
      placesReserved: placesReservedFromSlots || uniquePeople,
      groupsClasses: uniqueGroups.size || confirmedRows.length,
      uniquePeople: uniquePeople || placesReservedFromSlots,
      reservedSlotsShown: allReservedSlots.length,
      totalSlots,
      publicProposals,
      schoolProposals: Math.max(0, totalSlots - publicProposals),
      confirmedReservations: confirmedRows.length,
      peaks,
      maxPeak: peaks.length ? peaks[0].total : 0
    };
  }

  function renderStatsPatch(metrics) {
    const box = document.getElementById("jpo-public-stats");
    if (!box || !metrics) return;
    rendering = true;
    box.innerHTML =
      '<div class="stat statgroup"><div class="stat-title">Décompte des publics</div><div class="stat-main"><div class="num">' + metrics.placesReserved + '</div><span>places réservées</span></div><div class="mini"><div><b>' + metrics.groupsClasses + '</b><span>groupes/classes écoles</span></div><div><b>' + metrics.uniquePeople + '</b><span>individus uniques estimés</span></div><div><b>' + metrics.reservedSlotsShown + '</b><span>créneaux réservés affichés</span></div><div><b>&nbsp;</b><span>&nbsp;</span></div></div></div>' +
      '<div class="stat statgroup"><div class="stat-title">Autres chiffres clefs</div><div class="stat-main"><div class="num">' + metrics.totalSlots + '</div><span>créneaux proposés</span></div><div class="mini"><div><b>' + metrics.publicProposals + '</b><span>propositions tout public</span></div><div><b>' + metrics.schoolProposals + '</b><span>propositions dédiées aux scolaires</span></div><div><b>' + metrics.confirmedReservations + '</b><span>réservations confirmées</span></div><div><b>&nbsp;</b><span>&nbsp;</span></div></div></div>' +
      '<div class="stat statgroup"><div class="stat-title">Pics d’affluence</div><div class="stat-main"><div class="num">' + metrics.maxPeak + '</div><span>personnes réservées au plus fort</span></div><div class="peaklist">' + (metrics.peaks.length ? metrics.peaks.map(p => '<button type="button" class="peakbtn">' + esc(formatDate(p.dateIso)) + ' · ' + esc(showTime(p.start)) + ' — ' + p.total + ' pers. (' + p.count + ' créneau(x))</button>').join("") : '<div class="lab">Aucune réservation enregistrée.</div>') + '</div></div>';
    window.setTimeout(() => { rendering = false; }, 0);
  }

  function installObserver() {
    if (observerStarted) return;
    const box = document.getElementById("jpo-public-stats");
    if (!box) return;
    observerStarted = true;
    const obs = new MutationObserver(() => {
      if (rendering || !cachedMetrics) return;
      window.setTimeout(() => renderStatsPatch(cachedMetrics), 0);
    });
    obs.observe(box, { childList: true, subtree: false });
  }

  function refresh() {
    if (!(window.JPO_PUBLIC_DEBUG && Array.isArray(window.JPO_PUBLIC_DEBUG.slots))) return false;
    Promise.all([
      fetch(DEMANDES_CSV).then(r => r && r.ok ? r.text() : "").catch(() => "")
    ]).then(([demText]) => {
      const demandRows = parseCSV(demText || "");
      cachedMetrics = computeFromDebug(demandRows);
      renderStatsPatch(cachedMetrics);
      installObserver();
      window.JPO_PUBLIC_STATS_PATCH = { metrics: cachedMetrics, demandRowsCount: demandRows.length };
    });
    return true;
  }

  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    if (refresh() || tries > 30) window.clearInterval(timer);
  }, 500);
})();
