// 1. Datos de la Práctica 
const allWords = [
    // SUSTANTIVOS PROPIOS (category: "propio")
    { text: "Maria", category: "propio" },
    { text: "Carlos", category: "propio" },
    { text: "Walmart", category: "propio" },
    { text: "Mexico", category: "propio" },
    { text: "Texas", category: "propio" },
    { text: "Ale", category: "propio" },
    
    // SUSTANTIVOS COMUNES (category: "comun")
    { text: "casa", category: "comun" },
    { text: "fruta", category: "comun" },
    { text: "silla", category: "comun" },
    { text: "libro", category: "comun" },
    { text: "gato", category: "comun" },
    { text: "niño", category: "comun" },
    
    // NO SUSTANTIVOS (category: "no-sustantivo")
    { text: "rie", category: "no-sustantivo" },
    { text: "sube", category: "no-sustantivo" },
    { text: "camina", category: "no-sustantivo" },
    { text: "ladra", category: "no-sustantivo" },
    { text: "escribe", category: "no-sustantivo" },
    { text: "lee", category: "no-sustantivo" },
];

// 2. Referencias del DOM
const wordBank = document.getElementById('word-bank');
const dropZones = document.querySelectorAll('.drop-zone');
const feedbackMessage = document.getElementById('feedback-message');

let selectedWord = null; // Palabra actualmente seleccionada/activa

// 3. Funciones de Feedback Visual
function showFeedback(isCorrect, message) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    setTimeout(function() {
        feedbackMessage.className = 'feedback';
    }, 1500);
}

// 4. Lógica de Tocar para Seleccionar (Banco de Palabras)
function handleWordSelection(event) {
    const targetWord = event.target;
    
    // Si ya está en una zona de soltar y es correcta, no hacemos nada (o podríamos permitir que la saquen si lo deseas)
    if (targetWord.classList.contains('correct')) {
        return; 
    }

    // Deseleccionar la palabra que estaba activa
    if (selectedWord) {
        selectedWord.classList.remove('selected');
    }

    // Seleccionar la nueva palabra
    if (selectedWord !== targetWord) {
        selectedWord = targetWord;
        selectedWord.classList.add('selected');
    } else {
        // Si toca la misma palabra dos veces, la deseleccionamos
        selectedWord = null;
    }
}

// 5. Lógica de Tocar para Colocar (Zonas de Soltar)
function handleZonePlacement(event) {
    if (!selectedWord) {
        showFeedback(false, '¡Selecciona una palabra primero!');
        return;
    }

    const targetZone = event.currentTarget; // Usamos currentTarget para asegurarnos de que es el .drop-zone
    const wordCategory = selectedWord.dataset.category;
    const zoneCategory = targetZone.dataset.category;
    
    const isCorrect = wordCategory === zoneCategory;

    // 1. Mover el elemento y aplicar feedback visual
    targetZone.appendChild(selectedWord);
    selectedWord.classList.remove('selected');
    
    // 2. Aplicar el color (verde/rojo)
    selectedWord.classList.remove('correct', 'incorrect'); // Limpia colores viejos
    selectedWord.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // 3. Mostrar el mensaje
    showFeedback(isCorrect, isCorrect ? '¡Correcto!' : '¡Incorrecto! Intenta otra categoría.');

    // 4. Deseleccionar la palabra para el siguiente turno
    selectedWord = null;
}


// 6. Inicialización de la Aplicación
function initializeApp() {
    // A. Crea e inicializa las palabras
    allWords.forEach(function(word) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.text;
        // Cambiamos la clase a 'selectable-word'
        wordDiv.className = 'selectable-word'; 
        wordDiv.dataset.category = word.category;
        wordBank.appendChild(wordDiv);
    });

    // B. Añade los listeners de eventos

    // Listener para SELECCIONAR (en el banco de palabras)
    wordBank.addEventListener('click', function(e) {
        if (e.target.classList.contains('selectable-word')) {
            handleWordSelection(e);
        }
    });

    // Listener para COLOCAR (en las zonas de soltar)
    dropZones.forEach(function(zone) {
        zone.addEventListener('click', handleZonePlacement);
    });

    // Listener para REUBICAR (Si el estudiante toca una palabra colocada)
    dropZones.forEach(function(zone) {
        zone.addEventListener('click', function(e) {
            // Si tocamos una palabra colocada, la seleccionamos para reubicarla.
            if (e.target.classList.contains('selectable-word') && !e.target.classList.contains('selected')) {
                // Primero, movemos la palabra de vuelta al banco para que el estudiante pueda reubicarla
                returnToBank(e.target);
                // Luego la seleccionamos
                handleWordSelection(e);
            }
        });
    });
}

// Función auxiliar para mover una palabra al banco
function returnToBank(element) {
    // Limpia los estados de color y selección
    element.classList.remove('correct', 'incorrect', 'selected');
    // Mueve al banco
    wordBank.appendChild(element); 
}

// Inicia la aplicación al cargar
initializeApp();
