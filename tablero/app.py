from flask import Flask
from flask_socketio import SocketIO
from routes import main_bp
from websocket_events import register_websocket_events

app = Flask(__name__)
app.config['SECRET_KEY'] = 'game_system_secret_key_2024'

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

app.register_blueprint(main_bp)

register_websocket_events(socketio)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)