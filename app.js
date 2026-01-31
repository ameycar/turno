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

/* SEDE */
const params = new URLSearchParams(window.location.search);
const SEDE = params.get("sede") || "Vitarte 1";
document.getElementById("sedeTitulo").textContent = SEDE;

/* LISTAS */
const listaEspera = document.getElementById("listaEspera");
const listaAtencion = document.getElementById("listaAtencion");
const listaAtendidos = document.getElementById("listaAtendidos");

let audioHabilitado = false;
const llamadosRealizados = new Set();

/* 🔓 ACTIVAR AUDIO (OBLIGATORIO POR EL NAVEGADOR) */
window.activarAudio = () => {
  audioHabilitado = true;

  const audio = document.getElementById("audioUnlock");
  audio.volume = 0;
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    alert("🔊 Audio activado correctamente");
  });

  speechSynthesis.cancel();
};

/* ======================================================
   🔎 OBTENER ÁREA SEGÚN ESTUDIOS (FIX DEFINITIVO REAL)
   🔥 LEE LAS CLAVES DE FIREBASE (NO LOS VALUES)
   ====================================================== */
function obtenerArea(estudios) {
  if (!estudios || typeof estudios !== "object") {
    return "atención médica";
  }

  // 🔑 Firebase guarda los estudios como claves con true
  const texto = Object.keys(estudios).join(" ").toLowerCase();

  if (texto.includes("eco")) return "ecografía";
  if (texto.includes("lab")) return "laboratorio";
  if (texto.includes("rx")) return "rayos x";
  if (texto.includes("rm") || texto.includes("reso")) return "resonancia";
  if (texto.includes("tem") || texto.includes("tomo")) return "tomografía";

  return "atención médica";
}

/* ======================================================
   🔥 FIREBASE TIEMPO REAL
   ====================================================== */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let e = 0, a = 0, at = 0;

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");

    const estudiosTexto = p.estudios
      ? Object.keys(p.estudios).join(", ")
      : "";

    div.innerHTML = `
      <strong>${p.apellidos} ${p.nombres}</strong><br>
      ${estudiosTexto}
    `;

    /* ===== EN ESPERA ===== */
    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      e++;
    }

    /* ===== EN ATENCIÓN (LLAMADO AQUÍ) ===== */
    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      a++;

      if (!llamadosRealizados.has(child.key)) {
        anunciar(p);
        llamadosRealizados.add(child.key);
      }
    }

    /* ===== ATENDIDO ===== */
    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
      at++;
    }
  });

  /* 🎬 SCROLL */
  listaEspera.classList.toggle("scroll-activo", e >= 7);
  listaAtencion.classList.toggle("scroll-activo", a >= 7);
  listaAtendidos.classList.toggle("scroll-activo", at >= 3);
});

/* ======================================================
   🔊 LLAMADO POR VOZ + TIMBRE
   ====================================================== */
function anunciar(p) {
  if (!audioHabilitado) return;

  const area = obtenerArea(p.estudios);

  const timbre = new Audio(
    "https://actions.google.com/sounds/v1/alarms/bank_bell.ogg"
  );
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ${area}`
  );
  voz.lang = "es-PE";
  speechSynthesis.speak(voz);
}

