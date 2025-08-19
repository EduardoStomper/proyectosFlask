// Configuración del overlay de marcador
class ScoreboardOverlay {
    constructor() {
        this.socket = null;
        this.serverUrl = 'ws://localhost:5000';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        
        this.init();
    }
    
    init() {
        this.connectWebSocket();
        this.setupElements();
        this.loadInitialData();
    }
    
    setupElements() {
        this.elements = {
            team1Name: document.getElementById('team1-name'),
            team1Score: document.getElementById('team1-score'),
            team2Name: document.getElementById('team2-name'),
            team2Score: document.getElementById('team2-score'),
            roundInfo: document.getElementById('round-info'),
            timer: document.getElementById('timer')
        };
    }
    
    connectWebSocket() {
        try {
            this.socket = new WebSocket(this.serverUrl);
            
            this.socket.onopen = () => {
                console.log('Conectado al servidor WebSocket');
                this.reconnectAttempts = 0;
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleUpdate(data);
            };
            
            this.socket.onclose = () => {
                console.log('Conexión WebSocket cerrada');
                this.attemptReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('Error WebSocket:', error);
            };
        } catch (error) {
            console.error('Error al conectar WebSocket:', error);
            this.attemptReconnect();
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectWebSocket();
            }, this.reconnectDelay);
        }
    }
    
    handleUpdate(data) {
        switch (data.type) {
            case 'score_update':
                this.updateScore(data);
                break;
            case 'team_names':
                this.updateTeamNames(data);
                break;
            case 'round_info':
                this.updateRoundInfo(data);
                break;
            case 'timer_update':
                this.updateTimer(data);
                break;
            case 'full_state':
                this.updateFullState(data);
                break;
        }
    }
    
    updateScore(data) {
        if (data.team === 1 || data.team === 'team1') {
            this.animateScoreChange(this.elements.team1Score, data.score);
        } else if (data.team === 2 || data.team === 'team2') {
            this.animateScoreChange(this.elements.team2Score, data.score);
        }
    }
    
    animateScoreChange(element, newScore) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ff6b6b';
        
        setTimeout(() => {
            element.textContent = newScore;
        }, 150);
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#00d4ff';
        }, 300);
    }
    
    updateTeamNames(data) {
        if (data.team1) {
            this.elements.team1Name.textContent = data.team1.toUpperCase();
        }
        if (data.team2) {
            this.elements.team2Name.textContent = data.team2.toUpperCase();
        }
    }
    
    updateRoundInfo(data) {
        this.elements.roundInfo.textContent = data.round || 'RONDA 1';
    }
    
    updateTimer(data) {
        if (data.time) {
            this.elements.timer.textContent = this.formatTime(data.time);
        }
    }
    
    updateFullState(data) {
        if (data.scores) {
            this.elements.team1Score.textContent = data.scores.team1 || 0;
            this.elements.team2Score.textContent = data.scores.team2 || 0;
        }
        
        if (data.teamNames) {
            this.elements.team1Name.textContent = (data.teamNames.team1 || 'EQUIPO 1').toUpperCase();
            this.elements.team2Name.textContent = (data.teamNames.team2 || 'EQUIPO 2').toUpperCase();
        }
        
        if (data.round) {
            this.elements.roundInfo.textContent = data.round;
        }
        
        if (data.timer) {
            this.elements.timer.textContent = this.formatTime(data.timer);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    loadInitialData() {
        // Cargar datos iniciales desde el servidor
        fetch('http://localhost:5000/api/overlay/scoreboard')
            .then(response => response.json())
            .then(data => {
                this.updateFullState(data);
            })
            .catch(error => {
                console.log('No se pudieron cargar los datos iniciales:', error);
            });
    }
}

// Inicializar el overlay cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new ScoreboardOverlay();
});