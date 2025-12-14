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
    ];
    
    const NUM_OPTIONS = 5;
    let currentCorrectSyllable = '';
    let completedCount = 0;
    let preferredVoice = null; 
    let isInitialized = false; // Bandera para controlar la primera pulsación

    const optionsArea = document.getElementById('syllable-options');
    const playButton = document.getElementById('play-syllable-btn');
    const nextButton = document.getElementById('next-syllable-btn');
    const countDisplay = document.getElementById('completed-count');
    const errorModal = document.getElementById('error-modal');
    const closeModalButton = document.getElementById('close-modal-btn');
    const instructionText = document.querySelector('.instruction'); 
    
    const initialBlocker = document.getElementById('initial-blocker');

    // --- Configuración de Voz (Se mantiene la optimización) ---
    function setPreferredVoice() {
        const voices = speechSynthesis.getVoices();
        const targetVoiceNames = [
            /sandra/i, /sofía/i, /ximena/i, /carmen/i, /teresa/i, /paulina/i, /niña/i, /mujer/i, /female/i
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
     * Usa la Web Speech API para leer la sílaba en voz alta y HABILITAR las opciones.
     */
    function speakSyllable(syllable) {
        if (!syllable) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        playButton.disabled = true;

        const utterance = new SpeechSynthesisUtterance(syllable);
        
        // Parámetros para voz clara e infantil
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
    
    // NOTA: Estas funciones ahora asumen que las cajas existen, por lo que solo se llaman después de la inicialización
    function enableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.remove('disabled-start'); 
            box.addEventListener('click', handleSelection); 
        });
    }

    function disableSyllableBoxes() {
        document.querySelectorAll('.syllable-box').forEach(box => {
            box.classList.add('disabled-start');
            box.removeEventListener('click', handleSelection);
        });
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
     * Inicializa una nueva práctica de sílaba. 
     * NOTA: Esta función AHORA GENERA LAS CAJAS.
     */
    function initializePractice() {
        const options = generateOptions();
        
        optionsArea.innerHTML = ''; 
        nextButton.classList.add('hidden');
        instructionText.textContent = "Pulsa la bocina para escuchar la sílaba.";
        
        options.forEach(syllable => {
            const box = document.createElement('div');
            // Las cajas se crean bloqueadas, se habilitarán al hablar
            box.className = 'syllable-box disabled-start'; 
            box.textContent = syllable.toUpperCase(); 
            box.setAttribute('data-syllable', syllable);
            optionsArea.appendChild(box);
        });
        
        disableSyllableBoxes(); 
    }
    
    function handleSelection(event) {
        
        const selectedBox = event.target;
        const selectedSyllable = selectedBox.getAttribute('data-syllable');
        
        disableSyllableBoxes(); 

        if (selectedSyllable === currentCorrectSyllable) {
            // ACIERTO
            selectedBox.classList.remove('disabled-start');
            selectedBox.classList.add('correct');
            completedCount++;
            countDisplay.textContent = completedCount;
            
            nextButton.classList.remove('hidden');
            instructionText.textContent = "¡Correcto! Pasa a la siguiente sílaba.";
            
        } else {
            // ERROR
            selectedBox.classList.add('incorrect');
            errorModal.classList.remove('hidden');
        }
    }
    
    function nextPractice() {
        initializePractice();
        // Después de la siguiente práctica, volver a reproducir
        speakSyllable(currentCorrectSyllable); 
    }
    
    // --- Event Listeners ---
    
    playButton.addEventListener('click', () => {
        // Lógica de Primera Inicialización (CRÍTICO)
        if (!isInitialized) {
            // 1. Genera las 5 cajas de sílabas por primera vez
            initializePractice();
            isInitialized = true;
        }
        
        // 2. Hablar la sílaba (ya sea la primera vez o una repetición)
        playButton.disabled = true;
        speakSyllable(currentCorrectSyllable);
    });
    
    nextButton.addEventListener('click', nextPractice);
    
    closeModalButton.addEventListener('click', () => {
        errorModal.classList.add('hidden');
        
        document.querySelectorAll('.syllable-box').forEach(box => {
            if (!box.classList.contains('correct')) {
                 box.classList.remove('incorrect');
            }
        });
        
        // Vuelve a reproducir la sílaba después de cerrar el error
        enableSyllableBoxes();
        speakSyllable(currentCorrectSyllable);
    });

    // CRÍTICO: SOLO eliminamos el bloqueador después de un retraso mínimo
    setTimeout(() => {
        if (initialBlocker) {
            initialBlocker.style.display = 'none';
        }
        // NOTA: La pantalla inicia con el botón de bocina visible y NINGUNA caja de sílaba
    }, 500); 
});
