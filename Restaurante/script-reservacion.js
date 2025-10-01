// ====================
// Funciones de storage
// ====================
function obtenerMesas() {
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  return Array.isArray(mesas) ? mesas : [];
}

function obtenerReservas() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  return Array.isArray(reservas) ? reservas : [];
}

function guardarReservas(reservas) {
  localStorage.setItem("reservas", JSON.stringify(reservas));
}

// ====================
// Utilidades
// ====================
function mostrarMensaje(mensaje, tipo = "info") {
  let icono = "info";
  if (tipo === "success") icono = "success";
  else if (tipo === "error") icono = "error";
  else if (tipo === "warning") icono = "warning";

  Swal.fire({
    icon: icono,
    title: mensaje,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });
}

function mostrarConfirmacion(mensaje, callback) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed && typeof callback === "function") {
      callback();
    }
  });
}

// ====================
// Render de Reservas
// ====================
function renderReservas() {
  const lista = document.getElementById("listaReservas");
  if (!lista) return;

  const reservas = obtenerReservas();
  lista.innerHTML = "";

  if (reservas.length === 0) {
    lista.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          <h4>No hay reservas registradas</h4>
        </div>
      </div>
    `;
    return;
  }

  reservas.forEach(reserva => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-3";

    let badgeClass = "bg-secondary";
    if (reserva.estado === "Pendiente") badgeClass = "bg-warning";
    else if (reserva.estado === "Confirmada") badgeClass = "bg-success";
    else if (reserva.estado === "Cancelada") badgeClass = "bg-danger";
    else if (reserva.estado === "Finalizada") badgeClass = "bg-primary";
    else if (reserva.estado === "No Show") badgeClass = "bg-dark";

    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title">${reserva.nombreCliente}</h5>
            <span class="badge ${badgeClass}">${reserva.estado}</span>
          </div>
          <p class="card-text"><i class="bi bi-people"></i> ${reserva.numPersonas} personas</p>
          <p class="card-text"><i class="bi bi-calendar"></i> ${reserva.fechaReserva} ${reserva.horaReserva}</p>
          <p class="card-text"><i class="bi bi-table"></i> Mesa: ${reserva.idMesaAsignada}</p>
          <p class="card-text"><i class="bi bi-star"></i> Ocasión: ${reserva.ocasionEspecial || "Ninguna"}</p>
          <p class="card-text"><i class="bi bi-pencil"></i> Notas: ${reserva.notasAdicionales || "Ninguna"}</p>
        </div>
        <div class="card-footer bg-transparent">
          <button class="btn btn-warning btn-sm" onclick="editarReserva('${reserva.idReserva}')">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="cancelarReserva('${reserva.idReserva}')">
            <i class="bi bi-x-circle"></i> Cancelar
          </button>
          <button class="btn btn-success btn-sm" onclick="finalizarReserva('${reserva.idReserva}')">
            <i class="bi bi-check2-circle"></i> Finalizar
          </button>
          <button class="btn btn-dark btn-sm" onclick="marcarNoShow('${reserva.idReserva}')">
            <i class="bi bi-person-x"></i> No Show
          </button>
        </div>
      </div>
    `;

    lista.appendChild(card);
  });
}

// ====================
// Acciones de Reservas
// ====================
function cancelarReserva(idReserva) {
  mostrarConfirmacion("¿Está seguro de que desea cancelar esta reserva?", () => {
    const reservas = obtenerReservas();
    const reservaIndex = reservas.findIndex(r => r.idReserva === idReserva);

    if (reservaIndex === -1) {
      mostrarMensaje("Reserva no encontrada", "error");
      return;
    }

    reservas[reservaIndex].estado = "Cancelada";
    guardarReservas(reservas);

    mostrarMensaje("Reserva cancelada correctamente", "success");
    renderReservas();
  });
}

function finalizarReserva(idReserva) {
  mostrarConfirmacion("¿Está seguro de que desea marcar esta reserva como finalizada?", () => {
    const reservas = obtenerReservas();
    const reservaIndex = reservas.findIndex(r => r.idReserva === idReserva);

    if (reservaIndex === -1) {
      mostrarMensaje("Reserva no encontrada", "error");
      return;
    }

    reservas[reservaIndex].estado = "Finalizada";
    guardarReservas(reservas);

    mostrarMensaje("Reserva finalizada correctamente", "success");
    renderReservas();
  });
}

function marcarNoShow(idReserva) {
  mostrarConfirmacion("¿Está seguro de que desea marcar esta reserva como No Show?", () => {
    const reservas = obtenerReservas();
    const reservaIndex = reservas.findIndex(r => r.idReserva === idReserva);

    if (reservaIndex === -1) {
      mostrarMensaje("Reserva no encontrada", "error");
      return;
    }

    reservas[reservaIndex].estado = "No Show";
    guardarReservas(reservas);

    mostrarMensaje("Reserva marcada como No Show", "success");
    renderReservas();
  });
}

// ====================
// Editar Reserva
// ====================
function editarReserva(idReserva) {
  const reservas = obtenerReservas();
  const reserva = reservas.find(r => r.idReserva === idReserva);
  if (!reserva) {
    mostrarMensaje("Reserva no encontrada", "error");
    return;
  }

  document.getElementById("editIdReserva").value = reserva.idReserva;
  document.getElementById("editNombreCliente").value = reserva.nombreCliente;
  document.getElementById("editNumPersonas").value = reserva.numPersonas;
  document.getElementById("editFechaReserva").value = reserva.fechaReserva;
  document.getElementById("editHoraReserva").value = reserva.horaReserva;
  document.getElementById("editMesaReserva").value = reserva.idMesaAsignada;
  document.getElementById("editOcasion").value = reserva.ocasionEspecial;
  document.getElementById("editNotasAdicionales").value = reserva.notasAdicionales;
  document.getElementById("editEstadoReserva").value = reserva.estado;

  const modal = new bootstrap.Modal(document.getElementById("modalEditarReserva"));
  modal.show();
}

// ====================
// Listeners
// ====================
document.addEventListener("DOMContentLoaded", () => {
  renderReservas();

  document.getElementById("formEditarReserva").addEventListener("submit", function (e) {
    e.preventDefault();

    const idReserva = document.getElementById("editIdReserva").value;
    const reservas = obtenerReservas();
    const reservaIndex = reservas.findIndex(r => r.idReserva === idReserva);

    if (reservaIndex === -1) {
      mostrarMensaje("Reserva no encontrada", "error");
      return;
    }

    reservas[reservaIndex] = {
      ...reservas[reservaIndex],
      nombreCliente: document.getElementById("editNombreCliente").value.trim(),
      numPersonas: parseInt(document.getElementById("editNumPersonas").value, 10),
      fechaReserva: document.getElementById("editFechaReserva").value,
      horaReserva: document.getElementById("editHoraReserva").value,
      idMesaAsignada: document.getElementById("editMesaReserva").value,
      ocasionEspecial: document.getElementById("editOcasion").value,
      notasAdicionales: document.getElementById("editNotasAdicionales").value.trim(),
      estado: document.getElementById("editEstadoReserva").value
    };

    guardarReservas(reservas);

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarReserva"));
    modal.hide();

    mostrarMensaje("Reserva actualizada correctamente", "success");
    renderReservas();
  });

  document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
    document.getElementById("filtroReservas").value = "";
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroFecha").value = "";
    document.getElementById("filtroOcasion").value = "";
    renderReservas();
  });
});
