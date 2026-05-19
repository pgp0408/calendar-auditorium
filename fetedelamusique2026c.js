document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("fetedelamusique-calendar");
  if (!root) return;

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvqtHB3cJldM-RfnS6poGMa_wwbpjFDZp6RDEgGTAaHlsqMuuuPc6GgQGPIsC1EbwlnDTdgZtXeZnP/pub?output=csv";

  const START_DATE = "2026-06-15";
  const END_DATE = "2026-06-21";

  root.innerHTML = `
    <style>
      #fetedelamusique-calendar{
        --fdm-text:#111827;
        --fdm-muted:#6b7280;
        --fdm-border:#e5e7eb;
        --fdm-bg:#ffffff;
        --fdm-soft:#f8fafc;

        --fdm-blue:#2563eb;
        --fdm-purple:#7c3aed;
        --fdm-green:#16a34a;
        --fdm-orange:#f59e0b;
        --fdm-gray:#64748b;
        --fdm-red:#dc2626;

        font-family:Arial,sans-serif;
        color:var(--fdm-text);
        width:100%;
        max-width:100%;
      }

      #fetedelamusique-calendar *{
        box-sizing:border-box;
      }

      #fetedelamusique-calendar .fdm-card{
        max-width:1400px;
        margin:auto;
        background:#fff;
        border:1px solid var(--fdm-border);
        border-radius:24px;
        overflow:hidden;
        box-shadow:0 18px 40px rgba(0,0,0,.08);
      }

      #fetedelamusique-calendar .fdm-header{
        padding:32px;
        background:
          radial-gradient(circle at top right, rgba(37,99,235,.12), transparent 30%),
          radial-gradient(circle at top left, rgba(124,58,237,.12), transparent 28%),
          #fff;
        border-bottom:1px solid var(--fdm-border);
      }

      #fetedelamusique-calendar h2{
        margin:0;
        font-size:clamp(30px,4vw,48px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #fetedelamusique-calendar .fdm-subtitle{
        margin-top:10px;
        color:var(--fdm-muted);
        max-width:850px;
        line-height:1.5;
      }

      #fetedelamusique-calendar .fdm-filters{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:24px;
      }

      #fetedelamusique-calendar .fdm-filter{
        background:#fff;
        border:1px solid var(--fdm-border);
        border-radius:999px;
        padding:10px 14px;
        font-size:14px;
        font-weight:700;
        cursor:pointer;
      }

      #fetedelamusique-calendar .fdm-filter input{
        margin-right:6px;
      }

      #fetedelamusique-calendar .fdm-content{
        padding:24px;
      }

      #fetedelamusique-calendar .fdm-layout{
        display:grid;
        grid-template-columns:minmax(0,1fr) 360px;
        gap:22px;
      }

      #fetedelamusique-calendar .fdm-week{
        display:grid;
        grid-template-columns:repeat(7,minmax(0,1fr));
        gap:12px;
      }

      #fetedelamusique-calendar .fdm-day{
        background:#fff;
        border:1px solid var(--fdm-border);
        border-radius:20px;
        overflow:hidden;
        display:flex;
        flex-direction:column;
        min-height:520px;
      }

      #fetedelamusique-calendar .fdm-day-head{
        padding:14px;
        border-bottom:1px solid var(--fdm-border);
        background:#fafafa;
      }

      #fetedelamusique-calendar .fdm-day-name{
        font-weight:900;
        font-size:15px;
        text-transform:uppercase;
      }

      #fetedelamusique-calendar .fdm-day-date{
        margin-top:3px;
        color:var(--fdm-muted);
        font-size:13px;
        font-weight:700;
      }

      #fetedelamusique-calendar .fdm-day-events{
        padding:12px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      #fetedelamusique-calendar .fdm-event{
        border:0;
        width:100%;
        text-align:left;
        cursor:pointer;
        border-radius:16px;
        padding:12px;
        color:#fff;
        box-shadow:0 8px 20px rgba(0,0,0,.12);
      }

      #fetedelamusique-calendar .fdm-event:hover{
        transform:translateY(-2px);
      }

      #fetedelamusique-calendar .fdm-event.diffusion{
        background:var(--fdm-purple);
      }

      #fetedelamusique-calendar .fdm-event.pedagogique{
        background:var(--fdm-blue);
      }

      #fetedelamusique-calendar .fdm-event.partenaire{
        background:var(--fdm-green);
      }

      #fetedelamusique-calendar .fdm-event.interne{
        background:var(--fdm-orange);
        color:#111827;
      }

      #fetedelamusique-calendar .fdm-event.autre{
        background:var(--fdm-gray);
      }

      #fetedelamusique-calendar .fdm-event.pending{
        background:var(--fdm-red);
      }

      #fetedelamusique-calendar .fdm-event-time{
        display:block;
        font-size:12px;
        font-weight:900;
        margin-bottom:5px;
      }

      #fetedelamusique-calendar .fdm-event-title{
        display:block;
        font-size:14px;
        font-weight:900;
        line-height:1.25;
      }

      #fetedelamusique-calendar .fdm-event-place{
        display:block;
        margin-top:6px;
        font-size:12px;
        opacity:.9;
      }

      #fetedelamusique-calendar .fdm-side{
        border:1px solid var(--fdm-border);
        border-radius:22px;
        background:#fff;
        padding:18px;
        display:flex;
        flex-direction:column;
        gap:14px;
      }

      #fetedelamusique-calendar .fdm-side h3{
        margin:0;
        font-size:22px;
      }

      #fetedelamusique-calendar .fdm-list{
        display:flex;
        flex-direction:column;
        gap:12px;
        max-height:900px;
        overflow:auto;
      }

      #fetedelamusique-calendar .fdm-item{
        border:1px solid var(--fdm-border);
        border-left:6px solid #999;
        border-radius:18px;
        padding:14px;
        cursor:pointer;
        background:#fff;
      }

      #fetedelamusique-calendar .fdm-item.diffusion{
        border-left-color:var(--fdm-purple);
      }

      #fetedelamusique-calendar .fdm-item.pedagogique{
        border-left-color:var(--fdm-blue);
      }

      #fetedelamusique-calendar .fdm-item.partenaire{
        border-left-color:var(--fdm-green);
      }

      #fetedelamusique-calendar .fdm-item.interne{
        border-left-color:var(--fdm-orange);
      }

      #fetedelamusique-calendar .fdm-item.autre{
        border-left-color:var(--fdm-gray);
      }

      #fetedelamusique-calendar .fdm-item.pending{
        border-left-color:var(--fdm-red);
      }

      #fetedelamusique-calendar .fdm-item-title{
        font-weight:900;
        margin-bottom:8px;
      }

      #fetedelamusique-calendar .fdm-item-meta{
        font-size:14px;
        line-height:1.5;
        color:#4b5563;
      }

      #fetedelamusique-calendar .fdm-empty{
        border:1px dashed var(--fdm-border);
        border-radius:14px;
        padding:12px;
        color:var(--fdm-muted);
        font-style:italic;
      }

      #fetedelamusique-calendar .fdm-error{
        margin-top:16px;
        color:#b91c1c;
        font-weight:700;
      }

      #fetedelamusique-calendar .fdm-modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.55);
        z-index:9999;
        align-items:center;
        justify-content:center;
        padding:20px;
      }

      #fetedelamusique-calendar .fdm-modal.open{
        display:flex;
      }

      #fetedelamusique-calendar .fdm-modal-box{
        width:min(760px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:24px;
        padding:28px;
        position:relative;
      }

      #fetedelamusique-calendar .fdm-close{
        position:absolute;
        top:12px;
        right:14px;
        background:none;
        border:0;
        font-size:32px;
        cursor:pointer;
      }

      #fetedelamusique-calendar .fdm-modal-title{
        margin:0 40px 20px 0;
        font-size:30px;
        line-height:1.1;
      }

      #fetedelamusique-calendar .fdm-row{
        display:grid;
        grid-template-columns:160px 1fr;
        gap:14px;
        padding:10px 0;
        border-bottom:1px dashed var(--fdm-border);
      }

      #fetedelamusique-calendar .fdm-label{
        font-weight:900;
      }

      @media (max-width:1180px){
        #fetedelamusique-calendar .fdm-layout{
          grid-template-columns:1fr;
        }

        #fetedelamusique-calendar .fdm-week{
          grid-template-columns:repeat(2,minmax(0,1fr));
        }

        #fetedelamusique-calendar .fdm-day{
          min-height:340px;
        }
      }

      @media (max-width:760px){
        #fetedelamusique-calendar .fdm-week{
          grid-template-columns:1fr;
        }

        #fetedelamusique-calendar .fdm-row{
          grid-template-columns:1fr;
          gap:4px;
        }

        #fetedelamusique-calendar .fdm-header,
        #fetedelamusique-calendar .fdm-content{
          padding:18px;
        }
      }
    </style>

    <div class="fdm-card">
      <div class="fdm-header">
        <h2>Semaine inaugurale</h2>
        <p class="fdm-subtitle">
          Programmation concentrée du 15 au 21 juin 2026 — actions, projets et événements proposés dans le cadre de la semaine inaugurale.
        </p>

        <div class="fdm-filters">
          <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="diffusion" checked> Diffusion</label>
          <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="pedagogique" checked> Pédagogique</label>
          <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="partenaire" checked> Partenariat</label>
          <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="interne" checked> Interne</label>
          <label class="fdm-filter"><input type="checkbox" class="fdm-type-filter" value="autre" checked> Autre</label>
        </div>
      </div>

      <div class="fdm-content">
        <div class="fdm-layout">
          <div>
            <div id="fdm-week" class="fdm-week"></div>
            <div id="fdm-error" class="fdm-error"></div>
          </div>

          <aside class="fdm-side">
            <h3>Actions</h3>
            <div id="fdm-list" class="fdm-list"></div>
          </aside>
        </div>
      </div>
    </div>

    <div id="fdm-modal" class="fdm-modal">
      <div class="fdm-modal-box">
        <button id="fdm-close" class="fdm-close">&times;</button>

        <h3 id="fdm-m-title" class="fdm-modal-title"></h3>

        <div class="fdm-row">
          <div class="fdm-label">Référent</div>
          <div id="fdm-m-ref"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Type</div>
          <div id="fdm-m-type"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Lieu</div>
          <div id="fdm-m-place"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Date</div>
          <div id="fdm-m-date"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Heure</div>
          <div id="fdm-m-time"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Durée</div>
          <div id="fdm-m-duration"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Programme</div>
          <div id="fdm-m-program"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Organisation</div>
          <div id="fdm-m-orga"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Communication</div>
          <div id="fdm-m-com"></div>
        </div>

        <div class="fdm-row">
          <div class="fdm-label">Statut</div>
          <div id="fdm-m-status"></div>
        </div>
      </div>
    </div>
  `;

  let allEvents = [];

  function $(id){
    return document.getElementById(id);
  }

  function norm(v){
    return (v || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"");
  }

  function parseCSVLine(line){
    const result = [];
    let current = "";
    let inside = false;

    for(let i=0;i<line.length;i++){
      const char = line[i];
      const next = line[i+1];

      if(char === '"'){
        if(inside && next === '"'){
          current += '"';
          i++;
        }else{
          inside = !inside;
        }
      }else if(char === "," && !inside){
        result.push(current);
        current = "";
      }else{
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  function parseCSV(text){
    return text
      .replace(/\r/g,"")
      .trim()
      .split("\n")
      .map(parseCSVLine);
  }

  function findCol(headers, possibilities){
    const normalized = headers.map(h => norm(h));

    for(const p of possibilities){
      const n = norm(p);
      const exact = normalized.findIndex(h => h === n);
      if(exact !== -1) return exact;
    }

    for(const p of possibilities){
      const n = norm(p);
      const partial = normalized.findIndex(h => h.includes(n));
      if(partial !== -1) return partial;
    }

    return -1;
  }

  function parseDateFR(v){
    if(!v) return null;

    const txt = v.toString().trim();

    if(/^\d{4}-\d{2}-\d{2}$/.test(txt)){
      return txt;
    }

    const p = txt.split(/[\/.-]/);

    if(p.length !== 3) return null;

    let d = p[0];
    let m = p[1];
    let y = p[2];

    if(y.length === 2){
      y = "20" + y;
    }

    return y + "-" + String(m).padStart(2,"0") + "-" + String(d).padStart(2,"0");
  }

  function safeDate(dateIso){
    if(!dateIso) return new Date(NaN);

    const p = dateIso.split("-");

    return new Date(
      Number(p[0]),
      Number(p[1]) - 1,
      Number(p[2])
    );
  }

  function formatDateFR(dateIso){
    const d = safeDate(dateIso);

    if(isNaN(d.getTime())) return "Date invalide";

    return d.toLocaleDateString("fr-FR",{
      weekday:"long",
      day:"2-digit",
      month:"long",
      year:"numeric"
    });
  }

  function formatShortDate(dateIso){
    const d = safeDate(dateIso);

    if(isNaN(d.getTime())) return "";

    return d.toLocaleDateString("fr-FR",{
      day:"2-digit",
      month:"2-digit"
    });
  }

  function formatTime(v){
    if(!v) return "Non précisée";

    return v.toString().trim().slice(0,5);
  }

  function typeInfo(v){
    const s = norm(v);

    if(
      s.includes("diffusion") ||
      s.includes("concert") ||
      s.includes("spectacle")
    ){
      return { kind:"diffusion", label:"Diffusion" };
    }

    if(
      s.includes("pedagog") ||
      s.includes("atelier") ||
      s.includes("master")
    ){
      return { kind:"pedagogique", label:"Pédagogique" };
    }

    if(
      s.includes("parten")
    ){
      return { kind:"partenaire", label:"Partenariat" };
    }

    if(
      s.includes("interne") ||
      s.includes("reunion")
    ){
      return { kind:"interne", label:"Interne" };
    }

    return { kind:"autre", label:v || "Autre" };
  }

  function statusInfo(v){
    const s = norm(v);

    if(s.includes("attente")){
      return {
        kind:"pending",
        label:"En attente"
      };
    }

    if(
      s.includes("refuse") ||
      s.includes("report")
    ){
      return null;
    }

    return {
      kind:"accepted",
      label:"Validé"
    };
  }

  function selectedTypes(){
    return Array.from(
      root.querySelectorAll(".fdm-type-filter")
    )
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  function visibleEvents(){
    const selected = selectedTypes();

    return allEvents
      .filter(e => selected.includes(e.typeKind))
      .sort((a,b)=>{
        if(a.dateIso < b.dateIso) return -1;
        if(a.dateIso > b.dateIso) return 1;

        return String(a.time).localeCompare(String(b.time));
      });
  }

  function eventClass(ev){
    if(ev.statusKind === "pending"){
      return "pending";
    }

    return ev.typeKind || "autre";
  }

  function openModal(ev){
    $("fdm-m-title").textContent = ev.title || "";
    $("fdm-m-ref").textContent = ev.referent || "—";
    $("fdm-m-type").textContent = ev.typeLabel || "—";
    $("fdm-m-place").textContent = ev.place || "—";
    $("fdm-m-date").textContent = formatDateFR(ev.dateIso);
    $("fdm-m-time").textContent = ev.time || "—";
    $("fdm-m-duration").textContent = ev.duration || "—";
    $("fdm-m-program").textContent = ev.program || "—";
    $("fdm-m-orga").textContent = ev.organization || "—";
    $("fdm-m-com").textContent = ev.communication || "—";
    $("fdm-m-status").textContent = ev.statusLabel || "—";

    $("fdm-modal").classList.add("open");
  }

  function closeModal(){
    $("fdm-modal").classList.remove("open");
  }

  function renderWeek(){
    const week = $("fdm-week");
    week.innerHTML = "";

    const data = visibleEvents();

    const days = [
      { iso:"2026-06-15", label:"Lundi" },
      { iso:"2026-06-16", label:"Mardi" },
      { iso:"2026-06-17", label:"Mercredi" },
      { iso:"2026-06-18", label:"Jeudi" },
      { iso:"2026-06-19", label:"Vendredi" },
      { iso:"2026-06-20", label:"Samedi" },
      { iso:"2026-06-21", label:"Dimanche" }
    ];

    days.forEach(day=>{
      const dayEvents = data.filter(e => e.dateIso === day.iso);

      const col = document.createElement("div");
      col.className = "fdm-day";

      col.innerHTML = `
        <div class="fdm-day-head">
          <div class="fdm-day-name">${day.label}</div>
          <div class="fdm-day-date">${formatShortDate(day.iso)}</div>
        </div>

        <div class="fdm-day-events"></div>
      `;

      const wrap = col.querySelector(".fdm-day-events");

      if(!dayEvents.length){
        wrap.innerHTML = `
          <div class="fdm-empty">
            Aucun événement
          </div>
        `;
      }else{
        dayEvents.forEach(ev=>{
          const cls = eventClass(ev);

          const btn = document.createElement("button");

          btn.type = "button";
          btn.className = "fdm-event " + cls;

          btn.innerHTML = `
            <span class="fdm-event-time">${ev.time}</span>
            <span class="fdm-event-title">${ev.title}</span>
            <span class="fdm-event-place">${ev.place || ""}</span>
          `;

          btn.onclick = ()=>{
            openModal(ev);
          };

          wrap.appendChild(btn);
        });
      }

      week.appendChild(col);
    });
  }

  function renderList(){
    const list = $("fdm-list");

    const data = visibleEvents();

    list.innerHTML = "";

    if(!data.length){
      list.innerHTML = `
        <div class="fdm-empty">
          Aucun événement
        </div>
      `;
      return;
    }

    data.forEach(ev=>{
      const cls = eventClass(ev);

      const item = document.createElement("div");

      item.className = "fdm-item " + cls;

      item.innerHTML = `
        <div class="fdm-item-title">${ev.title}</div>

        <div class="fdm-item-meta">
          <div><strong>Date :</strong> ${formatDateFR(ev.dateIso)}</div>
          <div><strong>Heure :</strong> ${ev.time}</div>
          <div><strong>Lieu :</strong> ${ev.place || "—"}</div>
          <div><strong>Référent :</strong> ${ev.referent || "—"}</div>
        </div>
      `;

      item.onclick = ()=>{
        openModal(ev);
      };

      list.appendChild(item);
    });
  }

  function refresh(){
    renderWeek();
    renderList();
  }

  $("fdm-close").onclick = closeModal;

  $("fdm-modal").onclick = e=>{
    if(e.target === $("fdm-modal")){
      closeModal();
    }
  };

  root.querySelectorAll(".fdm-type-filter")
    .forEach(cb=>{
      cb.addEventListener("change",refresh);
    });

  fetch(CSV_URL)
    .then(r=>{
      if(!r.ok){
        throw new Error("HTTP " + r.status);
      }

      return r.text();
    })
    .then(text=>{
      const rows = parseCSV(text);

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const COL_TITLE = findCol(headers,[
        "Nom du projet",
        "Intitulé du Projet",
        "Projet"
      ]);

      const COL_REF = findCol(headers,[
        "Référent du Projet",
        "Referent",
        "Demandeur"
      ]);

      const COL_TYPE = findCol(headers,[
        "Type de projet",
        "Type"
      ]);

      const COL_PLACE = findCol(headers,[
        "Lieu",
        "Votre demande concerne"
      ]);

      const COL_DATE = findCol(headers,[
        "Date de représentation",
        "Date souhaitée",
        "Date"
      ]);

      const COL_TIME = findCol(headers,[
        "Heure de début",
        "Heure"
      ]);

      const COL_DURATION = findCol(headers,[
        "Durée"
      ]);

      const COL_PROGRAM = findCol(headers,[
        "Programme"
      ]);

      const COL_ORGA = findCol(headers,[
        "Organisation"
      ]);

      const COL_COM = findCol(headers,[
        "Communication"
      ]);

      const COL_VALIDATION = findCol(headers,[
        "Validation",
        "Statut"
      ]);

      allEvents = dataRows
        .map(row=>{
          const status = statusInfo(
            row[COL_VALIDATION]
          );

          if(!status) return null;

          const dateIso = parseDateFR(
            row[COL_DATE]
          );

          if(!dateIso) return null;

          if(
            dateIso < START_DATE ||
            dateIso > END_DATE
          ){
            return null;
          }

          const type = typeInfo(
            row[COL_TYPE]
          );

          return {
            title:
              row[COL_TITLE] ||
              "Action sans titre",

            referent:
              row[COL_REF] || "",

            typeKind:
              type.kind,

            typeLabel:
              type.label,

            place:
              row[COL_PLACE] || "",

            dateIso,

            time:
              formatTime(
                row[COL_TIME]
              ),

            duration:
              row[COL_DURATION] || "",

            program:
              row[COL_PROGRAM] || "",

            organization:
              row[COL_ORGA] || "",

            communication:
              row[COL_COM] || "",

            statusKind:
              status.kind,

            statusLabel:
              status.label
          };
        })
        .filter(Boolean);

      refresh();

      if(!allEvents.length){
        $("fdm-error").textContent =
          "Aucune action trouvée entre le 15 et le 21 juin 2026.";
      }
    })
    .catch(err=>{
      $("fdm-error").textContent =
        "Erreur lors du chargement : " + err.message;
    });
});
