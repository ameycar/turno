import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 🔥 FIREBASE */
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

/* 🏥 SEDE */
const params = new URLSearchParams(window.location.search);
const SEDE = params.get("sede") || "Vitarte 1";
document.getElementById("sedeTitulo").textContent = SEDE;

/* 📋 LISTAS */
const listaEspera = document.getElementById("listaEspera");
const listaAtencion = document.getElementById("listaAtencion");
const listaAtendidos = document.getElementById("listaAtendidos");

/* 🔊 AUDIO */
let audioHabilitado = false;
let llamadosRealizados = new Set();

window.activarAudio = () => {
  audioHabilitado = true;
  alert("🔊 Sonido activado");
};

/* 📺 VIDEOS POR SEDE */
const videosPorSede = {
  "Vitarte 1": [
    "videos/vitarte1/video1.mp4",
    "videos/vitarte1/video2.mp4"
  ],
  "Vitarte 5": [],
  "Vitarte 7": []
};

let indiceVideo = 0;
const player = document.getElementById("videoPlayer");

function iniciarVideos() {
  const lista = videosPorSede[SEDE];
  if (!lista || lista.length === 0) return;

  player.src = lista[indiceVideo];
  player.play();

  player.onended = () => {
    indiceVideo = (indiceVideo + 1) % lista.length;
    player.src = lista[indiceVideo];
    player.play();
  };
}

iniciarVideos();

/* 🔄 FIREBASE */
onValue(ref(db, "pacientes"), snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede !== SEDE) return;

    const div = document.createElement("div");
    div.classList.add("paciente");
    div.innerHTML = `<strong>${p.apellidos} ${p.nombres}</strong><br>${p.estudio || ""}`;

    if (p.estado === "En espera") {
      div.classList.add("espera");
      listaEspera.appendChild(div);
    }

    if (p.estado === "En atención") {
      div.classList.add("atencion");
      listaAtencion.appendChild(div);
      anunciarUnaVez(p, child.key);
    }

    if (p.estado === "Atendido") {
      div.classList.add("atendido");
      listaAtendidos.appendChild(div);
    }
  });
});

/* 🔔 LLAMADO SOLO UNA VEZ */
function anunciarUnaVez(p, id) {
  if (!audioHabilitado) return;
  if (llamadosRealizados.has(id)) return;

  llamadosRealizados.add(id);

  const timbre = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  timbre.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${p.nombres} ${p.apellidos}, área de ecografía`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}

