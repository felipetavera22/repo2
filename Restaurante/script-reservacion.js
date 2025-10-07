// ====================
// Constantes
// ====================
const OCASIONES_ESPECIALES = [
  { value: "ninguna", text: "Ninguna", emoji: "📅" },
  { value: "cumpleaños", text: "Cumpleaños", emoji: "🎂" },
  { value: "aniversario", text: "Aniversario", emoji: "💕" },
  { value: "reunion", text: "Reunión de Negocios", emoji: "💼" },
  { value: "romantica", text: "Cena Romántica", emoji: "🌹" },
  { value: "graduacion", text: "Graduación", emoji: "🎓" },
  { value: "despedida", text: "Despedida", emoji: "✈️" },
  { value: "familia", text: "Reunión Familiar", emoji: "👨‍👩‍👧‍👦" }
];

// ====================
// Funciones de storage
// ====================
function obtenerMesas() {
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  return Array.isArray(mesas) ? mesas : [];
}

function guardarMesas(mesas) {
  localStorage.setItem("mesas", JSON.stringify(mesas));
}

function obtenerReservas() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  return Array.isArray(reservas) ? reservas : [];
}

function guardarReservas(reservas) {
  localStorage.setItem("reservas", JSON.stringify(reservas));
}

// ====================
// Utilidades con SweetAlert2
// ====================
function mostrarMensaje(mensaje, tipo = "info") {
  const iconos = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info"
  };

  Swal.fire({
    icon: iconos[tipo] || "info",
    title: tipo === "success" ? "¡Éxito!" : tipo === "error" ? "Error" : "Información",
    text: mensaje,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
}

function mostrarConfirmacion(mensaje, callback) {
  Swal.fire({
    title: "¿Está seguro?",
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, confirmar",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed && typeof callback === "function") {
      callback();
    }
  });
}

// Función para liberar una mesa (cambiarla a disponible)
function liberarMesa(idMesa) {
  const mesas = obtenerMesas();
  const mesaIndex = mesas.findIndex(m => m.id === idMesa);
  
  if (mesaIndex !== -1) {
    // Verificar si hay otras reservas activas para esta mesa
    const reservas = obtenerReservas();
    const reservasActivas = reservas.filter(r => 
      r.idMesaAsignada === idMesa && 
      (r.estado === "Pendiente" || r.estado === "Confirmada")
    );
    
    // Solo liberar la mesa si no hay más reservas activas
    if (reservasActivas.length === 0) {
      mesas[mesaIndex].estado = "disponible";
      guardarMesas(mesas);
    }
  }
}

// Función para obtener el emoji de la ocasión
function obtenerEmojiOcasion(valorOcasion) {
  const ocasion = OCASIONES_ESPECIALES.find(o => o.value === valorOcasion);
  return ocasion ? ocasion.emoji : "📅";
}

// Función para obtener el texto de la ocasión
function obtenerTextoOcasion(valorOcasion) {
  const ocasion = OCASIONES_ESPECIALES.find(o => o.value === valorOcasion);
  return ocasion ? ocasion.text : "Ninguna";
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

    const emojiOcasion = obtenerEmojiOcasion(reserva.ocasionEspecial);
    const textoOcasion = obtenerTextoOcasion(reserva.ocasionEspecial);

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
          <p class="card-text">
            <span style="font-size: 1.5rem;">${emojiOcasion}</span> 
            <strong>Ocasión:</strong> ${textoOcasion}
          </p>
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

    const idMesa = reservas[reservaIndex].idMesaAsignada;
    reservas[reservaIndex].estado = "Cancelada";
    guardarReservas(reservas);

    // Liberar la mesa
    liberarMesa(idMesa);

    Swal.fire({
      icon: "success",
      title: "¡Reserva cancelada!",
      text: "La reserva ha sido cancelada y la mesa está disponible nuevamente",
      timer: 2000,
      showConfirmButton: false
    });
    
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

    const idMesa = reservas[reservaIndex].idMesaAsignada;
    reservas[reservaIndex].estado = "Finalizada";
    guardarReservas(reservas);

    // Liberar la mesa
    liberarMesa(idMesa);

    Swal.fire({
      icon: "success",
      title: "¡Reserva finalizada!",
      text: "La reserva ha sido completada exitosamente",
      timer: 2000,
      showConfirmButton: false
    });
    
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

    const idMesa = reservas[reservaIndex].idMesaAsignada;
    reservas[reservaIndex].estado = "No Show";
    guardarReservas(reservas);

    // Liberar la mesa
    liberarMesa(idMesa);

    Swal.fire({
      icon: "info",
      title: "Marcado como No Show",
      text: "La reserva ha sido marcada como No Show y la mesa está disponible",
      timer: 2000,
      showConfirmButton: false
    });
    
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

  // Llenar select de mesas disponibles
  const selectMesasEdit = document.getElementById("editMesaReserva");
  selectMesasEdit.innerHTML = '<option value="">Seleccione una mesa</option>';
  const mesas = obtenerMesas();
  mesas.forEach(mesa => {
    const option = document.createElement("option");
    option.value = mesa.id;
    option.textContent = `${mesa.id} (${mesa.capacidad} personas, ${mesa.ubicacion})`;
    option.selected = mesa.id === reserva.idMesaAsignada;
    selectMesasEdit.appendChild(option);
  });

  document.getElementById("editIdReserva").value = reserva.idReserva;
  document.getElementById("editNombreCliente").value = reserva.nombreCliente;
  document.getElementById("editNumPersonas").value = reserva.numPersonas;
  document.getElementById("editFechaReserva").value = reserva.fechaReserva;
  document.getElementById("editHoraReserva").value = reserva.horaReserva;
  document.getElementById("editNotasAdicionales").value = reserva.notasAdicionales;
  document.getElementById("editEstadoReserva").value = reserva.estado;

  // Establecer la ocasión seleccionada
  document.getElementById("editOcasion").value = reserva.ocasionEspecial;

  const modal = new bootstrap.Modal(document.getElementById("modalEditarReserva"));
  modal.show();
}

