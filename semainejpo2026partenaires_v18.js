document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jpo-partenaires") || document.getElementById("jpopartenaires") || document.getElementById("jpo_partenaires") || document.getElementById("semainejpo-partenaires");
  if (!root) {
    root = document.createElement("div");
    root.id = "jpo-partenaires";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";
  const DEMANDES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";
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
  let activeMode = "all";
  let searchTerm = "";

  root.innerHTML = `
    <style>
      #jpo-partenaires{--text:#111827;--muted:#64748b;--border:#e5e7eb;font-family:Arial,sans-serif;color:var(--text);width:100%}#jpo-partenaires *{box-sizing:border-box}
      #jpo-partenaires .wrap{max-width:1120px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
      #jpo-partenaires .head{padding:30px;background:radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),#fff;border-bottom:1px solid var(--border)}
      #jpo-partenaires h2{margin:0;font-size:clamp(28px,4vw,42px);line-height:1.05;letter-spacing:-.04em}
      #jpo-partenaires .sub{margin:12px 0 0;color:var(--muted);font-size:16px;line-height:1.55;max-width:930px;font-weight:750}
      #jpo-partenaires .intro{margin-top:18px;border:1px solid #dbeafe;background:#eff6ff;color:#1e3a8a;border-radius:18px;padding:14px;font-size:14px;line-height:1.45;font-weight:800}
      #jpo-partenaires .content{padding:22px}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px}.stat{border:1px solid var(--border);border-radius:16px;padding:13px;background:#fff}.num{font-size:26px;font-weight:900}.lab{margin-top:5px;color:#64748b;font-size:12px;font-weight:900;line-height:1.3}
      #jpo-partenaires .toolbar{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:10px;margin-bottom:18px;align-items:end}#jpo-partenaires label{display:block;font-size:12px;color:#475569;font-weight:900;margin-bottom:5px;text-transform:uppercase}#jpo-partenaires select,#jpo-partenaires input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:11px;font-size:14px;font-weight:800;background:#fff}
      #jpo-partenaires .section{margin-bottom:22px;border:1px solid var(--border);border-radius:24px;overflow:hidden;background:#fff}.sectionhead{padding:17px 18px;background:#f8fafc;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.sectiontitle{font-size:23px;font-weight:900;letter-spacing:-.035em;text-transform:uppercase}.sectionmeta{margin-top:4px;color:#64748b;font-size:13px;font-weight:850;line-height:1.4}.badge{border-radius:999px;background:#e2e8f0;color:#334155;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}.body{padding:14px}.timegroup{margin-bottom:14px;border:1px solid #e7eaee;border-radius:20px;overflow:hidden}.timehead{padding:13px 15px;background:#fbfcfd;border-bottom:1px solid #edf0f3;display:flex;justify-content:space-between;gap:10px;align-items:center}.time{font-size:19px;font-weight:900}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;padding:12px}.card{border:1px solid var(--border);border-radius:20px;overflow:hidden;background:#fff}.card.strong{border-color:#fbbf24;background:linear-gradient(180deg,#fffbeb 0,#fff 76%)}.top{padding:14px;background:#fbfcfd;border-bottom:1px solid #edf0f3}.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px}.chip{border-radius:999px;background:#f1f5f9;color:#334155;padding:5px 8px;font-size:11px;font-weight:900}.chip.gold{background:#fef3c7;color:#92400e}.chip.green{background:#dcfce7;color:#166534}.chip.blue{background:#dbeafe;color:#1e40af}.title{font-size:18px;line-height:1.22;font-weight:900}.desc{margin-top:9px;color:#475569;font-size:13px;line-height:1.45;font-weight:750}.cardbody{padding:14px;color:#334155;font-size:13px;line-height:1.5;font-weight:800}.empty,.error{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:18px;padding:18px;font-weight:850;line-height:1.45}.error{border-color:#fecaca;background:#fff1f2;color:#991b1b;margin-bottom:14px;white-space:pre-wrap}.loading{border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:18px;padding:18px;font-weight:900}
      @media(max-width:840px){#jpo-partenaires .toolbar,#jpo-partenaires .stats{grid-template-columns:1fr}#jpo-partenaires .head,#jpo-partenaires .content{padding:18px}}
    </style>
    <div class="wrap">
      <header class="head">
        <h2>JPO 2026 — accueil des partenaires</h2>
        <p class="sub">Cette page est destinée aux partenaires institutionnels, culturels et éducatifs du Conservatoire Henri Tomasi. Elle permet d’identifier les principaux moments d’affluence confirmée pendant la Semaine Portes ouvertes, afin de faciliter l’organisation de visites, la venue d’élus, de représentants institutionnels, de partenaires ou de la presse.</p>
        <div class="intro"><strong>Repères de venue :</strong> les propositions programmées à l’auditorium sont signalées en priorité, car elles constituent des repères structurants de la semaine, même lorsque les réservations ne sont pas issues du formulaire scolaire. La page met également en évidence les horaires où plusieurs activités reçoivent simultanément des publics réservés dans le Conservatoire, y compris les publics scolaires. Ces informations constituent une aide au repérage et à la coordination des présences partenaires.</div>
      </header>
      <main class="content">
        <div id="jpo-partners-status" class="loading">Chargement des données...</div>
        <div id="jpo-partners-stats" class="stats"></div>
        <div class="toolbar">
          <div><label>Recherche</label><input id="jpo-partners-search" type="search" placeholder="Titre, salle, établissement..."></div>
          <div><label>Jour</label><select id="jpo-partners-day"></select></div>
          <div><label>Affichage</label><select id="jpo-partners-mode"><option value="all">Auditorium + horaires parallèles</option><option value="auditorium">Auditorium uniquement</option><option value="affluence">Horaires parallèles uniquement</option></select></div>
        </div>
        <div id="jpo-partners-output"></div>
      </main>
    </div>`;

  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  function norm(v){return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();}
  function slug(v){return norm(v).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);}
  function compact(v){return String(v||"").replace(/[^0-9]/g,"").padEnd(4,"0").slice(0,4);}
  function csvRows(text){const rows=[];let row=[],cell="",q=false;for(let i=0;i<text.length;i++){const ch=text[i],nx=text[i+1];if(ch==='"'){if(q&&nx==='"'){cell+='"';i++;}else q=!q;}else if(ch===","&&!q){row.push(cell);cell="";}else if((ch==="\n"||ch==="\r")&&!q){if(ch==="\r"&&nx==="\n")i++;row.push(cell);cell="";if(row.some(x=>String(x).trim()))rows.push(row);row=[];}else cell+=ch;}row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row);return rows;}
  function findCol(headers,names){const hs=headers.map(norm);for(const n of names){const i=hs.findIndex(h=>h===norm(n));if(i!==-1)return i;}for(const n of names){const i=hs.findIndex(h=>h.includes(norm(n)));if(i!==-1)return i;}return -1;}
  function parseDate(v){const s=String(v||"").trim();let m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);if(m){let y=m[3];if(y.length===2)y="20"+y;return y+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");}m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0");return "";}
  function fmtTime(v){const s=String(v||"").trim().toLowerCase().replace("h",":");const m=s.match(/(\d{1,2})(?::(\d{2}))?/);return m?m[1].padStart(2,"0")+":"+(m[2]||"00"):"";}
  function mins(t){const f=fmtTime(t);if(!f)return null;const p=f.split(":");return parseInt(p[0],10)*60+parseInt(p[1],10);}
  function timeFromMin(m){return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");}
  function showTime(t){const f=fmtTime(t);return f?f.replace(":","h"):"Horaire à préciser";}
  function num(v){const m=String(v||"").match(/\d+/);return m?parseInt(m[0],10):0;}
  function duration(v,format){const s=norm((format||"")+" "+(v||""));if(s.includes("1h30")||s.includes("1 h 30"))return 90;if(s.includes("2h")||s.includes("2 h"))return 120;if(s.includes("45"))return 45;if(s.includes("30"))return 30;return 60;}
  function roomKey(v,p){const s=norm((v||"")+" "+(p||""));if(s.includes("auditorium"))return "auditorium";if(s.includes("orchestre"))return "orchestre";if(s.includes("chant"))return "chant";if(s.includes("choeur")||s.includes("chœur"))return "choeur";if(s.includes("theatre")||s.includes("théâtre"))return "theatre";if(s.includes("danse 2"))return "danse2";if(s.includes("danse 3"))return "danse3";if(s.includes("danse"))return "danse1";if(s.includes("eveil")||s.includes("éveil"))return "eveil";return "other";}
  function formatDate(iso){const d=DAYS.find(x=>x.iso===iso);return d?d.label:iso;}
  function overlaps(a,b){if(a.dateIso!==b.dateIso)return false;const as=mins(a.start),ae=mins(a.end),bs=mins(b.start),be=mins(b.end);return as!==null&&ae!==null&&bs!==null&&be!==null&&as<be&&bs<ae;}
  function slotId(date,start,end,room,title){return [date,compact(start),compact(end),room,slug(title)].join("|");}

  function buildSlots(text){
    const rows=csvRows(text); const h=rows[0]||[]; const data=rows.slice(1); const out=[];
    const C_TITLE=findCol(h,["Intitulé du projet","Intitule du projet","Projet"]), C_STATUS=findCol(h,["STATUT","Statut"]), C_DATE=findCol(h,["Date souhaitée","Date"]), C_START=findCol(h,["Horaire de début","Horaire","Heure"]), C_DUR=findCol(h,["Durée estimée","Durée"]), C_ROOM_FINAL=findCol(h,["SALLE RETENUE CRD","Salle retenue"]), C_ROOM_PREC=findCol(h,["PRÉCISION SALLE / LIEU CRD","PRECISION SALLE","Précision salle","Precision salle"]), C_ROOM=findCol(h,["Lieu souhaité","Lieu"]), C_TYPE=findCol(h,["Type de proposition","Type"]), C_DESC=findCol(h,["Description courte","Description"]), C_NAME=findCol(h,["Nom et prénom","Nom"]), C_CAP=findCol(h,["CAPACITÉ CRD","CAPACITE CRD","Nombre estimé"]), C_FORMAT=findCol(h,["FORMAT CRD","Format"]), C_AUTO=findCol(h,["Programmation automatique"]);
    data.forEach((r,idx)=>{
      const st=C_STATUS!==-1?norm(r[C_STATUS]):"accepte"; if(st && !st.includes("accept")) return;
      const title=(C_TITLE!==-1?r[C_TITLE]:"")||"Proposition sans titre";
      const baseRoom=(C_ROOM_FINAL!==-1&&r[C_ROOM_FINAL]?r[C_ROOM_FINAL]:(C_ROOM!==-1?r[C_ROOM]:"")); const prec=C_ROOM_PREC!==-1?r[C_ROOM_PREC]:""; const key=roomKey(baseRoom,prec); const roomLabel=prec||baseRoom||"Lieu à préciser";
      const add=(date,start,end,auto)=>{ if(!date||!start)return; const id=slotId(date,start,end,key,title); out.push({id,dateIso:date,start,end,roomKey:key,roomLabel,title,type:C_TYPE!==-1?r[C_TYPE]:"",description:C_DESC!==-1?r[C_DESC]:"",name:C_NAME!==-1?r[C_NAME]:"",capacity:C_CAP!==-1?num(r[C_CAP]):0,auto,confirmed:0,details:[],search:norm([title,baseRoom,prec,C_TYPE!==-1?r[C_TYPE]:"",C_DESC!==-1?r[C_DESC]:"",C_NAME!==-1?r[C_NAME]:""].join(" "))}); };
      const isAuto=C_AUTO!==-1 && /oui|automatique|rep/i.test(r[C_AUTO]||"");
      if(isAuto){AUTO_DAYS.forEach(d=>AUTO_SLOTS.forEach(pair=>add(d,pair[0],pair[1],true)));}
      else{const date=parseDate(C_DATE!==-1?r[C_DATE]:""); const start=fmtTime(C_START!==-1?r[C_START]:""); const end=start?timeFromMin(mins(start)+duration(C_DUR!==-1?r[C_DUR]:"",C_FORMAT!==-1?r[C_FORMAT]:"")):""; add(date,start,end,false);}
    });
    const seen=new Set(); return out.filter(s=>{const k=[s.dateIso,s.start,s.end,s.roomKey,s.title].join("|"); if(seen.has(k))return false; seen.add(k); return true;}).sort((a,b)=>a.dateIso.localeCompare(b.dateIso)||(mins(a.start)-mins(b.start))||a.title.localeCompare(b.title));
  }

  function buildReservations(text){
    const rows=csvRows(text); const h=rows[0]||[]; const data=rows.slice(1); const map={};
    const C_IDS=findCol(h,["IDs créneaux","IDs creneaux","IDS créneaux","IDS creneaux"]); const C_VALID=findCol(h,["VALIDATION CRD","Validation CRD","Statut CRD","STATUT CRD"]); const C_ETAB=findCol(h,["Établissement","Etablissement","Structure","École","Ecole","Organisme"]);
    data.forEach(r=>{const valid=C_VALID!==-1?norm(r[C_VALID]):"oui"; if(valid && valid.includes("non"))return; const confirmed=(!valid || valid.includes("oui") || valid.includes("confirm")); if(!confirmed)return; let ids=C_IDS!==-1?r[C_IDS]:""; if(!ids){ids=(r.find(c=>/2026-06-\d{2}\|\d{4}\|\d{4}\|/.test(String(c||"")))||"");}
      String(ids||"").split(";").map(x=>x.trim()).filter(Boolean).forEach(line=>{const p=line.split("|").map(x=>x.trim()); if(p.length<8)return; const id=p.slice(0,5).join("|"); const total=num(p[6])+num(p[7]); if(!id||!total)return; if(!map[id])map[id]={confirmed:0,details:[]}; map[id].confirmed+=total; map[id].details.push({establishment:C_ETAB!==-1?r[C_ETAB]:"",group:p[5]||"Groupe",total});});
    }); return map;
  }

  function applyReservations(slots,map){return slots.map(s=>{
    let res=map[s.id];
    if(!res){
      res={confirmed:0,details:[]};
      const exactTimePrefix=[s.dateIso,compact(s.start),compact(s.end),s.roomKey].join("|")+"|";
      Object.keys(map).forEach(id=>{
        if(id.indexOf(exactTimePrefix)===0){
          res.confirmed+=map[id].confirmed;
          (map[id].details||[]).forEach(d=>res.details.push(d));
        }
      });
    }
    if((!res || !res.confirmed) && hasAuditorium(s)){
      const titleKey=slug(s.title);
      const dateRoomPrefix=[s.dateIso].join("|");
      Object.keys(map).forEach(id=>{
        const p=id.split("|");
        const sameDate=p[0]===s.dateIso;
        const sameRoom=p[3]===s.roomKey;
        const sameTitle=p[4]===titleKey;
        if(sameDate && sameRoom && sameTitle){
          res.confirmed+=map[id].confirmed;
          (map[id].details||[]).forEach(d=>res.details.push(d));
        }
      });
    }
    const extra=(res.details||[]).map(d=>(d.establishment||"")+" "+(d.group||"")).join(" ");
    return {...s,confirmed:res.confirmed||0,details:res.details||[],search:norm(s.search+" "+extra)};
  });}
  function confirmedAtMoment(slot){
    return allSlots
      .filter(s=>s.dateIso===slot.dateIso && fmtTime(s.start)===fmtTime(slot.start))
      .reduce((sum,s)=>sum+(s.confirmed||0),0);
  }
  function hasDirectPublic(s){return (s.confirmed||0)>0;}
  function hasAuditorium(s){return s.roomKey==="auditorium";}
  function publicProposalCountAtMoment(slot){
    return allSlots.filter(s=>s.dateIso===slot.dateIso && fmtTime(s.start)===fmtTime(slot.start) && hasDirectPublic(s)).length;
  }
  function isParallelPublicMoment(s){return publicProposalCountAtMoment(s)>=PARALLEL_PUBLIC_MIN;}
  function isRepere(s){
    if(!hasDirectPublic(s)) return false;
    if(hasAuditorium(s)) return true;
    return isParallelPublicMoment(s);
  }
  function filtered(){return allSlots.filter(s=>{
    const aud=hasAuditorium(s), aff=hasDirectPublic(s)&&!hasAuditorium(s)&&isParallelPublicMoment(s);
    if(activeMode==="auditorium"&&!aud)return false;
    if(activeMode==="affluence"&&!aff)return false;
    if(activeMode==="all"&&!aud&&!aff)return false;
    if(activeDay!=="all"&&s.dateIso!==activeDay)return false;
    if(searchTerm&&!s.search.includes(norm(searchTerm)))return false;
    return true;
  });}
  function renderStats(slots){
    const aud=allSlots.filter(hasAuditorium).length;
    const affTimes=new Set();
    allSlots.forEach(s=>{if(hasDirectPublic(s)&&isParallelPublicMoment(s))affTimes.add(s.dateIso+"|"+fmtTime(s.start));});
    const max=allSlots.reduce((m,s)=>Math.max(m,confirmedAtMoment(s)),0);
    $("jpo-partners-stats").innerHTML=[[slots.length,"repères affichés"],[aud,"événements auditorium"],[affTimes.size,"horaires d’affluence"],[max,"pic réservé"]].map(x=>'<div class="stat"><div class="num">'+x[0]+'</div><div class="lab">'+esc(x[1])+'</div></div>').join("");
  }
  function renderCard(s){
    const direct=s.confirmed||0;
    return '<article class="card '+(isRepere(s)?'strong':'')+'"><div class="top"><div class="title">'+esc(s.title)+'</div>'+
      (s.description?'<div class="desc">'+esc(s.description)+'</div>':'')+
      '</div><div class="cardbody"><strong>'+esc(s.roomLabel)+'</strong><br>'+esc(s.type||"Proposition")+
      (direct>0?'<br><strong>Public réservé sur cette proposition : '+direct+' personne(s)</strong>':(hasAuditorium(s)?'<br><strong>Événement auditorium</strong>':''))+
      '</div></article>';
  }
  function render(){
    const slots=filtered(); renderStats(slots); const status=$("jpo-partners-status"); status.className=""; status.innerHTML='';
    if(!slots.length){$("jpo-partners-output").innerHTML='<div class="empty">Aucun repère avec ces filtres. Diagnostic : '+allSlots.length+' propositions chargées, '+allSlots.filter(s=>s.roomKey==="auditorium").length+' événements auditorium détectés.</div>';return;}
    const days=(activeDay==="all"?DAYS:DAYS.filter(d=>d.iso===activeDay));
    $("jpo-partners-output").innerHTML=days.map(d=>{
      const ds=slots.filter(s=>s.dateIso===d.iso); if(!ds.length)return '';
      const by={}; ds.forEach(s=>{const k=showTime(s.start); (by[k]||(by[k]=[])).push(s);});
      return '<section class="section"><div class="sectionhead"><div><div class="sectiontitle">'+esc(d.label)+'</div><div class="sectionmeta">Auditorium et horaires avec plusieurs publics réservés en parallèle.</div></div><div class="badge">'+ds.length+' repère(s)</div></div><div class="body">'+Object.keys(by).sort((a,b)=>(mins(a)||9999)-(mins(b)||9999)).map(t=>{
        const first=by[t][0]; const total=confirmedAtMoment(first);
        return '<div class="timegroup"><div class="timehead"><div><div class="time">'+esc(t)+'</div>'+(total>0?'<div class="sectionmeta">Public réservé sur cet horaire : '+total+' personne(s) · '+publicProposalCountAtMoment(first)+' proposition(s) avec public</div>':'')+'</div><div class="badge">'+by[t].length+'</div></div><div class="cards">'+by[t].map(renderCard).join('')+'</div></div>';
      }).join('')+'</div></section>';
    }).join('') || '<div class="empty">Aucun repère pour ce jour.</div>';
  }
  function bind(){ $("jpo-partners-day").innerHTML='<option value="all">Toute la semaine</option>'+DAYS.map(d=>'<option value="'+d.iso+'">'+esc(d.label)+'</option>').join(''); ["jpo-partners-search","jpo-partners-day","jpo-partners-mode"].forEach(id=>$(id).addEventListener(id==="jpo-partners-search"?"input":"change",()=>{searchTerm=$("jpo-partners-search").value; activeDay=$("jpo-partners-day").value; activeMode=$("jpo-partners-mode").value; render();}));}

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(r=>{if(!r.ok)throw new Error("propositions HTTP "+r.status);return r.text();}),
    fetch(DEMANDES_CSV).then(r=>r.ok?r.text():"").catch(()=>"")
  ]).then(([propText,demText])=>{const slots=buildSlots(propText); const reservations=demText?buildReservations(demText):{}; allSlots=applyReservations(slots,reservations); window.JPO_PARTENAIRES_DEBUG={slots:allSlots,reservations}; bind(); render();}).catch(err=>{$("jpo-partners-status").className="error"; $("jpo-partners-status").textContent="Erreur de chargement : "+err.message;});
});
