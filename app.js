import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const sonido = new Audio("https://actions.google.com/sounds/v1/bell/desk_bell.ogg");

function hablar(texto) {
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "es-ES";
  msg.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

const turnoRef = ref(db, "turnoActual_global");

onValue(turnoRef, (snapshot) => {
  if (!snapshot.exists()) return;

  const d = snapshot.val();

  document.getElementById("nombre").innerText = d.nombre;
  document.getElementById("estudio").innerText = d.estudio;
  document.getElementById("sede").innerText = d.sede;

  sonido.play();
  hablar(`Siguiente turno. ${d.nombre}. Área de ecografía. Sede ${d.sede}`);
});
