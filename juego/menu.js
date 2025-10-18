// Función para seleccionar opciones del menú
function selectOption(option) {
    console.log('Seleccionado:', option);
    
    // Añadir efecto visual al hacer clic
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        item.style.opacity = '0.5';
    });
    
    setTimeout(() => {
        items.forEach(item => {
            item.style.opacity = '1';
        });
        
        // Aquí puedes agregar la navegación según la opción seleccionada
        switch(option) {
            case 'career':
                console.log('Navegando a modo Carrera...');
                // window.location.href = 'career.html';
                break;
            case 'multiplayer':
                console.log('Navegando a Multijugador...');
                // window.location.href = 'multiplayer.html';
                break;
            case 'settings':
                console.log('Abriendo Configuración...');
                // window.location.href = 'settings.html';
                break;
            case 'next':
                console.log('Siguiente...');
                // window.location.href = 'next.html';
                break;
        }
        
        // Alerta temporal (puedes removerla después)
        alert(`Has seleccionado: ${option.toUpperCase()}\n\nAquí iría la navegación a ${option}`);
    }, 300);
}

// Efecto de sonido hover (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Aquí podrías agregar un sonido de hover
            // Por ejemplo: new Audio('hover-sound.mp3').play();
        });
        
        item.addEventListener('click', () => {
            // Aquí podrías agregar un sonido de click
            // Por ejemplo: new Audio('click-sound.mp3').play();
        });
    });
});

// Función opcional para agregar efectos de teclado
document.addEventListener('keydown', function(event) {
    const menuItems = document.querySelectorAll('.menu-item');
    let currentIndex = 0;
    
    // Ejemplo: navegar con flechas
    if (event.key === 'ArrowLeft') {
        // Lógica para mover a la izquierda
    } else if (event.key === 'ArrowRight') {
        // Lógica para mover a la derecha
    } else if (event.key === 'Enter') {
        // Seleccionar opción actual
    }
});