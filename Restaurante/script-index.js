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

function validarFechaPosterior(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fecha) >= hoy;
}

function validarHoraRango(hora) {
  const [horas] = hora.split(":").map(Number);
  return horas >= 8 && horas < 20;
}

function esMesaDisponible(idMesa, fecha, hora, excluirReservaId = null) {
  const reservas = obtenerReservas();
  const mesa = obtenerMesas().find(m => m.id === idMesa);

  if (!mesa || mesa.estado !== "disponible") return false;

  const reservasCoincidentes = reservas.filter(r => {
    if (excluirReservaId && r.idReserva === excluirReservaId) return false;
    return (
      r.idMesaAsignada === idMesa &&
      r.fechaReserva === fecha &&
      r.horaReserva === hora &&
      r.estado !== "Cancelada"
    );
  });

  return reservasCoincidentes.length === 0;
}

// ====================
// Sistema de actualización automática de estados
// ====================
function verificarYActualizarEstadosReservas() {
  const ahora = new Date();
  const fechaActual = ahora.toISOString().split('T')[0];
  const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
  
  const reservas = obtenerReservas();
  const mesas = obtenerMesas();
  let huboActualizacion = false;

  reservas.forEach((reserva, index) => {
    // Solo procesar reservas Confirmadas o Pendientes
    if (reserva.estado !== "Confirmada" && reserva.estado !== "Pendiente") {
      return;
    }

    const fechaReserva = reserva.fechaReserva;
    const horaReserva = reserva.horaReserva;

    // Crear objetos Date para comparación precisa
    const fechaHoraReserva = new Date(fechaReserva + 'T' + horaReserva + ':00');
    const fechaHoraActual = new Date(fechaActual + 'T' + horaActual + ':00');

    // Si la hora de la reserva ya llegó o pasó
    if (fechaHoraReserva <= fechaHoraActual) {
      // Cambiar el estado de la mesa a "ocupada"
      const mesaIndex = mesas.findIndex(m => m.id === reserva.idMesaAsignada);
      if (mesaIndex !== -1 && mesas[mesaIndex].estado !== "ocupada") {
        mesas[mesaIndex].estado = "ocupada";
        huboActualizacion = true;
        console.log(`Mesa ${reserva.idMesaAsignada} cambiada a ocupada automáticamente - Reserva: ${fechaReserva} ${horaReserva}`);
      }
    }
  });

  if (huboActualizacion) {
    guardarMesas(mesas);
    renderMesas();
  }
}

// Iniciar verificación automática cada minuto
let intervaloVerificacion;

function iniciarVerificacionAutomatica() {
  // Verificar inmediatamente
  verificarYActualizarEstadosReservas();
  
  // Luego verificar cada 60 segundos (1 minuto)
  if (intervaloVerificacion) {
    clearInterval(intervaloVerificacion);
  }
  intervaloVerificacion = setInterval(verificarYActualizarEstadosReservas, 60000);
}

// Detener verificación automática (útil para limpieza)
function detenerVerificacionAutomatica() {
  if (intervaloVerificacion) {
    clearInterval(intervaloVerificacion);
    intervaloVerificacion = null;
  }
}

// ====================
// Inicialización
// ====================
function inicializarMesas() {
  const mesasExistentes = obtenerMesas();

  if (mesasExistentes.length === 0) {
    const mesas = [
      { id: "mesa1", capacidad: 2, ubicacion: "Ventana", estado: "disponible" },
      { id: "mesa2", capacidad: 2, ubicacion: "Interior", estado: "disponible" },
      { id: "mesa3", capacidad: 4, ubicacion: "Jardín", estado: "disponible" },
      { id: "mesa4", capacidad: 4, ubicacion: "Terraza", estado: "disponible" },
      { id: "mesa5", capacidad: 6, ubicacion: "Ventana", estado: "disponible" },
      { id: "mesa6", capacidad: 6, ubicacion: "Centro", estado: "disponible" },
      { id: "mesa7", capacidad: 8, ubicacion: "Privado", estado: "disponible" },
      { id: "mesa8", capacidad: 2, ubicacion: "Barra", estado: "deshabilitada" }
    ];

    guardarMesas(mesas);
    mostrarMensaje("Mesas inicializadas correctamente", "success");
  } else {
    mostrarMensaje("Las mesas ya estaban inicializadas", "info");
  }

  renderMesas();
}

