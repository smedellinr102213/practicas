// 1. Datos de la Práctica
const allWords = [
    { text: "María", category: "propio" },
    { text: "Perro", category: "comun" },
    { text: "Correr", category: "no-sustantivo" },
    { text: "Mesa", category: "comun" },
    { text: "Londres", category: "propio" },
    { text: "Feliz", category: "no-sustantivo" },
    { text: "Juan", category: "propio" },
    { text: "Árbol", category: "comun" },
    { text: "Rápido", category: "no-sustantivo" },
    { text: "España", category: "propio" },
    { text: "Silla", category: "comun" },
    { text: "Comer", category: "no-sustantivo" },
];

// 2. Referencias del DOM
const wordBank = document.getElementById('word-bank');
const dropZones = document.querySelectorAll('.drop-zone');
const feedbackMessage = document.getElementById('feedback-message');

let draggedElement = null; // Palabra que se está arrastrando (global)

// 3. Funciones de Feedback Visual y Lógica

// Muestra el popup de feedback (correcto/incorrecto)
function showFeedback(isCorrect, message) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    // Desaparece el mensaje después de 1.5 segundos
    setTimeout(function() {
        feedbackMessage.className = 'feedback';
    }, 1500);
}

// Inicializa las palabras en el banco
function initializeWords() {
    allWords.forEach(function(word, index) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.text;
        wordDiv.className = 'draggable-word';
        wordDiv.setAttribute('draggable', 'true'); // Para el mouse (PC)
        wordDiv.dataset.category = word.category;
        wordDiv.dataset.initialParent = 'word-bank'; // Para saber a dónde regresar
        wordBank.appendChild(wordDiv);
    });
}

// 4. Lógica de Drag and Drop (COMPATIBLE CON iOS/TOUCH Y MOUSE)

// --- A. Eventos de Ratón (Para PC/Chromebook) ---
wordBank.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('draggable-word')) {
        draggedElement = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
        setTimeout(function() {
            e.target.classList.add('dragging');
        }, 0);
    }
});

dropZones.forEach(function(zone) {
    zone.addEventListener('dragover', function(e) {
        e.preventDefault(); // Permite soltar
    });

    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        const droppedElement = draggedElement;
        handleDrop(droppedElement, zone);
    });
});

// --- B. Eventos Táctiles (CRÍTICO PARA IPAD/IOS) ---
let touchStartX = 0;
let touchStartY = 0;

wordBank.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    if (touch && touch.target.classList.contains('draggable-word')) {
        draggedElement = touch.target;
        // Posición inicial del toque
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        // Preparar para mover
        draggedElement.style.position = 'absolute';
        draggedElement.style.zIndex = 1000;
    }
}, {passive: false}); // passive: false es importante para touchmove y preventDefault

wordBank.addEventListener('touchmove', function(e) {
    if (draggedElement) {
        const touch = e.touches[0];
        // Mover el elemento con el dedo (evitando el scroll nativo de iOS)
        e.preventDefault(); 
        
        // Centrar el elemento en el dedo
        draggedElement.style.left = touch.clientX - (draggedElement.offsetWidth / 2) + 'px';
        draggedElement.style.top = touch.clientY - (draggedElement.offsetHeight / 2) + 'px';
    }
}, {passive: false});

wordBank.addEventListener('touchend', function(e) {
    if (draggedElement) {
        // En touch-end, verificamos si está sobre una zona de soltar
        const touch = e.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        
        let targetZone = null;
        if (targetElement && targetElement.closest('.drop-zone')) {
            targetZone = targetElement.closest('.drop-zone');
        }

        if (targetZone) {
            // Se soltó en una zona
            handleDrop(draggedElement, targetZone);
        } else {
            // No se soltó en una zona, regresa al banco de palabras
            returnToBank(draggedElement);
        }

        // Restablecer el estado
        draggedElement.style.position = 'relative'; // Volver a flujo normal (o usar 'static')
        draggedElement.style.left = '';
        draggedElement.style.top = '';
        draggedElement.style.zIndex = 10;
        draggedElement = null;
    }
});

// --- C. Lógica de Soltar y Verificar ---
function handleDrop(element, zone) {
    const isCorrect = element.dataset.category === zone.dataset.category;
    
    if (isCorrect) {
        // Correcto: Mueve la palabra a la zona, desactiva el arrastre y da feedback
        zone.appendChild(element);
        element.classList.add('placed');
        element.setAttribute('draggable', 'false');
        showFeedback(true, '¡Correcto!');
    } else {
        // Incorrecto: Muestra error y devuelve la palabra al banco
        returnToBank(element);
        showFeedback(false, '¡Error! Inténtalo de nuevo.');
    }
}

function returnToBank(element) {
    // Si la palabra está en una zona de soltar, la quitamos
    if (element.parentNode.classList.contains('drop-zone')) {
        element.parentNode.removeChild(element);
    }
    // Devolvemos el elemento al banco de palabras
    wordBank.appendChild(element); 
}

// Inicializa la aplicación al cargar
initializeWords();
