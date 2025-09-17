// ====================
// Constantes
// ====================
const OCASIONES_ESPECIALES = [
  { value: "ninguna", text: "Ninguna", icon: "bi-calendar" },
  { value: "cumpleaños", text: "Cumpleaños", icon: "bi-balloon" },
  { value: "aniversario", text: "Aniversario", icon: "bi-heart" },
  { value: "reunion", text: "Reunión de Negocios", icon: "bi-briefcase" },
  { value: "romantica", text: "Cena Romántica", icon: "bi-emoji-kiss" },
  { value: "graduacion", text: "Graduación", icon: "bi-mortarboard" },
  { value: "despedida", text: "Despedida", icon: "bi-airplane" },
  { value: "familia", text: "Reunión Familiar", icon: "bi-people" }
];

const ESTADOS_RESERVA = ["Pendiente", "Confirmada", "Cancelada", "Finalizada", "No Show"];

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
  alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

function validarFechaPosterior(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fecha) > hoy;
}

function validarHoraRango(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas >= 8 && horas < 20;
}

function esMesaDisponible(idMesa, fecha, hora, excluirReservaId = null) {
  const reservas = obtenerReservas();
  const mesa = obtenerMesas().find(m => m.id === idMesa);
  
  if (!mesa || mesa.estado !== "disponible") return false;
  
  // Verificar si hay reservas que coincidan en la misma fecha, hora y mesa
  const reservasCoincidentes = reservas.filter(r => {
    if (excluirReservaId && r.idReserva === excluirReservaId) return false;
    return r.idMesaAsignada === idMesa && r.fechaReserva === fecha && r.horaReserva === hora && r.estado !== "Cancelada";
  });
  
  return reservasCoincidentes.length === 0;
}

