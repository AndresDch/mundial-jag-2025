import { db } from '../scripts/firebase-config.js';
import { auth } from '../scripts/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Función que calcula y actualiza la tabla de posiciones según resultados en inputs
function actualizarTabla() {
  const tabla = document.getElementById("tabla-grupo");
  const resultados = document.querySelectorAll("#resultados-tabla tbody tr");

  const estadisticas = {};
  const filasOriginales = Array.from(tabla.tBodies[0].rows);

  filasOriginales.forEach(fila => {
    const celdaEquipo = fila.cells[0];
    const equipo = celdaEquipo.getAttribute('data-equipo')?.trim() || celdaEquipo.textContent.trim();
    estadisticas[equipo] = {
      PJ: 0, G: 0, E: 0, P: 0, GF: 0, GC: 0, DG: 0, Pts: 0
    };
  });

  resultados.forEach(fila => {
    const eq1 = fila.cells[0].textContent.trim();
    const eq2 = fila.cells[2].textContent.trim();
    const goles1 = fila.cells[1].querySelector("input").value;
    const goles2 = fila.cells[3].querySelector("input").value;

    const g1 = parseInt(goles1);
    const g2 = parseInt(goles2);

    if (isNaN(g1) || isNaN(g2)) return;
    if (g1 === 0 && g2 === 0) return;

    estadisticas[eq1].PJ++;
    estadisticas[eq2].PJ++;

    estadisticas[eq1].GF += g1;
    estadisticas[eq1].GC += g2;

    estadisticas[eq2].GF += g2;
    estadisticas[eq2].GC += g1;

    estadisticas[eq1].DG = estadisticas[eq1].GF - estadisticas[eq1].GC;
    estadisticas[eq2].DG = estadisticas[eq2].GF - estadisticas[eq2].GC;

    if (g1 > g2) {
      estadisticas[eq1].G++;
      estadisticas[eq2].P++;
      estadisticas[eq1].Pts += 3;
    } else if (g1 < g2) {
      estadisticas[eq2].G++;
      estadisticas[eq1].P++;
      estadisticas[eq2].Pts += 3;
    } else {
      estadisticas[eq1].E++;
      estadisticas[eq2].E++;
      estadisticas[eq1].Pts += 1;
      estadisticas[eq2].Pts += 1;
    }
  });

  const ordenados = Object.entries(estadisticas).sort((a, b) => {
    if (b[1].Pts !== a[1].Pts) return b[1].Pts - a[1].Pts;
    if (b[1].DG !== a[1].DG) return b[1].DG - a[1].DG;
    return b[1].GF - a[1].GF;
  });

  const tbody = tabla.querySelector("tbody");
  tbody.innerHTML = "";

  ordenados.forEach(([equipo, stats]) => {
    const filaOriginal = filasOriginales.find(fila => {
      const celda = fila.cells[0];
      return celda.getAttribute('data-equipo') === equipo;
    });

    const fila = document.createElement("tr");

    const tdEquipo = document.createElement("td");
    tdEquipo.setAttribute("data-equipo", equipo);

    if (filaOriginal) {
      filaOriginal.cells[0].childNodes.forEach(nodo => {
        tdEquipo.appendChild(nodo.cloneNode(true));
      });
    } else {
      tdEquipo.textContent = equipo;
    }

    fila.appendChild(tdEquipo);

    ["PJ", "G", "E", "P", "GF", "GC", "DG", "Pts"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = stats[key];
      fila.appendChild(td);
    });

    tbody.appendChild(fila);
  });
}

// Cargar resultados guardados en Firestore
async function cargarResultadosDesdeFirestore() {
  const resultadosCol = collection(db, "resultados");
  const querySnapshot = await getDocs(resultadosCol);

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const fila = document.querySelector(`#resultados-tabla tbody tr[data-partido-id="${docSnap.id}"]`);
    if (fila) {
      fila.cells[1].querySelector("input").value = data.goles1 ?? "";
      fila.cells[3].querySelector("input").value = data.goles2 ?? "";
    }
  });

  actualizarTabla();
}

// Escuchar cambios en los inputs de goles
function escucharCambiosEnResultados() {
  const inputsGoles = document.querySelectorAll("#resultados-tabla tbody tr input");

  inputsGoles.forEach(input => {
    input.disabled = false; // Asegurarse de que estén activos para el usuario autorizado

    input.addEventListener("change", async (e) => {
      const fila = e.target.closest("tr");
      const partidoId = fila.getAttribute("data-partido-id");
      const equipo1 = fila.cells[0].textContent.trim();
      const equipo2 = fila.cells[2].textContent.trim();
      const goles1 = fila.cells[1].querySelector("input").value;
      const goles2 = fila.cells[3].querySelector("input").value;

      await setDoc(doc(db, "resultados", partidoId), {
        equipo1,
        goles1: goles1 === "" ? null : parseInt(goles1),
        equipo2,
        goles2: goles2 === "" ? null : parseInt(goles2),
      });

      actualizarTabla();
    });
  });
}

// 🔐 Controlar visibilidad y acceso según usuario
document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById('toggleResultados');
  const seccionResultados = document.getElementById('resultados');

  // Cargar resultados para todos
  cargarResultadosDesdeFirestore();

  // Control de acceso para edición
  onAuthStateChanged(auth, user => {
    const correoAutorizado = "dilancamacho2216@gmail.com";

    if (user && user.email === correoAutorizado) {
      // Mostrar botón para mostrar/ocultar resultados
      if (btnToggle && seccionResultados) {
        btnToggle.style.display = 'inline-block';
        btnToggle.addEventListener('click', () => {
          const visible = seccionResultados.style.display !== 'none';
          seccionResultados.style.display = visible ? 'none' : 'block';
          btnToggle.textContent = visible ? 'Mostrar resultados' : 'Ocultar resultados';
        });
      }

      // Activar edición
      escucharCambiosEnResultados();
    } else {
      // Usuario no autorizado: bloquear inputs
      const inputs = document.querySelectorAll("#resultados-tabla input");
      inputs.forEach(input => input.disabled = true);
      if (btnToggle) btnToggle.style.display = 'none';
    }
  });
});

