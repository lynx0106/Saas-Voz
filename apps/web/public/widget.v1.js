(function() {
  // Configuration
  const agentId = window.voiceAgentId;
  if (!agentId) {
    console.error('Voice AI Widget: agentId not found.');
    return;
  }
  
  const config = window.voiceAgentConfig || {};
  const primaryColor = config.color || '#0f172a';
  const title = config.title || 'Asistente Virtual';
  const welcomeMessage = config.welcome || '¡Hola! ¿En qué puedo ayudarte?';
  const enableVoice = config.enableVoice !== undefined ? config.enableVoice : true;
  
  // Determine API URL based on script location
  let baseUrl = '';
  try {
      if (document.currentScript) {
          baseUrl = new URL(document.currentScript.src).origin;
      } else {
          baseUrl = window.location.origin; 
      }
  } catch (e) {
      baseUrl = window.location.origin;
  }
  
  const API_URL = `${baseUrl}/api/widget/chat`;
  const TTS_URL = `${baseUrl}/api/tts`;

  // Create Container
  const container = document.createElement('div');
  container.id = 'voice-agent-widget-container';
  document.body.appendChild(container);
  
  // Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });
  
  // Styles
  const style = document.createElement('style');
  style.textContent = `
    :host {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
    }
    .button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${primaryColor};
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .button:hover {
      transform: scale(1.1);
    }
    .button svg {
      width: 32px;
      height: 32px;
      fill: white;
    }
    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 600px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
      transform-origin: bottom right;
      transition: all 0.3s ease;
      opacity: 0;
      transform: scale(0.95);
    }
    .chat-window.open {
      display: flex;
      opacity: 1;
      transform: scale(1);
    }
    .header {
      background-color: ${primaryColor};
      color: white;
      padding: 16px 20px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 24px;
        line-height: 1;
        padding: 0;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    .close-btn:hover {
        opacity: 1;
    }
    .messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    .message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 15px;
      line-height: 1.5;
      position: relative;
      word-wrap: break-word;
    }
    .message.user {
      align-self: flex-end;
      background-color: ${primaryColor};
      color: white;
      border-bottom-right-radius: 2px;
    }
    .message.assistant {
      align-self: flex-start;
      background-color: white;
      color: #1f2937;
      border-bottom-left-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid #e5e7eb;
    }
    .input-area {
      padding: 16px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
      background: white;
      align-items: center;
    }
    input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      outline: none;
      font-size: 15px;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: ${primaryColor};
    }
    button.icon-btn {
      background-color: transparent;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      color: #64748b;
    }
    button.icon-btn:hover {
        background-color: #f1f5f9;
        color: ${primaryColor};
    }
    button.icon-btn.active {
        color: #ef4444;
        background-color: #fee2e2;
        animation: pulse 1.5s infinite;
    }
    button.send {
      background-color: ${primaryColor};
      color: white;
    }
    button.send:hover {
        background-color: ${primaryColor};
        opacity: 0.9;
        color: white;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    
    /* Scrollbar */
    .messages::-webkit-scrollbar {
      width: 6px;
    }
    .messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .messages::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.1);
      border-radius: 3px;
    }
  `;
  shadow.appendChild(style);
  
  // HTML Structure
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="chat-window">
      <div class="header">
        <span>${title}</span>
        <button class="close-btn" aria-label="Cerrar chat">×</button>
      </div>
      <div class="messages">
        <div class="message assistant">${welcomeMessage}</div>
      </div>
      <div class="input-area">
        <button class="icon-btn mic" aria-label="Hablar">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </button>
        <input type="text" placeholder="Escribe un mensaje..." />
        <button class="icon-btn send" aria-label="Enviar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
      </div>
    </div>
    <div class="button" aria-label="Abrir chat">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
    </div>
  `;
  shadow.appendChild(wrapper);
  
  // Logic
  const button = wrapper.querySelector('.button');
  const chatWindow = wrapper.querySelector('.chat-window');
  const closeBtn = wrapper.querySelector('.close-btn');
  const input = wrapper.querySelector('input');
  const sendBtn = wrapper.querySelector('.send');
  const micBtn = wrapper.querySelector('.mic');
  const messagesDiv = wrapper.querySelector('.messages');
  
  let isOpen = false;
  let messages = []; 
  let isRecording = false;
  let recognition = null;
  let audioQueue = [];
  let isPlaying = false;

  // Initialize Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES'; // Default to Spanish, could be configurable
      
      recognition.onstart = () => {
          isRecording = true;
          micBtn.classList.add('active');
          input.placeholder = "Escuchando...";
      };
      
      recognition.onend = () => {
          isRecording = false;
          micBtn.classList.remove('active');
          input.placeholder = "Escribe un mensaje...";
      };
      
      recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          input.value = transcript;
          sendMessage(true); // Send immediately and enable voice response
      };
      
      recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          isRecording = false;
          micBtn.classList.remove('active');
      };
  } else {
      micBtn.style.display = 'none'; // Hide if not supported
  }

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
        chatWindow.classList.add('open');
        input.focus();
    } else {
        chatWindow.classList.remove('open');
    }
  }
  
  function toggleRecording() {
      if (!recognition) return;
      
      if (isRecording) {
          recognition.stop();
      } else {
          recognition.start();
      }
  }
  
  button.addEventListener('click', toggle);
  closeBtn.addEventListener('click', toggle);
  micBtn.addEventListener('click', toggleRecording);
  
  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = content;
    messagesDiv.appendChild(div);
    requestAnimationFrame(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
    messages.push({ role, content });
  }
  
  async function playAudio(text) {
      try {
          const response = await fetch(TTS_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  text: text,
                  agentId: agentId
              })
          });
          
          if (!response.ok) throw new Error('TTS failed');
          
          // Check if we should use browser fallback
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              if (data.use_browser_tts) {
                   speakBrowser(text);
                   return;
              }
          }
          
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
          };
          
          audio.play();
          
      } catch (error) {
          console.warn('TTS API Error, falling back to browser:', error);
          speakBrowser(text);
      }
  }
  
  function speakBrowser(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
  }
  
  async function sendMessage(useVoice = false) {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage('user', text);
    input.value = '';
    sendBtn.disabled = true;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: agentId,
                messages: messages
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
             addMessage('assistant', 'Error: ' + data.error);
        } else {
             addMessage('assistant', data.content);
             // If triggered by voice, or if we decide to always speak:
             if (useVoice) {
                 playAudio(data.content);
             }
        }
        
    } catch (err) {
        console.error(err);
        addMessage('assistant', 'Lo siento, hubo un error de conexión. Intenta de nuevo.');
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
  }
  
  sendBtn.addEventListener('click', () => sendMessage(false));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(false);
  });
  
})();
