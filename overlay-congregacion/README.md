# 🙏 Sistema de Overlays para Transmisiones Religiosas

Sistema completo de overlays web para transmisiones de servicios religiosos en Facebook y otras plataformas de streaming, desarrollado con Flask + WebSockets para actualizaciones en tiempo real.

## 📋 Características Principales

### 📜 Marquesina (Pie de Pantalla)
- Barra negra en la parte inferior (80px de altura)
- Texto que se desplaza de derecha a izquierda continuamente
- Fondo negro con borde superior blanco
- Iconos religiosos (✝ y 🙏) intercalados automáticamente
- Texto en blanco con sombra, fuente Arial 24px
- Efecto de brillo sutil animado
- Actualizable en tiempo real vía WebSocket
- Función mostrar/ocultar

### 🔄 Pantalla de Transición "Mientras tanto"
- Overlay completo semi-transparente
- Mensaje principal centrado y personalizable
- Ícono de cruz dorado animado con efecto pulse
- Puntos de carga animados
- Partículas de luz flotantes
- Información de iglesia y servicio personalizable
- Se puede mostrar/ocultar desde panel de control
- Efectos de brillo de fondo rotativos

### 🎛️ Panel de Control Web
- Interfaz moderna y responsive
- Campo de texto para actualizar marquesina
- Botones para mostrar/ocultar transición
- Campos para cambiar mensaje, iglesia y servicio
- Muestra las URLs para usar en OBS
- Feedback visual de acciones (mensajes de éxito/error)
- Indicador de estado de conexión en tiempo real
- Atajos de teclado para acciones rápidas

## 🚀 Instalación y Configuración

### Requisitos Previos
- Python 3.7 o superior
- OBS Studio (para usar los overlays)

### Instalación

1. **Clonar o descargar el proyecto**
```bash
cd overlay-congregacion
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Ejecutar el servidor**
```bash
python app.py
```

4. **Abrir en el navegador**
- Página principal: http://localhost:5000
- Panel de control: http://localhost:5000/control

## 🎥 Configuración en OBS Studio

### Para la Marquesina
1. Agregar fuente "Browser Source" (Fuente del navegador)
2. **URL:** `http://localhost:5000/overlay/marquee`
3. **Ancho:** 1920
4. **Alto:** 1080
5. **Marcar:** "Refresh browser when scene becomes active"
6. Posicionar en la parte inferior de la pantalla

### Para la Pantalla de Transición
1. Agregar fuente "Browser Source"
2. **URL:** `http://localhost:5000/overlay/transition`
3. **Ancho:** 1920
4. **Alto:** 1080
5. **Marcar:** "Refresh browser when scene becomes active"
6. Colocar en la capa superior (encima de todo)

## 🔧 Estructura del Proyecto

```
overlay-congregacion/
├── app.py                 # Aplicación Flask principal
├── requirements.txt       # Dependencias del proyecto
├── templates/            # Plantillas HTML
│   ├── index.html        # Página principal
│   ├── marquee.html      # Overlay de marquesina
│   ├── transition.html   # Overlay de transición
│   └── control.html      # Panel de control
└── README.md            # Documentación
```

## 🌐 Endpoints de la API

### Páginas Web
- `GET /` - Página principal con URLs
- `GET /overlay/marquee` - Overlay de marquesina
- `GET /overlay/transition` - Overlay de transición
- `GET /control` - Panel de control administrativo

### API REST
- `POST /api/update_marquee` - Actualizar texto de marquesina
- `POST /api/toggle_marquee` - Mostrar/ocultar marquesina
- `POST /api/show_transition` - Mostrar pantalla de transición
- `POST /api/hide_transition` - Ocultar pantalla de transición
- `POST /api/update_transition` - Actualizar datos de transición
- `GET /api/get_state` - Obtener estado actual

## 🎨 Personalización

### Colores y Estilos
- **Marquesina:** Fondo negro (#000000), texto blanco, borde blanco
- **Transición:** Fondo semi-transparente oscuro, texto blanco, acentos dorados (#ffd700)
- **Panel:** Estilo moderno con gradientes azules y dorados

### Datos por Defecto
- **Iglesia:** "Iglesia Agua Viva"
- **Servicio:** "Servicio Dominical - 10:00 AM"
- **Mensaje:** "Mientras tanto..."

### Modificación de Estilos
Editar los archivos HTML en la carpeta `templates/` para personalizar:
- Colores y gradientes
- Fuentes y tamaños
- Animaciones y efectos
- Iconos y símbolos

## ⚡ Funciones WebSocket

### Eventos Soportados
- `marquee_update` - Actualización de marquesina
- `transition_update` - Actualización de transición
- `initial_state` - Estado inicial al conectar
- `connect/disconnect` - Estados de conexión

### Actualizaciones en Tiempo Real
- Los overlays se actualizan automáticamente sin necesidad de refrescar
- El panel de control muestra el estado de conexión
- Reconexión automática en caso de pérdida de conexión

## ⌨️ Atajos de Teclado (Panel de Control)

- `Ctrl + Enter` - Actualizar marquesina
- `Ctrl + T` - Mostrar transición
- `Ctrl + H` - Ocultar transición
- `Ctrl + M` - Alternar marquesina

## 🔧 Resolución de Problemas

### El overlay no se muestra en OBS
1. Verificar que el servidor Flask esté ejecutándose
2. Comprobar la URL en OBS (debe ser exacta)
3. Refrescar la fuente del navegador en OBS
4. Verificar la resolución (1920x1080)

### No se actualizan los cambios
1. Revisar la conexión WebSocket en el panel de control
2. Comprobar la consola del navegador en OBS (F12)
3. Reiniciar el servidor Flask
4. Verificar que no haya bloqueos de firewall

### Problemas de rendimiento
1. Cerrar otras aplicaciones pesadas
2. Reducir la complejidad de las animaciones
3. Verificar la velocidad de internet
4. Usar una conexión por cable en lugar de WiFi

## 📱 Compatibilidad

- **OBS Studio:** Versión 26.0 o superior
- **Navegadores:** Chrome, Firefox, Edge (últimas versiones)
- **Resolución:** Optimizado para 1920x1080
- **Plataformas:** Windows, macOS, Linux
- **Streaming:** Facebook Live, YouTube Live, Twitch, etc.

## 🔒 Consideraciones de Seguridad

- El servidor corre en modo debug (solo para desarrollo)
- Para producción, configurar un servidor web adecuado
- Considerar autenticación para el panel de control
- Usar HTTPS en entornos de producción

## 📞 Soporte

Si tienes problemas o sugerencias:
1. Verificar la consola del navegador (F12) para errores
2. Revisar los logs del servidor Flask
3. Comprobar que todas las dependencias estén instaladas
4. Reiniciar completamente OBS Studio

## 📄 Licencia

Este proyecto está disponible para uso en transmisiones religiosas. Libre para modificar y adaptar según las necesidades de tu congregación.

---

**¡Que Dios bendiga tu ministerio y transmisiones! ✝** 🙏