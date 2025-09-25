// ===== PASO 1: DATOS DEL MODAL*Ayuda con chat =====

const modalContent = {
    about: {
        title: "About Us", 
        text: `
            <p>
                At <strong>ASTRALIS Bank</strong>, we are committed to redefining the way people experience financial services.
                Our mission is to provide secure, innovative, and customer-focused banking solutions that empower individuals and businesses to achieve their goals.
            </p>
            <p>
                With a vision rooted in trust, transparency, and technology, we combine modern digital tools with personalized service to create a seamless banking experience.
                Whether it’s saving for the future, investing, or managing everyday finances, <strong>ASTRALIS</strong> stands by your side.
            </p>
            <p>
                We believe that banking should be simple, accessible, and designed to help our clients grow.
                Together, we are building a brighter financial future—because at <strong>ASTRALIS</strong>, your success is our priority.
            </p>
        `
    },
    contact: {
    title: "Contact Us",
    text: `
        <p>
            Have questions or need assistance? Our team at <strong>ASTRALIS Bank</strong> is here to help.
            You can reach us through any of the following channels:
        </p>
        <ul>
            <li>Email: <a href="josesolanovargas13@gmail.com">support@astralisbank.com</a></li>
            <li>Phone: +1 (800) 123-4567</li>
              <li>Address: 123 Astralis Street, Financial District, San José, Costa Rica</li>
        </ul>
        <p>
            Our customer support team is available Monday to Friday, 9:00 AM – 6:00 PM (local time).  
            We are committed to providing prompt and reliable service to all our clients.
        </p>
    `
}
};


// ===== PASO 2: FUNCIÓN PARA ABRIR MODAL =====
function openModal(type) {
    console.log('1. Usuario hizo click en:', type);
    
    // Busca elementos en el DOM
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    console.log('2. Elementos encontrados:', { modal, modalBody });
    
    // Verifica si existe el contenido
    if (!modalContent[type]) {
        console.error('3. ERROR: No existe contenido para:', type);
        return;
    }
    
    console.log('3. Contenido a mostrar:', modalContent[type]);
    
    // Inserta HTML dinámicamente
    const content = modalContent[type];
    modalBody.innerHTML = `
        <h2 class="modal-title">${content.title}</h2>
        <div class="modal-text">${content.text}</div>
    `;
    
    console.log('4. HTML insertado en modal-body');
    
    // Muestra el modal (agregar clase CSS)
    modal.classList.add('show');
    console.log('5. Clase "show" agregada - Modal visible');
    
    // EVBITA scroll en la página de fondo
    document.body.style.overflow = 'hidden';
    console.log('6. Scroll de fondo deshabilitado');
}

// ===== PASO 3: FUNCIÓN PARA CERRAR MODAL =====
function closeModal() {
    console.log('1. Cerrando modal...');
    
    const modal = document.getElementById('modal');
    
    // Remueve clase 'show' (oculta el modal)
    modal.classList.remove('show');
    console.log('2. Clase "show" removida - Modal oculto');
    
    // Restaura scroll en la página
    document.body.style.overflow = 'auto';
    console.log('3. Scroll de fondo restaurado');
}

// ===== PASO 4: EVENTOS ADICIONALES =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Configurando eventos...');
    
    const modal = document.getElementById('modal');
    
    // Evento 1: Cirra al hacer click en el fondo (overlay)
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {  // Solo si click fue en el fondo
            console.log('Click en overlay - cerrando modal');
            closeModal();
        }
    });
    
    // Evento 2: Cirra con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalIsOpen = modal.classList.contains('show');
            if (modalIsOpen) {
                console.log('Tecla Escape presionada - cerrando modal');
                closeModal();
            }
        }
    });
    
    console.log('Eventos configurados correctamente');
});
