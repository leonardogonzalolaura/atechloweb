
document.addEventListener('DOMContentLoaded', function () {

  // Elementos del DOM
  const chatbotContainer = document.getElementById('aiChatbot');
  const toggleButton = document.getElementById('toggleChatbot');
  const chatMessages = document.getElementById('chatMessages');
  const userMessageInput = document.getElementById('userMessage');
  const sendButton = document.getElementById('sendMessage');
  const quickButtons = document.querySelectorAll('.quick-btn');

  // Estado del chat
  let isChatOpen = false;
  let isTyping = false;
  let lastRequestTime = 0;
  const REQUEST_DELAY = 1000;

  // Toggle chat visibility
  toggleButton.addEventListener('click', function () {
    isChatOpen = !isChatOpen;
    chatbotContainer.classList.toggle('active', isChatOpen);

    if (isChatOpen) {
      userMessageInput.focus();
    }
  });

  // Minimizar o cerrar con botones si existen (opcional en nuevo diseño)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.minimize-chat') || e.target.closest('.close-chat')) {
      chatbotContainer.classList.remove('active');
      isChatOpen = false;
    }
  });

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter key
  userMessageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Quick question buttons
  quickButtons.forEach(button => {
    button.addEventListener('click', function () {
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

  // Parsear texto para detectar enlaces y emails
  function formatText(text) {
    // Escapar HTML básico para seguridad
    let escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Auto-link URLs
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    escaped = escaped.replace(urlPattern, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');

    // Auto-link Emails
    const emailPattern = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/g;
    escaped = escaped.replace(emailPattern, '<a href="mailto:$1" style="color: inherit; text-decoration: underline;">$1</a>');

    return escaped;
  }

  // Añadir mensaje al chat con estructura mejorada y timestamp
  function addMessage(text, sender) {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    messageDiv.innerHTML = `
        <div class="message-content">
            ${formatText(text)}
        </div>
        <div class="message-time">${timeStr}</div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Simular escritura más natural
  function simulateTyping(callback) {
    isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing');
    typingDiv.innerHTML = `
      <div class="message-content" style="padding: 10px 15px; display: flex; gap: 4px;">
        <span class="dot" style="width:6px; height:6px; background:#94a3b8; border-radius:50%; animation: pulse 1.5s infinite 0s"></span>
        <span class="dot" style="width:6px; height:6px; background:#94a3b8; border-radius:50%; animation: pulse 1.5s infinite 0.2s"></span>
        <span class="dot" style="width:6px; height:6px; background:#94a3b8; border-radius:50%; animation: pulse 1.5s infinite 0.4s"></span>
      </div>
    `;

    // Añadir estilo de animación si no existe
    if (!document.getElementById('ai-typing-style')) {
      const style = document.createElement('style');
      style.id = 'ai-typing-style';
      style.innerHTML = `@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`;
      document.head.appendChild(style);
    }

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const delay = 800 + Math.random() * 1000;
    setTimeout(() => {
      typingDiv.remove();
      isTyping = false;
      callback();
    }, delay);
  }

  // Respuestas predefinidas optimizadas
  const faqResponses = {
    "servicio": "Ofrecemos: \n• Consultoría TI estratégica\n• Desarrollo de Software a medida\n• Soluciones Logísticas eficientes\n\n¿Deseas más detalles sobre alguno?",
    "contacto": "Puedes contactarnos vía:\n📧 info@atechlo.com\n📞 +51 999 999 999\n📍 Lima, Perú",
    "horario": "Nuestro horario de atención es de Lunes a Viernes de 9:00 AM a 6:00 PM.",
    "precio": "Nuestros proyectos son personalizados. Para darte una cotización exacta, ¿podrías enviarnos un correo a info@atechlo.com?"
  };

  async function generateOptimizedResponse(userMessage) {
    const lowerQuery = userMessage.toLowerCase();

    // 1. Verificar FAQs internas
    const matchedKey = Object.keys(faqResponses).find(key => lowerQuery.includes(key));
    if (matchedKey) {
      return addMessage(faqResponses[matchedKey], 'bot');
    }

    // 2. Llamar a la API real (Simulada si falla)
    try {
      const response = await fetch('https://atechlo.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      addMessage(data.response, 'bot');
    } catch (error) {
      // Respuesta de respaldo si la API no está disponible
      addMessage("¡Excelente pregunta! Para darte una respuesta detallada sobre ese tema, te sugiero conversar con nuestro equipo técnico en info@atechlo.com. ¿Te gustaría saber algo más?", 'bot');
    }
  }
});