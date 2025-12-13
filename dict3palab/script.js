document.addEventListener('DOMContentLoaded', () => {
    // Array de 30 oraciones sencillas (Artículo/Determinante + Sustantivo + Verbo/Complemento)
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
    function removeAccents(str) {
        // Usa la forma NFD (Normalization Form D) y quita los caracteres diacríticos (acentos)
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // --- Configuración de Voz (CRÍTICO para iOS/Safari) ---
    /**
     * Busca y establece la voz más adecuada (femenina/infantil en español de México).
     */
    function setPreferredVoice() {
        // Obtener la lista de voces
        const voices = speechSynthesis.getVoices();
        
        // Nombres comunes de voces femeninas/infantiles que puede usar iOS (ejemplos)
        const targetVoiceNames = [
            /sandra/i, /sofía/i, /ximena/i, /carmen/i, /teresa/i, /paulina/i, /mujer/i, /female/i
        ];
        
        // 1. Filtrar voces solo en español
        const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
        
        // 2. Buscar voz de México (es-MX) con nombre femenino/infantil
        let mxFemaleVoice = spanishVoices.find(voice => voice.lang === 'es-MX' && targetVoiceNames.some(regex => regex.test(voice.name)));
        
        // 3. Fallback 1: Cualquier voz de México (es-MX)
        if (!mxFemaleVoice) {
            mxFemaleVoice = spanishVoices.find(voice => voice.lang === 'es-MX');
        }
        
        // 4. Fallback 2: La primera voz con nombre femenino/infantil en español (es-ES, es-US, etc.)
        if (!mxFemaleVoice) {
            mxFemaleVoice = spanishVoices.find(voice => targetVoiceNames.some(regex => regex.test(voice.name)));
        }

        // 5. Fallback 3: Cualquier voz en español (la primera disponible)
        preferredVoice = mxFemaleVoice || spanishVoices[0] || null;
    }
    
    // CRÍTICO EN SAFARI: Asegurar que las voces se carguen antes de intentar usarlas
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
    // Llamar inmediatamente por si ya están cargadas
    setPreferredVoice();


    // --- Lógica de la Práctica ---

    function getRandomSentence() {
        if (sentences.length === 0) {
            alert("¡Has completado todas las oraciones! Reiniciando la práctica.");
            return null;
        }
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[randomIndex];
        sentences.splice(randomIndex, 1); 
        return sentence;
    }

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
        
        // Enfocar el primer input para usabilidad en iPad
        const firstInput = inputArea.querySelector('.word-input');
        if(firstInput) firstInput.focus();
    }
    
    function handleKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            checkWord({ target: event.target }); 
        }
     }


    function speakSentence() {
        if (currentSentence.length === 0) return;

        const textToSpeak = currentSentence.join(' ');
        
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.lang = 'es-MX'; 
        utterance.rate = 0.9; // Velocidad ajustada para claridad y naturalidad
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        } else {
            // Fallback si no se encontró una voz específica, usar idioma genérico
            utterance.lang = 'es'; 
        }

        speechSynthesis.speak(utterance);
    }

    function checkWord(event) {
        const input = event.target;
        const index = parseInt(input.getAttribute('data-index'));
        const correctWord = currentSentence[index];
        let studentInput = input.value.trim();
        
        let isCorrect = false;

        let baseCorrect = correctWord.replace('.', '');
        
        // Normalización de acentos para comparación
        const baseCorrectNoAccents = removeAccents(baseCorrect);
        const studentInputNoAccents = removeAccents(studentInput);
        
        // --- Lógica de Validación ---
        
        if (index === 0) {
            // Palabra 1: Mayúscula INICIAL obligatoria y letras coinciden (ignorando acentos)
            const startsWithCapital = (studentInput.length > 0 && studentInput[0] === baseCorrect[0]);
            const lettersMatch = (studentInputNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());
            isCorrect = startsWithCapital && lettersMatch;
            
        } else if (index === currentSentence.length - 1) {
            // Palabra 3: Punto final obligatorio y letras coinciden (ignorando acentos)
            const hasPunctuation = (studentInput.slice(-1) === '.');
            
            const studentBase = studentInput.slice(0, -1);
            const studentBaseNoAccents = removeAccents(studentBase);
            const lettersMatch = (studentBaseNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());

            isCorrect = hasPunctuation && lettersMatch;
            
        } else {
            // Palabra 2: Letras deben coincidir (ignorando acentos y mayúsculas/minúsculas)
            const lettersMatch = (studentInputNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());
            isCorrect = lettersMatch;
        }

        // --- Aplicar Retroalimentación y Foco ---
        
        input.classList.remove('correct', 'incorrect');
        let needsFocusMove = false;
        
        if (studentInput.length > 0) {
            if (isCorrect) {
                input.classList.add('correct');
                input.disabled = true;
                needsFocusMove = true;
            } else {
                input.classList.add('incorrect');
            }
        }
        
        if (needsFocusMove && index < currentSentence.length - 1) {
            // Mover el foco al siguiente input si la palabra es correcta y no es la última caja
            const nextInput = inputArea.querySelector(`[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
        
        checkCompletion();
    }

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

    // --- Inicialización ---

    playButton.addEventListener('click', speakSentence);
    
    nextButton.addEventListener('click', () => {
        initializePractice();
    });

    initializePractice();
});
