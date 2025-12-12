// 1. Datos de la Práctica (Dividido en dos bloques)
const allWords = [
    // --- BLOQUE 1 (Palabras iniciales) ---
    // Diptongo UE (category: "ue") - 5 palabras
    { text: "fuego", category: "ue", block: 1 },
    { text: "rueda", category: "ue", block: 1 },
    { text: "cuerpo", category: "ue", block: 1 },
    { text: "nuevo", category: "ue", block: 1 },
    { text: "suelo", category: "ue", block: 1 },
    
    // Diptongo AU (category: "au") - 5 palabras
    { text: "pausa", category: "au", block: 1 },
    { text: "jaula", category: "au", block: 1 },
    { text: "auto", category: "au", block: 1 },
    { text: "causa", category: "au", block: 1 },
    { text: "fraude", category: "au", block: 1 },
    
    // Diptongo UO (category: "uo") - 5 palabras
    { text: "cuota", category: "uo", block: 1 },
    { text: "residuo", category: "uo", block: 1 },
    { text: "mutuo", category: "uo", block: 1 },
    { text: "actúo", category: "uo", block: 1 },
    { text: "arduoso", category: "uo", block: 1 },
    
    // Diptongo UA (category: "ua") - 5 palabras
    { text: "agua", category: "ua", block: 1 },
    { text: "guardar", category: "ua", block: 1 },
    { text: "cuatro", category: "ua", block: 1 },
    { text: "lengua", category: "ua", block: 1 },
    { text: "guapo", category: "ua", block: 1 },
    
    // --- BLOQUE 2 (Palabras para el segundo intento) ---
    // Diptongo UE (category: "ue") - 5 palabras
    { text: "hueso", category: "ue", block: 2 },
    { text: "cueva", category: "ue", block: 2 },
    { text: "trueno", category: "ue", block: 2 },
    { text: "cuerda", category: "ue", block: 2 },
    { text: "abuelo", category: "ue", block: 2 },

    // Diptongo AU (category: "au") - 5 palabras
    { text: "fauna", category: "au", block: 2 },
    { text: "aula", category: "au", block: 2 },
    { text: "laucha", category: "au", block: 2 },
    { text: "audio", category: "au", block: 2 },
    { text: "austero", category: "au", block: 2 },

    // Diptongo UO (category: "uo") - 5 palabras
    { text: "continuo", category: "uo", block: 2 },
    { text: "ambiguo", category: "uo", block: 2 },
    { text: "acuoso", category: "uo", block: 2 },
    { text: "evacuo", category: "uo", block: 2 },
    { text: "individuo", category: "uo", block: 2 },
    
    // Diptongo UA (category: "ua") - 5 palabras
    { text: "suave", category: "ua", block: 2 },
    { text: "iguana", category: "ua", block: 2 },
    { text: "paraguas", category: "ua", block: 2 },
    { text: "recua", category: "ua", block: 2 },
    { text: "estatua", category: "ua", block: 2 },
];

// 2. Referencias del DOM y Variables de Estado
const wordBank = document.getElementById('word-bank');
const dropZones = document.querySelectorAll('.drop-zone');
const feedbackMessage = document.getElementById('feedback-message');
const errorCountDisplay = document.getElementById('error-count');

let selectedWord = null; 
let errorCount = 0; 
let currentBlock = 1;
const totalBlocks = 2; 
const wordsPerBlock = 20;

// 3. Funciones de Feedback y Conteo de Errores
function updateErrorCount(isCorrect) {
    if (!isCorrect) {
        errorCount++;
        errorCountDisplay.textContent = errorCount;
    }
}

function showFeedback(isCorrect, message) {
    if (feedbackMessage.classList.contains('final-message')) return; 

    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback show ' + (isCorrect ? 'correct' : 'incorrect');

    setTimeout(function() {
        feedbackMessage.className = 'feedback';
    }, 1500);
}

function showFinalMessage() {
    feedbackMessage.style.backgroundColor = '#673ab7'; 
    feedbackMessage.textContent = `¡Práctica Terminada! Errores totales (Bloque 1 y 2): ${errorCount}. Llévalo a tu maestro para revisión. (Toca aquí para Reiniciar)`;
    feedbackMessage.classList.add('show', 'final-message');
    
    // Pausar la interacción
    wordBank.style.pointerEvents = 'none';
    dropZones.forEach(zone => zone.style.pointerEvents = 'none'); 
}


