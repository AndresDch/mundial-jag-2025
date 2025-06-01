function actualizarTabla() {
  const tabla = document.getElementById("tabla-grupo");
  const resultados = document.querySelectorAll("#resultados-tabla tbody tr");

  // Map para llevar estadísticas por equipo
  const estadisticas = {};

  // Guardar filas originales para conservar imágenes y nombres
  const filasOriginales = Array.from(tabla.tBodies[0].rows);

  // Inicializar estadísticas
  filasOriginales.forEach(fila => {
    const celdaEquipo = fila.cells[0];
    const equipo = celdaEquipo.getAttribute('data-equipo')?.trim() || celdaEquipo.textContent.trim();
    estadisticas[equipo] = {
      PJ: 0, G: 0, E: 0, P: 0, GF: 0, GC: 0, DG: 0, Pts: 0
    };
  });

  // Procesar resultados ingresados
  resultados.forEach(fila => {
    const eq1 = fila.cells[0].textContent.trim();
    const eq2 = fila.cells[2].textContent.trim();
    const goles1 = fila.cells[1].querySelector("input").value;
    const goles2 = fila.cells[3].querySelector("input").value;

    const g1 = parseInt(goles1);
    const g2 = parseInt(goles2);

    // Validar que ambos goles sean números
    if (isNaN(g1) || isNaN(g2)) return;

    // Si ambos goles son 0, consideramos que no se ha jugado
    if (g1 === 0 && g2 === 0) return;

    // Actualizar estadísticas
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

  // Ordenar equipos
  const ordenados = Object.entries(estadisticas).sort((a, b) => {
    if (b[1].Pts !== a[1].Pts) return b[1].Pts - a[1].Pts;
    if (b[1].DG !== a[1].DG) return b[1].DG - a[1].DG;
    return b[1].GF - a[1].GF;
  });

  // Vaciar y reconstruir tabla
  const tbody = tabla.querySelector("tbody");
  tbody.innerHTML = "";

  ordenados.forEach(([equipo, stats]) => {
    const filaOriginal = filasOriginales.find(fila => {
      const celda = fila.cells[0];
      return celda.getAttribute('data-equipo') === equipo;
    });

    const fila = document.createElement("tr");

    // Celda con imagen y nombre del equipo
    const tdEquipo = document.createElement("td");
    tdEquipo.setAttribute("data-equipo", equipo);

    if (filaOriginal) {
      const celdaOriginal = filaOriginal.cells[0];
      celdaOriginal.childNodes.forEach(nodo => {
        tdEquipo.appendChild(nodo.cloneNode(true));
      });
    } else {
      tdEquipo.textContent = equipo;
    }

    fila.appendChild(tdEquipo);

    // Celdas de estadísticas
    ["PJ", "G", "E", "P", "GF", "GC", "DG", "Pts"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = stats[key];
      fila.appendChild(td);
    });

    tbody.appendChild(fila);
  });
}

// Mostrar/Ocultar resultados
document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById('toggleResultados');
  const seccionResultados = document.getElementById('resultados');

  if (btnToggle && seccionResultados) {
    btnToggle.addEventListener('click', () => {
      const visible = seccionResultados.style.display !== 'none';
      seccionResultados.style.display = visible ? 'none' : 'block';
      btnToggle.textContent = visible ? 'Mostrar resultados' : 'Ocultar resultados';
    });
  }
});

