document.addEventListener('DOMContentLoaded', function () {
    const chatContainer = document.getElementById('chatContainer');
    const startBtn = document.getElementById('startBtn');
    const clearBtn = document.getElementById('clearBtn');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const apiStatus = document.getElementById('apiStatus');
    
    // Groq API - ACTUALIZADO
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const GROQ_API_KEY = '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';
    
    let debateHistory = [];
    let isDebateActive = false;
    let typingSpeed = 30;
    let currentTopic = "energía nuclear";

    // Función para limitar palabras
    function limitarPalabras(texto, limite = 50) {
        const palabras = texto.trim().split(/\s+/);
        if (palabras.length > limite) {
            return palabras.slice(0, limite).join(" ") + "...";
        }
        return texto;
    }

    // Función para formatear la hora actual
    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');
    }

    // Función para agregar un mensaje al chat
    function addMessage(sender, text, type = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-with-avatar ${type}`;

        const avatar = document.createElement('div');
        if (type === 'user') {
            avatar.className = 'avatar user-avatar';
            avatar.textContent = 'T';
        } else if (type === 'ambientalista') {
            avatar.className = 'avatar ambientalista-avatar';
            avatar.textContent = 'A';
        } else if (type === 'economista') {
            avatar.className = 'avatar economista-avatar';
            avatar.textContent = 'E';
        } else if (type === 'system') {
            avatar.className = 'avatar system-avatar';
            avatar.textContent = '⚡';
        }

        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';

        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = sender;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'timestamp';
        timeDiv.textContent = getCurrentTime();

        messageContainer.appendChild(senderDiv);
        messageContainer.appendChild(contentDiv);
        messageContainer.appendChild(timeDiv);

        if (type === 'user' || type === 'economista') {
            messageDiv.appendChild(messageContainer);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContainer);
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        debateHistory.push({
            sender: sender,
            text: text,
            type: type,
            timestamp: getCurrentTime()
        });
    }

    // Función para mostrar mensaje con efecto de escritura
    function addMessageWithTypingEffect(sender, text, type, callback) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-with-avatar ${type}`;

        const avatar = document.createElement('div');
        if (type === 'ambientalista') {
            avatar.className = 'avatar ambientalista-avatar';
            avatar.textContent = 'A';
        } else if (type === 'economista') {
            avatar.className = 'avatar economista-avatar';
            avatar.textContent = 'E';
        }

        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';

        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = sender;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content character-typing';

        const timeDiv = document.createElement('div');
        timeDiv.className = 'timestamp';
        timeDiv.textContent = getCurrentTime();

        messageContainer.appendChild(senderDiv);
        messageContainer.appendChild(contentDiv);
        messageContainer.appendChild(timeDiv);

        if (type === 'economista') {
            messageDiv.appendChild(messageContainer);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContainer);
        }

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < text.length) {
                contentDiv.textContent += text.charAt(index);
                index++;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } else {
                clearInterval(typingInterval);
                contentDiv.classList.remove('character-typing');
                
                debateHistory.push({
                    sender: sender,
                    text: text,
                    type: type,
                    timestamp: getCurrentTime()
                });
                
                if (callback) callback();
            }
        }, typingSpeed);
    }

    // Función para mostrar el indicador de escribiendo
    function showTypingIndicator(type) {
        const typingDiv = document.createElement('div');
        typingDiv.className = `message-with-avatar ${type}`;
        typingDiv.id = `${type}-typing`;

        const avatar = document.createElement('div');
        if (type === 'ambientalista') {
            avatar.className = 'avatar ambientalista-avatar';
            avatar.textContent = 'A';
        } else if (type === 'economista') {
            avatar.className = 'avatar economista-avatar';
            avatar.textContent = 'E';
        }

        const typingContainer = document.createElement('div');
        typingContainer.className = 'typing-indicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContainer.appendChild(dot);
        }

        if (type === 'ambientalista') {
            typingDiv.appendChild(avatar);
            typingDiv.appendChild(typingContainer);
        } else {
            typingDiv.appendChild(typingContainer);
            typingDiv.appendChild(avatar);
        }

        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Función para ocultar el indicador de escribiendo
    function hideTypingIndicator(type) {
        const indicator = document.getElementById(`${type}-typing`);
        if (indicator) {
            indicator.remove();
        }
    }

    // Función para mostrar un mensaje de error
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        chatContainer.appendChild(errorDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // FUNCIÓN PRINCIPAL CON GROQ API (CORREGIDA)
    async function callGroqAPI(prompt, persona) {
        try {
            console.log('Enviando solicitud a Groq API...');
            console.log('Persona:', persona.substring(0, 100) + '...');
            console.log('Prompt:', prompt.substring(0, 100) + '...');

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: persona
                        },
                        {
                            role: "user", 
                            content: `Responde de manera clara y completa pero en máximo 30 palabras.\n\n${prompt}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 100,
                    stream: false
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                
                if (response.status === 401) {
                    throw new Error('API key inválida. Obtén una nueva key en https://console.groq.com');
                } else if (response.status === 429) {
                    throw new Error('Límite de uso excedido. Intenta más tarde.');
                } else {
                    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
                }
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Formato de respuesta inesperado');
            }
            
            let texto = data.choices[0].message.content;
            texto = limitarPalabras(texto, 150);
            return texto;

        } catch (error) {
            console.error('Error calling Groq API:', error);
            throw error;
        }
    }

    // Función para obtener una respuesta contextual de la IA
    async function getAIResponse(type, context, userQuestion = null, isDebateMode = false) {
        let persona, prompt;
        
        if (isDebateMode) {
            persona = type === 'ambientalista' ? 
                "Eres un ambientalista experto. Argumenta en contra de la energía nuclear de manera convincente pero objetiva. Responde en español de forma natural." : 
                "Eres un economista especializado en energía. Defiende la energía nuclear de manera convincente pero insensible. Responde en español de forma natural.";
            
            const lastMessage = context.length > 0 ? context[context.length - 1] : null;
            const opponent = type === 'ambientalista' ? 'economista' : 'ambientalista';
            
            if (lastMessage && lastMessage.type === opponent) {
                prompt = `Responde al siguiente argumento del ${opponent}:\n\n"${lastMessage.text}"`;
            } else {
                prompt = "Inicia el debate sobre energía nuclear con un argumento sólido:";
            }
        } else {
            persona = type === 'ambientalista' ? 
                "Eres un ambientalista experto. Responde a la pregunta del usuario desde tu perspectiva ambientalista. Sé claro y conciso. Responde en español." : 
                "Eres un economista especializado pero quiero que seas arrogante y solo tengas en cuenta las ganancias y se un poco grosero. Responde a la pregunta del usuario desde tu perspectiva económica. Sé claro y conciso. Responde en español.";
            
            prompt = `El usuario pregunta: "${userQuestion}"`;
        }
        
        showTypingIndicator(type);
        
        try {
            const response = await callGroqAPI(prompt, persona);
            hideTypingIndicator(type);
            
            const sender = type === 'ambientalista' ? "Ambientalista" : "Economista";
            
            return new Promise(resolve => {
                addMessageWithTypingEffect(sender, response, type, () => {
                    resolve(response);
                });
            });
        } catch (error) {
            hideTypingIndicator(type);
            showError(`Error: ${error.message}`);
            throw error;
        }
    }

    // Función para iniciar el debate automático
    async function startDebate() {
        if (isDebateActive) return;
        
        isDebateActive = true;
        startBtn.disabled = true;
        startBtn.textContent = "Debate en curso...";
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        // Reiniciar el historial del debate
        debateHistory = [];
        chatContainer.innerHTML = '';
        
        addMessage("Sistema", `🎭 Iniciando debate sobre: ${currentTopic}`, 'system');
        
        try {
            await getAIResponse('ambientalista', debateHistory, null, true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            await getAIResponse('economista', debateHistory, null, true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            await getAIResponse('ambientalista', debateHistory, null, true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            await getAIResponse('economista', debateHistory, null, true);
            
            addMessage("Sistema", "✅ Debate concluido. ¡Ahora puedes hacer preguntas!", 'system');
            
        } catch (error) {
            console.error('Error en el debate:', error);
            addMessage("Sistema", "❌ Error en la conexión con Groq API.", 'system');
        } finally {
            isDebateActive = false;
            startBtn.disabled = false;
            startBtn.textContent = "Iniciar debate automático";
            userInput.disabled = false;
            sendBtn.disabled = false;
        }
    }

    // Función para enviar pregunta del usuario
    async function sendUserQuestion() {
        const question = userInput.value.trim();
        if (!question || isDebateActive) return;
        
        addMessage("Tú", question, 'user');
        userInput.value = '';
        
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await getAIResponse('ambientalista', debateHistory, question, false);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await getAIResponse('economista', debateHistory, question, false);
            
        } catch (error) {
            console.error('Error al procesar la pregunta:', error);
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    // Función para borrar el chat
    function clearChat() {
        if (isDebateActive) return;
        
        chatContainer.innerHTML = '';
        debateHistory = [];
        addMessage("Sistema", "💬 Chat borrado. ¿Sobre qué quieres debatir?", 'system');
    }

    // Inicialización
    function initializeChat() {
        apiStatus.textContent = "🔌 Conectando a Groq API...";
        apiStatus.style.color = "#ff9800";
        
        addMessage("Sistema", "🤖 ¡Bienvenido al Debate sobre Energía Nuclear!", 'system');
        addMessage("Sistema", "Haz clic en 'Iniciar debate automático' para comenzar.", 'system');
        
        setTimeout(() => {
            apiStatus.textContent = "✅ Groq API - Listo";
            apiStatus.style.color = "#128C7E";
        }, 2000);
    }

    // Event listeners
    startBtn.addEventListener('click', startDebate);
    clearBtn.addEventListener('click', clearChat);
    sendBtn.addEventListener('click', sendUserQuestion);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isDebateActive) {
            sendUserQuestion();
        }
    });
    
    // Inicializar al cargar
    window.addEventListener('load', function() {
        setTimeout(() => {
            initializeChat();
        }, 1000);
    });
});