// 4. Lógica de Tocar para Seleccionar (Banco de Palabras)
function handleWordSelection(targetWord) {
    // Si la palabra ya fue clasificada correctamente, no hacemos nada.
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


// 5. Lógica de Tocar para Colocar (Zonas de Soltar)
function handleZonePlacement(targetZone) {
    if (!selectedWord) {
        showFeedback(false, '¡Selecciona una palabra primero!');
        return;
    }
    
    const wordCategory = selectedWord.dataset.category;
    const zoneCategory = targetZone.dataset.category;
    
    const isCorrect = wordCategory === zoneCategory;

    // 1. Contador de Errores
    updateErrorCount(isCorrect); 

    // 2. Mover el elemento y aplicar feedback visual
    targetZone.appendChild(selectedWord);
    selectedWord.classList.remove('selected');
    selectedWord.classList.remove('correct', 'incorrect'); 
    selectedWord.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // 3. Mostrar el mensaje
    showFeedback(isCorrect, isCorrect ? '¡Correcto!' : '¡Incorrecto! Intenta otra caja.');

    selectedWord = null;

    // 4. Verificar si la práctica ha terminado
    checkCompletion();
}


// 6. Control de Flujo y Reinicio
function checkCompletion() {
    let placedWords = 0;

    dropZones.forEach(zone => {
        placedWords += zone.querySelectorAll('.selectable-word').length;
    });

    if (placedWords === wordsPerBlock) {
        if (currentBlock < totalBlocks) {
            // Transición de bloque
            currentBlock++;
            showFeedback(true, '¡Bloque 1 Completado! Cargando nuevas palabras...');
            setTimeout(loadNextBlock, 2000); 
            
        } else {
            // Fin de la práctica
            showFinalMessage();
        }
    }
}

function loadNextBlock() {
    // 1. Limpiar HTML de las cajas
    dropZones.forEach(zone => {
        // Mantiene solo el título <h3>
        zone.innerHTML = zone.querySelector('h3').outerHTML; 
    });
    
    // 2. Limpiar el banco
    wordBank.innerHTML = '';
    
    // 3. Cargar el siguiente bloque
    initializeWordElements();
}

function resetTotalPractice() {
    // Reinicio total manual
    currentBlock = 1; 
    errorCount = 0;
    errorCountDisplay.textContent = '0';
    
    // Limpiar HTML
    dropZones.forEach(zone => {
        zone.innerHTML = zone.querySelector('h3').outerHTML;
    });
    wordBank.innerHTML = '';

    // Resetear feedback
    feedbackMessage.classList.remove('show', 'final-message');
    feedbackMessage.style.backgroundColor = '';
    feedbackMessage.textContent = '';
    
    // Re-habilitar zonas
    dropZones.forEach(zone => zone.style.pointerEvents = 'auto');
    
    // Iniciar desde el Bloque 1
    initializeApp();
}

// Función auxiliar para reubicación
function returnToBank(element) {
    element.classList.remove('correct', 'incorrect', 'selected');
    wordBank.appendChild(element); 
    feedbackMessage.classList.remove('show', 'final-message');
    feedbackMessage.style.backgroundColor = '';
}

// 7. Inicialización de Elementos de Palabras
function initializeWordElements() {
    
    const blockWords = allWords.filter(word => word.block === currentBlock);
    
    blockWords.sort(() => Math.random() - 0.5);
    
    blockWords.forEach(function(word) {
        const wordDiv = document.createElement('div');
        wordDiv.textContent = word.text; 
        wordDiv.className = 'selectable-word'; 
        wordDiv.dataset.category = word.category;
        wordBank.appendChild(wordDiv); 
    });

    wordBank.style.pointerEvents = 'auto';
}


// 8. Inicialización de la Aplicación (Setup Inicial con Delegación de Eventos)
function initializeApp() {
    // Cargar las palabras del primer bloque (Bloque 1)
    initializeWordElements();

    // Usamos event delegation en el cuerpo del documento para capturar todos los clics de manera robusta.
    if (!document.body.hasAttribute('data-listeners-added')) {
        
        document.body.addEventListener('click', function(e) {
            const target = e.target;
            
            // 1. Clic en el MENSAJE FINAL (Reinicio)
            if (target === feedbackMessage && feedbackMessage.classList.contains('final-message')) {
                resetTotalPractice();
                return;
            }
            
            // 2. Clic en una palabra en el BANCO (Selección)
            // Usamos .closest() para asegurar que seleccionamos el DIV de la palabra.
            const wordInBank = target.closest('#word-bank .selectable-word');
            if (wordInBank) {
                handleWordSelection(wordInBank);
                return;
            } 
            
            // 3. Clic en una palabra en la ZONA (Reubicación)
            const wordInZone = target.closest('.drop-zone .selectable-word');
            if (wordInZone) {
                if (!selectedWord) {
                    returnToBank(wordInZone);
                    handleWordSelection(wordInZone); 
                }
                return;
            } 
            
            // 4. Clic en la ZONA DE SOLTAR (Colocación)
            const dropZoneClicked = target.closest('.drop-zone');
            if (dropZoneClicked) {
                handleZonePlacement(dropZoneClicked);
                return;
            }

        });

        document.body.setAttribute('data-listeners-added', 'true');
    }
}

// Inicia la aplicación al cargar
initializeApp();
