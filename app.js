import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// =======================
// OBTENER SEDE DESDE URL
// =======================
const params = new URLSearchParams(window.location.search);
const sedeKey = params.get("sede");

if (!sedeKey) {
  alert("ERROR: Falta ?sede=nombre_sede en la URL");
  throw new Error("Sede no definida");
}

// =======================
// ELEMENTOS
// =======================
const box = document.getElementById("turnoBox");
const sinTurno = document.getElementById("sinTurno");
const nombreEl = document.getElementById("nombre");
const estudioEl = document.getElementById("estudio");
const sedeEl = document.getElementById("sede");
const sonido = document.getElementById("sonido");

// =======================
// VOZ
// =======================
function hablar(texto) {
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-PE";
  msg.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

// =======================
// ESCUCHAR TURNO POR SEDE
// =======================
const turnoRef = ref(db, `turnoActual/${sedeKey}`);

onValue(turnoRef, (snapshot) => {
  const data = snapshot.val();

  // NO HAY TURNO
  if (!data) {
    box.classList.add("hidden");
    sinTurno.classList.remove("hidden");
    return;
  }

  // MOSTRAR TURNO
  sedeEl.textContent = data.sede || sedeKey;
  nombreEl.textContent = data.nombre || "";
  estudioEl.textContent = data.estudio || "";

  sinTurno.classList.add("hidden");
  box.classList.remove("hidden");

  // SONIDO + VOZ
  sonido.play();
  hablar(`Siguiente turno. ${data.nombre}. Área de ${data.estudio}`);
});
