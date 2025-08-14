// Variables globales
let gameStats = {
    totalQuestions: 0,
    totalCorrect: 0,
    answerHistory: []
};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Unirse a las salas de display y scoreboard
    socket.emit('join', { room: 'display' });
    socket.emit('join', { room: 'scoreboard' });
    
    // Obtener estado inicial del juego
    socket.emit('get_game_state');
});

// Actualizar información de los equipos
function updateTeamInfo(teams) {
    if (!teams || !teams.team1 || !teams.team2) return;
    
    // Equipo 1 (Azul)
    document.getElementById('team1-name').textContent = teams.team1.name;
    document.getElementById('team1-score').textContent = teams.team1.score;
    document.getElementById('team1-correct').textContent = teams.team1.correct_answers;
    document.getElementById('team1-wrong').textContent = teams.team1.wrong_answers;
    
    // Equipo 2 (Rojo)  
    document.getElementById('team2-name').textContent = teams.team2.name;
    document.getElementById('team2-score').textContent = teams.team2.score;
    document.getElementById('team2-correct').textContent = teams.team2.correct_answers;
    document.getElementById('team2-wrong').textContent = teams.team2.wrong_answers;
    
    // Actualizar estadísticas generales
    updateGeneralStats(teams);
}

// Actualizar estadísticas generales
function updateGeneralStats(teams) {
    const team1Correct = teams.team1.correct_answers;
    const team1Wrong = teams.team1.wrong_answers;
    const team2Correct = teams.team2.correct_answers;
    const team2Wrong = teams.team2.wrong_answers;
    
    const totalQuestions = team1Correct + team1Wrong + team2Correct + team2Wrong;
    const totalCorrect = team1Correct + team2Correct;
    const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('total-correct').textContent = totalCorrect;
    document.getElementById('accuracy-rate').textContent = accuracyRate + '%';
    
    gameStats.totalQuestions = totalQuestions;
    gameStats.totalCorrect = totalCorrect;
}

// Actualizar pregunta actual
function updateCurrentQuestion(question, target_team = 'both') {
    const questionText = document.getElementById('current-question-text');
    
    if (question) {
        let targetTeamText = '';
        let targetTeamColor = '';
        
        if (target_team === 'team1') {
            targetTeamText = '🔵 Para Equipo Azul';
            targetTeamColor = 'text-blue-600';
        } else if (target_team === 'team2') {
            targetTeamText = '🔴 Para Equipo Rojo';
            targetTeamColor = 'text-red-600';
        } else {
            targetTeamText = '👥 Para Ambos Equipos';
            targetTeamColor = 'text-purple-600';
        }
        
        questionText.innerHTML = `
            <div class="font-medium text-gray-800">${question.question}</div>
            <div class="text-sm text-gray-500 mt-2">
                📂 ${question.category} | 🎯 Dificultad: ${question.difficulty}/5 | 📝 Tipo: ${question.type === 'cierto_falso' ? 'Cierto/Falso' : 'Opción Múltiple'}
            </div>
            <div class="text-sm font-medium mt-2 ${targetTeamColor}">
                ${targetTeamText}
            </div>
        `;
    } else {
        questionText.textContent = 'No hay pregunta activa en este momento';
    }
}

