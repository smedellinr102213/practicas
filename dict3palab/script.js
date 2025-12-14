document.addEventListener('DOMContentLoaded',
() => {
    // Array de 30 oraciones sencillas (se mantiene)
    const sentences = [
        ["El", "gato", "juega."], ["La", "niña", "ríe."],
        ["Un", "pájaro", "vuela."], ["Mi", "perro", "salta."], 
        ["Ese", "sol", "calienta."], ["Una", "flor", "nace."],
        ["Mi", "mamá", "come."], ["El", "pez", "nada."],
        ["La", "mesa", "es."], ["Un", "día", "pasa."],
        ["Esa", "bola", "rueda."], ["El", "libro", "cae."],
        ["Mi", "tío", "ayuda."], ["La", "luna", "brilla."],
        ["Un", "tren", "llega."], ["El", "agua", "moja."],
        ["La", "mano", "toca."], ["Mi", "pie", "duele."],
        ["Un", "árbol", "crece."], ["La", "taza", "cae."],
        ["El", "bebé", "duerme."], ["Una", "carta", "dice."],
        ["Mi", "dado", "gira."], ["Ese", "cielo", "es."],
        ["El", "pelo", "es."], ["La", "casa", "tiene."],
        ["Un", "dedo", "apunta."], ["Mi", "ropa", "está."],
        ["El", "nido", "tiene."], ["Una", "abeja", "pica."],
    ];
    
    let currentSentence = [];
    let completedCount = 0;
    let preferredVoice = null; 
    
    const inputArea = document.getElementById('input-area');
    const playButton = document.getElementById('play-sentence-btn');
    const nextButton = document.getElementById('next-sentence-btn');
    const countDisplay = document.getElementById('completed-count');

    // --- Helper para ignorar acentos (se mantiene) ---
    function removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // --- Configuración de Voz (OPTIMIZADA para Tono de Niña/Femenino en iOS) ---
    function setPreferredVoice() {
        const voices = speechSynthesis.getVoices();
        
        // 1. Nombres comunes de voces que suenan claras, femeninas o infantiles
        const targetVoiceNames = [
            /sandra/i, /sofía/i, /ximena/i, /carmen/i, /teresa/i, /paulina/i, /niña/i, /mujer/i, /female/i
        ];
        
        const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
        
        // 2. PRIORIDAD 1: Buscar tono femenino/infantil.
        let clearVoice = spanishVoices.find(voice => targetVoiceNames.some(regex => regex.test(voice.name)));

        // 3. PRIORIDAD 2: Si no se encuentra un nombre específico, buscar es-MX.
        if (!clearVoice) {
            clearVoice = spanishVoices.find(voice => voice.lang === 'es-MX');
        }

        // 4. Fallback: Cualquier voz en español.
        preferredVoice = clearVoice || spanishVoices[0] || null;
    }
    
    // CRÍTICO EN SAFARI: Asegurar que las voces se carguen antes de intentar usarlas
    if (speechSynthesis.onvoiceschanged !== undefined) {
       speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
    setPreferredVoice();


    // --- Lógica de la Práctica (Se mantiene) ---

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
        
        // NO APLICAR FOCO AQUÍ EN iOS, ROMPE LA VOZ AL INICIO
        // const firstInput = inputArea.querySelector('.word-input');
        // if(firstInput) firstInput.focus();
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
        
        // Ajustes para voz más infantil y menos robótica (idénticos a los que funcionaron)
        utterance.rate = 0.9;  
        utterance.pitch = 1.2; 

        // CRÍTICO: El botón de Play se debe deshabilitar para evitar múltiples clics
        playButton.disabled = true;

        utterance.onend = () => {
            // Re-habilitar el botón de Play después de que la oración termine de hablar
            playButton.disabled = false; 
        };
        
        if (preferredVoice) {
           utterance.voice = preferredVoice;
           utterance.lang = preferredVoice.lang; 
        } else {
           utterance.lang = 'es-MX';
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
        
        const baseCorrectNoAccents = removeAccents(baseCorrect);
        const studentInputNoAccents = removeAccents(studentInput);
        
        // --- Lógica de Validación (se mantiene) ---
        
        if (index === 0) {
            // Primera palabra: debe empezar con mayúscula
            const startsWithCapital = (studentInput.length > 0 && baseCorrect.length > 0 && studentInput[0] === baseCorrect[0]);
            const lettersMatch = (studentInputNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());
            isCorrect = startsWithCapital && lettersMatch;
            
        } else if (index === currentSentence.length - 1) {
            // Última palabra: debe terminar con punto
            const hasPunctuation = (studentInput.slice(-1) === '.');
            
            const studentBase = studentInput.slice(0, -1);
            const studentBaseNoAccents = removeAccents(studentBase);
            const lettersMatch = (studentBaseNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());

            isCorrect = hasPunctuation && lettersMatch;
            
        } else {
            // Palabra intermedia: solo coincidencia de letras
            const lettersMatch = (studentInputNoAccents.toLowerCase() === baseCorrectNoAccents.toLowerCase());
            isCorrect = lettersMatch;
        }

        // --- Aplicar Retroalimentación y Foco (se mantiene) ---
        
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

    // <<<<<<<<<<<<<<<< CORRECCIÓN CRÍTICA PARA IOS >>>>>>>>>>>>>>>>>>
    // Retrasar la inicialización para evitar que el foco inicial rompa la voz en iOS.
    setTimeout(() => {
        initializePractice();
    }, 500); 
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
});
