document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("auditorium-calendar");

  if (!el) {
    console.log("DIV introuvable");
    return;
  }

  el.innerHTML = `
    <div style="padding:20px;background:#d1fae5;border:2px solid green">
      JS EXTERNE OK ✅
    </div>
  `;
});