// Agregar respuesta al historial
function addToAnswerHistory(data) {
    const historyContainer = document.getElementById('answer-history');
    
    // Si es la primera respuesta, limpiar el mensaje de placeholder
    if (gameStats.answerHistory.length === 0) {
        historyContainer.innerHTML = '';
    }
    
    // Crear elemento de historial
    const historyItem = document.createElement('div');
    historyItem.className = `flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${
        data.is_correct ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
    }`;
    
    const timestamp = new Date().toLocaleTimeString();
    
    historyItem.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="text-2xl">${data.is_correct ? '✅' : '❌'}</div>
            <div>
                <div class="font-medium text-gray-800">${data.team_name}</div>
                <div class="text-sm text-gray-600">${data.answer}</div>
            </div>
        </div>
        <div class="text-right">
            <div class="font-bold ${data.is_correct ? 'text-green-600' : 'text-red-600'}">
                ${data.points > 0 ? '+' : ''}${data.points}
            </div>
            <div class="text-xs text-gray-500">${timestamp}</div>
        </div>
    `;
    
    // Agregar animación de entrada
    historyItem.style.opacity = '0';
    historyItem.style.transform = 'translateY(-10px)';
    
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    
    // Animar entrada
    setTimeout(() => {
        historyItem.style.opacity = '1';
        historyItem.style.transform = 'translateY(0)';
    }, 50);
    
    // Guardar en estadísticas
    gameStats.answerHistory.unshift({
        team: data.team_name,
        answer: data.answer,
        correct: data.is_correct,
        points: data.points,
        timestamp: timestamp
    });
    
    // Mantener solo los últimos 10 elementos en el historial visual
    const historyItems = historyContainer.children;
    if (historyItems.length > 10) {
        historyItems[historyItems.length - 1].remove();
    }
}

// Efectos visuales para actualización de puntuación
function animateScoreUpdate(teamId, points) {
    const teamCard = document.getElementById(`${teamId}-card`);
    const scoreElement = document.getElementById(`${teamId}-score`);
    
    if (teamCard && scoreElement) {
        // Efecto de pulso en el score
        scoreElement.classList.add('score-update');
        
        // Efecto de brillo en la carta del equipo
        teamCard.style.transform = 'scale(1.05)';
        teamCard.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        
        // Si los puntos son positivos, mostrar celebración
        if (points > 0) {
            triggerCelebrationEffect(teamCard);
        }
        
        // Restaurar después de la animación
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
            teamCard.style.transform = 'scale(1)';
            teamCard.style.boxShadow = '';
        }, 600);
    }
}

// Efecto de celebración para respuestas correctas
function triggerCelebrationEffect(teamCard) {
    // Crear elementos de confeti específicos para el equipo
    const rect = teamCard.getBoundingClientRect();
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createConfettiAt(rect.left + rect.width / 2, rect.top);
        }, i * 30);
    }
    
    // Agregar clase de celebración
    teamCard.classList.add('pulse-winner');
    setTimeout(() => {
        teamCard.classList.remove('pulse-winner');
    }, 2000);
}

// Crear confeti en una posición específica
function createConfettiAt(x, y) {
    const confetti = document.createElement('div');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ff9ff3', '#54a0ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.style.cssText = `
        position: fixed;
        top: ${y}px;
        left: ${x + (Math.random() - 0.5) * 100}px;
        width: 8px;
        height: 8px;
        background: ${color};
        z-index: 1000;
        pointer-events: none;
        border-radius: 50%;
        animation: confetti-burst 2s ease-out forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 2000);
}

// Mostrar celebración global cuando un equipo alcanza hitos
function checkMilestones(teams) {
    const team1Score = teams.team1.score;
    const team2Score = teams.team2.score;
    
    // Hitos de puntuación (50, 100, 150, etc.)
    const milestones = [50, 100, 150, 200, 250];
    
    milestones.forEach(milestone => {
        if (team1Score === milestone || team2Score === milestone) {
            showGlobalCelebration();
        }
    });
}

// Celebración global para hitos importantes
function showGlobalCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    overlay.classList.remove('hidden');
    
    // Crear lluvia de confeti
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createRandomConfetti();
        }, i * 20);
    }
    
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 5000);
}

// Crear confeti aleatorio para celebración global
function createRandomConfetti() {
    const confetti = document.createElement('div');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ff9ff3', '#54a0ff', '#ff7675', '#74b9ff'];
    
    confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * window.innerWidth}px;
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        z-index: 1001;
        pointer-events: none;
        border-radius: 50%;
        animation: global-confetti ${2 + Math.random() * 2}s linear forwards;
    `;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
    }, 4000);
}

// Limpiar historial y estadísticas al reiniciar
function resetStats() {
    gameStats = {
        totalQuestions: 0,
        totalCorrect: 0,
        answerHistory: []
    };
    
    document.getElementById('answer-history').innerHTML = 
        '<p class="text-gray-500 text-center">El historial aparecerá aquí cuando empiecen las respuestas</p>';
    
    document.getElementById('total-questions').textContent = '0';
    document.getElementById('total-correct').textContent = '0';
    document.getElementById('accuracy-rate').textContent = '0%';
}

// Event listeners para WebSocket
socket.on('new_question', function(data) {
    updateCurrentQuestion(data.question, data.target_team);
});

socket.on('team_answered', function(data) {
    addToAnswerHistory(data);
    updateTeamInfo(data.teams);
    animateScoreUpdate(data.team_id, data.points);
    checkMilestones(data.teams);
});

socket.on('score_updated', function(data) {
    updateTeamInfo(data.teams);
    animateScoreUpdate(data.updated_team, data.points_added);
    checkMilestones(data.teams);
});

socket.on('game_reset', function(data) {
    updateTeamInfo(data.teams);
    updateCurrentQuestion(null);
    resetStats();
    showNotification('Juego reiniciado', 'success');
});

socket.on('game_state', function(data) {
    // Cargar estado inicial
    if (data.teams) {
        updateTeamInfo(data.teams);
    }
    
    if (data.current_question) {
        updateCurrentQuestion(data.current_question, data.target_team);
    }
});

// Agregar CSS para animaciones adicionales
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes confetti-burst {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(200px) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes global-confetti {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(calc(100vh + 10px)) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(additionalStyles);