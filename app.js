import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// LEER SEDE DESDE URL
const params = new URLSearchParams(window.location.search);
const sedeId = params.get("sede");

if (!sedeId) {
  alert("ERROR: Falta ?sede=ID_SEDE en la URL");
  throw new Error("Sede no definida");
}

// REFERENCIAS
const videoFrame = document.getElementById("videoFrame");
const turnoTexto = document.getElementById("turnoActual");

// CARGAR VIDEO DE LA SEDE
const sedeRef = ref(db, `sedes/${sedeId}`);
onValue(sedeRef, (snap) => {
  if (!snap.exists()) return;

  const data = snap.val();

  if (data.videoUrl) {
    videoFrame.src = data.videoUrl;
  }
});

// TURNO ACTUAL POR SEDE
const turnoRef = ref(db, `turnoActual/${sedeId}`);
onValue(turnoRef, (snap) => {
  if (!snap.exists()) {
    turnoTexto.textContent = "Esperando llamado...";
    return;
  }

  const t = snap.val();
  turnoTexto.textContent = `${t.nombre} ${t.apellido}`;
});

