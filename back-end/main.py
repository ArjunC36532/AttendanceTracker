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
import torch
import torch.nn.functional as F
from datetime import datetime
import uvicorn

#backend

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

class WebcamData(TypedDict):
    embeddings: list


URL =  "https://ljppyrfxtiicczfdcdjy.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcHB5cmZ4dGlpY2N6ZmRjZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDc4NzIsImV4cCI6MjA2NTQyMzg3Mn0.oagS27FMAsVKMrT_k3N3RGemGlBdS0lXPdL_-ORQ-wo"

app = FastAPI()
faceDetection = FaceDetection()
client = create_client(URL, KEY)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://attendance-tracker-backend-production.up.railway.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/uploadfile/")
async def upload_file(teacher_id: str = Form(...), file: UploadFile = File(...)):
    embedding = await faceDetection.generate_embedding(file)

    response = client.table("embeddings").insert({"teacher_id": teacher_id, "captured_embedding": embedding.tolist()}).execute()
    
    if response:
        return {"message": "File Uploaded Succesffully"}
    
@app.get("/clear-embeddings")
def clear_embeddings(teacher_id: int):
    response = client.table('embeddings').delete().eq('teacher_id', teacher_id).execute()
    if response.data:
        return {"message": f"Cleared all embeddings for teacher_id {teacher_id}."}
    else:
        return {"message": "Error clearing embeddings"}

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
    for class_obj in classes:
        class_name = class_obj['class_name']
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

        # add students to children if any
        for student in table[class_name]:
            student_data = {}
            student_data["key"] = class_name + "-" + student
            student_data["label"] = student
            children.append(student_data)

        class_data["children"] = children
        side_bar_data.append(class_data)
   
    return side_bar_data


@app.get("/find-matches")
async def find_matches(teacher_id: str, class_name: str):
    student_names = []
    student_embeddings = []
    captured_embeddings = []

    try:
        # get class_id of corresponding class
        response = client.table("classes").select("id").eq("class_name", class_name).eq("teacher_id", teacher_id).execute()
        class_id = response.data[0]['id']

        # get names and embeddings of all_students from class
        response = client.table("students").select("name", "embedding").eq("class_id", class_id).execute()

        # seperate student names and embeddings into individual lists
        for i in response.data:
            student_names.append(i['name'])
            student_embeddings.append(i['embedding'])

        # get captured embeddings from webcam
        response = client.table('embeddings').select("captured_embedding").eq("teacher_id", teacher_id).execute()
        
        for i in response.data:
            captured_embeddings.append(i['captured_embedding'])

        
        # Use pytorch matrix multiplication to find students that were absent
        attendance_data = defaultdict(list)

        for index, student_embedding in enumerate(student_embeddings):
            for captured_embedding in captured_embeddings:
                # find cosine similarity
                tensor1 = torch.tensor(student_embedding)
                tensor2 = torch.tensor(captured_embedding)

                vec1 = tensor1.squeeze(0)
                vec2 = tensor2.squeeze(0)

                vec1 = F.normalize(vec1, p=2, dim=0)
                vec2 = F.normalize(vec2, p=2, dim=0)

                similarity = F.cosine_similarity(vec1, vec2, dim=0)
                
                if similarity >= 0.6:
                    student_name = student_names[index]
                    now = datetime.now()
                    attendance_data[student_name] = ["Present", now.strftime("%Y-%m-%d"), now.strftime("%I:%M %p")]

        for student in student_names:
            if student not in attendance_data:
                now = datetime.now()
                attendance_data[student] = ["Absent", now.strftime("%Y-%m-%d"), now.strftime("%I:%M %p")]

        # Store results in supabase
        for student, data in attendance_data.items():
            response = client.table("attendance").insert({"class_id": class_id, 
                                                          "student_name": student, "attendance_status": data[0], 
                                                          "attendance_date": data[1],
                                                          "attendance_time": data[2]}).execute()


        # return Json formatted attendance data for table format
        results = []
        index = 1

        for student, data in attendance_data.items():
            obj = {}
            obj["key"] = str(index)
            obj["name"] = student
            obj["attendance"] = data[0]
            obj["date"] = data[1]
            obj["time"] = data[2]
            results.append(obj)

        return results
    

    except Exception as e:
        pass

@app.get("/get-table")
def get_table(class_name: str, student_name: str, teacher_id: str):
    # Get class ID
    response = client.table("classes").select("id").eq("teacher_id", teacher_id).eq("class_name", class_name).execute()
    class_id = response.data[0]['id']

    # Get data of all students with corresponding class_id
    if student_name == "all":
        response = client.table("attendance").select("student_name, attendance_status, attendance_date, attendance_time").eq("class_id", class_id).execute()
    else:
        response = client.table("attendance").select("student_name, attendance_status, attendance_date, attendance_time").eq("class_id", class_id).eq("student_name", student_name).execute()

    # Create formatted object to use for data in table
    student_data = []
    index = 0
    for data in response.data:
        index += 1
        obj = {}
        obj["key"] = str(index)
        for key, value in data.items():
            obj[key] = value
        student_data.append(obj)

    print(student_data)
    return student_data

@app.get("/remove-student")
def remove_student(teacher_id: str, class_name: str, student_name: str):
    try:
        # Get class ID
        response = client.table("classes").select("id").eq("teacher_id", teacher_id).eq("class_name", class_name).execute()
        class_id = response.data[0]['id']
        
        # Delete attendance records for this student in this class
        client.table("attendance").delete().eq("class_id", class_id).eq("student_name", student_name).execute()
        
        # Delete the student with the given class_id and student_name
        response = client.table("students").delete().eq("class_id", class_id).eq("name", student_name).execute()
        
        return {"message": "Student and all attendance records removed successfully"}
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/remove-class")
def remove_class(teacher_id: str, class_name: str):
    try:
        # Get class ID
        response = client.table("classes").select("id").eq("class_name", class_name).eq("teacher_id", teacher_id).execute()
        if not response.data:
            return {"error": "Class not found"}
        class_id = response.data[0]['id']

        # Just delete the class; students and attendance will be deleted automatically
        client.table("classes").delete().eq("id", class_id).execute()

        return {"message": "Class and all related students/attendance removed successfully"}
    except Exception as e:
        return {"error": str(e)}
    























        


        
        


        






    


    

   
