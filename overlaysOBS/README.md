# Overlays para OBS

Este directorio contiene overlays personalizados para OBS Studio que se integran con el sistema de tablero.

## Archivos incluidos

### HTML Templates
- `scoreboard_overlay.html` - Overlay principal del marcador
- `chat_overlay.html` - Overlay del chat en vivo
- `alerts_overlay.html` - Overlay de alertas y notificaciones

### Estilos
- `styles.css` - Estilos CSS para todos los overlays

### JavaScript
- `scoreboard_overlay.js` - Lógica para el marcador
- `chat_overlay.js` - Lógica para el chat
- `alerts_overlay.js` - Lógica para las alertas

## Configuración en OBS

### 1. Overlay de Marcador
1. Agregar fuente "Navegador"
2. URL: `file:///ruta/completa/a/overlaysOBS/scoreboard_overlay.html`
3. Ancho: 1920, Alto: 1080
4. Refresh browser when scene becomes active: ✓

### 2. Overlay de Chat
1. Agregar fuente "Navegador"
2. URL: `file:///ruta/completa/a/overlaysOBS/chat_overlay.html`
3. Ancho: 400, Alto: 500
4. Posicionar en la esquina deseada

### 3. Overlay de Alertas
1. Agregar fuente "Navegador"
2. URL: `file:///ruta/completa/a/overlaysOBS/alerts_overlay.html`
3. Ancho: 1920, Alto: 1080
4. Colocar en la capa superior

## Características

### Marcador
- Muestra nombres de equipos y puntuaciones
- Información de ronda actual
- Temporizador
- Actualizaciones en tiempo real vía WebSocket
- Animaciones suaves para cambios de puntuación

### Chat
- Muestra mensajes en tiempo real
- Límite de mensajes visibles
- Timestamps
- Auto-scroll
- Efectos de aparición

### Alertas
- Sistema de cola de alertas
- Alertas personalizables (texto, iconos, colores)
- Diferentes tipos: goles, nuevas rondas, fin de juego
- Duración configurable
- Soporte para sonidos

## Integración con el Servidor

Los overlays se conectan automáticamente al servidor Flask en `localhost:5000` usando:
- WebSockets para actualizaciones en tiempo real
- API REST para cargar estado inicial

### Eventos WebSocket soportados:
- `score_update` - Actualización de puntuación
- `team_names` - Cambio de nombres de equipos
- `round_info` - Información de ronda
- `timer_update` - Actualización del temporizador
- `new_message` - Nuevo mensaje de chat
- `alert` - Nueva alerta

## Personalización

### Colores y Estilos
Edita `styles.css` para cambiar:
- Colores del tema
- Fuentes
- Tamaños
- Animaciones
- Posicionamiento

### Comportamiento
Edita los archivos JavaScript para:
- Cambiar URL del servidor
- Modificar tiempos de reconexión
- Ajustar animaciones
- Personalizar tipos de alertas

## Resolución de Problemas

1. **No se conecta al servidor**
   - Verificar que el servidor Flask esté ejecutándose
   - Comprobar la URL en los archivos JS
   - Revisar la consola del navegador de OBS

2. **No se muestran actualizaciones**
   - Verificar conexión WebSocket
   - Comprobar que los eventos se están enviando desde el servidor
   - Refrescar la fuente del navegador en OBS

3. **Estilos no se cargan**
   - Verificar rutas relativas en los archivos HTML
   - Asegurar que todos los archivos estén en el mismo directorio