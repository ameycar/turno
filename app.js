import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ================= FIREBASE ================= */
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

/* ================= SEDE ================= */
const params = new URLSearchParams(window.location.search);
const SEDE = params.get("sede") || "Vitarte 1";
document.getElementById("sedeTitulo").textContent = SEDE;

/* ================= DOM ================= */
const listaEspera = document.getElementById("listaEspera");
const listaAtencion = document.getElementById("listaAtencion");
const listaAtendidos = document.getElementById("listaAtendidos");

/* ================= AUDIO ================= */
let audioHabilitado = false;
let llamadosRealizados = new Set();

window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* ================= AREA ================= */
function detectarArea(estudios) {
  if (!estudios) return "Atención Médica";

  const texto = JSON.stringify(estudios).toLowerCase();

  if (texto.includes("eco")) return "Ecografía";
  if (texto.includes("lab")) return "Laboratorio";
  if (texto.includes("rx") || texto.includes("rayo")) return "Rayos X";
  if (texto.includes("tomo")) return "Tomografía";
  if (texto.includes("reso")) return "Resonancia";

  return "Atención Médica";
}

/* ================= LLAMADO ================= */
function anunciar(p, id) {
  if (!audioHabilitado) return;
  if (llamadosRealizados.has(id)) return;

  llamadosRealizados.add(id);

  const area = detectarArea(p.estudio);

  const timbre = new Audio(
    "https://actions.google.com/sounds/v1/alarms/bank_bell.ogg"
  );

  timbre.play().then(() => {
    const voz = new SpeechSynthesisUtterance(
      `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ${area}`
    );
    voz.lang = "es-ES";
    speechSynthesis.speak(voz);
  });
}

/* ================= FIREBASE REALTIME ================= */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let cEspera = 0;
  let cAtencion = 0;
  let cAtendidos = 0;

  snapshot.forEach(child => {
    const p = child.val();
    const id = child.key;

    if (!p || p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.className = "paciente";
    div.innerHTML = `
      <strong>${p.apellidos} ${p.nombres}</strong><br>
      ${p.estudio || ""}
    `;

    /* ===== EN ESPERA ===== */
    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      cEspera++;
    }

    /* ===== EN ATENCIÓN ===== */
    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      cAtencion++;

      anunciar(p, id);
    }

    /* ===== ATENDIDO ===== */
    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
      cAtendidos++;
    }
  });

  /* ===== SCROLL AUTOMÁTICO ===== */
  listaEspera.classList.toggle("scroll-activo", cEspera >= 7);
  listaAtencion.classList.toggle("scroll-activo", cAtencion >= 7);
  listaAtendidos.classList.toggle("scroll-activo", cAtendidos >= 3);
});
