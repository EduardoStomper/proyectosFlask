// Overlay de chat en vivo
class ChatOverlay {
    constructor() {
        this.socket = null;
        this.serverUrl = 'ws://localhost:5000';
        this.maxMessages = 10;
        this.messages = [];
        
        this.init();
    }
    
    init() {
        this.connectWebSocket();
        this.setupElements();
        this.loadRecentMessages();
    }
    
    setupElements() {
        this.chatContainer = document.getElementById('chat-messages');
    }
    
    connectWebSocket() {
        try {
            this.socket = new WebSocket(this.serverUrl);
            
            this.socket.onopen = () => {
                console.log('Chat overlay conectado');
                // Suscribirse a eventos de chat
                this.socket.send(JSON.stringify({
                    type: 'subscribe',
                    channel: 'chat'
                }));
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.socket.onclose = () => {
                console.log('Chat overlay desconectado');
                setTimeout(() => this.connectWebSocket(), 3000);
            };
            
        } catch (error) {
            console.error('Error en chat overlay:', error);
            setTimeout(() => this.connectWebSocket(), 3000);
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'new_message':
                this.addMessage(data.message);
                break;
            case 'chat_history':
                this.loadMessages(data.messages);
                break;
        }
    }
    
    addMessage(message) {
        // Agregar nuevo mensaje
        this.messages.push(message);
        
        // Mantener solo los últimos N mensajes
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        
        // Actualizar la interfaz
        this.renderMessages();
        
        // Scroll automático
        this.scrollToBottom();
    }
    
    loadMessages(messages) {
        this.messages = messages.slice(-this.maxMessages);
        this.renderMessages();
    }
    
    renderMessages() {
        this.chatContainer.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.chatContainer.appendChild(messageElement);
        });
    }
    
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message fade-in';
        
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-user';
        userDiv.textContent = message.user || 'Usuario';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'chat-text';
        textDiv.textContent = message.text || '';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'chat-time';
        timeDiv.textContent = this.formatTime(message.timestamp);
        
        messageDiv.appendChild(userDiv);
        messageDiv.appendChild(textDiv);
        messageDiv.appendChild(timeDiv);
        
        return messageDiv;
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    loadRecentMessages() {
        // Cargar mensajes recientes del servidor
        fetch('http://localhost:5000/api/overlay/chat')
            .then(response => response.json())
            .then(data => {
                if (data.messages) {
                    this.loadMessages(data.messages);
                }
            })
            .catch(error => {
                console.log('No se pudieron cargar los mensajes:', error);
            });
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new ChatOverlay();
});