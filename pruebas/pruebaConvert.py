import hashlib
import json
import logging



prueba = hashlib.sha512("prueba".encode('utf-8')).hexdigest()

print(prueba)