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
// Utilidades
// ====================
function mostrarMensaje(mensaje, tipo = "info") {
  const toast = new bootstrap.Toast(document.getElementById("liveToast"));
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = mensaje;
  document.getElementById("liveToast").className =
    `toast ${tipo === "error" ? "bg-danger" : tipo === "success" ? "bg-success" : "bg-info"} text-white`;

  toast.show();
}

function mostrarConfirmacion(mensaje, callback) {
  document.getElementById("modalConfirmacionMensaje").textContent = mensaje;

  const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
  modal.show();

  const botonConfirmar = document.getElementById("btnConfirmarAccion");

  const nuevoBoton = botonConfirmar.cloneNode(true);
  botonConfirmar.parentNode.replaceChild(nuevoBoton, botonConfirmar);

  nuevoBoton.addEventListener("click", () => {
    modal.hide();
    if (typeof callback === "function") {
      callback();
    }
  });
}

function validarFechaPosterior(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fecha) > hoy;
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
  const id = prompt("Número de la mesa (solo números):");
  if (!id || !/^[0-9]+$/.test(id)) {
    mostrarMensaje("El identificador de la mesa debe ser un número válido", "error");
    return;
  }

  const capacidad = parseInt(prompt("Capacidad de la mesa (número de personas):"), 10);
  if (isNaN(capacidad) || capacidad <= 0) {
    mostrarMensaje("La capacidad debe ser un número positivo mayor que cero", "error");
    return;
  }

  const ubicacion = prompt("Ubicación de la mesa (solo letras):");
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

  mesas.push({ id: mesaId, capacidad, ubicacion, estado: "disponible" });

  guardarMesas(mesas);
  renderMesas();
  mostrarMensaje("Mesa agregada correctamente", "success");
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
  mostrarConfirmacion("¿Está seguro de que desea eliminar esta mesa? Esta acción no se puede deshacer.", () => {
    let mesas = obtenerMesas();
    const reservas = obtenerReservas();

    const reservasActivas = reservas.filter(r =>
      r.idMesaAsignada === id &&
      (r.estado === "Pendiente" || r.estado === "Confirmada")
    );

    if (reservasActivas.length > 0) {
      mostrarMensaje("No se puede eliminar la mesa porque tiene reservas activas", "error");
      return;
    }

    mesas = mesas.filter(m => m.id !== id);
    guardarMesas(mesas);
    renderMesas();
    mostrarMensaje("Mesa eliminada correctamente", "success");
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

  // Guardar nueva reserva
  document.getElementById("formReserva").addEventListener("submit", function(e) {
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
      mostrarMensaje("La fecha debe ser posterior a hoy", "error");
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

    mostrarMensaje("Reserva creada correctamente", "success");
    this.reset();
  });

  // Guardar cambios al editar mesa
  document.getElementById("formEditarMesa").addEventListener("submit", function(e) {
    e.preventDefault();

    const idOriginal = document.getElementById("editMesaId").value;
    const idNum = document.getElementById("editMesaIdentificador").value.trim();
    const capacidad = parseInt(document.getElementById("editMesaCapacidad").value, 10);
    const ubicacion = document.getElementById("editMesaUbicacion").value.trim();
    const estado = document.getElementById("editMesaEstado").value;

    if (!/^[0-9]+$/.test(idNum)) {
      mostrarMensaje("El identificador de la mesa debe ser un número válido", "error");
      return;
    }
    if (isNaN(capacidad) || capacidad <= 0) {
      mostrarMensaje("La capacidad debe ser un número positivo mayor que cero", "error");
      return;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(ubicacion)) {
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

    mesas[mesaIndex] = { id: mesaId, capacidad, ubicacion, estado };

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

    mostrarMensaje("Mesa actualizada correctamente", "success");
    renderMesas();
  });
});

// ====================
// Funciones adicionales
// ====================
document.addEventListener("DOMContentLoaded", function() {
  const selectOcasion = document.getElementById("ocasion");
  if (selectOcasion) {
    selectOcasion.innerHTML = "";
    OCASIONES_ESPECIALES.forEach(ocasion => {
      const option = document.createElement("option");
      option.value = ocasion.value;
      option.textContent = ocasion.text;
      selectOcasion.appendChild(option);
    });
  }
});
