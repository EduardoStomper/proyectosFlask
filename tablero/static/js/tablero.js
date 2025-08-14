// Variables globales
let currentQuestion = null;
let targetTeam = 'both';
let gameActive = false;
let showAnswer = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Unirse a la sala de display
    socket.emit('join', { room: 'display' });
    
    // Obtener estado inicial del juego
    socket.emit('get_game_state');
});

// Mostrar pregunta en el tablero
function displayQuestion(question, target_team = 'both') {
    currentQuestion = question;
    targetTeam = target_team;
    
    // Ocultar estado de espera y mostrar pregunta
    document.getElementById('waiting-state').classList.add('hidden');
    document.getElementById('question-display').classList.remove('hidden');
    
    // Actualizar indicador de juego
    document.getElementById('game-indicator').textContent = 'En Juego';
    document.getElementById('game-indicator').className = 'px-4 py-2 bg-green-500 rounded-full text-sm font-medium';
    
    // Mostrar datos de la pregunta
    document.getElementById('question-category').textContent = question.category;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('difficulty-level').textContent = question.difficulty;
    
    // Mostrar indicador de equipo objetivo
    const targetIndicator = document.getElementById('target-team-indicator');
    if (target_team === 'team1') {
        targetIndicator.textContent = '🔵 Para Equipo Azul';
        targetIndicator.className = 'text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block mb-4';
        targetIndicator.classList.remove('hidden');
    } else if (target_team === 'team2') {
        targetIndicator.textContent = '🔴 Para Equipo Rojo';
        targetIndicator.className = 'text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block mb-4';
        targetIndicator.classList.remove('hidden');
    } else {
        targetIndicator.textContent = '👥 Para Ambos Equipos';
        targetIndicator.className = 'text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block mb-4';
        targetIndicator.classList.remove('hidden');
    }
    
    // Crear opciones de respuesta
    createAnswerOptions(question);
    
    // Ocultar respuesta correcta
    document.getElementById('correct-answer-display').classList.add('hidden');
    document.getElementById('team-result').classList.add('hidden');
}

// Crear opciones de respuesta según el tipo de pregunta (Solo Vista)
function createAnswerOptions(question) {
    const optionsContainer = document.getElementById('answer-options');
    
    if (question.type === 'cierto_falso') {
        optionsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';
        optionsContainer.innerHTML = `
            <div class="bg-green-500 text-white py-8 px-6 rounded-2xl text-2xl font-bold shadow-2xl">
                ✓ CIERTO
            </div>
            <div class="bg-red-500 text-white py-8 px-6 rounded-2xl text-2xl font-bold shadow-2xl">
                ✗ FALSO
            </div>
        `;
    } else if (question.type === 'opcion_multiple') {
        optionsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        const letters = ['A', 'B', 'C', 'D'];
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <div class="${colors[index]} text-white py-6 px-4 rounded-2xl text-xl font-bold shadow-2xl">
                <div class="text-sm font-normal mb-2">Opción ${letters[index]}</div>
                ${option}
            </div>
        `).join('');
    }
}

// Tablero en modo solo vista - sin interacción

// Mostrar respuesta correcta
function displayCorrectAnswer(correctAnswer) {
    showAnswer = true;
    document.getElementById('correct-answer-text').textContent = correctAnswer;
    document.getElementById('correct-answer-display').classList.remove('hidden');
    
    // Resaltar opción correcta
    document.querySelectorAll('#answer-options div').forEach(option => {
        if (option.textContent.includes(correctAnswer)) {
            option.classList.add('ring-4', 'ring-yellow-400');
        } else {
            option.classList.add('opacity-50');
        }
    });
}

// Mostrar resultado del equipo
function displayTeamResult(data) {
    const resultContainer = document.getElementById('team-result-content');
    const isCorrect = data.is_correct;
    const teamName = data.team_name;
    const points = data.points;
    
    resultContainer.className = `rounded-2xl shadow-2xl p-6 text-center text-white slide-in ${
        isCorrect ? 'bg-green-500' : 'bg-red-500'
    }`;
    
    resultContainer.innerHTML = `
        <div class="text-3xl mb-2">${isCorrect ? '🎉' : '😞'}</div>
        <div class="text-xl font-bold mb-2">${teamName}</div>
        <div class="text-lg mb-2">${isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}</div>
        <div class="text-2xl font-bold">${points > 0 ? '+' : ''}${points} puntos</div>
        <div class="text-sm mt-2 opacity-90">Respondió: "${data.answer}"</div>
    `;
    
    document.getElementById('team-result').classList.remove('hidden');
    
    // Efecto de celebración si es correcto
    if (isCorrect) {
        triggerCelebration();
    }
}

// Efecto de celebración
function triggerCelebration() {
    // Crear elementos de confeti
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 50);
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: 10px;
        height: 10px;
        background: ${['#ff6b6b', '#4ecdc4', '#ffd700', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 5)]};
        z-index: 1000;
        pointer-events: none;
        animation: confetti-fall 3s linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

// Agregar CSS para animación de confeti
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

// Las puntuaciones se muestran en el marcador separado

// Volver al estado de espera
function returnToWaitingState() {
    currentQuestion = null;
    gameActive = false;
    showAnswer = false;
    
    document.getElementById('question-display').classList.add('hidden');
    document.getElementById('waiting-state').classList.remove('hidden');
    
    // Actualizar indicador de juego
    document.getElementById('game-indicator').textContent = 'En Espera';
    document.getElementById('game-indicator').className = 'px-4 py-2 bg-red-500 rounded-full text-sm font-medium';
}

// Event listeners para WebSocket
socket.on('new_question', function(data) {
    gameActive = data.game_active;
    showAnswer = data.show_answer;
    displayQuestion(data.question, data.target_team);
});

socket.on('show_correct_answer', function(data) {
    displayCorrectAnswer(data.correct_answer);
});

socket.on('team_answered', function(data) {
    displayTeamResult(data);
});

socket.on('score_updated', function(data) {
    // Las actualizaciones de puntuación se muestran en el marcador
});

socket.on('game_reset', function(data) {
    returnToWaitingState();
    showNotification('Juego reiniciado', 'success');
});

socket.on('game_state', function(data) {
    // Cargar estado inicial
    if (data.current_question && data.game_active) {
        gameActive = data.game_active;
        showAnswer = data.show_answer;
        displayQuestion(data.current_question, data.target_team);
        
        if (data.show_answer) {
            displayCorrectAnswer(data.current_question.correct_answer);
        }
    }
});