#!/usr/bin/env python

from flask import Flask, send_file, jsonify, request
from database import MyDatabase
import os

app = Flask(__name__)

CLOUDSQL_CONNECTION_NAME = os.environ.get('CLOUDSQL_CONNECTION_NAME')
CLOUDSQL_USER = os.environ.get('CLOUDSQL_USER')
CLOUDSQL_PASSWORD = os.environ.get('CLOUDSQL_PASSWORD')

db = MyDatabase(
	connection_name=CLOUDSQL_CONNECTION_NAME,
	user=CLOUDSQL_USER,
	password=CLOUDSQL_PASSWORD
)

@app.route('/')
@app.route('/index')
def index():
	return send_file('templates/index.html')

@app.route('/data/pca')
def pca():
	return db.fetch_pcs(sample_set=request.args.get('sample_set'))

if __name__ == '__main__':
	app.run(debug=True)
