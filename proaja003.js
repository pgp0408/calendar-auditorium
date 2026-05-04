document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("proaja-calendar");
  if (!root) return;

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQasSMsDEytgSX9dgxLRx1KIOYtsGDNx4jBD_v25_57jbR9n00LHnr9qFMXCiv6oN1OYwR-EEaQ_cbl/pub?output=csv";

  root.innerHTML = `
    <style>
      #proaja-calendar {font-family:Arial,sans-serif;max-width:1200px;margin:auto}
      .pc-grid {display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
      .pc-day {border:1px solid #ddd;border-radius:10px;padding:6px;min-height:90px}
      .pc-head {font-weight:bold;margin-bottom:4px}
      .pc-event {font-size:12px;padding:4px;border-radius:6px;margin-top:4px;color:#fff}
      .auditorium{background:#16a34a}
      .orchestre{background:#2563eb}
      .autre{background:#7c3aed}
      .pending{background:#f59e0b;color:#000}
    </style>

    <h2>Calendrier des projets</h2>
    <div id="pc-grid" class="pc-grid"></div>
    <div id="pc-error" style="color:red"></div>
  `;

  function norm(v){
    return (v||"").toString().toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }

  function parseCSV(text){
    return text.trim().split("\n").map(l=>l.split(","));
  }

  function findCol(headers,name){
    return headers.findIndex(h=>norm(h).includes(norm(name)));
  }

  function parseDate(v){
    if(!v)return null;
    const p=v.split("/");
    if(p.length!==3)return null;
    return `${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`;
  }

  function statusInfo(v){
    const s=norm(v);
    if(s.includes("accepte")||s.includes("valide"))return "accepted";
    if(s.includes("attente"))return "pending";
    return null;
  }

  function getSpace(v){
    const s=norm(v);
    if(s.includes("auditorium"))return "auditorium";
    if(s.includes("orchestre"))return "orchestre";
    return "autre";
  }

  fetch(CSV_URL)
    .then(r=>r.text())
    .then(text=>{
      const rows=parseCSV(text);
      const headers=rows[0];
      const data=rows.slice(1);

      const COL_DEM=findCol(headers,"demandeur");
      const COL_PROJ=findCol(headers,"projet");
      const COL_DATE=findCol(headers,"date");
      const COL_HEURE=findCol(headers,"heure");
      const COL_VAL=findCol(headers,"validation");
      const COL_CONC=findCol(headers,"concerne");

      if([COL_DEM,COL_DATE,COL_VAL].includes(-1)){
        document.getElementById("pc-error").textContent="Colonnes introuvables";
        return;
      }

      const events=data.map(r=>{
        const status=statusInfo(r[COL_VAL]);
        if(!status)return null;

        return {
          date:parseDate(r[COL_DATE]),
          heure:r[COL_HEURE],
          titre:r[COL_PROJ]||r[COL_DEM],
          space:getSpace(r[COL_CONC]),
          status
        };
      }).filter(Boolean);

      render(events);
    });

  function render(events){
    const grid=document.getElementById("pc-grid");

    const today=new Date();
    const year=today.getFullYear();
    const month=today.getMonth();

    const first=new Date(year,month,1);
    const startDay=(first.getDay()+6)%7;

    const days=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
    let html="";

    days.forEach(d=>html+=`<div class="pc-head">${d}</div>`);

    for(let i=0;i<42;i++){
      const d=new Date(year,month,1-startDay+i);
      const iso=d.toISOString().slice(0,10);

      const evs=events.filter(e=>e.date===iso);

      html+=`<div class="pc-day"><div>${d.getDate()}</div>`;

      evs.forEach(e=>{
        let cls=e.space;
        if(e.status==="pending")cls="pending";

        html+=`<div class="pc-event ${cls}">
          ${e.heure} ${e.titre}
        </div>`;
      });

      html+=`</div>`;
    }

    grid.innerHTML=html;
  }
});
