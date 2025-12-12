// 1. Datos de la Práctica (Ampliado para tener más opciones al reiniciar)
const allWords = [
    // Diptongo UE (category: "ue") - 10 palabras
    { text: "fuego", category: "ue" },
    { text: "rueda", category: "ue" },
    { text: "cuerpo", category: "ue" },
    { text: "nuevo", category: "ue" },
    { text: "suelo", category: "ue" },
    { text: "hueso", category: "ue" },
    { text: "cueva", category: "ue" },
    { text: "trueno", category: "ue" },
    { text: "cuerda", category: "ue" },
    { text: "abuelo", category: "ue" },
    
    // Diptongo AU (category: "au") - 10 palabras
    { text: "pausa", category: "au" },
    { text: "jaula", category: "au" },
    { text: "auto", category: "au" },
    { text: "causa", category: "au" },
    { text: "fraude", category: "au" },
    { text: "fauna", category: "au" },
    { text: "aula", category: "au" },
    { text: "laucha", category: "au" },
    { text: "audio", category: "au" },
    { text: "austero", category: "au" },
    
    // Diptongo UO (category: "uo") - 10 palabras
    { text: "cuota", category: "uo" },
    { text: "residuo", category: "uo" },
    { text: "mutuo", category: "uo" },
    { text: "actúo", category: "uo" },
    { text: "arduoso", category: "uo" },
    { text: "continuo", category: "uo" },
    { text: "ambiguo", category: "uo" },
    { text: "acuoso", category: "uo" },
    { text: "evacuo", category: "uo" },
    { text: "individuo", category: "uo" },
    
    // Diptongo UA (category: "ua") - 10 palabras
    { text: "agua", category: "ua" },
    { text: "guardar", category: "ua" },
    { text: "cuatro", category: "ua" },
    { text: "lengua", category: "ua" },
    { text: "guapo", category: "ua" },
    { text: "suave", category: "ua" },
    { text: "iguana", category: "ua" },
    { text: "paraguas", category: "ua" },
    { text: "recua", category: "ua" },
    { text: "estatua", category: "ua" },
];

// 2. Referencias del DOM y Variables de Estado
const wordBank = document.getElementById('word-bank');
const dropZones = document.querySelectorAll('.drop-zone');
const feedbackMessage = document.getElementById('feedback-message');
const errorCountDisplay = document.getElementById('error-count');

let selectedWord = null;
let errorCount = 0;
const wordsPerRound = 20; // Número fijo de palabras a mostrar en cada intento (5 por categoría)

// 3. Funciones de Feedback y Conteo de Errores
function updateErrorCount(isCorrect) {
    if (!isCorrect) {
        errorCount++;
        errorCountDisplay.textContent = errorCount;
    }
}

function showFeedback(isCorrect, message) {
    // Si ya estamos mostrando el mensaje final, no mostrar feedback individual
    if (feedbackMessage.classList.contains('final-message')) return; 

    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    setTimeout(function() {
        feedbackMessage.className = 'feedback';
    }, 1500);
}

function showFinalMessage() {
    // ESTILO MORADO para el mensaje final
    feedbackMessage.style.backgroundColor = '#673ab7'; 
    feedbackMessage.textContent = `¡Felicidades! Errores totales en este intento: ${errorCount}. Llévalo a tu maestro.`;
    feedbackMessage.classList.add('show', 'final-message');
    
    // El mensaje se queda fijo. Reinicio automático después de 5 segundos.
    setTimeout(resetPractice, 5000); 
}


// 4. Lógica de Tocar para Seleccionar
function handleWordSelection(event) {
    const targetWord = event.target;
    
    if (targetWord.classList.contains('correct')) {
        return; 
    }

    if (selectedWord) {
        selectedWord.classList.remove('selected');
    }

    if (selectedWord !== targetWord) {
        selectedWord = targetWord;
        selectedWord.classList.add('selected');
    } else {
        selectedWord = null;
    }
}

