import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// SEDE DESDE URL
const params = new URLSearchParams(window.location.search);
const sedeId = params.get("sede");

if (!sedeId) {
  alert("ERROR: falta ?sede=ID_SEDE");
  throw new Error("Sin sede");
}

// ELEMENTOS
const turnoBox = document.getElementById("turnoActual");
const videoFrame = document.getElementById("videoFrame");

// VIDEO DE LA SEDE
onValue(ref(db, `sedes/${sedeId}/videoUrl`), (snap) => {
  if (snap.exists()) {
    videoFrame.src = snap.val();
  }
});

// TURNO ACTUAL DE LA SEDE
onValue(ref(db, `turnoActual/${sedeId}`), (snap) => {
  if (!snap.exists()) {
    turnoBox.textContent = "Esperando llamado...";
    return;
  }

  const t = snap.val();
  turnoBox.textContent = `${t.nombre} ${t.apellido}`;
});
