from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'overlay-congregacion-secret-key'

# Configurar SocketIO con CORS habilitado
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Estado global de los overlays
overlay_state = {
    'marquee': {
        'text': 'Bienvenidos a Iglesia Agua Viva ✝ Servicio Dominical - 10:00 AM 🙏 Unidos en fe y oración',
        'visible': True
    },
    'transition': {
        'visible': False,
        'message': 'Mientras tanto...',
        'church_name': 'Iglesia Agua Viva',
        'service_info': 'Servicio Dominical - 10:00 AM'
    }
}

@app.route('/')
def index():
    """Página principal con URLs para OBS"""
    return render_template('index.html')

@app.route('/overlay/marquee')
def marquee_overlay():
    """Overlay de marquesina para OBS"""
    return render_template('marquee.html', 
                         initial_text=overlay_state['marquee']['text'],
                         visible=overlay_state['marquee']['visible'])

@app.route('/overlay/transition')
def transition_overlay():
    """Overlay de transición para OBS"""
    return render_template('transition.html',
                         initial_state=overlay_state['transition'])

@app.route('/control')
def control_panel():
    """Panel de control administrativo"""
    return render_template('control.html', state=overlay_state)

# API Endpoints
@app.route('/api/update_marquee', methods=['POST'])
def update_marquee():
    """Actualizar texto de marquesina"""
    try:
        data = request.get_json()
        new_text = data.get('text', '').strip()
        
        if not new_text:
            return jsonify({'success': False, 'error': 'Texto no puede estar vacío'}), 400
        
        overlay_state['marquee']['text'] = new_text
        
        # Emitir actualización via WebSocket
        socketio.emit('marquee_update', {
            'text': new_text,
            'visible': overlay_state['marquee']['visible']
        })
        
        logger.info(f"Marquesina actualizada: {new_text}")
        return jsonify({'success': True, 'message': 'Marquesina actualizada correctamente'})
        
    except Exception as e:
        logger.error(f"Error actualizando marquesina: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/toggle_marquee', methods=['POST'])
def toggle_marquee():
    """Mostrar/ocultar marquesina"""
    try:
        overlay_state['marquee']['visible'] = not overlay_state['marquee']['visible']
        
        socketio.emit('marquee_update', {
            'text': overlay_state['marquee']['text'],
            'visible': overlay_state['marquee']['visible']
        })
        
        status = 'mostrada' if overlay_state['marquee']['visible'] else 'ocultada'
        logger.info(f"Marquesina {status}")
        return jsonify({'success': True, 'message': f'Marquesina {status}', 'visible': overlay_state['marquee']['visible']})
        
    except Exception as e:
        logger.error(f"Error toggling marquesina: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/show_transition', methods=['POST'])
def show_transition():
    """Mostrar pantalla de transición"""
    try:
        overlay_state['transition']['visible'] = True
        
        socketio.emit('transition_update', overlay_state['transition'])
        
        logger.info("Transición mostrada")
        return jsonify({'success': True, 'message': 'Pantalla de transición mostrada'})
        
    except Exception as e:
        logger.error(f"Error mostrando transición: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/hide_transition', methods=['POST'])
def hide_transition():
    """Ocultar pantalla de transición"""
    try:
        overlay_state['transition']['visible'] = False
        
        socketio.emit('transition_update', overlay_state['transition'])
        
        logger.info("Transición ocultada")
        return jsonify({'success': True, 'message': 'Pantalla de transición ocultada'})
        
    except Exception as e:
        logger.error(f"Error ocultando transición: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/update_transition', methods=['POST'])
def update_transition():
    """Actualizar mensaje de transición"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        church_name = data.get('church_name', '').strip()
        service_info = data.get('service_info', '').strip()
        
        if message:
            overlay_state['transition']['message'] = message
        if church_name:
            overlay_state['transition']['church_name'] = church_name
        if service_info:
            overlay_state['transition']['service_info'] = service_info
        
        socketio.emit('transition_update', overlay_state['transition'])
        
        logger.info(f"Transición actualizada: {message}")
        return jsonify({'success': True, 'message': 'Transición actualizada correctamente'})
        
    except Exception as e:
        logger.error(f"Error actualizando transición: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get_state', methods=['GET'])
def get_state():
    """Obtener estado actual de los overlays"""
    return jsonify(overlay_state)

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Cliente conectado"""
    logger.info(f"Cliente conectado: {request.sid}")
    # Enviar estado actual al cliente recién conectado
    emit('initial_state', overlay_state)

@socketio.on('disconnect')
def handle_disconnect():
    """Cliente desconectado"""
    logger.info(f"Cliente desconectado: {request.sid}")

@socketio.on('request_state')
def handle_request_state():
    """Cliente solicita estado actual"""
    emit('initial_state', overlay_state)

if __name__ == '__main__':
    print("="*50)
    print("SISTEMA DE OVERLAYS PARA TRANSMISIÓN RELIGIOSA")
    print("="*50)
    print("\nURLs para usar en OBS Studio:")
    print("• Marquesina: http://localhost:5000/overlay/marquee")
    print("• Transición: http://localhost:5000/overlay/transition")
    print("\nPanel de Control:")
    print("• http://localhost:5000/control")
    print("\nPágina Principal:")
    print("• http://localhost:5000/")
    print("\n" + "="*50)
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)