// ====================
// Renderizar Mesas
// ====================
function renderMesas() {
  const lista = document.getElementById("listaMesas");
  if (!lista) return;

  const mesas = obtenerMesas();

  if (mesas.length === 0) {
    lista.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          <h4>No hay mesas configuradas</h4>
          <p>Haz clic en el botón "Reiniciar Mesas" para inicializar las mesas del restaurante.</p>
        </div>
      </div>
    `;
    return;
  }

  lista.innerHTML = "";

  mesas.forEach(mesa => {
    const card = document.createElement("div");
    card.className = "col-md-3 mb-4";

    let badgeClass = "";
    if (mesa.estado === "disponible") badgeClass = "bg-success";
    else if (mesa.estado === "ocupada") badgeClass = "bg-primary";
    else if (mesa.estado === "deshabilitada") badgeClass = "bg-dark";

    card.innerHTML = `
      <div class="card ${mesa.estado} h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title m-0">${mesa.id}</h5>
            <span class="badge ${badgeClass}">${mesa.estado}</span>
          </div>
          <p class="card-text"><i class="bi bi-people"></i> Capacidad: ${mesa.capacidad} personas</p>
          <p class="card-text"><i class="bi bi-geo"></i> Ubicación: ${mesa.ubicacion}</p>
        </div>
        <div class="card-footer bg-transparent">
          <button class="btn btn-warning btn-sm" onclick="editarMesa('${mesa.id}')">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-primary btn-sm ${mesa.estado !== "disponible" ? "disabled" : ""}" 
                  onclick="reservarMesa('${mesa.id}')" ${mesa.estado !== "disponible" ? "disabled" : ""}>
            <i class="bi bi-calendar-plus"></i> Reservar
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarMesa('${mesa.id}')">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });
}

function filtrarMesas() {
  const texto = document.getElementById("filtroMesas").value.toLowerCase();
  const estado = document.getElementById("filtroEstadoMesa").value;
  const capacidad = parseInt(document.getElementById("filtroCapacidad").value, 10);

  const mesas = obtenerMesas();
  const lista = document.getElementById("listaMesas");

  lista.innerHTML = "";

  mesas.forEach(mesa => {
    const coincideTexto = texto === "" ||
      mesa.id.toLowerCase().includes(texto) ||
      mesa.ubicacion.toLowerCase().includes(texto);

    const coincideEstado = estado === "" || mesa.estado === estado;
    const coincideCapacidad = capacidad === 0 || mesa.capacidad === capacidad ||
      (capacidad === 8 && mesa.capacidad >= 8);

    if (coincideTexto && coincideEstado && coincideCapacidad) {
      const card = document.createElement("div");
      card.className = "col-md-3 mb-4";

      let badgeClass = "";
      if (mesa.estado === "disponible") badgeClass = "bg-success";
      else if (mesa.estado === "ocupada") badgeClass = "bg-primary";
      else if (mesa.estado === "deshabilitada") badgeClass = "bg-dark";

      card.innerHTML = `
        <div class="card ${mesa.estado} h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="card-title m-0">${mesa.id}</h5>
              <span class="badge ${badgeClass}">${mesa.estado}</span>
            </div>
            <p class="card-text"><i class="bi bi-people"></i> Capacidad: ${mesa.capacidad} personas</p>
            <p class="card-text"><i class="bi bi-geo"></i> Ubicación: ${mesa.ubicacion}</p>
          </div>
          <div class="card-footer bg-transparent">
            <button class="btn btn-warning btn-sm" onclick="editarMesa('${mesa.id}')">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-primary btn-sm ${mesa.estado !== "disponible" ? "disabled" : ""}" 
                    onclick="reservarMesa('${mesa.id}')" ${mesa.estado !== "disponible" ? "disabled" : ""}>
              <i class="bi bi-calendar-plus"></i> Reservar
            </button>
            <button class="btn btn-danger btn-sm" onclick="eliminarMesa('${mesa.id}')">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `;
      lista.appendChild(card);
    }
  });
}

// ====================
// CRUD Mesas
// ====================
function agregarMesa() {
  document.getElementById("formAgregarMesa").reset();
  const modal = new bootstrap.Modal(document.getElementById("modalAgregarMesa"));
  modal.show();
}

function editarMesa(id) {
  const mesas = obtenerMesas();
  const mesa = mesas.find(m => m.id === id);

  if (!mesa) {
    mostrarMensaje("Mesa no encontrada", "error");
    return;
  }

  document.getElementById("editMesaId").value = mesa.id;
  document.getElementById("editMesaIdentificador").value = mesa.id.replace("mesa", "");
  document.getElementById("editMesaCapacidad").value = mesa.capacidad;
  document.getElementById("editMesaUbicacion").value = mesa.ubicacion;
  document.getElementById("editMesaEstado").value = mesa.estado;

  const modal = new bootstrap.Modal(document.getElementById("modalEditarMesa"));
  modal.show();
}

function eliminarMesa(id) {
  mostrarConfirmacion("Esta acción no se puede deshacer. ¿Desea eliminar esta mesa?", () => {
    let mesas = obtenerMesas();
    const reservas = obtenerReservas();

    const reservasActivas = reservas.filter(r =>
      r.idMesaAsignada === id &&
      (r.estado === "Pendiente" || r.estado === "Confirmada")
    );

    if (reservasActivas.length > 0) {
      Swal.fire({
        icon: "error",
        title: "No se puede eliminar",
        text: "La mesa tiene reservas activas asociadas",
        confirmButtonText: "Entendido"
      });
      return;
    }

    mesas = mesas.filter(m => m.id !== id);
    guardarMesas(mesas);
    renderMesas();
    
    Swal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: "La mesa ha sido eliminada correctamente",
      timer: 2000,
      showConfirmButton: false
    });
  });
}

