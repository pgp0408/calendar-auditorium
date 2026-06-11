(function () {
  // V21 : reprise de la source partenaires fournie, avec contacts, réservations tout public, demi-journée, pics cliquables et démarrage robuste.
  function initJpoPartenaires() {
    let root = document.getElementById("jpo-partenaires") || document.getElementById("jpopartenaires") || document.getElementById("jpo_partenaires") || document.getElementById("semainejpo-partenaires");
    if (!root) {
      root = document.createElement("div");
      root.id = "jpo-partenaires";
      document.body.appendChild(root);
    }

    const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";
    const DEMANDES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";
    const PUBLIC_RESERVATIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQW1bMZzHG6eX8uFh3OSKx_RLEDeK1TySVyxfG1fRTMhDc5H5Ys67qtOT0GvuBUZhxFfOjswgf2Q1bC/pub?gid=1847062844&single=true&output=csv";
    const AFFLUENCE_THRESHOLD = 20;
    const PARALLEL_PUBLIC_MIN = 2;

    const DAYS = [
      { iso: "2026-06-15", label: "Lundi 15 juin" },
      { iso: "2026-06-16", label: "Mardi 16 juin" },
      { iso: "2026-06-17", label: "Mercredi 17 juin" },
      { iso: "2026-06-18", label: "Jeudi 18 juin" },
      { iso: "2026-06-19", label: "Vendredi 19 juin" },
      { iso: "2026-06-20", label: "Samedi 20 juin" },
      { iso: "2026-06-21", label: "Dimanche 21 juin" }
    ];
    const AUTO_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
    const AUTO_SLOTS = [["09:00", "10:00"], ["10:00", "11:00"], ["11:00", "12:00"], ["14:00", "15:00"], ["15:00", "16:00"], ["16:00", "17:00"]];

    let allSlots = [];
    let activeDay = "all";
    let activePeriod = "all";
    let activeMode = "all";
    let searchTerm = "";
    let publicStats = { rows: 0, confirmedRows: 0, pendingRows: 0, cancelledRows: 0 };

    root.innerHTML = `
      <style>
        #jpo-partenaires{--text:#111827;--muted:#64748b;--border:#e5e7eb;font-family:Arial,sans-serif;color:var(--text);width:100%}#jpo-partenaires *{box-sizing:border-box}
        #jpo-partenaires .wrap{max-width:1120px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
        #jpo-partenaires .head{padding:30px;background:radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),#fff;border-bottom:1px solid var(--border)}
        #jpo-partenaires h2{margin:0;font-size:clamp(28px,4vw,42px);line-height:1.05;letter-spacing:-.04em}
        #jpo-partenaires .sub{margin:12px 0 0;color:var(--muted);font-size:16px;line-height:1.55;max-width:930px;font-weight:750}
        #jpo-partenaires .intro{margin-top:18px;border:1px solid #dbeafe;background:#eff6ff;color:#1e3a8a;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:800}
        #jpo-partenaires .contactbox{margin-top:14px;border:1px solid #bbf7d0;background:#f0fdf4;color:#14532d;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:850}
        #jpo-partenaires .contactbox strong{display:block;margin-bottom:5px;color:#166534}#jpo-partenaires .contact-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}
        #jpo-partenaires .contact-actions a{text-decoration:none;border-radius:999px;padding:8px 10px;font-size:13px;font-weight:950}#jpo-partenaires .contact-actions .mail{background:#166534;color:#fff}#jpo-partenaires .contact-actions .phone{border:1px solid #86efac;background:#fff;color:#166534}
        #jpo-partenaires .content{padding:22px}#jpo-partenaires .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:16px}#jpo-partenaires .stat{border:1px solid var(--border);border-radius:18px;padding:14px;background:#fff;display:flex;flex-direction:column;gap:10px}.num{font-size:34px;font-weight:900}.lab{margin-top:5px;color:#64748b;font-size:12px;font-weight:900;line-height:1.3}
        #jpo-partenaires .stat-title{font-size:13px;font-weight:950;text-transform:uppercase;letter-spacing:.02em}.stat-main{display:flex;gap:8px;align-items:baseline}.stat-main span{font-size:12px;color:#64748b;font-weight:900}.mini{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.mini div{border:1px solid #e5e7eb;background:#f8fafc;border-radius:12px;padding:8px}.mini b{display:block;font-size:18px}.mini span{display:block;margin-top:2px;font-size:11px;color:#64748b;font-weight:900;line-height:1.2}
        #jpo-partenaires .peaklist{display:grid;gap:6px}.peakbtn{border:1px solid #fde68a;background:#fffbeb;color:#78350f;border-radius:12px;padding:8px;text-align:left;font-size:12px;font-weight:900;cursor:pointer}
        #jpo-partenaires .toolbar{display:grid;grid-template-columns:1.4fr .9fr .9fr 1fr;gap:10px;margin-bottom:18px;align-items:end}#jpo-partenaires label{display:block;font-size:12px;color:#475569;font-weight:900;margin-bottom:5px;text-transform:uppercase}#jpo-partenaires select,#jpo-partenaires input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:11px;font-size:14px;font-weight:800;background:#fff}
        #jpo-partenaires .section{margin-bottom:22px;border:1px solid var(--border);border-radius:24px;overflow:hidden;background:#fff}.sectionhead{padding:17px 18px;background:#f8fafc;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.sectiontitle{font-size:23px;font-weight:900;letter-spacing:-.035em;text-transform:uppercase}.sectionmeta{margin-top:4px;color:#64748b;font-size:13px;font-weight:850;line-height:1.4}.badge{border-radius:999px;background:#e2e8f0;color:#334155;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}.body{padding:14px}.timegroup{margin-bottom:14px;border:1px solid #e7eaee;border-radius:20px;overflow:hidden}.timehead{padding:13px 15px;background:#fbfcfd;border-bottom:1px solid #edf0f3;display:flex;justify-content:space-between;gap:10px;align-items:center}.time{font-size:19px;font-weight:900}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;padding:12px}.card{border:1px solid var(--border);border-radius:20px;overflow:hidden;background:#fff}.card.strong{border-color:#fbbf24;background:linear-gradient(180deg,#fffbeb 0,#fff 76%)}.top{padding:14px;background:#fbfcfd;border-bottom:1px solid #edf0f3}.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px}.chip{border-radius:999px;background:#f1f5f9;color:#334155;padding:5px 8px;font-size:11px;font-weight:900}.chip.gold{background:#fef3c7;color:#92400e}.chip.green{background:#dcfce7;color:#166534}.chip.blue{background:#dbeafe;color:#1e40af}.title{font-size:18px;line-height:1.22;font-weight:900}.desc{margin-top:9px;color:#475569;font-size:13px;line-height:1.45;font-weight:750}.cardbody{padding:14px;color:#334155;font-size:13px;line-height:1.5;font-weight:800}.btn2{border:1px solid #cbd5e1;background:#fff;color:#111827;border-radius:12px;padding:8px 10px;font-size:12px;font-weight:900;cursor:pointer;margin-top:8px}.empty,.error{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:18px;padding:18px;font-weight:850;line-height:1.45}.error{border-color:#fecaca;background:#fff1f2;color:#991b1b;margin-bottom:14px;white-space:pre-wrap}.loading{border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:18px;padding:18px;font-weight:900}
        #jpo-partenaires .modal{display:none;position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:999999;padding:20px;align-items:center;justify-content:center}.modal.open{display:flex}.box{width:min(900px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}.close{position:absolute;right:14px;top:10px;border:0;background:transparent;font-size:32px;cursor:pointer}.row{display:grid;grid-template-columns:180px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px dashed #e5e7eb}.row:last-child{border-bottom:0}.label{font-weight:900}
        @media(max-width:840px){#jpo-partenaires .toolbar,#jpo-partenaires .stats{grid-template-columns:1fr}#jpo-partenaires .head,#jpo-partenaires .content{padding:18px}}
      </style>
      <div class="wrap">
        <header class="head">
          <h2>JPO 2026 — accueil des partenaires</h2>
          <p class="sub">Cette page est destinée aux partenaires institutionnels, culturels et éducatifs du Conservatoire Henri Tomasi. Elle permet d’identifier les principaux moments d’affluence confirmée pendant la Semaine Portes ouvertes.</p>
          <div class="intro"><strong>Repères de venue :</strong> les propositions accueillant du public à l’auditorium sont signalées en priorité. La page met aussi en évidence les horaires où plusieurs activités reçoivent simultanément des publics réservés, scolaires et tout public.</div>
          <div class="contactbox"><strong>Contact coordination JPO</strong> Pour toute venue partenaire, visite officielle, reportage ou calage horaire, contactez l’équipe communication du Conservatoire.<div class="contact-actions"><a class="mail" href="mailto:communication@crd.corsica">communication@crd.corsica</a><a class="phone" href="tel:+33667579265">06.67.57.92.65</a></div></div>
        </header>
        <main class="content">
          <div id="jpo-partners-status" class="loading">Chargement des données...</div>
          <div id="jpo-partners-stats" class="stats"></div>
          <div class="toolbar">
            <div><label>Recherche</label><input id="jpo-partners-search" type="search" placeholder="Titre, salle, établissement..."></div>
            <div><label>Jour</label><select id="jpo-partners-day"></select></div>
            <div><label>Demi-journée</label><select id="jpo-partners-period"><option value="all">Toute la journée</option><option value="morning">Matin</option><option value="afternoon">Après-midi</option><option value="evening">Soirée</option></select></div>
            <div><label>Affichage</label><select id="jpo-partners-mode"><option value="all">Tous les repères</option><option value="auditorium">Auditorium uniquement</option><option value="affluence">Horaires d’influence</option><option value="public">Tout public</option><option value="school">Scolaires</option></select></div>
          </div>
          <div id="jpo-partners-output"></div>
        </main>
      </div>
      <div class="modal" id="jpo-partners-modal"><div class="box"><button type="button" class="close" data-close>&times;</button><h3 id="jpo-partners-modal-title"></h3><div id="jpo-partners-modal-body"></div></div></div>`;

    const $ = id => document.getElementById(id);
    const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    function norm(v){return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();}
    function slug(v){return norm(v).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80);}
    function compact(v){const f=fmtTime(v);return f?f.replace(":",""):String(v||"").replace(/[^0-9]/g,"").padEnd(4,"0").slice(0,4);}
    function csvRows(text){const rows=[];let row=[],cell="",q=false;const s=String(text||"");for(let i=0;i<s.length;i++){const ch=s[i],nx=s[i+1];if(ch==='"'){if(q&&nx==='"'){cell+='"';i++;}else q=!q;}else if(ch===","&&!q){row.push(cell);cell="";}else if((ch==="\n"||ch==="\r")&&!q){if(ch==="\r"&&nx==="\n")i++;row.push(cell);cell="";if(row.some(x=>String(x).trim()))rows.push(row);row=[];}else cell+=ch;}row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row);return rows;}
    function findCol(headers,names){const hs=headers.map(norm);for(const n of names){const i=hs.findIndex(h=>h===norm(n));if(i!==-1)return i;}for(const n of names){const i=hs.findIndex(h=>h.includes(norm(n)));if(i!==-1)return i;}return -1;}
    function parseDate(v){const s=String(v||"").trim();let m=s.match(/^(\d{1,2})[\/. -](\d{1,2})[\/. -](\d{2,4})$/);if(m){let y=m[3];if(y.length===2)y="20"+y;return y+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");}m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0");return "";}
    function fmtTime(v){const s=String(v||"").trim().toLowerCase().replace("h",":");if(/^\d{3,4}$/.test(s)){const raw=s.padStart(4,"0");return raw.slice(0,2)+":"+raw.slice(2,4);}const m=s.match(/(\d{1,2})(?::(\d{2}))?/);return m?m[1].padStart(2,"0")+":"+(m[2]||"00"):"";}
    function mins(t){const f=fmtTime(t);if(!f)return null;const p=f.split(":");return parseInt(p[0],10)*60+parseInt(p[1],10);}
    function timeFromMin(m){return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");}
    function showTime(t){const f=fmtTime(t);return f?f.replace(":","h"):"Horaire à préciser";}
    function num(v){const m=String(v||"").match(/\d+/);return m?parseInt(m[0],10):0;}
    function duration(v,format){const s=norm((format||"")+" "+(v||""));if(s.includes("1h30")||s.includes("1 h 30"))return 90;if(s.includes("2h")||s.includes("2 h"))return 120;if(s.includes("45"))return 45;if(s.includes("30"))return 30;return 60;}
    function roomKey(v,p){const s=norm((v||"")+" "+(p||""));if(s.includes("auditorium"))return "auditorium";if(s.includes("orchestre"))return "orchestre";if(s.includes("chant"))return "chant";if(s.includes("choeur")||s.includes("chœur"))return "choeur";if(s.includes("theatre")||s.includes("théâtre"))return "theatre";if(s.includes("danse 2"))return "danse2";if(s.includes("danse 3"))return "danse3";if(s.includes("danse"))return "danse1";if(s.includes("eveil")||s.includes("éveil"))return "eveil";return "other";}
    function formatDate(iso){const d=DAYS.find(x=>x.iso===iso);return d?d.label:iso;}
    function halfDayForSlot(slot){const m=mins(slot&&slot.start);if(m===null)return"evening";if(m<12*60)return"morning";if(m<17*60)return"afternoon";return"evening";}
    function slotId(date,start,end,room,title){return [date,compact(start),compact(end),room,slug(title)].join("|");}
    function rowHtml(label,value){return '<div class="row"><span class="label">'+esc(label)+'</span><span>'+esc(value||"—")+'</span></div>';}

    function buildSlots(text){
      const rows=csvRows(text); const h=rows[0]||[]; const data=rows.slice(1); const out=[];
      const C_TITLE=findCol(h,["Intitulé du projet","Intitule du projet","Projet"]), C_STATUS=findCol(h,["STATUT","Statut"]), C_DATE=findCol(h,["Date souhaitée","Date"]), C_START=findCol(h,["Horaire de début","Horaire","Heure"]), C_DUR=findCol(h,["Durée estimée","Durée"]), C_ROOM_FINAL=findCol(h,["SALLE RETENUE CRD","Salle retenue"]), C_ROOM_PREC=findCol(h,["PRÉCISION SALLE / LIEU CRD","PRECISION SALLE","Précision salle","Precision salle"]), C_ROOM=findCol(h,["Lieu souhaité","Lieu"]), C_TYPE=findCol(h,["Type de proposition","Type"]), C_DESC=findCol(h,["Description courte","Description"]), C_NAME=findCol(h,["Nom et prénom","Nom"]), C_CAP=findCol(h,["CAPACITÉ CRD","CAPACITE CRD","Nombre estimé"]), C_FORMAT=findCol(h,["FORMAT CRD","Format"]), C_AUTO=findCol(h,["Programmation automatique"]);
      data.forEach(r=>{
        const st=C_STATUS!==-1?norm(r[C_STATUS]):"accepte"; if(st && !st.includes("accept")) return;
        const title=(C_TITLE!==-1?r[C_TITLE]:"")||"Proposition sans titre";
        const baseRoom=(C_ROOM_FINAL!==-1&&r[C_ROOM_FINAL]?r[C_ROOM_FINAL]:(C_ROOM!==-1?r[C_ROOM]:"")); const prec=C_ROOM_PREC!==-1?r[C_ROOM_PREC]:""; const key=roomKey(baseRoom,prec); const roomLabel=prec||baseRoom||"Lieu à préciser";
        const add=(date,start,end,auto)=>{ if(!date||!start)return; const id=slotId(date,start,end,key,title); let capacity=C_CAP!==-1?num(r[C_CAP]):0;if(key==="auditorium")capacity=Math.min(capacity||180,180); out.push({id,dateIso:date,start,end,roomKey:key,roomLabel,title,type:C_TYPE!==-1?r[C_TYPE]:"",description:C_DESC!==-1?r[C_DESC]:"",name:C_NAME!==-1?r[C_NAME]:"",capacity,auto,confirmed:0,pendingSchool:0,schoolReserved:0,publicReserved:0,totalReserved:0,details:[],publicDetails:[],search:norm([title,baseRoom,prec,C_TYPE!==-1?r[C_TYPE]:"",C_DESC!==-1?r[C_DESC]:"",C_NAME!==-1?r[C_NAME]:""].join(" "))}); };
        const isAuto=C_AUTO!==-1 && /oui|automatique|rep/i.test(r[C_AUTO]||"");
        if(isAuto){AUTO_DAYS.forEach(d=>AUTO_SLOTS.forEach(pair=>add(d,pair[0],pair[1],true)));}
        else{const date=parseDate(C_DATE!==-1?r[C_DATE]:""); const start=fmtTime(C_START!==-1?r[C_START]:""); const end=start?timeFromMin(mins(start)+duration(C_DUR!==-1?r[C_DUR]:"",C_FORMAT!==-1?r[C_FORMAT]:"")):""; add(date,start,end,false);}
      });
      const seen=new Set(); return out.filter(s=>{const k=[s.dateIso,s.start,s.end,s.roomKey,s.title].join("|"); if(seen.has(k))return false; seen.add(k); return true;}).sort((a,b)=>a.dateIso.localeCompare(b.dateIso)||(mins(a.start)-mins(b.start))||a.title.localeCompare(b.title));
    }

    function buildSchoolReservations(text){
      const rows=csvRows(text); const h=rows[0]||[]; const data=rows.slice(1); const map={};
      const C_IDS=findCol(h,["IDs créneaux","IDs creneaux","IDS créneaux","IDS creneaux"]), C_VALID=findCol(h,["VALIDATION CRD","Validation CRD","Statut CRD","STATUT CRD"]), C_ETAB=findCol(h,["Établissement","Etablissement","Structure","École","Ecole","Organisme"]);
      data.forEach(r=>{const valid=C_VALID!==-1?norm(r[C_VALID]):"oui"; if(valid && valid.includes("non"))return; const confirmed=(!valid || valid.includes("oui") || valid.includes("confirm")); let ids=C_IDS!==-1?r[C_IDS]:""; if(!ids){ids=(r.find(c=>/2026-06-\d{2}\|\d{4}\|\d{4}\|/.test(String(c||"")))||"");}
        String(ids||"").split(";").map(x=>x.trim()).filter(Boolean).forEach(line=>{const p=line.split("|").map(x=>x.trim()); if(p.length<8)return; const id=p.slice(0,5).join("|"); const total=num(p[6])+num(p[7]); if(!id||!total)return; if(!map[id])map[id]={confirmed:0,pending:0,total:0,details:[]}; if(confirmed)map[id].confirmed+=total; else map[id].pending+=total; map[id].total+=total; map[id].details.push({establishment:C_ETAB!==-1?r[C_ETAB]:"",group:p[5]||"Groupe",total,status:confirmed?"confirmed":"pending"});});
      }); return map;
    }

    function publicReservationStatus(v){const s=norm(v||"");if(s.includes("annul")||s.includes("refus")||s==="non")return"cancelled";if(s.includes("confirm")||s==="oui")return"confirmed";return"pending";}
    function buildPublicReservations(text){
      const rows=csvRows(text); const h=rows[0]||[]; const data=rows.slice(1); const map={}; publicStats={rows:0,confirmedRows:0,pendingRows:0,cancelledRows:0};
      const C_ID=findCol(h,["ID créneau","ID creneau","IDs créneaux","IDs creneaux","ID"]), C_STATUS=findCol(h,["STATUT CRD","Statut CRD","STATUT","Statut"]), C_PLACES=findCol(h,["Nombre de places souhaitées","Nombre de places souhaitees","Nombre de places","Places"]), C_NAME=findCol(h,["Nom et prénom","Nom","Prénom","Prenom"]), C_EMAIL=findCol(h,["Adresse email","Adresse e-mail","Email"]);
      data.forEach(r=>{const raw=C_ID!==-1?r[C_ID]:""; if(!raw)return; const status=publicReservationStatus(C_STATUS!==-1?r[C_STATUS]:""); if(status==="cancelled"){publicStats.cancelledRows++;return;} const places=num(C_PLACES!==-1?r[C_PLACES]:"1")||1; publicStats.rows++; if(status==="confirmed")publicStats.confirmedRows++; else publicStats.pendingRows++;
        String(raw).split(/[;\n]+/).map(x=>x.trim()).filter(Boolean).forEach(id=>{const p=id.split("|").map(x=>x.trim()); if(p.length<5)return; const key=p.slice(0,5).join("|"); if(!map[key])map[key]={confirmed:0,pending:0,total:0,details:[]}; if(status==="confirmed")map[key].confirmed+=places; else map[key].pending+=places; map[key].total+=places; map[key].details.push({name:C_NAME!==-1?r[C_NAME]:"",email:C_EMAIL!==-1?r[C_EMAIL]:"",places,status});});
      });
      return map;
    }

    function reservationForSlot(slot,map){let res=map[slot.id]; if(!res){res={confirmed:0,pending:0,total:0,details:[]}; const prefix=[slot.dateIso,compact(slot.start),compact(slot.end),slot.roomKey].join("|")+"|"; Object.keys(map).forEach(id=>{if(id.indexOf(prefix)===0){res.confirmed+=map[id].confirmed||0;res.pending+=map[id].pending||0;res.total+=map[id].total||0;(map[id].details||[]).forEach(d=>res.details.push(d));}});} return res;}
    function applyReservations(slots,schoolMap,publicMap){return slots.map(s=>{const school=reservationForSlot(s,schoolMap||{});const pub=reservationForSlot(s,publicMap||{});const extra=[...(school.details||[]).map(d=>(d.establishment||"")+" "+(d.group||"")),...(pub.details||[]).map(d=>(d.name||"")+" "+(d.email||""))].join(" ");return Object.assign({},s,{confirmed:school.confirmed||0,pendingSchool:school.pending||0,schoolReserved:school.total||0,publicReserved:pub.total||0,publicDetails:pub.details||[],details:school.details||[],totalReserved:(school.total||0)+(pub.total||0),search:norm(s.search+" "+extra)});});}

    function momentKey(slot){return [slot.dateIso,fmtTime(slot.start)].join("|");}
    function confirmedAtMoment(slot){return allSlots.filter(s=>momentKey(s)===momentKey(slot)).reduce((sum,s)=>sum+(s.totalReserved||0),0);}
    function hasDirectPublic(s){return (s.totalReserved||0)>0;}
    function hasAuditorium(s){return s.roomKey==="auditorium";}
    function publicProposalCountAtMoment(slot){return allSlots.filter(s=>momentKey(s)===momentKey(slot)&&hasDirectPublic(s)).length;}
    function isParallelPublicMoment(s){return publicProposalCountAtMoment(s)>=PARALLEL_PUBLIC_MIN || confirmedAtMoment(s)>=AFFLUENCE_THRESHOLD;}
    function isRepere(s){if(!hasDirectPublic(s))return false;if(hasAuditorium(s))return true;return isParallelPublicMoment(s);}
    function filtered(){return allSlots.filter(s=>{const aud=hasDirectPublic(s)&&hasAuditorium(s), aff=hasDirectPublic(s)&&isParallelPublicMoment(s); if(activeMode==="auditorium"&&!aud)return false; if(activeMode==="affluence"&&!aff)return false; if(activeMode==="public"&&!(s.publicReserved>0))return false; if(activeMode==="school"&&!(s.schoolReserved>0))return false; if(activeMode==="all"&&!isRepere(s))return false; if(activeDay!=="all"&&s.dateIso!==activeDay)return false; if(activePeriod!=="all"&&halfDayForSlot(s)!==activePeriod)return false; if(searchTerm&&!s.search.includes(norm(searchTerm)))return false; return true;});}
    function aggregateMoments(slots,limit){const map={};(slots||[]).forEach(s=>{const key=momentKey(s);if(!map[key])map[key]={key,dateIso:s.dateIso,start:s.start,total:0,schoolTotal:0,publicTotal:0,count:0,slots:[]};map[key].total+=s.totalReserved||0;map[key].schoolTotal+=s.schoolReserved||0;map[key].publicTotal+=s.publicReserved||0;map[key].count++;map[key].slots.push(s);});return Object.values(map).filter(p=>p.total>0).sort((a,b)=>b.total-a.total||(mins(a.start)||0)-(mins(b.start)||0)).slice(0,limit||5);}
    function uniquePublicEstimate(slots){const people={};let fallback=0;(slots||[]).forEach(s=>{const details=s.publicDetails||[];if(!details.length)fallback+=s.publicReserved||0;details.forEach((d,i)=>{const key=norm(d.email||d.name)||("public-"+i);people[key]=Math.max(people[key]||0,d.places||0);});});return Object.values(people).reduce((a,b)=>a+b,0)||fallback;}
    function uniqueSchoolEstimate(slots){const groups={};let fallback=0;(slots||[]).forEach(s=>{const details=s.details||[];if(!details.length)fallback+=s.schoolReserved||0;details.forEach((d,i)=>{const key=norm((d.establishment||"")+"|"+(d.group||""))||("school-"+i);groups[key]=Math.max(groups[key]||0,d.total||0);});});return Object.values(groups).reduce((a,b)=>a+b,0)||fallback;}

    function renderStats(slots){
      const schoolPlaces=slots.reduce((sum,s)=>sum+(s.schoolReserved||0),0), publicPlaces=slots.reduce((sum,s)=>sum+(s.publicReserved||0),0), total=schoolPlaces+publicPlaces;
      const aud=slots.filter(hasAuditorium).length; const aff=aggregateMoments(slots,50).filter(m=>m.total>=AFFLUENCE_THRESHOLD||m.count>=PARALLEL_PUBLIC_MIN).length; const peaks=aggregateMoments(slots,3); const max=peaks.length?peaks[0].total:0;
      const uniqueVisitors=uniquePublicEstimate(slots)+uniqueSchoolEstimate(slots);
      $("jpo-partners-stats").innerHTML='<div class="stat"><div class="stat-title">Affluence réservée</div><div class="stat-main"><div class="num">'+total+'</div><span>places scolaires + public</span></div><div class="mini"><div><b>'+schoolPlaces+'</b><span>scolaires</span></div><div><b>'+publicPlaces+'</b><span>tout public</span></div><div><b>'+uniqueVisitors+'</b><span>visiteurs uniques estimés</span></div><div><b>'+aff+'</b><span>horaires d’influence</span></div></div></div>'+
        '<div class="stat"><div class="stat-title">Réservations tout public</div><div class="stat-main"><div class="num">'+publicPlaces+'</div><span>places réservées</span></div><div class="mini"><div><b>'+uniquePublicEstimate(slots)+'</b><span>individus publics estimés</span></div><div><b>'+(publicStats.rows||0)+'</b><span>demandes public</span></div><div><b>'+(publicStats.confirmedRows||0)+'</b><span>confirmées</span></div><div><b>'+aud+'</b><span>repères auditorium</span></div></div></div>'+
        '<div class="stat"><div class="stat-title">Principaux pics</div><div class="stat-main"><div class="num">'+max+'</div><span>personnes au plus fort</span></div><div class="peaklist">'+(peaks.length?peaks.map(p=>'<button type="button" class="peakbtn" data-peak="'+esc(p.key)+'">'+esc(formatDate(p.dateIso))+' · '+esc(showTime(p.start))+' — '+p.total+' pers. ('+p.count+' créneau(x))</button>').join(""):'<div class="lab">Aucune réservation avec ces filtres.</div>')+'</div></div>';
    }
    function renderCard(s){return '<article class="card '+(isRepere(s)?'strong':'')+'"><div class="top"><div class="chips"><span class="chip blue">'+esc(showTime(s.start))+'</span>'+(s.roomKey==="auditorium"?'<span class="chip gold">Auditorium</span>':'')+(s.publicReserved?'<span class="chip green">Tout public</span>':'')+'</div><div class="title">'+esc(s.title)+'</div>'+(s.description?'<div class="desc">'+esc(s.description)+'</div>':'')+'</div><div class="cardbody"><strong>'+esc(s.roomLabel)+'</strong><br>'+esc(s.type||"Proposition")+'<br><strong>Total réservé : '+(s.totalReserved||0)+' personne(s)</strong><br>Scolaires : '+(s.schoolReserved||0)+' · Tout public : '+(s.publicReserved||0)+'<br><button type="button" class="btn2" data-slot="'+esc(s.id)+'">Détail</button></div></article>';}
    function render(){const slots=filtered(); renderStats(slots); const status=$("jpo-partners-status"); status.className=""; status.innerHTML=''; if(!slots.length){$("jpo-partners-output").innerHTML='<div class="empty">Aucun repère avec ces filtres. Diagnostic : '+allSlots.length+' propositions chargées.</div>';return;} const days=(activeDay==="all"?DAYS:DAYS.filter(d=>d.iso===activeDay)); $("jpo-partners-output").innerHTML=days.map(d=>{const ds=slots.filter(s=>s.dateIso===d.iso); if(!ds.length)return ''; const by={}; ds.forEach(s=>{const k=showTime(s.start); (by[k]||(by[k]=[])).push(s);}); return '<section class="section"><div class="sectionhead"><div><div class="sectiontitle">'+esc(d.label)+'</div><div class="sectionmeta">Auditorium, publics scolaires, tout public et horaires d’influence.</div></div><div class="badge">'+ds.length+' repère(s)</div></div><div class="body">'+Object.keys(by).sort((a,b)=>(mins(a)||9999)-(mins(b)||9999)).map(t=>{const first=by[t][0],total=confirmedAtMoment(first); return '<div class="timegroup"><div class="timehead"><div><div class="time">'+esc(t)+'</div>'+(total>0?'<div class="sectionmeta">Public réservé sur cet horaire : '+total+' personne(s) · '+publicProposalCountAtMoment(first)+' proposition(s)</div>':'')+'</div><div class="badge">'+by[t].length+'</div></div><div class="cards">'+by[t].map(renderCard).join('')+'</div></div>';}).join('')+'</div></section>';}).join('') || '<div class="empty">Aucun repère pour ce jour.</div>';}
    function openPeak(key){const peak=aggregateMoments(filtered(),50).find(p=>p.key===key); if(!peak)return; $("jpo-partners-modal-title").textContent="Pic d’affluence — "+formatDate(peak.dateIso)+" à "+showTime(peak.start); $("jpo-partners-modal-body").innerHTML=rowHtml("Total",peak.total+" personne(s) réservée(s)")+rowHtml("Répartition","Scolaires "+peak.schoolTotal+" · Tout public "+peak.publicTotal)+ '<div class="cards" style="padding:0;margin-top:14px">'+peak.slots.map(renderCard).join("")+'</div>'; $("jpo-partners-modal").classList.add("open");}
    function openSlot(id){const s=allSlots.find(x=>x.id===id);if(!s)return;$("jpo-partners-modal-title").textContent=s.title;$("jpo-partners-modal-body").innerHTML=rowHtml("Date / horaire",formatDate(s.dateIso)+" — "+showTime(s.start)+"-"+showTime(s.end))+rowHtml("Lieu",s.roomLabel)+rowHtml("Réservations","Total "+(s.totalReserved||0)+" · scolaires "+(s.schoolReserved||0)+" · tout public "+(s.publicReserved||0))+rowHtml("Établissements",(s.details||[]).map(d=>(d.establishment||"Établissement")+" — "+(d.group||"groupe")+" : "+d.total).join(" ; "))+rowHtml("Contacts public",(s.publicDetails||[]).map(d=>(d.name||d.email||"Contact")+" : "+d.places+" place(s)").join(" ; "))+rowHtml("Description",s.description);$("jpo-partners-modal").classList.add("open");}
    function bind(){ $("jpo-partners-day").innerHTML='<option value="all">Toute la semaine</option>'+DAYS.map(d=>'<option value="'+d.iso+'">'+esc(d.label)+'</option>').join(''); ["jpo-partners-search","jpo-partners-day","jpo-partners-period","jpo-partners-mode"].forEach(id=>$(id).addEventListener(id==="jpo-partners-search"?"input":"change",()=>{searchTerm=$("jpo-partners-search").value; activeDay=$("jpo-partners-day").value; activePeriod=$("jpo-partners-period").value; activeMode=$("jpo-partners-mode").value; render();})); root.addEventListener("click",e=>{const target=e.target; const peak=target.closest&&target.closest("[data-peak]"); if(peak){openPeak(peak.getAttribute("data-peak"));return;} const slot=target.closest&&target.closest("[data-slot]"); if(slot){openSlot(slot.getAttribute("data-slot"));return;} if(target.closest&&target.closest("[data-close]"))$("jpo-partners-modal").classList.remove("open");}); $("jpo-partners-modal").addEventListener("click",e=>{if(e.target===$("jpo-partners-modal"))$("jpo-partners-modal").classList.remove("open");});}

    Promise.all([
      fetch(PROPOSITIONS_CSV).then(r=>{if(!r.ok)throw new Error("propositions HTTP "+r.status);return r.text();}),
      fetch(DEMANDES_CSV).then(r=>r.ok?r.text():"").catch(()=>""),
      fetch(PUBLIC_RESERVATIONS_CSV).then(r=>r.ok?r.text():"").catch(()=>"")
    ]).then(([propText,schoolText,publicText])=>{const slots=buildSlots(propText); const schools=buildSchoolReservations(schoolText||""); const pub=buildPublicReservations(publicText||""); allSlots=applyReservations(slots,schools,pub); window.JPO_PARTENAIRES_DEBUG={slots:allSlots,schoolReservations:schools,publicReservations:pub,publicStats}; bind(); render();}).catch(err=>{$("jpo-partners-status").className="error"; $("jpo-partners-status").textContent="Erreur de chargement : "+err.message;});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initJpoPartenaires);
  else initJpoPartenaires();
})();
