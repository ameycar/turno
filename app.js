import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const listaAtencion = document.getElementById("listaAtencion");
const listaAtendidos = document.getElementById("listaAtendidos");

/* CONTROL DE AUDIO */
let audioHabilitado = false;

/* 🔒 REGISTRO DE PACIENTES YA LLAMADOS */
const llamadosRealizados = new Set();

/* ACTIVAR AUDIO (click del usuario) */
window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* ESCUCHAR FIREBASE */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  snapshot.forEach(child => {
    const p = child.val();
    const id = child.key;

    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");

    div.innerHTML = `
      <strong>${p.apellidos} ${p.nombres}</strong><br>
      ${p.estudio || ""}
    `;

    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
    }

    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);

      // 🔔 SOLO LLAMA UNA VEZ POR PACIENTE
      if (!llamadosRealizados.has(id)) {
        anunciar(p);
        llamadosRealizados.add(id);
      }
    }

    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
    }
  });
});

/* 🔊 LLAMADO AUTOMÁTICO */
function anunciar(p) {
  if (!audioHabilitado) return;

  const timbre = new Audio(
    "https://actions.google.com/sounds/v1/alarms/bank_bell.ogg"
  );
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ecografía`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}

/* 🔁 LLAMADO MANUAL (botón) */
function hacerLlamado(p) {
  if (!audioHabilitado) return;

  const timbre = new Audio(
    "https://actions.google.com/sounds/v1/alarms/bank_bell.ogg"
  );
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.nombres} ${p.apellidos}, área de ecografía`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}

window.llamarOtraVez = (paciente) => {
  hacerLlamado(paciente);
};

