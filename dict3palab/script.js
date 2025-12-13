document.addEventListener('DOMContentLoaded', () => {
    // Array de 30 oraciones sencillas (Artículo/Determinante + Sustantivo + Verbo/Complemento)
    // NOTA: La lógica de validación ignora acentos/tildes, pero los mantiene en la oración para la voz.
    const sentences = [
        ["El", "gato", "juega."],
        ["La", "niña", "ríe."],
        ["Un", "pájaro", "vuela."],
        ["Mi", "perro", "salta."],
        ["Ese", "sol", "calienta."],
        ["Una", "flor", "nace."],
        ["Mi", "mamá", "come."],
        ["El", "pez", "nada."],
        ["La", "mesa", "es."],
        ["Un", "día", "pasa."],
        ["Esa", "bola", "rueda."],
        ["El", "libro", "cae."],
        ["Mi", "tío", "ayuda."],
        ["La", "luna", "brilla."],
        ["Un", "tren", "llega."],
        ["El", "agua", "moja."],
        ["La", "mano", "toca."],
        ["Mi", "pie", "duele."],
        ["Un", "árbol", "crece."],
        ["La", "taza", "cae."],
        ["El", "bebé", "duerme."],
        ["Una", "carta", "dice."],
        ["Mi", "dado", "gira."],
        ["Ese", "cielo", "es."],
        ["El", "pelo", "es."],
        ["La", "casa", "tiene."],
        ["Un", "dedo", "apunta."],
        ["Mi", "ropa", "está."],
        ["El", "nido", "tiene."],
        ["Una", "abeja", "pica."],
    ];
    
    let currentSentence = [];
    let completedCount = 0;
    let preferredVoice = null; 
    
    const inputArea = document.getElementById('input-area');
    const playButton = document.getElementById('play-sentence-btn');
    const nextButton = document.getElementById('next-sentence-btn');
    const countDisplay = document.getElementById('completed-count');

    // --- Helper para ignorar acentos ---
    /**
     * Normaliza un string quitando los acentos (tildes).
     * @param {string} str - El string a normalizar.
     */
    function removeAccents(str) {
        // Usa la forma NFD (Normalization Form D) y quita los caracteres diacríticos (acentos)
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // --- Configuración de Voz para Safari/iOS ---
    function setPreferredVoice() {
        const voices = speechSynthesis.getVoices();
        
        // 1. Intentar encontrar voz de México (es-MX)
        preferredVoice = voices.find(voice => voice.lang === 'es-MX');

        // 2. Si no se encuentra, buscar voz genérica en español
        if (!preferredVoice) {
            preferredVoice = voices.find(voice => voice.lang.startsWith('es-'));
        }
    }
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
    setPreferredVoice();


    /**
     * Obtiene una oración aleatoria y única.
     */
    function getRandomSentence() {
        if (sentences.length === 0) {
            alert("¡Has completado todas las oraciones! Reiniciando la práctica.");
            // Si queremos que continúe después de agotar la lista, podemos recargar el array aquí.
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[randomIndex];
        sentences.splice(randomIndex, 1); 
        return sentence;
    }

    /**
     * Inicializa una nueva oración en la práctica.
     */
    function initializePractice() {
        currentSentence = getRandomSentence();
        if (!currentSentence) {
            playButton.disabled = true;
            return;
        }

        inputArea.innerHTML = '';
        nextButton.classList.add('hidden');
        playButton.disabled = false; 

        currentSentence.forEach((word, index) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'word-input';
            input.maxLength = 15;
            input.placeholder = `Palabra ${index + 1}`;
            input.setAttribute('data-index', index);
            input.addEventListener('input', checkWord);
            input.addEventListener('keydown', handleKeydown);
            inputArea.appendChild(input);
        });
        
        // Enfocar el primer input automáticamente
        const firstInput = inputArea.querySelector('.word-input');
        if(firstInput) firstInput.focus();
    }
    
    /**
     * Maneja la pulsación de la tecla Enter para verificar y avanzar.
     */
     function handleKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            checkWord({ target: event.target }); 
        }
     }


    /**
     * Lee la oración en voz alta.
     */
    function speakSentence() {
        if (currentSentence.length === 0) return;

        const textToSpeak = currentSentence.join(' ');
        
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.lang = 'es-MX';
        utterance.rate = 0.9; 
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        } else {
            utterance.lang = 'es';
        }

        speechSynthesis.speak(utterance);
    }

    /**
     * Comprueba la palabra escrita por el estudiante.
     */
    function checkWord(event) {
        const input = event.target;
        const index = parseInt(input.getAttribute('data-index'));
        const correctWord = currentSentence[index];
        let studentInput = input.value.trim();
        
        let isCorrect = false;

        // 1. Preprocesar la palabra correcta: quitar punto final
        let baseCorrect = correctWord.replace('.', '');
        
        // 2. Normalización de palabras a comparar (ignorar acentos)
        const baseCorrectNoAccents = removeAccents(baseCorrect);
        const studentInputNoAccents = removeAccents(studentInput);
        
        // --- Lógica de Validación ---
        
        if (index === 0) {
            // Palabra 1: Mayúscula INICIAL obligatoria, letras (sin acentos) deben coincidir.
            const startsWithCapital = (studentInput.length > 0 && studentInput[0] === baseCorrect[0]);
            const lettersMatch = (studentInputNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());
            
            isCorrect = startsWithCapital && lettersMatch;
            
        } else if (index === currentSentence.length - 1) {
            // Palabra 3: Punto final obligatorio, letras (sin acentos) deben coincidir en minúscula.
            
            const hasPunctuation = (studentInput.slice(-1) === '.');
            
            const studentBase = studentInput.slice(0, -1);
            const studentBaseNoAccents = removeAccents(studentBase);
            const lettersMatch = (studentBaseNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());

            isCorrect = hasPunctuation && lettersMatch;
            
        } else {
            // Palabra 2: Letras (sin acentos) deben coincidir. Se permite cualquier capitalización para mayor flexibilidad.
            const lettersMatch = (studentInputNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());
            isCorrect = lettersMatch;
        }

        // --- Aplicar Retroalimentación y Foco ---
        
        input.classList.remove('correct', 'incorrect');
        let needsFocusMove = false;
        
        if (studentInput.length > 0) {
            if (isCorrect) {
                input.classList.add('correct');
                input.disabled = true; // Deshabilitar si es correcta
                needsFocusMove = true;
            } else {
                input.classList.add('incorrect');
            }
        }
        
        if (needsFocusMove && index < currentSentence.length - 1) {
            // Mover el foco al siguiente input si hay uno y la palabra es correcta (excepto la última caja).
            const nextInput = inputArea.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
        
        checkCompletion();
    }

    /**
     * Comprueba si toda la oración está completada y correcta.
     */
    function checkCompletion() {
        const inputs = Array.from(inputArea.querySelectorAll('.word-input'));
        const allCorrect = inputs.every(input => input.classList.contains('correct'));

        if (allCorrect && inputs.length === currentSentence.length) {
            if (nextButton.classList.contains('hidden')) {
                completedCount++;
                countDisplay.textContent = completedCount;
                nextButton.classList.remove('hidden');
                playButton.disabled = true; 
            }
        } else {
            if (!nextButton.classList.contains('hidden')) {
                nextButton.classList.add('hidden');
                playButton.disabled = false;
            }
        }
    }

    // --- Event Listeners ---

    playButton.addEventListener('click', speakSentence);
    
    nextButton.addEventListener('click', () => {
        initializePractice();
    });

    // Iniciar la primera práctica al cargar
    initializePractice();
});
