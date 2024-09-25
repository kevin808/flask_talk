from flask import Flask, render_template, request, jsonify, send_file
from gpt import get_bot_response
import os

# 定义常量
IMAGE_FOLDER = 'static/img'
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "")

app = Flask(__name__, template_folder='views')
app.config['IMAGE_FOLDER'] = IMAGE_FOLDER

# 图片文件的路由函数
@app.route('/<image_name>.png')
def get_png_image(image_name):
    return send_file(os.path.join(app.config['IMAGE_FOLDER'], f'{image_name}.png'), mimetype='image/png')

@app.route('/<image_name>.jpg')
def get_jpg_image(image_name):
    return send_file(os.path.join(app.config['IMAGE_FOLDER'], f'{image_name}.jpg'), mimetype='image/jpg')

# 聊天机器人的路由函数
@app.route('/openai', methods=['POST'])
def chat():
    conversation = request.json.get('conversation', '')
    if not conversation:
        return jsonify({'message': "Stopped, please close the window"})
    response = get_bot_response(conversation)
    return jsonify({'message': response})

# 环境变量的路由函数
@app.route('/azure-keys', methods=['GET'])
def azure_keys():
    return jsonify({"AZURE_SPEECH_KEY": AZURE_SPEECH_KEY, "AZURE_SPEECH_REGION": AZURE_SPEECH_REGION})

# 主页的路由函数
@app.route('/')
@app.route('/talk.html')
@app.route('/select.html')
def index():
    return render_template(request.path[1:] or 'select.html')

if __name__ == '__main__':
    # 应用程序的运行方式进行优化
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
