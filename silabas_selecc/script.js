document.addEventListener('DOMContentLoaded', () => {
    // Lista completa de sílabas comunes de dos letras (consonante + vocal)
    const allSyllables = [
        "ma", "me", "mi", "mo", "mu", 
        "pa", "pe", "pi", "po", "pu", 
        "sa", "se", "si", "so", "su", 
        "la", "le", "li", "lo", "lu", 
        "da", "de", "di", "do", "du", 
        "ra", "re", "ri", "ro", "ru", 
        "na", "ne", "ni", "no", "nu",
        "ta", "te", "ti", "to", "tu",
        "ca", "co", "cu", // Ce, Ci tienen sonido diferente
        "que", "qui", // Sílabas con 'q'
        "ga", "go", "gu", // Ge, Gi tienen sonido diferente
        "cha", "che", "chi", "cho", "chu", // Dígrafo CH
        "lla", "lle", "lli", "llo", "llu", // Dígrafo LL
        "ba", "be", "bi", "bo", "bu",
        "fa", "fe", "fi", "fo", "fu",
        "ja", "je", "ji", "jo", "ju",
        "va", "ve", "vi", "vo", "vu",
        "za", "ze", "zi", "zo", "zu",
    ];
    
    const NUM_OPTIONS = 5;
    let currentCorrectSyllable = '';
    let completedCount = 0;
    let preferredVoice = null; 
    
    const optionsArea = document.getElementById('syllable-options');
    const playButton = document.getElementById('play-syllable-btn');
    const nextButton = document.getElementById('next-syllable-btn');
    const countDisplay = document.getElementById('completed-count');
    const errorModal = document.getElementById('error-modal');
    const closeModalButton = document.getElementById('close-modal-btn');

    // --- Configuración de Voz (Optimizado para tono infantil en iOS) ---
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
     * Usa la Web Speech API para leer la sílaba en voz alta.
     */
    function speakSyllable(syllable) {
        if (!syllable) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(syllable);
        
        // Parámetros CRÍTICOS para voz infantil en iOS
        utterance.rate = 0.9;  
        utterrence.pitch = 1.2; 
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang; 
        } else {
            utterance.lang = 'es-MX';
        }

        speechSynthesis.speak(utterance);
    }

    /**
     * Obtiene una sílaba correcta al azar y 4 sílabas incorrectas únicas.
     */
    function generateOptions() {
        const shuffledSyllables = [...allSyllables].sort(() => 0.5 - Math.random());
        
        // 1. Seleccionar la sílaba correcta
        currentCorrectSyllable = shuffledSyllables[0];
        
        // 2. Seleccionar 4 sílabas incorrectas ÚNICAS
        let incorrectOptions = shuffledSyllables.slice(1, NUM_OPTIONS);
        
        // 3. Combinar y barajar las 5 opciones
        let options = [currentCorrectSyllable, ...incorrectOptions];
        options.sort(() => 0.5 - Math.random());
        
        return options;
    }

    /**
     * Inicializa una nueva práctica de sílaba.
     */
    function initializePractice() {
        const options = generateOptions();
        
        optionsArea.innerHTML = ''; // Borrar todas las cajas anteriores
        nextButton.classList.add('hidden');
        
        options.forEach(syllable => {
            const box = document.createElement('div');
            box.className = 'syllable-box';
            box.textContent = syllable.toUpperCase(); // Mostrar en mayúsculas para claridad
            box.setAttribute('data-syllable', syllable);
            box.addEventListener('click', handleSelection);
            optionsArea.appendChild(box);
        });

        // Reproducir la sílaba correcta automáticamente
        // speakSyllable(currentCorrectSyllable); 
        
        // Opcional: enfocar el botón de Play para que sea el primer toque
        playButton.focus();
    }
    
    /**
     * Maneja la selección de una caja de sílaba por el estudiante.
     */
    function handleSelection(event) {
        const selectedBox = event.target;
        const selectedSyllable = selectedBox.getAttribute('data-syllable');
        
        // Deshabilitar todas las cajas mientras se procesa la selección
        document.querySelectorAll('.syllable-box').forEach(box => box.classList.add('disabled'));

        if (selectedSyllable === currentCorrectSyllable) {
            // ACIERTO
            selectedBox.classList.add('correct');
            completedCount++;
            countDisplay.textContent = completedCount;
            
            // Mostrar botón para pasar a la siguiente
            nextButton.classList.remove('hidden');
            
        } else {
            // ERROR
            selectedBox.classList.add('incorrect');
            
            // Mostrar pop-up de error
            errorModal.classList.remove('hidden');
            
            // Re-habilitar las cajas incorrectas (después de cerrar el modal)
            document.querySelectorAll('.syllable-box').forEach(box => {
                if (!box.classList.contains('correct')) {
                    box.classList.remove('disabled');
                    // Quitar el color rojo de la caja seleccionada para que puedan intentarlo de nuevo
                    setTimeout(() => {
                        box.classList.remove('incorrect');
                    }, 500); 
                }
            });
        }
    }
    
    /**
     * Reinicia la práctica para la siguiente sílaba.
     */
    function nextPractice() {
        // Asegurarse de que las cajas estén habilitadas antes de regenerar
        document.querySelectorAll('.syllable-box').forEach(box => box.classList.remove('disabled'));
        initializePractice();
    }
    
    // --- Event Listeners ---
    
    // Al pulsar la bocina
    playButton.addEventListener('click', () => {
        speakSyllable(currentCorrectSyllable);
    });
    
    // Al pulsar el botón Siguiente
    nextButton.addEventListener('click', nextPractice);
    
    // Al pulsar el botón 'Entendido' del pop-up de error
    closeModalButton.addEventListener('click', () => {
        errorModal.classList.add('hidden');
    });

    // Iniciar la primera práctica
    initializePractice();
});
