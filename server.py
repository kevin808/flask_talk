from flask import Flask, render_template, request, jsonify
from gpt import get_bot_response
import os

app = Flask(__name__, template_folder='views')
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/openai', methods=['POST'])
def chat():
    if len(request.json) == 0:
        return jsonify({'message': "Stopped, please close the window"})
    response = get_bot_response(request.json['conversation'])
    return jsonify({'message': response})

@app.route('/azure-keys', methods=['GET'])
def azure_keys():
    return jsonify({"AZURE_SPEECH_KEY": AZURE_SPEECH_KEY, "AZURE_SPEECH_REGION": AZURE_SPEECH_REGION})

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=False)
