// Variables globales
let currentQuestions = [];
let selectedQuestionType = null;
let selectedTargetTeam = 'both'; // Por defecto ambos equipos
let gameState = {
    current_question: null,
    teams: {},
    game_active: false,
    show_answer: false
};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Unirse a la sala del moderador
    socket.emit('join', { room: 'moderator' });
    
    // Obtener estado inicial del juego
    loadGameState();
});

// Cargar estado actual del juego
function loadGameState() {
    fetch('/api/game_state')
        .then(response => response.json())
        .then(data => {
            gameState = data;
            updateGameStatusDisplay();
        })
        .catch(error => {
            console.error('Error loading game state:', error);
            showNotification('Error al cargar estado del juego', 'error');
        });
}

// Actualizar la visualización del estado del juego
function updateGameStatusDisplay() {
    // Actualizar pregunta actual
    const currentQuestionDisplay = document.getElementById('current-question-display');
    if (gameState.current_question) {
        let targetText = '';
        if (gameState.target_team === 'team1') {
            targetText = '<span class="text-blue-600">🔵 Para Equipo Azul</span>';
        } else if (gameState.target_team === 'team2') {
            targetText = '<span class="text-red-600">🔴 Para Equipo Rojo</span>';
        } else {
            targetText = '<span class="text-purple-600">👥 Para Ambos Equipos</span>';
        }
        
        currentQuestionDisplay.innerHTML = `
            <strong>Pregunta Activa:</strong><br>
            <span class="text-sm">${gameState.current_question.question}</span><br>
            <span class="text-xs text-blue-600">${gameState.current_question.category} - Tipo: ${gameState.current_question.type}</span><br>
            <span class="text-xs">${targetText}</span>
        `;
    } else {
        currentQuestionDisplay.textContent = 'No hay pregunta activa';
    }
    
    // Actualizar puntuaciones
    if (gameState.teams && gameState.teams.team1 && gameState.teams.team2) {
        document.getElementById('team1-score').textContent = gameState.teams.team1.score;
        document.getElementById('team2-score').textContent = gameState.teams.team2.score;
    }
}

// Seleccionar tipo de pregunta
function selectQuestionType(type) {
    selectedQuestionType = type;
    
    // Actualizar botones de tipo
    document.querySelectorAll('[id^="btn-"]').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-blue-300');
    });
    
    const selectedBtn = document.getElementById(`btn-${type.replace('_', '-')}`);
    selectedBtn.classList.add('ring-4', 'ring-blue-300');
    
    // Cargar preguntas del tipo seleccionado
    loadQuestions(type);
    
    showNotification(`Tipo seleccionado: ${type === 'cierto_falso' ? 'Cierto/Falso' : 'Opción Múltiple'}`, 'success');
}

// Cargar preguntas por tipo
function loadQuestions(type) {
    fetch(`/api/questions/${type}`)
        .then(response => response.json())
        .then(questions => {
            currentQuestions = questions;
            displayQuestions(questions);
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            showNotification('Error al cargar preguntas', 'error');
        });
}

// Mostrar lista de preguntas
function displayQuestions(questions) {
    const questionsList = document.getElementById('questions-list');
    
    if (questions.length === 0) {
        questionsList.innerHTML = '<p class="text-gray-500 text-sm">No hay preguntas de este tipo</p>';
        return;
    }
    
    questionsList.innerHTML = questions.map(question => `
        <button onclick="selectQuestion(${question.id})" 
                class="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg p-3 transition-all duration-300 transform hover:scale-102">
            <div class="font-medium text-gray-800">${question.question}</div>
            <div class="text-xs text-gray-500 mt-1">
                ${question.category} - Dificultad: ${question.difficulty}/5
            </div>
        </button>
    `).join('');
}

// Seleccionar equipo objetivo para la pregunta
function selectTargetTeam(teamTarget) {
    selectedTargetTeam = teamTarget;
    
    // Actualizar botones de selección
    document.querySelectorAll('[id^="btn-target-"]').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-blue-300', 'ring-red-300', 'ring-purple-300');
    });
    
    const selectedBtn = document.getElementById(`btn-target-${teamTarget}`);
    if (teamTarget === 'team1') {
        selectedBtn.classList.add('ring-4', 'ring-blue-300');
    } else if (teamTarget === 'team2') {
        selectedBtn.classList.add('ring-4', 'ring-red-300');
    } else {
        selectedBtn.classList.add('ring-4', 'ring-purple-300');
    }
    
    // Actualizar información del equipo objetivo
    const targetInfo = document.getElementById('target-team-info');
    if (teamTarget === 'team1') {
        targetInfo.textContent = 'Pregunta dirigida al Equipo Azul 🔵';
        targetInfo.className = 'mt-3 text-center text-sm text-blue-600 font-medium';
    } else if (teamTarget === 'team2') {
        targetInfo.textContent = 'Pregunta dirigida al Equipo Rojo 🔴';
        targetInfo.className = 'mt-3 text-center text-sm text-red-600 font-medium';
    } else {
        targetInfo.textContent = 'Pregunta para ambos equipos 👥';
        targetInfo.className = 'mt-3 text-center text-sm text-purple-600 font-medium';
    }
    
    showNotification(`Equipo seleccionado: ${
        teamTarget === 'team1' ? 'Equipo Azul' : 
        teamTarget === 'team2' ? 'Equipo Rojo' : 
        'Ambos Equipos'
    }`, 'success');
}

