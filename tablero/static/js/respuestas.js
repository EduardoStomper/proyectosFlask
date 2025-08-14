// Variables globales
let currentQuestion = null;
let targetTeam = 'both';
let gameActive = false;
let showAnswer = false;
let selectedAnswer = null;
let canAnswer = true;
let hasAnswered = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Unirse a la sala de display para recibir actualizaciones
    socket.emit('join', { room: 'display' });
    
    // Obtener estado inicial del juego
    socket.emit('get_game_state');
    
    // Mostrar estado de conexión
    showConnectionStatus();
});

// Mostrar estado de conexión
function showConnectionStatus() {
    const statusDiv = document.getElementById('connection-status');
    statusDiv.classList.remove('hidden');
    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 3000);
}

// Actualizar estado de la pregunta
function updateQuestionStatus(question, target_team, game_active) {
    const statusDiv = document.getElementById('current-question-status');
    const eligibilityDiv = document.getElementById('team-eligibility');
    const questionCard = document.getElementById('question-card');
    const answerSection = document.getElementById('answer-section');
    
    if (!question || !game_active) {
        // No hay pregunta activa
        statusDiv.innerHTML = `
            <div class="text-4xl mb-2">⏳</div>
            <p>Esperando pregunta del moderador...</p>
        `;
        eligibilityDiv.classList.add('hidden');
        questionCard.classList.add('hidden');
        answerSection.classList.add('hidden');
        return;
    }
    
    // Hay pregunta activa
    statusDiv.innerHTML = `
        <div class="text-4xl mb-2">❓</div>
        <p class="font-medium">¡Pregunta activa!</p>
    `;
    
    // Verificar si este equipo puede responder
    const canTeamAnswer = target_team === 'both' || target_team === TEAM_ID;
    
    if (canTeamAnswer) {
        eligibilityDiv.innerHTML = `
            <div class="text-green-700 bg-green-100 border border-green-300">
                ✅ Tu equipo puede responder esta pregunta
            </div>
        `;
        eligibilityDiv.classList.remove('hidden');
        showQuestion(question);
    } else {
        const otherTeamName = target_team === 'team1' ? 'Equipo Azul' : 'Equipo Rojo';
        eligibilityDiv.innerHTML = `
            <div class="text-orange-700 bg-orange-100 border border-orange-300">
                ⏸️ Esta pregunta es para ${otherTeamName}
            </div>
        `;
        eligibilityDiv.classList.remove('hidden');
        showQuestion(question, false);
    }
}

// Mostrar pregunta
function showQuestion(question, canAnswer = true) {
    currentQuestion = question;
    this.canAnswer = canAnswer;
    hasAnswered = false;
    
    const questionCard = document.getElementById('question-card');
    const answerSection = document.getElementById('answer-section');
    const resultDiv = document.getElementById('answer-result');
    
    // Mostrar datos de la pregunta
    document.getElementById('question-category').textContent = question.category;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('difficulty-level').textContent = question.difficulty;
    
    questionCard.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    
    if (canAnswer && !hasAnswered) {
        createAnswerOptions(question);
        answerSection.classList.remove('hidden');
    } else {
        answerSection.classList.add('hidden');
    }
}

