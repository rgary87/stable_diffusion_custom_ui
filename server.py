import os
import signal
import threading
import json
import random
import generator
import base64
from flask import Flask, render_template, send_from_directory
import flask_socketio as fs
from flask_socketio import SocketIO

gen = None
app = Flask(__name__)
socketio = SocketIO(app)
prompts = []

def signal_handler(sig, frame):
    print("Vous avez appuyé sur CTRL+C!")
    exit(0)

signal.signal(signal.SIGINT, signal_handler)

lock = threading.Lock()
queue_length = 0

def broadcast_queue_lenght():
    global queue_length
    fs.send({'queue_length': queue_length, 'image': ''}, broadcast=True)


def add_prompt_to_history(prompt):
    global prompts
    print(f'Prompts are: {prompts}')
    if prompt not in prompts:
        prompts.insert(0, prompt)
    with open('static/history', 'w') as history:
        for p in prompts:
            history.write(f'{p}\n')


def process_queue(message):
    global queue_length
    message = json.loads(message)
    prompt = message.get('prompt', '')
    add_prompt_to_history(prompt=prompt)
    negative = message.get('negative', '')
    steps = int(message.get('step_count', '60'))
    seed = message.get('seed', '')
    width = int(message.get('width', 512))
    heigth = int(message.get('heigth', 512))
    if seed == '':
        seed = random.randint(0, 99999999999999)
    else:
        seed = int(seed)
    to_generate = int(message.get('generate_count', 4))
    queue_length += to_generate
    broadcast_queue_lenght()
    dir_path = str(hash(prompt * random.randint(0, 10000)))
    with lock:
        print(f'Message: {json.dumps(message, indent=2)}')
        global gen
        if not gen:
            gen = generator.Generator()
        for idx in range(0, to_generate):
            if queue_length <= 0:
                queue_length = 0
                break
            (image_path, image_seed) = gen.generate_single(prompt=prompt, negative_prompt=negative, step=steps, seed=seed, dir_path=dir_path, idx=idx, width=width, heigth=heigth)
            with open(image_path, "rb") as f:
                image_data = f.read()
            image64 = base64.b64encode(image_data).decode('utf-8')
            queue_length -= 1
            fs.send({'image': image64, 'image_seed': image_seed, 'queue_length': queue_length})
            broadcast_queue_lenght()
    if queue_length <= 0:
        queue_length = 0

@app.route('/static/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

@app.route('/static/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    broadcast_queue_lenght()
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(message):
    broadcast_queue_lenght()
    process_queue(message=message)

@socketio.on('clear')
def handle_clear_queue():
    global queue_length
    queue_length = 0
    broadcast_queue_lenght()

if __name__ == '__main__':
    if not os.path.exists('static/history'):
        with open('static/history', 'w'):
            pass
    with open('static/history', 'r') as history:
        for p in history:
            if p.strip() != '':
                prompts.append(p.strip())
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)