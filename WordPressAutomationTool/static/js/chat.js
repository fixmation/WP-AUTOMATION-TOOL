document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat elements
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendMessageBtn');

    // If any elements are missing, don't initialize
    if (!chatForm || !messageInput || !chatMessages || !sendButton) {
        console.error('Chat elements not found');
        return;
    }

    // Submit the chat form
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const message = messageInput.value.trim();
        if (!message) return;

        // Disable the send button and show loading indicator
        sendButton.disabled = true;
        sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        // Add user message to chat
        addMessage('user', message);

        // Create loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai';
        loadingDiv.id = 'loading-message';
        loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Clear input
        messageInput.value = '';

        // Send message to API
        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        })
        .then(response => {
            // Check if we need to redirect to login
            if (response.redirected) {
                window.location.href = response.url;
                return null;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    // Unauthorized, redirect to login
                    window.location.href = '/login?next=/chat';
                    throw new Error('Please log in to continue chatting');
                }
                throw new Error('Network response was not ok');
            }

            return response.json();
        })
        .then(data => {
            if (!data) return; // Handle redirect case

            // Remove loading indicator
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            // Add AI response to chat
            addMessage('ai', data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            // Remove loading indicator
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            // Add error message
            if (error.message === 'Please log in to continue chatting') {
                addMessage('system', 'Please log in to continue chatting and save your conversation history.');
            } else {
                addMessage('ai', 'Sorry, there was an error processing your request.');
            }
        })
        .finally(() => {
            // Re-enable send button
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        });
    });

    function addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        // Process markdown links [text](url) in the message
        const processedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, linkText, url) {
            // For internal links that don't start with http
            if (!url.startsWith('http')) {
                return `<a href="${url}" class="chat-link">${linkText}</a>`;
            }
            // For external links
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${linkText}</a>`;
        });

        messageDiv.innerHTML = processedText;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Make all links in the message clickable
        const links = messageDiv.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                if (!this.getAttribute('target')) {
                    e.preventDefault();
                    window.location.href = this.getAttribute('href');
                }
            });
        });
    }
});