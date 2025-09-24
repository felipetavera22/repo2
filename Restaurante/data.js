// js/data.js - Funciones comunes de storage
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