import os
from supabase import create_client, Client
import requests # Import the requests library


test_email = "testing@gmail.com" 
backend_url = "http://localhost:8000/get-classes"
response = requests.get(backend_url, params={'teacher_id': 1})

print(response.json())


