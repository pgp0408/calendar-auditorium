document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jpo-partenaires") || document.getElementById("jpopartenaires") || document.getElementById("semainejpo-partenaires");
  if (!root) {
    root = document.createElement("div");
    root.id = "jpo-partenaires";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";
  const DEMANDES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";

  const CROWD_THRESHOLD = 35;

  const DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19" },
    { iso: "2026-06-20", label: "Samedi 20 juin", short: "Sam. 20" },
    { iso: "2026-06-21", label: "Dimanche 21 juin", short: "Dim. 21" }
  ];

  const AUTO_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
  const AUTO_SLOTS = [["09:00","10:00"],["10:00","11:00"],["11:00","12:00"],["14:00","15:00"],["15:00","16:00"],["16:00","17:00"]];

  const ROOM_DEFAULTS = {
    auditorium:{label:"Auditorium",short:"Auditorium",capacity:165,pole:"Auditorium / presentations"},
    orchestre:{label:"Salle d'orchestre",short:"Orchestre",capacity:35,pole:"Orchestre / instruments"},
    chant:{label:"Salle de chant",short:"Chant",capacity:35,pole:"Voix / chant / choeur"},
    choeur:{label:"Salle de choeur",short:"Choeur",capacity:35,pole:"Voix / chant / choeur"},
    theatre:{label:"Salle de theatre",short:"Theatre",capacity:35,pole:"Theatre"},
    danse1:{label:"Studio de danse 1",short:"Danse 1",capacity:35,pole:"Danse"},
    danse2:{label:"Studio de danse 2",short:"Danse 2",capacity:35,pole:"Danse"},
    danse3:{label:"Studio de danse 3",short:"Danse 3",capacity:35,pole:"Danse"},
    eveil:{label:"Salle d'eveil",short:"Eveil",capacity:20,pole:"Eveil / accueil"},
    other:{label:"Autre espace / salle precisee",short:"Autre",capacity:35,pole:"Autre espace"},
    any:{label:"A arbitrer",short:"A arbitrer",capacity:35,pole:"A arbitrer"}
  };

  let allSlots = [];
  let visibleSlots = [];
  let activeDay = "all";
  let activeFocus = "all";
  let searchTerm = "";

  root.innerHTML = `
    <style>
      #jpo-partenaires{--text:#111827;--muted:#64748b;--border:#e5e7eb;--soft:#f8fafc;--gold:#92400e;--blue:#1e40af;--green:#166534;font-family:Arial,sans-serif;color:var(--text);width:100%}
      #jpo-partenaires *{box-sizing:border-box}
      #jpo-partenaires .wrap{max-width:1120px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}
      #jpo-partenaires .head{padding:30px;background:radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),radial-gradient(circle at top left,rgba(146,64,14,.10),transparent 30%),#fff;border-bottom:1px solid var(--border)}
      #jpo-partenaires h2{margin:0;font-size:clamp(30px,4vw,44px);line-height:1.04;letter-spacing:-.045em}
      #jpo-partenaires .sub{margin:12px 0 0;color:var(--muted);font-size:16px;line-height:1.6;max-width:940px;font-weight:750}
      #jpo-partenaires .intro{margin-top:18px;border:1px solid #fde68a;background:#fffbeb;color:#78350f;border-radius:20px;padding:16px;font-size:14px;line-height:1.55;font-weight:850}
      #jpo-partenaires .content{padding:22px}
      #jpo-partenaires .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px}
      #jpo-partenaires .stat{border:1px solid var(--border);border-radius:18px;padding:14px;background:#fff}
      #jpo-partenaires .num{font-size:28px;font-weight:900;line-height:1}.lab{margin-top:5px;color:var(--muted);font-size:12px;font-weight:900;line-height:1.3}
      #jpo-partenaires .toolbar{display:grid;grid-template-columns:1.5fr 1fr 1.1fr;gap:10px;margin-bottom:18px;align-items:end}
      #jpo-partenaires .tool label{display:block;font-size:12px;color:#475569;font-weight:900;margin-bottom:5px;text-transform:uppercase}
      #jpo-partenaires select,#jpo-partenaires input{width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:11px;font-size:14px;font-weight:800;background:#fff}
      #jpo-partenaires .focus{margin:0 0 22px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:24px;overflow:hidden}
      #jpo-partenaires .focus-head{padding:17px 18px;border-bottom:1px solid #bfdbfe;display:flex;justify-content:space-between;gap:10px;align-items:center;background:#dbeafe}
      #jpo-partenaires .focus-title{font-size:22px;font-weight:900;letter-spacing:-.035em;color:#1e3a8a;text-transform:uppercase}
      #jpo-partenaires .focus-sub{margin-top:4px;color:#1e40af;font-size:13px;font-weight:800;line-height:1.4}
      #jpo-partenaires .focus-body{padding:14px}
      #jpo-partenaires .days{display:grid;gap:22px}
      #jpo-partenaires .day{border:1px solid var(--border);border-radius:24px;overflow:hidden;background:#fff}
      #jpo-partenaires .dayhead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:18px;background:#f8fafc;border-bottom:1px solid var(--border)}
      #jpo-partenaires .daytitle{font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-.035em}
      #jpo-partenaires .daymeta{margin-top:4px;color:#64748b;font-size:13px;font-weight:850;line-height:1.4}
      #jpo-partenaires .badge{border-radius:999px;background:#e2e8f0;color:#334155;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}
      #jpo-partenaires .timegroup{margin:14px;border:1px solid #e7eaee;border-radius:20px;overflow:hidden;background:#fff}
      #jpo-partenaires .timehead{padding:13px 15px;background:#fbfcfd;border-bottom:1px solid #edf0f3;display:flex;justify-content:space-between;gap:10px;align-items:center}
      #jpo-partenaires .time{font-size:19px;font-weight:900;letter-spacing:-.02em}
      #jpo-partenaires .time-sub{font-size:12px;color:#64748b;font-weight:900;margin-top:3px}
      #jpo-partenaires .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;padding:12px}
      #jpo-partenaires .card{border:1px solid var(--border);border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,.04)}
      #jpo-partenaires .card.strong{border-color:#fbbf24;background:linear-gradient(180deg,#fffbeb 0,#fff 80%)}
      #jpo-partenaires .top{padding:14px;background:#fbfcfd;border-bottom:1px solid #edf0f3}
      #jpo-partenaires .tagline{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px}
      #jpo-partenaires .chip{border-radius:999px;background:#f1f5f9;color:#334155;padding:5px 8px;font-size:11px;font-weight:900}
      #jpo-partenaires .chip.gold{background:#fef3c7;color:#92400e}.chip.green{background:#dcfce7;color:#166534}.chip.blue{background:#dbeafe;color:#1e40af}.chip.purple{background:#f3e8ff;color:#6b21a8}
      #jpo-partenaires .title{font-size:18px;line-height:1.22;font-weight:900;letter-spacing:-.02em}
      #jpo-partenaires .desc{margin-top:9px;color:#475569;font-size:13px;line-height:1.45;font-weight:750}
      #jpo-partenaires .body{padding:14px;color:#334155;font-size:13px;line-height:1.5;font-weight:800}
      #jpo-partenaires .btn{border:0;background:#111827;color:#fff;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;margin-top:10px}
      #jpo-partenaires .empty{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:18px;padding:18px;font-weight:850;line-height:1.45}
      #jpo-partenaires .modal{display:none;position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.55);padding:20px;align-items:center;justify-content:center}
      #jpo-partenaires .modal.open{display:flex}#jpo-partenaires .box{width:min(860px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px;padding:28px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.24)}
      #jpo-partenaires .close{position:absolute;top:10px;right:14px;border:0;background:transparent;font-size:32px;cursor:pointer;color:#111827}
      #jpo-partenaires .modaltitle{margin:0 42px 18px 0;font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-.03em}
      #jpo-partenaires .row{display:grid;grid-template-columns:170px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px dashed #e5e7eb;line-height:1.45}.row:last-child{border-bottom:0}
      #jpo-partenaires .label{font-weight:900;color:#111827}
      #jpo-partenaires .error{color:#b91c1c;font-weight:900;white-space:pre-wrap}
      @media(max-width:840px){#jpo-partenaires .toolbar,#jpo-partenaires .stats{grid-template-columns:1fr}#jpo-partenaires .row{grid-template-columns:1fr;gap:4px}#jpo-partenaires .head,#jpo-partenaires .content{padding:18px}}
    </style>
    <div class="wrap">
      <div class="head">
        <h2>JPO 2026 - repères partenaires</h2>
        <p class="sub">Une page de lecture institutionnelle pour identifier les meilleurs moments de venue : événements à l'auditorium et pics de fréquentation dans le Conservatoire, y compris sur les temps scolaires.</p>
        <div class="intro"><strong>Objectif :</strong> aider les partenaires, élus et invités institutionnels à venir au bon moment. Cette sélection ne sert pas à réserver : elle met en évidence les temps où la présence publique, scolaire ou artistique est la plus significative.</div>
      </div>
      <div class="content">
        <div id="jpo-partenaires-error" class="error"></div>
        <div class="stats" id="jpo-partenaires-stats"></div>
        <div class="toolbar">
          <div class="tool"><label>Recherche</label><input id="jpo-partenaires-search" type="search" placeholder="Chercher un événement, une salle, un établissement..."></div>
          <div class="tool"><label>Jour</label><select id="jpo-partenaires-day"></select></div>
          <div class="tool"><label>Affichage</label><select id="jpo-partenaires-focus"><option value="all">Auditorium + pics de fréquentation</option><option value="crowd">Pics de fréquentation uniquement</option><option value="auditorium">Auditorium uniquement</option></select></div>
        </div>
        <section class="focus" id="jpo-partenaires-focus-section"></section>
        <div class="days" id="jpo-partenaires-output"></div>
      </div>
    </div>
    <div class="modal" id="jpo-partenaires-modal"><div class="box"><button type="button" class="close" data-close-modal>&times;</button><h3 class="modaltitle" id="jpo-partenaires-modal-title"></h3><div id="jpo-partenaires-modal-body"></div></div></div>
  `;

  const $ = id => document.getElementById(id);

  function esc(v){return String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
  function norm(v){return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}
  function slug(v){return norm(v).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"slot";}
  function compact(v){return String(v||"").replace(/\D/g,"").padStart(4,"0").slice(0,4);}
  function parseNumber(v){const n=parseInt(String(v||"").replace(/[^\d]/g,""),10);return isNaN(n)?0:n;}
  function findCol(headers,names){const hs=headers.map(norm);for(const n of names){const k=norm(n);const i=hs.findIndex(h=>h===k);if(i!==-1)return i;}for(const n of names){const k=norm(n);const i=hs.findIndex(h=>h.includes(k));if(i!==-1)return i;}return -1;}
  function parseCSV(text){const rows=[];let row=[],cur="",q=false;for(let i=0;i<text.length;i++){const ch=text[i],nx=text[i+1];if(ch==='"'){if(q&&nx==='"'){cur+='"';i++;}else q=!q;}else if(ch===","&&!q){row.push(cur);cur="";}else if((ch==="\n"||ch==="\r")&&!q){if(ch==="\r"&&nx==="\n")i++;row.push(cur);rows.push(row);row=[];cur="";}else cur+=ch;}row.push(cur);rows.push(row);return rows.filter(r=>r.some(c=>String(c||"").trim()!==""));}
  function parseDateFR(v){const s=String(v||"").trim();if(/^2026-06-\d{2}/.test(s))return s.slice(0,10);const low=norm(s);const found=DAYS.find(d=>low.includes(norm(d.label))||low.includes(norm(d.short))||low.includes(d.iso));if(found)return found.iso;const m=s.match(/(\d{1,2})[\/\-](\d{1,2})/);if(m)return "2026-"+String(m[2]).padStart(2,"0")+"-"+String(m[1]).padStart(2,"0");return null;}
  function minutes(v){const s=String(v||"").trim().replace("h",":");const m=s.match(/(\d{1,2})(?::(\d{2}))?/);return m?parseInt(m[1],10)*60+parseInt(m[2]||"0",10):null;}
  function timeFromMin(m){return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");}
  function showTime(v){const m=minutes(v);return m===null?(v||""):timeFromMin(m).replace(":","h");}
  function durationMinutes(v,format){const txt=norm((v||"")+" "+(format||""));const n=parseNumber(v);if(txt.includes("journee"))return 420;if(txt.includes("demi"))return 180;if(txt.includes("2h"))return 120;if(txt.includes("1h30"))return 90;if(n&&n<10)return n*60;if(n)return n;return 60;}
  function roomInfo(v,precision){const s=norm((v||"")+" "+(precision||"")),p=String(precision||"").trim();if(s.includes("auditorium"))return{key:"auditorium",...ROOM_DEFAULTS.auditorium};if(s.includes("orchestre"))return{key:"orchestre",...ROOM_DEFAULTS.orchestre};if(s.includes("chant")&&!s.includes("choeur")&&!s.includes("chœur"))return{key:"chant",...ROOM_DEFAULTS.chant};if(s.includes("choeur")||s.includes("chœur"))return{key:"choeur",...ROOM_DEFAULTS.choeur};if(s.includes("theatre")||s.includes("théâtre"))return{key:"theatre",...ROOM_DEFAULTS.theatre};if(s.includes("danse 2"))return{key:"danse2",...ROOM_DEFAULTS.danse2};if(s.includes("danse 3"))return{key:"danse3",...ROOM_DEFAULTS.danse3};if(s.includes("danse"))return{key:"danse1",...ROOM_DEFAULTS.danse1};if(s.includes("eveil")||s.includes("éveil"))return{key:"eveil",...ROOM_DEFAULTS.eveil};if(s.includes("arbitrer"))return{key:"any",...ROOM_DEFAULTS.any};if(s.includes("autre")||p)return{key:"other",short:p||"Autre",label:p||ROOM_DEFAULTS.other.label,capacity:35,pole:"Autre espace"};return{key:"other",short:v||"Autre",label:v||"Lieu à préciser",capacity:35,pole:"Autre espace"};}
  function slotId(date,start,end,room,title,index){return [date,compact(start),compact(end),room,slug(title),index].join("|");}
  function slotPrefix(slot){return [slot.dateIso,compact(slot.start),compact(slot.end),slot.roomKey].join("|")+"|";}
  function accepted(status){const s=norm(status);return !s||s.includes("accept");}
  function statusInfo(status){const s=norm(status);if(s.includes("refus"))return"refused";if(s.includes("verifier")||s.includes("attente"))return"pending";return"accepted";}
  function compareSlots(a,b){return (a.dateIso||"").localeCompare(b.dateIso||"")||(minutes(a.start)??9999)-(minutes(b.start)??9999)||a.title.localeCompare(b.title);}

  function buildSlots(rows){
    const h=rows[0]||[], data=rows.slice(1), out=[];
    const C_NAME=findCol(h,["Nom et prénom","Nom"]), C_DISC=findCol(h,["Discipline / département","Discipline"]), C_TITLE=findCol(h,["Intitulé du projet","Intitule du projet","Projet"]), C_TYPE=findCol(h,["Type de proposition","Type"]), C_PUBLIC=findCol(h,["Public visé","Public"]), C_DATE=findCol(h,["Date souhaitée","Date"]), C_TIME=findCol(h,["Horaire de début","Horaire","Heure"]), C_DUR=findCol(h,["Durée estimée","Durée"]), C_ROOM=findCol(h,["Lieu souhaité","Lieu"]), C_CAP=findCol(h,["Nombre estimé","spectateurs","participants"]), C_TECH=findCol(h,["Besoins techniques"]), C_DESC=findCol(h,["Description courte","programmation","communication"]), C_STATUS=findCol(h,["STATUT","Statut"]), C_AUTO=findCol(h,["Programmation automatique sur plusieurs créneaux ?","Programmation automatique"]), C_ROOM_FINAL=findCol(h,["SALLE RETENUE CRD","Salle retenue CRD","Salle retenue"]), C_PREC=findCol(h,["PRÉCISION SALLE / LIEU CRD","PRECISION SALLE / LIEU CRD","Précision salle","Precision salle","Précision lieu","Precision lieu"]), C_CAPCRD=findCol(h,["CAPACITÉ CRD","CAPACITE CRD","Capacité CRD","Capacite CRD"]), C_FORMAT=findCol(h,["FORMAT CRD","Format CRD"]), C_POLE=findCol(h,["PÔLE CRD","POLE CRD","Pôle CRD","Pole CRD"]);
    data.forEach((row,index)=>{
      const title=C_TITLE!==-1&&row[C_TITLE]?row[C_TITLE]:"Proposition sans titre";
      const rawStatus=C_STATUS!==-1?row[C_STATUS]:"";
      if(!accepted(rawStatus))return;
      const finalRoom=C_ROOM_FINAL!==-1?row[C_ROOM_FINAL]:"", precision=C_PREC!==-1?row[C_PREC]:"", fallbackRoom=C_ROOM!==-1?row[C_ROOM]:"";
      const room=roomInfo(finalRoom||fallbackRoom,precision);
      const capCRD=C_CAPCRD!==-1?parseNumber(row[C_CAPCRD]):0;
      const estimated=C_CAP!==-1?parseNumber(row[C_CAP]):0;
      const capacity=capCRD||room.capacity||35;
      const format=C_FORMAT!==-1?row[C_FORMAT]:"", duration=C_DUR!==-1?row[C_DUR]:"";
      const common={originalIndex:index+2,title,name:C_NAME!==-1?row[C_NAME]:"",discipline:C_DISC!==-1?row[C_DISC]:"",type:C_TYPE!==-1?row[C_TYPE]:"",publicTarget:C_PUBLIC!==-1?row[C_PUBLIC]:"",description:C_DESC!==-1?row[C_DESC]:"",tech:C_TECH!==-1?row[C_TECH]:"",duration,crdFormat:format,pole:C_POLE!==-1&&row[C_POLE]?row[C_POLE]:room.pole,roomKey:room.key,roomLabel:precision||room.label,capacity,estimated,status:statusInfo(rawStatus),rawStatus,autoLabel:C_AUTO!==-1?row[C_AUTO]:""};
      const autoMode=norm(common.autoLabel);
      if(autoMode.includes("oui")){
        AUTO_DAYS.forEach(dateIso=>AUTO_SLOTS.forEach(pair=>out.push({...common,id:slotId(dateIso,pair[0],pair[1],room.key,title,index),dateIso,start:pair[0],end:pair[1],autoGenerated:true})));
      } else {
        const dateIso=C_DATE!==-1?parseDateFR(row[C_DATE]):null, start=C_TIME!==-1?row[C_TIME]:"";
        const startMin=minutes(start);
        if(!dateIso||startMin===null)return;
        const end=timeFromMin(startMin+durationMinutes(duration,format));
        out.push({...common,id:slotId(dateIso,start,end,room.key,title,index),dateIso,start:timeFromMin(startMin),end,autoGenerated:false});
      }
    });
    return out.sort(compareSlots);
  }

  function buildReservations(rows){
    const map={}; if(!rows.length)return map;
    const headers=rows[0]||[], data=rows.slice(1);
    const C_IDS=findCol(headers,["IDs créneaux","IDs creneaux","IDS créneaux","IDS creneaux"]);
    const C_VALID=findCol(headers,["VALIDATION CRD","Validation CRD"]);
    const C_EST=findCol(headers,["Établissement","Etablissement","Nom de l’établissement","Nom de l'etablissement","Structure","École","Ecole","Nom de l’école","Nom de l'ecole","Organisme"]);
    data.forEach(row=>{
      const validation=C_VALID!==-1?norm(row[C_VALID]):"";
      if(validation==="non")return;
      const establishment=C_EST!==-1&&row[C_EST]?String(row[C_EST]).trim():"";
      const ids=C_IDS!==-1&&row[C_IDS]?row[C_IDS]:(row.find(cell=>/2026-06-\d{2}\|\d{4}\|\d{4}\|/.test(String(cell||"")))||"");
      String(ids).split(";").map(x=>x.trim()).filter(Boolean).forEach(line=>{
        const parts=line.split("|").map(x=>x.trim()); if(parts.length<8)return;
        const id=parts.slice(0,5).join("|");
        const group=parts[5]||"Groupe non précisé";
        const students=parseNumber(parts[6]), adults=parseNumber(parts[7]), total=students+adults;
        if(!id||!total)return;
        if(!map[id])map[id]={confirmed:0,pending:0,details:[]};
        const state=validation==="oui"?"confirmed":"pending";
        if(state==="confirmed")map[id].confirmed+=total; else map[id].pending+=total;
        map[id].details.push({group,establishment,students,adults,total,state});
      });
    });
    return map;
  }

  function applyReservations(slots,reservations){
    return slots.map(slot=>{
      let reservation=reservations[slot.id];
      if(!reservation){
        reservation={confirmed:0,pending:0,details:[]};
        const prefix=slotPrefix(slot);
        Object.keys(reservations).forEach(id=>{if(id.indexOf(prefix)===0){reservation.confirmed+=reservations[id].confirmed||0;reservation.pending+=reservations[id].pending||0;(reservations[id].details||[]).forEach(d=>reservation.details.push(d));}});
      }
      const people=(reservation.confirmed||0)+(reservation.pending||0);
      const estimatedPeople=people || slot.estimated || slot.capacity || 0;
      return {...slot,confirmed:reservation.confirmed||0,pendingDemand:reservation.pending||0,reservationDetails:reservation.details||[],people,estimatedPeople};
    });
  }

  function formatDate(iso){const d=DAYS.find(x=>x.iso===iso);return d?d.label:(iso||"Date à préciser");}
  function overlaps(a,b){const as=minutes(a.start),ae=minutes(a.end),bs=minutes(b.start),be=minutes(b.end);if(as===null||ae===null||bs===null||be===null)return false;return as<be&&bs<ae;}
  function isAuditorium(slot){return slot.roomKey==="auditorium";}
  function dayPeakSlots(daySlots){
    return daySlots.map(s=>{
      const same=daySlots.filter(o=>overlaps(s,o));
      const total=same.reduce((sum,o)=>sum+(o.people || (isAuditorium(o)?o.estimatedPeople:0)),0);
      return {...s,peakTotal:total,peakSlots:same};
    });
  }
  function isCrowdMoment(slot){return (slot.peakTotal||0)>=CROWD_THRESHOLD;}
  function isVisible(slot){if(activeFocus==="auditorium")return isAuditorium(slot);if(activeFocus==="crowd")return isCrowdMoment(slot);return isAuditorium(slot)||isCrowdMoment(slot);}
  function reason(slot){if(isAuditorium(slot)&&isCrowdMoment(slot))return "Auditorium + forte présence dans le Conservatoire";if(isAuditorium(slot))return "Événement à l'auditorium";return "Pic de fréquentation dans le Conservatoire";}
  function publicLine(slot){const p=slot.people||0;if(p>0)return p+" personne(s) positionnée(s)"+(slot.pendingDemand?" dont "+slot.pendingDemand+" en attente":"");return "Fréquentation indicative du créneau";}

  function computeVisible(){
    const withPeak=[];
    DAYS.forEach(d=>withPeak.push(...dayPeakSlots(allSlots.filter(s=>s.dateIso===d.iso))));
    visibleSlots=withPeak.filter(s=>{
      if(activeDay!=="all"&&s.dateIso!==activeDay)return false;
      if(!isVisible(s))return false;
      if(searchTerm){
        const publics=(s.reservationDetails||[]).map(d=>[d.establishment,d.group,d.total].join(" ")).join(" ");
        const hay=norm([s.title,s.name,s.discipline,s.type,s.roomLabel,s.description,s.publicTarget,publics].join(" "));
        if(!hay.includes(norm(searchTerm)))return false;
      }
      return true;
    }).sort(compareSlots);
  }

  function renderControls(){
    $("jpo-partenaires-day").innerHTML='<option value="all">Toute la semaine</option>'+DAYS.map(d=>'<option value="'+esc(d.iso)+'">'+esc(d.label)+'</option>').join("");
  }
  function renderStats(){
    const aud=visibleSlots.filter(isAuditorium).length;
    const crowd=visibleSlots.filter(isCrowdMoment).length;
    const people=visibleSlots.reduce((sum,s)=>sum+(s.people||0),0);
    $("jpo-partenaires-stats").innerHTML=[[visibleSlots.length,"temps affichés"],[aud,"événements auditorium"],[crowd,"pics de fréquentation"],[people,"personnes positionnées"]].map(s=>'<div class="stat"><div class="num">'+s[0]+'</div><div class="lab">'+esc(s[1])+'</div></div>').join("");
  }
  function renderFocus(){
    const peaks=visibleSlots.filter(s=>isAuditorium(s)||isCrowdMoment(s)).sort((a,b)=>(b.peakTotal||0)-(a.peakTotal||0)).slice(0,6);
    if(!peaks.length){$("jpo-partenaires-focus-section").innerHTML="";return;}
    $("jpo-partenaires-focus-section").innerHTML='<div class="focus-head"><div><div class="focus-title">Moments à privilégier</div><div class="focus-sub">Sélection automatique : auditorium et créneaux où plusieurs publics sont présents simultanément dans le Conservatoire.</div></div><div class="badge">'+peaks.length+' repères</div></div><div class="focus-body"><div class="cards">'+peaks.map(renderCard).join("")+'</div></div>';
  }
  function renderCard(slot){
    const strong=(isAuditorium(slot)||isCrowdMoment(slot))?" strong":"";
    return '<article class="card'+strong+'"><div class="top"><div class="tagline">'+
      (isAuditorium(slot)?'<span class="chip gold">Auditorium</span>':'')+
      (isCrowdMoment(slot)?'<span class="chip purple">Moment fréquenté</span>':'')+
      '<span class="chip blue">'+esc(formatDate(slot.dateIso))+'</span><span class="chip">'+esc(showTime(slot.start))+'</span></div><div class="title">'+esc(slot.title)+'</div>'+
      (slot.description?'<div class="desc">'+esc(slot.description)+'</div>':'')+
      '</div><div class="body"><strong>'+esc(slot.roomLabel)+'</strong><br>'+esc(reason(slot))+'<br>'+esc(publicLine(slot))+'<br>'+esc(slot.type||slot.discipline||"Proposition")+'<br><button type="button" class="btn" data-slot-id="'+esc(slot.id)+'">Voir le détail</button></div></article>';
  }
  function renderDays(){
    if(!visibleSlots.length){$("jpo-partenaires-output").innerHTML='<div class="empty">Aucun temps partenaire à afficher avec ces filtres.</div>';return;}
    const days=(activeDay==="all"?DAYS:DAYS.filter(d=>d.iso===activeDay));
    $("jpo-partenaires-output").innerHTML=days.map(day=>{
      const ds=visibleSlots.filter(s=>s.dateIso===day.iso); if(!ds.length)return"";
      const groups={}; ds.forEach(s=>{const t=showTime(s.start);(groups[t]||(groups[t]=[])).push(s);});
      return '<section class="day"><div class="dayhead"><div><div class="daytitle">'+esc(day.label)+'</div><div class="daymeta">Événements auditorium et/ou moments où un public est déjà positionné dans le Conservatoire.</div></div><div class="badge">'+ds.length+' repère(s)</div></div>'+Object.keys(groups).sort((a,b)=>(minutes(a)??9999)-(minutes(b)??9999)).map(t=>{const total=Math.max(...groups[t].map(s=>s.peakTotal||0));return '<div class="timegroup"><div class="timehead"><div><div class="time">'+esc(t)+'</div><div class="time-sub">Présence cumulée repérée : '+total+' personne(s)</div></div><div class="badge">'+groups[t].length+'</div></div><div class="cards">'+groups[t].map(renderCard).join("")+'</div></div>';}).join("")+'</section>';
    }).join("")||'<div class="empty">Aucun temps partenaire à afficher avec ces filtres.</div>';
  }
  function rowHtml(label,value){return '<div class="row"><span class="label">'+esc(label)+'</span><span>'+esc(value||"—")+'</span></div>';}
  function publicDetails(slot){const d=slot.reservationDetails||[];if(!d.length)return "Aucun public scolaire/partenaire positionné précisément sur cette proposition.";return d.map(x=>(x.establishment?x.establishment+' - ':"")+x.group+" : "+x.total+" personne(s)"+(x.state==="confirmed"?" confirmé":" en attente")).join("\n");}
  function openSlot(id){const s=visibleSlots.find(x=>x.id===id)||allSlots.find(x=>x.id===id);if(!s)return;$("jpo-partenaires-modal-title").textContent=s.title;$("jpo-partenaires-modal-body").innerHTML=rowHtml("Date / horaire",formatDate(s.dateIso)+" - "+showTime(s.start)+(s.end?" à "+showTime(s.end):""))+rowHtml("Lieu",s.roomLabel)+rowHtml("Pourquoi venir",reason(s))+rowHtml("Présence cumulée",(s.peakTotal||0)+" personne(s) sur le créneau")+rowHtml("Publics positionnés",publicDetails(s))+rowHtml("Type",s.type)+rowHtml("Pôle",s.pole||s.discipline)+rowHtml("Public visé",s.publicTarget)+rowHtml("Description",s.description)+rowHtml("Intervenant(s)",s.name)+rowHtml("Besoins techniques",s.tech);$("jpo-partenaires-modal").classList.add("open");}
  function render(){computeVisible();renderStats();renderFocus();renderDays();}
  function bind(){
    $("jpo-partenaires-search").addEventListener("input",function(){searchTerm=this.value;render();});
    $("jpo-partenaires-day").addEventListener("change",function(){activeDay=this.value;render();});
    $("jpo-partenaires-focus").addEventListener("change",function(){activeFocus=this.value;render();});
    root.addEventListener("click",function(e){const b=e.target.closest("[data-slot-id]");if(b)openSlot(b.getAttribute("data-slot-id"));if(e.target.matches("[data-close-modal]"))$("jpo-partenaires-modal").classList.remove("open");});
    $("jpo-partenaires-modal").addEventListener("click",function(e){if(e.target.id==="jpo-partenaires-modal")this.classList.remove("open");});
  }

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(r=>{if(!r.ok)throw new Error("CSV propositions HTTP "+r.status);return r.text();}),
    fetch(DEMANDES_CSV).then(r=>{if(!r.ok)throw new Error("CSV demandes HTTP "+r.status);return r.text();})
  ]).then(([propText,demText])=>{
    const reservations=buildReservations(parseCSV(demText));
    allSlots=applyReservations(buildSlots(parseCSV(propText)),reservations);
    renderControls();bind();render();
  }).catch(err=>{$("jpo-partenaires-error").textContent="Erreur lors du chargement : "+err.message;});
});