// 5. Lógica de Tocar para Colocar
function handleZonePlacement(event) {
    if (!selectedWord) {
        showFeedback(false, '¡Selecciona una palabra primero!');
        return;
    }

    const targetZone = event.currentTarget; 
    const wordCategory = selectedWord.dataset.category;
    const zoneCategory = targetZone.dataset.category;
    
    const isCorrect = wordCategory === zoneCategory;

    // 1. Contador de Errores
    updateErrorCount(isCorrect); 

    // 2. Mover el elemento y aplicar feedback visual
    targetZone.appendChild(selectedWord);
    selectedWord.classList.remove('selected');
    
    // 3. Aplicar el color (verde/rojo)
    selectedWord.classList.remove('correct', 'incorrect'); 
    selectedWord.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // 4. Mostrar el mensaje
    showFeedback(isCorrect, isCorrect ? '¡Correcto!' : '¡Incorrecto! Intenta otra caja.');

    // 5. Deseleccionar la palabra para el siguiente turno
    selectedWord = null;

    // 6. Verificar si la práctica ha terminado
    checkCompletion();
}


// 7. Verificación y Reinicio
function checkCompletion() {
    // Contar solo las palabras que inicialmente se crearon en esta ronda
    const totalWords = wordsPerRound; 
    let placedWords = 0;

    dropZones.forEach(zone => {
        placedWords += zone.querySelectorAll('.selectable-word').length;
    });

    if (placedWords === totalWords) {
        // Todas las palabras han sido colocadas
        showFinalMessage();
    }
}

function resetPractice() {
    // 1. Limpiar todas las palabras de las cajas y el banco
    dropZones.forEach(zone => {
        zone.innerHTML = zone.querySelector('h3').outerHTML; // Solo mantiene el título <h3>
    });
    wordBank.innerHTML = '';
    
    // 2. Resetear contador de errores
    errorCount = 0;
    errorCountDisplay.textContent = '0';
    
    // 3. Resetear estilos del feedback
    feedbackMessage.classList.remove('show', 'final-message');
    feedbackMessage.style.backgroundColor = '';
    feedbackMessage.textContent = '';


    // 4. Inicializar el juego con nuevas palabras
    initializeApp();
}

// Función auxiliar para mover una palabra al banco y limpiar su estado (usada al reubicar)
function returnToBank(element) {
    // Limpia los estados de color y selección
    element.classList.remove('correct', 'incorrect', 'selected');
    // Mueve al banco
    wordBank.appendChild(element); 
    // Al regresar, si había un mensaje final, lo ocultamos
    feedbackMessage.classList.remove('show', 'final-message');
    feedbackMessage.style.backgroundColor = '';
}


// 6. Inicialización de la Aplicación
function initializeApp() {
    
    // 1. Seleccionar un subconjunto de palabras para la nueva ronda (5 por categoría, 20 en total)
    const categoryMap = { 'ue': [], 'au': [], 'uo': [], 'ua': [] };
    allWords.forEach(word => categoryMap[word.category].push(word));

    let currentWords = [];
    const wordsPerCategory = wordsPerRound / 4; 

    for (const key in categoryMap) {
        // Barajamos y tomamos el número exacto de palabras
        categoryMap[key].sort(() => Math.random() - 0.5);
        currentWords = currentWords.concat(categoryMap[key].slice(0, wordsPerCategory));
    }
    
    // 2. Barajar la lista final antes de inyectar
    currentWords.sort(() => Math.random() - 0.5);
    
    // 3. Crear los elementos HTML
    currentWords.forEach(function(word) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.text; 
        wordDiv.className = 'selectable-word'; 
        wordDiv.dataset.category = word.category;
        wordBank.appendChild(wordDiv); 
    });

    // 4. Configurar Eventos (Solo se configuran una vez en la carga inicial)
    // Usamos una variable auxiliar para asegurar que solo se añadan los listeners la primera vez
    if (!wordBank.hasAttribute('data-listeners-added')) {
         
        wordBank.addEventListener('click', function(e) {
            if (e.target.classList.contains('selectable-word')) {
                handleWordSelection(e);
            }
        });

        dropZones.forEach(function(zone) {
            zone.addEventListener('click', handleZonePlacement);
        });

        dropZones.forEach(function(zone) {
            zone.addEventListener('click', function(e) {
                // Lógica de reubicación: Si tocas una palabra ya colocada (y no hay otra seleccionada)
                if (e.target.classList.contains('selectable-word')) {
                    if (!selectedWord) {
                         returnToBank(e.target);
                         // Ahora la palabra está de nuevo en el banco, la seleccionamos
                         handleWordSelection(e);
                    }
                }
            });
        });

        wordBank.setAttribute('data-listeners-added', 'true');
    }
}

// Inicia la aplicación al cargar
initializeApp();
