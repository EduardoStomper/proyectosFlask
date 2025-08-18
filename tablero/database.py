import psycopg2
import psycopg2.extras
from psycopg2.pool import SimpleConnectionPool
from config import Config
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.connection_pool = None
        self.init_connection_pool()
    
    def init_connection_pool(self):
        """Inicializar el pool de conexiones"""
        try:
            self.connection_pool = SimpleConnectionPool(
                1, 10,  # min y max conexiones
                host=Config.DATABASE_HOST,
                port=Config.DATABASE_PORT,
                database=Config.DATABASE_NAME,
                user=Config.DATABASE_USER,
                password=Config.DATABASE_PASSWORD
            )
            logger.info("Pool de conexiones PostgreSQL inicializado correctamente")
        except Exception as e:
            logger.error(f"Error inicializando pool de conexiones: {e}")
            raise
    
    def get_connection(self):
        """Obtener conexión del pool"""
        try:
            return self.connection_pool.getconn()
        except Exception as e:
            logger.error(f"Error obteniendo conexión: {e}")
            raise
    
    def return_connection(self, conn):
        """Devolver conexión al pool"""
        try:
            self.connection_pool.putconn(conn)
        except Exception as e:
            logger.error(f"Error devolviendo conexión: {e}")
    
    def execute_query(self, query, params=None, fetch_one=False, fetch_all=True):
        """Ejecutar query y retornar resultados"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, params)
                
                if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                    conn.commit()
                    return cursor.rowcount
                
                if fetch_one:
                    return cursor.fetchone()
                elif fetch_all:
                    return cursor.fetchall()
                else:
                    return None
                    
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error ejecutando query: {e}")
            raise
        finally:
            if conn:
                self.return_connection(conn)
    
    def close_all_connections(self):
        """Cerrar todas las conexiones del pool"""
        if self.connection_pool:
            self.connection_pool.closeall()

# Instancia global del manager de base de datos
db_manager = DatabaseManager()

# Funciones para el modelo de preguntas
def get_all_categories():
    """Obtener todas las categorías"""
    query = "SELECT * FROM categories ORDER BY name"
    return db_manager.execute_query(query)

def get_questions_by_type(question_type):
    """Obtener preguntas por tipo"""
    query = """
    SELECT q.*, c.name as category_name,
           COALESCE(
               json_agg(
                   json_build_object(
                       'text', qo.option_text,
                       'order', qo.option_order
                   ) ORDER BY qo.option_order
               ) FILTER (WHERE qo.option_text IS NOT NULL),
               '[]'::json
           ) as options
    FROM questions q
    LEFT JOIN categories c ON q.category_id = c.id
    LEFT JOIN question_options qo ON q.id = qo.question_id
    WHERE q.type = %s AND q.is_active = true
    GROUP BY q.id, c.name
    ORDER BY q.id
    """
    return db_manager.execute_query(query, (question_type,))

def get_question_by_id(question_id):
    """Obtener pregunta por ID con sus opciones"""
    query = """
    SELECT q.*, c.name as category_name,
           COALESCE(
               json_agg(
                   json_build_object(
                       'text', qo.option_text,
                       'order', qo.option_order
                   ) ORDER BY qo.option_order
               ) FILTER (WHERE qo.option_text IS NOT NULL),
               '[]'::json
           ) as options
    FROM questions q
    LEFT JOIN categories c ON q.category_id = c.id
    LEFT JOIN question_options qo ON q.id = qo.question_id
    WHERE q.id = %s AND q.is_active = true
    GROUP BY q.id, c.name
    """
    return db_manager.execute_query(query, (question_id,), fetch_one=True)

def get_all_teams():
    """Obtener todos los equipos activos"""
    query = "SELECT * FROM teams WHERE is_active = true ORDER BY name"
    return db_manager.execute_query(query)

def create_game_session(session_name="Sesión de Juego", created_by="Sistema"):
    """Crear nueva sesión de juego"""
    query = """
    INSERT INTO game_sessions (session_name, created_by) 
    VALUES (%s, %s) 
    RETURNING id
    """
    result = db_manager.execute_query(query, (session_name, created_by), fetch_one=True)
    return result['id'] if result else None

def add_team_to_session(session_id, team_id):
    """Agregar equipo a la sesión"""
    query = """
    INSERT INTO session_teams (session_id, team_id)
    VALUES (%s, %s)
    ON CONFLICT (session_id, team_id) DO NOTHING
    """
    return db_manager.execute_query(query, (session_id, team_id))

def update_team_score_in_session(session_id, team_id, points):
    """Actualizar puntuación del equipo en la sesión"""
    query = """
    UPDATE session_teams 
    SET current_score = current_score + %s,
        correct_answers = correct_answers + CASE WHEN %s > 0 THEN 1 ELSE 0 END,
        wrong_answers = wrong_answers + CASE WHEN %s <= 0 THEN 1 ELSE 0 END
    WHERE session_id = %s AND team_id = %s
    """
    return db_manager.execute_query(query, (points, points, points, session_id, team_id))

def get_session_teams(session_id):
    """Obtener equipos de una sesión con sus puntuaciones"""
    query = """
    SELECT t.*, st.current_score, st.correct_answers, st.wrong_answers
    FROM teams t
    JOIN session_teams st ON t.id = st.team_id
    WHERE st.session_id = %s AND t.is_active = true
    ORDER BY st.current_score DESC, t.name
    """
    return db_manager.execute_query(query, (session_id,))

def record_question_response(session_id, question_id, team_id, given_answer, is_correct, points_awarded):
    """Registrar respuesta a una pregunta"""
    query = """
    INSERT INTO question_responses 
    (session_id, question_id, team_id, given_answer, is_correct, points_awarded)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    return db_manager.execute_query(query, (session_id, question_id, team_id, given_answer, is_correct, points_awarded))

