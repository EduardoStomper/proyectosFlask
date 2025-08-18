-- Script para crear la base de datos y tablas del sistema de preguntas
-- PostgreSQL

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE quiz_game_db;

-- Usar la base de datos
-- \c quiz_game_db;

-- Tabla de categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cierto_falso', 'opcion_multiple')),
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de opciones para preguntas de opción múltiple
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de equipos
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue-600',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones de juego
CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,
    session_name VARCHAR(100),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100)
);

-- Tabla de participantes por sesión
CREATE TABLE session_teams (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    current_score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    UNIQUE(session_id, team_id)
);

-- Tabla de respuestas por pregunta y sesión
CREATE TABLE question_responses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES game_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    given_answer TEXT,
    is_correct BOOLEAN,
    points_awarded INTEGER DEFAULT 0,
    response_time INTERVAL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para mejorar rendimiento
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_session_teams_session ON session_teams(session_id);
CREATE INDEX idx_question_responses_session ON question_responses(session_id);
CREATE INDEX idx_question_responses_question ON question_responses(question_id);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar categorías por defecto
INSERT INTO categories (name, description) VALUES
('Geografía', 'Preguntas sobre países, capitales, océanos y geografía mundial'),
('Historia', 'Preguntas sobre eventos históricos, fechas y personajes'),
('Ciencia', 'Preguntas sobre física, química, biología y ciencias generales'),
('Naturaleza', 'Preguntas sobre animales, plantas y medio ambiente'),
('Astronomía', 'Preguntas sobre planetas, estrellas y el universo'),
('Literatura', 'Preguntas sobre libros, autores y obras literarias'),
('Deportes', 'Preguntas sobre deportes, atletas y competiciones'),
('Arte', 'Preguntas sobre pintura, escultura y artistas'),
('Música', 'Preguntas sobre músicos, instrumentos y géneros musicales'),
('Tecnología', 'Preguntas sobre informática, internet y tecnología');

-- Insertar equipos por defecto
INSERT INTO teams (name, color) VALUES
('Equipo Azul', 'blue-600'),
('Equipo Rojo', 'red-600'),
('Equipo Verde', 'green-600'),
('Equipo Amarillo', 'yellow-600');

-- Insertar preguntas de ejemplo (migrar desde mock_questions)
INSERT INTO questions (type, question, correct_answer, category_id, difficulty) VALUES
('cierto_falso', '¿La capital de Francia es París?', 'Cierto', 
 (SELECT id FROM categories WHERE name = 'Geografía'), 1),
('cierto_falso', '¿Los pingüinos pueden volar?', 'Falso', 
 (SELECT id FROM categories WHERE name = 'Naturaleza'), 1),
('opcion_multiple', '¿Cuál es el planeta más grande del sistema solar?', 'Júpiter', 
 (SELECT id FROM categories WHERE name = 'Astronomía'), 2),
('opcion_multiple', '¿En qué año comenzó la Primera Guerra Mundial?', '1914', 
 (SELECT id FROM categories WHERE name = 'Historia'), 2),
('cierto_falso', '¿El agua hierve a 100 grados Celsius al nivel del mar?', 'Cierto', 
 (SELECT id FROM categories WHERE name = 'Ciencia'), 1),
('opcion_multiple', '¿Cuál es el océano más grande del mundo?', 'Pacífico', 
 (SELECT id FROM categories WHERE name = 'Geografía'), 2),
('cierto_falso', '¿Shakespeare escribió Romeo y Julieta?', 'Cierto', 
 (SELECT id FROM categories WHERE name = 'Literatura'), 1),
('opcion_multiple', '¿Cuál es la moneda de Japón?', 'Yen', 
 (SELECT id FROM categories WHERE name = 'Geografía'), 2);

-- Insertar opciones para preguntas de opción múltiple
-- Pregunta: ¿Cuál es el planeta más grande del sistema solar?
INSERT INTO question_options (question_id, option_text, option_order) VALUES
((SELECT id FROM questions WHERE question LIKE '%planeta más grande%'), 'Marte', 1),
((SELECT id FROM questions WHERE question LIKE '%planeta más grande%'), 'Júpiter', 2),
((SELECT id FROM questions WHERE question LIKE '%planeta más grande%'), 'Saturno', 3),
((SELECT id FROM questions WHERE question LIKE '%planeta más grande%'), 'Neptuno', 4);

-- Pregunta: ¿En qué año comenzó la Primera Guerra Mundial?
INSERT INTO question_options (question_id, option_text, option_order) VALUES
((SELECT id FROM questions WHERE question LIKE '%Primera Guerra Mundial%'), '1912', 1),
((SELECT id FROM questions WHERE question LIKE '%Primera Guerra Mundial%'), '1914', 2),
((SELECT id FROM questions WHERE question LIKE '%Primera Guerra Mundial%'), '1916', 3),
((SELECT id FROM questions WHERE question LIKE '%Primera Guerra Mundial%'), '1918', 4);

-- Pregunta: ¿Cuál es el océano más grande del mundo?
INSERT INTO question_options (question_id, option_text, option_order) VALUES
((SELECT id FROM questions WHERE question LIKE '%océano más grande%'), 'Atlántico', 1),
((SELECT id FROM questions WHERE question LIKE '%océano más grande%'), 'Índico', 2),
((SELECT id FROM questions WHERE question LIKE '%océano más grande%'), 'Pacífico', 3),
((SELECT id FROM questions WHERE question LIKE '%océano más grande%'), 'Ártico', 4);

-- Pregunta: ¿Cuál es la moneda de Japón?
INSERT INTO question_options (question_id, option_text, option_order) VALUES
((SELECT id FROM questions WHERE question LIKE '%moneda de Japón%'), 'Won', 1),
((SELECT id FROM questions WHERE question LIKE '%moneda de Japón%'), 'Yuan', 2),
((SELECT id FROM questions WHERE question LIKE '%moneda de Japón%'), 'Yen', 3),
((SELECT id FROM questions WHERE question LIKE '%moneda de Japón%'), 'Dong', 4);

-- Para preguntas cierto/falso, insertar las opciones estándar
INSERT INTO question_options (question_id, option_text, option_order)
SELECT q.id, 'Cierto', 1
FROM questions q
WHERE q.type = 'cierto_falso'
UNION ALL
SELECT q.id, 'Falso', 2
FROM questions q
WHERE q.type = 'cierto_falso';

-- Vista para obtener preguntas con sus opciones
CREATE VIEW v_questions_with_options AS
SELECT 
    q.id,
    q.type,
    q.question,
    q.correct_answer,
    c.name as category_name,
    q.difficulty,
    q.is_active,
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
WHERE q.is_active = true
GROUP BY q.id, q.type, q.question, q.correct_answer, c.name, q.difficulty, q.is_active
ORDER BY q.id;

-- Vista para estadísticas de sesión
CREATE VIEW v_session_stats AS
SELECT 
    gs.id as session_id,
    gs.session_name,
    gs.start_time,
    gs.end_time,
    COUNT(DISTINCT st.team_id) as total_teams,
    COUNT(DISTINCT qr.question_id) as questions_answered,
    AVG(st.current_score) as avg_score
FROM game_sessions gs
LEFT JOIN session_teams st ON gs.id = st.session_id
LEFT JOIN question_responses qr ON gs.id = qr.session_id
WHERE gs.is_active = true
GROUP BY gs.id, gs.session_name, gs.start_time, gs.end_time;