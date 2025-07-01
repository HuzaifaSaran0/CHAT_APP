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

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  function initAudioPlayer(audio, player) {
    const playBtn = player.querySelector('.play-btn');
    const playIcon = player.querySelector('.play-icon');
    const pauseIcon = player.querySelector('.pause-icon');
    const progress = player.querySelector('.progress');
    const progressBar = player.querySelector('.progress-bar');
    const currentTimeEl = player.querySelector('.current-time');
    const durationEl = player.querySelector('.duration');
    const volumeBtn = player.querySelector('.volume-btn');
    const volumeSlider = player.querySelector('.volume-slider');
    const speedBtn = player.querySelector('.speed-btn');
    const speedOptions = player.querySelectorAll('.speed-options button');

    // Play/pause toggle
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    });

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
      const { currentTime, duration } = audio;
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    });

    // Set progress on click
    progressBar.addEventListener('click', (e) => {
      const width = progressBar.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;
      audio.currentTime = (clickX / width) * duration;
    });

    // Update duration display when metadata loads
    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    // Reset when audio ends
    audio.addEventListener('ended', () => {
      progress.style.width = '0%';
      currentTimeEl.textContent = '0:00';
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    });

    // Volume control
    volumeBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      volumeBtn.querySelector('svg path').setAttribute(
        'd',
        audio.muted ? 'M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53L15.27,18.5L12,15.23L8.73,18.5L7.73,17.5L12,13.23V8.27L4.27,3Z' :
          'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z'
      );
    });

    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value;
      audio.muted = volumeSlider.value == 0;
    });

    // Speed control
    speedOptions.forEach(option => {
      option.addEventListener('click', () => {
        audio.playbackRate = parseFloat(option.dataset.speed);
        speedBtn.textContent = `${option.dataset.speed}x`;
      });
    });
  }
  function renderMessages() {
    messagesContainer.innerHTML = '';

    messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `message message-${message.sender}`;

      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      const text = message.text.trim();
      const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp))$/i;
      const audioRegex = /(https?:\/\/.*\.(?:mp3|wav|ogg|m4a))$/i;

      if (imageRegex.test(text)) {
        const img = document.createElement('img');
        img.src = text;
        img.alt = "Image";
        img.className = "chat-image";
        img.onclick = () => window.open(text, '_blank');
        messageContent.appendChild(img);
      } 
      else if (audioRegex.test(text)) {
        const wrapper = document.createElement('div');
        wrapper.className = 'audio-player';

        const audio = document.createElement('audio');
        audio.src = text;
        audio.className = 'audio-element';

        // Player container
        const player = document.createElement('div');
        player.className = 'player-container';

        // Play/pause button
        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.innerHTML = `
          <svg class="play-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
          </svg>
          <svg class="pause-icon" viewBox="0 0 24 24" style="display:none">
            <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/>
          </svg>
        `;

        // Progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const progress = document.createElement('div');
        progress.className = 'progress';

        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.innerHTML = `
          <span class="current-time">0:00</span> / <span class="duration">0:00</span>
        `;

        progressBar.appendChild(progress);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(timeDisplay);

        // Controls container
        const controls = document.createElement('div');
        controls.className = 'player-controls';

        // Volume control
        const volumeControl = document.createElement('div');
        volumeControl.className = 'volume-control';
        volumeControl.innerHTML = `
          <button class="volume-btn">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
            </svg>
          </button>
          <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="1">
        `;

        // Speed control
        const speedControl = document.createElement('div');
        speedControl.className = 'speed-control';
        speedControl.innerHTML = `
          <button class="speed-btn">1x</button>
          <div class="speed-options">
            <button data-speed="0.5">0.5x</button>
            <button data-speed="1">1x</button>
            <button data-speed="1.5">1.5x</button>
            <button data-speed="2">2x</button>
          </div>
        `;

        controls.appendChild(volumeControl);
        controls.appendChild(speedControl);

        player.appendChild(playBtn);
        player.appendChild(progressContainer);
        player.appendChild(controls);

        wrapper.appendChild(audio);
        wrapper.appendChild(player);
        messageContent.appendChild(wrapper);

        // Initialize player functionality
        initAudioPlayer(audio, player);
      } 
      else {
        messageContent.textContent = text;
      }

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
