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
let llamadosRealizados = new Set();

/* ACTIVAR AUDIO */
window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* ======================================================
   🔎 OBTENER ÁREA SEGÚN ESTUDIO (FUNCIÓN DEFINITIVA)
   ====================================================== */
function detectarArea(estudios) {
  if (!estudios || typeof estudios !== "object") {
    return "Área de Atención Médica";
  }

  const lista = Object.keys(estudios).join(" ").toLowerCase();

  if (lista.includes("eco")) return "Área de Ecografía";
  if (lista.includes("lab")) return "Área de Laboratorio";
  if (lista.includes("rx") || lista.includes("rayo")) return "Área de Rayos X";
  if (lista.includes("tomo")) return "Área de Tomografía";
  if (lista.includes("reso")) return "Área de Resonancia";

  return "Área de Atención Médica";
}


/* ======================================================
   🔥 FIREBASE EN TIEMPO REAL
   ====================================================== */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let contadorEspera = 0;
  let contadorAtencion = 0;
  let contadorAtendidos = 0;

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");
    div.innerHTML = `
      <strong>${p.apellidos} ${p.nombres}</strong><br>
      ${p.estudio || ""}
    `;

    /* ===== EN ESPERA ===== */
    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      contadorEspera++;
    }

    /* ===== EN ATENCIÓN ===== */
    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      contadorAtencion++;

      const idLlamado = child.key;
      if (!llamadosRealizados.has(idLlamado)) {
        anunciar(p);
        llamadosRealizados.add(idLlamado);
      }
    }

    /* ===== ATENDIDO ===== */
    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
      contadorAtendidos++;
    }
  });

  /* 🎬 SCROLL SOLO CUANDO CORRESPONDE */
  listaEspera.classList.toggle("scroll-activo", contadorEspera >= 7);
  listaAtencion.classList.toggle("scroll-activo", contadorAtencion >= 7);
  listaAtendidos.classList.toggle("scroll-activo", contadorAtendidos >= 3);
});

/* ======================================================
   🔊 LLAMADO POR VOZ (UNA SOLA VEZ POR PACIENTE)
   ====================================================== */
function anunciar(p) {
  if (!audioHabilitado) return;

  const area = obtenerArea(p.estudio);

  const timbre = new Audio(
    "https://actions.google.com/sounds/v1/alarms/bank_bell.ogg"
  );
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ${area}`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}
