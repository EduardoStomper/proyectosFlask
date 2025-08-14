class GameState:
    def __init__(self):
        self.current_question = None
        self.target_team = 'both'  # 'team1', 'team2', o 'both'
        self.teams = {
            "team1": {
                "name": "Equipo Azul",
                "score": 0,
                "color": "blue-600",
                "correct_answers": 0,
                "wrong_answers": 0
            },
            "team2": {
                "name": "Equipo Rojo", 
                "score": 0,
                "color": "red-600",
                "correct_answers": 0,
                "wrong_answers": 0
            }
        }
        self.game_active = False
        self.show_answer = False

game_state = GameState()

mock_questions = [
    {
        "id": 1,
        "type": "cierto_falso",
        "question": "¿La capital de Francia es París?",
        "options": ["Cierto", "Falso"],
        "correct_answer": "Cierto",
        "category": "Geografía",
        "difficulty": 1
    },
    {
        "id": 2,
        "type": "cierto_falso", 
        "question": "¿Los pingüinos pueden volar?",
        "options": ["Cierto", "Falso"],
        "correct_answer": "Falso",
        "category": "Naturaleza",
        "difficulty": 1
    },
    {
        "id": 3,
        "type": "opcion_multiple",
        "question": "¿Cuál es el planeta más grande del sistema solar?",
        "options": ["Marte", "Júpiter", "Saturno", "Neptuno"],
        "correct_answer": "Júpiter",
        "category": "Astronomía",
        "difficulty": 2
    },
    {
        "id": 4,
        "type": "opcion_multiple",
        "question": "¿En qué año comenzó la Primera Guerra Mundial?",
        "options": ["1912", "1914", "1916", "1918"],
        "correct_answer": "1914",
        "category": "Historia",
        "difficulty": 2
    },
    {
        "id": 5,
        "type": "cierto_falso",
        "question": "¿El agua hierve a 100 grados Celsius al nivel del mar?",
        "options": ["Cierto", "Falso"],
        "correct_answer": "Cierto",
        "category": "Ciencia",
        "difficulty": 1
    },
    {
        "id": 6,
        "type": "opcion_multiple",
        "question": "¿Cuál es el océano más grande del mundo?",
        "options": ["Atlántico", "Índico", "Pacífico", "Ártico"],
        "correct_answer": "Pacífico",
        "category": "Geografía",
        "difficulty": 2
    },
    {
        "id": 7,
        "type": "cierto_falso",
        "question": "¿Shakespeare escribió 'Romeo y Julieta'?",
        "options": ["Cierto", "Falso"],
        "correct_answer": "Cierto",
        "category": "Literatura",
        "difficulty": 1
    },
    {
        "id": 8,
        "type": "opcion_multiple",
        "question": "¿Cuál es la moneda de Japón?",
        "options": ["Won", "Yuan", "Yen", "Dong"],
        "correct_answer": "Yen",
        "category": "Geografía",
        "difficulty": 2
    }
]

def get_questions_by_type(question_type):
    return [q for q in mock_questions if q["type"] == question_type]

def get_question_by_id(question_id):
    return next((q for q in mock_questions if q["id"] == question_id), None)

def update_team_score(team_id, points):
    if team_id in game_state.teams:
        game_state.teams[team_id]["score"] += points
        if points > 0:
            game_state.teams[team_id]["correct_answers"] += 1
        else:
            game_state.teams[team_id]["wrong_answers"] += 1

def reset_game():
    game_state.current_question = None
    game_state.target_team = 'both'
    game_state.game_active = False
    game_state.show_answer = False
    for team in game_state.teams.values():
        team["score"] = 0
        team["correct_answers"] = 0
        team["wrong_answers"] = 0