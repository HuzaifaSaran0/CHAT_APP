document.addEventListener('DOMContentLoaded', function () {
  // Check if user is logged in
  if (!localStorage.getItem('user')) {
    window.location.href = 'index.html';
    return;
  }

  // DOM elements
  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const scrollToBottomButton = document.getElementById('scroll-to-bottom');
  const statusElement = document.querySelector('.status');

  // Initial messages
  const initialMessages = [
    {
      id: "1",
      text: "Salut ! Comment ça va ?",
      sender: "bot",
      timestamp: "14:32",
    },
    {
      id: "2",
      text: "Ça va bien merci ! Et toi ?",
      sender: "user",
      timestamp: "14:33",
    },
    {
      id: "3",
      text: "Super ! Tu fais quoi de beau aujourd'hui ?",
      sender: "bot",
      timestamp: "14:33",
    },
    {
      id: "4",
      text: "Je travaille sur un nouveau projet, c'est passionnant !",
      sender: "user",
      timestamp: "14:35",
    },
    {
      id: "5",
      text: "Oh c'est génial ! Tu peux m'en dire plus ?",
      sender: "bot",
      timestamp: "14:36",
    },
  ];

  // State
  let messages = [...initialMessages];
  let isTyping = false;
  let shouldAutoScroll = true;

  // Render initial messages
  renderMessages();
  scrollToBottom();

  // Set up typing simulation
  setInterval(simulateTyping, 10000);

  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  scrollToBottomButton.addEventListener('click', scrollToBottom);

  messagesContainer.addEventListener('scroll', handleScroll);

  // Back button
  document.querySelector('.back-button').addEventListener('click', function () {
    window.location.href = 'index.html';
  });

  // Functions
  // ... (inside your document.addEventListener('DOMContentLoaded', function() { ... });

  function renderMessages() {
    messagesContainer.innerHTML = '';

    messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `message message-${message.sender}`;

      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      messageContent.textContent = message.text;

      const messageTime = document.createElement('div');
      messageTime.className = 'message-time';
      messageTime.textContent = message.timestamp;

      // --- IMPORTANT CHANGE HERE: Revert to sibling append ---
      messageElement.appendChild(messageContent); // Append content first
      messageElement.appendChild(messageTime);    // Then append time as a sibling

      messagesContainer.appendChild(messageElement);
    });

    if (isTyping) {
      renderTypingIndicator();
    }

    if (shouldAutoScroll) {
      setTimeout(scrollToBottom, 100);
    }
  }

  // ... rest of your JavaScript

  function renderTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'typing-indicator';

    const typingContent = document.createElement('div');
    typingContent.className = 'typing-dots';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      typingContent.appendChild(dot);
    }

    typingElement.appendChild(typingContent);
    messagesContainer.appendChild(typingElement);
  }

  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp,
    };

    messages.push(newMessage);
    renderMessages();
    messageInput.value = '';
    shouldAutoScroll = true;
    scrollToBottom();

    // Simulate bot response
    setTimeout(() => {
      isTyping = true;
      statusElement.textContent = 'en train d\'écrire...';
      renderMessages();
      scrollToBottom();

      setTimeout(() => {
        const responses = [
          "C'est intéressant ! 😊",
          "Raconte-moi en plus !",
          "J'adore quand tu me parles de ça 💕",
          "Tu es passionnant !",
          "Continue, je t'écoute... 😘",
          "Mmm, dis-moi tout... 🥰",
          "Tu me fais rêver ! ✨",
          "J'ai hâte d'en savoir plus 💋",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseTime = new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        messages.push({
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: "bot",
          timestamp: responseTime,
        });

        isTyping = false;
        statusElement.textContent = 'en ligne';
        renderMessages();
        scrollToBottom();
      }, 1500 + Math.random() * 2000);
    }, 500);
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    scrollToBottomButton.style.display = 'none';
  }

  function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isAtBottom) {
      scrollToBottomButton.style.display = 'none';
      shouldAutoScroll = true;
    } else {
      scrollToBottomButton.style.display = 'flex';
      shouldAutoScroll = false;
    }
  }

  function simulateTyping() {
    if (Math.random() > 0.7) { // 30% chance
      isTyping = true;
      statusElement.textContent = 'en train d\'écrire...';
      renderMessages();
      scrollToBottom();

      setTimeout(() => {
        isTyping = false;
        statusElement.textContent = 'en ligne';
        renderMessages();
      }, 2000 + Math.random() * 3000);
    }
  }
});