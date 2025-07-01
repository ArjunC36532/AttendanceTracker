from typing import Annotated
import os
from fastapi import FastAPI, File, UploadFile
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import io
from fastapi import HTTPException
import supabase
import torch.nn.functional


class FaceDetection:
    def __init__(self):
        self.mtcnn = MTCNN(image_size=160)
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval()

    async def generate_embedding(self, file):
        # Crop image to appropriate dimensions
        content = await file.read()
        img = Image.open(io.BytesIO(content)) 
        if img.mode == 'RGBA':
            img = img.convert('RGB')
    
        img_cropped = self.mtcnn(img)

        # Calculate embedding (unsqueeze to add batch dimension)
        img_embedding = self.resnet(img_cropped.unsqueeze(0))

        return img_embedding
    


