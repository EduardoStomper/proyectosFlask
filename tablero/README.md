# Sistema de Tablero para Juego de Preguntas

Sistema web completo para un juego de preguntas con dos equipos, control desde móvil y pantallas separadas para tablero principal y marcador.

## 🚀 Inicio Rápido

### Instalación
```bash
pip install flask flask-socketio
```

### Ejecutar el Sistema
```bash
py app.py
```

El servidor estará disponible en: http://localhost:5000

## 📱 Pantallas del Sistema

### Panel del Moderador
- **URL**: http://localhost:5000/moderador
- **Propósito**: Control completo del juego desde móvil
- **Características**:
  - Selección de tipo de pregunta (Cierto/Falso o Opción Múltiple)
  - Envío de preguntas al tablero
  - Control manual de puntuaciones
  - Mostrar respuestas correctas
  - Reiniciar juego

### Tablero Principal
- **URL**: http://localhost:5000/tablero
- **Propósito**: Mostrar preguntas y opciones en pantalla grande
- **Características**:
  - Vista de pregunta con opciones interactivas
  - Animaciones suaves al cambiar preguntas
  - Respuesta de equipos (usando parámetros URL)
  - Efectos visuales para respuestas correctas

### Marcador de Equipos
- **URL**: http://localhost:5000/marcador  
- **Propósito**: Mostrar puntuaciones y estadísticas en tiempo real
- **Características**:
  - Puntuaciones de ambos equipos
  - Estadísticas detalladas (correctas/incorrectas)
  - Historial de respuestas
  - Efectos de celebración

## 🎮 Cómo Usar el Sistema

### Configuración Inicial
1. Abrir el panel del moderador en el móvil: http://localhost:5000/moderador
2. Abrir el tablero principal en pantalla grande: http://localhost:5000/tablero
3. Abrir el marcador en pantalla secundaria: http://localhost:5000/marcador

### Durante el Juego
1. **Moderador**: Selecciona tipo de pregunta y envía pregunta específica
2. **Tablero**: Muestra la pregunta con opciones de respuesta
3. **Equipos**: Responden tocando las opciones (o moderador controla manualmente)
4. **Moderador**: Muestra respuesta correcta cuando lo considere apropiado
5. **Sistema**: Actualiza puntuaciones automáticamente en todas las pantallas

### Respuestas de Equipos
Para que los equipos puedan responder directamente desde el tablero:
- Equipo Azul: http://localhost:5000/tablero?team=team1
- Equipo Rojo: http://localhost:5000/tablero?team=team2

## 🎯 Características Técnicas

### Tecnologías
- **Backend**: Flask + Flask-SocketIO
- **Frontend**: HTML + Tailwind CSS + JavaScript Vanilla
- **Comunicación**: WebSockets en tiempo real
- **Responsive**: Optimizado para móvil y pantallas grandes

### Datos Mock Incluidos
El sistema incluye 8 preguntas de ejemplo:
- 4 preguntas tipo Cierto/Falso
- 4 preguntas tipo Opción Múltiple
- Categorías: Geografía, Naturaleza, Astronomía, Historia, Ciencia, Literatura

### WebSocket Events
- `send_question`: Enviar pregunta al tablero
- `team_answer`: Respuesta de equipo
- `update_score`: Actualizar puntuación manual
- `show_answer`: Mostrar respuesta correcta
- `reset_game`: Reiniciar juego completo

## 🎨 Personalización

### Colores de Equipos
Los colores se pueden modificar en `models.py`:
```python
"team1": {"color": "blue-600", ...}
"team2": {"color": "red-600", ...}
```

### Puntuaciones
- Respuesta correcta: +10 puntos
- Respuesta incorrecta: -5 puntos
- Control manual: +10, +5, -5 puntos

## 🔧 Estructura del Proyecto

```
D:\flaskProject\
├── app.py                    # Aplicación Flask principal
├── models.py                 # Datos mock y estado del juego
├── routes.py                 # Rutas de la aplicación  
├── websocket_events.py       # Eventos WebSocket
├── requirements.txt          # Dependencias
├── templates/
│   ├── base.html            # Template base con Tailwind
│   ├── moderador.html       # Panel del moderador
│   ├── tablero.html         # Tablero principal
│   └── marcador.html        # Marcador de equipos
└── static/js/
    ├── moderador.js         # Lógica del moderador
    ├── tablero.js           # Lógica del tablero
    └── marcador.js          # Lógica del marcador
```

## ✨ Características Destacadas

- ✅ **Tiempo Real**: Todas las pantallas se actualizan instantáneamente
- ✅ **Responsive**: Optimizado para móvil y desktop  
- ✅ **Animaciones**: Efectos visuales suaves y celebraciones
- ✅ **Robusto**: Manejo de errores y reconexión automática
- ✅ **Intuitivo**: Interfaz fácil de usar para moderadores
- ✅ **Estadísticas**: Seguimiento completo de rendimiento por equipo
- ✅ **Historial**: Registro de todas las respuestas con timestamps

## 📱 Nuevos Paneles de Respuesta

### URLs Adicionales:
- **Panel Respuestas Equipo Azul**: `http://localhost:5000/respuestas/team1`
- **Panel Respuestas Equipo Rojo**: `http://localhost:5000/respuestas/team2`

### 🎯 Flujo de Trabajo Recomendado:

**Configuración Ideal:**
1. **Moderador**: Móvil con `/moderador`
2. **Tablero**: Pantalla grande con `/tablero` (solo visualización)
3. **Marcador**: Pantalla secundaria con `/marcador`
4. **Ayudante Equipo Azul**: Móvil con `/respuestas/team1`
5. **Ayudante Equipo Rojo**: Móvil con `/respuestas/team2`

**Durante el Juego:**
1. **Moderador** selecciona tipo y equipo objetivo de la pregunta
2. **Moderador** envía pregunta al sistema
3. **Tablero** muestra pregunta para todos (sin interacción)
4. **Solo equipos autorizados** pueden responder desde sus paneles móviles
5. **Marcador** actualiza puntuaciones automáticamente
6. **Moderador** decide cuándo revelar respuesta correcta

**Ventajas del Sistema Separado:**
- ✅ **Roles definidos**: Cada pantalla tiene su propósito específico
- ✅ **Ayudantes múltiples**: Varias personas pueden manejar las respuestas
- ✅ **Tablero limpio**: Solo información, sin distracciones
- ✅ **Control granular**: Preguntas dirigidas a equipos específicos
- ✅ **Móvil-friendly**: Paneles optimizados para dispositivos táctiles

## 🚀 Próximas Mejoras

El sistema está preparado para integración futura con:
- PostgreSQL para persistencia de datos
- Gestión de usuarios y autenticación
- Banco de preguntas más amplio
- Timer automático por pregunta
- Modos de juego adicionales