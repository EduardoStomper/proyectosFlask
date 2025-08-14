# Sistema de Tablero para Juego de Preguntas - Flask + Python

## Descripción General
Sistema web para un juego de preguntas con dos equipos, donde el moderador controla desde su teléfono y las respuestas se muestran en pantallas separadas.

## Arquitectura Técnica
- **Backend**: Python con Flask
- **Frontend**: HTML + Tailwind CSS
- **Comunicación en tiempo real**: WebSockets (Flask-SocketIO)
- **Base de datos**: PostgreSQL (implementar después)
- **Responsive**: Compatible con móviles y pantallas grandes

## Funcionalidades Principales

### 1. Panel de Control del Moderador (Móvil)
**Ruta**: `/moderador`
- Seleccionar tipo de pregunta:
  - Cierto/Falso
  - Opción múltiple
- Seleccionar pregunta específica de la base de datos
- Enviar pregunta al tablero principal
- Controlar respuestas de los equipos
- Gestionar puntuaciones
- Botones grandes y táctiles para móvil

### 2. Tablero Principal de Preguntas
**Ruta**: `/tablero`
- Mostrar pregunta actual en grande
- Para Cierto/Falso: mostrar botones "CIERTO" y "FALSO"
- Para Opción múltiple: mostrar opciones A, B, C, D
- Animaciones suaves al cambiar preguntas
- Timer visual (opcional)
- Estilo llamativo pero formal

### 3. Marcador de Equipos
**Ruta**: `/marcador`
- Mostrar nombres de los dos equipos
- Puntuaciones actuales en tiempo real
- Historial de respuestas correctas/incorrectas
- Efectos visuales al actualizar puntos
- Colores distintivos por equipo

## Estructura de Archivos Requerida
```
game_system/
├── app.py                 # Aplicación Flask principal
├── models.py             # Modelos de datos (preguntas, equipos)
├── routes.py             # Rutas de la aplicación
├── websocket_events.py   # Eventos de WebSocket
├── static/
│   ├── css/
│   │   └── tailwind.css  # Estilos Tailwind
│   └── js/
│       ├── moderador.js  # Lógica del panel de control
│       ├── tablero.js    # Lógica del tablero
│       └── marcador.js   # Lógica del marcador
└── templates/
    ├── base.html         # Template base
    ├── moderador.html    # Panel del moderador
    ├── tablero.html      # Pantalla principal
    └── marcador.html     # Pantalla de marcador
```

## Especificaciones de Diseño (Tailwind CSS)

### Paleta de Colores
- **Primario**: Azul vibrante (`blue-600`, `blue-700`)
- **Secundario**: Verde para respuestas correctas (`green-500`)
- **Terciario**: Rojo para respuestas incorrectas (`red-500`)
- **Neutros**: Grises elegantes (`gray-100`, `gray-800`)
- **Acentos**: Amarillo/dorado para highlights (`yellow-400`)

### Estilo Visual
- **Formal pero dinámico**: Bordes redondeados, sombras sutiles
- **Tipografía**: Fonts sans-serif, tamaños grandes y legibles
- **Espaciado**: Generoso, componentes bien separados
- **Animaciones**: Transiciones suaves con `transition-all duration-300`
- **Responsive**: Breakpoints móvil-first

## Funcionalidades WebSocket Necesarias

### Eventos a Implementar
1. `join_room` - Conectar cliente a sala
2. `send_question` - Enviar pregunta al tablero
3. `update_score` - Actualizar puntuación
4. `show_answer` - Mostrar respuesta correcta
5. `reset_game` - Reiniciar juego
6. `team_answer` - Procesar respuesta de equipo

### Salas WebSocket
- `moderator` - Panel de control
- `display` - Tablero y marcador
- `scoreboard` - Solo marcador

## Estructura de Datos Inicial

### Pregunta (Temporal - antes de PostgreSQL)
```python
{
    "id": int,
    "type": "cierto_falso" | "opcion_multiple",
    "question": str,
    "options": [str] | ["Cierto", "Falso"],
    "correct_answer": str | int,
    "category": str,
    "difficulty": int
}
```

### Equipo
```python
{
    "name": str,
    "score": int,
    "color": str,
    "correct_answers": int,
    "wrong_answers": int
}
```

## Pantallas Responsivas

### Panel Moderador (Móvil)
- Botones grandes para dedos
- Layout vertical
- Controles intuitivos
- Feedback visual inmediato

### Tablero Principal (Pantalla grande)
- Pregunta centrada y grande
- Opciones claramente visibles
- Animaciones llamativas
- Branding del juego

### Marcador (Pantalla secundaria)
- Información de equipos lado a lado
- Puntuaciones destacadas
- Progreso visual del juego

## Requerimientos Técnicos
- Flask 2.3+
- Flask-SocketIO para WebSockets
- Tailwind CSS (CDN o compilado)
- JavaScript vanilla (ES6+)
- Psycopg2 (para PostgreSQL futuro)

## Comandos de Inicio
```bash
pip install flask flask-socketio
python app.py
```

## URLs de Acceso
- Moderador: `http://localhost:5000/moderador`
- Tablero: `http://localhost:5000/tablero`  
- Marcador: `http://localhost:5000/marcador`

## Notas Importantes
1. Implementar primero con datos mock en memoria
2. La integración con PostgreSQL será en una segunda fase
3. Priorizar la experiencia móvil para el moderador
4. Todas las pantallas deben actualizarse en tiempo real
5. Incluir manejo de errores y reconexión WebSocket