// Inicializar selects de ocasiones con emojis
function inicializarSelectOcasiones() {
  const selectEditOcasion = document.getElementById("editOcasion");
  if (selectEditOcasion) {
    selectEditOcasion.innerHTML = "";
    OCASIONES_ESPECIALES.forEach(ocasion => {
      const option = document.createElement("option");
      option.value = ocasion.value;
      option.textContent = `${ocasion.emoji} ${ocasion.text}`;
      selectEditOcasion.appendChild(option);
    });
  }
}

// ====================
// Listeners
// ====================
document.addEventListener("DOMContentLoaded", () => {
  inicializarSelectOcasiones();
  renderReservas();

  // Guardar cambios al editar reserva
  const formEditarReserva = document.getElementById("formEditarReserva");
  formEditarReserva.setAttribute("novalidate", "");
  
  formEditarReserva.addEventListener("submit", function (e) {
    e.preventDefault();

    const idReserva = document.getElementById("editIdReserva").value;
    const reservas = obtenerReservas();
    const reservaIndex = reservas.findIndex(r => r.idReserva === idReserva);

    if (reservaIndex === -1) {
      mostrarMensaje("Reserva no encontrada", "error");
      return;
    }

    const mesaAnterior = reservas[reservaIndex].idMesaAsignada;
    const nuevaMesa = document.getElementById("editMesaReserva").value;
    const nuevoEstado = document.getElementById("editEstadoReserva").value;
    const estadoAnterior = reservas[reservaIndex].estado;

    reservas[reservaIndex] = {
      ...reservas[reservaIndex],
      nombreCliente: document.getElementById("editNombreCliente").value.trim(),
      numPersonas: parseInt(document.getElementById("editNumPersonas").value, 10),
      fechaReserva: document.getElementById("editFechaReserva").value,
      horaReserva: document.getElementById("editHoraReserva").value,
      idMesaAsignada: nuevaMesa,
      ocasionEspecial: document.getElementById("editOcasion").value,
      notasAdicionales: document.getElementById("editNotasAdicionales").value.trim(),
      estado: nuevoEstado
    };

    guardarReservas(reservas);

    // Gestión de estados de las mesas
    const mesas = obtenerMesas();
    
    // Si cambió la mesa, liberar la anterior y ocupar la nueva
    if (mesaAnterior !== nuevaMesa) {
      liberarMesa(mesaAnterior);
      
      if (nuevoEstado === "Pendiente" || nuevoEstado === "Confirmada") {
        const nuevaMesaIndex = mesas.findIndex(m => m.id === nuevaMesa);
        if (nuevaMesaIndex !== -1) {
          mesas[nuevaMesaIndex].estado = "ocupada";
          guardarMesas(mesas);
        }
      }
    } else {
      // Si el estado cambió a Cancelada, Finalizada o No Show, liberar la mesa
      if ((estadoAnterior === "Pendiente" || estadoAnterior === "Confirmada") &&
          (nuevoEstado === "Cancelada" || nuevoEstado === "Finalizada" || nuevoEstado === "No Show")) {
        liberarMesa(nuevaMesa);
      }
      // Si el estado cambió de inactivo a activo, ocupar la mesa
      else if ((estadoAnterior === "Cancelada" || estadoAnterior === "Finalizada" || estadoAnterior === "No Show") &&
               (nuevoEstado === "Pendiente" || nuevoEstado === "Confirmada")) {
        const mesaIndex = mesas.findIndex(m => m.id === nuevaMesa);
        if (mesaIndex !== -1) {
          mesas[mesaIndex].estado = "ocupada";
          guardarMesas(mesas);
        }
      }
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarReserva"));
    modal.hide();

    Swal.fire({
      icon: "success",
      title: "¡Actualizada!",
      text: "La reserva ha sido actualizada correctamente",
      timer: 2000,
      showConfirmButton: false
    });
    
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