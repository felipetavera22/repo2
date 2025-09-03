// ====================
// Funciones de storage
// ====================
function obtenerMesas() {
  return JSON.parse(localStorage.getItem("mesas")) || [];
}

function guardarMesas(mesas) {
  localStorage.setItem("mesas", JSON.stringify(mesas));
}

function obtenerReservas() {
  return JSON.parse(localStorage.getItem("reservas")) || [];
}

function guardarReservas(reservas) {
  localStorage.setItem("reservas", JSON.stringify(reservas));
}

// ====================
// Renderizar Mesas
// ====================
function renderMesas() {
  const lista = document.getElementById("listaMesas");
  if (!lista) return;
  lista.innerHTML = "";

  const mesas = obtenerMesas();

  mesas.forEach((mesa, index) => {
    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
      <div class="card ${mesa.estado}">
        <div class="card-body">
          <h5 class="card-title">Mesa ${index + 1}</h5>
          <p><strong>Capacidad:</strong> ${mesa.capacidad}</p>
          <p><strong>Ubicación:</strong> ${mesa.ubicacion}</p>
          <p class="estado">Estado: ${mesa.estado}</p>
          <button class="btn btn-warning btn-sm" onclick="editarMesa(${mesa.id})">Editar</button>
          <button class="btn btn-primary btn-sm" onclick="reservarMesa(${mesa.id})">Reservar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarMesa(${mesa.id})">Eliminar</button>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });
}

// ====================
// CRUD Mesas
// ====================
function agregarMesa() {
  const mesas = obtenerMesas();
  const id = Date.now();
  const capacidad = prompt("Capacidad de la mesa:");
  const ubicacion = prompt("Ubicación de la mesa (ej. Terraza, Interior, Ventana):");

  if (!capacidad || !ubicacion) {
    alert("Debes completar todos los campos.");
    return;
  }

  mesas.push({
    id,
    capacidad,
    ubicacion,
    estado: "disponible"
  });

  guardarMesas(mesas);
  renderMesas();
}

function editarMesa(id) {
  const mesas = obtenerMesas();
  const mesa = mesas.find(m => m.id === id);

  if (!mesa) return;

  const nuevaCapacidad = prompt("Nueva capacidad:", mesa.capacidad);
  const nuevaUbicacion = prompt("Nueva ubicación:", mesa.ubicacion);

  if (!nuevaCapacidad || !nuevaUbicacion) {
    alert("Debes completar todos los campos.");
    return;
  }

  mesa.capacidad = nuevaCapacidad;
  mesa.ubicacion = nuevaUbicacion;

  guardarMesas(mesas);
  renderMesas();
}

function eliminarMesa(id) {
  let mesas = obtenerMesas();
  mesas = mesas.filter(m => m.id !== id);
  guardarMesas(mesas);
  renderMesas();
}

// ====================
// Reservas
// ====================
let mesaSeleccionada = null;

function reservarMesa(idMesa) {
  mesaSeleccionada = idMesa;
  const modal = new bootstrap.Modal(document.getElementById("modalReserva"));
  modal.show();
}

function mostrarReservas() {
  const reservas = obtenerReservas();
  const mesas = obtenerMesas();
  const tbody = document.getElementById("tablaReservas");

  const inputFiltro = document.getElementById("filtroReservas");
  const filtroEstado = document.getElementById("filtroEstado");
  const filtroFechaInicio = document.getElementById("filtroFechaInicio");
  const filtroFechaFin = document.getElementById("filtroFechaFin");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

  function renderTabla() {
    tbody.innerHTML = "";
    const texto = inputFiltro.value.toLowerCase();
    const estado = filtroEstado.value;
    const fechaInicio = filtroFechaInicio.value;
    const fechaFin = filtroFechaFin.value;

    let coincidencias = 0;

    reservas.forEach(r => {
      const mesa = mesas.find(m => m.id === r.mesa);
      const mesaNombre = mesa ? "Mesa " + (mesas.indexOf(mesa) + 1) : "N/A";

      const datosFila = `${mesaNombre} ${r.cliente} ${r.fecha} ${r.hora} ${r.ocasion} ${r.estado}`.toLowerCase();

      let pasaFiltro = true;
      if (texto && !datosFila.includes(texto)) pasaFiltro = false;
      if (estado && r.estado !== estado) pasaFiltro = false;
      if (fechaInicio && r.fecha < fechaInicio) pasaFiltro = false;
      if (fechaFin && r.fecha > fechaFin) pasaFiltro = false;

      if (pasaFiltro) {
        coincidencias++;
        tbody.innerHTML += `
          <tr>
            <td>${mesaNombre}</td>
            <td>${r.cliente}</td>
            <td>${r.personas}</td>
            <td>${r.fecha}</td>
            <td>${r.hora}</td>
            <td>${r.ocasion}</td>
            <td>${r.estado}</td>
          </tr>
        `;
      }
    });

    // Si no hay coincidencias
    if (coincidencias === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">⚠️ No se encontraron reservas</td>
        </tr>
      `;
    }
  }

  // Render inicial
  renderTabla();

  // Escuchar cambios en filtros
  inputFiltro.addEventListener("input", renderTabla);
  filtroEstado.addEventListener("change", renderTabla);
  filtroFechaInicio.addEventListener("change", renderTabla);
  filtroFechaFin.addEventListener("change", renderTabla);

  // Botón limpiar filtros
  btnLimpiarFiltros.addEventListener("click", () => {
    inputFiltro.value = "";
    filtroEstado.value = "";
    filtroFechaInicio.value = "";
    filtroFechaFin.value = "";
    renderTabla();
  });

  const modal = new bootstrap.Modal(document.getElementById("modalVerReservas"));
  modal.show();
}

// ====================
// Guardar Reservas
// ====================
document.getElementById("formReserva").addEventListener("submit", function(e) {
  e.preventDefault();

  const mesas = obtenerMesas();
  const mesa = mesas.find(m => m.id === mesaSeleccionada);

  if (!mesa) {
    alert("⚠️ Mesa no encontrada.");
    return;
  }

  const nombre = document.getElementById("nombreCliente").value;
  const personas = parseInt(document.getElementById("numPersonas").value, 10);
  const fecha = document.getElementById("fechaReserva").value;
  const hora = document.getElementById("horaReserva").value;
  const ocasion = document.getElementById("ocasion").value;

  const hoy = new Date().toISOString().split("T")[0];
  if (fecha <= hoy) {
    alert("⚠️ La fecha debe ser posterior a hoy.");
    return;
  }
  if (hora < "08:00" || hora > "20:00") {
    alert("⚠️ La hora debe estar entre 08:00 y 20:00.");
    return;
  }
  if (personas > mesa.capacidad) {
    alert(`⚠️ La mesa solo soporta ${mesa.capacidad} personas.`);
    return;
  }

  const reservas = obtenerReservas();
  const idReserva = Date.now();
  reservas.push({
    id: idReserva,
    mesa: mesa.id,
    cliente: nombre,
    personas,
    fecha,
    hora,
    ocasion,
    estado: "activa"
  });
  guardarReservas(reservas);

  mesa.estado = "ocupada";
  guardarMesas(mesas);

  renderMesas();

  bootstrap.Modal.getInstance(document.getElementById("modalReserva")).hide();
  document.getElementById("formReserva").reset();

  alert("✅ Reserva creada correctamente.");
});

// ====================
// Inicializar
// ====================
document.addEventListener("DOMContentLoaded", renderMesas);
