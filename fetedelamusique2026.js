document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("fetedelamusique-calendar");
  if (!root) return;

  const XLSX_URL = "https://crd20-my.sharepoint.com/:x:/g/personal/pg_poggioli_crd_corsica/IQASLjnNEKf-SpPINn2yuWDTAUMSSj0LGaxyN1Fc2RJWj8Y?download=1";

  const START_DATE = "2026-06-15";
  const END_DATE = "2026-06-21";

  root.innerHTML = `
    <style>
      #fetedelamusique-calendar {
        --fdm-text:#111827;
        --fdm-muted:#6b7280;
        --fdm-border:#e5e7eb;
        --fdm-soft:#f8fafc;
        --fdm-shadow:0 18px 50px rgba(15,23,42,.08);
        --fdm-blue:#2563eb;
        --fdm-purple:#7c3aed;
        --fdm-green:#16a34a;
        --fdm-orange:#f59e0b;
        --fdm-red:#dc2626;
        --fdm-gray:#64748b;
        font-family:Arial,sans-serif;
        color:var(--fdm-text);
        width:100%;
        max-width:100%;
        overflow-x:hidden;
      }

      #fetedelamusique-calendar * { box-sizing:border-box; }

      #fetedelamusique-calendar .fdm-card {
        width:100%;
        max-width:1380px;
        margin:0 auto;
        background:#fff;
        border:1px solid var(--fdm-border);
        border-radius:24px;
        box-shadow:var(--fdm-shadow);
        overflow:hidden;
      }

      #fetedelamusique-calendar .fdm-header {
        padding:34px 32px 26px;
        background:
          radial-gradient(circle at top right, rgba(37,99,235,.14), transparent 30%),
          radial-gradient(circle at top left, rgba(124,58,237,.12), transparent 28%),
          linear-gradient(180deg,#fff,#fbfcff);
        border-bottom:1px solid var(--fdm-border);
      }

      #fetedelamusique-calendar .fdm-header-main {
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        gap:24px;
        align-items:start;
      }

      #fetedelamusique-calendar h2 {
        margin:0;
        font-size:clamp(28px,4vw,44px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #fetedelamusique-calendar .fdm-subtitle {
        margin:10px 0 0;
        color:var(--fdm-muted);
        font-size:16px;
        line-height:1.5;
        max-width:760px;
      }

      #fetedelamusique-calendar .fdm-actions {
        display:flex;
        flex-direction:column;
        gap:12px;
        align-items:flex-end;
      }

      #fetedelamusique-calendar .fdm-filterbar {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      #fetedelamusique-calendar .fdm-filter {
        appearance:none;
        border:1px solid #d1d5db;
        background:#fff;
        color:#111827;
        border-radius:999px;
        padding:10px 14px;
        cursor:pointer;
        font-size:14px;
        font-weight:800;
        line-height:1;
        transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
      }

      #fetedelamusique-calendar .fdm-filter:hover {
        background:#f9fafb;
        transform:translateY(-1px);
        box-shadow:0 8px 20px rgba(15,23,42,.08);
      }

      #fetedelamusique-calendar .fdm-filter input {
        margin-right:6px;
        transform:translateY(1px);
      }

      #fetedelamusique-calendar .fdm-legend {
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:20px;
      }

      #fetedelamusique-calendar .fdm-pill {
        display:inline-flex;
        align-items:center;
        gap:8px;
        border:1px solid rgba(229,231,235,.95);
        background:rgba(255,255,255,.88);
        border-radius:999px;
        padding:8px 12px;
        font-size:13px;
        font-weight:800;
        color:#374151;
      }

      #fetedelamusique-calendar .fdm-dot {
        width:11px;
        height:11px;
        border-radius:999px;
        display:inline-block;
      }

      #fetedelamusique-calendar .fdm-dot.diffusion { background:var(--fdm-purple); }
      #fetedelamusique-calendar .fdm-dot.pedagogique { background:var(--fdm-blue); }
      #fetedelamusique-calendar .fdm-dot.partenaire { background:var(--fdm-green); }
      #fetedelamusique-calendar .fdm-dot.interne { background:var(--fdm-orange); }
      #fetedelamusique-calendar .fdm-dot.autre { background:var(--fdm-gray); }
      #fetedelamusique-calendar .fdm-dot.pending { background:var(--fdm-red); }

      #fetedelamusique-calendar .fdm-content {
        padding:26px;
      }

      #fetedelamusique-calendar .fdm-summary {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:12px;
        margin-bottom:20px;
      }

      #fetedelamusique-calendar .fdm-stat {
        border:1px solid var(--fdm-border);
        background:#fff;
        border-radius:18px;
        padding:16px;
      }

      #fetedelamusique-calendar .fdm-stat-number {
        font-size:28px;
        font-weight:900;
        line-height:1;
      }

      #fetedelamusique-calendar .fdm-stat-label {
        margin-top:6px;
        color:var(--fdm-muted);
        font-size:13px;
        font-weight:800;
      }

      #fetedelamusique-calendar .fdm-layout {
        display:grid;
        grid-template-columns:minmax(0,1fr) 380px;
        gap:22px;
        align-items:start;
      }

      #fetedelamusique-calendar .fdm-week-panel,
      #fetedelamusique-calendar .fdm-list-panel {
        min-width:0;
        border:1px solid var(--fdm-border);
        background:#fff;
        border-radius:22px;
        padding:18px;
      }

      #fetedelamusique-calendar .fdm-list-panel {
        position:sticky;
        top:16px;
        max-height:calc(100vh - 32px);
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }

      #fetedelamusique-calendar .fdm-panel-head,
      #fetedelamusique-calendar .fdm-list-head {
        display:flex;
        justify-content:space-between;
        align-items:baseline;
        gap:12px;
        margin-bottom:16px;
      }

      #fetedelamusique-calendar .fdm-panel-title,
      #fetedelamusique-calendar .fdm-list-head h3 {
        margin:0;
        font-size:22px;
        font-weight:900;
        letter-spacing:-.02em;
      }

      #fetedelamusique-calendar .fdm-count {
        color:var(--fdm-muted);
        font-size:13px;
        font-weight:800;
        white-space:nowrap;
      }

      #fetedelamusique-calendar .fdm-week {
        display:grid;
        grid-template-columns:repeat(7,minmax(0,1fr));
        gap:10px;
      }

      #fetedelamusique-calendar .fdm-day {
        min-width:0;
        min-height:520px;
        border:1px solid #e7eaee;
        border-radius:18px;
        background:#fbfcfd;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }

      #fetedelamusique-calendar .fdm-day-head {
        padding:12px;
        background:#fff;
        border-bottom:1px solid #eef0f3;
      }

      #fetedelamusique-calendar .fdm-day-name {
        font-weight:900;
        font-size:14px;
        text-transform:uppercase;
        letter-spacing:.03em;
      }

      #fetedelamusique-calendar .fdm-day-date {
        margin-top:3px;
        color:var(--fdm-muted);
        font-size:13px;
        font-weight:800;
      }

      #fetedelamusique-calendar .fdm-day-count {
        margin-top:8px;
        display:inline-flex;
        background:#f1f5f9;
        color:#475569;
        border-radius:999px;
        padding:4px 8px;
        font-size:12px;
        font-weight:900;
      }

      #fetedelamusique-calendar .fdm-day-events {
        padding:10px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      #fetedelamusique-calendar .fdm-event {
        border:0;
        width:100%;
        cursor:pointer;
        text-align:left;
        border-radius:16px;
        padding:12px;
        color:#fff;
        box-shadow:0 10px 22px rgba(15,23,42,.10);
        transition:transform .15s ease, box-shadow .15s ease;
      }

      #fetedelamusique-calendar .fdm-event:hover {
        transform:translateY(-2px);
        box-shadow:0 14px 28px rgba(15,23,42,.16);
      }

      #fetedelamusique-calendar .fdm-event.diffusion { background:var(--fdm-purple); }
      #fetedelamusique-calendar .fdm-event.pedagogique { background:var(--fdm-blue); }
      #fetedelamusique-calendar .fdm-event.partenaire { background:var(--fdm-green); }
      #fetedelamusique-calendar .fdm-event.interne { background:var(--fdm-orange); color:#111827; }
      #fetedelamusique-calendar .fdm-event.autre { background:var(--fdm-gray); }
      #fetedelamusique-calendar .fdm-event.pending { background:var(--fdm-red); }

      #fetedelamusique-calendar .fdm-event-time {
        display:block;
        font-size:12px;
        font-weight:900;
        opacity:.95;
        margin-bottom:5px;
      }

      #fetedelamusique-calendar .fdm-event-title {
        display:block;
        font-size:14px;
        font-weight:900;
        line-height:1.25;
      }

      #fetedelamusique-calendar .fdm-event-meta {
        display:block;
        margin-top:6px;
        font-size:12px;
        line-height:1.35;
        opacity:.9;
      }

      #fetedelamusique-calendar .fdm-list {
        overflow-y:auto;
        padding-right:4px;
        display:flex;
        flex-direction:column;
        gap:12px;
      }

      #fetedelamusique-calendar .fdm-item {
        border:1px solid #e7eaee;
        border-left:7px solid #9ca3af;
        border-radius:18px;
        padding:14px;
        background:#fbfbfc;
        cursor:pointer;
        transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
      }

      #fetedelamusique-calendar .fdm-item:hover {
        background:#fff;
        transform:translateY(-1px);
        box-shadow:0 10px 24px rgba(15,23,42,.08);
      }

      #fetedelamusique-calendar .fdm-item.diffusion { border-left-color:var(--fdm-purple); }
      #fetedelamusique-calendar .fdm-item.pedagogique { border-left-color:var(--fdm-blue); }
      #fetedelamusique-calendar .fdm-item.partenaire { border-left-color:var(--fdm-green); }
      #fetedelamusique-calendar .fdm-item.interne { border-left-color:var(--fdm-orange); }
      #fetedelamusique-calendar .fdm-item.autre { border-left-color:var(--fdm-gray); }
      #fetedelamusique-calendar .fdm-item.pending { border-left-color:var(--fdm-red); }

      #fetedelamusique-calendar .fdm-item-title {
        font-weight:900;
        margin-bottom:7px;
      }

      #fetedelamusique-calendar .fdm-item-details {
        font-size:14px;
        line-height:1.48;
        color:#4b5563;
      }

      #fetedelamusique-calendar .fdm-badges {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:10px;
      }

      #fetedelamusique-calendar .fdm-badge {
        display:inline-flex;
        align-items:center;
        border-radius:999px;
        padding:5px 9px;
        font-size:12px;
        font-weight:900;
        color:#fff;
      }

      #fetedelamusique-calendar .fdm-badge.diffusion { background:var(--fdm-purple); }
      #fetedelamusique-calendar .fdm-badge.pedagogique { background:var(--fdm-blue); }
      #fetedelamusique-calendar .fdm-badge.partenaire { background:var(--fdm-green); }
      #fetedelamusique-calendar .fdm-badge.interne { background:var(--fdm-orange); color:#111827; }
      #fetedelamusique-calendar .fdm-badge.autre { background:var(--fdm-gray); }
      #fetedelamusique-calendar .fdm-badge.pending { background:var(--fdm-red); }

      #fetedelamusique-calendar .fdm-empty {
        color:var(--fdm-muted);
        font-style:italic;
        padding:12px;
        border:1px dashed #d1d5db;
        border-radius:14px;
        background:#f9fafb;
      }

      #fetedelamusique-calendar .fdm-error {
        margin-top:14px;
        color:#b91c1c;
        font-weight:800;
        white-space:pre-wrap;
      }

      #fetedelamusique-calendar .fdm-modal {
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:9999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #fetedelamusique-calendar .fdm-modal.open { display:flex; }

      #fetedelamusique-calendar .fdm-modal-box {
        width:min(720px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #fetedelamusique-calendar .fdm-close {
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #fetedelamusique-calendar .fdm-modal-title {
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.14;
        font-weight:900;
      }

      #fetedelamusique-calendar .fdm-row {
        display:grid;
        grid-template-columns:150px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #fetedelamusique-calendar .fdm-row:last-child { border-bottom:0; }
      #fetedelamusique-calendar .fdm-label { font-weight:900; }

      @media (max-width:1180px) {
        #fetedelamusique-calendar .fdm-layout { grid-template-columns:1fr; }
        #fetedelamusique-calendar .fdm-list-panel {
          position:static;
          max-height:none;
        }
        #fetedelamusique-calendar .fdm-list {
          max-height:none;
          overflow:visible;
        }
        #fetedelamusique-calendar .fdm-week {
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
        #fetedelamusique-calendar .fdm-day {
          min-height:320px;
        }
      }

      @media (max-width:760px) {
        #fetedelamusique-calendar .fdm-header,
        #fetedelamusique-calendar .fdm-content { padding:18px; }

        #fetedelamusique-calendar .fdm-header-main { grid-template-columns:1fr; }
        #fetedelamusique-calendar .fdm-actions { align-items:stretch; }
        #fetedelamusique-calendar .fdm-filterbar { justify-content:flex-start; }

        #fetedelamusique-calendar .fdm-filter {
          width:100%;
          text-align:left;
        }

        #fetedelamusique-calendar .fdm-summary {
          grid-template-columns:repeat(2,minmax(0,1fr));
        }

        #fetedelamusique-calendar .fdm-week {
          grid-template-columns:1fr;
        }

        #fetedelamusique-calendar .fdm-day {
          min-height:auto;
        }

        #fetedelamusique-calendar .fdm-row {
          grid-template-columns:1fr;
          gap:4px;
        }
      }

      @media (max-width:480px) {
        #fetedelamusique-calendar .fdm-card { border-radius:16px; }
        #fetedelamusique-calendar .fdm-week-panel,
        #fetedelamusique-calendar .fdm-list-panel {
          padding:12px;
          border-radius:16px;
        }
        #fetedelamusique-calendar .fdm-summary {
          grid-template-columns:1fr;
        }
      }
    </style>

    <div class="fdm-card">
      <div class="fdm-header">
        <div class="fdm-header-main">
          <div>
            <h2>Semaine inaugurale</h2>
            <p class="fdm-subtitle">Programmation concentrée du 15 au 21 juin 2026 — projets, actions et événements proposés.</p>
          </div>

          <div class="fdm-actions">
            <div class="fdm-filterbar">
              <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="diffusion" checked> Diffusion</label>
              <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="pedagogique" checked> Pédagogique</label>
              <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="partenaire" checked> Partenariat</label>
              <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="interne" checked> Interne</label>
              <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="autre" checked> Autre</label>
            </div>
          </div>
        </div>

        <div class="fdm-legend">
          <span class="fdm-pill"><span class="fdm-dot diffusion"></span>Diffusion</span>
          <span class="fdm-pill"><span class="fdm-dot pedagogique"></span>Pédagogique</span>
          <span class="fdm-pill"><span class="fdm-dot partenaire"></span>Partenariat</span>
          <span class="fdm-pill"><span class="fdm-dot interne"></span>Interne</span>
          <span class="fdm-pill"><span class="fdm-dot autre"></span>Autre</span>
          <span class="fdm-pill"><span class="fdm-dot pending"></span>En attente</span>
        </div>
      </div>

      <div class="fdm-content">
        <div class="fdm-summary">
          <div class="fdm-stat"><div id="fdm-stat-total" class="fdm-stat-number">0</div><div class="fdm-stat-label">actions affichées</div></div>
          <div class="fdm-stat"><div id="fdm-stat-days" class="fdm-stat-number">7</div><div class="fdm-stat-label">jours concernés</div></div>
          <div class="fdm-stat"><div id="fdm-stat-accepted" class="fdm-stat-number">0</div><div class="fdm-stat-label">validées</div></div>
          <div class="fdm-stat"><div id="fdm-stat-pending" class="fdm-stat-number">0</div><div class="fdm-stat-label">en attente</div></div>
        </div>

        <div class="fdm-layout">
          <section class="fdm-week-panel">
            <div class="fdm-panel-head">
              <h3 class="fdm-panel-title">Du 15 au 21 juin 2026</h3>
              <div id="fdm-count" class="fdm-count"></div>
            </div>
            <div id="fdm-week" class="fdm-week"></div>
            <div id="fdm-error" class="fdm-error"></div>
          </section>

          <aside class="fdm-list-panel">
            <div class="fdm-list-head">
              <h3>Actions</h3>
              <span id="fdm-list-count" class="fdm-count"></span>
            </div>
            <div id="fdm-list" class="fdm-list"></div>
          </aside>
        </div>
      </div>
    </div>

    <div id="fdm-modal" class="fdm-modal">
      <div class="fdm-modal-box">
        <button type="button" id="fdm-close" class="fdm-close">&times;</button>
        <h3 id="fdm-m-title" class="fdm-modal-title">Action</h3>
        <div class="fdm-row"><span class="fdm-label">Référent</span><span id="fdm-m-ref"></span></div>
        <div class="fdm-row"><span class="fdm-label">Type</span><span id="fdm-m-type"></span></div>
        <div class="fdm-row"><span class="fdm-label">Lieu</span><span id="fdm-m-place"></span></div>
        <div class="fdm-row"><span class="fdm-label">Date</span><span id="fdm-m-date"></span></div>
        <div class="fdm-row"><span class="fdm-label">Heure</span><span id="fdm-m-time"></span></div>
        <div class="fdm-row"><span class="fdm-label">Durée</span><span id="fdm-m-duration"></span></div>
        <div class="fdm-row"><span class="fdm-label">Programme</span><span id="fdm-m-program"></span></div>
        <div class="fdm-row"><span class="fdm-label">Organisation</span><span id="fdm-m-orga"></span></div>
        <div class="fdm-row"><span class="fdm-label">Communication</span><span id="fdm-m-com"></span></div>
        <div class="fdm-row"><span class="fdm-label">Statut</span><span id="fdm-m-status"></span></div>
      </div>
    </div>
  `;

  let allEvents = [];

  function $(id) { return document.getElementById(id); }

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
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function excelDateToISO(value) {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.getFullYear() + "-" + String(value.getMonth() + 1).padStart(2, "0") + "-" + String(value.getDate()).padStart(2, "0");
    }

    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return null;
      return parsed.y + "-" + String(parsed.m).padStart(2, "0") + "-" + String(parsed.d).padStart(2, "0");
    }

    const txt = value.toString().trim();

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
      month: "long",
      year: "numeric"
    });
  }

  function formatShortDate(dateIso) {
    const d = safeDate(dateIso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit" });
  }

  function formatTime(v) {
    if (v === null || v === undefined || v === "") return "Non précisée";

    if (typeof v === "number") {
      const totalMinutes = Math.round(v * 24 * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    }

    const txt = v.toString().trim();
    if (/^\d{1,2}:\d{2}/.test(txt)) return txt.slice(0, 5);
    return txt;
  }

  function typeInfo(v) {
    const s = norm(v);

    if (s.includes("diffusion") || s.includes("concert") || s.includes("spectacle")) return { kind:"diffusion", label:"Diffusion" };
    if (s.includes("pedagog") || s.includes("atelier") || s.includes("master") || s.includes("classe")) return { kind:"pedagogique", label:"Pédagogique" };
    if (s.includes("parten") || s.includes("assoc") || s.includes("exterieur")) return { kind:"partenaire", label:"Partenariat" };
    if (s.includes("interne") || s.includes("reunion") || s.includes("logistique")) return { kind:"interne", label:"Interne" };

    return { kind:"autre", label:v || "Autre" };
  }

  function statusInfo(v) {
    const s = norm(v);

    if (s.includes("attente")) return { kind:"pending", label:"En attente" };
    if (s.includes("refuse") || s.includes("report")) return null;
    if (s.includes("valide") || s.includes("accepte") || s.includes("oui")) return { kind:"accepted", label:"Validé" };

    return { kind:"accepted", label:"À traiter" };
  }

  function eventClass(ev) {
    if (ev.statusKind === "pending") return "pending";
    return ev.typeKind || "autre";
  }

  function selectedTypes() {
    return Array.from(root.querySelectorAll(".fdm-type-filter"))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function visibleEvents() {
    const selected = selectedTypes();
    return allEvents
      .filter(e => selected.includes(e.typeKind))
      .sort((a,b) => {
        const da = safeDate(a.dateIso);
        const db = safeDate(b.dateIso);
        if (da - db !== 0) return da - db;
        return String(a.time || "").localeCompare(String(b.time || ""));
      });
  }

  function isInWeek(dateIso) {
    return dateIso >= START_DATE && dateIso <= END_DATE;
  }

  function openModal(ev) {
    $("fdm-m-title").textContent = ev.title || "Action";
    $("fdm-m-ref").textContent = ev.referent || "—";
    $("fdm-m-type").textContent = ev.typeLabel || "—";
    $("fdm-m-place").textContent = ev.place || "—";
    $("fdm-m-date").textContent = formatDateFR(ev.dateIso);
    $("fdm-m-time").textContent = ev.time || "Non précisée";
    $("fdm-m-duration").textContent = ev.duration || "Non précisée";
    $("fdm-m-program").textContent = ev.program || "—";
    $("fdm-m-orga").textContent = ev.organization || "—";
    $("fdm-m-com").textContent = ev.communication || "—";
    $("fdm-m-status").textContent = ev.statusLabel || "—";
    $("fdm-modal").classList.add("open");
  }

  function closeModal() {
    $("fdm-modal").classList.remove("open");
  }

  function renderStats(data) {
    $("fdm-stat-total").textContent = data.length;
    $("fdm-stat-accepted").textContent = data.filter(e => e.statusKind === "accepted").length;
    $("fdm-stat-pending").textContent = data.filter(e => e.statusKind === "pending").length;
    $("fdm-count").textContent = data.length > 1 ? data.length + " actions" : data.length + " action";
    $("fdm-list-count").textContent = data.length > 1 ? data.length + " éléments" : data.length + " élément";
  }

  function renderWeek() {
    const weekEl = $("fdm-week");
    const data = visibleEvents();
    renderStats(data);
    weekEl.innerHTML = "";

    const dayLabels = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(2026, 5, 15 + i);
      const iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const dayEvents = data.filter(ev => ev.dateIso === iso);

      const day = document.createElement("section");
      day.className = "fdm-day";
      day.innerHTML =
        '<div class="fdm-day-head">' +
          '<div><div class="fdm-day-name">' + dayLabels[i] + '</div>' +
          '<div class="fdm-day-date">' + formatShortDate(iso) + '</div></div>' +
          '<span class="fdm-day-count">' + dayEvents.length + '</span>' +
        '</div>' +
        '<div class="fdm-day-events"></div>';

      const eventsWrap = day.querySelector(".fdm-day-events");

      if (!dayEvents.length) {
        eventsWrap.innerHTML = '<div class="fdm-empty">Aucune action renseignée.</div>';
      } else {
        dayEvents.forEach(ev => {
          const cls = eventClass(ev);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "fdm-event " + cls;
          btn.innerHTML =
            '<span class="fdm-event-time">' + esc(ev.time) + '</span>' +
            '<span class="fdm-event-title">' + esc(ev.title) + '</span>' +
            '<span class="fdm-event-meta">' + esc(ev.place || ev.typeLabel || "") + '</span>';
          btn.onclick = () => openModal(ev);
          eventsWrap.appendChild(btn);
        });
      }

      weekEl.appendChild(day);
    }
  }

  function renderList() {
    const list = $("fdm-list");
    const data = visibleEvents();
    list.innerHTML = "";

    if (!data.length) {
      list.innerHTML = '<div class="fdm-empty">Aucune action à afficher avec ces filtres.</div>';
      return;
    }

    data.forEach(ev => {
      const cls = eventClass(ev);
      const item = document.createElement("div");
      item.className = "fdm-item " + cls;
      item.innerHTML =
        '<div class="fdm-item-title">' + esc(ev.title) + '</div>' +
        '<div class="fdm-item-details">' +
          '<div><strong>Date :</strong> ' + esc(formatDateFR(ev.dateIso)) + '</div>' +
          '<div><strong>Heure :</strong> ' + esc(ev.time) + '</div>' +
          '<div><strong>Lieu :</strong> ' + esc(ev.place || "—") + '</div>' +
          '<div><strong>Référent :</strong> ' + esc(ev.referent || "—") + '</div>' +
        '</div>' +
        '<div class="fdm-badges">' +
          '<span class="fdm-badge ' + cls + '">' + esc(ev.statusLabel) + '</span>' +
          '<span class="fdm-badge ' + ev.typeKind + '">' + esc(ev.typeLabel) + '</span>' +
        '</div>';

      item.onclick = () => openModal(ev);
      list.appendChild(item);
    });
  }

  function refresh() {
    renderWeek();
    renderList();
  }

  function findValue(row, names) {
    const keys = Object.keys(row);
    const normalizedKeys = keys.map(k => ({ original:k, normalized:norm(k) }));

    for (const name of names) {
      const n = norm(name);
      const exact = normalizedKeys.find(k => k.normalized === n);
      if (exact) return row[exact.original];
    }

    for (const name of names) {
      const n = norm(name);
      const partial = normalizedKeys.find(k => k.normalized.includes(n));
      if (partial) return row[partial.original];
    }

    return "";
  }

  function loadData() {
    if (typeof XLSX === "undefined") {
      $("fdm-error").textContent = "La librairie XLSX n'est pas chargée. Vérifie la balise script SheetJS.";
      return;
    }

    fetch(XLSX_URL)
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.arrayBuffer();
      })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type:"array", cellDates:true });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval:"" });

        allEvents = rows.map(row => {
          const title = findValue(row, ["Intitulé du Projet", "Intitule du Projet", "Nom du projet", "Projet"]);
          const referent = findValue(row, ["Référent du Projet", "Referent du Projet", "Référent", "Referent", "Demandeur"]);
          const typeRaw = findValue(row, ["Type de projet", "Type"]);
          const place = findValue(row, ["Lieu", "Votre demande concerne", "Espace"]);
          const dateRaw = findValue(row, ["Date de représentation", "Date souhaitée", "Date", "Date souhaitée (1er jour du projet)"]);
          const timeRaw = findValue(row, ["Heure de début", "Heure"]);
          const duration = findValue(row, ["Durée", "Duree"]);
          const program = findValue(row, ["Programme"]);
          const organization = findValue(row, ["Organisation"]);
          const communication = findValue(row, ["Communication"]);
          const validation = findValue(row, ["Validation", "VALIDATION", "Statut"]);

          const dateIso = excelDateToISO(dateRaw);
          if (!dateIso || !isInWeek(dateIso)) return null;

          const status = statusInfo(validation);
          if (!status) return null;

          const type = typeInfo(typeRaw || title);

          return {
            title: title || "Action sans titre",
            referent,
            typeKind: type.kind,
            typeLabel: type.label,
            place,
            dateIso,
            time: formatTime(timeRaw),
            duration,
            program,
            organization,
            communication,
            statusKind: status.kind,
            statusLabel: status.label
          };
        }).filter(Boolean);

        refresh();

        if (!allEvents.length) {
          $("fdm-error").textContent = "Aucune action trouvée pour la semaine du 15 au 21 juin 2026.";
        }
      })
      .catch(err => {
        $("fdm-error").textContent = "Erreur lors du chargement : " + err.message;
      });
  }

  $("fdm-close").onclick = closeModal;
  $("fdm-modal").onclick = e => { if (e.target === $("fdm-modal")) closeModal(); };

  root.querySelectorAll(".fdm-type-filter").forEach(cb => {
    cb.addEventListener("change", refresh);
  });

  loadData();
});
