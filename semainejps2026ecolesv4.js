document.addEventListener("DOMContentLoaded", function () {
  let root = document.getElementById("jps-ecoles");

  // Sécurité V3 : si le conteneur n’a pas été ajouté dans la page,
  // on le crée automatiquement pour éviter une page totalement vide.
  if (!root) {
    root = document.createElement("div");
    root.id = "jps-ecoles";
    document.body.appendChild(root);
  }

  root.innerHTML = '<div style="max-width:1200px;margin:20px auto;padding:18px;border:1px solid #e5e7eb;border-radius:18px;font-family:Arial,sans-serif;font-weight:800;color:#334155;background:#f8fafc;">Chargement des créneaux scolaires...</div>';

  const PROPOSITIONS_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnEUKc0wpQrmGOXO4b_k8oOVoHhrCSzX_VbXqA1zSYWUOMWQbiy6_tzwPCALDsSY7swWLLweOOjpRM/pub?gid=1329408426&single=true&output=csv";

  // IMPORTANT : remplacer le gid si le nouvel onglet de réponses V3 a un autre gid.
const DEMANDES_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMoXOros4yAdFKFqbiYuWe1xCchfaLCwsMV28jb5DQIXb9c2dz-koYfe4_ppfZzqqZMZE9im-MjE1y/pub?gid=465699845&single=true&output=csv";
  const FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdMXC4I_3VBke-T4SmBlHIyHhntfWHodjHLjjv1Ue2j9Y-I5w/viewform";

  const FORM_ENTRY_DETAIL = "entry.922026620";
  const FORM_ENTRY_IDS = "entry.288415036";

  const STORAGE_KEY = "jps_ecoles_v3_panier";

  const SCHOOL_DAYS = [
    { iso: "2026-06-15", label: "Lundi 15 juin", short: "Lun. 15/06" },
    { iso: "2026-06-16", label: "Mardi 16 juin", short: "Mar. 16/06" },
    { iso: "2026-06-17", label: "Mercredi 17 juin", short: "Mer. 17/06" },
    { iso: "2026-06-18", label: "Jeudi 18 juin", short: "Jeu. 18/06" },
    { iso: "2026-06-19", label: "Vendredi 19 juin", short: "Ven. 19/06" }
  ];

  const AUTO_BASE_DAYS = [
    "2026-06-15",
    "2026-06-16",
    "2026-06-18",
    "2026-06-19"
  ];

  const AUTO_SLOTS = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
    ["16:00", "17:00"]
  ];

  const ROOM_CAPACITY = {
    auditorium: 200,
    chant: 40,
    orchestre: 40,
    theatre: 40,
    danse: 40,
    any: 40
  };

  root.innerHTML = `
    <style>
      #jps-ecoles{
        --jps-text:#111827;
        --jps-muted:#64748b;
        --jps-border:#e5e7eb;
        --jps-soft:#f8fafc;
        --jps-green:#16a34a;
        --jps-orange:#f59e0b;
        --jps-red:#dc2626;
        --jps-blue:#2563eb;
        --jps-purple:#7c3aed;
        font-family:Arial,sans-serif;
        color:var(--jps-text);
        width:100%;
      }

      #jps-ecoles *{ box-sizing:border-box; }

      #jps-ecoles .jps-public-card{
        max-width:1200px;
        margin:0 auto;
        background:#fff;
        border:1px solid var(--jps-border);
        border-radius:24px;
        overflow:hidden;
        box-shadow:0 18px 50px rgba(15,23,42,.08);
      }

      #jps-ecoles .jps-public-header{
        padding:32px;
        background:
          radial-gradient(circle at top right,rgba(37,99,235,.15),transparent 32%),
          radial-gradient(circle at top left,rgba(22,163,74,.13),transparent 30%),
          #fff;
        border-bottom:1px solid var(--jps-border);
      }

      #jps-ecoles h2{
        margin:0;
        font-size:clamp(28px,4vw,44px);
        line-height:1.05;
        letter-spacing:-.04em;
      }

      #jps-ecoles .jps-sub{
        margin:12px 0 0;
        color:var(--jps-muted);
        font-size:16px;
        line-height:1.55;
        max-width:920px;
      }

      #jps-ecoles .jps-notice{
        margin-top:18px;
        border:1px solid #bfdbfe;
        background:#eff6ff;
        color:#1e3a8a;
        border-radius:18px;
        padding:14px;
        font-size:14px;
        line-height:1.45;
        font-weight:700;
      }

      #jps-ecoles .jps-content{ padding:24px; }

      #jps-ecoles .jps-stats{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:12px;
        margin-bottom:24px;
      }

      #jps-ecoles .jps-stat{
        border:1px solid var(--jps-border);
        border-radius:18px;
        padding:16px;
        background:#fff;
      }

      #jps-ecoles .jps-statnum{
        font-size:30px;
        font-weight:900;
        line-height:1;
      }

      #jps-ecoles .jps-statlabel{
        margin-top:6px;
        color:var(--jps-muted);
        font-size:13px;
        font-weight:800;
        line-height:1.35;
      }

      #jps-ecoles .jps-filterbar{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-bottom:24px;
      }

      #jps-ecoles .jps-filterbtn{
        border:1px solid #d1d5db;
        background:#fff;
        color:#111827;
        border-radius:999px;
        padding:10px 14px;
        font-size:14px;
        font-weight:900;
        cursor:pointer;
      }

      #jps-ecoles .jps-filterbtn.active{
        background:#111827;
        color:#fff;
        border-color:#111827;
      }

      #jps-ecoles .jps-day{
        margin-bottom:28px;
        border:1px solid #e7eaee;
        border-radius:22px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .jps-dayhead{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
        padding:18px;
        background:#f8fafc;
        border-bottom:1px solid var(--jps-border);
      }

      #jps-ecoles .jps-daytitle{
        font-size:22px;
        font-weight:900;
        letter-spacing:-.03em;
        text-transform:uppercase;
      }

      #jps-ecoles .jps-daymeta{
        margin-top:4px;
        color:var(--jps-muted);
        font-size:14px;
        font-weight:800;
      }

      #jps-ecoles .jps-daybadge{
        border-radius:999px;
        background:#e2e8f0;
        color:#334155;
        padding:7px 10px;
        font-size:12px;
        font-weight:900;
        white-space:nowrap;
      }

      #jps-ecoles .jps-daycontent{ padding:16px; }

      #jps-ecoles .jps-blocktitle{
        margin:0 0 12px;
        font-size:18px;
        font-weight:900;
        letter-spacing:-.02em;
      }

      #jps-ecoles .jps-recurring-list,
      #jps-ecoles .jps-single-list{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
        gap:14px;
        margin-bottom:18px;
      }

      #jps-ecoles .jps-recurring,
      #jps-ecoles .jps-single{
        border:1px solid #e5e7eb;
        border-radius:22px;
        overflow:hidden;
        background:#fff;
      }

      #jps-ecoles .jps-recurring-top,
      #jps-ecoles .jps-single-top{
        padding:15px;
        background:#fbfcfd;
        border-bottom:1px solid #edf0f3;
        cursor:pointer;
      }

      #jps-ecoles .jps-recurring-title,
      #jps-ecoles .jps-single-title{
        font-size:18px;
        line-height:1.25;
        font-weight:900;
      }

      #jps-ecoles .jps-recurring-meta,
      #jps-ecoles .jps-single-room{
        margin-top:7px;
        font-size:13px;
        font-weight:800;
        line-height:1.4;
        color:#475569;
      }

      #jps-ecoles .jps-recurring-body,
      #jps-ecoles .jps-single-body{
        padding:14px;
      }

      #jps-ecoles .jps-slot-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
        gap:8px;
      }

      #jps-ecoles .jps-slotbtn{
        border:1px solid #dbe3ec;
        background:#fff;
        border-radius:14px;
        padding:10px;
        text-decoration:none;
        color:#111827;
        display:block;
        font-weight:900;
        line-height:1.25;
        transition:transform .15s ease, box-shadow .15s ease;
        cursor:pointer;
        text-align:left;
        width:100%;
      }

      #jps-ecoles .jps-slotbtn:hover{
        transform:translateY(-1px);
        box-shadow:0 8px 18px rgba(15,23,42,.08);
      }

      #jps-ecoles .jps-slotbtn.full{
        background:#f1f5f9;
        color:#64748b;
        pointer-events:none;
        opacity:.75;
      }

      #jps-ecoles .jps-slotbtn.low{
        background:#fff7ed;
        border-color:#fed7aa;
      }

      #jps-ecoles .jps-slotbtn.available{
        background:#f0fdf4;
        border-color:#bbf7d0;
      }

      #jps-ecoles .jps-slotbtn span{
        display:block;
        margin-top:4px;
        font-size:11px;
        font-weight:900;
        color:#64748b;
      }

      #jps-ecoles .jps-single.full{ opacity:.68; }

      #jps-ecoles .jps-single-time{
        font-size:14px;
        font-weight:900;
        color:#334155;
      }

      #jps-ecoles .jps-capacity{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:8px;
        margin-bottom:10px;
      }

      #jps-ecoles .jps-cap{
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:10px;
        background:#fff;
      }

      #jps-ecoles .jps-cap strong{
        display:block;
        font-size:18px;
        line-height:1;
      }

      #jps-ecoles .jps-cap span{
        display:block;
        margin-top:5px;
        font-size:11px;
        color:#64748b;
        font-weight:900;
        text-transform:uppercase;
      }

      #jps-ecoles .jps-status{
        border-radius:14px;
        padding:10px;
        font-size:13px;
        font-weight:900;
        line-height:1.35;
        margin-bottom:10px;
      }

      #jps-ecoles .jps-status.available{ background:#dcfce7; color:#166534; }
      #jps-ecoles .jps-status.low{ background:#fff7ed; color:#9a3412; }
      #jps-ecoles .jps-status.full{ background:#fee2e2; color:#991b1b; }

      #jps-ecoles .jps-request,
      #jps-ecoles .jps-detailbtn,
      #jps-ecoles .jps-secondarybtn{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        text-decoration:none;
        border-radius:14px;
        padding:12px 14px;
        font-size:14px;
        font-weight:900;
        text-align:center;
        cursor:pointer;
      }

      #jps-ecoles .jps-request{
        border:0;
        background:#111827;
        color:#fff;
      }

      #jps-ecoles .jps-request.disabled{
        background:#cbd5e1;
        color:#475569;
        pointer-events:none;
      }

      #jps-ecoles .jps-detailbtn{
        border:0;
        background:#f1f5f9;
        color:#334155;
      }

      #jps-ecoles .jps-secondarybtn{
        border:1px solid #d1d5db;
        background:#fff;
        color:#111827;
      }

      #jps-ecoles .jps-empty{
        border:1px dashed #cbd5e1;
        border-radius:18px;
        padding:18px;
        background:#fbfcfd;
        color:#64748b;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .jps-error{
        color:#b91c1c;
        font-weight:900;
        white-space:pre-wrap;
      }

      #jps-ecoles .jps-cartbar{
        position:sticky;
        bottom:14px;
        z-index:50;
        margin:22px auto 0;
        max-width:1200px;
        border:1px solid #c7d2fe;
        background:#eef2ff;
        border-radius:22px;
        padding:14px;
        box-shadow:0 18px 50px rgba(15,23,42,.12);
      }

      #jps-ecoles .jps-cartbar-inner{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        flex-wrap:wrap;
      }

      #jps-ecoles .jps-cartbar-title{
        font-weight:900;
        font-size:16px;
      }

      #jps-ecoles .jps-cartbar-meta{
        margin-top:3px;
        color:#4338ca;
        font-size:13px;
        font-weight:800;
      }

      #jps-ecoles .jps-modal{
        display:none;
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.55);
        z-index:9999;
        padding:20px;
        align-items:center;
        justify-content:center;
      }

      #jps-ecoles .jps-modal.open{ display:flex; }

      #jps-ecoles .jps-modalbox{
        width:min(900px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:26px;
        padding:28px;
        position:relative;
        box-shadow:0 30px 80px rgba(0,0,0,.24);
      }

      #jps-ecoles .jps-close{
        position:absolute;
        top:12px;
        right:14px;
        border:0;
        background:transparent;
        font-size:32px;
        cursor:pointer;
      }

      #jps-ecoles .jps-modaltitle{
        margin:0 42px 18px 0;
        font-size:28px;
        line-height:1.15;
        font-weight:900;
      }

      #jps-ecoles .jps-row{
        display:grid;
        grid-template-columns:180px minmax(0,1fr);
        gap:14px;
        padding:11px 0;
        border-bottom:1px dashed #e5e7eb;
        line-height:1.45;
      }

      #jps-ecoles .jps-row:last-child{ border-bottom:0; }
      #jps-ecoles .jps-label{ font-weight:900; }

      #jps-ecoles .jps-formgrid{
        display:grid;
        grid-template-columns:2fr 1fr 1fr;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .jps-field label{
        display:block;
        font-size:12px;
        color:#475569;
        font-weight:900;
        margin-bottom:5px;
        text-transform:uppercase;
      }

      #jps-ecoles .jps-field input{
        width:100%;
        border:1px solid #cbd5e1;
        border-radius:14px;
        padding:12px;
        font-size:15px;
        font-weight:800;
      }

      #jps-ecoles .jps-help{
        margin-top:8px;
        color:#64748b;
        font-size:13px;
        font-weight:800;
        line-height:1.4;
      }

      #jps-ecoles .jps-modal-actions{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin-top:18px;
      }

      #jps-ecoles .jps-cart-list{
        display:flex;
        flex-direction:column;
        gap:10px;
        margin-top:14px;
      }

      #jps-ecoles .jps-cart-item{
        border:1px solid #e5e7eb;
        border-radius:18px;
        padding:14px;
        background:#fff;
      }

      #jps-ecoles .jps-cart-item-title{
        font-weight:900;
        line-height:1.3;
      }

      #jps-ecoles .jps-cart-item-meta{
        margin-top:6px;
        font-size:13px;
        color:#475569;
        font-weight:800;
        line-height:1.45;
      }

      #jps-ecoles .jps-cart-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:10px;
      }

      #jps-ecoles .jps-dangerbtn{
        border:1px solid #fecaca;
        background:#fff1f2;
        color:#991b1b;
        border-radius:12px;
        padding:9px 11px;
        font-size:13px;
        font-weight:900;
        cursor:pointer;
      }

      #jps-ecoles .jps-warning{
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

      @media(max-width:760px){
        #jps-ecoles .jps-public-header,
        #jps-ecoles .jps-content{ padding:18px; }
        #jps-ecoles .jps-stats{ grid-template-columns:1fr 1fr; }
        #jps-ecoles .jps-dayhead{ flex-direction:column; }
        #jps-ecoles .jps-recurring-list,
        #jps-ecoles .jps-single-list{ grid-template-columns:1fr; }
        #jps-ecoles .jps-capacity{ grid-template-columns:1fr 1fr; }
        #jps-ecoles .jps-row{ grid-template-columns:1fr; gap:4px; }
        #jps-ecoles .jps-formgrid{ grid-template-columns:1fr; }
        #jps-ecoles .jps-modal{ padding:10px; }
        #jps-ecoles .jps-modalbox{ padding:20px; border-radius:20px; }
      }
    </style>

    <div class="jps-public-card">
      <div class="jps-public-header">
        <h2>Semaine inaugurale du Conservatoire Henri Tomasi</h2>
        <p class="jps-sub">
          Accueil des établissements scolaires — demandes de créneaux du lundi 15 au vendredi 19 juin 2026.
        </p>
        <div class="jps-notice">
          Sélectionnez un ou plusieurs créneaux, indiquez le groupe concerné, le nombre d’élèves et les accompagnateurs,
          puis envoyez une seule demande globale. L’envoi ne vaut pas confirmation définitive : une validation sera adressée par le Conservatoire.
        </div>
      </div>

      <div class="jps-content">
        <div class="jps-stats">
          <div class="jps-stat">
            <div id="jps-total-slots" class="jps-statnum">0</div>
            <div class="jps-statlabel">créneaux proposés</div>
          </div>
          <div class="jps-stat">
            <div id="jps-available-slots" class="jps-statnum">0</div>
            <div class="jps-statlabel">créneaux disponibles</div>
          </div>
          <div class="jps-stat">
            <div id="jps-confirmed-count" class="jps-statnum">0</div>
            <div class="jps-statlabel">places confirmées</div>
          </div>
          <div class="jps-stat">
            <div id="jps-pending-count" class="jps-statnum">0</div>
            <div class="jps-statlabel">places en attente</div>
          </div>
        </div>

        <div id="jps-filterbar" class="jps-filterbar"></div>
        <div id="jps-days"></div>
        <div id="jps-error" class="jps-error"></div>
      </div>
    </div>

    <div id="jps-cartbar" class="jps-cartbar" style="display:none;">
      <div class="jps-cartbar-inner">
        <div>
          <div class="jps-cartbar-title">Panier de demande</div>
          <div id="jps-cartbar-meta" class="jps-cartbar-meta"></div>
        </div>
        <div class="jps-modal-actions" style="margin-top:0;">
          <button type="button" id="jps-open-cart" class="jps-secondarybtn">Voir le panier</button>
          <button type="button" id="jps-send-cart" class="jps-request">Envoyer la demande</button>
        </div>
      </div>
    </div>

    <div id="jps-detail-modal" class="jps-modal">
      <div class="jps-modalbox">
        <button type="button" data-close-modal="jps-detail-modal" class="jps-close">&times;</button>
        <h3 id="jps-m-title" class="jps-modaltitle"></h3>
        <div class="jps-row"><span class="jps-label">Date</span><span id="jps-m-date"></span></div>
        <div class="jps-row"><span class="jps-label">Horaire</span><span id="jps-m-time"></span></div>
        <div class="jps-row"><span class="jps-label">Lieu</span><span id="jps-m-room"></span></div>
        <div class="jps-row"><span class="jps-label">Jauge</span><span id="jps-m-capacity"></span></div>
        <div class="jps-row"><span class="jps-label">Places</span><span id="jps-m-remaining"></span></div>
        <div class="jps-row"><span class="jps-label">Type</span><span id="jps-m-type"></span></div>
        <div class="jps-row"><span class="jps-label">Discipline</span><span id="jps-m-discipline"></span></div>
        <div class="jps-row"><span class="jps-label">Public visé</span><span id="jps-m-public"></span></div>
        <div class="jps-row"><span class="jps-label">Description</span><span id="jps-m-desc"></span></div>
        <div class="jps-row"><span class="jps-label">Besoins / informations</span><span id="jps-m-tech"></span></div>
        <div class="jps-row"><span class="jps-label">Mode</span><span id="jps-m-mode"></span></div>
        <div class="jps-modal-actions">
          <button type="button" id="jps-m-add" class="jps-request">Ajouter ce créneau au panier</button>
        </div>
      </div>
    </div>

    <div id="jps-booking-modal" class="jps-modal">
      <div class="jps-modalbox">
        <button type="button" data-close-modal="jps-booking-modal" class="jps-close">&times;</button>
        <h3 id="jps-b-title" class="jps-modaltitle">Ajouter un créneau</h3>
        <div class="jps-row"><span class="jps-label">Créneau</span><span id="jps-b-slot"></span></div>
        <div class="jps-row"><span class="jps-label">Places disponibles</span><span id="jps-b-places"></span></div>

        <div class="jps-formgrid">
          <div class="jps-field">
            <label for="jps-b-group">Groupe / classe</label>
            <input id="jps-b-group" type="text" placeholder="Ex. CE2, CM1, 6e A" />
          </div>
          <div class="jps-field">
            <label for="jps-b-students">Élèves</label>
            <input id="jps-b-students" type="number" min="0" step="1" placeholder="24" />
          </div>
          <div class="jps-field">
            <label for="jps-b-adults">Accompagnateurs</label>
            <input id="jps-b-adults" type="number" min="0" step="1" placeholder="2" />
          </div>
        </div>

        <div id="jps-b-help" class="jps-help"></div>
        <div id="jps-b-warning" class="jps-warning" style="display:none;"></div>

        <div class="jps-modal-actions">
          <button type="button" id="jps-b-add" class="jps-request">Ajouter au panier</button>
          <button type="button" data-close-modal="jps-booking-modal" class="jps-secondarybtn">Annuler</button>
        </div>
      </div>
    </div>

    <div id="jps-cart-modal" class="jps-modal">
      <div class="jps-modalbox">
        <button type="button" data-close-modal="jps-cart-modal" class="jps-close">&times;</button>
        <h3 class="jps-modaltitle">Panier de demande</h3>
        <div id="jps-cart-summary" class="jps-help"></div>
        <div id="jps-cart-list" class="jps-cart-list"></div>
        <div id="jps-cart-warning" class="jps-warning" style="display:none;"></div>
        <div class="jps-modal-actions">
          <button type="button" id="jps-cart-submit" class="jps-request">Envoyer la demande globale</button>
          <button type="button" id="jps-cart-clear" class="jps-secondarybtn">Vider le panier</button>
        </div>
      </div>
    </div>
  `;

  let allSlots = [];
  let activeDay = "all";
  let cart = loadCart();
  let currentBookingSlot = null;
  let currentDetailSlot = null;

  function $(id) {
    return document.getElementById(id);
  }

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
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slug(s) {
    return norm(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  function parseCSVLine(line) {
    const res = [];
    let cur = "";
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];

      if (ch === '"') {
        if (quoted && next === '"') {
          cur += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === "," && !quoted) {
        res.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }

    res.push(cur);
    return res;
  }

function parseCSV(text) {
  const clean = String(text || "").replace(/\r/g, "").trim();
  if (!clean) return [];

  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];

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
  return rows;
}

  function findCol(headers, possibilities) {
    const hs = headers.map(norm);

    for (const p of possibilities) {
      const n = norm(p);
      const exact = hs.findIndex(h => h === n);
      if (exact !== -1) return exact;
    }

    for (const p of possibilities) {
      const n = norm(p);
      const partial = hs.findIndex(h => h.includes(n));
      if (partial !== -1) return partial;
    }

    return -1;
  }

  function parseDateFR(v) {
    if (!v) return null;
    const txt = v.toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

    const parts = txt.split(/[\/.-]/);
    if (parts.length !== 3) return null;

    let d = parts[0];
    let m = parts[1];
    let y = parts[2];
    if (y.length === 2) y = "20" + y;

    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function formatTime(v) {
    if (!v) return "Non précisée";
    const txt = v.toString().trim();

    if (/^\d{1,2}:\d{2}$/.test(txt)) {
      const p = txt.split(":");
      return String(p[0]).padStart(2, "0") + ":" + p[1];
    }

    if (/^\d{1,2}:\d{2}:\d{2}$/.test(txt)) {
      const p = txt.split(":");
      return String(p[0]).padStart(2, "0") + ":" + p[1];
    }

    if (/^\d{1,2}h\d{2}$/.test(txt.toLowerCase())) {
      const p = txt.toLowerCase().split("h");
      return String(p[0]).padStart(2, "0") + ":" + p[1];
    }

    return txt.slice(0, 5);
  }

  function displayTime(time) {
    return String(time || "").replace(":", "h");
  }

  function compactTime(time) {
    return String(time || "").replace(":", "");
  }

  function timeToMinutes(time) {
    if (!time || time === "Journée entière") return null;
    const parts = time.split(":");
    if (parts.length < 2) return null;

    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function minutesToTime(total) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function durationToMinutes(duration) {
    const d = norm(duration);
    if (d.includes("45")) return 45;
    if (d.includes("30")) return 30;
    if (d.includes("1h30") || d.includes("1 h 30")) return 90;
    if (d.includes("2h") || d.includes("2 h")) return 120;
    if (d.includes("1h") || d.includes("1 h")) return 60;
    if (d.includes("demi")) return 180;
    return 60;
  }

  function formatDateLong(iso) {
    const day = SCHOOL_DAYS.find(d => d.iso === iso);
    return day ? day.label : iso;
  }

  function roomInfo(v) {
    const s = norm(v);
    if (s.includes("auditorium")) return { key: "auditorium", label: "Auditorium" };
    if (s.includes("orchestre")) return { key: "orchestre", label: "Salle d’orchestre" };
    if (s.includes("chant")) return { key: "chant", label: "Salle de chant" };
    if (s.includes("danse")) return { key: "danse", label: "Studio de danse" };
    if (s.includes("theatre") || s.includes("théâtre")) return { key: "theatre", label: "Salle de théâtre" };
    if (s.includes("peu importe") || s.includes("indifferent") || s.includes("indifférent") || s.includes("a definir") || s.includes("à définir")) {
      return { key: "any", label: "Lieu à préciser" };
    }
    return { key: "any", label: v || "Lieu à préciser" };
  }

  function isAccepted(v) {
    const s = norm(v);
    return s.includes("accepte") || s.includes("oui") || s.includes("valide") || s.includes("confirme");
  }

  function isSchoolDate(dateIso) {
    return SCHOOL_DAYS.some(d => d.iso === dateIso);
  }

  function isSchoolTime(start) {
    const m = timeToMinutes(start);
    if (m === null) return false;
    return (m >= 8 * 60 + 30 && m < 12 * 60) || (m >= 13 * 60 && m < 17 * 60);
  }

  function parseNumber(v) {
    const n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function makeSlotId(dateIso, start, end, roomKey, title) {
    return [dateIso, compactTime(start), compactTime(end), roomKey, slug(title)].join("|");
  }

  function makeBaseSlotIdFromParts(parts) {
    if (!parts || parts.length < 5) return "";
    return parts.slice(0, 5).join("|");
  }

  function makeSlotLabel(slot) {
    return [
      formatDateLong(slot.dateIso),
      displayTime(slot.start) + "-" + displayTime(slot.end),
      slot.roomLabel,
      slot.title
    ].join(" — ");
  }

  function buildSlotsFromPropositions(rows) {
    if (!rows.length) return [];

    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

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
    const C_AUTO = findCol(headers, [
      "Programmation automatique sur plusieurs créneaux ?",
      "Programmation automatique sur plusieurs creneaux ?",
      "Programmation automatique"
    ]);

    if ([C_TITLE, C_ROOM, C_STATUS].some(i => i === -1)) {
      throw new Error("Colonnes introuvables dans le Sheet propositions : vérifie Intitulé du projet, Lieu souhaité et STATUT.");
    }

    const slots = [];

    dataRows.forEach((row, idx) => {
      const title = row[C_TITLE] || "Proposition sans titre";
      const status = row[C_STATUS] || "";
      if (!isAccepted(status)) return;

      const room = roomInfo(row[C_ROOM]);
      const duration = C_DUR !== -1 ? row[C_DUR] : "";
      const capacityFromSheet = C_CAP !== -1 ? parseNumber(row[C_CAP]) : 0;
      const capacity = capacityFromSheet || ROOM_CAPACITY[room.key] || 40;
      const autoLabel = C_AUTO !== -1 ? row[C_AUTO] : "";
      const autoMode = norm(autoLabel);
      const sourceUid = "src" + idx + "_" + slug(title + "-" + room.key);

      const common = {
        sourceUid,
        name: C_NAME !== -1 ? row[C_NAME] : "",
        discipline: C_DISC !== -1 ? row[C_DISC] : "",
        title,
        type: C_TYPE !== -1 ? row[C_TYPE] : "",
        publicTarget: C_PUBLIC !== -1 ? row[C_PUBLIC] : "",
        duration,
        roomKey: room.key,
        roomLabel: room.label,
        capacity,
        tech: C_TECH !== -1 ? row[C_TECH] : "",
        description: C_DESC !== -1 ? row[C_DESC] : "",
        autoLabel: autoLabel || "Non"
      };

      if (autoMode.includes("oui")) {
        const days = AUTO_BASE_DAYS.slice();
        if (autoMode.includes("mercredi")) days.splice(2, 0, "2026-06-17");

        days.forEach(dateIso => {
          AUTO_SLOTS.forEach(pair => {
            const start = pair[0];
            const end = pair[1];
            slots.push({
              ...common,
              id: makeSlotId(dateIso, start, end, room.key, title),
              dateIso,
              start,
              end,
              permanent: true,
              autoGenerated: true
            });
          });
        });

        return;
      }

      const dateIso = C_DATE !== -1 ? parseDateFR(row[C_DATE]) : null;
      if (!dateIso || !isSchoolDate(dateIso)) return;

      const start = C_TIME !== -1 ? formatTime(row[C_TIME]) : "";
      if (!start || start === "Non précisée") return;
      if (!isSchoolTime(start)) return;

      const startMin = timeToMinutes(start);
      const end = minutesToTime(startMin + durationToMinutes(duration));

      slots.push({
        ...common,
        id: makeSlotId(dateIso, start, end, room.key, title),
        dateIso,
        start,
        end,
        permanent: false,
        autoGenerated: false
      });
    });

    const seen = {};
    return slots
      .filter(slot => {
        if (seen[slot.id]) return false;
        seen[slot.id] = true;
        return true;
      })
      .sort((a, b) => {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
        if (a.start !== b.start) return a.start.localeCompare(b.start);
        return a.roomLabel.localeCompare(b.roomLabel);
      });
  }

  function addReservation(map, id, count, validation) {
    if (!id || !count) return;
    if (!map[id]) map[id] = { confirmed: 0, pending: 0, refused: 0 };

    if (validation === "oui") {
      map[id].confirmed += count;
    } else if (validation === "en attente" || validation === "") {
      map[id].pending += count;
    } else if (validation === "non") {
      map[id].refused += count;
    }
  }

  function parseV3IdsField(value) {
    return String(value || "")
      .split(";")
      .map(s => s.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|").map(p => p.trim());
        return {
          parts,
          baseId: makeBaseSlotIdFromParts(parts),
          group: parts[5] || "",
          students: parseNumber(parts[6]),
          adults: parseNumber(parts[7]),
          total: parseNumber(parts[6]) + parseNumber(parts[7])
        };
      })
      .filter(item => item.baseId && item.total > 0);
  }

  function buildReservationMap(rows) {
    const map = {};
    if (!rows.length) return map;

    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    const C_IDS_V3 = findCol(headers, ["IDs créneaux", "IDs creneaux", "IDS créneaux", "IDS creneaux"]);
    const C_ID_OLD = findCol(headers, ["ID créneau", "ID creneau"]);
    const C_ELEVES = findCol(headers, ["Nombre d’élèves", "Nombre d'eleves", "Nombre eleves", "élèves", "eleves"]);
    const C_ACCOMP = findCol(headers, ["Nombre d’accompagnateurs", "Nombre d'accompagnateurs", "accompagnateurs"]);
    const C_VALID = findCol(headers, ["VALIDATION CRD", "Validation CRD"]);

    if (C_VALID === -1) return map;

    dataRows.forEach(row => {
      const validation = norm(row[C_VALID]);

      // Nouveau format V3 : plusieurs créneaux dans une seule réponse.
      if (C_IDS_V3 !== -1 && row[C_IDS_V3]) {
        parseV3IdsField(row[C_IDS_V3]).forEach(item => {
          addReservation(map, item.baseId, item.total, validation);
        });
        return;
      }

      // Compatibilité V1/V2 : une ligne = un créneau.
      if (C_ID_OLD !== -1 && row[C_ID_OLD]) {
        const id = String(row[C_ID_OLD] || "").trim();
        const students = C_ELEVES !== -1 ? parseNumber(row[C_ELEVES]) : 0;
        const adults = C_ACCOMP !== -1 ? parseNumber(row[C_ACCOMP]) : 0;
        const total = students + adults;
        addReservation(map, id, total || students, validation);
      }
    });

    return map;
  }

  function mergeReservations(slots, reservations) {
    return slots.map(slot => {
      const r = reservations[slot.id] || { confirmed: 0, pending: 0, refused: 0 };
      const remaining = Math.max(0, slot.capacity - r.confirmed);
      return {
        ...slot,
        confirmed: r.confirmed,
        pending: r.pending,
        remaining,
        full: remaining <= 0
      };
    });
  }

  function slotStatus(slot) {
    if (slot.full) return { cls: "full", text: "Complet" };
    if (slot.remaining <= 8) return { cls: "low", text: "Presque complet" };
    return { cls: "available", text: "Disponible" };
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

  function cartTotalPeople() {
    return cart.reduce((sum, item) => sum + item.students + item.adults, 0);
  }

  function cartCountForSlot(slotId) {
    return cart
      .filter(item => item.slotId === slotId)
      .reduce((sum, item) => sum + item.students + item.adults, 0);
  }

  function renderFilters() {
    const bar = $("jps-filterbar");
    bar.innerHTML =
      '<button type="button" class="jps-filterbtn active" data-day="all">Tous les jours</button>' +
      SCHOOL_DAYS.map(day =>
        '<button type="button" class="jps-filterbtn" data-day="' + esc(day.iso) + '">' + esc(day.short) + '</button>'
      ).join("");

    bar.querySelectorAll(".jps-filterbtn").forEach(btn => {
      btn.addEventListener("click", function () {
        activeDay = btn.getAttribute("data-day");
        bar.querySelectorAll(".jps-filterbtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    });
  }

  function renderStats(slots) {
    const total = slots.length;
    const available = slots.filter(s => !s.full).length;
    const confirmed = slots.reduce((sum, s) => sum + s.confirmed, 0);
    const pending = slots.reduce((sum, s) => sum + s.pending, 0);

    $("jps-total-slots").textContent = total;
    $("jps-available-slots").textContent = available;
    $("jps-confirmed-count").textContent = confirmed;
    $("jps-pending-count").textContent = pending;
  }

  function groupedRecurringSlots(slots) {
    const groups = {};

    slots.filter(s => s.autoGenerated).forEach(slot => {
      const key = slot.dateIso + "|" + slot.sourceUid;
      if (!groups[key]) {
        groups[key] = {
          sourceUid: slot.sourceUid,
          dateIso: slot.dateIso,
          title: slot.title,
          roomLabel: slot.roomLabel,
          roomKey: slot.roomKey,
          capacity: slot.capacity,
          type: slot.type,
          discipline: slot.discipline,
          publicTarget: slot.publicTarget,
          description: slot.description,
          tech: slot.tech,
          duration: slot.duration,
          slots: []
        };
      }
      groups[key].slots.push(slot);
    });

    return Object.values(groups).sort((a, b) => {
      if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
      return a.title.localeCompare(b.title);
    });
  }

  function renderRecurringGroup(group) {
    const slots = group.slots.slice().sort((a, b) => a.start.localeCompare(b.start));
    const available = slots.filter(s => !s.full).length;

    return `
      <article class="jps-recurring">
        <div class="jps-recurring-top" data-source-uid="${esc(group.sourceUid)}" data-date="${esc(group.dateIso)}">
          <div class="jps-recurring-title">${esc(group.title)}</div>
          <div class="jps-recurring-meta">
            ${esc(group.roomLabel)} · jauge ${esc(String(group.capacity))} personnes par créneau<br>
            ${available} créneau(x) disponible(s) sur ${slots.length}
          </div>
        </div>
        <div class="jps-recurring-body">
          <div class="jps-slot-grid">
            ${slots.map(slot => renderSlotButton(slot)).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderSlotButton(slot) {
    const status = slotStatus(slot);
    const inCart = cartCountForSlot(slot.id);

    if (slot.full) {
      return `
        <button type="button" class="jps-slotbtn full">
          ${esc(displayTime(slot.start))}–${esc(displayTime(slot.end))}
          <span>Complet</span>
        </button>
      `;
    }

    return `
      <button type="button" class="jps-slotbtn ${status.cls}" data-add-slot-id="${esc(slot.id)}">
        ${esc(displayTime(slot.start))}–${esc(displayTime(slot.end))}
        <span>${esc(String(slot.remaining))} restante(s) · ${esc(String(slot.pending))} en attente${inCart ? " · " + esc(String(inCart)) + " dans le panier" : ""}</span>
      </button>
    `;
  }

  function renderSingleSlot(slot) {
    const status = slotStatus(slot);
    const inCart = cartCountForSlot(slot.id);

    return `
      <article class="jps-single ${slot.full ? "full" : ""}">
        <div class="jps-single-top" data-slot-id="${esc(slot.id)}">
          <div class="jps-single-time">${esc(displayTime(slot.start))}–${esc(displayTime(slot.end))}</div>
          <div class="jps-single-title">${esc(slot.title)}</div>
          <div class="jps-single-room">${esc(slot.roomLabel)} · jauge ${esc(String(slot.capacity))} personnes</div>
        </div>

        <div class="jps-single-body">
          <div class="jps-capacity">
            <div class="jps-cap"><strong>${esc(String(slot.capacity))}</strong><span>jauge</span></div>
            <div class="jps-cap"><strong>${esc(String(slot.confirmed))}</strong><span>confirmés</span></div>
            <div class="jps-cap"><strong>${esc(String(slot.pending))}</strong><span>en attente</span></div>
            <div class="jps-cap"><strong>${esc(String(slot.remaining))}</strong><span>restants</span></div>
          </div>

          <div class="jps-status ${status.cls}">
            ${esc(status.text)}<br>
            ${esc(String(slot.remaining))} place(s) restante(s) · ${esc(String(slot.pending))} place(s) en attente de confirmation
            ${inCart ? "<br>" + esc(String(inCart)) + " personne(s) déjà dans votre panier pour ce créneau" : ""}
          </div>

          <div class="jps-modal-actions" style="margin-top:0;">
            <button type="button" class="jps-detailbtn" data-slot-id="${esc(slot.id)}">Voir le détail</button>
            ${slot.full
              ? '<button type="button" class="jps-request disabled">Créneau complet</button>'
              : '<button type="button" class="jps-request" data-add-slot-id="' + esc(slot.id) + '">Ajouter au panier</button>'
            }
          </div>
        </div>
      </article>
    `;
  }

  function openDetailModal(slot) {
    currentDetailSlot = slot;
    const status = slotStatus(slot);
    const inCart = cartCountForSlot(slot.id);

    $("jps-m-title").textContent = slot.title;
    $("jps-m-date").textContent = formatDateLong(slot.dateIso);
    $("jps-m-time").textContent = displayTime(slot.start) + "–" + displayTime(slot.end);
    $("jps-m-room").textContent = slot.roomLabel;
    $("jps-m-capacity").textContent = slot.capacity + " personnes";
    $("jps-m-remaining").textContent =
      slot.remaining + " restante(s) — " +
      slot.confirmed + " confirmée(s) — " +
      slot.pending + " en attente" +
      (inCart ? " — " + inCart + " dans votre panier" : "") +
      " — " + status.text;
    $("jps-m-type").textContent = slot.type || "—";
    $("jps-m-discipline").textContent = slot.discipline || "—";
    $("jps-m-public").textContent = slot.publicTarget || "—";
    $("jps-m-desc").textContent = slot.description || "—";
    $("jps-m-tech").textContent = slot.tech || "—";
    $("jps-m-mode").textContent = slot.autoGenerated
      ? "Proposition récurrente — créneau d’1h"
      : "Proposition ponctuelle";

    const btn = $("jps-m-add");
    btn.disabled = slot.full;
    btn.textContent = slot.full ? "Créneau complet" : "Ajouter ce créneau au panier";
    btn.classList.toggle("disabled", slot.full);

    openModal("jps-detail-modal");
  }

  function openBookingModal(slot) {
    currentBookingSlot = slot;
    $("jps-b-title").textContent = "Ajouter au panier";
    $("jps-b-slot").textContent = makeSlotLabel(slot);
    $("jps-b-places").textContent =
      slot.remaining + " place(s) restante(s), " + slot.pending + " place(s) en attente de confirmation.";
    $("jps-b-group").value = "";
    $("jps-b-students").value = "";
    $("jps-b-adults").value = "";
    $("jps-b-warning").style.display = "none";
    $("jps-b-warning").textContent = "";
    updateBookingHelp();
    openModal("jps-booking-modal");
    setTimeout(() => $("jps-b-group").focus(), 50);
  }

  function updateBookingHelp() {
    if (!currentBookingSlot) return;
    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);
    const total = students + adults;
    const alreadyInCart = cartCountForSlot(currentBookingSlot.id);
    const afterCart = total + alreadyInCart;

    $("jps-b-help").textContent =
      "Total pour cette ligne : " + total + " personne(s). " +
      "Déjà dans votre panier pour ce créneau : " + alreadyInCart + " personne(s).";

    if (afterCart > currentBookingSlot.remaining) {
      $("jps-b-warning").style.display = "block";
      $("jps-b-warning").textContent =
        "Attention : cette demande dépasse les places restantes confirmées pour ce créneau. " +
        "Vous pouvez quand même l’ajouter au panier, mais le Conservatoire devra arbitrer.";
    } else {
      $("jps-b-warning").style.display = "none";
      $("jps-b-warning").textContent = "";
    }
  }

  function addCurrentBookingToCart() {
    const slot = currentBookingSlot;
    if (!slot) return;

    const group = $("jps-b-group").value.trim();
    const students = parseNumber($("jps-b-students").value);
    const adults = parseNumber($("jps-b-adults").value);

    if (!group) {
      alert("Indiquez le groupe ou la classe concernée.");
      return;
    }

    if (students <= 0) {
      alert("Indiquez le nombre d’élèves.");
      return;
    }

    if (adults < 0) {
      alert("Le nombre d’accompagnateurs ne peut pas être négatif.");
      return;
    }

    cart.push({
      uid: String(Date.now()) + "_" + Math.random().toString(16).slice(2),
      slotId: slot.id,
      title: slot.title,
      dateIso: slot.dateIso,
      start: slot.start,
      end: slot.end,
      roomKey: slot.roomKey,
      roomLabel: slot.roomLabel,
      group,
      students,
      adults,
      capacity: slot.capacity,
      remainingAtSelection: slot.remaining,
      pendingAtSelection: slot.pending
    });

    saveCart();
    closeModal("jps-booking-modal");
    renderCart();
    render();
  }

  function removeCartItem(uid) {
    cart = cart.filter(item => item.uid !== uid);
    saveCart();
    renderCart();
    render();
  }

  function clearCart() {
    if (!cart.length) return;
    if (!confirm("Vider tout le panier ?")) return;
    cart = [];
    saveCart();
    renderCart();
    render();
  }

  function cartLineToTechnicalId(item) {
    return [
      item.dateIso,
      compactTime(item.start),
      compactTime(item.end),
      item.roomKey,
      slug(item.title),
      item.group,
      item.students,
      item.adults
    ].join("|");
  }

  function buildDetailField() {
    return cart.map((item, index) => {
      const total = item.students + item.adults;
      return [
        (index + 1) + ") " + formatDateLong(item.dateIso) + " — " + displayTime(item.start) + "-" + displayTime(item.end) + " — " + item.title,
        "Salle : " + item.roomLabel,
        "Groupe : " + item.group,
        "Élèves : " + item.students,
        "Accompagnateurs : " + item.adults,
        "Total : " + total
      ].join("\n");
    }).join("\n\n");
  }

  function buildIdsField() {
    return cart.map(cartLineToTechnicalId).join(";\n");
  }

  function makeV3FormUrl() {
    const detail = buildDetailField();
    const ids = buildIdsField();
    return FORM_URL +
      "?usp=pp_url" +
      "&" + FORM_ENTRY_DETAIL + "=" + encodeURIComponent(detail) +
      "&" + FORM_ENTRY_IDS + "=" + encodeURIComponent(ids);
  }

  function submitCart() {
    if (!cart.length) {
      alert("Votre panier est vide. Sélectionnez au moins un créneau.");
      return;
    }
    window.open(makeV3FormUrl(), "_blank");
  }

  function renderCart() {
    const bar = $("jps-cartbar");
    const meta = $("jps-cartbar-meta");
    const summary = $("jps-cart-summary");
    const list = $("jps-cart-list");
    const warning = $("jps-cart-warning");

    const count = cart.length;
    const people = cartTotalPeople();

    bar.style.display = count ? "block" : "none";
    meta.textContent = count + " créneau(x) sélectionné(s) · " + people + " personne(s) au total";
    summary.textContent = count
      ? count + " créneau(x) sélectionné(s), " + people + " personne(s) au total. Vous pouvez ajouter plusieurs groupes avant l’envoi."
      : "Votre panier est vide.";

    if (!count) {
      list.innerHTML = '<div class="jps-empty">Aucun créneau sélectionné pour le moment.</div>';
      warning.style.display = "none";
      return;
    }

    list.innerHTML = cart.map(item => {
      const total = item.students + item.adults;
      return `
        <div class="jps-cart-item">
          <div class="jps-cart-item-title">
            ${esc(formatDateLong(item.dateIso))} — ${esc(displayTime(item.start))}-${esc(displayTime(item.end))} — ${esc(item.title)}
          </div>
          <div class="jps-cart-item-meta">
            ${esc(item.roomLabel)}<br>
            Groupe : ${esc(item.group)} · Élèves : ${esc(String(item.students))} · Accompagnateurs : ${esc(String(item.adults))} · Total : ${esc(String(total))}
          </div>
          <div class="jps-cart-actions">
            <button type="button" class="jps-dangerbtn" data-remove-cart="${esc(item.uid)}">Retirer</button>
          </div>
        </div>
      `;
    }).join("");

    const hasOverflow = cart.some(item => {
      const slot = allSlots.find(s => s.id === item.slotId);
      if (!slot) return false;
      return cartCountForSlot(item.slotId) > slot.remaining;
    });

    if (hasOverflow) {
      warning.style.display = "block";
      warning.textContent = "Un ou plusieurs créneaux dépassent les places restantes confirmées. La demande pourra tout de même être transmise, mais elle devra être arbitrée par le Conservatoire.";
    } else {
      warning.style.display = "none";
      warning.textContent = "";
    }

    list.querySelectorAll("[data-remove-cart]").forEach(btn => {
      btn.addEventListener("click", function () {
        removeCartItem(btn.getAttribute("data-remove-cart"));
      });
    });
  }

  function openModal(id) {
    $(id).classList.add("open");
  }

  function closeModal(id) {
    $(id).classList.remove("open");
  }

  function bindDetailClicks() {
    root.querySelectorAll("[data-slot-id]").forEach(el => {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        const slot = allSlots.find(s => s.id === el.getAttribute("data-slot-id"));
        if (slot) openDetailModal(slot);
      });
    });

    root.querySelectorAll("[data-source-uid]").forEach(el => {
      el.addEventListener("click", function () {
        const sourceUid = el.getAttribute("data-source-uid");
        const dateIso = el.getAttribute("data-date");
        const slot = allSlots.find(s => s.sourceUid === sourceUid && s.dateIso === dateIso);
        if (slot) openDetailModal(slot);
      });
    });

    root.querySelectorAll("[data-add-slot-id]").forEach(el => {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const slot = allSlots.find(s => s.id === el.getAttribute("data-add-slot-id"));
        if (slot && !slot.full) openBookingModal(slot);
      });
    });
  }

  function render() {
    const visible = activeDay === "all"
      ? allSlots
      : allSlots.filter(slot => slot.dateIso === activeDay);

    renderStats(visible);

    const daysWrap = $("jps-days");
    daysWrap.innerHTML = "";

    const daysToRender = activeDay === "all"
      ? SCHOOL_DAYS
      : SCHOOL_DAYS.filter(day => day.iso === activeDay);

    daysToRender.forEach(day => {
      const daySlots = visible.filter(slot => slot.dateIso === day.iso);
      const recurring = groupedRecurringSlots(daySlots);
      const singles = daySlots.filter(slot => !slot.autoGenerated);

      const section = document.createElement("section");
      section.className = "jps-day";

      section.innerHTML = `
        <div class="jps-dayhead">
          <div>
            <div class="jps-daytitle">${esc(day.label)}</div>
            <div class="jps-daymeta">Choisissez une activité, puis ajoutez un ou plusieurs créneaux au panier.</div>
          </div>
          <div class="jps-daybadge">${daySlots.length} créneau(x)</div>
        </div>
        <div class="jps-daycontent">
          ${recurring.length
            ? '<h3 class="jps-blocktitle">Propositions récurrentes</h3><div class="jps-recurring-list">' + recurring.map(renderRecurringGroup).join("") + '</div>'
            : ""
          }
          ${singles.length
            ? '<h3 class="jps-blocktitle">Propositions ponctuelles</h3><div class="jps-single-list">' + singles.map(renderSingleSlot).join("") + '</div>'
            : ""
          }
          ${!daySlots.length
            ? '<div class="jps-empty">Aucun créneau disponible pour cette journée.</div>'
            : ""
          }
        </div>
      `;

      daysWrap.appendChild(section);
    });

    bindDetailClicks();
    renderCart();
  }

  root.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", function () {
      closeModal(btn.getAttribute("data-close-modal"));
    });
  });

  ["jps-detail-modal", "jps-booking-modal", "jps-cart-modal"].forEach(id => {
    $(id).addEventListener("click", function (e) {
      if (e.target === $(id)) closeModal(id);
    });
  });

  $("jps-m-add").addEventListener("click", function () {
    if (currentDetailSlot && !currentDetailSlot.full) {
      closeModal("jps-detail-modal");
      openBookingModal(currentDetailSlot);
    }
  });

  ["jps-b-students", "jps-b-adults"].forEach(id => {
    $(id).addEventListener("input", updateBookingHelp);
  });

  $("jps-b-add").addEventListener("click", addCurrentBookingToCart);
  $("jps-open-cart").addEventListener("click", function () {
    renderCart();
    openModal("jps-cart-modal");
  });
  $("jps-send-cart").addEventListener("click", submitCart);
  $("jps-cart-submit").addEventListener("click", submitCart);
  $("jps-cart-clear").addEventListener("click", clearCart);

  Promise.all([
    fetch(PROPOSITIONS_CSV).then(r => {
      if (!r.ok) throw new Error("Erreur propositions HTTP " + r.status);
      return r.text();
    }),
    fetch(DEMANDES_CSV).then(r => {
      if (!r.ok) throw new Error("Erreur demandes HTTP " + r.status);
      return r.text();
    })
  ])
    .then(([propositionsText, demandesText]) => {
      const propositionsRows = parseCSV(propositionsText);
      const demandesRows = parseCSV(demandesText);
      const slots = buildSlotsFromPropositions(propositionsRows);
      const reservations = buildReservationMap(demandesRows);

      allSlots = mergeReservations(slots, reservations);

      renderFilters();
      renderCart();
      render();

      if (!allSlots.length) {
        $("jps-error").textContent =
          "Aucun créneau public trouvé. Vérifie que les propositions sont bien en STATUT = Accepté et situées sur les créneaux scolaires.";
      }
    })
    .catch(err => {
      $("jps-error").textContent = "Erreur lors du chargement : " + err.message;
    });
});
