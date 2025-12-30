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
let ultimoLlamado = "";

/* ACTIVAR AUDIO */
window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* ============================= */
/* 🔎 DETECTAR ÁREA POR ESTUDIO  */
/* ============================= */
function obtenerArea(estudio) {
  if (!estudio) return "atención médica";

  let texto = "";

  // Normalizar cualquier formato posible
  if (Array.isArray(estudio)) {
    texto = estudio.join(" ");
  } else if (typeof estudio === "object") {
    texto = Object.values(estudio).join(" ");
  } else {
    texto = estudio.toString();
  }

  texto = texto.toLowerCase().trim();

  if (texto.includes("eco")) return "ecografía";
  if (texto.includes("rx") || texto.includes("ray")) return "rayos x";
  if (texto.includes("lab")) return "laboratorio";
  if (texto.includes("reso")) return "resonancia";
  if (texto.includes("tomo")) return "tomografía";

  return "atención médica";
}

/* FIREBASE */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let contadorEspera = 0;

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");

    const estudioTexto = Array.isArray(p.estudio)
      ? p.estudio.join(", ")
      : (typeof p.estudio === "object"
          ? Object.values(p.estudio).join(", ")
          : (p.estudio || "")
        );

    div.innerHTML = `<strong>${p.apellidos} ${p.nombres}</strong><br>${estudioTexto}`;

    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      contadorEspera++;
    }

    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      anunciar(p);
    }

    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
    }
  });

  /* 🎬 SCROLL SOLO SI HAY 7 O MÁS EN ESPERA */
  if (contadorEspera >= 7) {
    listaEspera.classList.add("scroll-activo");
  } else {
    listaEspera.classList.remove("scroll-activo");
  }
});

/* 🔊 LLAMADO AUTOMÁTICO (UNA SOLA VEZ POR PACIENTE) */
function anunciar(p) {
  if (!audioHabilitado) return;

  const actual = `${p.apellidos} ${p.nombres}`;
  if (actual === ultimoLlamado) return;

  ultimoLlamado = actual;

  const area = obtenerArea(p.estudio);

  const timbre = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${actual}, área de ${area}`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}

/* 🔁 LLAMAR MANUALMENTE (BOTÓN FUTURO) */
function hacerLlamado(p) {
  if (!audioHabilitado) return;

  const area = obtenerArea(p.estudio);

  const timbre = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.nombres} ${p.apellidos}, área de ${area}`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}

function llamarOtraVez(paciente) {
  hacerLlamado(paciente);
}
