document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jps-ecoles");
  if (!root) {
    root = document.createElement("div");
    root.id = "jps-ecoles";
    document.body.appendChild(root);
  }

  const PROPOSITIONS_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlOuGBqQd5-kgMjcd_8qx2q52HrHsBfEtNH_ZtZWgw2hQkHgOY99yIY37PxPppODZRNvIa3C9m0Jnv/pub?gid=1276704150&single=true&output=csv";

  const DEMANDES_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsA_JKLqgZg_VcrL_-g7PEp_8hVy8XudkP6EBXbiOlHNindQlK4zF8n4Ul3u1xuJu2rTOmr_ySckJN/pub?gid=2115667462&single=true&output=csv";

  const FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSft8sOo5NyYM601oxbWL8yxUpNus4fpw-u4-WJN8Al-tzajIA/viewform";

  const ENTRY_DETAIL = "entry.644632031";
  const ENTRY_IDS = "entry.820169616";
  const STORAGE_KEY = "jps_ecoles_v21_panier";
  const LAST_GROUP_KEY = "jps_ecoles_v21_last_group";

  const DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15/06" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16/06" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17/06" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18/06" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19/06" }
  ];

  const AUTO_DAYS = ["2026-06-15", "2026-06-16", "2026-06-18", "2026-06-19"];
  const AUTO_SLOTS = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
    ["16:00", "17:00"]
  ];

  const ROOM_DEFAULTS = {
    auditorium: { label: "Auditorium", short: "Aud.", capacity: 160, pole: "Auditorium / présentations" },
    orchestre: { label: "Salle d’orchestre", short: "Orch.", capacity: 30, pole: "Orchestre / instruments" },
    chant: { label: "Salle de chant", short: "Chant", capacity: 30, pole: "Voix / chant / chœur" },
    choeur: { label: "Salle de chœur", short: "Chœur", capacity: 30, pole: "Voix / chant / chœur" },
    theatre: { label: "Salle de théâtre", short: "Théâtre", capacity: 30, pole: "Théâtre" },
    danse1: { label: "Studio de danse 1", short: "Danse 1", capacity: 30, pole: "Danse" },
    danse2: { label: "Studio de danse 2", short: "Danse 2", capacity: 30, pole: "Danse" },
    danse3: { label: "Studio de danse 3", short: "Danse 3", capacity: 30, pole: "Danse" },
    other: { label: "Autre espace / salle précisée", short: "Autre", capacity: 30, pole: "Autre salle / petit groupe" },
    any: { label: "À arbitrer", short: "À arbitrer", capacity: 30, pole: "À arbitrer" }
  };

  let allSlots = [];
  let activeDay = "2026-06-15";
  let cart = loadCart();
  let currentSlot = null;

  root.innerHTML = `
    <style>
      #jps-ecoles{
        --text:#111827;
        --muted:#64748b;
        --border:#e5e7eb;
        --soft:#f8fafc;
        --blue:#2563eb;
        --green:#16a34a;
        --orange:#f97316;
        --red:#dc2626;
        font-family:Arial,sans-serif;
        color:var(--text);
        width:100%;
      }

      #jps-ecoles *{box-sizing:border-box}

      #jps-ecoles .wrap{
        max-width:1080px;
        margin:0 auto;
        background:#fff;
        border:1px solid var(--border);
        border-radius:26px;
        overflow:hidden;
        box-shadow:0 18px 50px rgba(15,23,42,.08);
      }

      #jps-ecoles .head{
        padding:30px;
        background:
          radial-gradient(circle at top right,rgba(37,99,235,.13),transparent 34%),
          radial-gradient(circle at top left,rgba(22,163,74,.11),transparent 30%),
          #fff;
        border-bottom:1px solid var(--border);
      }

      #jps-ecoles h2{
        margin:0;
        font-size:clamp(28px,4vw,42px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #jps-ecoles .sub{
        margin:12px 0 0;
        color:var(--muted);
        font-size:16px;
        line-height:1.55;
        max-width:900px;
      }

      #jps-ecoles .notice{
        margin-top:18px;
        border:1px solid #bfdbfe;
        background:#eff6ff;
        color:#1e3a8a;
        border-radius:18px;
        padding:14px;
        font-size:14px;
        line-height:1.45;
        font-weight:800;
      }

      #jps-ecoles .content{padding:22px}

      #jps-ecoles .steps{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:10px;
        margin-bottom:18px;
      }

      #jps-ecoles .step{
        border:1px solid var(--border);
        border-radius:18px;
        padding:13px;
        background:#fff;
      }

      #jps-ecoles .step strong{
        display:block;
        font-size:14px;
        margin-bottom:4px;
      }

      #jps-ecoles .step span{
        color:var(--muted);
        font-size:12px;
        font-weight:800;
        line-height:1.35;
      }

      #jps-ecoles .stats{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:10px;
        margin-bottom:18px;
      }

      #jps-ecoles .stat{
        border:1px solid var(--border);
        border-radius:16px;
        padding:13px;
        background:#fff;
      }

      #jps-ecoles .num{
        font-size:26px;
        font-weight:900;
        line-height:1;
      }

      #jps-ecoles .lab{
        margin-top:5px;
        color:var(--muted);
        font-size:12px;
        font-weight:800;
        line-height:1.3;
      }

      #jps-ecoles .filters{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(135px,1fr));
        gap:8px;
        margin-bottom:20px;
      }

      #jps-ecoles .filter{
        border:1px solid #d1d5db;
        background:#fff;
        border-radius:16px;
        padding:12px 14px;
        font-size:14px;
        font-weight:900;
        cursor:pointer;
        text-align:center;
      }

      #jps-ecoles .filter.active{
        background:#111827;
        color:#fff;
        border-color:#111827;
        box-shadow:0 10px 22px rgba(15,23,42,.14);
      }

      #jps-ecoles .day{
        border:1px solid #e7eaee;
        border-radius:24px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .dayhead{
        display:flex;
        justify-content:space-between;
        gap:12px;
        padding:20px;
        background:#f8fafc;
        border-bottom:1px solid var(--border);
      }

      #jps-ecoles .daytitle{
        font-size:24px;
        font-weight:900;
        text-transform:uppercase;
        letter-spacing:-.03em;
      }

      #jps-ecoles .daymeta{
        margin-top:4px;
        color:var(--muted);
        font-size:14px;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .badge{
        align-self:flex-start;
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:7px 10px;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #jps-ecoles .daybody{padding:16px}

      #jps-ecoles .choice-hint{
        margin:0 0 16px;
        color:#475569;
        font-weight:800;
        line-height:1.45;
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:16px;
        padding:13px;
      }

      #jps-ecoles .timegroup{
        margin-bottom:18px;
        border:1px solid #e7eaee;
        border-radius:22px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .timegroup-head{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        padding:16px 18px;
        background:#f8fafc;
        border-bottom:1px solid var(--border);
      }

      #jps-ecoles .timegroup-title{
        font-size:23px;
        font-weight:900;
        letter-spacing:-.03em;
      }

      #jps-ecoles .timegroup-sub{
        font-size:13px;
        font-weight:800;
        color:var(--muted);
        margin-top:3px;
      }

      #jps-ecoles .timegroup-count{
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:6px 10px;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #jps-ecoles .timegroup-body{padding:14px}

      #jps-ecoles .grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
        gap:12px;
      }

      #jps-ecoles .card{
        border:1px solid var(--border);
        border-radius:20px;
        overflow:hidden;
        background:#fff;
        transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;
      }

      #jps-ecoles .card:not(.is-full):hover{
        transform:translateY(-2px);
        box-shadow:0 14px 30px rgba(15,23,42,.08);
        border-color:#cbd5e1;
      }

      #jps-ecoles .card.is-full{
        background:#f8fafc;
        opacity:.74;
      }

      #jps-ecoles .top{
        padding:14px;
        background:#fbfcfd;
        border-bottom:1px solid #edf0f3;
      }

      #jps-ecoles .choice-label{
        display:inline-flex;
        align-items:center;
        gap:6px;
        border-radius:999px;
        background:#eef2ff;
        color:#3730a3;
        padding:5px 9px;
        font-size:11px;
        font-weight:900;
      }

      #jps-ecoles .title{
        margin-top:8px;
        font-size:18px;
        line-height:1.25;
        font-weight:900;
      }

      #jps-ecoles .simple-meta{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        margin-top:8px;
      }

      #jps-ecoles .simple-pill{
        border-radius:999px;
        background:#f1f5f9;
        color:#334155;
        padding:5px 8px;
        font-size:11px;
        font-weight:900;
      }

      #jps-ecoles .desc-preview{
        margin:10px 0 0;
        color:#475569;
        font-size:13px;
        line-height:1.45;
        font-weight:700;
      }

      #jps-ecoles .body{padding:14px}

      #jps-ecoles .simple-remaining{
        display:flex;
        align-items:baseline;
        gap:6px;
        margin:4px 0 8px;
      }

      #jps-ecoles .simple-remaining strong{
        font-size:34px;
        line-height:1;
        font-weight:900;
        color:#166534;
      }

      #jps-ecoles .simple-remaining span{
        font-size:13px;
        color:#475569;
        font-weight:900;
      }

      #jps-ecoles .simple-remaining.low strong{color:#9a3412}
      #jps-ecoles .simple-remaining.zero strong{color:#991b1b}

      #jps-ecoles .meta{
        color:#475569;
        font-size:13px;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .card-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:12px;
      }

      #jps-ecoles button{font-family:inherit}

      #jps-ecoles .btn,
      #jps-ecoles .btn2{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border-radius:14px;
        padding:12px 14px;
        font-size:14px;
        font-weight:900;
        text-align:center;
        cursor:pointer;
      }

      #jps-ecoles .btn{
        border:0;
        background:#111827;
        color:#fff;
      }

      #jps-ecoles .btn.disabled{
        background:#cbd5e1;
        color:#475569;
        pointer-events:none;
      }

      #jps-ecoles .btn2{
        border:1px solid #d1d5db;
        background:#fff;
        color:#111827;
      }

      #jps-ecoles .empty{
        border:1px dashed #cbd5e1;
        border-radius:18px;
        padding:18px;
        background:#fbfcfd;
        color:#64748b;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .error{
        color:#b91c1c;
        font-weight:900;
        white-space:pre-wrap;
      }

      #jps-ecoles .cartbar{
        position:sticky;
        bottom:14px;
        z-index:50;
        margin:22px auto 0;
        max-width:1080px;
        border:1px solid #c7d2fe;
        background:#eef2ff;
        border-radius:22px;
        padding:14px;
        box-shadow:0 18px 50px rgba(15,23,42,.12);
      }

      #jps-ecoles .cartinner{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
      }

      #jps-ecoles .carttitle{
        font-weight:900;
        font-size:16px;
      }

      #jps-ecoles .cartmeta{
        margin-top:3px;
        color:#4338ca;
        font-size:13px;
        font-weight:800;
      }

      #jps-ecoles .modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:999999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #jps-ecoles .modal.open{display:flex}

      #jps-ecoles .box{
        width:min(900px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #jps-ecoles .close{
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #jps-ecoles .modaltitle{
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.15;
        font-weight:900;
      }

      #jps-ecoles .row{
        display:grid;
        grid-template-columns:180px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #jps-ecoles .row:last-child{border-bottom:0}
      #jps-ecoles .label{font-weight:900}

      #jps-ecoles .formgrid{
        display:grid;
        grid-template-columns:2fr 1fr 1fr;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .field label{
        display:block;
        font-size:12px;
        color:#475569;
        font-weight:900;
        margin-bottom:5px;
        text-transform:uppercase;
      }

      #jps-ecoles .field input{
        width:100%;
        border:1px solid #cbd5e1;
        border-radius:14px;
        padding:12px;
        font-size:15px;
        font-weight:800;
      }

      #jps-ecoles .help{
        margin-top:8px;
        color:#64748b;
        font-size:13px;
        font-weight:800;
        line-height:1.4;
      }

      #jps-ecoles .warning{
        margin-top:12px;
        border:1px solid #fed7aa;
        background:#fff7ed;
        color:#9a3412;
        border-radius:14px;
        padding:10px;
        font-size:13px;
        font-weight:900;
        line-height:1.35;
      }

      #jps-ecoles .reusebox{
        margin-top:14px;
        border:1px solid #c7d2fe;
        background:#eef2ff;
        color:#312e81;
        border-radius:16px;
        padding:12px;
        font-size:13px;
        font-weight:900;
        line-height:1.4;
      }

      #jps-ecoles .reusebox label{
        display:flex;
        gap:8px;
        align-items:flex-start;
        cursor:pointer;
      }

      #jps-ecoles .reusebox input{
        margin-top:2px;
      }

      #jps-ecoles .reusebox small{
        display:block;
        margin-top:6px;
        color:#475569;
        font-weight:800;
      }

      #jps-ecoles .actions{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .cartlist{
        display:flex;
        flex-direction:column;
        gap:12px;
        margin-top:14px;
      }

      #jps-ecoles .groupbox{
        border:1px solid #e5e7eb;
        border-radius:18px;
        background:#fff;
        overflow:hidden;
      }

      #jps-ecoles .grouphead{
        padding:13px 14px;
        background:#f8fafc;
        border-bottom:1px solid #e5e7eb;
        font-weight:900;
      }

      #jps-ecoles .cartitem{
        padding:13px 14px;
        border-bottom:1px dashed #e5e7eb;
      }

      #jps-ecoles .cartitem:last-child{border-bottom:0}

      #jps-ecoles .cartitemtitle{
        font-weight:900;
        line-height:1.3;
      }

      #jps-ecoles .cartitemmeta{
        margin-top:6px;
        font-size:13px;
        color:#475569;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .danger{
        border:1px solid #fecaca;
        background:#fff1f2;
        color:#991b1b;
        border-radius:12px;
        padding:9px 11px;
        font-size:13px;
        font-weight:900;
        cursor:pointer;
        margin-top:8px;
      }

      #jps-ecoles .conflict{
        margin-top:10px;
        border:1px solid #fed7aa;
        background:#fff7ed;
        color:#9a3412;
        border-radius:12px;
        padding:9px;
        font-size:12px;
        font-weight:900;
      }

      @media(max-width:760px){
        #jps-ecoles .head,#jps-ecoles .content{padding:18px}
        #jps-ecoles .steps,#jps-ecoles .stats{grid-template-columns:1fr}
        #jps-ecoles .dayhead,.timegroup-head{flex-direction:column;align-items:flex-start}
        #jps-ecoles .grid{grid-template-columns:1fr}
        #jps-ecoles .row{grid-template-columns:1fr;gap:4px}
        #jps-ecoles .formgrid{grid-template-columns:1fr}
        #jps-ecoles .modal{padding:10px}
        #jps-ecoles .box{padding:20px;border-radius:20px}
      }
    </style>

    <div class="wrap">
      <div class="head">
        <h2>Semaine inaugurale du Conservatoire Henri Tomasi</h2>
        <p class="sub">
          Construisez un parcours pour une ou plusieurs classes, créneau par créneau.
        </p>
        <div class="notice">
          Les places demandées sont placées en attente dès l’envoi et retirées des disponibilités.
          La demande reste soumise à validation finale par le Conservatoire.
        </div>
      </div>

      <div class="content">
        <div class="steps">
          <div class="step"><strong>1. Choisissez un jour</strong><span>Les activités sont classées par horaires.</span></div>
          <div class="step"><strong>2. Ajoutez un parcours</strong><span>Indiquez la classe, les élèves et les accompagnateurs.</span></div>
          <div class="step"><strong>3. Envoyez une seule demande</strong><span>Le Conservatoire confirme ensuite les créneaux.</span></div>
        </div>

        <div class="stats">
          <div class="stat"><div id="jps-total" class="num">0</div><div class="lab">créneaux proposés</div></div>
          <div class="stat"><div id="jps-avail" class="num">0</div><div class="lab">créneaux disponibles</div></div>
          <div class="stat"><div id="jps-conf" class="num">0</div><div class="lab">places confirmées</div></div>
          <div class="stat"><div id="jps-pend" class="num">0</div><div class="lab">places en attente</div></div>
        </div>

        <div id="jps-filters" class="filters"></div>
        <div id="jps-days"></div>
        <div id="jps-error" class="error"></div>
      </div>
    </div>

    <div id="jps-cartbar" class="cartbar" style="display:none">
      <div class="cartinner">
        <div>
          <div class="carttitle">Panier de demande</div>
          <div id="jps-cartmeta" class="cartmeta"></div>
        </div>
        <div class="actions" style="margin-top:0">
          <button id="jps-open-cart" class="btn2" type="button">Voir le panier</button>
          <button id="jps-send" class="btn" type="button">Envoyer la demande</button>
        </div>
      </div>
    </div>

    <div id="jps-booking" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-booking">&times;</button>
        <h3 class="modaltitle">Ajouter au parcours</h3>
        <div class="row"><span class="label">Créneau</span><span id="jps-b-slot"></span></div>
        <div class="row"><span class="label">Places</span><span id="jps-b-places"></span></div>
        <div class="formgrid">
          <div class="field"><label>Classe / groupe</label><input id="jps-b-group" type="text" placeholder="Ex. CE2 A"></div>
          <div class="field"><label>Élèves</label><input id="jps-b-students" type="number" min="0" step="1" placeholder="24"></div>
          <div class="field"><label>Accompagnateurs</label><input id="jps-b-adults" type="number" min="0" step="1" placeholder="2"></div>
        </div>
        <div id="jps-reuse-box" class="reusebox" style="display:none">
          <label>
            <input id="jps-b-reuse" type="checkbox">
            <span>
              Reprendre la même classe, le même nombre d’élèves et les mêmes accompagnateurs que la sélection précédente
              <small id="jps-b-reuse-summary"></small>
            </span>
          </label>
        </div>
        <div id="jps-b-help" class="help"></div>
        <div id="jps-b-warning" class="warning" style="display:none"></div>
        <div class="actions">
          <button type="button" id="jps-b-add" class="btn">Ajouter au panier</button>
          <button type="button" data-close="jps-booking" class="btn2">Annuler</button>
        </div>
      </div>
    </div>

    <div id="jps-info" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-info">&times;</button>
        <h3 id="jps-i-title" class="modaltitle"></h3>
        <div class="row"><span class="label">Horaire</span><span id="jps-i-time"></span></div>
        <div class="row"><span class="label">Lieu</span><span id="jps-i-room"></span></div>
        <div class="row"><span class="label">Pôle</span><span id="jps-i-pole"></span></div>
        <div class="row"><span class="label">Public</span><span id="jps-i-public"></span></div>
        <div class="row"><span class="label">Type</span><span id="jps-i-type"></span></div>
        <div class="row"><span class="label">Description</span><span id="jps-i-desc"></span></div>
        <div class="row"><span class="label">Disponibilité</span><span id="jps-i-capacity"></span></div>
        <div class="actions">
          <button type="button" id="jps-i-add" class="btn">Ajouter ce créneau au panier</button>
          <button type="button" data-close="jps-info" class="btn2">Fermer</button>
        </div>
      </div>
    </div>

    <div id="jps-cart" class="modal">
      <div class="box">
        <button type="button" class="close" data-close="jps-cart">&times;</button>
        <h3 class="modaltitle">Panier de demande</h3>
        <div id="jps-cart-summary" class="help"></div>
        <div id="jps-cart-list" class="cartlist"></div>
        <div class="actions">
          <button type="button" id="jps-submit" class="btn">Envoyer la demande globale</button>
          <button type="button" id="jps-clear" class="btn2">Vider le panier</button>
        </div>
      </div>
    </div>
  `;

  function $(id) {
    return document.getElementById(id);
  }

  function norm(v) {
    return (v || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slug(s) {
    return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  }

  function parseNumber(v) {
    const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function compact(t) {
    return String(t || "").replace(":", "");
  }

  function showTime(t) {
    return String(t || "").replace(":", "h");
  }

  function formatDate(iso) {
    const d = DAYS.find(x => x.iso === iso);
    return d ? d.label : iso;
  }

  function parseCSV(text) {
    const s = String(text || "").replace(/\r/g, "");
    const rows = [];
    let row = [];
    let cur = "";
    let quoted = false;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const next = s[i + 1];

      if (ch === '"') {
        if (quoted && next === '"') {
          cur += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === "," && !quoted) {
        row.push(cur);
        cur = "";
      } else if (ch === "\n" && !quoted) {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }

    row.push(cur);
    rows.push(row);
    return rows.filter(r => r.some(c => String(c || "").trim() !== ""));
  }

  function findCol(headers, names) {
    const hs = headers.map(norm);

    for (const n of names) {
      const k = norm(n);
      const i = hs.findIndex(h => h === k);
      if (i !== -1) return i;
    }

    for (const n of names) {
      const k = norm(n);
      const i = hs.findIndex(h => h.includes(k));
      if (i !== -1) return i;
    }

    return -1;
  }

  function parseDateFR(v) {
    const t = String(v || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const p = t.split(/[\/.-]/);
    if (p.length !== 3) return null;
    let y = p[2];
    if (y.length === 2) y = "20" + y;
    return y + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0");
  }

  function fmtTime(v) {
    const t = String(v || "").trim();

    if (/^\d{1,2}:\d{2}/.test(t)) {
      const p = t.split(":");
      return p[0].padStart(2, "0") + ":" + p[1];
    }

    if (/^\d{1,2}h\d{2}$/.test(t.toLowerCase())) {
      const p = t.toLowerCase().split("h");
      return p[0].padStart(2, "0") + ":" + p[1];
    }

    return t.slice(0, 5);
  }

  function minutes(t) {
    const p = String(t || "").split(":");
    if (p.length < 2) return null;
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function timeFromMin(m) {
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  function durationToMinutes(v) {
    const d = norm(v);
    if (d.includes("45")) return 45;
    if (d.includes("30")) return 30;
    if (d.includes("1h30") || d.includes("1 h 30")) return 90;
    if (d.includes("2h") || d.includes("2 h")) return 120;
    if (d.includes("1h") || d.includes("1 h") || d.includes("60")) return 60;
    return 60;
  }

  function blockedDuration(format, fallback) {
    const f = norm(format);
    if (f.includes("bloque 30")) return 30;
    if (f.includes("bloque 1h") || f.includes("bloque 1 h")) return 60;
    return durationToMinutes(fallback);
  }

  function statusInfo(v) {
    const s = norm(v);
    if (s.includes("deplacer")) return "move";
    if (s.includes("refuse")) return "refused";
    if (s.includes("accepte")) return "accepted";
    return "pending";
  }

  function roomInfo(v, precision) {
    const s = norm(v);
    const p = String(precision || "").trim();

    if (s.includes("auditorium")) return { key: "auditorium", ...ROOM_DEFAULTS.auditorium };
    if (s.includes("orchestre")) return { key: "orchestre", ...ROOM_DEFAULTS.orchestre };
    if (s.includes("chant") && !s.includes("choeur") && !s.includes("chœur")) return { key: "chant", ...ROOM_DEFAULTS.chant };
    if (s.includes("choeur") || s.includes("chœur")) return { key: "choeur", ...ROOM_DEFAULTS.choeur };
    if (s.includes("theatre") || s.includes("théâtre")) return { key: "theatre", ...ROOM_DEFAULTS.theatre };
    if (s.includes("danse 1") || s.includes("studio de danse 1")) return { key: "danse1", ...ROOM_DEFAULTS.danse1 };
    if (s.includes("danse 2") || s.includes("studio de danse 2")) return { key: "danse2", ...ROOM_DEFAULTS.danse2 };
    if (s.includes("danse 3") || s.includes("studio de danse 3")) return { key: "danse3", ...ROOM_DEFAULTS.danse3 };
    if (s.includes("danse")) return { key: "danse1", ...ROOM_DEFAULTS.danse1 };
    if (s.includes("autre") || p) return { key: "other", short: p || "Autre", label: p || ROOM_DEFAULTS.other.label, capacity: ROOM_DEFAULTS.other.capacity, pole: ROOM_DEFAULTS.other.pole };
    if (s.includes("arbitrer") || s.includes("peu importe") || s.includes("a definir") || s.includes("à définir")) return { key: "any", ...ROOM_DEFAULTS.any };
    return { key: "other", short: v || "Autre", label: v || ROOM_DEFAULTS.other.label, capacity: ROOM_DEFAULTS.other.capacity, pole: ROOM_DEFAULTS.other.pole };
  }

  function slotId(date, start, end, room, title) {
    return [date, compact(start), compact(end), room, slug(title)].join("|");
  }

  function slotPrefix(s) {
    return [s.dateIso, compact(s.start), compact(s.end), s.roomKey].join("|") + "|";
  }

  function buildSlots(rows) {
    const headers = rows[0] || [];
    const data = rows.slice(1);
    const out = [];

    const C_NAME = findCol(headers, ["Nom et prénom", "Nom"]);
    const C_DISC = findCol(headers, ["Discipline / département", "Discipline"]);
    const C_TITLE = findCol(headers, ["Intitulé du projet", "Intitule du projet", "Projet"]);
    const C_TYPE = findCol(headers, ["Type de proposition", "Type"]);
    const C_PUBLIC = findCol(headers, ["Public visé", "Public"]);
    const C_DATE = findCol(headers, ["Date souhaitée", "Date"]);
    const C_TIME = findCol(headers, ["Horaire de début", "Horaire", "Heure"]);
    const C_DUR = findCol(headers, ["Durée estimée", "Durée"]);
    const C_ROOM = findCol(headers, ["Lieu souhaité", "Lieu"]);
    const C_CAP = findCol(headers, ["Nombre estimé", "spectateurs", "participants"]);
    const C_TECH = findCol(headers, ["Besoins techniques"]);
    const C_DESC = findCol(headers, ["Description courte", "programmation", "communication"]);
    const C_STATUS = findCol(headers, ["STATUT", "Statut"]);
    const C_AUTO = findCol(headers, ["Programmation automatique sur plusieurs créneaux ?", "Programmation automatique"]);
    const C_ROOM_FINAL = findCol(headers, ["SALLE RETENUE CRD", "Salle retenue CRD", "Salle retenue"]);
    const C_ROOM_PRECISION = findCol(headers, ["PRÉCISION SALLE / LIEU CRD", "PRECISION SALLE / LIEU CRD", "Précision salle", "Precision salle", "Précision lieu", "Precision lieu"]);
    const C_CAPACITY_CRD = findCol(headers, ["CAPACITÉ CRD", "CAPACITE CRD", "Capacité CRD", "Capacite CRD"]);
    const C_FORMAT_CRD = findCol(headers, ["FORMAT CRD", "Format CRD"]);
    const C_POLE_CRD = findCol(headers, ["PÔLE CRD", "POLE CRD", "Pôle CRD", "Pole CRD"]);

    if (C_TITLE === -1 || C_STATUS === -1) {
      throw new Error("Colonnes propositions introuvables : Intitulé du projet ou STATUT.");
    }

    data.forEach((row, index) => {
      if (statusInfo(row[C_STATUS]) !== "accepted") return;

      const title = row[C_TITLE] || "Proposition sans titre";
      const finalRoom = C_ROOM_FINAL !== -1 ? row[C_ROOM_FINAL] : "";
      const precision = C_ROOM_PRECISION !== -1 ? row[C_ROOM_PRECISION] : "";
      const fallback = C_ROOM !== -1 ? row[C_ROOM] : "";
      const room = finalRoom && !norm(finalRoom).includes("arbitrer") ? roomInfo(finalRoom, precision) : roomInfo(fallback, "");
      const capCRD = C_CAPACITY_CRD !== -1 ? parseNumber(row[C_CAPACITY_CRD]) : 0;

      let capacity = capCRD || room.capacity || 30;

      if (room.key === "auditorium") capacity = Math.min(capacity, 160);
      else if (["orchestre", "chant", "choeur", "theatre", "danse1", "danse2", "danse3", "other", "any"].includes(room.key)) capacity = Math.min(capacity, 30);

      const format = C_FORMAT_CRD !== -1 ? row[C_FORMAT_CRD] : "";
      const pole = (C_POLE_CRD !== -1 && row[C_POLE_CRD]) ? row[C_POLE_CRD] : room.pole;
      const duration = C_DUR !== -1 ? row[C_DUR] : "";
      const autoLabel = C_AUTO !== -1 ? row[C_AUTO] : "";
      const autoMode = norm(autoLabel);

      const common = {
        sourceUid: "src" + index + "_" + slug(title + room.key),
        title,
        name: C_NAME !== -1 ? row[C_NAME] : "",
        discipline: C_DISC !== -1 ? row[C_DISC] : "",
        type: C_TYPE !== -1 ? row[C_TYPE] : "",
        publicTarget: C_PUBLIC !== -1 ? row[C_PUBLIC] : "",
        description: C_DESC !== -1 ? row[C_DESC] : "",
        tech: C_TECH !== -1 ? row[C_TECH] : "",
        duration,
        crdFormat: format,
        pole,
        roomKey: room.key,
        roomLabel: room.label,
        roomShort: room.short,
        capacity,
        estimatedCapacity: C_CAP !== -1 ? row[C_CAP] : "",
        autoLabel: autoLabel || "Non"
      };

      if (autoMode.includes("oui")) {
        const days = AUTO_DAYS.slice();
        if (autoMode.includes("mercredi")) days.splice(2, 0, "2026-06-17");

        days.forEach(dateIso => {
          AUTO_SLOTS.forEach(pair => {
            out.push({
              ...common,
              id: slotId(dateIso, pair[0], pair[1], room.key, title),
              dateIso,
              start: pair[0],
              end: pair[1],
              autoGenerated: true
            });
          });
        });
      } else {
        const dateIso = C_DATE !== -1 ? parseDateFR(row[C_DATE]) : null;
        if (!dateIso || !DAYS.some(day => day.iso === dateIso)) return;

        const start = C_TIME !== -1 ? fmtTime(row[C_TIME]) : "";
        if (!start) return;

        const end = timeFromMin(minutes(start) + blockedDuration(format, duration));

        out.push({
          ...common,
          id: slotId(dateIso, start, end, room.key, title),
          dateIso,
          start,
          end,
          autoGenerated: false
        });
      }
    });

    return out.sort((a, b) => {
      if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
      if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
      return a.roomLabel.localeCompare(b.roomLabel);
    });
  }

  function buildReservations(rows) {
    const map = {};
    if (!rows.length) return map;

    const headers = rows[0] || [];
    const data = rows.slice(1);
    const C_IDS = findCol(headers, ["IDs créneaux", "IDs creneaux", "IDS créneaux", "IDS creneaux"]);
    const C_VALID = findCol(headers, ["VALIDATION CRD", "Validation CRD"]);

    data.forEach(row => {
      const validation = C_VALID !== -1 ? norm(row[C_VALID]) : "";
      if (validation === "non") return;

      const ids = C_IDS !== -1 && row[C_IDS]
        ? row[C_IDS]
        : (row.find(cell => /2026-06-\d{2}\|\d{4}\|\d{4}\|/.test(String(cell || ""))) || "");

      String(ids)
        .split(";")
        .map(x => x.trim())
        .filter(Boolean)
        .forEach(line => {
          const parts = line.split("|").map(x => x.trim());
          if (parts.length < 8) return;

          const id = parts.slice(0, 5).join("|");
          const total = parseNumber(parts[6]) + parseNumber(parts[7]);

          if (!id || !total) return;
          if (!map[id]) map[id] = { confirmed: 0, pending: 0, refused: 0 };

          if (validation === "oui") map[id].confirmed += total;
          else map[id].pending += total;
        });
    });

    window.JPS_ECOLES_DEBUG = { headers, rowsCount: rows.length, reservations: map };
    return map;
  }

  function applyReservations(slots, reservations) {
    return slots.map(slot => {
      let reservation = reservations[slot.id];

      if (!reservation) {
        reservation = { confirmed: 0, pending: 0, refused: 0 };
        const prefix = slotPrefix(slot);

        Object.keys(reservations).forEach(id => {
          if (id.indexOf(prefix) === 0) {
            reservation.confirmed += reservations[id].confirmed || 0;
            reservation.pending += reservations[id].pending || 0;
            reservation.refused += reservations[id].refused || 0;
          }
        });
      }

      const remaining = Math.max(0, slot.capacity - reservation.confirmed - reservation.pending);

      return {
        ...slot,
        confirmed: reservation.confirmed,
        pending: reservation.pending,
        remaining,
        full: remaining <= 0
      };
    });
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function loadLastGroup() {
    try {
      return JSON.parse(localStorage.getItem(LAST_GROUP_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveLastGroup(data) {
    localStorage.setItem(LAST_GROUP_KEY, JSON.stringify(data || {}));
  }

  function hasReusableGroup(data) {
    return !!(data && data.group && parseNumber(data.students) > 0);
  }

  function fillBookingFields(data) {
    $("jps-b-group").value = data.group || "";
    $("jps-b-students").value = data.students || "";
    $("jps-b-adults").value = data.adults || "";
  }

  function clearBookingFields() {
    $("jps-b-group").value = "";
    $("jps-b-students").value = "";
    $("jps-b-adults").value = "";
  }

  function setupReusePreviousBox(last) {
    const box = $("jps-reuse-box");
    const checkbox = $("jps-b-reuse");
    const summary = $("jps-b-reuse-summary");

    checkbox.checked = false;

    if (!hasReusableGroup(last)) {
      box.style.display = "none";
      summary.textContent = "";
      return;
    }

    box.style.display = "block";
    summary.textContent =
      "Dernière sélection : " +
      last.group +
      " — " +
      last.students +
      " élève(s), " +
      (last.adults || 0) +
      " accompagnateur(s).";
  }

  function toggleReusePrevious() {
    const last = loadLastGroup();

    if ($("jps-b-reuse").checked && hasReusableGroup(last)) {
      fillBookingFields(last);
    } else {
      clearBookingFields();
    }

    updateBookingHelp();
  }

  function cartPeople() {
    return cart.reduce((sum, item) => sum + item.students + item.adults, 0);
  }

  function cartFor(slotId) {
    return cart
      .filter(item => item.slotId === slotId)
      .reduce((sum, item) => sum + item.students + item.adults, 0);
  }

  function groupKey(value) {
    return norm(value || "Groupe non précisé");
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  function conflictForGroup(group, slot) {
    const g = groupKey(group);
    const start = minutes(slot.start);
    const end = minutes(slot.end);

    return cart.find(item => {
      if (groupKey(item.group) !== g) return false;
      if (item.dateIso !== slot.dateIso) return false;
      return rangesOverlap(start, end, minutes(item.start), minutes(item.end));
    });
  }

  function byGroup(items) {
    const groups = {};
    items.forEach(item => {
      const key = item.group || "Groupe non précisé";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }

  function renderFilters() {
    $("jps-filters").innerHTML = DAYS.map(day =>
      '<button class="filter' + (day.iso === activeDay ? " active" : "") + '" data-day="' + day.iso + '" type="button">' + day.short + '</button>'
    ).join("");

    root.querySelectorAll(".filter").forEach(button => {
      button.addEventListener("click", function () {
        activeDay = button.dataset.day;
        render();
      });
    });
  }

  function status(slot) {
    if (slot.full) return { cls: "full", txt: "Complet" };
    if (slot.remaining <= 8) return { cls: "low", txt: "Presque complet" };
    return { cls: "available", txt: "Disponible" };
  }

  function shortDesc(slot) {
    const text = String(slot.description || "").trim();
    if (!text) return "";
    return text.length > 135 ? text.slice(0, 132).trim() + "…" : text;
  }

  function renderChoice(slot) {
    const inCart = cartFor(slot.id);
    const remainingAfterCart = Math.max(0, slot.remaining - inCart);
    const disabled = slot.full || remainingAfterCart <= 0;
    const preview = shortDesc(slot);
    const remainingClass = remainingAfterCart <= 0 ? "zero" : remainingAfterCart <= 8 ? "low" : "";

    return (
      '<article class="card ' + (disabled ? "is-full" : "") + '">' +
        '<div class="top">' +
          '<div class="choice-label">' + esc(showTime(slot.start)) + "–" + esc(showTime(slot.end)) + '</div>' +
          '<div class="title">' + esc(slot.title) + '</div>' +
          '<div class="simple-meta">' +
            '<span class="simple-pill">' + esc(slot.roomLabel) + '</span>' +
            (slot.pole ? '<span class="simple-pill">' + esc(slot.pole) + '</span>' : '') +
          '</div>' +
          (preview ? '<div class="desc-preview">' + esc(preview) + '</div>' : '') +
        '</div>' +
        '<div class="body">' +
          '<div class="simple-remaining ' + remainingClass + '">' +
            '<strong>' + remainingAfterCart + '</strong><span>places disponibles</span>' +
          '</div>' +
          '<div class="meta">' + slot.confirmed + ' confirmée(s) · ' + slot.pending + ' en attente · jauge ' + slot.capacity + '</div>' +
          '<div class="card-actions">' +
            '<button class="btn2" type="button" data-info-slot-id="' + esc(slot.id) + '">Détail</button>' +
            (disabled
              ? '<button class="btn disabled" type="button">Complet</button>'
              : '<button class="btn" type="button" data-add-slot-id="' + esc(slot.id) + '">Ajouter au parcours</button>') +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    renderFilters();

    const visible = allSlots.filter(slot => slot.dateIso === activeDay);
    $("jps-total").textContent = visible.length;
    $("jps-avail").textContent = visible.filter(slot => !slot.full && cartFor(slot.id) < slot.remaining).length;
    $("jps-conf").textContent = visible.reduce((sum, slot) => sum + slot.confirmed, 0);
    $("jps-pend").textContent = visible.reduce((sum, slot) => sum + slot.pending, 0);

    const day = DAYS.find(d => d.iso === activeDay);
    const timeKeys = Array.from(new Set(visible.map(slot => slot.start + "|" + slot.end))).sort();

    $("jps-days").innerHTML =
      '<section class="day">' +
        '<div class="dayhead">' +
          '<div>' +
            '<div class="daytitle">' + esc(day ? day.label : activeDay) + '</div>' +
            '<div class="daymeta">Choisissez un horaire, puis ajoutez une activité au parcours d’une classe.</div>' +
          '</div>' +
          '<div class="badge">' + visible.length + ' créneau(x)</div>' +
        '</div>' +
        '<div class="daybody">' +
          '<p class="choice-hint">Mode d’emploi : cliquez sur “Détail” pour comprendre la proposition, ou sur “Ajouter au parcours” pour inscrire une classe sur ce créneau.</p>' +
          (timeKeys.length ? timeKeys.map(renderTimeGroup).join("") : '<div class="empty">Aucun créneau disponible pour cette journée.</div>') +
        '</div>' +
      '</section>';

    renderCart();
  }

  function renderTimeGroup(key) {
    const parts = key.split("|");
    const start = parts[0];
    const end = parts[1];

    const items = allSlots
      .filter(slot => slot.dateIso === activeDay && slot.start === start && slot.end === end)
      .sort((a, b) => {
        if (a.roomKey === "auditorium" && b.roomKey !== "auditorium") return -1;
        if (b.roomKey === "auditorium" && a.roomKey !== "auditorium") return 1;
        return a.roomLabel.localeCompare(b.roomLabel);
      });

    const availableCount = items.filter(slot => !slot.full && cartFor(slot.id) < slot.remaining).length;

    return (
      '<section class="timegroup">' +
        '<div class="timegroup-head">' +
          '<div>' +
            '<div class="timegroup-title">' + esc(showTime(start)) + "–" + esc(showTime(end)) + '</div>' +
            '<div class="timegroup-sub">Choix possibles sur ce créneau</div>' +
          '</div>' +
          '<div class="timegroup-count">' + availableCount + ' choix disponible(s)</div>' +
        '</div>' +
        '<div class="timegroup-body">' +
          '<div class="grid">' + items.map(renderChoice).join("") + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function openSlotById(slotId) {
    const slot = allSlots.find(item => item.id === slotId);

    if (!slot) {
      alert("Créneau introuvable. Rechargez la page puis réessayez.");
      return;
    }

    if (slot.full || cartFor(slot.id) >= slot.remaining) {
      alert("Ce créneau est complet ou réservé.");
      return;
    }

    openBooking(slot);
  }

  function openInfoById(slotId) {
    const slot = allSlots.find(item => item.id === slotId);

    if (!slot) {
      alert("Créneau introuvable. Rechargez la page puis réessayez.");
      return;
    }

    currentSlot = slot;

    $("jps-i-title").textContent = slot.title;
    $("jps-i-time").textContent = formatDate(slot.dateIso) + " — " + showTime(slot.start) + "-" + showTime(slot.end);
    $("jps-i-room").textContent = slot.roomLabel;
    $("jps-i-pole").textContent = slot.pole || "—";
    $("jps-i-public").textContent = slot.publicTarget || "—";
    $("jps-i-type").textContent = slot.type || "—";
    $("jps-i-desc").textContent = slot.description || "—";
    $("jps-i-capacity").textContent =
      slot.capacity + " places · " +
      slot.confirmed + " confirmée(s) · " +
      slot.pending + " en attente · " +
      Math.max(0, slot.remaining - cartFor(slot.id)) + " restante(s)";

    const button = $("jps-i-add");
    if (slot.full || cartFor(slot.id) >= slot.remaining) {
      button.className = "btn disabled";
      button.textContent = "Complet";
    } else {
      button.className = "btn";
      button.textContent = "Ajouter ce créneau au panier";
    }

    openModal("jps-info");
  }

  function openBooking(slot) {
    currentSlot = slot;
    const last = loadLastGroup();

    $("jps-b-slot").textContent =
      formatDate(slot.dateIso) + " — " +
      showTime(slot.start) + "-" + showTime(slot.end) + " — " +
      slot.title + " — " +
      slot.roomLabel;

    $("jps-b-places").textContent =
      Math.max(0, slot.remaining - cartFor(slot.id)) + " place(s) encore disponible(s), " +
      slot.pending + " en attente, " +
      slot.confirmed + " confirmé(s).";

    clearBookingFields();
    setupReusePreviousBox(last);
    updateBookingHelp();
    openModal("jps-booking");
    setTimeout(() => $("jps-b-group").focus(), 50);
  }

  function updateBookingHelp() {
    if (!currentSlot) return;

    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);
    const total = students + adults;
    const already = cartFor(currentSlot.id);
    const available = Math.max(0, currentSlot.remaining - already);

    $("jps-b-help").textContent =
      "Total pour cette classe : " + total +
      " personne(s). Places encore disponibles sur ce créneau : " + available + ".";

    const warning = $("jps-b-warning");
    if (total > available) {
      warning.style.display = "block";
      warning.textContent = "Cette classe dépasse les places disponibles sur ce créneau.";
    } else {
      warning.style.display = "none";
      warning.textContent = "";
    }
  }

  function addToCart() {
    if (!currentSlot) return;

    const group = $("jps-b-group").value.trim();
    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);
    const total = students + adults;
    const available = Math.max(0, currentSlot.remaining - cartFor(currentSlot.id));

    if (!group) {
      alert("Indiquez la classe ou le groupe.");
      return;
    }

    if (students <= 0) {
      alert("Indiquez le nombre d’élèves.");
      return;
    }

    if (total > available) {
      alert("Ce créneau n’a pas assez de places disponibles pour cette classe.");
      return;
    }

    const conflict = conflictForGroup(group, currentSlot);
    if (conflict) {
      alert("Cette classe a déjà un créneau au même moment : " + conflict.title + ". Utilisez un autre nom de groupe si vous souhaitez diviser la classe.");
      return;
    }

    cart.push({
      uid: Date.now() + "_" + Math.random(),
      slotId: currentSlot.id,
      dateIso: currentSlot.dateIso,
      start: currentSlot.start,
      end: currentSlot.end,
      roomKey: currentSlot.roomKey,
      roomLabel: currentSlot.roomLabel,
      title: currentSlot.title,
      group,
      students,
      adults
    });

    saveLastGroup({ group, students, adults });
    saveCart();
    closeModal("jps-booking");
    render();
  }

  function renderCart() {
    $("jps-cartbar").style.display = cart.length ? "block" : "none";
    $("jps-cartmeta").textContent = cart.length + " créneau(x) · " + cartPeople() + " personne(s)";
    $("jps-cart-summary").textContent =
      cart.length
        ? cart.length + " créneau(x), " + cartPeople() + " personne(s) au total. Les créneaux sont regroupés par classe."
        : "Panier vide.";

    if (!cart.length) {
      $("jps-cart-list").innerHTML = '<div class="empty">Aucun créneau sélectionné.</div>';
      return;
    }

    const groups = byGroup(cart);

    $("jps-cart-list").innerHTML = Object.keys(groups).sort().map(group => {
      const items = groups[group].slice().sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        return a.start.localeCompare(b.start);
      });

      const total = items.reduce((sum, item) => sum + item.students + item.adults, 0);
      const warning = cartGroupHasConflict(items)
        ? '<div class="conflict">Attention : cette classe a plusieurs activités au même moment.</div>'
        : "";

      return (
        '<div class="groupbox">' +
          '<div class="grouphead">' + esc(group) + " · " + total + " personne(s)" + '</div>' +
          warning +
          items.map(item =>
            '<div class="cartitem">' +
              '<div class="cartitemtitle">' +
                esc(formatDate(item.dateIso)) + " — " +
                esc(showTime(item.start)) + "-" + esc(showTime(item.end)) + " — " +
                esc(item.title) +
              '</div>' +
              '<div class="cartitemmeta">' +
                esc(item.roomLabel) + '<br>' +
                'Élèves : ' + item.students +
                ' · Accompagnateurs : ' + item.adults +
                ' · Total : ' + (item.students + item.adults) +
              '</div>' +
              '<button class="danger" type="button" data-remove="' + esc(item.uid) + '">Retirer</button>' +
            '</div>'
          ).join("") +
        '</div>'
      );
    }).join("");
  }

  function cartGroupHasConflict(items) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].dateIso !== items[j].dateIso) continue;
        if (rangesOverlap(minutes(items[i].start), minutes(items[i].end), minutes(items[j].start), minutes(items[j].end))) return true;
      }
    }
    return false;
  }

  function submitCart() {
    if (!cart.length) {
      alert("Votre panier est vide.");
      return;
    }

    const detail = cart.map((item, index) =>
      (index + 1) + ") " +
      formatDate(item.dateIso) + " — " +
      showTime(item.start) + "-" + showTime(item.end) + " — " +
      item.title + "\n" +
      "Salle : " + item.roomLabel + "\n" +
      "Classe / groupe : " + item.group + "\n" +
      "Élèves : " + item.students + "\n" +
      "Accompagnateurs : " + item.adults + "\n" +
      "Total : " + (item.students + item.adults)
    ).join("\n\n");

    const ids = cart.map(item =>
      [
        item.dateIso,
        compact(item.start),
        compact(item.end),
        item.roomKey,
        slug(item.title),
        item.group,
        item.students,
        item.adults
      ].join("|")
    ).join(";\n");

    window.open(
      FORM_URL +
        "?usp=pp_url" +
        "&" + ENTRY_DETAIL + "=" + encodeURIComponent(detail) +
        "&" + ENTRY_IDS + "=" + encodeURIComponent(ids),
      "_blank"
    );
  }

  function openModal(id) {
    $(id).classList.add("open");
  }

  function closeModal(id) {
    $(id).classList.remove("open");
  }

  document.addEventListener("click", function (event) {
    const addButton = event.target.closest("[data-add-slot-id]");
    if (addButton && root.contains(addButton)) {
      event.preventDefault();
      openSlotById(addButton.getAttribute("data-add-slot-id"));
      return;
    }

    const infoButton = event.target.closest("[data-info-slot-id]");
    if (infoButton && root.contains(infoButton)) {
      event.preventDefault();
      openInfoById(infoButton.getAttribute("data-info-slot-id"));
      return;
    }

    const removeButton = event.target.closest("[data-remove]");
    if (removeButton && root.contains(removeButton)) {
      event.preventDefault();
      cart = cart.filter(item => String(item.uid) !== String(removeButton.getAttribute("data-remove")));
      saveCart();
      render();
      return;
    }

    const closeButton = event.target.closest("[data-close]");
    if (closeButton && root.contains(closeButton)) {
      event.preventDefault();
      closeModal(closeButton.getAttribute("data-close"));
    }
  });

  ["jps-booking", "jps-cart", "jps-info"].forEach(id => {
    $(id).addEventListener("click", event => {
      if (event.target === $(id)) closeModal(id);
    });
  });

  ["jps-b-students", "jps-b-adults"].forEach(id => {
    $(id).addEventListener("input", updateBookingHelp);
  });

  $("jps-b-reuse").addEventListener("change", toggleReusePrevious);

  $("jps-b-add").addEventListener("click", addToCart);

  $("jps-i-add").addEventListener("click", function () {
    if (!currentSlot || currentSlot.full || cartFor(currentSlot.id) >= currentSlot.remaining) return;
    closeModal("jps-info");
    openBooking(currentSlot);
  });

  $("jps-open-cart").addEventListener("click", () => {
    renderCart();
    openModal("jps-cart");
  });

  $("jps-send").addEventListener("click", submitCart);
  $("jps-submit").addEventListener("click", submitCart);

  $("jps-clear").addEventListener("click", () => {
    if (confirm("Vider le panier ?")) {
      cart = [];
      saveCart();
      render();
    }
  });

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(response => {
      if (!response.ok) throw new Error("Propositions HTTP " + response.status);
      return response.text();
    }),
    fetch(DEMANDES_CSV).then(response => {
      if (!response.ok) throw new Error("Demandes HTTP " + response.status);
      return response.text();
    })
  ])
    .then(([propositionsText, demandesText]) => {
      const propositionsRows = parseCSV(propositionsText);
      const demandesRows = parseCSV(demandesText);
      const reservations = buildReservations(demandesRows);

      allSlots = applyReservations(buildSlots(propositionsRows), reservations);

      if (!allSlots.some(slot => slot.dateIso === activeDay) && allSlots.length) {
        activeDay = allSlots[0].dateIso;
      }

      window.JPS_ECOLES_DEBUG = {
        ...(window.JPS_ECOLES_DEBUG || {}),
        slotsCount: allSlots.length,
        slots: allSlots
      };

      render();
    })
    .catch(error => {
      $("jps-error").textContent = "Erreur lors du chargement : " + error.message;
    });
});
