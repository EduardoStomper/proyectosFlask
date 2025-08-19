// Overlay de alertas y notificaciones
class AlertsOverlay {
    constructor() {
        this.socket = null;
        this.serverUrl = 'ws://localhost:5000';
        this.currentAlert = null;
        this.alertQueue = [];
        this.isShowingAlert = false;
        
        this.init();
    }
    
    init() {
        this.connectWebSocket();
        this.setupElements();
    }
    
    setupElements() {
        this.alertBox = document.getElementById('alert-box');
        this.alertTitle = document.getElementById('alert-title');
        this.alertMessage = document.getElementById('alert-message');
        this.alertIcon = document.querySelector('.alert-icon');
    }
    
    connectWebSocket() {
        try {
            this.socket = new WebSocket(this.serverUrl);
            
            this.socket.onopen = () => {
                console.log('Alerts overlay conectado');
                // Suscribirse a eventos de alertas
                this.socket.send(JSON.stringify({
                    type: 'subscribe',
                    channel: 'alerts'
                }));
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleAlert(data);
            };
            
            this.socket.onclose = () => {
                console.log('Alerts overlay desconectado');
                setTimeout(() => this.connectWebSocket(), 3000);
            };
            
        } catch (error) {
            console.error('Error en alerts overlay:', error);
            setTimeout(() => this.connectWebSocket(), 3000);
        }
    }
    
    handleAlert(data) {
        switch (data.type) {
            case 'alert':
                this.queueAlert(data);
                break;
            case 'clear_alerts':
                this.clearAllAlerts();
                break;
        }
    }
    
    queueAlert(alertData) {
        this.alertQueue.push(alertData);
        
        if (!this.isShowingAlert) {
            this.showNextAlert();
        }
    }
    
    showNextAlert() {
        if (this.alertQueue.length === 0) {
            this.isShowingAlert = false;
            return;
        }
        
        this.isShowingAlert = true;
        const alert = this.alertQueue.shift();
        
        this.displayAlert(alert);
    }
    
    displayAlert(alert) {
        // Configurar contenido de la alerta
        this.alertTitle.textContent = alert.title || 'ALERTA';
        this.alertMessage.textContent = alert.message || '';
        this.alertIcon.textContent = alert.icon || '🎉';
        
        // Aplicar estilo personalizado si existe
        if (alert.style) {
            this.applyCustomStyle(alert.style);
        }
        
        // Mostrar la alerta
        this.alertBox.style.display = 'block';
        this.alertBox.classList.add('fade-in');
        
        // Reproducir sonido si está configurado
        if (alert.sound) {
            this.playAlertSound(alert.sound);
        }
        
        // Ocultar después del tiempo especificado
        const duration = alert.duration || 5000;
        setTimeout(() => {
            this.hideAlert();
        }, duration);
    }
    
    hideAlert() {
        this.alertBox.classList.remove('fade-in');
        this.alertBox.style.display = 'none';
        
        // Resetear estilos personalizados
        this.resetCustomStyle();
        
        // Mostrar siguiente alerta si existe
        setTimeout(() => {
            this.showNextAlert();
        }, 500);
    }
    
    applyCustomStyle(style) {
        if (style.backgroundColor) {
            this.alertBox.style.background = style.backgroundColor;
        }
        if (style.textColor) {
            this.alertBox.style.color = style.textColor;
        }
        if (style.borderColor) {
            this.alertBox.style.borderColor = style.borderColor;
        }
    }
    
    resetCustomStyle() {
        this.alertBox.style.background = '';
        this.alertBox.style.color = '';
        this.alertBox.style.borderColor = '';
    }
    
    playAlertSound(soundUrl) {
        try {
            const audio = new Audio(soundUrl);
            audio.volume = 0.5;
            audio.play();
        } catch (error) {
            console.log('No se pudo reproducir el sonido:', error);
        }
    }
    
    clearAllAlerts() {
        this.alertQueue = [];
        this.hideAlert();
    }
    
    // Métodos para tipos específicos de alertas
    showScoreAlert(team, score) {
        this.queueAlert({
            title: '¡GOL!',
            message: `${team} marca - ${score}`,
            icon: '⚽',
            duration: 3000,
            style: {
                backgroundColor: 'linear-gradient(135deg, #00ff00, #00cc00)',
                textColor: '#ffffff'
            }
        });
    }
    
    showRoundAlert(round) {
        this.queueAlert({
            title: 'NUEVA RONDA',
            message: `Comienza ${round}`,
            icon: '🎯',
            duration: 4000,
            style: {
                backgroundColor: 'linear-gradient(135deg, #ffaa00, #ff8800)',
                textColor: '#ffffff'
            }
        });
    }
    
    showGameOverAlert(winner) {
        this.queueAlert({
            title: '¡JUEGO TERMINADO!',
            message: `Ganador: ${winner}`,
            icon: '🏆',
            duration: 8000,
            style: {
                backgroundColor: 'linear-gradient(135deg, #ffd700, #ffb300)',
                textColor: '#000000'
            }
        });
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new AlertsOverlay();
});