import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  onChildChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* CONFIG FIREBASE */
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "estado-pacientes.firebaseapp.com",
  databaseURL: "https://estado-pacientes-default-rtdb.firebaseio.com",
  projectId: "estado-pacientes",
  storageBucket: "estado-pacientes.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* SEDE POR URL */
const params = new URLSearchParams(window.location.search);
const SEDE = params.get("sede") || "Vitarte 1";
document.getElementById("sedeTitulo").textContent = SEDE;

const listaEspera = document.getElementById("listaEspera");
const listaAtencion = document.getElementById("listaAtendidos"); // opcional
const listaAtendidos = document.getElementById("listaAtendidos");

let audioHabilitado = false;
let llamadosRealizados = new Set();

/* ACTIVAR AUDIO (OBLIGATORIO PARA NAVEGADOR) */
window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* ======================================================
   🔎 DETECTAR ÁREA SEGÚN ESTUDIO (OBJETO O ARRAY)
   ====================================================== */
function detectarArea(estudios) {
  if (!estudios) return "Atención médica";

  let texto = "";

  if (Array.isArray(estudios)) {
    texto = estudios.join(" ").toLowerCase();
  } else if (typeof estudios === "object") {
    texto = Object.keys(estudios).join(" ").toLowerCase();
  } else {
    texto = estudios.toString().toLowerCase();
  }

  if (texto.includes("eco")) return "ecografía";
  if (texto.includes("lab")) return "laboratorio";
  if (texto.includes("rx") || texto.includes("rayo")) return "rayos X";
  if (texto.includes("tomo")) return "tomografía";
  if (texto.includes("reso")) return "resonancia";

  return "atención médica";
}

/* ======================================================
   📡 LISTADO EN TIEMPO REAL (VISUAL)
   ====================================================== */
onValue(ref(db, "pacientes"), snapshot => {
  listaEspera.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let espera = 0;
  let atendidos = 0;

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");
    div.innerHTML = `
      <strong>${p.apellidos} ${p.nombres}</strong><br>
      ${JSON.stringify(p.estudio ?? "")}
    `;

    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      espera++;
    }

    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
      atendidos++;
    }
  });

  listaEspera.classList.toggle("scroll-activo", espera >= 7);
  listaAtendidos.classList.toggle("scroll-activo", atendidos >= 3);
});

/* ======================================================
   🔊 LLAMADO EXACTO CUANDO PASA A ATENDIDO
   ====================================================== */
onChildChanged(ref(db, "pacientes"), snapshot => {
  const p = snapshot.val();
  const id = snapshot.key;

  if (!p || p.sede !== SEDE) return;
  if (p.estado !== "Atendido") return;
  if (llamadosRealizados.has(id)) return;
  if (!audioHabilitado) return;

  llamadosRealizados.add(id);
  anunciar(p);
});

/* ======================================================
   🔔 SONIDO + VOZ
   ====================================================== */
function anunciar(p) {
  const area = detectarArea(p.estudio);

  const timbre = new Audio(
    "https://actions.google.com/sounds/v1/alarms/bank_bell.ogg"
  );
  timbre.currentTime = 0;
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ${area}`
  );
  voz.lang = "es-ES";
  voz.rate = 0.9;

  speechSynthesis.cancel();
  speechSynthesis.speak(voz);
}
