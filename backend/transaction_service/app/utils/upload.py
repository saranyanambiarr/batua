import os
from fastapi import UploadFile
import shutil
# will use S3 later (AWS S3 boto3/ Cloudinary SDK), local for now

UPLOAD_DIR = "uploads"

def upload_file(file: UploadFile):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return f"/{file_path}"