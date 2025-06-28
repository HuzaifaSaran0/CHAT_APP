document.addEventListener('DOMContentLoaded', function () {
  if (!window.user || !window.user.email) {
    window.location.href = window.loginUrl;
    return;
  }


  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const scrollToBottomButton = document.getElementById('scroll-to-bottom');
  const statusElement = document.querySelector('.status');

  let messages = window.initialMessages || [];
  let isTyping = false;
  let shouldAutoScroll = true;

  renderMessages();
  scrollToBottom();
  setInterval(simulateTyping, 10000);

  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  scrollToBottomButton.addEventListener('click', scrollToBottom);

  messagesContainer.addEventListener('scroll', handleScroll);

  document.querySelector('.back-button').addEventListener('click', function () {
    window.location.href = window.loginUrl;
  });

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

      messageElement.appendChild(messageContent);
      messageElement.appendChild(messageTime);
      messagesContainer.appendChild(messageElement);
    });

    if (isTyping) renderTypingIndicator();

    if (shouldAutoScroll) setTimeout(scrollToBottom, 100);
  }

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

    // Show typing indicator
    isTyping = true;
    statusElement.textContent = 'en train d\'écrire...';
    renderMessages();
    scrollToBottom();

    // Send message to backend
    fetch(window.location.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': window.csrfToken
      },
      body: `message=${encodeURIComponent(text)}`
    })
      .then(response => response.json())
      .then(data => {
        if (data.reply) {
          const responseTime = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          messages.push({
            id: (Date.now() + 1).toString(),
            text: data.reply,
            sender: "bot",
            timestamp: responseTime,
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        messages.push({
          id: (Date.now() + 1).toString(),
          text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      })
      .finally(() => {
        isTyping = false;
        statusElement.textContent = 'en ligne';
        renderMessages();
        scrollToBottom();
      });
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    scrollToBottomButton.style.display = 'none';
  }

  function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    scrollToBottomButton.style.display = isAtBottom ? 'none' : 'flex';
    shouldAutoScroll = isAtBottom;
  }

  function simulateTyping() {
    if (Math.random() > 0.7) {
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