// Crear opciones de respuesta
function createAnswerOptions(question) {
    const optionsContainer = document.getElementById('answer-options');
    
    if (question.type === 'cierto_falso') {
        optionsContainer.innerHTML = `
            <button onclick="selectAnswer('Cierto')" 
                    class="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105">
                ✓ CIERTO
            </button>
            <button onclick="selectAnswer('Falso')" 
                    class="w-full bg-red-500 hover:bg-red-600 text-white py-4 px-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105">
                ✗ FALSO
            </button>
        `;
    } else if (question.type === 'opcion_multiple') {
        const letters = ['A', 'B', 'C', 'D'];
        const colors = ['bg-blue-500 hover:bg-blue-600', 'bg-green-500 hover:bg-green-600', 
                       'bg-yellow-500 hover:bg-yellow-600', 'bg-purple-500 hover:bg-purple-600'];
        
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <button onclick="selectAnswer('${option}')" 
                    class="w-full ${colors[index]} text-white py-4 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105">
                <div class="text-sm font-normal mb-1">Opción ${letters[index]}</div>
                ${option}
            </button>
        `).join('');
    }
}

// Seleccionar respuesta
function selectAnswer(answer) {
    if (!canAnswer || hasAnswered) {
        showNotification('No puedes responder en este momento', 'error');
        return;
    }
    
    selectedAnswer = answer;
    
    // Mostrar respuesta seleccionada
    document.getElementById('selected-answer-display').textContent = answer;
    document.getElementById('confirm-section').classList.remove('hidden');
    
    // Ocultar opciones
    document.getElementById('answer-options').classList.add('hidden');
}

// Cancelar respuesta
function cancelAnswer() {
    selectedAnswer = null;
    document.getElementById('confirm-section').classList.add('hidden');
    document.getElementById('answer-options').classList.remove('hidden');
}

// Enviar respuesta
function submitAnswer() {
    if (!selectedAnswer) {
        showNotification('No hay respuesta seleccionada', 'error');
        return;
    }
    
    hasAnswered = true;
    canAnswer = false;
    
    // Deshabilitar botón de envío
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    // Enviar respuesta al servidor
    socket.emit('team_answer', {
        team_id: TEAM_ID,
        answer: selectedAnswer
    });
    
    // Ocultar sección de respuestas
    document.getElementById('answer-section').classList.add('hidden');
    
    // Mostrar mensaje de espera
    document.getElementById('current-question-status').innerHTML = `
        <div class="text-4xl mb-2">📤</div>
        <p class="font-medium">Respuesta enviada</p>
        <p class="text-sm text-gray-500">Esperando resultado...</p>
    `;
}

// Mostrar resultado de la respuesta
function showAnswerResult(data) {
    const resultCard = document.getElementById('result-card');
    const resultSection = document.getElementById('answer-result');
    
    const isCorrect = data.is_correct;
    const points = data.points;
    
    resultCard.className = `rounded-lg p-6 text-center text-white shadow-lg mb-4 ${
        isCorrect ? 'bg-green-500' : 'bg-red-500'
    }`;
    
    resultCard.innerHTML = `
        <div class="text-4xl mb-3">${isCorrect ? '🎉' : '😞'}</div>
        <h3 class="text-2xl font-bold mb-2">
            ${isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
        </h3>
        <p class="text-lg mb-2">Tu respuesta: "${data.answer}"</p>
        <p class="text-2xl font-bold">
            ${points > 0 ? '+' : ''}${points} puntos
        </p>
    `;
    
    resultSection.classList.remove('hidden');
    
    // Efecto de celebración si es correcto
    if (isCorrect) {
        triggerCelebration();
    }
    
    // Actualizar estadísticas
    updateTeamStats();
}

// Mostrar respuesta correcta
function showCorrectAnswer(correctAnswer) {
    document.getElementById('correct-answer-text').textContent = correctAnswer;
    document.getElementById('correct-answer-modal').classList.remove('hidden');
    document.getElementById('correct-answer-modal').classList.add('flex');
}

function closeCorrectAnswerModal() {
    document.getElementById('correct-answer-modal').classList.add('hidden');
    document.getElementById('correct-answer-modal').classList.remove('flex');
}

// Preparar para próxima pregunta
function resetForNextQuestion() {
    selectedAnswer = null;
    hasAnswered = false;
    canAnswer = true;
    
    document.getElementById('answer-result').classList.add('hidden');
    document.getElementById('confirm-section').classList.add('hidden');
    
    // Restablecer botón de envío
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ Confirmar Respuesta';
    
    // Actualizar estado
    updateQuestionStatus(currentQuestion, targetTeam, gameActive);
}

// Actualizar estadísticas del equipo
function updateTeamStats() {
    // Solicitar estado actualizado del juego
    socket.emit('get_game_state');
}

// Efecto de celebración
function triggerCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.classList.remove('hidden');
    
    // Crear confeti
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 50);
    }
    
    setTimeout(() => {
        celebration.classList.add('hidden');
    }, 3000);
}

function createConfetti() {
    const confetti = document.createElement('div');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ff9ff3', '#54a0ff'];
    
    confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: 8px;
        height: 8px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        z-index: 1000;
        pointer-events: none;
        border-radius: 50%;
        animation: confetti-fall 3s linear forwards;
    `;
    
    document.getElementById('celebration').appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

// Event listeners para WebSocket
socket.on('new_question', function(data) {
    currentQuestion = data.question;
    targetTeam = data.target_team;
    gameActive = data.game_active;
    showAnswer = data.show_answer;
    
    updateQuestionStatus(data.question, data.target_team, data.game_active);
});

socket.on('show_correct_answer', function(data) {
    showAnswer = true;
    showCorrectAnswer(data.correct_answer);
});

socket.on('answer_result', function(data) {
    if (data.status === 'success') {
        showAnswerResult(data);
    } else {
        showNotification('Error: ' + data.message, 'error');
        // Permitir intentar de nuevo
        hasAnswered = false;
        canAnswer = true;
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Confirmar Respuesta';
    }
});

socket.on('game_reset', function(data) {
    // Reiniciar todo
    currentQuestion = null;
    targetTeam = 'both';
    gameActive = false;
    showAnswer = false;
    selectedAnswer = null;
    hasAnswered = false;
    canAnswer = true;
    
    updateQuestionStatus(null, 'both', false);
    updateTeamStats();
    showNotification('Juego reiniciado', 'success');
});

socket.on('game_state', function(data) {
    // Actualizar estado inicial
    if (data.current_question) {
        currentQuestion = data.current_question;
        targetTeam = data.target_team;
        gameActive = data.game_active;
        showAnswer = data.show_answer;
        
        updateQuestionStatus(data.current_question, data.target_team, data.game_active);
        
        if (data.show_answer && data.current_question) {
            showCorrectAnswer(data.current_question.correct_answer);
        }
    } else {
        updateQuestionStatus(null, 'both', false);
    }
    
    // Actualizar estadísticas del equipo
    if (data.teams && data.teams[TEAM_ID]) {
        const teamData = data.teams[TEAM_ID];
        document.getElementById('team-score').textContent = teamData.score;
        document.getElementById('correct-answers').textContent = teamData.correct_answers;
        document.getElementById('wrong-answers').textContent = teamData.wrong_answers;
    }
});

// Agregar CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);