// ====================
// Renderizar Reservas
// ====================
function renderReservas() {
  const contenedor = document.getElementById("listaReservas");
  if (!contenedor) return;
  
  const reservas = obtenerReservas();
  const mesas = obtenerMesas();
  
  // Aplicar filtros
  const texto = document.getElementById("filtroReservas").value.toLowerCase();
  const estado = document.getElementById("filtroEstado").value;
  const fecha = document.getElementById("filtroFecha").value;
  const ocasion = document.getElementById("filtroOcasion").value;
  
  let reservasFiltradas = reservas;
  
  if (texto) {
    reservasFiltradas = reservasFiltradas.filter(r => 
      r.nombreCliente.toLowerCase().includes(texto) || 
      r.idMesaAsignada.toLowerCase().includes(texto)
    );
  }
  
  if (estado) {
    reservasFiltradas = reservasFiltradas.filter(r => r.estado === estado);
  }
  
  if (fecha) {
    reservasFiltradas = reservasFiltradas.filter(r => r.fechaReserva === fecha);
  }
  
  if (ocasion) {
    reservasFiltradas = reservasFiltradas.filter(r => r.ocasionEspecial === ocasion);
  }
  
  // Ordenar por fecha y hora
  reservasFiltradas.sort((a, b) => {
    const fechaA = new Date(`${a.fechaReserva}T${a.horaReserva}`);
    const fechaB = new Date(`${b.fechaReserva}T${b.horaReserva}`);
    return fechaA - fechaB;
  });
  
  contenedor.innerHTML = "";
  
  if (reservasFiltradas.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          <h4>No hay reservas</h4>
          <p>No se encontraron reservas que coincidan con los criterios de búsqueda.</p>
        </div>
      </div>
    `;
    return;
  }
  
  reservasFiltradas.forEach(reserva => {
    const mesa = mesas.find(m => m.id === reserva.idMesaAsignada);
    const ubicacionMesa = mesa ? mesa.ubicacion : "Desconocida";
    const capacidadMesa = mesa ? mesa.capacidad : "?";
    
    let estadoClass = "";
    switch(reserva.estado) {
      case "Pendiente": estadoClass = "bg-warning"; break;
      case "Confirmada": estadoClass = "bg-success"; break;
      case "Cancelada": estadoClass = "bg-danger"; break;
      case "Finalizada": estadoClass = "bg-info"; break;
      case "No Show": estadoClass = "bg-dark"; break;
      default: estadoClass = "bg-secondary";
    }
    
    const ocasionData = OCASIONES_ESPECIALES.find(o => o.value === reserva.ocasionEspecial);
    const ocasionText = ocasionData ? ocasionData.text : "Ninguna";
    const ocasionIcon = ocasionData ? ocasionData.icon : "bi-calendar";
    
    const card = document.createElement("div");
    card.className = "col-md-6 mb-3";
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title m-0">${reserva.nombreCliente}</h5>
            <span class="badge ${estadoClass}">${reserva.estado}</span>
          </div>
          <p class="card-text"><i class="bi bi-people"></i> ${reserva.numPersonas} personas</p>
          <p class="card-text"><i class="bi bi-calendar"></i> ${reserva.fechaReserva}</p>
          <p class="card-text"><i class="bi bi-clock"></i> ${reserva.horaReserva}</p>
          <p class="card-text"><i class="bi bi-table"></i> Mesa: ${reserva.idMesaAsignada} (${capacidadMesa} pers.)</p>
          <p class="card-text"><i class="bi bi-geo"></i> Ubicación: ${ubicacionMesa}</p>
          <p class="card-text"><i class="bi ${ocasionIcon}"></i> Ocasión: ${ocasionText}</p>
          ${reserva.notasAdicionales ? `<p class="card-text"><i class="bi bi-chat"></i> Notas: ${reserva.notasAdicionales}</p>` : ''}
          <p class="card-text"><small class="text-muted">ID: ${reserva.idReserva}</small></p>
        </div>
        <div class="card-footer bg-transparent">
          <button class="btn btn-warning btn-sm" onclick="editarReserva('${reserva.idReserva}')">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="cancelarReserva('${reserva.idReserva}')" ${reserva.estado === "Cancelada" || reserva.estado === "Finalizada" || reserva.estado === "No Show" ? "disabled" : ""}>
            <i class="bi bi-x-circle"></i> Cancelar
          </button>
          <button class="btn btn-success btn-sm" onclick="finalizarReserva('${reserva.idReserva}')" ${reserva.estado !== "Confirmada" ? "disabled" : ""}>
            <i class="bi bi-check-circle"></i> Finalizar
          </button>
          <button class="btn btn-info btn-sm" onclick="marcarNoShow('${reserva.idReserva}')" ${reserva.estado !== "Confirmada" ? "disabled" : ""}>
            <i class="bi bi-person-x"></i> No Show
          </button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

// ====================
// Gestión de Reservas
// ====================
function editarReserva(idReserva) {
  const reservas = obtenerReservas();
  const reserva = reservas.find(r => r.idReserva === idReserva);
  
  if (!reserva) {
    mostrarMensaje("Reserva no encontrada", "error");
    return;
  }
  
  // Llenar el formulario de edición
  document.getElementById("editIdReserva").value = reserva.idReserva;
  document.getElementById("editNombreCliente").value = reserva.nombreCliente;
  document.getElementById("editNumPersonas").value = reserva.numPersonas;
  document.getElementById("editFechaReserva").value = reserva.fechaReserva;
  document.getElementById("editHoraReserva").value = reserva.horaReserva;
  document.getElementById("editOcasion").value = reserva.ocasionEspecial || "ninguna";
  document.getElementById("editNotasAdicionales").value = reserva.notasAdicionales || "";
  document.getElementById("editEstadoReserva").value = reserva.estado;
  
  // Llenar el select de mesas
  const selectMesas = document.getElementById("editMesaReserva");
  selectMesas.innerHTML = '<option value="">Seleccione una mesa</option>';
  
  const mesas = obtenerMesas().filter(m => m.estado === "disponible" || m.id === reserva.idMesaAsignada);
  mesas.forEach(mesa => {
    const option = document.createElement("option");
    option.value = mesa.id;
    option.textContent = `${mesa.id} (${mesa.capacidad} personas, ${mesa.ubicacion})`;
    option.selected = mesa.id === reserva.idMesaAsignada;
    selectMesas.appendChild(option);
  });
  
  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById("modalEditarReserva"));
  modal.show();
}

function cancelarReserva(idReserva) {
  if (!confirm("¿Está seguro de que desea cancelar esta reserva?")) {
    return;
  }
  
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
}

function finalizarReserva(idReserva) {
  if (!confirm("¿Está seguro de que desea marcar esta reserva como finalizada?")) {
    return;
  }
  
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
}

function marcarNoShow(idReserva) {
  if (!confirm("¿Está seguro de que desea marcar esta reserva como No Show?")) {
    return;
  }
  
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
}

// ====================
// Event Listeners para reservacion.html
// ====================
document.addEventListener("DOMContentLoaded", function() {
  // Renderizar reservas al cargar la página
  renderReservas();
  
  // Eventos de filtrado de reservas
  document.getElementById("filtroReservas").addEventListener("input", renderReservas);
  document.getElementById("filtroEstado").addEventListener("change", renderReservas);
  document.getElementById("filtroFecha").addEventListener("change", renderReservas);
  document.getElementById("filtroOcasion").addEventListener("change", renderReservas);
  
  // Botón para limpiar filtros
  document.getElementById("btnLimpiarFiltros").addEventListener("click", function() {
    document.getElementById("filtroReservas").value = "";
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroFecha").value = "";
    document.getElementById("filtroOcasion").value = "";
    renderReservas();
  });
  
  // Formulario de edición de reserva
  document.getElementById("formEditarReserva").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const idReserva = document.getElementById("editIdReserva").value;
    const nombreCliente = document.getElementById("editNombreCliente").value.trim();
    const numPersonas = parseInt(document.getElementById("editNumPersonas").value, 10);
    const fechaReserva = document.getElementById("editFechaReserva").value;
    const horaReserva = document.getElementById("editHoraReserva").value;
    const idMesaAsignada = document.getElementById("editMesaReserva").value;
    const estado = document.getElementById("editEstadoReserva").value;
    
    if