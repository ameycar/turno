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

/* 🔒 HISTORIAL DE ESTADOS */
const estadoAnterior = {};

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

    const idPaciente = child.key;

    const div = document.createElement("div");
    div.classList.add("paciente");

    div.innerHTML = `<strong>${p.apellidos} ${p.nombres}</strong><br>${p.estudio || ""}`;

    /* ESPERA */
    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      contadorEspera++;
    }

    /* ATENCIÓN */
    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      contadorAtencion++;

      /* 🔊 SOLO SI CAMBIÓ A EN ATENCIÓN */
      if (
        audioHabilitado &&
        estadoAnterior[idPaciente] !== "En atención"
      ) {
        anunciar(p);
      }
    }

    /* ATENDIDO */
    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
    }

    /* GUARDAMOS ESTADO ACTUAL */
    estadoAnterior[idPaciente] = p.estado;
  });

  listaEspera.classList.toggle("scroll-activo", contadorEspera >= 7);
  listaAtencion.classList.toggle("scroll-activo", contadorAtencion >= 7);
});

/* 🏥 DETERMINAR ÁREA */
function obtenerArea(estudio = "") {
  const e = estudio.toLowerCase();

  if (e.includes("eco")) return "ecografía";
  if (e.includes("rx") || e.includes("rayos")) return "rayos x";
  if (e.includes("lab")) return "laboratorio";
  if (e.includes("tomo")) return "tomografía";
  if (e.includes("reson")) return "resonancia";

  return "atención médica";
}

/* 🔊 LLAMADO */
function anunciar(p) {
  const area = obtenerArea(p.estudio);

  const timbre = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ${area}`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}
