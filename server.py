import signal
import json
import random
import generator
import base64
from flask import Flask, render_template
import flask_socketio as fs
from flask_socketio import SocketIO

gen = None
app = Flask(__name__)
socketio = SocketIO(app)
in_process = False

def signal_handler(sig, frame):
    print("Vous avez appuyé sur CTRL+C!")
    global in_process
    global continue_processing
    if in_process:
        continue_processing = False
    else:
        exit(0)

signal.signal(signal.SIGINT, signal_handler)


@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(message):
    message = json.loads(message)
    print(f'Message: {json.dumps(message, indent=2)}')
    global gen
    if not gen:
        gen = generator.Generator()
    prompt = message.get('prompt', '')
    negative = message.get('negative', '')
    steps = int(message.get('step_count', '60'))
    seed = message.get('seed', random.randint(0, 99999999999999))
    if seed == '' or type(seed) == str:
        seed = random.randint(0, 99999999999999)
    to_generate = int(message.get('generate_count', 4))
    dir_path = str(hash(prompt * random.randint(0, 10000)))
    for idx in range(0, to_generate):
        image_path = gen.generate_single(prompt=prompt, negative_prompt=negative, step=steps, seed=seed, dir_path=dir_path, idx=idx)
        with open(image_path, "rb") as f:
            image_data = f.read()
        image64 = base64.b64encode(image_data).decode('utf-8')
        fs.send(image64)

if __name__ == '__main__':
    socketio.run(app, port=8000, debug=True)