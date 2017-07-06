#!/usr/bin/env python

import os
import MySQLdb
from flask import jsonify

class MyDatabase(object):

	def __init__(self, connection_name, user, password):

		self.on_cloud = os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')
		self.connection_name = connection_name
		self.user = user
		self.password = password

	def connect(self):

		if self.on_cloud:
			self.connection = MySQLdb.connect(
				unix_socket=os.path.join('/cloudsql', self.connection_name),
				user=self.user,
				passwd=self.password
			)
		else:
			self.connection = MySQLdb.connect(
				host='127.0.0.1',
				user=self.user,
				passwd=self.password
			)

		self.cursor = self.connection.cursor()

	def fetch_pcs(self, sample_set):

		self.connect()

		qry = """
			SELECT sample
				 , sample_set
				 , PC1
				 , PC2
				 , PC3
				 , PC4
				 , PC5
				 , PC6
				 , PC7
				 , PC8
				 , PC9
				 , PC10
			FROM epidb.pca_scores AS t
		"""

		self.cursor.execute(qry,)

		results = [
			{
				'sample': row[0],
				'sample_set': row[1], 
				'PC1': row[2], 
				'PC2': row[3],
				'PC3': row[4],
				'PC4': row[5],
				'PC5': row[6],
				'PC6': row[7],
				'PC7': row[8],
				'PC8': row[9],
				'PC9': row[10],
				'PC10': row[11]
			}
			for row in self.cursor.fetchall()
		]

		self.connection.close()

		return jsonify(results)