def get_session_history(session_id):
    """Obtener historial de respuestas de una sesión"""
    query = """
    SELECT qr.*, q.question, q.correct_answer, t.name as team_name
    FROM question_responses qr
    JOIN questions q ON qr.question_id = q.id
    JOIN teams t ON qr.team_id = t.id
    WHERE qr.session_id = %s
    ORDER BY qr.answered_at DESC
    """
    return db_manager.execute_query(query, (session_id,))

def end_game_session(session_id):
    """Finalizar sesión de juego"""
    query = """
    UPDATE game_sessions 
    SET end_time = CURRENT_TIMESTAMP, is_active = false
    WHERE id = %s
    """
    return db_manager.execute_query(query, (session_id,))

# Función para insertar nuevas preguntas
def insert_question(question_type, question_text, correct_answer, category_name, difficulty=1, options=None):
    """Insertar nueva pregunta"""
    conn = None
    try:
        conn = db_manager.get_connection()
        with conn.cursor() as cursor:
            # Obtener ID de categoría
            cursor.execute("SELECT id FROM categories WHERE name = %s", (category_name,))
            category_result = cursor.fetchone()
            
            if not category_result:
                # Crear categoría si no existe
                cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING id", (category_name,))
                category_id = cursor.fetchone()[0]
            else:
                category_id = category_result[0]
            
            # Insertar pregunta
            cursor.execute("""
                INSERT INTO questions (type, question, correct_answer, category_id, difficulty)
                VALUES (%s, %s, %s, %s, %s) RETURNING id
            """, (question_type, question_text, correct_answer, category_id, difficulty))
            
            question_id = cursor.fetchone()[0]
            
            # Insertar opciones si es necesario
            if options:
                for i, option in enumerate(options, 1):
                    cursor.execute("""
                        INSERT INTO question_options (question_id, option_text, option_order)
                        VALUES (%s, %s, %s)
                    """, (question_id, option, i))
            elif question_type == 'cierto_falso':
                # Agregar opciones por defecto para cierto/falso
                cursor.execute("""
                    INSERT INTO question_options (question_id, option_text, option_order)
                    VALUES (%s, %s, %s), (%s, %s, %s)
                """, (question_id, 'Cierto', 1, question_id, 'Falso', 2))
            
            conn.commit()
            return question_id
            
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error insertando pregunta: {e}")
        raise
    finally:
        if conn:
            db_manager.return_connection(conn)