// Seleccionar pregunta específica
function selectQuestion(questionId) {
    const question = currentQuestions.find(q => q.id === questionId);
    if (!question) {
        showNotification('Pregunta no encontrada', 'error');
        return;
    }
    
    const targetText = selectedTargetTeam === 'team1' ? 'Equipo Azul' : 
                      selectedTargetTeam === 'team2' ? 'Equipo Rojo' : 
                      'Ambos Equipos';
    
    // Confirmar envío
    if (confirm(`¿Enviar esta pregunta al tablero?\n\n"${question.question}"\n\nDirigida a: ${targetText}`)) {
        sendQuestion(questionId);
    }
}

// Enviar pregunta al tablero
function sendQuestion(questionId) {
    socket.emit('send_question', { 
        question_id: questionId,
        target_team: selectedTargetTeam
    });
}

// Mostrar respuesta correcta
function showAnswer() {
    if (!gameState.current_question) {
        showNotification('No hay pregunta activa para mostrar la respuesta', 'error');
        return;
    }
    
    socket.emit('show_answer');
}

// Actualizar puntuación de equipo
function updateScore(teamId, points) {
    socket.emit('update_score', { 
        team_id: teamId, 
        points: points 
    });
}

// Reiniciar juego
function resetGame() {
    if (confirm('¿Está seguro de que quiere reiniciar el juego? Se perderán todas las puntuaciones.')) {
        socket.emit('reset_game');
    }
}

// Event listeners para WebSocket
socket.on('question_sent', function(data) {
    if (data.status === 'success') {
        const targetText = data.target_team === 'team1' ? 'Equipo Azul' : 
                          data.target_team === 'team2' ? 'Equipo Rojo' : 
                          'Ambos Equipos';
        showNotification(`Pregunta enviada al tablero para ${targetText}`, 'success');
        gameState.current_question = data.question;
        gameState.target_team = data.target_team;
        gameState.game_active = true;
        gameState.show_answer = false;
        updateGameStatusDisplay();
        
        // Resaltar pregunta actual en la lista
        document.querySelectorAll('#questions-list button').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'border-blue-300');
        });
        
        // Encontrar y resaltar la pregunta enviada
        const questionButtons = document.querySelectorAll('#questions-list button');
        questionButtons.forEach(btn => {
            if (btn.onclick.toString().includes(data.question.id)) {
                btn.classList.add('bg-blue-100', 'border-blue-300');
            }
        });
    } else {
        showNotification('Error al enviar pregunta: ' + data.message, 'error');
    }
});

socket.on('answer_shown', function(data) {
    if (data.status === 'success') {
        showNotification('Respuesta mostrada en el tablero', 'success');
        gameState.show_answer = true;
    } else {
        showNotification('Error al mostrar respuesta: ' + data.message, 'error');
    }
});

socket.on('score_update_confirmed', function(data) {
    if (data.status === 'success') {
        gameState.teams = data.teams;
        updateGameStatusDisplay();
        showNotification('Puntuación actualizada', 'success');
    } else {
        showNotification('Error al actualizar puntuación: ' + data.message, 'error');
    }
});

socket.on('reset_confirmed', function(data) {
    if (data.status === 'success') {
        gameState.current_question = null;
        gameState.game_active = false;
        gameState.show_answer = false;
        loadGameState(); // Recargar estado completo
        showNotification('Juego reiniciado', 'success');
        
        // Limpiar selecciones
        document.querySelectorAll('#questions-list button').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'border-blue-300');
        });
    } else {
        showNotification('Error al reiniciar juego', 'error');
    }
});

socket.on('team_answered', function(data) {
    const teamName = data.team_name;
    const isCorrect = data.is_correct;
    const points = data.points;
    
    showNotification(
        `${teamName} respondió ${isCorrect ? 'correctamente' : 'incorrectamente'} (${points > 0 ? '+' : ''}${points} puntos)`,
        isCorrect ? 'success' : 'error'
    );
    
    gameState.teams = data.teams;
    updateGameStatusDisplay();
});

// Manejar errores de conexión
socket.on('connect_error', function() {
    showNotification('Error de conexión. Verifique la conexión al servidor.', 'error');
});

socket.on('disconnect', function() {
    showNotification('Conexión perdida. Intentando reconectar...', 'error');
});

socket.on('connect', function() {
    showNotification('Conectado al servidor', 'success');
    // Reunirse a la sala después de reconectar
    socket.emit('join', { room: 'moderator' });
});