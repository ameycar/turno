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

let audioHabilitado = false;

/* 🔒 REGISTRO DE PACIENTES YA LLAMADOS */
const llamadosRealizados = new Set();

/* ACTIVAR AUDIO */
window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* FIREBASE */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let contadorEspera = 0;
  let contadorAtencion = 0;

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const idPaciente = `${p.sede}_${p.apellidos}_${p.nombres}`;

    const div = document.createElement("div");
    div.classList.add("paciente");

    const estudio = p.estudio || "";
    div.innerHTML = `<strong>${p.apellidos} ${p.nombres}</strong><br>${estudio}`;

    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      contadorEspera++;
    }

    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      contadorAtencion++;

      /* 🔊 LLAMADO SOLO UNA VEZ POR PACIENTE */
      if (audioHabilitado && !llamadosRealizados.has(idPaciente)) {
        anunciar(p);
        llamadosRealizados.add(idPaciente);
      }
    }

    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
    }
  });

  /* 🎬 SCROLL SOLO SI HAY 7 O MÁS */
  listaEspera.style.animation =
    contadorEspera >= 7 ? "scrollVertical 20s linear infinite" : "none";

  listaAtencion.style.animation =
    contadorAtencion >= 7 ? "scrollVertical 20s linear infinite" : "none";
});

/* 🔊 FUNCIÓN DE VOZ */
function anunciar(p) {
  const timbre = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  timbre.play();

  const texto = `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ecografía`;
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}
