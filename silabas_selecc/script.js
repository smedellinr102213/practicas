document.addEventListener('DOMContentLoaded', () => {
    // Lista completa de sílabas comunes
    const allSyllables = [
        "ma", "me", "mi", "mo", "mu", "pa", "pe", "pi", "po", "pu", 
        "sa", "se", "si", "so", "su", "la", "le", "li", "lo", "lu", 
        "da", "de", "di", "do", "du", "ra", "re", "ri", "ro", "ru", 
        "na", "ne", "ni", "no", "nu", "ta", "te", "ti", "to", "tu",
        "ca", "co", "cu", "que", "qui", "ga", "go", "gu", 
        "cha", "che", "chi", "cho", "chu", "lla", "lle", "lli", "llo", "llu", 
        "ba", "be", "bi", "bo", "bu", "fa", "fe", "fi", "fo", "fu",
        "ja", "je", "ji", "jo", "ju", "va", "ve", "vi", "vo", "vu",
        "za", "ze", "zi", "zo", "zu",
        "al", "el", "il", "ol", "ul", "an", "en", "in", "on", "un",
        "ar", "er", "ir", "or", "ur", "as", "es", "is", "os", "us",
        "am", "em", "im", "om", "um"
    ];
    
    const NUM_OPTIONS = 5;
    let currentCorrectSyllable = '';
    let completedCount = 0;
    let errorCount = 0;
    let totalAttempts = 0;
    let preferredVoice = null; 
    let isInitialized = false; 

    const optionsArea = document.getElementById('syllable-options'); // Ahora es un <form>
    const playButton = document.getElementById('play-syllable-btn');
    const countDisplay = document.getElementById('completed-count');
    const errorCountDisplay = document.getElementById('error-count');
    const mainModal = document.getElementById('main-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalActionButton = document.getElementById('modal-action-btn');
    const instructionText = document.querySelector('.instruction'); 
    const initialBlocker = document.getElementById('initial-blocker');

    // --- Configuración de Voz ---
    function setPreferredVoice() {
        // (Mismo código de configuración de voz)
        const voices = speechSynthesis.getVoices();
        const targetVoiceNames = [
            /ximena/i, /carmen/i, /teresa/i, /paulina/i, /sofía/i, /sandra/i
        ];
        const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
        
        let clearVoice = spanishVoices.find(voice => targetVoiceNames.some(regex => regex.test(voice.name)));
        if (!clearVoice) {
            clearVoice = spanishVoices.find(voice => voice.lang === 'es-MX');
        }
        preferredVoice = clearVoice || spanishVoices[0] || null;
    }
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
    setPreferredVoice();

    /**
     * Muestra el modal.
     */
    function showModal(isCorrect) {
        // Protección: Solo se permite mostrar el modal si el juego ya fue inicializado.
        if (!isInitialized) return; 

        mainModal.classList.remove('hidden', 'modal-error', 'modal-success');
        
        if (isCorrect) {
            mainModal.classList.add('modal-success');
            modalMessage.textContent = `¡Correcto! Aciertos: ${completedCount} de ${totalAttempts}. 🎉`;
            modalActionButton.textContent = "Siguiente";
        } else {
            mainModal.classList.add('modal-error');
            modalMessage.textContent = `¡Incorrecto! Vuelve a intentarlo. Errores: ${errorCount}. 🤔`;
            modalActionButton.textContent = "Entendido";
        }
    }
    
    function speakSyllable(syllable) {
        if (!syllable) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        playButton.disabled = true;

        const utterance = new SpeechSynthesisUtterance(syllable);
        
        utterance.rate = 0.9;  
        utterance.pitch = 1.2; 
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang; 
        } else {
            utterance.lang = 'es-MX';
        }

        speechSynthesis.speak(utterance);
        
        // Habilitar interacción SOLAMENTE cuando la voz empieza a sonar
        utterance.onstart = () => {
             enableSyllableBoxes();
             instructionText.textContent = "¡Selecciona la sílaba correcta!";
        };
        
        // Re-habilitar el botón de bocina al finalizar
        utterance.onend = () => {
             playButton.disabled = false;
        };
    }
    
    function enableSyllableBoxes() {
        // Habilitar las etiquetas (labels) que actúan como botones
        document.querySelectorAll('.syllable-options label').forEach(label => {
            label.classList.remove('disabled');
        });
        // Agregar listener al evento 'change' del formulario
        optionsArea.addEventListener('change', handleSelection);
    }

    function disableSyllableBoxes() {
        // Deshabilitar las etiquetas
        document.querySelectorAll('.syllable-options label').forEach(label => {
            label.classList.add('disabled');
        });
        // Remover el listener
        optionsArea.removeEventListener('change', handleSelection);
    }
    
    function generateOptions() {
        const shuffledSyllables = [...allSyllables].sort(() => 0.5 - Math.random());
        currentCorrectSyllable = shuffledSyllables[0];
        let incorrectOptions = shuffledSyllables.slice(1, NUM_OPTIONS);
        let options = [currentCorrectSyllable, ...incorrectOptions];
        options.sort(() => 0.5 - Math.random());
        return options;
    }

    /**
     * Genera los elementos de radio/etiqueta dentro del formulario.
     */
    function generateNewPractice() {
        const options = generateOptions();
        
        optionsArea.innerHTML = ''; 
        instructionText.textContent = "Pulsa la bocina para escuchar la sílaba.";
        
        options.forEach((syllable, index) => {
            const id = `syllable-${index}`;
            
            // 1. Crear el input de radio (oculto)
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'syllable-choice';
            radio.id = id;
            radio.value = syllable;

            // 2. Crear la etiqueta (el botón visual)
            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = syllable.toUpperCase();
            label.classList.add('disabled'); // Inicia deshabilitado

            // 3. Añadir ambos al contenedor
            optionsArea.appendChild(radio);
            optionsArea.appendChild(label);
        });
        
        disableSyllableBoxes(); 
    }
    
    function handleSelection(event) {
        
        // Protección: Ignorar si el juego no está inicializado
        if (!isInitialized) return; 

        // Solo procesar si el evento viene de un radio button (que es lo que escucha el 'change')
        const selectedRadio = event.target;
        if (selectedRadio.name !== 'syllable-choice') return;

        const selectedSyllable = selectedRadio.value;
        const selectedLabel = document.querySelector(`label[for="${selectedRadio.id}"]`);
        
        disableSyllableBoxes(); 
        
        totalAttempts++; 
        
        if (selectedSyllable === currentCorrectSyllable) {
            // ACIERTO
            selectedLabel.classList.add('correct');
            completedCount++;
            
            showModal(true);
            
        } else {
            // ERROR
            selectedLabel.classList.add('incorrect');
            errorCount++;
            
            // Si es incorrecto, marcamos la correcta para mostrarla
            const correctRadio = document.querySelector(`input[value="${currentCorrectSyllable}"]`);
            const correctLabel = document.querySelector(`label[for="${correctRadio.id}"]`);
            correctLabel.classList.add('correct');
            
            showModal(false); 
        }
        
        // Actualizar contadores
        countDisplay.textContent = `${completedCount} de ${totalAttempts}`;
        errorCountDisplay.textContent = errorCount;
    }
    
    function nextPractice() {
        mainModal.classList.add('hidden');
        
        // Reiniciar la selección y generar nueva práctica
        generateNewPractice(); 
        
        // Luego reproduce la voz
        playButton.disabled = true;
        speakSyllable(currentCorrectSyllable); 
    }
    
    // --- Event Listeners ---
    
    playButton.addEventListener('click', () => {
        
        // Lógica de Primera Inicialización (CRÍTICO)
        if (!isInitialized) {
            // 1. Genera las 5 opciones de radio por primera vez
            generateNewPractice();
            isInitialized = true; // El juego ya está inicializado
        }
        
        // 2. Hablar la sílaba
        playButton.disabled = true;
        speakSyllable(currentCorrectSyllable);
    });
    
    // Manejador del botón del modal (unificado para acierto/error)
    modalActionButton.addEventListener('click', () => {
        
        // Reiniciar los estilos de las etiquetas
        document.querySelectorAll('.syllable-options label').forEach(label => {
            label.classList.remove('incorrect', 'correct');
        });
        // Desmarcar los radios
        optionsArea.reset();

        if (mainModal.classList.contains('modal-success')) {
             // Si fue acierto, pasar a la siguiente práctica 
             nextPractice(); 
             
        } else {
            // Si fue error, cerrar el modal, y re-habilitar
            mainModal.classList.add('hidden');
            
            // Re-habilitar interacción y volver a reproducir la sílaba
            enableSyllableBoxes();
            speakSyllable(currentCorrectSyllable);
        }
    });

    // --- CÓDIGO FINAL DE HABILITACIÓN AL CARGAR ---
    
    // 1. Inicializar contadores
    countDisplay.textContent = `${completedCount} de ${totalAttempts}`;
    errorCountDisplay.textContent = errorCount;

    // 2. Eliminar el bloqueador de pantalla completa
    if (initialBlocker) {
        initialBlocker.style.display = 'none';
    }
    
    // 3. HABILITAR EL BOTÓN DE BOCINA
    playButton.disabled = false;
});
