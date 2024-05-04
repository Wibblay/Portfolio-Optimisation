from flask import Flask, send_from_directory, jsonify, request
import requests
from flask_cors import CORS
import os
#http://127.0.0.1:5000/

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/')
def index():
    print("Request received for index route")
    return send_from_directory(os.path.join('..', 'frontend', 'build'), 'index.html')

@app.route('/static/js/<path:filename>')
def static_files_js(filename):
    print("Request received for js static files route:", filename) 
    return send_from_directory(os.path.join('..', 'frontend', 'build', 'static', 'js'), filename)

@app.route('/static/css/<path:filename>')
def static_files_css(filename):
    print("Request received for css static files route:", filename) 
    return send_from_directory(os.path.join('..', 'frontend', 'build', 'static', 'css'), filename)

@app.route('/<path:filename>')
def other_files(filename):
    print("Request received for other files route:", filename) 
    return send_from_directory(os.path.join('..', 'frontend', 'build'), filename)


if __name__ == '__main__':
    app.run(debug=True)
