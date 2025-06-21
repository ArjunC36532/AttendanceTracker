from typing import Annotated
import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import io
from face_detection import FaceDetection
from supabase import create_client, Client
from typing_extensions import TypedDict
from collections import defaultdict
import json

class StudentData(TypedDict):
    class_id: int
    name: str
    embedding: list

class TeacherData(TypedDict):
    email: str
    first_name:str
    last_name:str

class AddClassRequest(TypedDict):
    teacher_id: int
    class_name: str

class AddStudentRequest(TypedDict):
    name: str
    class_name: str
    photo: UploadFile


URL = os.environ.get("URL")
KEY = os.environ.get("KEY")

app = FastAPI()
faceDetection = FaceDetection()
client = create_client(URL, KEY)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_embedding():
    pass


@app.post("/uploadfile/")
async def check_match(file: UploadFile):
    embedding = await faceDetection.generate_embedding(file)

@app.get("/get-vertical-bar-content")
def get_vertical_bar_content():
    pass

@app.get("/get-user-id")
def get_user_id(email: str):
    response = client.table('teachers').select('id').eq('email', email).execute()
    if response.data and len(response.data) > 0:
        teacher_id = response.data[0]['id']
        return {"user_id": teacher_id}
    else:
        return {"message": "Teacher not found", "user_id": None}
    
@app.post("/add-user")
def add_user(data: TeacherData):
    try:
        response = client.table('teachers').insert(data).execute()
        if response.data:
            return {"message": "Teacher added successfully", "data": response.data}
        else:
            return {"message": "Failed to add teacher", "error": response.error}
    except Exception as e:
        return {"message": "An error occurred", "error": str(e)}

@app.post("/add-class")
def add_class(data: AddClassRequest):
    try:
        response = client.table('classes').insert({'teacher_id': data['teacher_id'], 'class_name': data['class_name'].capitalize()}).execute()
        if response.data:
            # Get the class ID of the newly created class
            id_response = client.table('classes').select('id').eq('class_name', data['class_name'].capitalize()).execute()
            class_id = id_response.data[0]['id']
            print(id)
                                                                    

            # Insert a "No Students" student for this class
            student_response = client.table('students').insert({
                'class_id': class_id,
                'name': 'No Students',
                'embedding': '{}',
            }).execute()
            
            return {"message": "Class added successfully", "data": response.data}
        else:
            return {"message": "Failed to add class", "error": response.error}
    except Exception as e:
        return {"message": "An error occurred", "error": str(e)}
    

@app.get("/get-classes")
def get_classes(teacher_id: str):
    response = client.table('classes').select('class_name').eq('teacher_id', teacher_id).execute()
    classes = []
    for class_object in response.data:
        classes.append(class_object['class_name'])
    
    return classes
        

@app.post("/add-student")
async def add_student(id: str = Form(...), name: str = Form(...),class_name: str = Form(...), photo: UploadFile = File(...)):

    # get class id for corresponding class_name
    response = client.table('classes').select('id').eq('class_name', class_name).eq('teacher_id', id).execute()
    class_id = response.data[0]['id']

    # generate embedding
    embedding = await faceDetection.generate_embedding(photo)
    embedding_list = embedding.tolist()  # Convert tensor to list

    response = client.table('students').insert({
        'class_id': class_id,
        'name': name,
        'embedding': embedding_list,
    }).execute()

    # Remove 'No Students' entry if it exists for this class
    client.table('students').delete().eq('class_id', class_id).eq('name', 'No Students').execute()

    return response
    

@app.get("/get-side-bar")
async def get_side_bar(teacher_id: int):
    response = client.table('classes').select('*').eq('teacher_id', teacher_id).execute()
    classes = response.data
    side_bar_data = []
    # Create table of classes and students
    table = defaultdict(list)
    for i in classes:
        class_id = i['id']
        class_name = i['class_name']

        response = client.table('students').select('name').eq('class_id', class_id).execute()
        for j in response.data:
            table[class_name].append(j['name'])

    # Use table to create json obj
    for class_name in table.keys():
        # setup json obj for class
        class_data = {}

        class_data["key"] = class_name
        class_data["icon"] = "TeamOutlined"
        class_data["label"] = class_name

        # setup children. start with all students
        children = [
            {
                "key": class_name + "-" + "all",
                "label": "All Students"
            }
        ]

        # add students to children
        for student in table[class_name]:
                student_data = {}

                student_data["key"] = class_name + "-" + student
                student_data["label"] = student

                children.append(student_data)

        class_data["children"] = children
        side_bar_data.append(class_data)
   
    return side_bar_data




        


        
        


        






    


    

   