// ====================
// Gestión de Reservas
// ====================
function reservarMesa(idMesa) {
  const selectMesas = document.getElementById("mesaReserva");
  selectMesas.innerHTML = '<option value="">Seleccione una mesa</option>';

  const mesas = obtenerMesas().filter(m => m.estado === "disponible");
  mesas.forEach(mesa => {
    const option = document.createElement("option");
    option.value = mesa.id;
    option.textContent = `${mesa.id} (${mesa.capacidad} personas, ${mesa.ubicacion})`;
    option.selected = mesa.id === idMesa;
    selectMesas.appendChild(option);
  });

  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fechaReserva").min = hoy;

  const modal = new bootstrap.Modal(document.getElementById("modalReserva"));
  modal.show();
}

// ====================
// Event Listeners
// ====================
document.addEventListener("DOMContentLoaded", function() {
  const mesas = obtenerMesas();
  if (mesas.length === 0) inicializarMesas();
  else renderMesas();

  // Iniciar verificación automática de estados
  iniciarVerificacionAutomatica();

  // Inicializar select de ocasiones con emojis
  const selectOcasion = document.getElementById("ocasion");
  if (selectOcasion) {
    selectOcasion.innerHTML = "";
    OCASIONES_ESPECIALES.forEach(ocasion => {
      const option = document.createElement("option");
      option.value = ocasion.value;
      option.textContent = `${ocasion.emoji} ${ocasion.text}`;
      selectOcasion.appendChild(option);
    });
  }

  // Guardar nueva mesa
  const formAgregarMesa = document.getElementById("formAgregarMesa");
  formAgregarMesa.setAttribute("novalidate", "");

  formAgregarMesa.addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("nuevaMesaNumero").value.trim();
    const capacidad = document.getElementById("nuevaMesaCapacidad").value.trim();
    const ubicacion = document.getElementById("nuevaMesaUbicacion").value.trim();

    if (!id || !/^[1-9][0-9]*$/.test(id)) {
      mostrarMensaje("El identificador de la mesa debe ser un número válido sin ceros a la izquierda (mínimo 1)", "error");
      return;
    }

    if (!capacidad || !/^[1-9][0-9]*$/.test(capacidad)) {
      mostrarMensaje("La capacidad debe ser un número válido sin ceros a la izquierda (mínimo 1)", "error");
      return;
    }

    if (!ubicacion || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(ubicacion)) {
      mostrarMensaje("La ubicación solo puede contener letras", "error");
      return;
    }

    const mesas = obtenerMesas();
    const mesaId = "mesa" + id;

    if (mesas.some(m => m.id === mesaId)) {
      mostrarMensaje("Ya existe una mesa con ese identificador", "error");
      return;
    }

    mesas.push({ id: mesaId, capacidad: parseInt(capacidad, 10), ubicacion, estado: "disponible" });
    guardarMesas(mesas);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAgregarMesa"));
    modal.hide();
    
    renderMesas();
    
    Swal.fire({
      icon: "success",
      title: "¡Mesa agregada!",
      text: `La mesa ${mesaId} ha sido creada correctamente`,
      showConfirmButton: false,
      timer: 2000
    });
    
    this.reset();
  });

  // Guardar nueva reserva
  const formReserva = document.getElementById("formReserva");
  if (formReserva) {
    formReserva.setAttribute("novalidate", "");
    
    formReserva.addEventListener("submit", function(e) {
      e.preventDefault();

      const nombreCliente = document.getElementById("nombreCliente").value.trim();
      const numPersonas = parseInt(document.getElementById("numPersonas").value, 10);
      const fechaReserva = document.getElementById("fechaReserva").value;
      const horaReserva = document.getElementById("horaReserva").value;
      const idMesaAsignada = document.getElementById("mesaReserva").value;

      if (!nombreCliente) {
        mostrarMensaje("El nombre del cliente es obligatorio", "error");
        return;
      }
      if (isNaN(numPersonas) || numPersonas <= 0) {
        mostrarMensaje("El número de personas debe ser un número positivo mayor que cero", "error");
        return;
      }
      if (!validarFechaPosterior(fechaReserva)) {
        mostrarMensaje("La fecha debe ser posterior o igual a hoy", "error");
        return;
      }
      if (!validarHoraRango(horaReserva)) {
        mostrarMensaje("La hora debe estar entre 8:00 AM y 8:00 PM", "error");
        return;
      }
      if (!idMesaAsignada) {
        mostrarMensaje("Debe seleccionar una mesa", "error");
        return;
      }
      if (!esMesaDisponible(idMesaAsignada, fechaReserva, horaReserva)) {
        mostrarMensaje("La mesa seleccionada no está disponible en esa fecha y hora", "error");
        return;
      }

      const nuevaReserva = {
        idReserva: "RES" + Date.now(),
        nombreCliente,
        numPersonas,
        fechaReserva,
        horaReserva,
        idMesaAsignada,
        ocasionEspecial: document.getElementById("ocasion").value,
        notasAdicionales: document.getElementById("notasAdicionales").value.trim(),
        estado: "Pendiente",
        fechaCreacion: new Date().toISOString().split("T")[0]
      };

      const reservas = obtenerReservas();
      reservas.push(nuevaReserva);
      guardarReservas(reservas);

      const modal = bootstrap.Modal.getInstance(document.getElementById("modalReserva"));
      modal.hide();

      Swal.fire({
        icon: "success",
        title: "¡Reserva creada!",
        html: `
          <p><strong>Cliente:</strong> ${nombreCliente}</p>
          <p><strong>Mesa:</strong> ${idMesaAsignada}</p>
          <p><strong>Fecha:</strong> ${fechaReserva} a las ${horaReserva}</p>
        `,
        confirmButtonText: "Entendido"
      });
      
      this.reset();
    });
  }

  // Guardar cambios al editar mesa
  const formEditarMesa = document.getElementById("formEditarMesa");
  formEditarMesa.setAttribute("novalidate", "");
  
  formEditarMesa.addEventListener("submit", function(e) {
    e.preventDefault();

    const idOriginal = document.getElementById("editMesaId").value;
    const idNum = document.getElementById("editMesaIdentificador").value.trim();
    const capacidad = document.getElementById("editMesaCapacidad").value.trim();
    const ubicacion = document.getElementById("editMesaUbicacion").value.trim();
    const estado = document.getElementById("editMesaEstado").value;

    if (!idNum || !/^[1-9][0-9]*$/.test(idNum)) {
      mostrarMensaje("El identificador de la mesa debe ser un número válido sin ceros a la izquierda (mínimo 1)", "error");
      return;
    }
    
    if (!capacidad || !/^[1-9][0-9]*$/.test(capacidad)) {
      mostrarMensaje("La capacidad debe ser un número válido sin ceros a la izquierda (mínimo 1)", "error");
      return;
    }
    
    if (!ubicacion || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(ubicacion)) {
      mostrarMensaje("La ubicación solo puede contener letras", "error");
      return;
    }

    const mesaId = "mesa" + idNum;

    const mesas = obtenerMesas();
    if (mesaId !== idOriginal && mesas.some(m => m.id === mesaId)) {
      mostrarMensaje("Ya existe una mesa con ese identificador", "error");
      return;
    }

    const mesaIndex = mesas.findIndex(m => m.id === idOriginal);
    if (mesaIndex === -1) {
      mostrarMensaje("Mesa no encontrada", "error");
      return;
    }

    mesas[mesaIndex] = { id: mesaId, capacidad: parseInt(capacidad, 10), ubicacion, estado };

    if (mesaId !== idOriginal) {
      const reservas = obtenerReservas();
      reservas.forEach(reserva => {
        if (reserva.idMesaAsignada === idOriginal) {
          reserva.idMesaAsignada = mesaId;
        }
      });
      guardarReservas(reservas);
    }

    guardarMesas(mesas);

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarMesa"));
    modal.hide();

    Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: "La mesa ha sido actualizada correctamente",
      timer: 2000,
      showConfirmButton: false
    });
    
    renderMesas();
  });
});

// Limpiar el intervalo cuando se cierre la página
window.addEventListener("beforeunload", () => {
  detenerVerificacionAutomatica();
});