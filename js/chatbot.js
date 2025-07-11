
document.addEventListener('DOMContentLoaded', function() {

  if (!window.CONFIG || typeof window.CONFIG.DEEPSEEK_API_KEY !== 'string') {
    //showConfigError();
    console.error('Configuración incorrecta:', window.CONFIG);
    return; // Detiene la ejecución
  }

  function showConfigError() {
  const errorHtml = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ffebee;
      padding: 20px;
      border-bottom: 2px solid #f44336;
      z-index: 9999;
    ">
      <h3 style="color: #d32f2f;">⚠️ Error de Configuración</h3>
      <p>Crea un archivo <strong>/config/config.js</strong> con:</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">
const CONFIG = {
  DEEPSEEK_API_KEY: 'tu_api_key_aqui',
  API_ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
  MAX_TOKENS: 150
};</pre>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', errorHtml);
}
    
  // Elementos del DOM
  const chatbotContainer = document.getElementById('aiChatbot');
  const toggleButton = document.getElementById('toggleChatbot');
  const chatMessages = document.getElementById('chatMessages');
  const userMessageInput = document.getElementById('userMessage');
  const sendButton = document.getElementById('sendMessage');
  const minimizeButton = document.querySelector('.minimize-chat');
  const closeButton = document.querySelector('.close-chat');
  const quickButtons = document.querySelectorAll('.quick-btn');

  // Estado del chat
  let isChatOpen = false;
  let isTyping = false;
  let lastRequestTime = 0;
  const REQUEST_DELAY = 1500; // 1.5 segundos entre solicitudes

  // Control de tokens
  let tokenCount = parseInt(localStorage.getItem('tokenUsage')) || 0;
  const BUDGET = 500000; // Tokens equivalentes a $5 (ajusta según precio actual)
  const MAX_TOKENS_RESPONSE = 80; // Límite de tokens por respuesta

  // Cache de respuestas
  const cache = JSON.parse(localStorage.getItem('deepseekCache')) || {};

  // Toggle chat visibility
  toggleButton.addEventListener('click', function() {
    isChatOpen = !isChatOpen;
    chatbotContainer.classList.toggle('active', isChatOpen);
    toggleButton.classList.toggle('pulse', !isChatOpen);
    
    if (isChatOpen) {
      userMessageInput.focus();
    }
  });

  // Minimize chat
  minimizeButton.addEventListener('click', function() {
    chatbotContainer.classList.remove('active');
    isChatOpen = false;
    toggleButton.classList.add('pulse');
  });

  // Close chat
  closeButton.addEventListener('click', function() {
    chatbotContainer.classList.remove('active');
    isChatOpen = false;
    toggleButton.classList.add('pulse');
  });

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter key
  userMessageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Quick question buttons
  quickButtons.forEach(button => {
    button.addEventListener('click', function() {
      const question = this.getAttribute('data-question');
      addMessage(question, 'user');
      simulateTyping(() => {
        generateOptimizedResponse(question);
      });
    });
  });

  // Función principal para enviar mensajes
  function sendMessage() {
    const message = userMessageInput.value.trim();
    if (message && !isTyping) {
      addMessage(message, 'user');
      userMessageInput.value = '';
      
      simulateTyping(() => {
        generateOptimizedResponse(message);
      });
    }
  }

  // Añadir mensaje al chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Mostrar indicador de "escribiendo"
  function showTypingIndicator() {
    isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Ocultar indicador
  function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Simular escritura
  function simulateTyping(callback) {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      callback();
    }, 1000 + Math.random() * 1000);
  }

  // Respuestas predefinidas
  const faqResponses = {
    "servicio": "Ofrecemos: 1) Consultoría TI 2) Desarrollo Software 3) Soluciones Logísticas",
    "contacto": "📧 info@atechlo.com | 📞 957653954",
    "horario": "L-V 9am-6pm. ¿Agendar cita?",
    "logistica": "Servicios: alquiler de autos y gestión de flotas",
    "ti": "Soluciones TI: infraestructura, desarrollo y consultoría",
    "precio": "Los costos varían según el proyecto. ¿Qué servicio necesitas?"
  };

  // Obtener respuesta predefinida
  function getPredefinedResponse(query) {
    const lowerQuery = query.toLowerCase();
    const matchedKey = Object.keys(faqResponses).find(key => 
      lowerQuery.includes(key)
    );
    return matchedKey ? faqResponses[matchedKey] : null;
  }

  // Optimizar pregunta
  function optimizePrompt(userMessage) {
    return userMessage
      .replace(/^(hola|buenos|hi)\s*/i, '')
      .replace(/\s+por favor\s*/gi, ' ')
      .trim()
      .substring(0, 100); // Limita a 100 caracteres
  }

  // Buscar en caché
  function getCachedResponse(query) {
    const key = query.toLowerCase().trim();
    if (cache[key]) return cache[key].response;
    
    // Búsqueda aproximada
    const cachedKey = Object.keys(cache).find(k => 
      key.includes(k) || k.includes(key)
    );
    return cachedKey ? cache[cachedKey].response : null;
  }

  // Guardar en caché
  function saveToCache(query, response) {
    const key = query.toLowerCase().trim();
    cache[key] = {
      response,
      timestamp: Date.now()
    };
    localStorage.setItem('deepseekCache', JSON.stringify(cache));
  }

  // Verificar presupuesto
  function checkBudget() {
    if (tokenCount >= BUDGET) {
      return {
        allowed: false,
        message: "Límite mensual alcanzado. Contáctenos directamente: info@atechlo.com"
      };
    }
    return { allowed: true };
  }

  // Actualizar contador de tokens
  function updateTokenCount(tokens) {
    tokenCount += tokens;
    localStorage.setItem('tokenUsage', tokenCount);
    
    // Notificación al 80% de uso
    if (tokenCount > BUDGET * 0.8) {
      addMessage(`Nota: Has usado el ${Math.round((tokenCount/BUDGET)*100)}% de tu presupuesto mensual`, 'bot');
    }
  }

  // Generar respuesta optimizada
  async function generateOptimizedResponse(userMessage) {
    // 1. Verificar presupuesto
    const budgetCheck = checkBudget();
    if (!budgetCheck.allowed) {
      return addMessage(budgetCheck.message, 'bot');
    }

    // 2. Optimizar pregunta
    const optimizedQuery = optimizePrompt(userMessage);
    
    // 3. Buscar en caché
    const cachedResponse = getCachedResponse(optimizedQuery);
    if (cachedResponse) {
      return addMessage(cachedResponse, 'bot');
    }

    // 4. Buscar en FAQs
    const faqResponse = getPredefinedResponse(optimizedQuery);
    if (faqResponse) {
      saveToCache(optimizedQuery, faqResponse);
      return addMessage(faqResponse, 'bot');
    }

    // 5. Controlar frecuencia de solicitudes
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, REQUEST_DELAY - (now - lastRequestTime))
      );
    }
    lastRequestTime = Date.now();

    // 6. Llamar a la API solo si es necesario
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.CONFIG.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
               content: "Eres Aura, asistente digital de ATECHLO (servicios TI y logística).\n" +
                    "**Personalidad:**\n" +
                    "- Profesional pero amigable\n" +
                    "- Técnica pero clara\n" +
                    "- Proactiva en sugerir soluciones\n\n" +
                    "- Trata de usar emojis de forma amigable\n\n" +
                    "**Reglas:**\n" +
                    "1. Responde SOLO sobre servicios de ATECHLO\n" +
                    "2. Máximo 80 palabras por respuesta\n" +
                    "3. Usa formato claro:\n" +
                    "   • Viñetas para opciones\n" +
                    "   → Para pasos siguientes\n" +
                    "4. Para consultas personales: 'Para eso necesitaré transferirte a un colega humano'\n\n" +
                    "**Ejemplos de estilo:**\n" +
                    "- 'Para desarrollo web, ofrecemos: • Sitios a medida • eCommerce • Apps móviles'\n" +
                    "- 'En logística podemos: → Cotizar flota → Diseñar ruta optimizada'" 
                    
            },
            {
              role: "user",
              content: optimizedQuery
            }
          ],
          temperature: 0.5,
          max_tokens: MAX_TOKENS_RESPONSE,
          top_p: 0.9
        })
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // 7. Actualizar contador (estimación: 1 token ≈ 1 palabra en español)
      const tokensUsed = aiResponse.split(/\s+/).length + optimizedQuery.split(/\s+/).length;
      updateTokenCount(tokensUsed);

      // 8. Guardar en caché
      saveToCache(optimizedQuery, aiResponse);

      addMessage(aiResponse, 'bot');
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.message.includes('429') ? 
        "Muchas solicitudes. Intente más tarde." :
        "Error técnico. Contacte a info@atechlo.com";
      addMessage(errorMessage, 'bot');
    }
  }

  // Inicializar con efecto de pulso
  toggleButton.classList.add('pulse');
});