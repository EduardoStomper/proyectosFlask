from flask import Blueprint, render_template, jsonify
from models import mock_questions, get_questions_by_type, game_state

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return '''
    <h1>Sistema de Tablero para Juego de Preguntas</h1>
    <ul>
        <li><a href="/moderador">Panel del Moderador</a></li>
        <li><a href="/tablero">Tablero Principal (Solo Vista)</a></li>
        <li><a href="/respuestas/team1">Panel Respuestas - Equipo Azul</a></li>
        <li><a href="/respuestas/team2">Panel Respuestas - Equipo Rojo</a></li>
        <li><a href="/marcador">Marcador de Equipos</a></li>
    </ul>
    '''

@main_bp.route('/moderador')
def moderador():
    return render_template('moderador.html')

@main_bp.route('/tablero')
def tablero():
    return render_template('tablero.html')

@main_bp.route('/marcador')
def marcador():
    return render_template('marcador.html')

@main_bp.route('/respuestas/<team_id>')
def respuestas(team_id):
    if team_id not in ['team1', 'team2']:
        return "Equipo no válido. Use team1 o team2.", 400
    
    team_name = "Equipo Azul" if team_id == "team1" else "Equipo Rojo"
    team_color = "blue" if team_id == "team1" else "red"
    
    return render_template('respuestas.html', 
                         team_id=team_id, 
                         team_name=team_name, 
                         team_color=team_color)

@main_bp.route('/api/questions/<question_type>')
def api_questions(question_type):
    questions = get_questions_by_type(question_type)
    return jsonify(questions)

@main_bp.route('/api/game_state')
def api_game_state():
    return jsonify({
        'current_question': game_state.current_question,
        'target_team': game_state.target_team,
        'teams': game_state.teams,
        'game_active': game_state.game_active,
        'show_answer': game_state.show_answer
    })