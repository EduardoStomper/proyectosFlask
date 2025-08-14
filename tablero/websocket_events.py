from flask_socketio import emit, join_room, leave_room
from models import game_state, get_question_by_id, update_team_score, reset_game

def register_websocket_events(socketio):
    
    @socketio.on('join')
    def on_join(data):
        room = data['room']
        join_room(room)
        emit('status', {'msg': f'Cliente conectado a {room}'}, room=room)
    
    @socketio.on('leave')
    def on_leave(data):
        room = data['room']
        leave_room(room)
        emit('status', {'msg': f'Cliente desconectado de {room}'}, room=room)
    
    @socketio.on('send_question')
    def handle_send_question(data):
        question_id = data.get('question_id')
        target_team = data.get('target_team', 'both')
        question = get_question_by_id(question_id)
        
        if question:
            game_state.current_question = question
            game_state.target_team = target_team
            game_state.game_active = True
            game_state.show_answer = False
            
            # Enviar pregunta al tablero principal
            socketio.emit('new_question', {
                'question': question,
                'target_team': target_team,
                'game_active': True,
                'show_answer': False
            }, room='display')
            
            # Confirmar al moderador
            emit('question_sent', {
                'status': 'success',
                'question': question,
                'target_team': target_team
            })
        else:
            emit('question_sent', {
                'status': 'error',
                'message': 'Pregunta no encontrada'
            })
    
    @socketio.on('show_answer')
    def handle_show_answer():
        if game_state.current_question:
            game_state.show_answer = True
            
            socketio.emit('show_correct_answer', {
                'correct_answer': game_state.current_question['correct_answer'],
                'show_answer': True
            }, room='display')
            
            emit('answer_shown', {'status': 'success'})
        else:
            emit('answer_shown', {
                'status': 'error',
                'message': 'No hay pregunta activa'
            })
    
    @socketio.on('update_score')
    def handle_update_score(data):
        team_id = data.get('team_id')
        points = data.get('points', 0)
        
        if team_id in game_state.teams:
            update_team_score(team_id, points)
            
            # Actualizar marcador en todas las pantallas
            socketio.emit('score_updated', {
                'teams': game_state.teams,
                'updated_team': team_id,
                'points_added': points
            }, room='display')
            
            socketio.emit('score_updated', {
                'teams': game_state.teams,
                'updated_team': team_id,
                'points_added': points
            }, room='scoreboard')
            
            emit('score_update_confirmed', {
                'status': 'success',
                'teams': game_state.teams
            })
        else:
            emit('score_update_confirmed', {
                'status': 'error',
                'message': 'Equipo no encontrado'
            })
    
    @socketio.on('team_answer')
    def handle_team_answer(data):
        team_id = data.get('team_id')
        answer = data.get('answer')
        
        if not game_state.current_question or not game_state.game_active:
            emit('answer_result', {
                'status': 'error',
                'message': 'No hay pregunta activa'
            })
            return
        
        # Verificar si el equipo puede responder a esta pregunta
        if game_state.target_team != 'both' and game_state.target_team != team_id:
            emit('answer_result', {
                'status': 'error',
                'message': 'Esta pregunta no está dirigida a tu equipo'
            })
            return
        
        correct_answer = game_state.current_question['correct_answer']
        is_correct = answer == correct_answer
        points = 10 if is_correct else -5
        
        update_team_score(team_id, points)
        
        # Notificar resultado a todas las pantallas
        socketio.emit('team_answered', {
            'team_id': team_id,
            'team_name': game_state.teams[team_id]['name'],
            'answer': answer,
            'is_correct': is_correct,
            'points': points,
            'teams': game_state.teams,
            'target_team': game_state.target_team
        }, room='display')
        
        socketio.emit('score_updated', {
            'teams': game_state.teams,
            'updated_team': team_id,
            'points_added': points
        }, room='scoreboard')
        
        emit('answer_result', {
            'status': 'success',
            'is_correct': is_correct,
            'points': points,
            'correct_answer': correct_answer
        })
    
    @socketio.on('reset_game')
    def handle_reset_game():
        reset_game()
        
        # Notificar reset a todas las pantallas
        socketio.emit('game_reset', {
            'teams': game_state.teams,
            'current_question': None,
            'game_active': False,
            'show_answer': False
        }, room='display')
        
        socketio.emit('game_reset', {
            'teams': game_state.teams
        }, room='scoreboard')
        
        emit('reset_confirmed', {
            'status': 'success',
            'message': 'Juego reiniciado'
        })
    
    @socketio.on('get_game_state')
    def handle_get_game_state():
        emit('game_state', {
            'current_question': game_state.current_question,
            'target_team': game_state.target_team,
            'teams': game_state.teams,
            'game_active': game_state.game_active,
            'show_answer': game_state.show_answer
        })