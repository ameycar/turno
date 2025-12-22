import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 🔥 TU CONFIG FIREBASE */
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

/* 🔴 SEDE ACTUAL */
const SEDE = "Vitarte 1";
document.getElementById("sedeTitulo").textContent = SEDE;

const listaEspera = document.getElementById("listaEspera");
const listaAtencion = document.getElementById("listaAtencion");
const listaAtendidos = document.getElementById("listaAtendidos");

const pacientesRef = ref(db, "pacientes");

onValue(pacientesRef, snapshot => {

  listaEspera.innerHTML = "";
  listaAtencion.innerHTML = "";
  listaAtendidos.innerHTML = "";

  const pacientes = [];

  snapshot.forEach(child => {
    const p = child.val();
    if (p.sede === SEDE) pacientes.push(p);
  });

  pacientes
    .sort((a,b) => (b.fechaEstado || 0) - (a.fechaEstado || 0))
    .forEach(p => {

      const div = document.createElement("div");
      div.classList.add("paciente");

      div.innerHTML = `<strong>${p.apellidos} ${p.nombres}</strong><br>${p.estudio}`;

      if (p.estado === "En espera") {
        div.classList.add("espera");
        listaEspera.appendChild(div);
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
});

/* 🔊 VOZ + TIMBRE */
let ultimoLlamado = "";

function anunciar(p) {
  const actual = `${p.apellidos} ${p.nombres}`;
  if (actual === ultimoLlamado) return;

  ultimoLlamado = actual;

  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/bank_bell.ogg");
  audio.play();

  const voz = new SpeechSynthesisUtterance(
    `Siguiente turno: ${actual}, área de ecografía`
  );
  voz.lang = "es-ES";
  speechSynthesis.speak(voz);
}
