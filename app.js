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

/* OBTENER ÁREA SEGÚN ESTUDIO */
function obtenerArea(estudio) {
  if (!estudio) return "atención médica";

  let texto = "";

  if (Array.isArray(estudio)) {
    texto = estudio.join(" ").toLowerCase();
  } else {
    texto = estudio.toString().toLowerCase();
  }

  if (texto.includes("eco")) return "ecografía";
  if (texto.includes("lab")) return "laboratorio";
  if (texto.includes("rx") || texto.includes("rayos")) return "rayos x";
  if (texto.includes("reso")) return "resonancia";
  if (texto.includes("tomo")) return "tomografía";

  return "atención médica";
}

/* FIREBASE */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  let espera = 0;
  let atencion = 0;

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");
    div.innerHTML = `<strong>${p.apellidos} ${p.nombres}</strong><br>${p.estudio || ""}`;

    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
      espera++;
    }

    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      atencion++;

      const idLlamado = child.key;
      if (!llamadosRealizados.has(idLlamado)) {
        anunciar(p);
        llamadosRealizados.add(idLlamado);
      }
    }

    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
    }
  });

  listaEspera.classList.toggle("scroll-activo", espera >= 7);
  listaAtencion.classList.toggle("scroll-activo", atencion >= 7);
});

/* 🔊 ANUNCIO */
function anunciar(p) {
  if (!audioHabilitado) return;

  const area = obtenerArea(p.estudio);

  const timbre = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.apellidos} ${p.nombres}, área de ${area}`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}
